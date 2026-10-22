import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const HIDDEN_KEY = 'vz-robot-hidden'
const GREETED_KEY = 'vz-robot-greeted'
const CORNER_KEY = 'vz-robot-corner'
const NAV_H = 64

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function read(key) {
  try { return sessionStorage.getItem(key) } catch { return null }
}
function write(key, value) {
  try { sessionStorage.setItem(key, value) } catch { /* private mode: keep it in memory only */ }
}

// Apple's momentum projection (Designing Fluid Interfaces sample code).
function project(velocity, rate = 0.998) {
  return ((velocity / 1000) * rate) / (1 - rate)
}

// The further past the edge, the less the robot follows the finger.
function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

function dims() {
  return window.innerWidth < 640 ? { w: 124, h: 150, m: 12 } : { w: 180, h: 216, m: 20 }
}

function cornerPoints(d) {
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const left = d.m
  const right = vw - d.w - d.m
  const top = NAV_H + d.m
  const bottom = vh - d.h - d.m
  return { tl: { x: left, y: top }, tr: { x: right, y: top }, bl: { x: left, y: bottom }, br: { x: right, y: bottom } }
}

export default function RobotCompanion() {
  const [hidden, setHidden] = useState(() => read(HIDDEN_KEY) === '1')
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [bubble, setBubble] = useState(false)
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const handleRef = useRef(null)
  const waveRef = useRef(null)

  // Load three.js only once the page has settled, so the robot never competes with first paint.
  useEffect(() => {
    if (hidden) return
    const start = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(start, 900)
    return () => clearTimeout(id)
  }, [hidden])

  useEffect(() => {
    if (!ready || hidden) return
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const { createRobotScene, Spring } = await import('./robotScene.js')
      if (disposed) return
      const wrap = wrapRef.current
      const canvas = canvasRef.current
      const handle = handleRef.current
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let d = dims()
      let ctx
      try {
        ctx = createRobotScene(canvas, { width: d.w, height: d.h })
      } catch {
        setHidden(true) // no WebGL: quietly skip the mascot
        return
      }
      const { parts } = ctx

      let corner = read(CORNER_KEY) || 'br'
      const start = cornerPoints(d)[corner] || cornerPoints(d).br
      // Reposition like iOS picture-in-picture: critically damped, response 0.4.
      const posX = new Spring(start.x, { damping: 1, response: 0.4 })
      const posY = new Spring(start.y, { damping: 1, response: 0.4 })
      const yaw = new Spring(0, { damping: 1, response: 0.35 })
      const pitch = new Spring(0, { damping: 1, response: 0.35 })
      const bodyYaw = new Spring(0, { damping: 1, response: 0.55 })
      const eyeX = new Spring(0, { damping: 1, response: 0.15 })
      const eyeY = new Spring(0, { damping: 1, response: 0.15 })
      // Lean and tilt come from the user's momentum, so a little overshoot reads as physical.
      const lean = new Spring(0, { damping: 0.75, response: 0.45 })
      const tilt = new Spring(0, { damping: 0.8, response: 0.4 })
      const lift = new Spring(0, { damping: 0.7, response: 0.4 })
      const armL = new Spring(0.32, { damping: 0.6, response: 0.3 })
      const armR = new Spring(-0.32, { damping: 0.8, response: 0.35 })
      const springs = [posX, posY, yaw, pitch, bodyYaw, eyeX, eyeY, lean, tilt, lift, armL, armR]

      const pointer = { x: 0, y: 0, active: false }
      let scrollY = window.scrollY
      let scrollVel = 0
      let waveUntil = 0
      let nextBlink = 2
      let clock = 0
      let last = performance.now()
      let raf = 0
      let dirty = true

      const press = { down: false, dragging: false, id: null, sx: 0, sy: 0, gx: 0, gy: 0, history: [] }

      function placeWrap() {
        wrap.style.transform = `translate3d(${posX.value}px, ${posY.value}px, 0)`
        wrap.dataset.side = posY.value < window.innerHeight / 2 ? 'top' : 'bottom'
        wrap.dataset.edge = posX.value + d.w / 2 < document.documentElement.clientWidth / 2 ? 'left' : 'right'
      }

      function wave() {
        waveUntil = clock + 1.6
        lift.velocity += 2.2
        dirty = true
      }
      waveRef.current = wave

      function frame(now) {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        clock += dt

        const sy = window.scrollY
        const rawVel = (sy - scrollY) / Math.max(dt, 1e-3)
        scrollY = sy
        scrollVel += (rawVel - scrollVel) * Math.min(1, dt * 8)

        // Look toward the pointer, measured from the robot's own head on screen.
        const cx = posX.value + d.w / 2
        const cy = posY.value + d.h * 0.3
        if (pointer.active && !press.dragging) {
          const dx = (pointer.x - cx) / window.innerWidth
          const dy = (pointer.y - cy) / window.innerHeight
          yaw.target = clamp(dx * 2.2, -0.55, 0.55)
          pitch.target = clamp(dy * 1.8, -0.35, 0.5)
          eyeX.target = clamp(dx * 0.35, -0.11, 0.11)
          eyeY.target = clamp(-dy * 0.25, -0.07, 0.07)
        } else {
          // No pointer (touch, or it left the window): follow the scroll instead.
          yaw.target = 0
          pitch.target = clamp(scrollVel * 0.0002, -0.2, 0.22)
          eyeX.target = 0
          eyeY.target = clamp(-scrollVel * 0.00008, -0.07, 0.07)
        }
        bodyYaw.target = yaw.target * 0.35

        if (!press.dragging) {
          tilt.target = clamp(scrollVel * 0.0002, -0.2, 0.2)
          lift.target = clamp(-scrollVel * 0.00018, -0.22, 0.22)
          const speed = Math.abs(posX.velocity)
          lean.target = clamp(-posX.velocity * 0.0005, -0.45, 0.45) * (speed > 20 ? 1 : 0)
        }

        const waving = clock < waveUntil
        armL.target = waving ? 2.45 + Math.sin(clock * 13) * 0.28 : 0.32 + clamp(Math.abs(scrollVel) * 0.0002, 0, 0.35)
        armR.target = -0.32 - clamp(Math.abs(scrollVel) * 0.0002, 0, 0.35)

        if (reduce) {
          for (const s of springs) { s.value = s.target; s.velocity = 0 }
        } else {
          for (const s of springs) s.step(dt)
        }

        const p = parts
        const bob = reduce ? 0 : Math.sin(clock * 1.7) * 0.07
        p.root.position.y = bob + lift.value
        p.root.rotation.z = lean.value
        p.root.rotation.x = tilt.value
        p.root.rotation.y = bodyYaw.value
        p.neck.rotation.y = yaw.value - bodyYaw.value
        p.neck.rotation.x = pitch.value
        p.neck.rotation.z = waving && !reduce ? Math.sin(clock * 6.5) * 0.08 : 0
        p.eyes.position.x = eyeX.value
        p.eyes.position.y = eyeY.value
        p.armL.rotation.z = armL.value
        p.armR.rotation.z = armR.value
        p.armL.rotation.x = p.armR.rotation.x = -clamp(Math.abs(scrollVel) * 0.0003, 0, 0.5)
        if (!reduce) {
          p.legL.rotation.x = Math.sin(clock * 1.7 + 0.6) * 0.09 + tilt.value * 0.6
          p.legR.rotation.x = Math.sin(clock * 1.7 + 1.2) * 0.09 + tilt.value * 0.6
          // Antennas trail the head a beat behind: secondary motion from head velocity.
          p.antennas[0].rotation.z = -0.22 - yaw.velocity * 0.05
          p.antennas[1].rotation.z = 0.22 - yaw.velocity * 0.05
          p.antennas[0].rotation.x = p.antennas[1].rotation.x = -pitch.velocity * 0.06
        }

        // Blink every few seconds
        let blink = 1
        if (!reduce) {
          if (clock > nextBlink) {
            const k = (clock - nextBlink) / 0.16
            blink = k < 1 ? Math.abs(Math.cos(k * Math.PI)) * 0.9 + 0.1 : 1
            if (k >= 1) nextBlink = clock + 2.5 + Math.random() * 3.5
          }
        }
        for (const eye of p.eyeMeshes) eye.scale.y = blink

        const height = p.root.position.y
        p.shadow.scale.setScalar(1 - clamp(height, -0.3, 0.4) * 0.6)
        p.shadow.material.opacity = 0.85 - clamp(height, -0.3, 0.4)

        if (!press.dragging) placeWrap()

        const moving = !reduce || dirty || press.dragging || springs.some((s) => !s.resting)
        if (moving) ctx.render()
        dirty = false
        raf = requestAnimationFrame(frame)
      }

      // ── Pointer: look-at ──
      const onPointerMove = (e) => {
        if (e.pointerType === 'touch') return
        pointer.x = e.clientX
        pointer.y = e.clientY
        pointer.active = true
        dirty = true
      }
      const onPointerLeave = () => { pointer.active = false; dirty = true }

      // ── Drag: 1:1 tracking, respecting the grab offset ──
      const onDown = (e) => {
        if (e.button !== 0) return
        handle.setPointerCapture(e.pointerId)
        press.down = true
        press.dragging = false
        press.id = e.pointerId
        press.sx = e.clientX
        press.sy = e.clientY
        press.gx = e.clientX - posX.value
        press.gy = e.clientY - posY.value
        press.history = [{ x: e.clientX, y: e.clientY, t: performance.now() }]
        wrap.classList.add('is-pressed')
        setBubble(false)
      }
      const onMove = (e) => {
        if (!press.down || e.pointerId !== press.id) return
        const now = performance.now()
        press.history.push({ x: e.clientX, y: e.clientY, t: now })
        while (press.history.length > 2 && now - press.history[0].t > 100) press.history.shift()
        if (!press.dragging && Math.hypot(e.clientX - press.sx, e.clientY - press.sy) < 8) return
        if (!press.dragging) {
          press.dragging = true
          wrap.classList.add('is-dragging')
        }
        const vw = document.documentElement.clientWidth
        const vh = window.innerHeight
        const minX = 0, maxX = vw - d.w, minY = NAV_H, maxY = vh - d.h
        let x = e.clientX - press.gx
        let y = e.clientY - press.gy
        if (x < minX) x = minX - rubberband(minX - x, vw)
        if (x > maxX) x = maxX + rubberband(x - maxX, vw)
        if (y < minY) y = minY - rubberband(minY - y, vh)
        if (y > maxY) y = maxY + rubberband(y - maxY, vh)
        posX.value = posX.target = x
        posY.value = posY.target = y
        const v = velocity()
        posX.velocity = v.x
        posY.velocity = v.y
        lean.target = clamp(-v.x * 0.0006, -0.5, 0.5)
        tilt.target = clamp(v.y * 0.0004, -0.35, 0.35)
        placeWrap()
      }
      const velocity = () => {
        const h = press.history
        if (h.length < 2) return { x: 0, y: 0 }
        const a = h[0], b = h[h.length - 1]
        const dt = Math.max(1, b.t - a.t) / 1000
        return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt }
      }
      const onUp = (e) => {
        if (!press.down || e.pointerId !== press.id) return
        press.down = false
        wrap.classList.remove('is-pressed', 'is-dragging')
        if (!press.dragging) {
          if (e.type === 'pointerup') wave()
          return
        }
        press.dragging = false
        // Throw toward where the gesture was going, then hand off its velocity to the spring.
        const v = velocity()
        const px = posX.value + project(v.x)
        const py = posY.value + project(v.y)
        const points = cornerPoints(d)
        let best = 'br', bestDist = Infinity
        for (const [name, pt] of Object.entries(points)) {
          const dist = Math.hypot(pt.x - px, pt.y - py)
          if (dist < bestDist) { best = name; bestDist = dist }
        }
        corner = best
        write(CORNER_KEY, corner)
        posX.target = points[corner].x
        posY.target = points[corner].y
        posX.velocity = v.x
        posY.velocity = v.y
        lean.target = 0
        tilt.target = 0
        dirty = true
      }

      const onResize = () => {
        const next = dims()
        if (next.w !== d.w || next.h !== d.h) {
          d = next
          ctx.resize(d.w, d.h)
        }
        const pt = cornerPoints(d)[corner]
        posX.target = pt.x
        posY.target = pt.y
        dirty = true
      }
      const onScroll = () => { dirty = true }

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', onPointerLeave)
      window.addEventListener('blur', onPointerLeave)
      window.addEventListener('resize', onResize)
      window.addEventListener('scroll', onScroll, { passive: true })
      handle.addEventListener('pointerdown', onDown)
      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
      handle.addEventListener('pointercancel', onUp)

      placeWrap()
      ctx.render()
      raf = requestAnimationFrame(frame)
      setLoaded(true)

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('pointermove', onPointerMove)
        document.documentElement.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('blur', onPointerLeave)
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onScroll)
        handle.removeEventListener('pointerdown', onDown)
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
        handle.removeEventListener('pointercancel', onUp)
        waveRef.current = null
        ctx.dispose()
      }
    })()

    return () => {
      disposed = true
      cleanup()
    }
  }, [ready, hidden])

  // Say hello once per visit, then get out of the way.
  useEffect(() => {
    if (!loaded || read(GREETED_KEY)) return
    const show = setTimeout(() => {
      write(GREETED_KEY, '1')
      setBubble(true)
      waveRef.current?.()
    }, 900)
    return () => clearTimeout(show)
  }, [loaded])

  useEffect(() => {
    if (!bubble) return
    const id = setTimeout(() => setBubble(false), 6000)
    return () => clearTimeout(id)
  }, [bubble])

  if (hidden || !ready) return null

  return (
    <div ref={wrapRef} className={`robot${loaded ? ' is-ready' : ''}`}>
      <div className="robot__body">
        <canvas ref={canvasRef} className="robot__canvas" aria-hidden="true" />
        <div ref={handleRef} className="robot__handle" aria-hidden="true" title="Drag me anywhere, or tap to say hi" />
      </div>
      <p className={`robot__bubble${bubble ? ' is-visible' : ''}`} aria-hidden={!bubble}>
        Hi! I’ll follow you around. Drag me anywhere.
      </p>
      <button
        type="button"
        className="robot__hide"
        aria-label="Hide the robot"
        onClick={() => {
          write(HIDDEN_KEY, '1')
          setHidden(true)
        }}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  )
}
