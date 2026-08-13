import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

const projects = [
  {
    name: 'Gameboy Emulator',
    tag: '2025',
    description: 'Debugging hell.',
    href: 'https://github.com/NotDevinLe/gameboy_emulator',
  },
  {
    name: 'ThinkEval',
    tag: '2024',
    description: 'Benchmarking LLMs reasoning capabilities through puzzles.',
    href: 'https://github.com/NotDevinLe/ThinkEval',
  }
]

const socials = [
  { name: 'email', href: 'mailto:devin.t.le@outlook.com' },
  { name: 'github', href: 'https://github.com/NotDevinLe' },
  { name: 'linkedin', href: 'https://www.linkedin.com/in/devin-t-le/' },
  { name: 'x', href: 'https://x.com/JoyCoder01' },
]

export default function Home() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <div className="max-w-[720px] mx-auto px-6">
      <section className="py-14 md:py-20 fade-up">
        <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight blink-cursor">
          devin le
        </h1>
        <p className="text-[color:var(--fg-muted)] mt-2">
          undergrad researcher · university of washington
        </p>

        <div className="article-content mt-8">
          <p>
            Hey, I&apos;m Devin and I&apos;m currently a sophomore. I enjoy playing tennis
            and League of Legends as well as reading research papers and finding ways
            to contribute to research. Right now, I&apos;m working on vLLM contributions.
          </p>
          <p>
            I previously did research on inference time methods for LLMs as well as
            ML infra. Interested in ML systems, natural language processing, and
            statistics. Happy to connect.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-sm">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              className="text-[color:var(--fg-muted)] underline underline-offset-4 decoration-[color:var(--border)] hover:text-[color:var(--accent)] hover:decoration-[color:var(--accent)] transition-colors"
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {s.name}
            </a>
          ))}
        </div>
      </section>

      <section id="projects" className="py-12 border-t border-[color:var(--border)] fade-up fade-up-1">
        <h2 className="font-serif text-2xl font-bold mb-8 section-heading">selected projects</h2>
        <div className="space-y-7">
          {projects.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <article className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] gap-4 sm:gap-6 items-baseline transition-transform duration-200 will-change-transform group-hover:translate-x-1">
                <span className="font-mono text-xs text-[color:var(--fg-muted)] tabular-nums">
                  {p.tag}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-[color:var(--accent)] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[0.9rem] text-[color:var(--fg-muted)] mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </article>
            </a>
          ))}
        </div>
      </section>

      <section className="py-12 border-t border-[color:var(--border)] fade-up fade-up-2">
        <h2 className="font-serif text-2xl font-bold mb-2 section-heading">selected posts</h2>
        <p className="text-[color:var(--fg-muted)] text-sm mb-8">
          see{' '}
          <Link
            href="/blog"
            className="underline underline-offset-4 hover:text-[color:var(--accent)] transition-colors"
          >
            blog
          </Link>{' '}
          for the full list.
        </p>
        <div className="space-y-7">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="group block">
              <article className="grid grid-cols-[56px_1fr] sm:grid-cols-[72px_1fr] gap-4 sm:gap-6 items-baseline transition-transform duration-200 will-change-transform group-hover:translate-x-1">
                <span className="font-mono text-xs text-[color:var(--fg-muted)] tabular-nums">
                  {new Date(post.date).getFullYear()}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-snug group-hover:text-[color:var(--accent)] transition-colors">
                    {post.title.toLowerCase()}
                  </h3>
                  <p className="text-[0.9rem] text-[color:var(--fg-muted)] mt-1 leading-relaxed">
                    {post.excerpt.toLowerCase()}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
