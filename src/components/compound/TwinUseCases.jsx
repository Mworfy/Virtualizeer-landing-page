import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NewZayedMap from '../zayed/NewZayedMap.jsx'
import { Activity, ArrowRight, Building2, Eye, Factory, Layers, MapPin, MousePointerClick, Scale, Trees, Wrench } from 'lucide-react'
import { Reveal, SectionHeader } from '../ui.jsx'

const CompoundTour = lazy(() => import('./CompoundTour.jsx'))
const FactoryTour = lazy(() => import('../factory/FactoryTour.jsx'))
const ZayedExperience = lazy(() => import('../zayed/ZayedExperience.jsx'))

const Spinner = () => (
  <div className="vtour"><div className="vtour__loading"><span className="vtour__spinner" aria-label="Loading 3D view" /></div></div>
)

// Mount heavy 3D demos only when they approach the viewport
function LazyMount({ children }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return setShow(true)
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: '400px 0px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} style={{ position: 'absolute', inset: 0 }}>{show ? <Suspense fallback={<Spinner />}>{children}</Suspense> : <Spinner />}</div>
}

const useCases = [
  {
    id: 'usecase-compound',
    eyebrow: 'Interactive use case 01 · Residential compound',
    title: 'Let buyers walk through homes that don’t exist yet.',
    lead: 'Off-plan sales live or die on imagination. A digital twin of the compound lets agents show the full masterplan, then take clients straight into the unit they’re interested in. Try it: click any villa.',
    className: 'tour--compound',
    Demo: CompoundTour,
    benefits: [
      { icon: Building2, title: 'See the whole masterplan', text: 'Buyers explore the compound from above — roads, amenities, and which units are still available.' },
      { icon: MousePointerClick, title: 'Pick a home, step inside', text: 'One click flies down to the front garden in first person. No loading screens, no separate apps.' },
      { icon: Eye, title: 'Sell before it’s built', text: 'Clients walk through their future villa room by room, months before construction finishes.' },
    ],
  },
  {
    id: 'usecase-factory',
    eyebrow: 'Interactive use case 02 · Manufacturing plant',
    title: 'Run the factory floor from any screen.',
    lead: 'An industrial twin connects the 3D plant to live machine data. Managers see every line at a glance, spot problems before they stop production and send the right technician to the right machine. Try it: click a machine — or the red alert.',
    className: 'tour--factory',
    Demo: FactoryTour,
    benefits: [
      { icon: Activity, title: 'Live status on the 3D floor', text: 'Sensor and MES data mapped onto each machine, so the whole plant reads at a glance.' },
      { icon: Factory, title: 'Catch issues before downtime', text: 'Alerts and trends flag overheating and vibration early, with predicted failure windows.' },
      { icon: Wrench, title: 'Maintenance, in context', text: 'Open work orders from the machine itself; technicians see exactly where and what to fix.' },
    ],
  },
  {
    id: 'usecase-zayed',
    eyebrow: 'Project 03 · Zayed Reimagined · New Zayed',
    title: 'Zayed Reimagined: find it on the map, then walk inside.',
    lead: 'Our third project sits in New Zayed, next to VYE and Belle Vie. Start on the map, open the project, orbit the 10-villa masterplan, then fly into any villa and walk through every room. Try it: click the gold pin.',
    className: 'tour--zayed',
    Demo: ZayedExperience,
    benefits: [
      { icon: MapPin, title: 'From the map to the front door', text: 'Location first: buyers see where the project sits in New Zayed, then open it in 3D.' },
      { icon: Trees, title: 'New villa design, real setting', text: 'Courtyard villas in stucco, travertine and timber, set in trees, palms and private pools.' },
      { icon: MousePointerClick, title: 'Hotspots in every room', text: 'Labelled hotspots and floor rings move you through each villa in one continuous camera move.' },
    ],
  },
]

export default function TwinUseCases() {
  return (
    <>
      {useCases.map((u, n) => (
    <section key={u.id} className={`section${n % 2 ? ' section--alt' : ''}`} aria-labelledby={u.id}>
      <div className="container">
        <SectionHeader eyebrow={u.eyebrow} title={<span id={u.id}>{u.title}</span>} lead={u.lead} />
        <Reveal>
          <div className={`tour ${u.className}`}>
            <LazyMount><u.Demo /></LazyMount>
          </div>
        </Reveal>
        <div className="grid grid-3" style={{ marginTop: 32 }}>
          {u.benefits.map(({ icon: I, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="card">
              <div className="icon-tile"><I aria-hidden="true" /></div>
              <h3 className="h3">{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  ))}
      <AtlasTeaser />
    </>
  )
}

const atlasPoints = [
  { icon: Layers, title: 'A visual identity for the region', text: 'New Zayed, the airport, Sheikh Zayed and the desert road in one stylised 3D map.' },
  { icon: Scale, title: 'Look up and compare compounds', text: 'Search 23 compounds by name or developer, filter by type and compare them side by side.' },
  { icon: MapPin, title: 'Sourced, not guessed', text: 'Every figure links to its public source, with the date it was checked.' },
]

function AtlasTeaser() {
  return (
    <section className="section section--alt" aria-labelledby="usecase-atlas">
      <div className="container">
        <SectionHeader
          eyebrow="Project 04 · New Zayed Atlas"
          title={<span id="usecase-atlas">A 3D reference map for New Zayed.</span>}
          lead="An interactive web app for Egypt's newest western district: explore the area in 3D, see the landmarks and roads around it, and look up and compare every compound we could source."
        />
        <Reveal>
          <div className="tour tour--atlas">
            <div className="atlas-teaser" aria-hidden="true"><NewZayedMap zooming={false} onOpen={() => {}} /></div>
            <div className="atlas-teaser__cta">
              <strong>New Zayed <em>Atlas</em></strong>
              <span>Full-screen 3D map · compound directory · side-by-side comparison</span>
              <Link to="/new-zayed-atlas" className="btn btn--light">Open the Atlas <ArrowRight aria-hidden="true" /></Link>
            </div>
          </div>
        </Reveal>
        <div className="grid grid-3" style={{ marginTop: 32 }}>
          {atlasPoints.map(({ icon: I, title, text }, i) => (
            <Reveal key={title} delay={i * 80} className="card">
              <div className="icon-tile"><I aria-hidden="true" /></div>
              <h3 className="h3">{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

