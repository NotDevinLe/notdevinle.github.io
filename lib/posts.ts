import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  readTime: string
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(postsDirectory)

  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const id = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(postsDirectory, file), 'utf8')
      const { data, content } = matter(raw)

      return {
        id,
        title: data.title,
        excerpt: data.excerpt,
        date: data.date,
        author: data.author,
        readTime: data.readTime,
        content,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostById(id: string): BlogPost | undefined {
  const filePath = path.join(postsDirectory, `${id}.mdx`)
  if (!fs.existsSync(filePath)) return undefined

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return {
    id,
    title: data.title,
    excerpt: data.excerpt,
    date: data.date,
    author: data.author,
    readTime: data.readTime,
    content,
  }
}
