import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { EYE, LAMP_SPOTS, NODES, STOPS, UNITS, buildCompound, buildInterior, findPath } from './zayedScene.js'

// Rendering + camera choreography for the compound. React owns the UI; this owns the canvas.
// Modes: 'aerial' (orbit the masterplan) → 'flying' (seamless swoop) → 'ground' (first person).

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t) => Math.min(1, Math.max(0, t))
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function createExperience({ canvas, container, pinRoot, quality = 'high', embedded = false, on }) {
  const rm = reducedMotion()
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.82
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false // geometry is static: render the sun's shadow map once
  renderer.shadowMap.needsUpdate = true

  const { scene, houses, lamps, M, H } = buildCompound(THREE)
  const sun = scene.children.find((o) => o.isDirectionalLight && o.castShadow)
  const sunDir = sun.position.clone().normalize()

  // Physical sky, also used as the image-based light so materials pick up its colour
  const sky = new Sky()
  sky.scale.setScalar(4000)
  const su = sky.material.uniforms
  su.turbidity.value = 3.2
  su.rayleigh.value = 1.1
  su.mieCoefficient.value = 0.004
  su.mieDirectionalG.value = 0.82
  su.sunPosition.value.copy(sunDir)
  scene.add(sky)
  const envScene = new THREE.Scene()
  const envSky = new Sky()
  envSky.scale.setScalar(50)
  Object.entries(su).forEach(([k, u]) => (envSky.material.uniforms[k].value = u.value?.clone ? u.value.clone() : u.value))
  envScene.add(envSky)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(envScene, 0, 0.1, 100).texture
  scene.environmentIntensity = 0.42
  pmrem.dispose()
  scene.children.filter((o) => o.isHemisphereLight).forEach((h) => (h.intensity = 0.3))
  sun.intensity = 3.4
  sun.color.set('#fff0d6')
  scene.fog.color.set('#cfdde8')

  let markTexture = null
  new THREE.TextureLoader().load(embedded ? '/brand/mark-white.png' : '/mark-white.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    markTexture = t
  })

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000)
  camera.rotation.order = 'YXZ'

  // Post-processing: ambient occlusion for contact shading, then tone mapping/output
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const gtao = new GTAOPass(scene, camera, 1, 1)
  gtao.blendIntensity = 0.9
  composer.addPass(gtao)
  const baseOverride = gtao.overrideVisibility.bind(gtao)
  gtao.overrideVisibility = () => {
    baseOverride()
    scene.traverse((o) => {
      if (o.userData.noAO) o.visible = false
    })
  }
  composer.addPass(new OutputPass())
  const setAO = (mode) =>
    gtao.updateGtaoMaterial(mode === 'ground' ? { radius: 0.45, thickness: 1, distanceExponent: 1.5, scale: 1 } : { radius: 3.5, thickness: 4, distanceExponent: 2, scale: 1 })
  setAO('aerial')

  const S = {
    mode: 'aerial',
    quality,
    theta: 0.95,
    phi: 1.08,
    radius: 210,
    target: new THREE.Vector3(0, 0, -4),
    autoSpin: !rm,
    house: null,
    houseIndex: null,
    interior: null,
    rings: [],
    fly: null,
    walk: null,
    orbitTo: null,
    stop: 'front',
    x: 0,
    z: 0,
    yaw: 0,
    pitch: 0,
    vYaw: 0,
    hover: null,
    ringHover: null,
    visible: true,
  }

  const aerialPos = (theta = S.theta, phi = S.phi, radius = S.radius, target = S.target) =>
    new THREE.Vector3(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta),
    )

  const applyQuality = () => {
    const dpr = Math.min(window.devicePixelRatio, S.quality === 'high' ? 1.5 : 1.25)
    renderer.setPixelRatio(dpr)
    composer.setPixelRatio(dpr)
    resize()
  }
  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  applyQuality()

  // ── Floor hotspot rings for the active villa ──
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

  const nodeWorld = (key, y = 0) => S.house.toWorld(NODES[key].pos, y)
  const nodeYaw = (key) => NODES[key].yaw + S.house.rot

  const setMode = (m) => {
    S.mode = m
    setAO(m === 'ground' ? 'ground' : 'aerial')
    on.mode?.(m)
  }

  // ── Transitions ──
  const enterHouse = (i) => {
    if (S.mode !== 'aerial' || S.orbitTo) return
    const house = houses[i]
    S.house = house
    S.houseIndex = i
    S.interior = buildInterior(THREE, M, H, markTexture)
    house.group.add(S.interior)
    S.rings = makeRings(house)
    LAMP_SPOTS.forEach(([lx, y, lz], k) => {
      lamps[k].position.copy(house.toWorld([lx, lz], y))
      lamps[k].intensity = 4
    })
    S.saved = { theta: S.theta, phi: S.phi, radius: S.radius, target: S.target.clone() }
    S.autoSpin = false
    S.hover = null
    on.hover?.(null)
    S.stop = 'front'
    on.unit?.(i)
    on.stop?.('front')
    const P1 = house.toWorld(NODES.front.pos, EYE)
    const T1 = house.toWorld(NODES.front.lookAt ?? [0, 0], 2.1)
    setMode('flying')
    S.fly = {
      P0: camera.position.clone(),
      C: house.toWorld([0, 38], 30),
      P1,
      T0: S.target.clone(),
      T1,
      fov0: camera.fov,
      fov1: 70,
      t0: performance.now(),
      dur: rm ? 0 : 3600,
      onEnd: () => {
        const d = T1.clone().sub(P1)
        S.x = P1.x
        S.z = P1.z
        S.yaw = Math.atan2(-d.x, -d.z)
        S.pitch = Math.asin(d.y / d.length())
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
    setMode('flying')
    S.fly = {
      P0,
      C: S.house.toWorld([0, 38], 30),
      P1: aerialPos(theta, phi, radius, target),
      T0: P0.clone().add(dir.multiplyScalar(8)),
      T1: target.clone(),
      fov0: camera.fov,
      fov1: 45,
      t0: performance.now(),
      dur: rm ? 0 : 3200,
      onEnd: () => {
        S.rings.forEach((r) => S.house.group.remove(r))
        S.house.group.remove(S.interior)
        S.interior.traverse((o) => o.geometry?.dispose())
        S.rings = []
        S.interior = null
        S.house = null
        S.houseIndex = null
        lamps.forEach((l) => (l.intensity = 0))
        Object.assign(S, { theta, phi, radius })
        S.target.copy(target)
        setMode('aerial')
        on.unit?.(null)
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
    on.stop?.(key)
    S.vYaw = 0
    if (rm) {
      S.x = pts.at(-1)[0]
      S.z = pts.at(-1)[1]
      S.yaw += dYaw
      then?.()
      return
    }
    S.walk = { pts, lens, total, startYaw: S.yaw, dYaw, startPitch: S.pitch, t0: performance.now(), dur: Math.min(4200, Math.max(900, total * 520)), then }
    on.moving?.(true)
  }

  // Intro → masterplan framing
  const orbitTo = ({ theta = S.theta, phi, radius, target = S.target }, dur = 2200) => {
    S.orbitTo = { from: { theta: S.theta, phi: S.phi, radius: S.radius, target: S.target.clone() }, theta, phi, radius, target: target.clone(), t0: performance.now(), dur: rm ? 0 : dur }
  }

  // ── Per-frame ──
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
      on.moving?.(false)
      w.then?.()
    }
  }

  // HTML hotspot pins: villa pins from the air, room pins on the ground
  const pinEls = () => pinRoot.querySelectorAll('[data-pin]')
  const occluder = new THREE.Raycaster()
  const nbCache = {}
  const neighbours = (from) =>
    (nbCache[from] ||= new Set(
      STOPS.filter((k) => {
        if (k === from) return false
        const path = findPath(from, k)
        return path && path.slice(1, -1).every((n) => !STOPS.includes(n))
      }),
    ))
  const v3 = new THREE.Vector3()
  const updatePins = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    pinEls().forEach((el) => {
      const [kind, id] = el.dataset.pin.split(':')
      let world = null
      if (kind === 'unit' && S.mode === 'aerial') {
        houses[+id].group.getWorldPosition(v3)
        world = v3.set(v3.x, 9.5, v3.z)
      } else if (kind === 'room' && S.mode === 'ground' && S.house && id !== S.stop && neighbours(S.stop).has(id)) {
        world = nodeWorld(id, 1.25)
      }
      if (!world) {
        el.style.visibility = 'hidden'
        return
      }
      const dist = world.distanceTo(camera.position)
      const p = world.clone().project(camera)
      const behind = p.z > 1
      if (behind || (kind === 'room' && dist > 16)) {
        el.style.visibility = 'hidden'
        return
      }
      let occluded = false
      if (kind === 'room') {
        occluder.set(camera.position, world.clone().sub(camera.position).normalize())
        occluder.far = dist - 0.3
        occluded = occluder.intersectObject(S.house.group, true).some((hit) => hit.object.visible && hit.object.material?.opacity !== 0 && !hit.object.material?.transparent)
      }
      if (occluded && dist > 7) {
        el.style.visibility = 'hidden'
        return
      }
      el.style.visibility = 'visible'
      el.dataset.occluded = occluded ? 'true' : 'false'
      el.style.transform = `translate(${((p.x + 1) / 2) * w}px, ${((1 - p.y) / 2) * h}px)`
    })
  }

  let dragging = null
  const frame = (now) => {
    if (S.fly) stepFly(now)
    else if (S.mode === 'aerial') {
      if (S.orbitTo) {
        const o = S.orbitTo
        const t = o.dur ? clamp01((now - o.t0) / o.dur) : 1
        const e = easeInOut(t)
        S.theta = o.from.theta + (o.theta - o.from.theta) * e
        S.phi = o.from.phi + (o.phi - o.from.phi) * e
        S.radius = o.from.radius + (o.radius - o.from.radius) * e
        S.target.lerpVectors(o.from.target, o.target, e)
        if (t >= 1) S.orbitTo = null
      } else {
        if (S.autoSpin) S.theta += 0.0005
        if (Math.abs(S.vYaw) > 0.00005 && !dragging) {
          S.theta += S.vYaw
          S.vYaw *= 0.93
        }
      }
      camera.position.copy(aerialPos())
      camera.lookAt(S.target)
      if (camera.fov !== 45) {
        camera.fov = 45
        camera.updateProjectionMatrix()
      }
    } else if (S.mode === 'ground') {
      if (S.walk) stepWalk(now)
      else if (Math.abs(S.vYaw) > 0.0001 && !dragging) {
        S.yaw += S.vYaw
        S.vYaw *= 0.92
      }
      camera.position.set(S.x, EYE, S.z)
      camera.rotation.set(S.pitch, S.yaw, 0)
    }

    houses.forEach((hs, i) => {
      const lit = S.mode === 'aerial' && S.hover === i
      hs.roofMat.emissive.set(lit ? '#3b82c4' : '#000000')
      hs.roofMat.emissiveIntensity = lit ? 0.55 : 0
      hs.disc.visible = S.mode !== 'ground'
    })
    const phase = (now % 1800) / 1800
    S.rings.forEach((r) => {
      r.visible = S.mode === 'ground' && r.userData.key !== S.stop
      r.userData.halo.scale.setScalar(1 + phase * 0.6)
      r.userData.halo.material.opacity = 0.7 * (1 - phase)
      r.scale.setScalar(S.ringHover === r.userData.key ? 1.15 : 1)
    })

    if (S.quality === 'high') composer.render()
    else renderer.render(scene, camera)
    updatePins()
    on.frame?.(S)
  }

  // ── Input ──
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const picks = houses.map((h) => h.pick)
  const cast = (ev, targets) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    return raycaster.intersectObjects(targets, false)[0]
  }
  const pickHouse = (ev) => cast(ev, picks)?.object.userData.unit ?? null
  const pickRing = (ev) => cast(ev, S.rings.filter((r) => r.visible).map((r) => r.userData.hit))?.object.userData.stop ?? null

  const onDown = (ev) => {
    if (S.fly) return
    dragging = { lx: ev.clientX, ly: ev.clientY, lt: performance.now(), moved: 0 }
    canvas.setPointerCapture(ev.pointerId)
    S.autoSpin = false
    S.orbitTo = null
    S.vYaw = 0
    on.interact?.()
  }
  const onMove = (ev) => {
    if (!dragging) {
      if (S.fly || ev.pointerType !== 'mouse') return
      if (S.mode === 'aerial') setHover(pickHouse(ev))
      else S.ringHover = pickRing(ev)
      canvas.style.cursor = (S.mode === 'aerial' ? S.hover !== null : S.ringHover) ? 'pointer' : 'grab'
      return
    }
    const dx = ev.clientX - dragging.lx
    const dy = ev.clientY - dragging.ly
    dragging.moved += Math.abs(dx) + Math.abs(dy)
    const now = performance.now()
    if (S.mode === 'aerial') {
      S.theta -= dx * 0.005
      S.phi = Math.min(1.3, Math.max(0.3, S.phi - dy * 0.004))
      S.vYaw = ((-dx * 0.005) / Math.max(8, now - dragging.lt)) * 16
    } else if (S.mode === 'ground' && !S.walk) {
      const k = 0.0042 * (camera.fov / 70)
      S.yaw += dx * k
      S.pitch = Math.min(0.6, Math.max(-0.7, S.pitch + dy * k))
      S.vYaw = ((dx * k) / Math.max(8, now - dragging.lt)) * 16
    }
    dragging.lx = ev.clientX
    dragging.ly = ev.clientY
    dragging.lt = now
    canvas.style.cursor = 'grabbing'
  }
  const onUp = (ev) => {
    if (!dragging) return
    const click = dragging.moved < 6
    dragging = null
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
  const onWheel = (ev) => {
    if (S.mode !== 'aerial') return
    if (embedded && !(ev.ctrlKey || ev.metaKey)) return
    ev.preventDefault()
    S.autoSpin = false
    S.radius = Math.min(260, Math.max(55, S.radius * (1 + Math.sign(ev.deltaY) * 0.08)))
  }
  const setHover = (h) => {
    if (h === S.hover) return
    S.hover = h
    on.hover?.(h)
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onUp)
  canvas.addEventListener('pointerleave', () => setHover(null))
  canvas.addEventListener('wheel', onWheel, { passive: false })

  let raf = 0
  const io = new IntersectionObserver(([e]) => (S.visible = e.isIntersecting))
  io.observe(container)
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (!document.hidden && S.visible) frame(now)
  }
  frame(performance.now())
  raf = requestAnimationFrame(loop)

  return {
    units: UNITS,
    start: () => orbitTo({ theta: 0.6, phi: 0.88, radius: 165, target: new THREE.Vector3(0, 0, -4) }),
    enterHouse,
    exitHouse,
    walkTo,
    setHover,
    stop: () => S.stop,
    zoom: (f) => {
      if (S.mode !== 'aerial') return
      S.autoSpin = false
      S.radius = Math.min(260, Math.max(55, S.radius * f))
    },
    look: (d, dp = 0) => {
      S.autoSpin = false
      if (S.mode === 'aerial') S.theta -= d
      else if (S.mode === 'ground') {
        S.yaw += d
        S.pitch = Math.min(0.6, Math.max(-0.7, S.pitch + dp))
      }
    },
    setQuality: (q) => {
      S.quality = q
      applyQuality()
    },
    debug: { S, frame },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('wheel', onWheel)
      scene.traverse((o) => {
        o.geometry?.dispose()
        const m = o.material
        ;(Array.isArray(m) ? m : m ? [m] : []).forEach((mm) => {
          mm.map?.dispose()
          mm.dispose()
        })
      })
      composer.dispose()
      renderer.dispose()
    },
  }
}
