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
      <body className={`${inter.variable} ${newsreader.variable} font-sans`}>
        <header className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg font-bold">
              devin le
            </Link>
            <nav className="flex gap-6 text-[0.9rem]">
              <Link href="/#projects" className="hover:text-[color:var(--fg-muted)]">
                projects
              </Link>
              <Link href="/blog" className="hover:text-[color:var(--fg-muted)]">
                blog
              </Link>
              <Link href="/about" className="hover:text-[color:var(--fg-muted)]">
                about
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
