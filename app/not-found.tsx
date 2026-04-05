import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <Link href="/" className="nav-link">
        ← home
      </Link>

      <div className="mt-20 text-center">
        <h1 className="font-serif text-[3rem] font-bold mb-3">404</h1>
        <p className="text-[color:var(--fg-muted)]">
          this page doesn&apos;t exist.
        </p>
      </div>
    </div>
  )
}
