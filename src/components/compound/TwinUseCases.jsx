import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import NewZayedMap from '../zayed/NewZayedMap.jsx'
import { Activity, ArrowRight, Building2, Eye, Factory, Layers, MapPin, MousePointerClick, Scale, Trees, Wrench } from 'lucide-react'
import { Reveal, SectionHeader } from '../ui.jsx'
import TwinFrame from '../TwinFrame.jsx'

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
    eyebrow: 'Demo 01 · Residential compound',
    title: 'Let buyers walk through homes that don’t exist yet.',
    lead: 'Show the masterplan, then step into any unit. Click a villa to try it.',
    className: 'tour--compound',
    Demo: CompoundTour,
    benefits: [
      { icon: Building2, title: 'See the whole masterplan', text: 'Roads, amenities and available units from above.' },
      { icon: MousePointerClick, title: 'Pick a home, step inside', text: 'One click flies you to the front door.' },
      { icon: Eye, title: 'Sell before it’s built', text: 'Buyers tour their villa months before handover.' },
    ],
  },
  {
    id: 'usecase-factory',
    eyebrow: 'Demo 02 · Manufacturing plant',
    title: 'Run the factory floor from any screen.',
    lead: 'Live machine data on a 3D plant. Click a machine or the red alert.',
    className: 'tour--factory',
    Demo: FactoryTour,
    benefits: [
      { icon: Activity, title: 'Live status on the 3D floor', text: 'Every machine’s data, at a glance.' },
      { icon: Factory, title: 'Catch issues before downtime', text: 'Alerts flag heat and vibration early.' },
      { icon: Wrench, title: 'Maintenance, in context', text: 'Technicians see exactly what to fix.' },
    ],
  },
  {
    id: 'usecase-zayed',
    eyebrow: 'Demo 03 · Zayed Reimagined',
    title: 'Find it on the map, then walk inside.',
    lead: 'A 10 villa compound in New Zayed. Click the gold pin to fly in.',
    className: 'tour--zayed',
    Demo: ZayedExperience,
    benefits: [
      { icon: MapPin, title: 'From the map to the front door', text: 'See the location, then open it in 3D.' },
      { icon: Trees, title: 'New villa design, real setting', text: 'Courtyard villas with gardens and pools.' },
      { icon: MousePointerClick, title: 'Hotspots in every room', text: 'Walk room to room with one tap.' },
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
          <TwinFrame className={u.className} title={u.eyebrow.split(' · ')[1]}>
            <LazyMount><u.Demo /></LazyMount>
          </TwinFrame>
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
  { icon: Layers, title: 'A visual identity for the region', text: 'The whole district in one 3D map.' },
  { icon: Scale, title: 'Look up and compare compounds', text: '23 compounds, side by side.' },
  { icon: MapPin, title: 'Landmarks in context', text: 'Airport, roads and Pyramids nearby.' },
]

function AtlasTeaser() {
  return (
    <section className="section section--alt" aria-labelledby="usecase-atlas">
      <div className="container">
        <SectionHeader
          eyebrow="Demo 04 · New Zayed Atlas"
          title={<span id="usecase-atlas">A 3D reference map for New Zayed.</span>}
          lead="Explore New Zayed in 3D and compare its compounds."
        />
        <Reveal>
          <div className="tour tour--atlas">
            <div className="atlas-teaser" aria-hidden="true"><NewZayedMap zooming={false} onOpen={() => {}} /></div>
            <div className="atlas-teaser__cta">
              <strong>New Zayed <em>Atlas</em></strong>
              <span>Full screen 3D map · compound directory · side by side comparison</span>
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

