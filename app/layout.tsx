import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'Devin Le',
  description: 'personal site, projects, and writing by devin le',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${newsreader.variable} font-sans min-h-screen flex flex-col`}>
        <header className="border-b border-[color:var(--border)]">
          <div className="max-w-[720px] mx-auto px-6 py-5 flex items-center justify-between">
            <Link
              href="/"
              className="font-serif text-lg font-bold hover:text-[color:var(--accent)] transition-colors"
            >
              devin le
            </Link>
            <nav className="flex gap-6 text-[0.9rem] text-[color:var(--fg-muted)]">
              <Link href="/#projects" className="hover:text-[color:var(--fg)] transition-colors">
                projects
              </Link>
              <Link href="/blog" className="hover:text-[color:var(--fg)] transition-colors">
                blog
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[color:var(--border)] mt-16">
          <div className="max-w-[720px] mx-auto px-6 py-8 text-sm text-[color:var(--fg-muted)] flex items-center justify-between">
            <span>© {new Date().getFullYear()} devin le</span>
            <div className="flex gap-4">
              <a
                href="https://github.com/NotDevinLe"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[color:var(--fg)] transition-colors"
              >
                github
              </a>
              <a
                href="mailto:devin.t.le@outlook.com"
                className="hover:text-[color:var(--fg)] transition-colors"
              >
                email
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
