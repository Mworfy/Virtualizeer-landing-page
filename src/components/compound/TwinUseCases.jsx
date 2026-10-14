import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Activity, Building2, Eye, Factory, MousePointerClick, Wrench } from 'lucide-react'
import { Reveal, SectionHeader } from '../ui.jsx'

const CompoundTour = lazy(() => import('./CompoundTour.jsx'))
const FactoryTour = lazy(() => import('../factory/FactoryTour.jsx'))

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
]

export default function TwinUseCases() {
  return useCases.map((u, n) => (
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
  ))
}
