import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { COMPOUNDS, DISTRICTS, LANDMARK_MODELS } from './data.js'
import { ROADS } from '../zayed/NewZayedMap.jsx'
import { noiseTexture } from '../zayed/textures.js'

// New Zayed Atlas, stylised 3D regional map. Map space (1000 × 560) maps 1:1 onto world x/z.
const W = (mx, my, y = 0) => new THREE.Vector3(mx - 500, y, my - 280)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function seeded(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}
function inPoly([x, y], poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
export const compoundRadius = (c) => (c.acres ? Math.min(13, 5 + Math.sqrt(c.acres) * 0.38) : 6.5)

export function createAtlas({ canvas, container, pinRoot, quality = 'high', on = {} }) {
  const rm = reducedMotion()
  const rnd = seeded(21)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#efe4d0', 600, 1500)
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o })
  const M = {
    desert: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#e9dcc2', { repeat: 220, light: 0.07, dark: 0.07, seed: 31 }), roughness: 1 }),
    focus: std('#f7f1e5', { roughness: 1 }),
    city: std('#e3d9c6', { roughness: 1 }),
    future: std('#ece2cf', { roughness: 1 }),
    villasGround: std('#dfe2c9', { roughness: 1 }),
    lawn: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#a3c58a', { repeat: 4, light: 0.08, dark: 0.1, seed: 32 }), roughness: 1 }),
    road: std('#ffffff', { roughness: 0.8 }),
    highway: std('#1d3a53', { roughness: 0.7 }),
    ring: std('#d9d3c6', { roughness: 0.8 }),
    gold: std('#c9a35a', { roughness: 0.4, metalness: 0.3 }),
    building: std('#ffffff', { roughness: 0.75 }),
    block: std('#ffffff', { roughness: 0.6 }),
    leaf: std('#ffffff', { roughness: 0.85 }),
    trunk: std('#7a5a3c'),
    water: std('#5aa9d6', { roughness: 0.1, metalness: 0.1 }),
    tarmac: std('#4d5560', { roughness: 0.9 }),
    stripe: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    stone: std('#d9c39a', { roughness: 0.95 }),
    glass: std('#2a4a66', { roughness: 0.15, metalness: 0.4 }),
  }
  const mesh = (geo, mat, parent = scene, { cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, mat)
    m.castShadow = cast
    m.receiveShadow = receive
    parent.add(m)
    return m
  }
  const flatShape = (poly, mat, y, parent = scene) => {
    const s = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x - 500, -(z - 280))))
    const m = mesh(new THREE.ShapeGeometry(s), mat, parent, { cast: false })
    m.rotation.x = -Math.PI / 2
    m.position.y = y
    return m
  }

  // ── Ground ──
  const ground = mesh(new THREE.PlaneGeometry(4000, 4000), M.desert, scene, { cast: false })
  ground.rotation.x = -Math.PI / 2

  // ── Districts ──
  const dummy = new THREE.Object3D()
  const blocks = [] // { x, z, w, h, d, c }
  const trees = [] // { x, z, s }
  DISTRICTS.forEach((d) => {
    const mat = d.kind === 'focus' ? M.focus : d.kind === 'city' ? M.city : d.kind === 'villas' ? M.villasGround : M.future
    flatShape(d.poly, mat, 0.15)
    if (d.kind === 'focus') return
    const xs = d.poly.map((p) => p[0])
    const ys = d.poly.map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    let placed = 0
    for (let tries = 0; placed < d.density && tries < d.density * 6; tries++) {
      const p = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)]
      if (!inPoly(p, d.poly)) continue
      // leave green pockets and avoid the main roads' corridors roughly
      if (rnd() < 0.08) {
        trees.push({ x: p[0] - 500, z: p[1] - 280, s: 0.8 + rnd() * 0.5 })
        continue
      }
      const tall = d.kind === 'city' && rnd() < 0.25
      blocks.push({
        x: p[0] - 500,
        z: p[1] - 280,
        w: d.kind === 'villas' || d.kind === 'future' ? 1.4 : 1.6 + rnd() * 2.2,
        h: d.kind === 'future' ? 0.8 : tall ? 3 + rnd() * 5 : 0.9 + rnd() * 1.6,
        d: d.kind === 'villas' || d.kind === 'future' ? 1.1 : 1.4 + rnd() * 1.8,
        c: ['#fbf8f2', '#f1ebe0', '#e9e2d4', '#f7f3ec'][Math.floor(rnd() * 4)],
      })
      placed++
    }
    // parks in each city district
    if (d.kind === 'city') {
      for (let k = 0; k < 4; k++) {
        const c = [x0 + (0.25 + rnd() * 0.5) * (x1 - x0), y0 + (0.25 + rnd() * 0.5) * (y1 - y0)]
        if (!inPoly(c, d.poly)) continue
        const park = mesh(new THREE.CircleGeometry(8 + rnd() * 6, 32), M.lawn, scene, { cast: false })
        park.rotation.x = -Math.PI / 2
        park.position.set(c[0] - 500, 0.22, c[1] - 280)
        for (let t = 0; t < 14; t++) trees.push({ x: c[0] - 500 + (rnd() - 0.5) * 14, z: c[1] - 280 + (rnd() - 0.5) * 14, s: 0.8 + rnd() * 0.4 })
      }
    }
  })

  // New Zayed boundary: gold fence of short posts + a low rail
  const nz = DISTRICTS.find((d) => d.kind === 'focus').poly
  const posts = []
  nz.forEach((p, i) => {
    const q = nz[(i + 1) % nz.length]
    const a = W(p[0], p[1])
    const b = W(q[0], q[1])
    const len = a.distanceTo(b)
    const rail = mesh(new THREE.BoxGeometry(len, 0.35, 0.35), M.gold, scene, { cast: false })
    rail.position.copy(a.clone().lerp(b, 0.5)).setY(0.6)
    rail.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x)
    for (let t = 0; t < len; t += 3) posts.push(a.clone().lerp(b, t / len))
  })
  const postMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), M.gold, posts.length)
  posts.forEach((p, i) => {
    dummy.position.set(p.x, 0.6, p.z)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.set(1, 1, 1)
    dummy.updateMatrix()
    postMesh.setMatrixAt(i, dummy.matrix)
  })
  scene.add(postMesh)

  // ── Roads: ribbons along the shared map paths ──
  const svg = `<svg xmlns="http://www.w3.org/2000/svg">${ROADS.map((r) => `<path d="${r.d}"/>`).join('')}</svg>`
  const parsed = new SVGLoader().parse(svg)
  const ribbon = (pts, width, mat, y) => {
    const pos = []
    const idx = []
    pts.forEach((p, i) => {
      const prev = pts[Math.max(0, i - 1)]
      const next = pts[Math.min(pts.length - 1, i + 1)]
      const dx = next.x - prev.x
      const dz = next.y - prev.y
      const l = Math.hypot(dx, dz) || 1
      const nx = (-dz / l) * (width / 2)
      const nz2 = (dx / l) * (width / 2)
      pos.push(p.x - 500 + nx, y, p.y - 280 + nz2, p.x - 500 - nx, y, p.y - 280 - nz2)
      if (i) {
        const k = i * 2
        idx.push(k - 2, k - 1, k, k - 1, k + 1, k)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    const m = mesh(g, mat, scene, { cast: false })
    m.material.side = THREE.DoubleSide
    m.material.polygonOffset = true
    m.material.polygonOffsetFactor = -2
    m.material.polygonOffsetUnits = -2
    return m
  }
  const roadLabels = []
  parsed.paths.forEach((path, i) => {
    const r = ROADS[i]
    path.subPaths.forEach((sp) => {
      const pts = sp.getSpacedPoints(Math.max(40, Math.round(sp.getLength() / 4)))
      if (r.major) {
        ribbon(pts, 7, M.road, 0.8)
        ribbon(pts, 4.2, M.highway, 1.0)
      } else ribbon(pts, 3, M.road, 0.8)
      const mid = pts[Math.floor(pts.length * 0.42)]
      roadLabels.push({ id: `r${i}`, name: r.name, pos: W(mid.x, mid.y, 1) })
    })
  })

  // ── Landmarks ──
  LANDMARK_MODELS.forEach((l) => {
    const g = new THREE.Group()
    g.position.copy(W(l.pos[0], l.pos[1]))
    scene.add(g)
    if (l.kind === 'airport') {
      g.rotation.y = 0.32
      const apron = mesh(new THREE.PlaneGeometry(70, 34), M.city, g, { cast: false })
      apron.rotation.x = -Math.PI / 2
      apron.position.y = 0.2
      ;[-7, 7].forEach((z) => {
        const rw = mesh(new THREE.PlaneGeometry(66, 3.4), M.tarmac, g, { cast: false })
        rw.rotation.x = -Math.PI / 2
        rw.position.set(0, 0.24, z)
        for (let x = -30; x <= 30; x += 4) {
          const s = mesh(new THREE.PlaneGeometry(2, 0.25), M.stripe, g, { cast: false, receive: false })
          s.rotation.x = -Math.PI / 2
          s.position.set(x, 0.26, z)
        }
      })
      const term = mesh(new THREE.BoxGeometry(18, 2.2, 4), M.block, g)
      term.position.set(0, 1.1, -14)
      const glass = mesh(new THREE.BoxGeometry(18.2, 1.2, 4.2), M.glass, g)
      glass.position.set(0, 1.2, -14)
      const tower = mesh(new THREE.CylinderGeometry(0.6, 0.8, 7, 12), M.block, g)
      tower.position.set(12, 3.5, -12)
      const cab = mesh(new THREE.CylinderGeometry(1.3, 1.1, 1.2, 12), M.glass, g)
      cab.position.set(12, 7.4, -12)
      // a few parked aircraft
      ;[-6, 0, 6].forEach((x) => {
        const body = mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 10), M.block, g)
        body.rotation.z = Math.PI / 2
        body.position.set(x, 0.6, -9.5)
        const wing = mesh(new THREE.BoxGeometry(0.9, 0.1, 5), M.block, g)
        wing.position.set(x, 0.55, -9.5)
      })
    } else if (l.kind === 'pyramids') {
      ;[[0, 0, 8.5], [-9, 6, 7.8], [-15, 11, 4.4]].forEach(([x, z, h]) => {
        const p = mesh(new THREE.ConeGeometry(h * 1.1, h, 4), M.stone, g)
        p.rotation.y = Math.PI / 4
        p.position.set(x, h / 2, z)
      })
    } else if (l.kind === 'museum') {
      const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(22, 0), new THREE.Vector2(22, 4.5)])
      const wedge = mesh(new THREE.ExtrudeGeometry(s, { depth: 12, bevelEnabled: false }), M.stone, g)
      wedge.position.set(-11, 0, -6)
      const plaza = mesh(new THREE.PlaneGeometry(30, 22), M.city, g, { cast: false })
      plaza.rotation.x = -Math.PI / 2
      plaza.position.y = 0.2
    } else if (l.kind === 'mall') {
      const m = mesh(new THREE.BoxGeometry(16, 2.6, 10), M.block, g)
      m.position.y = 1.3
      const roof = mesh(new THREE.BoxGeometry(6, 0.6, 6), M.glass, g)
      roof.position.y = 2.9
      const park = mesh(new THREE.PlaneGeometry(26, 8), M.tarmac, g, { cast: false })
      park.rotation.x = -Math.PI / 2
      park.position.set(0, 0.2, 10)
    } else if (l.kind === 'campus') {
      const lake = mesh(new THREE.CircleGeometry(6, 32), M.water, g, { cast: false })
      lake.rotation.x = -Math.PI / 2
      lake.position.y = 0.24
      const lawn = mesh(new THREE.CircleGeometry(16, 40), M.lawn, g, { cast: false })
      lawn.rotation.x = -Math.PI / 2
      lawn.position.y = 0.21
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2
        blocks.push({ x: g.position.x + Math.cos(a) * 11, z: g.position.z + Math.sin(a) * 11, w: 3, h: 1.6 + (k % 3), d: 2, c: '#ffffff' })
      }
    }
  })

  // ── Compounds: lawn plot, inner loop road, clubhouse, instanced homes, trees ──
  const picks = []
  const rings = {}
  const homesV = []
  const homesA = []
  COMPOUNDS.forEach((c) => {
    const r = compoundRadius(c)
    const center = W(c.pos[0], c.pos[1])
    const g = new THREE.Group()
    g.position.copy(center)
    scene.add(g)
    const lawn = mesh(new THREE.CircleGeometry(r, 48), M.lawn, g, { cast: false })
    lawn.rotation.x = -Math.PI / 2
    lawn.position.y = 0.24
    const loop = mesh(new THREE.RingGeometry(r * 0.55, r * 0.55 + 0.7, 48), M.ring, g, { cast: false })
    loop.rotation.x = -Math.PI / 2
    loop.position.y = 0.27
    const club = mesh(new THREE.BoxGeometry(2.2, 0.9, 1.6), M.block, g)
    club.position.y = 0.55
    const pool = mesh(new THREE.PlaneGeometry(1.8, 0.9), M.water, g, { cast: false })
    pool.rotation.x = -Math.PI / 2
    pool.position.set(0, 0.29, 1.5)
    // homes on a sunflower spiral, skipping the centre and the loop road
    const n = Math.round(Math.min(90, Math.max(18, (c.acres ?? 45) * 0.42)))
    for (let k = 0; k < n; k++) {
      const rr = r * 0.92 * Math.sqrt((k + 0.5) / n)
      if (rr < r * 0.22 || Math.abs(rr - r * 0.57) < 0.9) continue
      const a = k * 2.39996
      const x = center.x + Math.cos(a) * rr
      const z = center.z + Math.sin(a) * rr
      const apt = c.category === 'apartments' || (c.category === 'mixed' && k % 3 === 0)
      ;(apt ? homesA : homesV).push({ x, z, rot: -a, h: apt ? 1.6 + (k % 4) * 0.5 : 0.75, concept: c.concept })
    }
    for (let k = 0; k < Math.round(r * 2.2); k++) {
      const a = (k / Math.round(r * 2.2)) * Math.PI * 2
      trees.push({ x: center.x + Math.cos(a) * r * 0.97, z: center.z + Math.sin(a) * r * 0.97, s: 0.45 + rnd() * 0.2 })
    }
    const ring = mesh(new THREE.RingGeometry(r + 0.4, r + 1.3, 64), new THREE.MeshBasicMaterial({ color: c.concept ? '#2f6fa8' : '#c9a35a', transparent: true, opacity: 0.95, depthWrite: false }), g, { cast: false, receive: false })
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.31
    ring.visible = !!c.concept
    rings[c.id] = ring
    const pick = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 4, 24), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }))
    pick.position.y = 2
    pick.userData.id = c.id
    pick.userData.noAO = true
    g.add(pick)
    picks.push(pick)
  })

  // ── Instancing ──
  const inst = (geo, mat, list, setup, colors) => {
    const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length))
    im.count = list.length
    list.forEach((it, i) => {
      setup(it)
      dummy.updateMatrix()
      im.setMatrixAt(i, dummy.matrix)
      if (colors) im.setColorAt(i, new THREE.Color(typeof colors === 'function' ? colors(it) : colors[i % colors.length]))
    })
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    im.castShadow = true
    im.receiveShadow = true
    scene.add(im)
    return im
  }
  const box = new THREE.BoxGeometry(1, 1, 1)
  box.translate(0, 0.5, 0)
  inst(box, M.block, blocks, (b) => {
    dummy.position.set(b.x, 0.15, b.z)
    dummy.rotation.set(0, 0.3, 0)
    dummy.scale.set(b.w, b.h, b.d)
  }, (b) => b.c)
  inst(box, M.building, homesV, (h) => {
    dummy.position.set(h.x, 0.24, h.z)
    dummy.rotation.set(0, h.rot, 0)
    dummy.scale.set(1.15, h.h, 0.85)
  }, (h) => (h.concept ? '#e8d6b8' : '#fbf7ef'))
  inst(box, M.building, homesA, (h) => {
    dummy.position.set(h.x, 0.24, h.z)
    dummy.rotation.set(0, h.rot, 0)
    dummy.scale.set(1.8, h.h, 1.1)
  }, ['#ffffff', '#f3eee4'])
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1, 6)
  trunkGeo.translate(0, 0.5, 0)
  inst(trunkGeo, M.trunk, trees, (t) => {
    dummy.position.set(t.x, 0, t.z)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.set(t.s, t.s, t.s)
  })
  inst(new THREE.IcosahedronGeometry(0.9, 1), M.leaf, trees, (t) => {
    dummy.position.set(t.x, 1.45 * t.s, t.z)
    dummy.rotation.set(0, t.x, 0)
    dummy.scale.set(t.s, t.s * 1.05, t.s)
  }, ['#4d7d45', '#5b8d4f', '#6f9a58', '#3f6b3d', '#7aa463'])

  // ── Sky, light, environment ──
  const sky = new Sky()
  sky.scale.setScalar(6000)
  const su = sky.material.uniforms
  su.turbidity.value = 4
  su.rayleigh.value = 1.3
  su.mieCoefficient.value = 0.004
  su.mieDirectionalG.value = 0.82
  const sunDir = new THREE.Vector3(0.45, 0.62, 0.35).normalize()
  su.sunPosition.value.copy(sunDir)
  scene.add(sky)
  const envScene = new THREE.Scene()
  const envSky = new Sky()
  envSky.scale.setScalar(50)
  Object.entries(su).forEach(([k, u]) => (envSky.material.uniforms[k].value = u.value?.clone ? u.value.clone() : u.value))
  envScene.add(envSky)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(envScene, 0, 0.1, 100).texture
  scene.environmentIntensity = 0.5
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight('#f4f8ff', '#cdbb9a', 0.55))
  const sun = new THREE.DirectionalLight('#fff1d8', 3.0)
  const nzCenter = W(318, 252)
  sun.position.copy(nzCenter).add(sunDir.clone().multiplyScalar(260))
  sun.target.position.copy(nzCenter)
  sun.castShadow = true
  sun.shadow.mapSize.set(4096, 4096)
  Object.assign(sun.shadow.camera, { left: -170, right: 170, top: 140, bottom: -140, near: 20, far: 600 })
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.04
  scene.add(sun, sun.target)

  // ── Camera, controls, post processing ──
  const camera = new THREE.PerspectiveCamera(42, 1, 2, 6000)
  const controls = new MapControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 30
  controls.maxDistance = 900
  controls.maxPolarAngle = 1.22
  controls.screenSpacePanning = false
  controls.zoomToCursor = true
  camera.position.copy(nzCenter).add(new THREE.Vector3(260, 520, 520))
  controls.target.copy(nzCenter).add(new THREE.Vector3(140, 0, 20))
  controls.update()
  const BOUNDS = { x0: -560, x1: 560, z0: -330, z1: 330 }
  controls.addEventListener('change', () => {
    const t = controls.target
    const cx = Math.min(BOUNDS.x1, Math.max(BOUNDS.x0, t.x))
    const cz = Math.min(BOUNDS.z1, Math.max(BOUNDS.z0, t.z))
    if (cx !== t.x || cz !== t.z) {
      camera.position.x += cx - t.x
      camera.position.z += cz - t.z
      t.set(cx, t.y, cz)
    }
  })
  controls.addEventListener('start', () => {
    S.fly = null
    S.autoSpin = false
    on.interact?.()
  })

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const gtao = new GTAOPass(scene, camera, 1, 1)
  gtao.updateGtaoMaterial({ radius: 2.2, thickness: 3, distanceExponent: 2, scale: 1 })
  gtao.blendIntensity = 0.85
  composer.addPass(gtao)
  // invisible pick volumes must not cast ambient occlusion
  const baseOverride = gtao.overrideVisibility.bind(gtao)
  gtao.overrideVisibility = () => {
    baseOverride()
    picks.forEach((p) => (p.visible = false))
  }
  composer.addPass(new OutputPass())

  const S = { quality, fly: null, autoSpin: !rm, hover: null, selected: null, visible: true }
  const resize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio, S.quality === 'high' ? 1.5 : 1.15)
    renderer.setPixelRatio(dpr)
    composer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(container)

  // ── Fly to ──
  const flyTo = (target, distance, { polar = 0.95, dur = 1600 } = {}) => {
    const fromT = controls.target.clone()
    const fromP = camera.position.clone()
    const az = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z)
    const toP = target.clone().add(new THREE.Vector3(Math.sin(az) * Math.sin(polar), Math.cos(polar), Math.cos(az) * Math.sin(polar)).multiplyScalar(distance))
    S.autoSpin = false
    S.fly = { fromT, fromP, toT: target.clone(), toP, t0: performance.now(), dur: rm ? 0 : dur }
  }
  const focusCompound = (id) => {
    const c = COMPOUNDS.find((x) => x.id === id)
    if (!c) return
    flyTo(W(c.pos[0], c.pos[1]), 34 + compoundRadius(c) * 3.2)
  }
  const select = (id) => {
    S.selected = id
    Object.entries(rings).forEach(([k, r]) => (r.visible = k === id || k === S.hover || COMPOUNDS.find((c) => c.id === k)?.concept))
    if (id) focusCompound(id)
  }
  const setHover = (id) => {
    if (S.hover === id) return
    S.hover = id
    Object.entries(rings).forEach(([k, r]) => (r.visible = k === id || k === S.selected || COMPOUNDS.find((c) => c.id === k)?.concept))
    on.hover?.(id)
  }

  // ── Picking ──
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const pickAt = (ev) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    return raycaster.intersectObjects(picks, false)[0]?.object.userData.id ?? null
  }
  let down = null
  const onDown = (ev) => (down = { x: ev.clientX, y: ev.clientY })
  const onUp = (ev) => {
    if (!down) return
    const moved = Math.abs(ev.clientX - down.x) + Math.abs(ev.clientY - down.y)
    down = null
    if (moved > 5) return
    const id = pickAt(ev)
    if (id) on.select?.(id)
  }
  const onMove = (ev) => {
    if (ev.pointerType !== 'mouse' || ev.buttons) return
    const id = pickAt(ev)
    setHover(id)
    canvas.style.cursor = id ? 'pointer' : 'grab'
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointermove', onMove)

  // ── Labels (DOM pins positioned each frame) ──
  const anchors = {}
  COMPOUNDS.forEach((c) => (anchors[`c:${c.id}`] = W(c.pos[0], c.pos[1], 3)))
  LANDMARK_MODELS.forEach((l) => (anchors[`l:${l.id}`] = W(l.pos[0], l.pos[1], l.kind === 'airport' ? 9 : 10)))
  DISTRICTS.forEach((d) => {
    const cx = d.poly.reduce((s, p) => s + p[0], 0) / d.poly.length
    const cy = d.poly.reduce((s, p) => s + p[1], 0) / d.poly.length
    anchors[`d:${d.id}`] = W(cx, d.id === 'newzayed' ? cy - 38 : cy, 2)
  })
  roadLabels.forEach((r) => (anchors[`r:${r.id}`] = r.pos))
  const v = new THREE.Vector3()
  // label priority: selected, hovered, concept, then larger compounds
  const prio = Object.fromEntries(COMPOUNDS.map((c) => [c.id, (c.acres ?? 20) + (c.concept ? 1000 : 0)]))
  const updatePins = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    const dist = camera.position.distanceTo(controls.target)
    // Collision based decluttering for compound labels
    const placed = []
    const cEls = [...pinRoot.querySelectorAll('[data-pin^="c:"]')]
      .map((el) => {
        const id = el.dataset.pin.slice(2)
        const score = id === S.selected ? 1e6 : id === S.hover ? 1e5 : prio[id] ?? 0
        return { el, id, score }
      })
      .sort((p, q) => q.score - p.score)
    cEls.forEach(({ el, id }) => {
      v.copy(anchors[el.dataset.pin]).project(camera)
      const x = ((v.x + 1) / 2) * w
      const y = ((1 - v.y) / 2) * h
      const lw = el.dataset.lw ? +el.dataset.lw : 170
      const rect = [x - 12, y - 18, x + lw, y + 18]
      const forced = id === S.selected || id === S.hover
      const free = !placed.some((r) => rect[0] < r[2] && rect[2] > r[0] && rect[1] < r[3] && rect[3] > r[1])
      const compact = !forced && (dist > 420 || !free)
      el.dataset.compact = compact ? 'true' : 'false'
      if (!compact) {
        placed.push(rect)
        if (!el.dataset.lw) el.dataset.lw = String(Math.max(80, el.offsetWidth))
      } else placed.push([x - 9, y - 9, x + 9, y + 9])
    })
    pinRoot.querySelectorAll('[data-pin]').forEach((el) => {
      const a = anchors[el.dataset.pin]
      if (!a) return
      v.copy(a).project(camera)
      if (v.z > 1 || v.x < -1.2 || v.x > 1.2 || v.y < -1.2 || v.y > 1.2) {
        el.style.visibility = 'hidden'
        return
      }
      const kind = el.dataset.pin[0]
      const id = el.dataset.pin.slice(2)
      const near = a.distanceTo(camera.position)
      let show = true
      if (kind === 'r') show = dist < 520
      if (kind === 'd' && id !== 'newzayed') show = dist > 140 || near > 160
      el.style.visibility = show ? 'visible' : 'hidden'
      el.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`
      el.style.zIndex = String(10000 - Math.round(near))
    })
  }

  // ── Loop ──
  const io = new IntersectionObserver(([e]) => (S.visible = e.isIntersecting))
  io.observe(container)
  let raf = 0
  const frame = (now) => {
    if (S.fly) {
      const f = S.fly
      const t = f.dur ? Math.min(1, (now - f.t0) / f.dur) : 1
      const e = easeInOut(t)
      controls.target.lerpVectors(f.fromT, f.toT, e)
      camera.position.lerpVectors(f.fromP, f.toP, e)
      if (t >= 1) S.fly = null
    } else if (S.autoSpin) {
      const t = controls.target
      const off = camera.position.clone().sub(t)
      off.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.0006)
      camera.position.copy(t).add(off)
    }
    controls.update()
    if (S.quality === 'high') composer.render()
    else renderer.render(scene, camera)
    updatePins()
  }
  const loop = (now) => {
    raf = requestAnimationFrame(loop)
    if (S.visible && !document.hidden) frame(now)
  }
  frame(performance.now())
  raf = requestAnimationFrame(loop)

  return {
    start: () => flyTo(nzCenter.clone().add(new THREE.Vector3(8, 0, 0)), 260, { polar: 0.9, dur: 2400 }),
    overview: () => flyTo(W(520, 300), 720, { polar: 0.8, dur: 1800 }),
    focusNewZayed: () => flyTo(nzCenter, 240, { polar: 0.9 }),
    flyToLandmark: (id) => {
      const l = LANDMARK_MODELS.find((x) => x.id === id) || DISTRICTS.find((x) => x.id === id)
      if (!l) return
      const p = l.pos ?? [l.poly.reduce((s, q) => s + q[0], 0) / l.poly.length, l.poly.reduce((s, q) => s + q[1], 0) / l.poly.length]
      flyTo(W(p[0], p[1]), l.pos ? 110 : 260)
    },
    select,
    setHover,
    zoom: (f) => {
      const off = camera.position.clone().sub(controls.target).multiplyScalar(f)
      const d = off.length()
      if (d < controls.minDistance || d > controls.maxDistance) return
      flyTo(controls.target.clone(), d, { polar: Math.acos(off.y / d), dur: 400 })
    },
    setQuality: (q) => {
      S.quality = q
      resize()
    },
    debug: { S, frame, camera, controls, rings },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      controls.dispose()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointermove', onMove)
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
