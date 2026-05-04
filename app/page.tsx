import Image from 'next/image'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

const projects = [
  {
    name: 'project one',
    tag: '2025',
    description: 'short description of what it is and why it matters.',
    href: '#',
  },
  {
    name: 'project two',
    tag: '2024',
    description: 'short description of what it is and why it matters.',
    href: '#',
  },
  {
    name: 'project three',
    tag: '2024',
    description: 'short description of what it is and why it matters.',
    href: '#',
  },
]

const socials = [
  { name: 'email', href: 'mailto:devin.t.le@outlook.com' },
  { name: 'github', href: '#' },
  { name: 'linkedin', href: '#' },
  { name: 'x', href: '#' },
  { name: 'cv', href: '#' },
]

export default function Home() {
  const posts = getAllPosts().slice(0, 3)

  return (
    <>
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-[260px_1fr] gap-10 md:gap-14">
          <aside>
            <div className="aspect-square rounded-lg mb-5 overflow-hidden bg-gray-100">
              <Image
                src="/profile.jpg"
                alt="devin le"
                width={520}
                height={520}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h1 className="font-serif text-2xl font-bold text-center">
              devin le
            </h1>
            <p className="text-center text-[color:var(--fg-muted)] text-sm mt-2">
              role placeholder
            </p>
            <p className="text-center text-[color:var(--fg-muted)] text-sm">
              affiliation placeholder
            </p>
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-5 text-sm">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="underline underline-offset-2 hover:text-[color:var(--fg-muted)]"
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </aside>

          <div>
            <h2 className="font-serif text-2xl font-bold mb-5">about me</h2>
            <div className="article-content">
              <p>
                short intro placeholder — write a sentence or two about who you
                are, what you work on, and what you&apos;re currently thinking about.
              </p>
              <p>
                second paragraph placeholder — add background on past work,
                collaborators, or anything else worth surfacing up top.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="font-serif text-xl font-bold mb-3">interests</h3>
                <ul className="list-disc pl-5 space-y-1 text-[0.95rem] leading-relaxed">
                  <li>topic placeholder</li>
                  <li>topic placeholder</li>
                  <li>topic placeholder</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-3">education</h3>
                <ul className="space-y-3 text-[0.95rem]">
                  <li>
                    <p className="font-semibold leading-snug">school placeholder</p>
                    <p className="text-[color:var(--fg-muted)] text-sm">
                      degree, year–year
                    </p>
                  </li>
                  <li>
                    <p className="font-semibold leading-snug">school placeholder</p>
                    <p className="text-[color:var(--fg-muted)] text-sm">
                      degree, year–year
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="font-serif text-2xl font-bold mb-2">selected projects</h2>
          <p className="text-[color:var(--fg-muted)] text-sm mb-8">
            a few things i&apos;ve built.
          </p>
          <div className="space-y-6">
            {projects.map((p) => (
              <a key={p.name} href={p.href} className="group block">
                <article className="grid grid-cols-[80px_1fr] sm:grid-cols-[110px_1fr] gap-4 sm:gap-6 items-start">
                  <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded text-center">
                    {p.tag}
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-lg leading-snug group-hover:opacity-70 transition-opacity">
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
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="font-serif text-2xl font-bold mb-2">selected posts</h2>
        <p className="text-[color:var(--fg-muted)] text-sm mb-8">
          see{' '}
          <Link href="/blog" className="underline underline-offset-2">
            blog
          </Link>{' '}
          for the full list.
        </p>
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="group block">
              <article className="grid grid-cols-[80px_1fr] sm:grid-cols-[110px_1fr] gap-4 sm:gap-6 items-start">
                <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded text-center font-mono">
                  {new Date(post.date).getFullYear()}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-snug group-hover:opacity-70 transition-opacity">
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
    </>
  )
}
