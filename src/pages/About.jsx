import { User } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import { CTABand, PageHero, Reveal, SectionHeader, usePageMeta } from '../components/ui.jsx'
import { stats, team } from '../content.js'

const values = [
  { icon: 'Target', title: 'Accuracy first', text: 'Every capture is checked before it ships.' },
  { icon: 'Eye', title: 'Designed to be seen', text: 'Framing, light and flow, not just a scan.' },
  { icon: 'Zap', title: 'Fast & reliable', text: 'Quick turnaround, one point of contact.' },
  { icon: 'Hand', title: 'Easy to use', text: 'Opens on any device, no app needed.' },
]

export default function About() {
  usePageMeta('About', 'Virtualizeer is a team of 3D capture specialists and web developers.')
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We bring real places online."
        lead="3D capture specialists and web developers, based in Cairo."
      />

      <section className="section">
        <div className="container split">
          <Reveal>
            <span className="eyebrow" style={{ marginBottom: 16 }}>Our story</span>
            <h2 className="h2" style={{ marginBottom: 20 }}>Seeing a space shouldn’t require being there.</h2>
            {/* TODO: replace with your real story */}
            <p className="muted">
              Photos flatten a space. A tour lets people move through it, and a twin lets them measure it.
            </p>
          </Reveal>
          <Reveal className="media-frame" style={{ display: 'grid', placeItems: 'center' }}>
            <img src="/brand/mark-white.png" alt="" style={{ width: '38%' }} />
          </Reveal>
        </div>
      </section>

      <section className="section section--navy">
        <div className="container">
          <div className="stats">
            {stats.map((s) => (
              <Reveal key={s.label}>
                <div className="stat__value">{s.value}</div>
                <div className="stat__label">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Values" title="How we work." />
          <div className="grid grid-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 60} className="card">
                <div className="icon-tile"><Icon name={v.icon} /></div>
                <h3 className="h3">{v.title}</h3>
                <p>{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <SectionHeader eyebrow="Team" title="The people behind the scans." />
          <div className="grid grid-3">
            {team.map((m, i) => (
              <Reveal key={i} delay={i * 60} className="team-card">
                <div className="team-card__photo">
                  {m.photo ? <img src={m.photo} alt={m.name} loading="lazy" /> : <User aria-hidden="true" />}
                </div>
                <h3 className="h3">{m.name}</h3>
                <p className="role">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  )
}
