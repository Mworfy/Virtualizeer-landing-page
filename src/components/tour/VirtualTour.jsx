import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react'
import { EYE, HUB, POINTS, WALLS } from './scene.js'

// Interactive first-person tour of a small apartment, rendered with Three.js.
// Drag (or arrow keys) to look around; click the floor rings or use the arrows to move between rooms.

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function VirtualTour({ label = 'Interactive 3D virtual tour', compact = false }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const markerRef = useRef(null)
  const api = useRef({})
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [room, setRoom] = useState(0)
  const [moving, setMoving] = useState(false)
  const [interacted, setInteracted] = useState(false)

  useEffect(() => {
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      let THREE, buildScene
      try {
        THREE = await import('three')
        ;({ buildScene } = await import('./scene.js'))
      } catch {
        setStatus('error')
        return
      }
      if (disposed) return

      const canvas = canvasRef.current
      const wrap = wrapRef.current
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
      } catch {
        setStatus('error')
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05

      const markTexture = await new THREE.TextureLoader().loadAsync('/brand/mark-white.png').catch(() => null)
      if (markTexture) markTexture.colorSpace = THREE.SRGBColorSpace
      if (disposed) return renderer.dispose()

      const scene = buildScene(THREE, { markTexture })
      const camera = new THREE.PerspectiveCamera(compact ? 72 : 68, 1, 0.05, 50)
      camera.rotation.order = 'YXZ'

      // Camera state
      const state = {
        x: POINTS[0].pos[0],
        z: POINTS[0].pos[1],
        yaw: POINTS[0].yaw,
        pitch: -0.08,
        vYaw: 0,
        current: 0,
        anim: null,
        autoSpin: !reducedMotion(),
        visible: true,
      }

      // Floor hotspots
      const hotspots = POINTS.map((p, i) => {
        const g = new THREE.Group()
        const basic = (color, opacity) =>
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
        const disc = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), basic('#0f2a40', 0.55))
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.38, 64), basic('#ffffff', 1))
        const dot = new THREE.Mesh(new THREE.CircleGeometry(0.08, 32), basic('#ffffff', 1))
        const halo = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.42, 64), basic('#ffffff', 0.6))
        const hit = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), basic('#ffffff', 0))
        ;[disc, ring, dot, halo, hit].forEach((m, k) => {
          m.rotation.x = -Math.PI / 2
          m.position.y = k * 0.002
          m.userData.index = i
          g.add(m)
        })
        g.position.set(p.pos[0], 0.015, p.pos[1])
        g.userData = { ring, halo, hit }
        scene.add(g)
        return g
      })
      const hitTargets = hotspots.map((h) => h.userData.hit)

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

      // Movement between points, routed through the hub so we walk through doorways
      const goTo = (index) => {
        if (index === state.current || state.anim) return
        const target = POINTS[index]
        const path = [[state.x, state.z], HUB, target.pos]
        const lens = [Math.hypot(path[1][0] - path[0][0], path[1][1] - path[0][1]), Math.hypot(path[2][0] - path[1][0], path[2][1] - path[1][1])]
        const total = lens[0] + lens[1]
        let dYaw = (target.yaw - state.yaw) % (Math.PI * 2)
        if (dYaw > Math.PI) dYaw -= Math.PI * 2
        if (dYaw < -Math.PI) dYaw += Math.PI * 2
        state.current = index
        state.autoSpin = false
        state.vYaw = 0
        setRoom(index)
        if (reducedMotion()) {
          state.x = target.pos[0]
          state.z = target.pos[1]
          state.yaw += dYaw
          return
        }
        state.anim = {
          path, lens, total, startYaw: state.yaw, dYaw, startPitch: state.pitch,
          t0: performance.now(), dur: Math.min(2400, Math.max(1000, total * 480)),
        }
        setMoving(true)
      }

      const stepAnim = (now) => {
        const a = state.anim
        const t = Math.min(1, (now - a.t0) / a.dur)
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        let d = e * a.total
        const seg = d <= a.lens[0] || a.lens[1] === 0 ? 0 : 1
        if (seg === 1) d -= a.lens[0]
        const segLen = a.lens[seg] || 1
        const [x0, z0] = a.path[seg]
        const [x1, z1] = a.path[seg + 1]
        state.x = x0 + ((x1 - x0) * d) / segLen
        state.z = z0 + ((z1 - z0) * d) / segLen
        state.yaw = a.startYaw + a.dYaw * e
        state.pitch = a.startPitch + (-0.08 - a.startPitch) * e
        if (t >= 1) {
          state.anim = null
          setMoving(false)
        }
      }

      // Pointer: drag to look, click a ring to move
      const raycaster = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      let drag = null
      let hovered = null
      const pick = (ev) => {
        const r = canvas.getBoundingClientRect()
        ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        const hit = raycaster.intersectObjects(hitTargets, false).find((h) => h.object.userData.index !== state.current)
        return hit ? hit.object.userData.index : null
      }
      const onDown = (ev) => {
        drag = { x: ev.clientX, y: ev.clientY, lx: ev.clientX, lt: performance.now(), moved: 0 }
        canvas.setPointerCapture(ev.pointerId)
        state.autoSpin = false
        state.vYaw = 0
        setInteracted(true)
      }
      const onMove = (ev) => {
        if (!drag) {
          hovered = ev.pointerType === 'mouse' ? pick(ev) : null
          canvas.style.cursor = hovered !== null ? 'pointer' : 'grab'
          return
        }
        const dx = ev.clientX - drag.lx
        const dy = ev.clientY - (drag.ly ?? drag.y)
        drag.moved += Math.abs(dx) + Math.abs(dy)
        const k = 0.0042 * (camera.fov / 70)
        if (!state.anim) {
          state.yaw += dx * k
          state.pitch = Math.max(-0.7, Math.min(0.6, state.pitch + dy * k))
        }
        const now = performance.now()
        state.vYaw = (dx * k) / Math.max(8, now - drag.lt) * 16
        drag.lx = ev.clientX
        drag.ly = ev.clientY
        drag.lt = now
        canvas.style.cursor = 'grabbing'
      }
      const onUp = (ev) => {
        if (!drag) return
        const wasClick = drag.moved < 6
        drag = null
        canvas.style.cursor = 'grab'
        if (wasClick) {
          state.vYaw = 0
          const i = pick(ev)
          if (i !== null) goTo(i)
        }
      }
      canvas.addEventListener('pointerdown', onDown)
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerup', onUp)
      canvas.addEventListener('pointercancel', onUp)

      // Render loop — paused while off-screen or tab hidden
      let raf = 0
      const minimapDot = markerRef.current
      const frame = (now) => {
        if (state.anim) stepAnim(now)
        else {
          if (state.autoSpin) state.yaw += 0.0012
          if (Math.abs(state.vYaw) > 0.0001 && !drag) {
            state.yaw += state.vYaw
            state.vYaw *= 0.92
          }
        }
        camera.position.set(state.x, EYE, state.z)
        camera.rotation.set(state.pitch, state.yaw, 0)
        const phase = (now % 1800) / 1800
        hotspots.forEach((h, i) => {
          h.visible = i !== state.current
          const { halo } = h.userData
          halo.scale.setScalar(1 + phase * 0.6)
          halo.material.opacity = 0.7 * (1 - phase)
          h.scale.setScalar(i === hovered ? 1.15 : 1)
        })
        renderer.render(scene, camera)
        if (minimapDot) {
          minimapDot.setAttribute('transform', `translate(${(state.x + 5) * 10} ${(state.z + 3) * 10}) rotate(${(-state.yaw * 180) / Math.PI})`)
        }
      }
      const loop = (now) => {
        raf = requestAnimationFrame(loop)
        if (state.visible) frame(now)
      }
      frame(performance.now())
      raf = requestAnimationFrame(loop)
      if (import.meta.env.DEV) window.__vtour = { frame, state, goTo: (i) => goTo(i) }
      const io = new IntersectionObserver(([en]) => (state.visible = en.isIntersecting))
      io.observe(wrap)

      api.current = {
        goTo,
        look: (dYaw, dPitch = 0) => {
          state.autoSpin = false
          state.yaw += dYaw
          state.pitch = Math.max(-0.7, Math.min(0.6, state.pitch + dPitch))
        },
        current: () => state.current,
      }
      setStatus('ready')

      cleanup = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        io.disconnect()
        canvas.removeEventListener('pointerdown', onDown)
        canvas.removeEventListener('pointermove', onMove)
        canvas.removeEventListener('pointerup', onUp)
        canvas.removeEventListener('pointercancel', onUp)
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
  }, [compact])

  const step = useCallback((dir) => {
    const cur = api.current.current?.() ?? 0
    api.current.goTo?.((cur + dir + POINTS.length) % POINTS.length)
    setInteracted(true)
  }, [])

  const onKeyDown = (e) => {
    const map = { ArrowLeft: [0.15, 0], ArrowRight: [-0.15, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }
    if (map[e.key] && api.current.look) {
      e.preventDefault()
      api.current.look(...map[e.key])
      setInteracted(true)
    }
  }

  return (
    <div
      ref={wrapRef}
      className={`vtour${status === 'ready' ? ' is-ready' : ''}${compact ? ' vtour--compact' : ''}`}
      role="region"
      aria-label={label}
    >
      <canvas
        ref={canvasRef}
        className="vtour__canvas"
        tabIndex={0}
        aria-label="3D view. Use the arrow keys to look around and the room buttons to move."
        onKeyDown={onKeyDown}
      />

      {status !== 'ready' && (
        <div className="vtour__loading" aria-live="polite">
          {status === 'error' ? 'Your browser can’t display the 3D tour.' : <span className="vtour__spinner" aria-label="Loading tour" />}
        </div>
      )}

      <div className="viewer__bar">
        <span className="chip chip--live">Live tour</span>
        <span className="chip" aria-live="polite">{POINTS[room].name} · {room + 1} of {POINTS.length}</span>
      </div>

      {status === 'ready' && !interacted && (
        <div className="vtour__hint" aria-hidden="true">
          <Hand /> Drag to look around · Tap a ring to move
        </div>
      )}

      {status === 'ready' && (
        <div className="vtour__nav">
          <button className="chip vtour__btn" onClick={() => step(-1)} disabled={moving} aria-label="Previous room">
            <ChevronLeft />
          </button>
          <span className="vtour__room">{POINTS[room].name}</span>
          <button className="chip vtour__btn" onClick={() => step(1)} disabled={moving} aria-label="Next room">
            <ChevronRight />
          </button>
        </div>
      )}

      <div className="viewer__minimap" aria-hidden="true">
        <svg viewBox="-4 -4 108 108" width="100%" height="100%">
          <g stroke="#fff" strokeOpacity=".75" strokeWidth="2.2" strokeLinecap="round">
            {WALLS.map(([x1, z1, x2, z2], i) => (
              <line key={i} x1={(x1 + 5) * 10} y1={(z1 + 3) * 10} x2={(x2 + 5) * 10} y2={(z2 + 3) * 10} />
            ))}
          </g>
          {POINTS.map((p, i) => (
            <circle key={i} cx={(p.pos[0] + 5) * 10} cy={(p.pos[1] + 3) * 10} r="3" fill="#fff" fillOpacity={i === room ? 0 : 0.45} />
          ))}
          <g ref={markerRef} transform={`translate(${(POINTS[0].pos[0] + 5) * 10} ${(POINTS[0].pos[1] + 3) * 10})`}>
            <path d="M0 0 L-12 -22 A25 25 0 0 1 12 -22 Z" fill="#8fd3ff" fillOpacity=".55" />
            <circle r="4.5" fill="#fff" />
          </g>
        </svg>
      </div>
    </div>
  )
}
