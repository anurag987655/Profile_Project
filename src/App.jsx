import { useState, useEffect } from 'react'
import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import profileImg from './assets/profile.jpeg'
import './App.css'

const articleModules = import.meta.glob('/src/articles/*.md', { eager: true, query: '?raw' })

const articles = Object.entries(articleModules).map(([path, module]) => {
  const rawContent = module.default || ''

  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  const frontmatterRaw = match ? match[1] : ''
  const body = match ? match[2] : rawContent

  const metadata = {}
  frontmatterRaw.split('\n').forEach(line => {
    const parts = line.split(':')
    if (parts.length >= 2) {
      const key = parts[0].trim()
      const value = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '')
      metadata[key] = value
    }
  })

  const slug = path.split('/').pop().replace('.md', '')

  return {
    slug,
    id: Number(slug) || 0,
    title: metadata.title || 'Untitled Article',
    date: metadata.date || '',
    tag: metadata.tag || 'General',
    excerpt: metadata.excerpt || '',
    body: body.trim(),
    mdFile: path,
  }
}).sort((a, b) => a.id - b.id)

const noteModules = import.meta.glob('./content/notes/*.json', {
  eager: true,
  import: 'default',
})

const projectModules = import.meta.glob('./content/projects/*.json', {
  eager: true,
  import: 'default',
})

const notes = Object.entries(noteModules)
  .map(([path, data]) => ({
    ...data,
    id: Number(path.match(/(\d+)\.json$/)?.[1] || 0),
  }))
  .sort((a, b) => a.id - b.id)

const projects = Object.entries(projectModules)
  .map(([path, data]) => ({
    ...data,
    id: Number(path.match(/(\d+)\.json$/)?.[1] || 0),
  }))
  .sort((a, b) => a.id - b.id)

function Navbar({ activeSection }) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const isArticlePage = location.pathname.startsWith('/article')
  const isNotePage = location.pathname.startsWith('/note')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Vault', href: '#vault' },
    { label: 'Articles', href: '#articles' },
    { label: 'Projects', href: '#projects' },
  ]

  if (isNotePage) {
    return (
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <span className="nav-logo">Appeale</span>
          <Link to="/#vault" className="nav-back">← Vault</Link>
        </div>
      </nav>
    )
  }

  if (isArticlePage) {
    return (
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <span className="nav-logo">Appeale</span>
          <Link to="/#articles" className="nav-back">← Articles</Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <span className="nav-logo">Appeale</span>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={activeSection === l.href.slice(1) ? 'active' : ''}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function NoteCard({ note }) {
  return (
    <Link to={`/note/${note.id}`} className="note-card">
      <div className="note-thumb">
        <span>📄</span>
      </div>
      <h3>{note.title}</h3>
      <p>{note.description}</p>
      <span className="note-badge">{note.badge}</span>
    </Link>
  )
}



function ArticleCard({ article }) {
  return (
    <Link to={`/article/${article.id}`} className="article-card">
      <span className="article-date">{article.date}</span>
      <h3>{article.title}</h3>
      <p className="article-excerpt">{article.excerpt}</p>
      <span className="article-tag">{article.tag}</span>
    </Link>
  )
}

function BentoItem({ project }) {
  const cls = [
    'bento-item',
    project.wide ? 'wide' : '',
    project.tall ? 'tall' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls}>
      <div className="bento-icon">{project.icon}</div>
      <h3>{project.title}</h3>
      <p className="bento-desc">{project.description}</p>
      <div className="bento-tech">
        {project.tech.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="bento-links">
        {project.links.demo && (
          <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
            Live Demo →
          </a>
        )}
        {project.links.paper && (
          <a
            className="external"
            href={project.links.paper}
            target="_blank"
            rel="noopener noreferrer"
          >
            Paper ↗
          </a>
        )}
      </div>
    </div>
  )
}

function MarkdownRenderer({ content }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
        p: ({ children }) => <p className="md-p">{children}</p>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="md-a">
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="md-ul">{children}</ul>,
        ol: ({ children }) => <ol className="md-ol">{children}</ol>,
        li: ({ children }) => <li className="md-li">{children}</li>,
        code: ({ children }) => <code className="md-code">{children}</code>,
        blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
        hr: () => <hr className="md-hr" />,
        table: ({ children }) => <table className="md-table">{children}</table>,
        th: ({ children }) => <th className="md-th">{children}</th>,
        td: ({ children }) => <td className="md-td">{children}</td>,
        strong: ({ children }) => <strong className="md-strong">{children}</strong>,
        em: ({ children }) => <em className="md-em">{children}</em>,
      }}
    >
      {content}
    </Markdown>
  )
}

function HomePage() {
  const [activeSection, setActiveSection] = useState('about')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )

    const ids = ['about', 'vault', 'articles', 'projects']
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [])

  return (
    <>
      <Navbar activeSection={activeSection} />

      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="about-text">
            <span className="title-role">Hey, I&rsquo;m</span>
            <h1 className="gradient-text">Appeale</h1>
            <p className="bio">
              A dedicated scholar exploring the foundations of computation,
              language theory, and formal reasoning. Every project is an exercise
              in precision, clarity, and the pursuit of elegant solutions to
              complex problems.
            </p>
            <div className="about-links">
              <a
                className="icon-link"
                href="https://www.youtube.com/@doyexplains"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                </svg>
              </a>
              <a
                className="icon-link"
                href="https://www.linkedin.com/in/ashutosh-acharya-985746257/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.75 3.75 0 0 1 3.38-1.86c3.62 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z" />
                </svg>
              </a>
              <a className="mail-btn" href="#" onClick={(e) => { e.preventDefault(); window.location.href = 'mailto:' + ['axa0334', 'mavs.uta.edu'].join('@') }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Mail Me
              </a>
            </div>
          </div>
          <div className="about-visual">
            <div className="avatar-frame">
              <div className="avatar-inner">
                <img src={profileImg} alt="Profile" className="avatar-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="vault" className="section">
        <div className="section-header">
          <span className="section-label">The Vault</span>
          <h2 className="section-title">Handwritten Notes</h2>
          <p className="section-subtitle">
            A curated collection of handwritten lecture notes — scroll horizontally to browse, click to preview.
          </p>
        </div>
        <div className="section-content">
          <div className="vault-scroll">
            <div className="vault-track">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="articles" className="section">
        <div className="section-header">
          <span className="section-label">Articles &amp; Insights</span>
          <h2 className="section-title">Long-Form Writing</h2>
          <p className="section-subtitle">
            Click any article to read the full piece.
          </p>
        </div>
        <div className="section-content">
          <div className="articles-grid">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="section">
        <div className="section-header">
          <span className="section-label">Projects &amp; Research</span>
          <h2 className="section-title">What I&rsquo;ve Built</h2>
          <p className="section-subtitle">
            Open-source projects and research papers — built with precision.
          </p>
        </div>
        <div className="section-content">
          <div className="bento-grid">
            {projects.map((p) => (
              <BentoItem key={p.id} project={p} />
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>
          Crafted with <span>React</span> &middot; &copy; {new Date().getFullYear()} Appeale
        </p>
      </footer>
    </>
  )
}

function ArticlePage() {
  const { id } = useParams()
  const article = articles.find(a => a.id === Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="article-page">
          <p>Article not found.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="article-page">
        <article className="article-page-content">
          <header className="article-page-header">
            <h1>{article.title}</h1>
            <div className="article-page-meta">
              <span className="article-date">{article.date}</span>
              <span className="article-tag">{article.tag}</span>
            </div>
          </header>
          <div className="reader-body">
            {article.body ? (
              <MarkdownRenderer content={article.body} />
            ) : (
              <p className="md-fallback">
                Place your <code>.md</code> file at <code>{article.mdFile}</code> to see the full article rendered here.
              </p>
            )}
          </div>
        </article>
      </div>
    </>
  )
}

function NotePage() {
  const { id } = useParams()
  const note = notes.find(n => n.id === Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!note) {
    return (
      <>
        <Navbar />
        <div className="note-page">
          <p>Note not found.</p>
        </div>
      </>
    )
  }

  const embedUrl = note.pdfUrl.startsWith('http')
    ? note.pdfUrl
    : `https://drive.google.com/file/d/${note.pdfUrl}/preview`

  return (
    <>
      <Navbar />
      <div className="note-page">
        <div className="note-page-header">
          <h1>{note.title}</h1>
          <div className="note-page-meta">
            <span className="note-badge">{note.badge}</span>
          </div>
        </div>
        <div className="note-page-body">
          <iframe
            src={embedUrl}
            title={note.title}
            allow="autoplay"
            loading="lazy"
          />
        </div>
      </div>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/:id" element={<ArticlePage />} />
      <Route path="/note/:id" element={<NotePage />} />
    </Routes>
  )
}
