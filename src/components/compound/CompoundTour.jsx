import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Hand, Minus, Plus } from 'lucide-react'
import * as mod from './compoundScene.js'
import { EYE, NODES, STATUS, STOPS, UNITS, UNIT_SPEC, findPath, planLines } from './compoundScene.js'

// Off-plan sales demo: bird's-eye masterplan → click a villa → seamless fly-down to
// first person → walk inside. Rendered with Three.js, loaded on demand.

const touch = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t) => Math.min(1, Math.max(0, t))

export default function CompoundTour() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const tipRef = useRef(null)
  const markerRef = useRef(null)
  const api = useRef({})
  const [status, setStatus] = useState('loading')
  const [mode, setMode] = useState('aerial') // aerial | flying | ground
  const [unitIdx, setUnitIdx] = useState(null)
  const [hover, setHover] = useState(null)
  const [stop, setStop] = useState('front')
  const [moving, setMoving] = useState(false)
  const [interacted, setInteracted] = useState(false)
  const plan = useMemo(() => planLines(), [])

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
      renderer.toneMappingExposure = 1.0
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.shadowMap.autoUpdate = false // sun and buildings are static
      renderer.shadowMap.needsUpdate = true

      const markTexture = await new THREE.TextureLoader().loadAsync('/brand/mark-white.png').catch(() => null)
      if (markTexture) markTexture.colorSpace = THREE.SRGBColorSpace
      if (disposed) return renderer.dispose()

      const { scene, houses, lamps, M, H } = mod.buildCompound(THREE)
      // Image-based lighting: soft sky reflections and bounce light on every surface
      const pmrem = new THREE.PMREMGenerator(renderer)
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environmentIntensity = 0.6
      pmrem.dispose()
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 900)
      camera.rotation.order = 'YXZ'
      const rm = reducedMotion()

      const S = {
        mode: 'aerial',
        theta: 0.75,
        phi: 0.95,
        radius: 135,
        target: new THREE.Vector3(0, 0, -8),
        autoSpin: !rm,
        house: null,
        interior: null,
        rings: [],
        fly: null,
        walk: null,
        stop: 'front',
        x: 0,
        z: 0,
        yaw: 0,
        pitch: 0,
        vYaw: 0,
        visible: true,
        hover: null,
        ringHover: null,
      }

      const aerialPos = (theta = S.theta, phi = S.phi, radius = S.radius, target = S.target) =>
        new THREE.Vector3(
          target.x + radius * Math.sin(phi) * Math.sin(theta),
          target.y + radius * Math.cos(phi),
          target.z + radius * Math.sin(phi) * Math.cos(theta),
        )

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

      // ── Hotspot rings inside the active villa ──
      const ringMat = (color, opacity) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
      const makeRings = (house) =>
        STOPS.map((key) => {
          const g = new THREE.Group()
          const parts = [
            new THREE.Mesh(new THREE.CircleGeometry(0.3, 40), ringMat('#0f2a40', 0.5)),
            new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 56), ringMat('#ffffff', 1)),
            new THREE.Mesh(new THREE.CircleGeometry(0.08, 24), ringMat('#ffffff', 1)),
            new THREE.Mesh(new THREE.RingGeometry(0.36, 0.42, 56), ringMat('#ffffff', 0.6)),
            new THREE.Mesh(new THREE.CircleGeometry(0.6, 20), ringMat('#ffffff', 0)),
          ]
          parts.forEach((m, k) => {
            m.rotation.x = -Math.PI / 2
            m.position.y = k * 0.002
            m.userData.stop = key
            g.add(m)
          })
          const [lx, lz] = NODES[key].pos
          g.position.set(lx, 0.04, lz)
          g.userData = { key, halo: parts[3], hit: parts[4] }
          house.group.add(g)
          return g
        })

      const nodeWorld = (key) => S.house.toWorld(NODES[key].pos)
      const nodeYaw = (key) => NODES[key].yaw + S.house.rot

      // ── Transitions ──
      const enterHouse = (i) => {
        if (S.mode !== 'aerial') return
        const house = houses[i]
        S.house = house
        S.interior = mod.buildInterior(THREE, M, H, markTexture)
        house.group.add(S.interior)
        S.rings = makeRings(house)
        mod.LAMP_SPOTS.forEach(([lx, y, lz], k) => {
          const p = house.toWorld([lx, lz], y)
          lamps[k].position.copy(p)
          lamps[k].intensity = 4
        })
        S.saved = { theta: S.theta, phi: S.phi, radius: S.radius, target: S.target.clone() }
        S.autoSpin = false
        S.hover = null
        setHover(null)
        setUnitIdx(i)
        setStop('front')
        S.stop = 'front'
        const P1 = house.toWorld(NODES.front.pos, EYE)
        const T1 = house.toWorld([0, 0], 2.1)
        S.mode = 'flying'
        setMode('flying')
        S.fly = {
          P0: camera.position.clone(),
          C: house.toWorld([0, 34], 26),
          P1,
          T0: S.target.clone(),
          T1,
          fov0: camera.fov,
          fov1: 70,
          t0: performance.now(),
          dur: rm ? 0 : 3400,
          onEnd: () => {
            const d = T1.clone().sub(P1)
            S.x = P1.x
            S.z = P1.z
            S.yaw = Math.atan2(-d.x, -d.z)
            S.pitch = Math.asin(d.y / d.length())
            S.mode = 'ground'
            setMode('ground')
          },
        }
      }

      const exitHouse = () => {
        if (S.mode !== 'ground' || S.walk) return
        if (S.stop !== 'front') return walkTo('front', exitHouse)
        const P0 = camera.position.clone()
        const dir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation)
        const { theta, phi, radius, target } = S.saved
        S.mode = 'flying'
        setMode('flying')
        S.fly = {
          P0,
          C: S.house.toWorld([0, 34], 26),
          P1: aerialPos(theta, phi, radius, target),
          T0: P0.clone().add(dir.multiplyScalar(8)),
          T1: target.clone(),
          fov0: camera.fov,
          fov1: 50,
          t0: performance.now(),
          dur: rm ? 0 : 3000,
          onEnd: () => {
            S.rings.forEach((r) => S.house.group.remove(r))
            S.house.group.remove(S.interior)
            S.interior.traverse((o) => o.geometry?.dispose())
            S.rings = []
            S.interior = null
            S.house = null
            lamps.forEach((l) => (l.intensity = 0))
            Object.assign(S, { theta, phi, radius })
            S.target.copy(target)
            S.mode = 'aerial'
            setMode('aerial')
            setUnitIdx(null)
          },
        }
      }

      const walkTo = (key, then) => {
        if (S.mode !== 'ground' || S.walk || key === S.stop) return
        const keys = findPath(S.stop, key)
        if (!keys) return
        const pts = keys.map((k) => {
          const p = nodeWorld(k)
          return [p.x, p.z]
        })
        pts[0] = [S.x, S.z]
        const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
        const total = lens.reduce((a, b) => a + b, 0)
        let dYaw = (nodeYaw(key) - S.yaw) % (Math.PI * 2)
        if (dYaw > Math.PI) dYaw -= Math.PI * 2
        if (dYaw < -Math.PI) dYaw += Math.PI * 2
        S.stop = key
        setStop(key)
        S.vYaw = 0
        if (rm) {
          S.x = pts.at(-1)[0]
          S.z = pts.at(-1)[1]
          S.yaw += dYaw
          then?.()
          return
        }
        S.walk = {
          pts, lens, total, startYaw: S.yaw, dYaw, startPitch: S.pitch,
          t0: performance.now(), dur: Math.min(4200, Math.max(900, total * 520)), then,
        }
        setMoving(true)
      }

      // ── Per-frame updates ──
      const stepFly = (now) => {
        const f = S.fly
        const t = f.dur ? clamp01((now - f.t0) / f.dur) : 1
        const e = easeInOut(t)
        const u = 1 - e
        const pos = f.P0.clone().multiplyScalar(u * u).add(f.C.clone().multiplyScalar(2 * u * e)).add(f.P1.clone().multiplyScalar(e * e))
        const tgt = f.T0.clone().lerp(f.T1, easeInOut(clamp01(t * 1.2)))
        camera.position.copy(pos)
        camera.lookAt(tgt)
        camera.fov = f.fov0 + (f.fov1 - f.fov0) * e
        camera.updateProjectionMatrix()
        if (t >= 1) {
          S.fly = null
          f.onEnd()
        }
      }

      const stepWalk = (now) => {
        const w = S.walk
        const t = clamp01((now - w.t0) / w.dur)
        const e = easeInOut(t)
        let d = e * w.total
        let i = 0
        while (i < w.lens.length - 1 && d > w.lens[i]) d -= w.lens[i++]
        const k = w.lens[i] ? d / w.lens[i] : 1
        S.x = w.pts[i][0] + (w.pts[i + 1][0] - w.pts[i][0]) * k
        S.z = w.pts[i][1] + (w.pts[i + 1][1] - w.pts[i][1]) * k
        S.yaw = w.startYaw + w.dYaw * e
        S.pitch = w.startPitch + (-0.06 - w.startPitch) * e
        if (t >= 1) {
          S.walk = null
          setMoving(false)
          w.then?.()
        }
      }

      const tipPos = new THREE.Vector3()
      const frame = (now) => {
        if (S.fly) stepFly(now)
        else if (S.mode === 'aerial') {
          if (S.autoSpin) S.theta += 0.0006
          if (Math.abs(S.vYaw) > 0.00005 && !drag) {
            S.theta += S.vYaw
            S.vYaw *= 0.93
          }
          camera.position.copy(aerialPos())
          camera.lookAt(S.target)
        } else if (S.mode === 'ground') {
          if (S.walk) stepWalk(now)
          else if (Math.abs(S.vYaw) > 0.0001 && !drag) {
            S.yaw += S.vYaw
            S.vYaw *= 0.92
          }
          camera.position.set(S.x, EYE, S.z)
          camera.rotation.set(S.pitch, S.yaw, 0)
        }

        // hover feedback
        houses.forEach((h, i) => {
          const on = S.mode === 'aerial' && S.hover === i
          h.roofMat.emissive.set(on ? '#3b82c4' : '#000000')
          h.roofMat.emissiveIntensity = on ? 0.55 : 0
          h.disc.visible = S.mode !== 'ground'
        })
        const phase = (now % 1800) / 1800
        S.rings.forEach((r) => {
          r.visible = S.mode === 'ground' && r.userData.key !== S.stop
          r.userData.halo.scale.setScalar(1 + phase * 0.6)
          r.userData.halo.material.opacity = 0.7 * (1 - phase)
          r.scale.setScalar(S.ringHover === r.userData.key ? 1.15 : 1)
        })

        renderer.render(scene, camera)

        // tooltip follows the hovered villa
        const tip = tipRef.current
        if (tip) {
          if (S.mode === 'aerial' && S.hover !== null) {
            houses[S.hover].group.getWorldPosition(tipPos)
            tipPos.y = 9
            tipPos.project(camera)
            const x = ((tipPos.x + 1) / 2) * wrap.clientWidth
            const y = ((1 - tipPos.y) / 2) * wrap.clientHeight
            tip.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`
          }
        }
        const mk = markerRef.current
        if (mk && S.house && S.mode === 'ground') {
          const r = S.house.rot
          const dx = S.x - S.house.unit.x
          const dz = S.z - S.house.unit.z
          const lx = dx * Math.cos(r) - dz * Math.sin(r)
          const lz = dx * Math.sin(r) + dz * Math.cos(r)
          mk.setAttribute('transform', `translate(${lx * 10} ${lz * 10}) rotate(${(-(S.yaw - r) * 180) / Math.PI})`)
        }
      }

      // ── Pointer input ──
      const raycaster = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      const picks = houses.map((h) => h.pick)
      let drag = null
      const cast = (ev, targets) => {
        const r = canvas.getBoundingClientRect()
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        return raycaster.intersectObjects(targets, false)[0]
      }
      const pickHouse = (ev) => cast(ev, picks)?.object.userData.unit ?? null
      const pickRing = (ev) => {
        const targets = S.rings.filter((r) => r.visible).map((r) => r.userData.hit)
        return cast(ev, targets)?.object.userData.stop ?? null
      }

      const onDown = (ev) => {
        if (S.fly) return
        drag = { lx: ev.clientX, ly: ev.clientY, lt: performance.now(), moved: 0 }
        canvas.setPointerCapture(ev.pointerId)
        S.autoSpin = false
        S.vYaw = 0
        setInteracted(true)
      }
      const onMove = (ev) => {
        if (!drag) {
          if (S.fly || ev.pointerType !== 'mouse') return
          if (S.mode === 'aerial') {
            const h = pickHouse(ev)
            if (h !== S.hover) {
              S.hover = h
              setHover(h)
            }
            canvas.style.cursor = h !== null ? 'pointer' : 'grab'
          } else {
            S.ringHover = pickRing(ev)
            canvas.style.cursor = S.ringHover ? 'pointer' : 'grab'
          }
          return
        }
        const dx = ev.clientX - drag.lx
        const dy = ev.clientY - drag.ly
        drag.moved += Math.abs(dx) + Math.abs(dy)
        const now = performance.now()
        if (S.mode === 'aerial') {
          S.theta -= dx * 0.005
          S.phi = Math.min(1.3, Math.max(0.35, S.phi - dy * 0.004))
          S.vYaw = ((-dx * 0.005) / Math.max(8, now - drag.lt)) * 16
        } else if (S.mode === 'ground' && !S.walk) {
          const k = 0.0042 * (camera.fov / 70)
          S.yaw += dx * k
          S.pitch = Math.min(0.6, Math.max(-0.7, S.pitch + dy * k))
          S.vYaw = ((dx * k) / Math.max(8, now - drag.lt)) * 16
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
        S.vYaw = 0
        if (S.mode === 'aerial') {
          const h = pickHouse(ev)
          if (h !== null) enterHouse(h)
        } else if (S.mode === 'ground') {
          const key = pickRing(ev)
          if (key) walkTo(key)
        }
      }
      const onLeave = () => {
        if (S.hover !== null) {
          S.hover = null
          setHover(null)
        }
      }
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)
      canvas.addEventListener('pointerleave', onLeave)

      let raf = 0
      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        if (S.visible) frame(now)
      }
      frame(performance.now())
      raf = requestAnimationFrame(loop)
      const io = new IntersectionObserver(([en]) => (S.visible = en.isIntersecting))
      io.observe(wrap)

      api.current = {
        enterHouse,
        exitHouse,
        walkTo,
        stop: () => S.stop,
        zoom: (d) => {
          S.autoSpin = false
          S.radius = Math.min(200, Math.max(60, S.radius + d))
        },
        look: (dy, dp = 0) => {
          if (S.mode === 'aerial') S.theta -= dy
          else if (S.mode === 'ground') {
            S.yaw += dy
            S.pitch = Math.min(0.6, Math.max(-0.7, S.pitch + dp))
          }
          S.autoSpin = false
        },
      }
      if (import.meta.env.DEV) window.__compound = { S, frame, enterHouse, exitHouse, walkTo }
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

  const stepStop = (dir) => {
    const i = STOPS.indexOf(api.current.stop?.() ?? 'front')
    api.current.walkTo?.(STOPS[(i + dir + STOPS.length) % STOPS.length])
  }
  const onKeyDown = (e) => {
    const map = { ArrowLeft: [0.15, 0], ArrowRight: [-0.15, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }
    if (map[e.key]) {
      e.preventDefault()
      api.current.look?.(...map[e.key])
      setInteracted(true)
    }
  }

  const unit = unitIdx !== null ? UNITS[unitIdx] : null
  const hovered = hover !== null ? UNITS[hover] : null

  return (
    <div
      ref={wrapRef}
      className={`vtour ctour${status === 'ready' ? ' is-ready' : ''} ctour--${mode}`}
      role="region"
      aria-label="Interactive off-plan compound tour"
    >
      <canvas
        ref={canvasRef}
        className="vtour__canvas"
        tabIndex={0}
        aria-label="3D view of the compound. Use the arrow keys to look around and the controls to choose a home."
        onKeyDown={onKeyDown}
      />

      {status !== 'ready' && (
        <div className="vtour__loading" aria-live="polite">
          {status === 'error' ? 'Your browser can’t display the 3D tour.' : <span className="vtour__spinner" aria-label="Loading compound" />}
        </div>
      )}

      {status === 'ready' && (
        <>
          {/* Top bar */}
          <div className="ctour__top">
            {mode === 'aerial' ? (
              <span className="chip chip--live">Masterplan · {UNITS.length} villas</span>
            ) : (
              <button className="chip ctour__back" onClick={() => api.current.exitHouse?.()} disabled={mode === 'flying' || moving}>
                <ArrowLeft /> Compound view
              </button>
            )}
            <span className="chip">Off-plan · Delivery {UNIT_SPEC.delivery}</span>
          </div>

          {/* Aerial: hint, tooltip, legend, unit picker */}
          {mode === 'aerial' && (
            <>
              {!interacted && (
                <div className="vtour__hint" aria-hidden="true">
                  <Hand /> Drag to orbit · {touch ? 'Tap' : 'Click'} a home to step inside
                </div>
              )}
              <div ref={tipRef} className={`ctour__tip${hovered ? ' is-on' : ''}`} aria-hidden="true">
                {hovered && (
                  <>
                    <strong>Villa {hovered.id}</strong>
                    <span className="ctour__status" style={{ '--c': STATUS[hovered.status].color }}>{STATUS[hovered.status].label}</span>
                    <span>{UNIT_SPEC.beds} bed · {UNIT_SPEC.area} · {hovered.price}</span>
                    <em>Click to step inside</em>
                  </>
                )}
              </div>
              <div className="ctour__legend" aria-label="Unit availability">
                {Object.values(STATUS).map((s) => (
                  <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>
                ))}
              </div>
              <div className="ctour__tools">
                <label className="visually-hidden" htmlFor="unit-picker">Choose a villa to visit</label>
                <select
                  id="unit-picker"
                  className="ctour__select"
                  value=""
                  onChange={(e) => e.target.value !== '' && api.current.enterHouse?.(Number(e.target.value))}
                >
                  <option value="">Visit a villa…</option>
                  {UNITS.map((u, i) => (
                    <option key={u.id} value={i}>Villa {u.id} — {STATUS[u.status].label}</option>
                  ))}
                </select>
                <div className="ctour__zoom">
                  <button className="chip vtour__btn" onClick={() => api.current.zoom?.(-20)} aria-label="Zoom in"><Plus /></button>
                  <button className="chip vtour__btn" onClick={() => api.current.zoom?.(20)} aria-label="Zoom out"><Minus /></button>
                </div>
              </div>
            </>
          )}

          {/* Ground: unit card, room nav, floor plan */}
          {mode !== 'aerial' && unit && (
            <aside className={`ctour__card${mode === 'ground' ? ' is-on' : ''}`} aria-label={`Villa ${unit.id} details`}>
              <div className="ctour__card-head">
                <strong>Villa {unit.id}</strong>
                <span className="ctour__status" style={{ '--c': STATUS[unit.status].color }}>{STATUS[unit.status].label}</span>
              </div>
              <p>{UNIT_SPEC.type} · {UNIT_SPEC.beds} bedrooms · {UNIT_SPEC.area} · {UNIT_SPEC.plot} plot</p>
              <p className="ctour__price">From {unit.price}</p>
              <Link to="/contact" state={{ service: 'Digital Twins' }} className="ctour__cta">
                Book a viewing <ArrowRight />
              </Link>
            </aside>
          )}

          {mode === 'ground' && (
            <>
              <div className="vtour__nav">
                <button className="chip vtour__btn" onClick={() => stepStop(-1)} disabled={moving} aria-label="Previous room">
                  <ChevronLeft />
                </button>
                <span className="vtour__room" aria-live="polite">{NODES[stop].name}</span>
                <button className="chip vtour__btn" onClick={() => stepStop(1)} disabled={moving} aria-label="Next room">
                  <ChevronRight />
                </button>
              </div>
              <div className="viewer__minimap ctour__plan" aria-hidden="true">
                <svg viewBox="-68 -58 136 176" width="100%" height="100%">
                  <rect x="-60" y="-50" width="120" height="100" fill="#fff" fillOpacity=".08" />
                  <g stroke="#fff" strokeOpacity=".8" strokeWidth="2.2" strokeLinecap="round">
                    {plan.map(([x1, z1, x2, z2], i) => (
                      <line key={i} x1={x1 * 10} y1={z1 * 10} x2={x2 * 10} y2={z2 * 10} />
                    ))}
                  </g>
                  <rect x="-8" y="50" width="16" height="60" fill="#fff" fillOpacity=".15" />
                  {STOPS.map((k) => (
                    <circle key={k} cx={NODES[k].pos[0] * 10} cy={NODES[k].pos[1] * 10} r="3.5" fill="#fff" fillOpacity={k === stop ? 0 : 0.45} />
                  ))}
                  <g ref={markerRef}>
                    <path d="M0 0 L-12 -22 A25 25 0 0 1 12 -22 Z" fill="#8fd3ff" fillOpacity=".55" />
                    <circle r="5" fill="#fff" />
                  </g>
                </svg>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
