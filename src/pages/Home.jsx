import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import HeroViewer from '../components/HeroViewer.jsx'
import Art from '../components/Art.jsx'
import Icon from '../components/Icon.jsx'
import {
  CTABand, FAQ, ProjectCard, Reveal, SectionHeader, Testimonials, TourEmbed, usePageMeta,
} from '../components/ui.jsx'
import { clients, demoTourUrl, industries, process, projects, services, stats } from '../content.js'

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
                We turn real spaces into immersive 360° tours and measurable digital twins — and build the
                websites that put them in front of the right people.
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

      <section className="section--tight" aria-label="Clients">
        <div className="container">
          <p className="muted" style={{ textAlign: 'center', marginBottom: 24, fontSize: '0.95rem' }}>
            Trusted by teams in real estate, hospitality and construction
          </p>
          <div className="logo-row">
            {clients.map((c) => <span key={c}>{c}</span>)}
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="services-title">
        <div className="container">
          <SectionHeader
            eyebrow="What we do"
            title={<span id="services-title">One team for capturing, modelling and publishing your space.</span>}
            lead="Pick one service or combine all three — tours and twins are captured in the same visit."
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
            lead="Drag to look around and tap the rings on the floor to walk from room to room — the same experience we build for your space."
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
            title={<span id="process-title">From first call to live tour in days, not weeks.</span>}
          />
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

      <section className="section section--alt" aria-labelledby="industries-title">
        <div className="container split">
          <div>
            <SectionHeader
              eyebrow="Who it’s for"
              title={<span id="industries-title">Built for spaces people need to see.</span>}
              lead="If your customers would benefit from looking around before they commit, a tour or twin pays for itself."
            />
            <Reveal className="pill-grid">
              {industries.map((ind) => (
                <span key={ind.name} className="pill"><Icon name={ind.icon} />{ind.name}</span>
              ))}
            </Reveal>
          </div>
          <Reveal className="stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)', rowGap: 48 }}>
            {stats.map((s) => (
              <div key={s.label}>
                <div className="stat__value">{s.value}</div>
                <div className="stat__label">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="testimonials-title">
        <div className="container">
          <SectionHeader center eyebrow="Clients" title={<span id="testimonials-title">What our clients say.</span>} />
          <Testimonials />
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="faq-title">
        <div className="container">
          <SectionHeader center eyebrow="FAQ" title={<span id="faq-title">Questions, answered.</span>} />
          <FAQ />
        </div>
      </section>

      <CTABand />
    </>
  )
}
