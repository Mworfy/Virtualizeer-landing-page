import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Maximize2, Plus, Rotate3d, ExternalLink } from 'lucide-react'
import Art from './Art.jsx'
import VirtualTour from './tour/VirtualTour.jsx'
import { testimonials, faqs } from '../content.js'

export const categoryLabels = { tours: 'Virtual Tour', twins: 'Digital Twin', web: 'Web Development' }

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — Virtualizeer` : 'Virtualizeer — Virtual Tours, Digital Twins & Web Development'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}

export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return setVisible(true)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`reveal${visible ? ' is-visible' : ''} ${className}`} style={{ '--delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}

export function SectionHeader({ eyebrow, title, lead, center, as: H = 'h2' }) {
  return (
    <Reveal className={`section-header${center ? ' section-header--center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <H className="h2">{title}</H>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  )
}

export function Stripes({ className = '' }) {
  // The two parallel bars from the logo, used as a decorative motif
  return (
    <svg className={className} viewBox="0 0 200 260" fill="currentColor" aria-hidden="true">
      <path d="M0 0h22l92 260H92z" />
      <path d="M44 0h40l92 260h-40z" />
    </svg>
  )
}

export function PageHero({ eyebrow, title, lead, children, breadcrumb }) {
  return (
    <section className="page-hero">
      <Stripes className="page-hero__stripes" />
      <div className="container">
        {breadcrumb}
        <div className="intro">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="h1">{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  )
}

export function ProjectCard({ project, headingLevel = 3 }) {
  const H = `h${headingLevel}`
  return (
    <Link to={`/projects/${project.slug}`} className="project-card">
      <div className="project-card__media">
        {project.image ? (
          <img src={project.image} alt="" loading="lazy" />
        ) : (
          <Art variant={project.category} seed={project.slug} />
        )}
        <span className="chip project-card__tag">{categoryLabels[project.category]}</span>
      </div>
      <div className="project-card__body">
        <div className="project-card__meta">{project.location} · {project.year}</div>
        <H className="h3">{project.title}</H>
        <p>{project.summary}</p>
      </div>
    </Link>
  )
}

export function TourEmbed({ url, title = 'Virtual tour', variant = 'tours' }) {
  const [loaded, setLoaded] = useState(false)
  const frameWrap = useRef(null)

  const goFullscreen = () => {
    const el = frameWrap.current
    if (el?.requestFullscreen) el.requestFullscreen()
    else window.open(url, '_blank', 'noopener')
  }

  if (!url) {
    return (
      <div className="tour">
        <VirtualTour label={title} />
      </div>
    )
  }

  return (
    <div className="tour" ref={frameWrap}>
      {loaded ? (
        <>
          <iframe
            src={url}
            title={title}
            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
            allowFullScreen
          />
          <div className="tour__fs">
            <button className="chip" onClick={goFullscreen} aria-label="Open tour full screen">
              <Maximize2 /> Full screen
            </button>
          </div>
        </>
      ) : (
        <div className="tour__poster">
          <Art variant={variant} seed={title} />
          <button className="tour__launch" onClick={() => setLoaded(true)}>
            <span className="tour__play"><Rotate3d aria-hidden="true" /></span>
            <span className="tour__label">Launch the tour</span>
            <span className="tour__hint">Drag to look around · Click to move</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function TourLink({ url }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="link-arrow">
      Open in a new tab <ExternalLink aria-hidden="true" />
    </a>
  )
}

export function Testimonials() {
  return (
    <div className="grid grid-3">
      {testimonials.map((t, i) => (
        <Reveal as="figure" key={i} delay={i * 80} className="card quote-card">
          <blockquote>“{t.quote}”</blockquote>
          <figcaption>
            <span className="avatar" aria-hidden="true">
              {t.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
            <span>
              <span className="name">{t.name}</span>
              <br />
              <span className="role">{t.role}</span>
            </span>
          </figcaption>
        </Reveal>
      ))}
    </div>
  )
}

export function FAQ({ items = faqs }) {
  return (
    <div className="faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>
            {f.q}
            <Plus aria-hidden="true" />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  )
}

export function CTABand({
  title = 'Ready to let people step inside?',
  lead = 'Tell us about your space and we’ll send a tailored quote within one business day.',
}) {
  return (
    <section className="section--tight" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="cta-band">
          <img className="cta-band__mark" src="/brand/mark-white.png" alt="" />
          <div>
            <h2 id="cta-title" className="h2">{title}</h2>
            <p className="lead">{lead}</p>
          </div>
          <div className="btn-row">
            <Link to="/contact" className="btn btn--light">
              Get a quote <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/projects" className="btn btn--ghost-light">See our work</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
