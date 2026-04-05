import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

export default function Home() {
  const posts = getAllPosts()

  return (
    <div>
      <p className="text-[color:var(--fg-muted)] mb-10 text-[0.95rem]">
        a running list of my thoughts
      </p>

      <div className="post-list">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="group block">
            <article>
              <span className="post-date">
                {new Date(post.date).toLocaleDateString('en-CA')}
              </span>
              <h2 className="post-title group-hover:opacity-70 transition-opacity">
                {post.title.toLowerCase()}
              </h2>
              <p className="post-excerpt">{post.excerpt.toLowerCase()}</p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
