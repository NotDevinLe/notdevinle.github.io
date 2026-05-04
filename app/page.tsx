import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

const basePath = '/personal-site'

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
    <>
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-[260px_1fr] gap-10 md:gap-14">
          <aside>
            <div className="aspect-square rounded-lg mb-5 overflow-hidden bg-gray-100">
              <img
                src={`${basePath}/profile.jpg`}
                alt="devin le"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="font-serif text-2xl font-bold text-center">
              devin le
            </h1>
            <p className="text-center text-[color:var(--fg-muted)] text-sm mt-2">
              Undergrad Researcher
            </p>
            <p className="text-center text-[color:var(--fg-muted)] text-sm">
              University of Washington
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
                Hey, I'm Devin and I'm currently a sophomore. I enjoy playing tenis and League of Legends as well as reading reseearch papers and finding ways to contribute to research. Right now, I'm working on vLLM contributions.
              </p>
              <p>
                I previously did research on inference time methods for LLMs as well as ML infra. Happy to connect.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="font-serif text-xl font-bold mb-3">interests</h3>
                <ul className="list-disc pl-5 space-y-1 text-[0.95rem] leading-relaxed">
                  <li>ML Systems</li>
                  <li>Natural Language Processing</li>
                  <li>Statistics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold mb-3">education</h3>
                <ul className="space-y-3 text-[0.95rem]">
                  <li>
                    <p className="font-semibold leading-snug">University of Washington - Seattle</p>
                    <p className="text-[color:var(--fg-muted)] text-sm">
                      Bachelors of Science, 2024-2028
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
