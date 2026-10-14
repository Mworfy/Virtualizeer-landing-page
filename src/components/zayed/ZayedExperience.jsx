import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Hand, Map as MapIcon, Maximize2, Minus, Plus, Sparkles } from 'lucide-react'
import { NODES, STATUS, STOPS, UNITS, UNIT_SPEC, planLines } from './zayedScene.js'
import NewZayedMap from './NewZayedMap.jsx'
import './zayed.css'

// Zayed Reimagined: New Zayed map → 3D masterplan → seamless fly-in → walk through every room.
// The 3D engine is only created when the visitor opens the project from the map.

const touch = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches

export default function ZayedExperience() {
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const pinsRef = useRef(null)
  const markerRef = useRef(null)
  const xp = useRef(null)
  const [phase, setPhase] = useState('map') // map | zooming | loading | 3d
  const [error, setError] = useState(false)
  const [mode, setMode] = useState('aerial')
  const [unit, setUnit] = useState(null)
  const [stop, setStop] = useState('front')
  const [hover, setHover] = useState(null)
  const [moving, setMoving] = useState(false)
  const [quality, setQuality] = useState(touch ? 'fast' : 'high')
  const [hint, setHint] = useState(true)
  const plan = useMemo(() => planLines(), [])
  const verb = touch ? 'Tap' : 'Click'

  // Create the engine lazily, once the visitor chooses the project on the map
  useEffect(() => {
    if (phase !== 'loading') return
    let exp
    let cancelled = false
    import('./engine.js')
      .then(({ createExperience }) => {
        if (cancelled) return
        exp = createExperience({
          canvas: canvasRef.current,
          container: stageRef.current,
          pinRoot: pinsRef.current,
          quality,
          embedded: true,
          on: {
            mode: setMode,
            unit: setUnit,
            stop: setStop,
            hover: setHover,
            moving: setMoving,
            interact: () => setHint(false),
            frame: (S) => {
              const mk = markerRef.current
              if (!mk || !S.house || S.mode !== 'ground') return
              const r = S.house.rot
              const dx = S.x - S.house.unit.x
              const dz = S.z - S.house.unit.z
              const lx = dx * Math.cos(r) - dz * Math.sin(r)
              const lz = dx * Math.sin(r) + dz * Math.cos(r)
              mk.setAttribute('transform', `translate(${lx * 10} ${lz * 10}) rotate(${(-(S.yaw - r) * 180) / Math.PI})`)
            },
          },
        })
        xp.current = exp
        if (import.meta.env.DEV) window.__zayed = exp
        exp.start()
        setPhase('3d')
      })
      .catch((e) => {
        console.error(e)
        setError(true)
      })
    return () => {
      cancelled = true
      exp?.dispose()
      xp.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'loading' || phase === '3d'])

  useEffect(() => xp.current?.setQuality(quality), [quality])

  const openProject = () => {
    setPhase('zooming')
    setTimeout(() => setPhase('loading'), window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 900)
  }
  const backToMap = () => {
    setPhase('map')
    setMode('aerial')
    setUnit(null)
    setHint(true)
  }
  const fullscreen = () => {
    const el = rootRef.current
    if (document.fullscreenElement) document.exitFullscreen?.()
    else el?.requestFullscreen?.()
  }
  const stepStop = (dir) => {
    const i = STOPS.indexOf(xp.current?.stop() ?? 'front')
    xp.current?.walkTo(STOPS[(i + dir + STOPS.length) % STOPS.length])
  }
  const onKeyDown = (e) => {
    const map = { ArrowLeft: [0.15, 0], ArrowRight: [-0.15, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }
    if (map[e.key]) {
      e.preventDefault()
      xp.current?.look(...map[e.key])
      setHint(false)
    }
    if (e.key === 'Escape' && mode === 'ground') xp.current?.exitHouse()
  }

  const u = unit !== null ? UNITS[unit] : null
  const in3d = phase === 'loading' || phase === '3d'

  return (
    <div ref={rootRef} className={`zx zx--${in3d ? mode : 'map'}`} role="region" aria-label="Zayed Reimagined, New Zayed">
      {/* Map stage */}
      {!in3d && <NewZayedMap zooming={phase === 'zooming'} onOpen={openProject} />}

      {/* 3D stage */}
      {in3d && (
        <div className="zx__stage" ref={stageRef}>
          <canvas ref={canvasRef} className="zx__canvas" tabIndex={0} onKeyDown={onKeyDown}
            aria-label="3D view of Zayed Reimagined. Use the arrow keys to look around and the controls to choose a villa or room." />

          <div className="zx__pins" ref={pinsRef}>
            {UNITS.map((un, i) => (
              <button key={un.id} data-pin={`unit:${i}`} className={`zx__pin zx__pin--unit${hover === i ? ' is-hover' : ''}`}
                style={{ visibility: 'hidden' }}
                onClick={() => xp.current?.enterHouse(i)}
                onMouseEnter={() => xp.current?.setHover(i)} onMouseLeave={() => xp.current?.setHover(null)}
                tabIndex={mode === 'aerial' ? 0 : -1}
                aria-label={`Villa ${un.id}, ${STATUS[un.status].label}. Step inside`}>
                <span className="zx__dot" style={{ '--c': STATUS[un.status].color }} />
                <span>{un.id}</span>
                <span className="zx__more">{STATUS[un.status].label} · {un.price}</span>
              </button>
            ))}
            {STOPS.map((k) => (
              <button key={k} data-pin={`room:${k}`} className="zx__pin zx__pin--room" style={{ visibility: 'hidden' }}
                onClick={() => xp.current?.walkTo(k)} tabIndex={mode === 'ground' && k !== stop ? 0 : -1}
                aria-label={`Go to ${NODES[k].name}`}>
                <span className="zx__ring" />
                <span className="zx__roomlabel">{NODES[k].name}</span>
              </button>
            ))}
          </div>

          {phase === 'loading' && !error && <div className="zx__loading"><span className="vtour__spinner" aria-label="Loading 3D compound" /></div>}
          {error && <div className="zx__loading">Your browser can’t display this 3D experience.</div>}

          {/* Top bar */}
          <div className="zx__top">
            {mode === 'aerial' ? (
              <button className="zx__glass zx__btn" onClick={backToMap}><MapIcon aria-hidden="true" /> New Zayed map</button>
            ) : (
              <button className="zx__glass zx__btn" onClick={() => xp.current?.exitHouse()} disabled={mode === 'flying' || moving}>
                <ArrowLeft aria-hidden="true" /> Masterplan
              </button>
            )}
            <div className="zx__topright">
              <button className="zx__glass zx__btn" aria-pressed={quality === 'high'} onClick={() => setQuality((q) => (q === 'high' ? 'fast' : 'high'))}
                title="High quality adds ambient occlusion">
                <Sparkles aria-hidden="true" /> {quality === 'high' ? 'High quality' : 'Fast'}
              </button>
              <button className="zx__glass zx__btn zx__icon" onClick={fullscreen} aria-label="Toggle full screen"><Maximize2 aria-hidden="true" /></button>
            </div>
          </div>

          {/* Aerial */}
          {phase === '3d' && mode === 'aerial' && (
            <>
              {hint && <div className="zx__hint"><Hand aria-hidden="true" /> Drag to orbit · {verb} a villa to step inside</div>}
              <nav className="zx__strip zx__glass" aria-label="Villas">
                {UNITS.map((un, i) => (
                  <button key={un.id} className={hover === i ? 'is-hover' : ''} onClick={() => xp.current?.enterHouse(i)}
                    onMouseEnter={() => xp.current?.setHover(i)} onMouseLeave={() => xp.current?.setHover(null)}>
                    <span className="zx__dot" style={{ '--c': STATUS[un.status].color }} />{un.id}
                  </button>
                ))}
              </nav>
              <div className="zx__zoom zx__glass">
                <button onClick={() => xp.current?.zoom(0.85)} aria-label="Zoom in"><Plus aria-hidden="true" /></button>
                <button onClick={() => xp.current?.zoom(1.18)} aria-label="Zoom out"><Minus aria-hidden="true" /></button>
              </div>
              <div className="zx__legend zx__glass" aria-label="Availability">
                {Object.values(STATUS).map((s) => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}
              </div>
            </>
          )}

          {/* Ground */}
          {mode !== 'aerial' && u && (
            <aside className={`zx__card${mode === 'ground' ? ' is-on' : ''}`} aria-label={`Villa ${u.id}`}>
              <div className="zx__cardhead">
                <strong>Villa {u.id}</strong>
                <span className="zx__status"><i style={{ background: STATUS[u.status].color }} />{STATUS[u.status].label}</span>
              </div>
              <p>{UNIT_SPEC.type} · {UNIT_SPEC.beds} bedrooms + tower suite · {UNIT_SPEC.area}</p>
              <p className="zx__price">From {u.price}</p>
              <Link to="/contact" state={{ service: 'Digital Twins' }} className="zx__cta">Book a viewing <ArrowRight aria-hidden="true" /></Link>
            </aside>
          )}
          {mode === 'ground' && (
            <>
              <nav className="zx__rooms zx__glass" aria-label="Rooms">
                <button className="zx__arrow" onClick={() => stepStop(-1)} disabled={moving} aria-label="Previous room"><ChevronLeft aria-hidden="true" /></button>
                {STOPS.map((k) => (
                  <button key={k} className="zx__room" aria-current={k === stop ? 'location' : undefined}
                    onClick={() => xp.current?.walkTo(k)} disabled={moving && k !== stop}>{NODES[k].name}</button>
                ))}
                <button className="zx__arrow" onClick={() => stepStop(1)} disabled={moving} aria-label="Next room"><ChevronRight aria-hidden="true" /></button>
              </nav>
              <div className="zx__plan zx__glass" aria-hidden="true">
                <svg viewBox="-80 -80 140 200" width="100%" height="100%">
                  <g stroke="#fff" strokeOpacity=".85" strokeWidth="2.2" strokeLinecap="round">
                    {plan.map(([x1, z1, x2, z2], i) => <line key={i} x1={x1 * 10} y1={z1 * 10} x2={x2 * 10} y2={z2 * 10} />)}
                  </g>
                  {STOPS.map((k) => <circle key={k} cx={NODES[k].pos[0] * 10} cy={NODES[k].pos[1] * 10} r="3.5" fill="#fff" fillOpacity={k === stop ? 0 : 0.5} />)}
                  <g ref={markerRef}>
                    <path d="M0 0 L-12 -22 A25 25 0 0 1 12 -22 Z" fill="#e9c98f" fillOpacity=".7" />
                    <circle r="5" fill="#fff" />
                  </g>
                </svg>
              </div>
              {hint && <div className="zx__hint"><Hand aria-hidden="true" /> Drag to look · {verb} a room label to walk there</div>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
