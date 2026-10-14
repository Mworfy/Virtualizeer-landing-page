import { Link, useParams } from 'react-router-dom'
import { ChevronRight, CheckCircle2 } from 'lucide-react'
import Art from '../components/Art.jsx'
import {
  CTABand, PageHero, ProjectCard, Reveal, SectionHeader, TourEmbed, TourLink, categoryLabels, usePageMeta,
} from '../components/ui.jsx'
import { projects } from '../content.js'
import NotFound from './NotFound.jsx'

export default function ProjectDetail() {
  const { slug } = useParams()
  const p = projects.find((x) => x.slug === slug)
  usePageMeta(p?.title, p?.summary, { noindex: !p?.live }) // sample projects stay out of search until real
  if (!p) return <NotFound />
  const more = projects.filter((x) => x.slug !== p.slug).slice(0, 3)

  return (
    <>
      <PageHero
        eyebrow={categoryLabels[p.category]}
        title={p.title}
        lead={p.summary}
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/projects">Projects</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span aria-current="page">{p.title}</span>
          </nav>
        }
      />

      <section className="section--tight">
        <div className="container">
          <Reveal>
            {p.tourUrl || p.demoTour ? (
              <>
                <TourEmbed url={p.tourUrl} title={`${p.title} virtual tour`} variant={p.category} />
                {p.tourUrl && <div style={{ marginTop: 8 }}><TourLink url={p.tourUrl} /></div>}
              </>
            ) : p.image ? (
              <div className="media-frame" style={{ aspectRatio: '16 / 9' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div className="media-frame" style={{ aspectRatio: '16 / 9' }}>
                <Art variant={p.category} seed={p.slug} />
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container detail-grid">
          <div className="detail-body">
            <h2 className="h3">The challenge</h2>
            <p>{p.challenge}</p>
            <h2 className="h3">Our solution</h2>
            <p>{p.solution}</p>
            <h2 className="h3">{p.delivered ? 'What we delivered' : 'Results'}</h2>
            <ul className="check-list">
              {(p.delivered ?? p.results).map((r) => <li key={r}><CheckCircle2 aria-hidden="true" />{r}</li>)}
            </ul>
          </div>
          <aside className="detail-aside" aria-label="Project details">
            <dl>
              {p.client && <div><dt>Client</dt><dd>{p.client}</dd></div>}
              <div><dt>Service</dt><dd>{categoryLabels[p.category]}</dd></div>
              <div><dt>Location</dt><dd>{p.location}</dd></div>
              <div><dt>Year</dt><dd>{p.year}</dd></div>
            </dl>
            {p.live && <a href={p.live} target="_blank" rel="noopener" className="link-arrow" style={{ marginTop: 20, display: 'inline-flex' }}>Visit the live site</a>}
            <Link to="/contact" className="btn btn--primary" style={{ width: '100%', marginTop: 28 }}>
              Start a similar project
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeader eyebrow="More work" title="Other projects." />
          <div className="grid grid-3">
            {more.map((m) => <ProjectCard key={m.slug} project={m} />)}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  )
}
