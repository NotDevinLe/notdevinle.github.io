# rproxy: KV-cache-aware routing via vLLM KV events

## Context

rproxy today routes on **full-prompt hash match only** ([main.rs:378-408](rproxy/src/main.rs#L378-L408)), so the 0.5 cache discount at [main.rs:339-349](rproxy/src/main.rs#L339-L349) only fires when entire conversations repeat. Real traffic shares *prefixes* (system prompts, multi-turn continuations), and the fleet TUI shows worker prefix-cache hit rate decorrelated from routing decisions (82% pod slow while 0.1% pod fast). Router-side hash approximations can't observe vLLM's LRU evictions.

**Source of truth for KV state must be vLLM itself**, via its ZMQ KV-events publisher. AIBrix has already bled through this design ([rproxy/aibrix_logic.md](rproxy/aibrix_logic.md)); this plan adopts their battle-tested choices and fixes the bugs they shipped.

## Architecture

```
vLLM worker ── ZMQ PUB :5557 ── events ─┐
             ── ZMQ DEALER :5558 ─ replay ─┴──▶ rproxy subscriber ──▶ KvIndex (Redis-backed)
                                                                            ▲
incoming request ──▶ remote /tokenize ──▶ token_ids ──▶ chained hash ───────┘
                                                              │
                                                              ▼
                                                     longest contiguous prefix per worker
                                                              │
                                                              ▼
                                              existing Lua script + scorer (boolean cached)
```

### ZMQ wire format (both formats must be handled)

- Sockets per worker: **SUB on :5557** (events), **DEALER on :5558** (replay).
- Frame layout: `[topic_bytes, seq_uint64_BE, msgpack_payload]`.
- Payload per [vllm/distributed/kv_events.py:25-33](vllm/vllm/distributed/kv_events.py#L25-L33) is `EventBatch{ts: f64, events: list, data_parallel_rank?: int}` — **2-element OR 3-element tuple**, rproxy must decode both variants.
- Event types: `BlockStored{block_hashes, parent_block_hash, token_ids, block_size, lora_id}`, `BlockRemoved{block_hashes}`, `AllBlocksCleared{}`.
- `block_hashes` in events: may be int64 OR 32-byte SHA-256. Normalize to int64 by taking first 8 bytes big-endian (vLLM PR #23673; [aibrix_logic.md:112](rproxy/aibrix_logic.md#L112)).
- Sequence numbers: big-endian uint64 in the topic frame. Gaps count as a metric only (AIBrix-style); gaps trigger replay request from `last_seq+1` (our improvement over AIBrix).
- Replay request: DEALER multipart `[empty, uint64_BE(start_seq)]`, 5s timeout.

### Hash strategy — re-hash from tokens, do not replicate vLLM's hash

Following [aibrix_logic.md:87-118](rproxy/aibrix_logic.md#L87-L118). Every `BlockStored` event carries both `engine_hash` (vLLM-internal) and raw `token_ids` for that block. rproxy computes its own hash over the tokens and stores:

- `block:<model>:<rproxy_hash>` → SET of worker_ips (routing lookup)
- `engine:<model>:<worker>:<engine_hash>` → rproxy_hash (for BlockRemoved translation)
- `block_access:<model>:<rproxy_hash>` → ZSET by last_access timestamp (LRU eviction — our improvement over AIBrix's silent-drop bug)

**Our rproxy_hash function (pin this; both sides must agree byte-for-byte):**

```
tokens_bytes = concat(BE_u32(tok) for tok in block_tokens)       # 4-byte BE uint32 per token
parent_bytes = LE_u64(parent_rproxy_hash_as_u64)                  # 8-byte LE; zero for root
rproxy_hash  = blake3(parent_bytes || tokens_bytes).as_u64()
```

Byte encoding is copied from AIBrix exactly ([aibrix_logic.md:106-108](rproxy/aibrix_logic.md#L106-L108), [aibrix_logic.md:392-394](rproxy/aibrix_logic.md#L392-L394)). Blake3 is already in rproxy's deps; no new hash library.

### Tokenization — remote, with result cache

**Reversal from my prior draft**: do NOT load `tokenizers` + `minijinja` into rproxy. Call vLLM's `/tokenize` endpoint instead. Reason: chat-template drift between router and worker kills hit rate (AIBrix PR #2002, [aibrix_logic.md:336-340](rproxy/aibrix_logic.md#L336-L340)). vLLM must remain the source of truth for its own chat template.

**Call shape** (critical — getting any of these wrong ≈ 0% hit rate on chat endpoints):

```
POST <any-healthy-worker>:8000/tokenize
{
  "model": "<model_name>",
  "messages": [ {"role": "...", "content": <JSON-marshaled per-message> }, ... ],
  "add_generation_prompt": true,
  "add_special_tokens": false
}
```

Per-message JSON marshaling preserves multimodal content structure; even for text-only it matters when the template iterates content arrays. Flags copied from [aibrix_logic.md:231](rproxy/aibrix_logic.md#L231).

**Result cache** (AIBrix doesn't have; meaningful win on multi-turn):

- Key: `tokenize:<sha256(bincode(model, messages))>`
- Value: `[token_ids]` bincode
- TTL: 1h
- Hits skip the tokenize RTT entirely. Multi-turn chat messages accumulate cheaply.

**Tokenize worker selection**: round-robin across healthy workers of the same model. Hard-fail the request if tokenize times out after 5s (AIBrix's choice — degrading to random routing is worse than a clear error). Optional future: fallback to least-loaded routing on timeout.

### Block size

AIBrix defaults to 16; **TPU's `tpu-inference` may default to 64 or 128** for attention tiling ([aibrix_logic.md:388-390](rproxy/aibrix_logic.md#L388-L390)). Read vLLM's startup log on one worker, pin rproxy's block_size to match. Fail startup if the value read from any worker's `/kv_cache/config` (or equivalent introspection endpoint) diverges — silent block-size mismatch is the #1 cause of every-hash-is-a-miss.

### TP > 1 / EP deduplication

MiniMax-M2.5 runs EP=8 + TP=4. AIBrix assumes one emitter per pod ([aibrix_logic.md:251-262](rproxy/aibrix_logic.md#L251-L262)); on TPU this may not hold. Add client-side dedupe:

- Per-event key: `(worker_ip, event_type, engine_hash)` in a 60s-TTL Redis SET (or in-memory bloom filter).
- Skip events whose key already exists.

Also check if vLLM supports restricting event emission to rank 0 on TPU; if so, configure it and remove the dedupe.

### Routing integration

At [main.rs:516](rproxy/src/main.rs#L516) in `chat_completions()`, before the Lua call:

1. `tokenize_with_cache(model, &messages)` → `Vec<u32>`.
2. Chunk into blocks of `block_size`. Compute chained rproxy_hashes for each.
3. For each candidate worker in `model_endpoints:<model>`, walk the hash sequence; count longest contiguous prefix where `block:<model>:<rproxy_hash>` contains the worker. Matching is strictly contiguous from block 0; first miss terminates ([aibrix_logic.md:214-216](rproxy/aibrix_logic.md#L214-L216)).
4. Pass the set of workers with `depth > 0` to the Lua script as additional `KEYS`; Lua flags those endpoints `cached=true`. Existing scorer + 0.5 discount unchanged.

Keep existing `prompt_cache:*` write path as a fallback for cold-start (before subscribers populate).

**Deferred to v1.1 (not in this scope):**
- Match-percentage-weighted discount (currently boolean).
- Load-imbalance circuit breaker ([aibrix_logic.md:189-190](rproxy/aibrix_logic.md#L189-L190)) that filters to least-loaded tier before prefix matching when `max_running - min_running > 8`.
- Stale-cache feedback invalidation.

## Correctness checklist — must-pass before declaring done

From AIBrix's shipped bugs and hard-won lessons. These are the load-bearing tests:

1. **Hash parity** (non-negotiable, Phase 1). Single test vLLM pod. Submit known prompt. Capture next `BlockStored` event. Compute request-side rproxy_hash over the same tokens. **Assert byte-exact match.** Do not write any other code in this workstream until this passes.
2. **Chat tokenization parity**. Same prompt via `/v1/chat/completions` and `/v1/completions` (with the chat template pre-applied). Tokens and block hashes must match.
3. **Block size verification on TPU**. Read vLLM's actual block size on a live MiniMax v4 pod; pin rproxy to match.
4. **TP>1 dedupe verification**. With MiniMax-M2.5 EP=8 TP=4, count distinct events per block per pod. If > 1, confirm dedupe reduces to 1 at index level.
5. **`AllBlocksCleared` handled** (AIBrix ships this as a no-op — we must not). On receipt, drop all entries for that worker under the model namespace. Test: send event, verify all `block:*` SETs containing the worker have the worker removed.
6. **Bounded memory via LRU**. Load the index past its cap (e.g., 10K blocks per model). Verify oldest entries evict via ZSET by last_access, not silent drop.
7. **Gap recovery**. Kill subscriber mid-stream. On restart, subscriber requests replay from `last_seq+1` (persisted to Redis at 1s cadence), not from seq=0.
8. **Routing end-to-end**. Two workers. Send request A (system + user_1) to worker X via manual override. Send request B (system + user_1 + user_2) without override → must route to X.
9. **Eviction visible to router**. Fill worker X's KV past limit so request A's prefix evicts → `BlockRemoved` arrives → re-sending B now scores X and Y equally (no stale hit).

## TPU-specific risks (verify each before trusting the design)

Copied and filtered from [aibrix_logic.md:384-422](rproxy/aibrix_logic.md#L384-L422):

- **Does `tpu-inference` backend emit ZMQ events at all?** ZMQ publisher lives in vLLM core; per-backend wiring varies. **Verify first** with a bare `python -c "import zmq; ..."` SUB socket against one TPU pod with `--kv-events-config` + `--enable-prefix-caching`.
- **Block size default may not be 16** (TPU tiling often 64/128).
- **XLA recompile bursts**: events may pile up after a shape-change stall. Add a bounded channel (capacity ~10k) between ZMQ recv and index write; count drops in a metric.
- **MoE + TP=4 emission pattern**: unconfirmed whether events come from rank 0 only or all ranks. TP>1 dedupe handles this either way.

## Files to change

- [rproxy/src/main.rs](rproxy/src/main.rs): subscriber spawn, tokenize-before-route wiring, extend Lua invocation to pass hit-worker list, keep existing `prompt_cache:*` fallback.
- [rproxy/src/types.rs](rproxy/src/types.rs): add `WorkerIp`, `RproxyBlockHash`, `EngineBlockHash`; extend `ProxyState` with Arc to KvIndex handles.
- **New**: `rproxy/src/kv_state.rs` — subscriber tasks, msgpack decoding, both `EventBatch` arities, dedupe, Redis writes, `AllBlocksCleared` handling.
- **New**: `rproxy/src/tokenize.rs` — remote tokenize client with result cache (sha256 → token_ids, 1h TTL), round-robin worker selection, 5s timeout.
- **New**: `rproxy/src/block_hash.rs` — the chained hash function with frozen byte encoding + unit tests for parity.
- [rproxy/Cargo.toml](rproxy/Cargo.toml): add `async-zmq` (or `zeromq`), `rmp-serde`, `dashmap`, `smallvec`. **Do not add** `tokenizers` or `minijinja`.
- Every vLLM launch script under `tpu-manager/model-scripts/*.sh`: add `--kv-events-config '{"enable_kv_cache_events": true, "publisher": "zmq", "endpoint": "tcp://0.0.0.0:5557", "replay_endpoint": "tcp://0.0.0.0:5558"}'` (exact shape verified against the deployed vLLM version).

## Build order (phased; ship each phase before next)

Copied from [aibrix_logic.md:428-466](rproxy/aibrix_logic.md#L428-L466), adapted:

**Phase 0 — TPU wiring check (hours).** Bare ZMQ SUB on a TPU pod with events enabled. Does any event arrive? If not, stop — fix vLLM/tpu-inference before writing rproxy code.

**Phase 1 — Hash parity (1-2 days, non-negotiable).** Throwaway consumer prints `(engine_hash, rproxy_hash)` pairs. Request-side hasher. Byte-exact match on a known prompt. **Gate all subsequent work on this passing.**

**Phase 2 — Subscriber + index (~1 week).** ZMQ SUB + DEALER per worker with reconnect backoff (1s→30s, factor 2, no jitter — AIBrix's tuned constants). Sequence gap metric + persisted `last_seq_per_worker` for replay-on-restart. All three event types wired. TP>1 dedupe. Redis schema per section above.

**Phase 3 — Router (~1 week).** Remote tokenize with result cache. Chained hash on request side. Longest-contiguous-match per candidate worker. Boolean pass-through to existing Lua scorer.

**Phase 4 — Verification + observability (~3 days).** All correctness tests above. Expose metrics: `kv_events_received_total`, `kv_events_dropped_total`, `kv_gap_count`, `tokenize_cache_hit_rate`, `routing_cache_hit_rate`, `hash_mismatch_detected` (our addition — if a pod actually had a prefix we thought it didn't or vice versa).

## Out of scope (parked)

- Match-percentage-weighted scoring + load-imbalance circuit breaker (v1.1, validate boolean version first).
- Stale-cache feedback-loop invalidation (reliability improvement; non-blocking).
- LoRA-aware keys (user does not currently use LoRA).
- Migration to llm-d / SGLang / AIBrix gateway frameworks.
- MiniMax v4 decode unevenness (separate workstream; diagnostics metrics already wired into exporter/TUI).
