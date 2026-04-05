import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostById, getAllPosts } from '@/lib/posts'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ id: post.id }))
}

function renderInline(text: string): (string | React.ReactElement)[] {
  const result: (string | React.ReactElement)[] = []
  let remaining = text
  let k = 0

  while (remaining.length > 0) {
    const codeIdx = remaining.indexOf('`')
    const boldIdx = remaining.indexOf('**')

    if (codeIdx === -1 && boldIdx === -1) {
      result.push(remaining)
      break
    }

    let nextIdx = Infinity
    let marker = ''
    if (codeIdx !== -1) { nextIdx = codeIdx; marker = '`' }
    if (boldIdx !== -1 && boldIdx < nextIdx) { nextIdx = boldIdx; marker = '**' }

    if (nextIdx > 0) result.push(remaining.slice(0, nextIdx))
    remaining = remaining.slice(nextIdx + marker.length)

    const closeIdx = remaining.indexOf(marker)
    if (closeIdx === -1) {
      result.push(marker + remaining)
      break
    }

    const inner = remaining.slice(0, closeIdx)
    remaining = remaining.slice(closeIdx + marker.length)

    if (marker === '`') {
      result.push(<code key={k++}>{inner}</code>)
    } else {
      result.push(<strong key={k++}>{inner}</strong>)
    }
  }

  return result
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactElement[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(
        <pre key={key++}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++}>{renderInline(line.slice(4))}</h3>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++}>{renderInline(line.slice(3))}</h2>)
      i++
      continue
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++}>{renderInline(line.slice(2))}</h1>)
      i++
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={key++}>
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      )
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={key++}>
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ol>
      )
      continue
    }

    elements.push(<p key={key++}>{renderInline(line)}</p>)
    i++
  }

  return elements
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
        {renderContent(post.content)}
      </div>
    </article>
  )
}
