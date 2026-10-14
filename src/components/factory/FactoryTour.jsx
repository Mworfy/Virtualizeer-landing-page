import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, Hand, Minus, PauseCircle, Plus, Wrench, X } from 'lucide-react'
import { MACHINES, METRICS, STATUS, buildFactory } from './factoryScene.js'

// Industrial digital twin: cutaway plant with simulated live sensor data.
// Orbit the plant, click a machine to fly to it and open its live readings.

const touch = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const HISTORY = 40
const STATUS_ICON = { running: CheckCircle2, idle: PauseCircle, alert: AlertTriangle }
const NOISE = { temp: 0.8, vib: 0.15, thr: 3, oee: 1.2 }

// ── Simulated telemetry ─────────────────────────────────
function nextValue(m, key, prev, tick) {
  if (m.status === 'idle' && (key === 'thr' || key === 'oee')) return 0
  let target = m.base[key]
  if (m.status === 'alert' && key === 'temp') target = Math.min(92, 84 + tick * 0.08)
  if (m.status === 'alert' && key === 'vib') target = Math.min(5.8, 4.8 + tick * 0.01)
  const v = prev + (target - prev) * 0.25 + (Math.random() - 0.5) * 2 * NOISE[key]
  return key === 'oee' ? Math.max(0, Math.min(100, v)) : Math.max(0, v)
}
function seedHistory() {
  const out = {}
  MACHINES.forEach((m) => {
    out[m.id] = {}
    METRICS.forEach(({ key }) => {
      const arr = []
      let v = m.base[key]
      for (let i = 0; i < HISTORY; i++) {
        v = nextValue(m, key, v, i - HISTORY)
        arr.push(v)
      }
      out[m.id][key] = arr
    })
  })
  return out
}

function useTelemetry(active) {
  const [data, setData] = useState(seedHistory)
  const [output, setOutput] = useState(6240)
  const tick = useRef(0)
  useEffect(() => {
    if (!active) return
    const iv = setInterval(() => {
      tick.current += 1
      setData((prev) => {
        const next = {}
        MACHINES.forEach((m) => {
          next[m.id] = {}
          METRICS.forEach(({ key }) => {
            const arr = prev[m.id][key]
            next[m.id][key] = [...arr.slice(1), nextValue(m, key, arr.at(-1), tick.current)]
          })
        })
        return next
      })
      setOutput((o) => o + Math.round(Math.random() * 3 + 2))
    }, 1000)
    return () => clearInterval(iv)
  }, [active])
  const oee = MACHINES.reduce((s, m) => s + data[m.id].oee.at(-1), 0) / MACHINES.length
  return { data, output, oee }
}

// ── Sparkline (single series, muted line, accent current point, dashed limit) ──
function Sparkline({ values, limit, unit, digits, label }) {
  const [hi, setHi] = useState(null)
  const W = 132
  const Hh = 40
  const pad = 4
  const lo = Math.min(...values, limit ?? Infinity)
  const top = Math.max(...values, limit ?? -Infinity)
  const span = top - lo || 1
  const x = (i) => pad + (i / (values.length - 1)) * (W - pad * 2)
  const y = (v) => Hh - pad - ((v - lo) / span) * (Hh - pad * 2)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const last = values.length - 1
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / r.width) * (values.length - 1))
    setHi(Math.max(0, Math.min(last, i)))
  }
  return (
    <div className="spark">
      <svg
        viewBox={`0 0 ${W} ${Hh}`}
        width="100%"
        height={Hh}
        preserveAspectRatio="none"
        onPointerMove={onMove}
        onPointerLeave={() => setHi(null)}
        role="img"
        aria-label={`${label}, last ${values.length} seconds, now ${values[last].toFixed(digits)} ${unit}`}
      >
        {limit != null && (
          <line x1={pad} x2={W - pad} y1={y(limit)} y2={y(limit)} stroke="#d03b3b" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        )}
        <path d={d} fill="none" stroke="#8a99a8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {hi !== null && <line x1={x(hi)} x2={x(hi)} y1={0} y2={Hh} stroke="#0f2a40" strokeOpacity=".35" vectorEffect="non-scaling-stroke" />}
        <circle cx={x(hi ?? last)} cy={y(values[hi ?? last])} r="3.5" fill="#2f6fa8" stroke="#fff" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {hi !== null && (
        <span className="spark__tip" style={{ left: `${(x(hi) / W) * 100}%` }}>
          {values[hi].toFixed(digits)} {unit} · {last - hi}s ago
        </span>
      )}
    </div>
  )
}

function StatusPill({ status }) {
  const I = STATUS_ICON[status]
  return (
    <span className={`fstatus fstatus--${status}`}>
      <I aria-hidden="true" /> {STATUS[status].label}
    </span>
  )
}

export default function FactoryTour() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const tipRef = useRef(null)
  const api = useRef({})
  const [status, setStatus] = useState('loading')
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [interacted, setInteracted] = useState(false)
  const [orders, setOrders] = useState({})
  const { data, output, oee } = useTelemetry(visible && status === 'ready')

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}
    ;(async () => {
      let THREE
      try {
        THREE = await import('three')
      } catch {
        return setStatus('error')
      }
      if (disposed) return
      const canvas = canvasRef.current
      const wrap = wrapRef.current
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
      } catch {
        return setStatus('error')
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.shadowMap.autoUpdate = false // moving parts don't cast; static shadows render once
      renderer.shadowMap.needsUpdate = true

      const markTexture = await new THREE.TextureLoader().loadAsync('/brand/mark-white.png').catch(() => null)
      if (markTexture) markTexture.colorSpace = THREE.SRGBColorSpace
      if (disposed) return renderer.dispose()

      const { scene, machines, animate } = buildFactory(THREE, { markTexture })
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 800)
      const rm = reducedMotion()
      const HOME = { theta: 0.62, phi: 0.9, radius: 66, target: new THREE.Vector3(-3, 0, -3) }
      const S = {
        theta: HOME.theta, phi: HOME.phi, radius: HOME.radius, target: HOME.target.clone(),
        autoSpin: !rm, cam: null, selected: null, hover: null, visible: true, vTheta: 0, offX: 0, offY: 0,
      }

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = wrap
        if (!w || !h) return
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(wrap)

      // Smoothly move the orbit (target, radius, angles) to a new framing
      const moveTo = ({ theta, phi, radius, target }, dur = 1600) => {
        let dT = (theta - S.theta) % (Math.PI * 2)
        if (dT > Math.PI) dT -= Math.PI * 2
        if (dT < -Math.PI) dT += Math.PI * 2
        S.cam = {
          from: { theta: S.theta, phi: S.phi, radius: S.radius, target: S.target.clone() },
          dT, phi, radius, target: target.clone(), t0: performance.now(), dur: rm ? 0 : dur,
        }
      }
      const focus = (i) => {
        S.autoSpin = false
        S.selected = i
        setSelected(i)
        if (i === null) return moveTo(HOME, 1800)
        const m = machines[i]
        const p = m.group.position.clone().add(new THREE.Vector3(0, 1.4, m.pick.position.z))
        moveTo({ theta: S.theta, phi: 1.02, radius: 15, target: p })
      }

      const raycaster = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const picks = machines.map((m) => m.pick)
      const pick = (ev) => {
        const r = canvas.getBoundingClientRect()
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        return raycaster.intersectObjects(picks, false)[0]?.object.userData.machine ?? null
      }

      let drag = null
      const onDown = (ev) => {
        drag = { lx: ev.clientX, ly: ev.clientY, lt: performance.now(), moved: 0 }
        canvas.setPointerCapture(ev.pointerId)
        S.autoSpin = false
        S.vTheta = 0
        setInteracted(true)
      }
      const onMove = (ev) => {
        if (!drag) {
          if (ev.pointerType !== 'mouse') return
          const h = pick(ev)
          if (h !== S.hover) {
            S.hover = h
            setHover(h)
          }
          canvas.style.cursor = h !== null ? 'pointer' : 'grab'
          return
        }
        const dx = ev.clientX - drag.lx
        const dy = ev.clientY - drag.ly
        drag.moved += Math.abs(dx) + Math.abs(dy)
        const now = performance.now()
        if (!S.cam) {
          S.theta -= dx * 0.005
          S.phi = Math.min(1.35, Math.max(0.3, S.phi - dy * 0.004))
          S.vTheta = ((-dx * 0.005) / Math.max(8, now - drag.lt)) * 16
        }
        drag.lx = ev.clientX
        drag.ly = ev.clientY
        drag.lt = now
        canvas.style.cursor = 'grabbing'
      }
      const onUp = (ev) => {
        if (!drag) return
        const click = drag.moved < 6
        drag = null
        canvas.style.cursor = 'grab'
        if (!click) return
        S.vTheta = 0
        const h = pick(ev)
        if (h !== null && h !== S.selected) focus(h)
      }
      const onLeave = () => {
        S.hover = null
        setHover(null)
      }
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)
      canvas.addEventListener('pointerleave', onLeave)

      const tipPos = new THREE.Vector3()
      const frame = (now) => {
        if (S.cam) {
          const c = S.cam
          const t = c.dur ? Math.min(1, (now - c.t0) / c.dur) : 1
          const e = easeInOut(t)
          S.theta = c.from.theta + c.dT * e
          S.phi = c.from.phi + (c.phi - c.from.phi) * e
          S.radius = c.from.radius + (c.radius - c.from.radius) * e
          S.target.lerpVectors(c.from.target, c.target, e)
          if (t >= 1) S.cam = null
        } else {
          if (S.autoSpin) S.theta += 0.0006
          if (Math.abs(S.vTheta) > 0.00005 && !drag) {
            S.theta += S.vTheta
            S.vTheta *= 0.93
          }
        }
        camera.position.set(
          S.target.x + S.radius * Math.sin(S.phi) * Math.sin(S.theta),
          S.target.y + S.radius * Math.cos(S.phi),
          S.target.z + S.radius * Math.sin(S.phi) * Math.cos(S.theta),
        )
        camera.lookAt(S.target)
        // keep the selected machine clear of the data panel (beside it on desktop, above it on phones)
        const w = wrap.clientWidth
        const h = wrap.clientHeight
        const narrow = w < 720
        const tx = S.selected !== null && !narrow ? Math.min(190, w * 0.16) : 0
        const ty = S.selected !== null && narrow ? h * 0.24 : 0
        S.offX += (tx - S.offX) * (rm ? 1 : 0.08)
        S.offY += (ty - S.offY) * (rm ? 1 : 0.08)
        if (Math.abs(S.offX) + Math.abs(S.offY) > 0.5) camera.setViewOffset(w, h, S.offX, S.offY, w, h)
        else camera.clearViewOffset()
        animate(now / 1000, { motion: !rm })
        machines.forEach((m, i) => {
          m.ring.visible = i === S.selected || i === S.hover
          m.ring.material.opacity = i === S.selected ? 0.95 : 0.55
        })
        renderer.render(scene, camera)

        const tip = tipRef.current
        if (tip && S.hover !== null && S.hover !== S.selected) {
          machines[S.hover].group.getWorldPosition(tipPos)
          tipPos.y = 5
          tipPos.project(camera)
          tip.style.transform = `translate(${((tipPos.x + 1) / 2) * wrap.clientWidth}px, ${((1 - tipPos.y) / 2) * wrap.clientHeight}px) translate(-50%, -100%)`
        }
      }

      let raf = 0
      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        if (S.visible) frame(now)
      }
      frame(performance.now())
      raf = requestAnimationFrame(loop)
      const io = new IntersectionObserver(([en]) => {
        S.visible = en.isIntersecting
        setVisible(en.isIntersecting)
      })
      io.observe(wrap)

      api.current = {
        focus,
        zoom: (d) => {
          S.autoSpin = false
          S.radius = Math.min(150, Math.max(10, S.radius + d))
        },
        look: (d) => {
          S.autoSpin = false
          S.theta -= d
        },
      }
      if (import.meta.env.DEV) window.__factory = { S, frame, focus }
      setStatus('ready')

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        io.disconnect()
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointercancel', onUp)
        canvas.removeEventListener('pointerleave', onLeave)
        scene.traverse((o) => {
          o.geometry?.dispose()
          const m = o.material
          ;(Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => {
            mm.map?.dispose()
            mm.dispose()
          })
        })
        renderer.dispose()
      }
    })()
    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      api.current.look?.(e.key === 'ArrowLeft' ? -0.15 : 0.15)
      setInteracted(true)
    }
    if (e.key === 'Escape' && selected !== null) api.current.focus?.(null)
  }

  const alerts = MACHINES.filter((m) => m.status === 'alert')
  const warnings = MACHINES.filter((m) => m.status === 'idle')
  const sel = selected !== null ? MACHINES[selected] : null
  const hov = hover !== null && hover !== selected ? MACHINES[hover] : null

  return (
    <div ref={wrapRef} className={`vtour ftour${status === 'ready' ? ' is-ready' : ''}${sel ? ' has-panel' : ''}`} role="region" aria-label="Interactive factory digital twin">
      <canvas
        ref={canvasRef}
        className="vtour__canvas"
        tabIndex={0}
        aria-label="3D view of the factory. Use the arrow keys to rotate and the machine list to inspect equipment."
        onKeyDown={onKeyDown}
      />
      {status !== 'ready' && (
        <div className="vtour__loading" aria-live="polite">
          {status === 'error' ? 'Your browser can’t display the 3D view.' : <span className="vtour__spinner" aria-label="Loading factory" />}
        </div>
      )}

      {status === 'ready' && (
        <>
          {/* Plant KPIs */}
          <div className="fkpis">
            <div className="fkpi fkpi--hero">
              <span className="fkpi__label">Plant OEE</span>
              <span className="fkpi__value">{Math.round(oee)}<small>%</small></span>
            </div>
            <div className="fkpi">
              <span className="fkpi__label">Units today</span>
              <span className="fkpi__value">{output.toLocaleString('en-US')}</span>
            </div>
            <button className="fkpi fkpi--alert" onClick={() => api.current.focus?.(MACHINES.indexOf(alerts[0]))} aria-label={`${alerts.length} active alert. Show ${alerts[0].name}`}>
              <span className="fkpi__label"><AlertTriangle aria-hidden="true" /> Alerts</span>
              <span className="fkpi__value">{alerts.length}<small> · {warnings.length} warning</small></span>
            </button>
          </div>

          {!interacted && !sel && (
            <div className="vtour__hint" aria-hidden="true">
              <Hand /> Drag to orbit · {touch ? 'Tap' : 'Click'} a machine for live data
            </div>
          )}

          <div ref={tipRef} className={`ctour__tip${hov ? ' is-on' : ''}`} aria-hidden="true">
            {hov && (
              <>
                <strong>{hov.name}</strong>
                <StatusPill status={hov.status} />
                <span>{hov.line} · {Math.round(data[hov.id].thr.at(-1))} units/h</span>
                <em>Click for live data</em>
              </>
            )}
          </div>

          <div className="ctour__legend" aria-label="Machine status">
            {Object.entries(STATUS).map(([k, s]) => {
              const I = STATUS_ICON[k]
              return (
                <span key={k}><I aria-hidden="true" style={{ color: s.color }} />{s.label}</span>
              )
            })}
          </div>

          <div className="ctour__tools">
            {sel ? (
              <button className="chip ctour__back" onClick={() => api.current.focus?.(null)}>
                <ArrowLeft /> Plant overview
              </button>
            ) : (
              <>
                <label className="visually-hidden" htmlFor="machine-picker">Inspect a machine</label>
                <select
                  id="machine-picker"
                  className="ctour__select"
                  value=""
                  onChange={(e) => e.target.value !== '' && api.current.focus?.(Number(e.target.value))}
                >
                  <option value="">Inspect a machine…</option>
                  {MACHINES.map((m, i) => (
                    <option key={m.id} value={i}>{m.name}, {STATUS[m.status].label}</option>
                  ))}
                </select>
              </>
            )}
            <div className="ctour__zoom">
              <button className="chip vtour__btn" onClick={() => api.current.zoom?.(sel ? -3 : -12)} aria-label="Zoom in"><Plus /></button>
              <button className="chip vtour__btn" onClick={() => api.current.zoom?.(sel ? 3 : 12)} aria-label="Zoom out"><Minus /></button>
            </div>
          </div>

          {/* Machine panel */}
          {sel && (
            <aside className="fpanel" aria-label={`${sel.name} live data`}>
              <div className="fpanel__head">
                <div>
                  <span className="fpanel__eyebrow">{sel.line} · {sel.id}</span>
                  <h3>{sel.name}</h3>
                </div>
                <span className="fpanel__headright">
                  <StatusPill status={sel.status} />
                  <button className="fpanel__close" onClick={() => api.current.focus?.(null)} aria-label="Close machine panel" title="Close"><X aria-hidden="true" /></button>
                </span>
              </div>
              {sel.alert && (
                <p className={`fpanel__alert fpanel__alert--${sel.status}`}>
                  <AlertTriangle aria-hidden="true" /> {sel.alert}
                </p>
              )}
              <div className="fpanel__tiles">
                {METRICS.map((mt) => {
                  const vals = data[sel.id][mt.key]
                  const now = vals.at(-1)
                  const over = mt.limit != null && now > mt.limit
                  return (
                    <div key={mt.key} className="ftile">
                      <span className="ftile__label">{mt.label}</span>
                      <span className="ftile__value">
                        {now.toFixed(mt.digits)}
                        <small> {mt.unit}</small>
                        {over && <span className="ftile__flag"><AlertTriangle aria-hidden="true" /> Over limit</span>}
                      </span>
                      <Sparkline values={vals} limit={mt.limit} unit={mt.unit} digits={mt.digits} label={mt.label} />
                    </div>
                  )
                })}
              </div>
              <div className="fpanel__foot">
                <span className="fpanel__maint">
                  <Wrench aria-hidden="true" />
                  {sel.maint === 0 ? 'Maintenance overdue' : `Next service in ${sel.maint} days`}
                </span>
                {orders[sel.id] ? (
                  <span className="fpanel__done" role="status"><Check aria-hidden="true" /> {orders[sel.id]} created</span>
                ) : (
                  <button
                    className="ctour__cta"
                    onClick={() => setOrders((o) => ({ ...o, [sel.id]: `Work order WO-${1040 + Object.keys(o).length + 2}` }))}
                  >
                    <Wrench aria-hidden="true" /> {sel.status === 'alert' ? 'Create work order' : 'Schedule service'}
                  </button>
                )}
              </div>
              <p className="fpanel__note">Simulated live data, updated every second.</p>
            </aside>
          )}
        </>
      )}
    </div>
  )
}
