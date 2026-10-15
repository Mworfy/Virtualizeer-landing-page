import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import HeroViewer from '../components/HeroViewer.jsx'
import Art from '../components/Art.jsx'
import {
  CTABand, FAQ, ProjectCard, Reveal, SectionHeader, Steps, TourEmbed, usePageMeta,
} from '../components/ui.jsx'
import { demoTourUrl, faqs, process, projects, services, stats } from '../content.js'

const artFor = { 'virtual-tours': 'tours', 'digital-twins': 'twins', 'web-development': 'web' }

export default function Home() {
  usePageMeta()
  const featured = [projects.find((p) => p.category === 'tours'), projects.find((p) => p.category === 'twins'), projects.find((p) => p.category === 'web')].filter(Boolean)

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <span className="eyebrow intro">Virtual tours · Digital twins · Web</span>
            <h1 className="display intro" style={{ '--delay': '60ms' }}>Step inside before you arrive.</h1>
            <p className="lead intro" style={{ '--delay': '120ms' }}>
                360° tours, 3D digital twins and the websites that show them off.
            </p>
            <div className="btn-row intro" style={{ '--delay': '180ms' }}>
              <Link to="/contact" className="btn btn--primary">
                Get a quote <ArrowRight aria-hidden="true" />
              </Link>
              <a href="#demo" className="btn btn--secondary">Try a live tour</a>
            </div>
            <div className="hero__trust intro" style={{ '--delay': '240ms' }}>
              <span><strong>{stats[0].value}</strong> spaces captured</span>
              <span className="hero__trust-sep" aria-hidden="true" />
              <span><strong>{stats[2].value}</strong> typical turnaround</span>
            </div>
          </div>
          <div className="intro" style={{ '--delay': '150ms' }}>
            <HeroViewer />
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="services-title">
        <div className="container">
          <SectionHeader
            eyebrow="What we do"
            title={<span id="services-title">Capture it, model it, publish it.</span>}
          />
          <div className="grid grid-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80} className="card card--link service-card">
                <div className="service-card__visual"><Art variant={artFor[s.slug]} seed={s.slug} /></div>
                <div className="service-card__body">
                  <h3 className="h3">{s.name}</h3>
                  <p>{s.short}</p>
                  <ul>
                    {s.features.slice(0, 3).map((f) => (
                      <li key={f.title}><Check aria-hidden="true" />{f.title}</li>
                    ))}
                  </ul>
                  <Link to={s.path} className="link-arrow">
                    Explore {s.name.toLowerCase()} <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="section" aria-labelledby="demo-title">
        <div className="container">
          <SectionHeader
            eyebrow="See it for yourself"
            title={<span id="demo-title">Walk through a space right now.</span>}
            lead="Drag to look around. Tap the floor rings to walk."
          />
          <Reveal>
            <TourEmbed url={demoTourUrl} title="Sample virtual tour" />
          </Reveal>
        </div>
      </section>

      <section className="section section--navy" aria-labelledby="process-title">
        <div className="container">
          <SectionHeader
            eyebrow="How it works"
            title={<span id="process-title">Live in days, not weeks.</span>}
          />
          <Steps items={process} />
        </div>
      </section>

      <section className="section" aria-labelledby="work-title">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <SectionHeader eyebrow="Selected work" title={<span id="work-title">Spaces we’ve brought online.</span>} />
            <Link to="/projects" className="link-arrow" style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
              All projects <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-3">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}><ProjectCard project={p} /></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="faq-title">
        <div className="container">
          <SectionHeader center eyebrow="FAQ" title={<span id="faq-title">Questions, answered.</span>} />
          <FAQ items={faqs.slice(0, 4)} />
        </div>
      </section>

      <CTABand />
    </>
  )
}
