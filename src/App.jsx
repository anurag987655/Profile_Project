import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import './App.css'

const mdModules = import.meta.glob('./articles/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const NOTES = [
  {
    id: 1,
    title: 'Linear Algebra — Eigenvectors',
    description: 'Handwritten notes covering eigenvalues, eigenvectors, and diagonalisation with worked examples.',
    driveFileId: '1abcExampleFileId123',
    badge: 'Mathematics',
  },
  {
    id: 2,
    title: 'Quantum Mechanics — Spin',
    description: 'A deep dive into Pauli matrices, spin operators, and the Stern–Gerlach experiment.',
    driveFileId: '2abcExampleFileId456',
    badge: 'Physics',
  },
  {
    id: 3,
    title: 'ML — Backpropagation',
    description: 'Step-by-step derivation of the backpropagation algorithm through a simple feed-forward network.',
    driveFileId: '3abcExampleFileId789',
    badge: 'Machine Learning',
  },
  {
    id: 4,
    title: 'Computer Networks — TCP/IP',
    description: 'Detailed notes on the TCP/IP protocol stack, flow control, and congestion avoidance.',
    driveFileId: '4abcExampleFileId012',
    badge: 'Networking',
  },
  {
    id: 5,
    title: 'Algorithms — Dynamic Programming',
    description: 'Classic DP problems: LCS, knapsack, matrix chain multiplication, and optimal BST.',
    driveFileId: '5abcExampleFileId345',
    badge: 'Algorithms',
  },
]

const ARTICLES = [
  {
    id: 1,
    title: 'Why Functional Programming Matters',
    date: 'March 15, 2026',
    tag: 'Programming',
    excerpt:
      'An exploration of how pure functions, immutability, and higher-order abstractions lead to more composable and testable systems.',
    mdFile: './articles/1.md',
  },
  {
    id: 2,
    title: 'A Primer on Quantum Error Correction',
    date: 'February 28, 2026',
    tag: 'Physics',
    excerpt:
      'How Shor and Steane codes protect fragile qubits from decoherence, and why error correction is the linchpin of scalable quantum computers.',
    mdFile: './articles/2.md',
  },
  {
    id: 3,
    title: 'Building a Compiler in 2026',
    date: 'January 10, 2026',
    tag: 'Engineering',
    excerpt:
      'Lessons from writing a native compiler for a small systems language: lexing, parsing, IR generation, and codegen for x86-64.',
    mdFile: './articles/3.md',
  },
  {
    id: 4,
    title: 'Reinforcement Learning from Human Feedback',
    date: 'December 5, 2025',
    tag: 'AI',
    excerpt:
      'A technical walkthrough of RLHF: supervised fine-tuning, reward model training, and PPO alignment for large language models.',
    mdFile: './articles/4.md',
  },
]

const PROJECTS = [
  {
    id: 1,
    title: 'Cypher Compiler',
    description:
      'A native compiler for a small systems language featuring hand-written lexer, recursive-descent parser, TAC IR, and x86-64 code generation.',
    tech: ['C++', 'LLVM', 'x86-64'],
    icon: '⚙️',
    links: { demo: 'https://github.com', paper: 'https://arxiv.org' },
    wide: true,
    tall: false,
  },
  {
    id: 2,
    title: 'Neural Style Transfer',
    description:
      'PyTorch implementation of real-time neural style transfer using perceptual losses and instance normalisation.',
    tech: ['Python', 'PyTorch', 'ONNX'],
    icon: '🎨',
    links: { demo: 'https://github.com' },
    wide: false,
    tall: true,
  },
  {
    id: 3,
    title: 'Quantum Circuit Simulator',
    description:
      'A fast simulator for quantum circuits using tensor-network contraction, supporting up to 30 qubits on a single GPU.',
    tech: ['Rust', 'CUDA', 'Python'],
    icon: '🔬',
    links: { paper: 'https://arxiv.org' },
    wide: false,
    tall: false,
  },
  {
    id: 4,
    title: 'Distributed Key-Value Store',
    description:
      'A strongly-consistent, partition-tolerant key-value store built on the Raft consensus protocol in Go.',
    tech: ['Go', 'Raft', 'gRPC'],
    icon: '🗄️',
    links: { demo: 'https://github.com' },
    wide: false,
    tall: false,
  },
  {
    id: 5,
    title: 'RLHF Alignment Toolkit',
    description:
      'An open-source library for fine-tuning LLMs with reinforcement learning from human feedback, supporting PPO and DPO.',
    tech: ['Python', 'PyTorch', 'TRL'],
    icon: '🤖',
    links: { demo: 'https://github.com', paper: 'https://arxiv.org' },
    wide: true,
    tall: false,
  },
  {
    id: 6,
    title: 'Formal Verification of Smart Contracts',
    description:
      'A framework using symbolic execution and SMT solvers to prove safety properties of Solidity smart contracts.',
    tech: ['Solidity', 'Z3', 'Python'],
    icon: '📜',
    links: { paper: 'https://eprint.iacr.org' },
    wide: false,
    tall: false,
  },
]

function Navbar({ activeSection }) {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const isArticlePage = location.pathname.startsWith('/article')

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

function NoteCard({ note, onSelect }) {
  return (
    <div className="note-card" onClick={() => onSelect(note)} role="button" tabIndex={0}>
      <div className="note-thumb">
        <span>📄</span>
      </div>
      <h3>{note.title}</h3>
      <p>{note.description}</p>
      <span className="note-badge">{note.badge}</span>
    </div>
  )
}

function PdfModal({ note, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const embedUrl = `https://drive.google.com/file/d/${note.driveFileId}/preview`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{note.title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <iframe
            src={embedUrl}
            title={note.title}
            allow="autoplay"
            loading="lazy"
          />
        </div>
      </div>
    </div>
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
  const [selectedPdf, setSelectedPdf] = useState(null)
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

  const closePdf = useCallback(() => setSelectedPdf(null), [])

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
                href="https://youtube.com"
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
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.75 3.75 0 0 1 3.38-1.86c3.62 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z" />
                </svg>
              </a>
              <a className="mail-btn" href="mailto:hello@appeale.dev">
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
              <div className="avatar-inner">Appeale</div>
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
              {NOTES.map((note) => (
                <NoteCard key={note.id} note={note} onSelect={setSelectedPdf} />
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
            {ARTICLES.map((a) => (
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
            {PROJECTS.map((p) => (
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

      {selectedPdf && <PdfModal note={selectedPdf} onClose={closePdf} />}
    </>
  )
}

function ArticlePage() {
  const { id } = useParams()
  const article = ARTICLES.find(a => a.id === Number(id))
  const mdContent = article ? mdModules[article.mdFile] : null

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
            {mdContent ? (
              <MarkdownRenderer content={mdContent} />
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/article/:id" element={<ArticlePage />} />
    </Routes>
  )
}
