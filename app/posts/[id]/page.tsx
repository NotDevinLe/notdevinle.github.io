import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostById, getAllPosts } from '@/lib/posts'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ id: post.id }))
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = getPostById(id)

  if (!post) {
    notFound()
  }

  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).toLowerCase()

  return (
    <article>
      <Link href="/" className="nav-link">
        ← back
      </Link>

      <header className="mt-10 mb-10">
        <h1 className="font-serif text-[2rem] md:text-[2.5rem] font-bold leading-tight mb-3">
          {post.title.toLowerCase()}
        </h1>
        <p className="text-[color:var(--fg-muted)] text-sm">
          {post.author.toLowerCase()} · {date} · {post.readTime.toLowerCase()}
        </p>
      </header>

      <div className="article-content">
        <MDXRemote source={post.content} />
      </div>
    </article>
  )
}
