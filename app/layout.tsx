import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: "Le's Lab",
  description: "a running list of my thoughts",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${newsreader.variable} font-sans`}>
        <main className="max-w-[650px] mx-auto px-6 py-12 md:py-20">
          {children}
        </main>
      </body>
    </html>
  )
}
