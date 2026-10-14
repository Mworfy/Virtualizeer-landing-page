import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Art from '../components/Art.jsx'
import TwinUseCases from '../components/compound/TwinUseCases.jsx'
import Icon from '../components/Icon.jsx'
import {
  CTABand, PageHero, ProjectCard, Reveal, SectionHeader, TourEmbed, usePageMeta,
} from '../components/ui.jsx'
import { demoTourUrl, process, projects, services } from '../content.js'

const categoryFor = { 'virtual-tours': 'tours', 'digital-twins': 'twins', 'web-development': 'web' }

export default function ServicePage({ slug }) {
  const s = services.find((x) => x.slug === slug)
  const category = categoryFor[slug]
  usePageMeta(s.name, s.intro)
  const related = projects.filter((p) => p.category === category).slice(0, 3)
  const others = services.filter((x) => x.slug !== slug)

  return (
    <>
      <PageHero eyebrow={s.name} title={s.headline} lead={s.intro}>
        <div className="btn-row">
          <Link to="/contact" state={{ service: s.name }} className="btn btn--primary">
            Get a quote <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/projects" state={{ filter: category }} className="btn btn--secondary">See examples</Link>
        </div>
      </PageHero>

      {slug === 'digital-twins' ? (
        <TwinUseCases />
      ) : (
        <section className="section--tight" aria-label={`${s.name} preview`}>
        <div className="container">
          <Reveal>
            {category === 'tours' ? (
              <TourEmbed url={demoTourUrl} title={`${s.name} demo`} />
            ) : (
              <div className="media-frame" style={{ aspectRatio: '21 / 9' }}>
                <Art variant={category} seed={`${slug}-hero`} />
              </div>
            )}
          </Reveal>
        </div>
      </section>
      )}

      {s.sectors && (
        <section className="section section--alt" aria-labelledby="sectors-title">
          <div className="container">
            <SectionHeader
              eyebrow="Who it’s for"
              title={<span id="sectors-title">Virtual tours for every kind of space.</span>}
              lead="From hotel suites to gym floors, a tour lets people look around before they visit, book or buy."
            />
            <div className="grid grid-4">
              {s.sectors.map((x, i) => (
                <Reveal key={x.name} delay={(i % 4) * 60} className="card sector-card">
                  <div className="icon-tile icon-tile--navy"><Icon name={x.icon} /></div>
                  <h3 className="h3">{x.name}</h3>
                  <p>{x.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="features-title">
        <div className="container">
          <SectionHeader eyebrow="Features" title={<span id="features-title">Everything included.</span>} />
          <div className="grid grid-3">
            {s.features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80} className="card">
                <div className="icon-tile"><Icon name={f.icon} /></div>
                <h3 className="h3">{f.title}</h3>
                <p>{f.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="usecases-title">
        <div className="container split split--top">
          <div>
            <SectionHeader
              eyebrow="Use cases"
              title={<span id="usecases-title">Where it makes the biggest difference.</span>}
            />
            {s.sectors ? (
              <p className="lead">Every tour is shot, built and published by our team, ready to share the same week.</p>
            ) : (
              <Reveal className="pill-grid">
                {s.useCases.map((u) => <span key={u} className="pill" style={{ paddingLeft: 20 }}>{u}</span>)}
              </Reveal>
            )}
          </div>
          <Reveal className="card">
            <h3 className="h3" style={{ marginBottom: 20 }}>What you receive</h3>
            <ul className="check-list">
              {s.deliverables.map((d) => (
                <li key={d}><CheckCircle2 aria-hidden="true" />{d}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section section--navy" aria-labelledby="process-title">
        <div className="container">
          <SectionHeader eyebrow="Process" title={<span id="process-title">Simple from start to finish.</span>} />
          <ol className="steps">
            {process.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80} className="step">
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related-title">
          <div className="container">
            <SectionHeader eyebrow="Projects" title={<span id="related-title">Recent {s.name.toLowerCase()} work.</span>} />
            <div className="grid grid-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}><ProjectCard project={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--alt" aria-labelledby="more-title">
        <div className="container">
          <SectionHeader eyebrow="Better together" title={<span id="more-title">Pair it with our other services.</span>} />
          <div className="grid grid-2">
            {others.map((o) => (
              <Reveal key={o.slug}>
                <Link to={o.path} className="card card--link" style={{ display: 'block', height: '100%' }}>
                  <div className="icon-tile icon-tile--navy"><Icon name={o.icon} /></div>
                  <h3 className="h3">{o.name}</h3>
                  <p style={{ marginBottom: 12 }}>{o.short}</p>
                  <span className="link-arrow">Learn more <ArrowRight aria-hidden="true" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  )
}
