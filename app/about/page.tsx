import Link from 'next/link'

export default function About() {
  return (
    <div>
      <Link href="/" className="nav-link">
        ← home
      </Link>

      <div className="mt-10">
        <h1 className="font-serif text-[2rem] font-bold leading-tight mb-6">
          about
        </h1>

        <div className="article-content">
          <p>
            welcome to le&apos;s lab — a space where i document my work and thinking
            across competitive programming, systems engineering, and ai research.
          </p>

          <p>
            this blog is where i break down problems i care about, from optimizing
            algorithms and debugging low-level systems to building research-grade
            machine learning pipelines and full-stack projects. it&apos;s part notebook,
            part lab journal, and part knowledge base.
          </p>

          <h2>what you&apos;ll find</h2>
          <ul>
            <li>competitive programming writeups, proofs, and algorithmic techniques</li>
            <li>deep dives into systems topics like emulation, memory, and performance</li>
            <li>project logs for things i&apos;m building — from emulators to ml infrastructure</li>
            <li>ai and machine learning research notes, experiments, and results</li>
            <li>engineering lessons learned from debugging and scaling real systems</li>
          </ul>

          <p>
            whether you&apos;re here for algorithms, systems, or applied ai, this blog is
            meant to be a transparent look into how complex software is built and
            understood from the ground up.
          </p>
        </div>
      </div>
    </div>
  )
}
