// Zayed Reimagined (New Zayed) — procedural compound with its own masterplan and villa type.
// Masterplan: an oval ring road around a central park and lagoon; villas sit outside the ring,
// facing in. Villa: L-shaped courtyard house — day wing + two-storey night tower around a pool.
import { noiseTexture, paverTexture, woodTexture } from './textures.js'

export const EYE = 1.65
const WALL_H = 3.0
const T_EXT = 0.22
const T_INT = 0.12

// ── Masterplan geometry ─────────────────────────────────
const RX = 36 // ring road centreline radii
const RZ = 50
const ROAD = 7
const PLOT_OFFSET = ROAD / 2 + 1.5 + 11 // road half-width + sidewalk + plot front depth

// ── Units ───────────────────────────────────────────────
export const STATUS = {
  available: { label: 'Available', color: '#2fb171' },
  reserved: { label: 'Reserved', color: '#f0a33a' },
  sold: { label: 'Sold', color: '#9aa5b1' },
}
const STATUS_SEQ = ['available', 'sold', 'available', 'reserved', 'available', 'available', 'reserved', 'available', 'sold', 'available']
const ANGLES = [40, 65, 90, 115, 140, -40, -65, -90, -115, -140]

export const UNITS = ANGLES.map((deg, i) => {
  const t = (deg * Math.PI) / 180
  const px = RX * Math.sin(t)
  const pz = -RZ * Math.cos(t)
  let nx = px / (RX * RX)
  let nz = pz / (RZ * RZ)
  const nl = Math.hypot(nx, nz)
  nx /= nl
  nz /= nl
  return {
    id: `V-${String(i + 1).padStart(2, '0')}`,
    x: px + nx * PLOT_OFFSET,
    z: pz + nz * PLOT_OFFSET,
    rot: Math.atan2(-nx, -nz), // local +z (the front door) faces the ring road
    status: STATUS_SEQ[i],
    price: `EGP ${(15.4 + ((i * 7) % 5) * 0.55).toFixed(1)}M`,
    car: i % 2 === 0,
  }
})
export const UNIT_SPEC = { type: 'L-shaped Courtyard Villa', beds: 2, area: '185 m²', plot: '420 m²', delivery: 'Q2 2028', location: 'New Zayed' }

// ── Villa plan (local coords: +z towards the street) ─────
// Day wing x[-7,5] z[1,6]: entrance & dining hall | living + kitchen.
// Night wing x[-7,-1] z[-7,1]: bedroom 2, master bedroom, glazed pool gallery x[-2.4,-1].
// Courtyard with pool x[-1,5] z[-7,1].
const win = (a, b, y0 = 0.9, y1 = 2.4) => ({ a, b, y0, y1, glass: true })
const door = (a, b, y1 = 2.3) => ({ a, b, y0: 0, y1 })
export const HOUSE_WALLS = [
  { axis: 'x', at: 6, from: -7, to: 5, ext: true, openings: [win(-6.4, -5.4), door(-4.7, -3.3, 2.4), win(-0.2, 4.4, 0.3, 2.6)] },
  { axis: 'z', at: 5, from: 1, to: 6, ext: true, openings: [win(1.6, 4.6, 1.1, 2.3)] },
  { axis: 'x', at: 1, from: -1, to: 5, ext: true, openings: [win(-0.6, 4.4, 0.05, 2.6)] },
  { axis: 'z', at: -1, from: -7, to: 1, ext: true, openings: [win(-6.4, 0.4, 0.05, 2.6)] },
  { axis: 'x', at: -7, from: -7, to: -1, ext: true, openings: [] },
  { axis: 'z', at: -7, from: -7, to: 6, ext: true, openings: [win(-6.2, -4.4), win(-2.2, -0.4), win(2.4, 4.6)] },
  { axis: 'x', at: 1, from: -7, to: -2.4, openings: [] },
  { axis: 'z', at: -2.4, from: -7, to: 1, openings: [door(-5, -4), door(-1.6, -0.6)] },
  { axis: 'x', at: -3, from: -7, to: -2.4, openings: [] },
  { axis: 'z', at: -1, from: 1, to: 6, openings: [door(1.6, 4.6, 2.6)] },
]

// Floor-plan lines for the minimap (gaps at doorways)
export function planLines() {
  const lines = []
  HOUSE_WALLS.forEach((w) => {
    let cur = w.from
    const push = (a, b) => {
      if (b - a < 0.01) return
      lines.push(w.axis === 'x' ? [a, w.at, b, w.at] : [w.at, a, w.at, b])
    }
    w.openings.filter((o) => o.y0 < 0.1).sort((a, b) => a.a - b.a).forEach((o) => {
      push(cur, o.a)
      cur = o.b
    })
    push(cur, w.to)
  })
  return lines
}

// Navigation graph (local coords). Unnamed nodes are doorway waypoints.
export const NODES = {
  front: { pos: [-4, 9.5], yaw: 0, name: 'Front garden', lookAt: [-4, 4.5] },
  hall: { pos: [-4, 3.4], yaw: -Math.PI / 2 + 0.35, name: 'Entrance & dining' },
  living: { pos: [0.6, 4.8], yaw: -0.96, name: 'Living room' },
  kitchen: { pos: [2.2, 2.0], yaw: -Math.PI / 2, name: 'Kitchen' },
  gallery: { pos: [-1.7, -1.9], yaw: -Math.PI / 2, name: 'Pool gallery' },
  bed2: { pos: [-3.8, 0.2], yaw: 0.25, name: 'Bedroom 2' },
  master: { pos: [-3.4, -3.6], yaw: 0.35, name: 'Master bedroom' },
  dLiv: { pos: [-1, 3.2] },
  gEntry: { pos: [-1.7, 2.0] },
  gB2: { pos: [-1.7, -1.1] },
  dB2: { pos: [-2.4, -1.1] },
  gMas: { pos: [-1.7, -4.5] },
  dMas: { pos: [-2.4, -4.5] },
}
export const STOPS = ['front', 'hall', 'living', 'kitchen', 'gallery', 'bed2', 'master']
const EDGES = [
  ['front', 'hall'], ['hall', 'dLiv'], ['dLiv', 'living'], ['living', 'kitchen'],
  ['hall', 'gEntry'], ['gEntry', 'gB2'], ['gB2', 'gallery'], ['gB2', 'dB2'], ['dB2', 'bed2'],
  ['gallery', 'gMas'], ['gMas', 'dMas'], ['dMas', 'master'],
]

export function findPath(from, to) {
  const adj = {}
  EDGES.forEach(([a, b]) => {
    ;(adj[a] ||= []).push(b)
    ;(adj[b] ||= []).push(a)
  })
  const prev = { [from]: null }
  const queue = [from]
  while (queue.length) {
    const n = queue.shift()
    if (n === to) break
    ;(adj[n] || []).forEach((m) => {
      if (!(m in prev)) {
        prev[m] = n
        queue.push(m)
      }
    })
  }
  if (!(to in prev)) return null
  const path = []
  for (let n = to; n !== null; n = prev[n]) path.unshift(n)
  return path
}

// Interior lights (local x, y, z), moved onto whichever villa is open
export const LAMP_SPOTS = [
  [2.6, 2.6, 4.2],
  [3.0, 2.6, 2.0],
  [-4.6, 2.6, -1.0],
  [-4.6, 2.6, -5.0],
]

// ── Materials & helpers ─────────────────────────────────
export function makeMaterials(THREE) {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o })
  const floorTex = woodTexture(THREE)
  floorTex.repeat.set(6, 3)
  return {
    sand: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#d8c7a4', { repeat: 120, seed: 4 }), roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#86ad6e', { repeat: 40, light: 0.08, dark: 0.12, seed: 5 }), roughness: 1 }),
    lawn: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#93bd78', { repeat: 6, light: 0.09, dark: 0.12, seed: 6 }), roughness: 1 }),
    asphalt: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#5a6168', { repeat: 30, light: 0.1, dark: 0.1, size: 1.5, seed: 7 }), roughness: 0.92 }),
    sidewalk: std('#dcd8d0'),
    pavers: new THREE.MeshStandardMaterial({ map: paverTexture(THREE, '#d3cbbd', 3), roughness: 0.8 }),
    concrete: std('#e4e1db'),
    wallExt: std('#efe6d8', { roughness: 0.92 }),
    wallInt: std('#f7f6f3', { roughness: 0.95 }),
    perimeter: std('#e8dfcf'),
    clad: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#7d5537', { repeat: 2, light: 0.05, dark: 0.12, size: 6, seed: 12 }), roughness: 0.75 }),
    travertine: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#d2c2a4', { repeat: 2, light: 0.1, dark: 0.08, size: 3, seed: 13 }), roughness: 0.85 }),
    deck: new THREE.MeshStandardMaterial({ map: noiseTexture(THREE, '#9a6b47', { repeat: 3, light: 0.05, dark: 0.12, size: 5, seed: 14 }), roughness: 0.8 }),
    roof: std('#e6ddcd'),
    frame: std('#4b3e32', { roughness: 0.45, metalness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: '#cfe0ec', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 0.6 }),
    darkGlass: std('#1d3347', { roughness: 0.15, metalness: 0.4 }),
    water: std('#4fa8dc', { roughness: 0.08, metalness: 0.1 }),
    hedge: std('#5b884d'),
    leaf: std('#5f8f55'),
    trunk: std('#7a5a3c'),
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.7 }),
    ceiling: std('#fbfbfa', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.35 }),
    fabric: std('#ddd3c2'),
    fabricDark: std('#bfae93'),
    navy: std('#6a4a35', { roughness: 0.55 }),
    navySoft: std('#8a9a6c'),
    wood: std('#a87d55', { roughness: 0.6 }),
    woodLight: std('#c9a57f', { roughness: 0.6 }),
    white: std('#f7f7f5', { roughness: 0.4 }),
    stone: std('#e9e6e1', { roughness: 0.3 }),
    black: std('#1b1f24', { roughness: 0.4 }),
    linen: std('#fafafa', { roughness: 0.9 }),
    rug: std('#cbb79b', { roughness: 1 }),
    pot: std('#e3ddd3'),
    lamp: new THREE.MeshStandardMaterial({ color: '#fff6e5', emissive: '#ffe2b0', emissiveIntensity: 1.2 }),
    carLight: std('#e6e8ea', { metalness: 0.5, roughness: 0.3 }),
    carDark: std('#1d3347', { metalness: 0.5, roughness: 0.3 }),
    tyre: std('#202326', { roughness: 0.9 }),
  }
}

function helpers(THREE) {
  const mesh = (geo, mat, parent, { cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, mat)
    m.castShadow = cast
    m.receiveShadow = receive
    parent.add(m)
    return m
  }
  const box = (parent, w, h, d, mat, x, y, z, opt) => {
    const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent, opt)
    m.position.set(x, y + h / 2, z)
    return m
  }
  const flat = (parent, w, d, mat, x, y, z) => {
    const m = mesh(new THREE.PlaneGeometry(w, d), mat, parent, { cast: false, receive: true })
    m.rotation.x = -Math.PI / 2
    m.position.set(x, y, z)
    return m
  }
  return { mesh, box, flat }
}

function buildWall(THREE, H, parent, M, w) {
  const t = w.ext ? T_EXT : T_INT
  const mat = w.ext ? M.wallExt : M.wallInt
  const from = w.ext ? w.from - t / 2 : w.from
  const to = w.ext ? w.to + t / 2 : w.to
  // box oriented along the wall: `along` length, centred at `c` along the wall
  const seg = (along, height, across, m, c, y, opt) =>
    w.axis === 'x' ? H.box(parent, along, height, across, m, c, y, w.at, opt) : H.box(parent, across, height, along, m, w.at, y, c, opt)
  const piece = (a, b, y0, y1) => {
    if (b - a > 0.001 && y1 - y0 > 0.001) seg(b - a, y1 - y0, t, mat, (a + b) / 2, y0)
  }
  let cur = from
  ;[...w.openings].sort((a, b) => a.a - b.a).forEach((o) => {
    piece(cur, o.a, 0, WALL_H)
    piece(o.a, o.b, 0, o.y0)
    piece(o.a, o.b, o.y1, WALL_H)
    if (o.glass) {
      // Single clean pane (a thin box gave two overlapping transparent faces that shimmered),
      // frames sit just inside the opening so no faces coincide with the wall (no z-fighting).
      const len = o.b - o.a
      const c = (o.a + o.b) / 2
      const h = o.y1 - o.y0
      const f = 0.05
      const noShadow = { cast: false, receive: false }
      const pane = H.mesh(new THREE.PlaneGeometry(len, h), M.glass, parent, noShadow)
      if (w.axis === 'x') pane.position.set(c, o.y0 + h / 2, w.at)
      else {
        pane.rotation.y = Math.PI / 2
        pane.position.set(w.at, o.y0 + h / 2, c)
      }
      pane.renderOrder = 2
      pane.userData.noAO = true
      seg(len, f, t + 0.03, M.frame, c, o.y1 - f, noShadow)
      if (o.y0 > 0.1) seg(len, f, t + 0.03, M.frame, c, o.y0, noShadow)
      seg(f, h - (o.y0 > 0.1 ? 2 * f : f), t + 0.03, M.frame, o.a + f / 2, o.y0 + (o.y0 > 0.1 ? f : 0), noShadow)
      seg(f, h - (o.y0 > 0.1 ? 2 * f : f), t + 0.03, M.frame, o.b - f / 2, o.y0 + (o.y0 > 0.1 ? f : 0), noShadow)
      if (len > 2.4) seg(f * 0.8, h - f, t + 0.02, M.frame, c, o.y0, noShadow)
    }
    cur = o.b
  })
  piece(cur, to, 0, WALL_H)
}

function addCar(H, g, M, x, z, dark) {
  const body = dark ? M.carDark : M.carLight
  H.box(g, 1.9, 0.62, 4.3, body, x, 0.3, z)
  H.box(g, 1.7, 0.55, 2.3, body, x, 0.92, z - 0.2)
  H.box(g, 1.72, 0.45, 2.1, M.darkGlass, x, 0.95, z - 0.2, { cast: false })
  ;[[-0.95, 1.4], [0.95, 1.4], [-0.95, -1.4], [0.95, -1.4]].forEach(([dx, dz]) => H.box(g, 0.26, 0.66, 0.66, M.tyre, x + dx, 0, z + dz))
}

// ── L-shaped courtyard villa ─────────────────────────────
function gable(THREE, H, parent, mat, x, z0, z1, y0, y1) {
  // triangular infill under the mono-pitch roof, on a side wall at `x`
  const s = new THREE.Shape()
  s.moveTo(z0, y0)
  s.lineTo(z1, y0)
  s.lineTo(z1, y1)
  s.lineTo(z0, y0)
  const geo = new THREE.ExtrudeGeometry(s, { depth: T_EXT, bevelEnabled: false })
  const m = H.mesh(geo, mat, parent)
  m.rotation.y = -Math.PI / 2
  m.position.set(x + T_EXT / 2, 0, 0)
  return m
}

function buildHouse(THREE, H, M, unit, index) {
  const g = new THREE.Group()
  const noShadow = { cast: false, receive: false }

  // plot: lawn, entrance path, driveway, hedges
  H.flat(g, 20, 20, M.lawn, 0, 0.012, 1)
  H.flat(g, 1.6, 5, M.pavers, -4, 0.02, 8.5)
  H.flat(g, 3.2, 9, M.concrete, 7.6, 0.02, 6.5)
  H.box(g, 0.6, 1.1, 20, M.hedge, -9.7, 0, 1)
  H.box(g, 0.6, 1.1, 20, M.hedge, 9.7, 0, 1)
  H.box(g, 19.4, 1.1, 0.6, M.hedge, 0, 0, -8.7)
  H.box(g, 4.2, 0.6, 0.5, M.hedge, -7.3, 0, 10.6)
  H.box(g, 8.4, 0.6, 0.5, M.hedge, 1.4, 0, 10.6)

  // floors + ceilings for both wings
  H.flat(g, 12, 5, M.floor, -1, 0.022, 3.5)
  H.flat(g, 6, 8, M.floor, -4, 0.022, -3)
  ;[[12, 5, -1, 3.5], [6, 8, -4, -3]].forEach(([w, d, x, z]) => {
    const c = H.mesh(new THREE.PlaneGeometry(w, d), M.ceiling, g, noShadow)
    c.rotation.x = Math.PI / 2
    c.position.set(x, WALL_H - 0.002, z)
  })
  HOUSE_WALLS.forEach((w) => buildWall(THREE, H, g, M, w))

  // Day wing: mono-pitch roof rising towards the street, with infill above the walls
  const roofMat = M.roof.clone()
  const run = 6.2
  const rise = 1.4
  const a = Math.atan2(rise, run)
  const slab = H.box(g, 12.8, 0.25, Math.hypot(run, rise), roofMat, -1, 0, 0)
  slab.rotation.x = -a
  slab.position.set(-1, WALL_H + 0.15 + rise / 2, 0.7 + run / 2)
  H.box(g, 12.44, rise, T_EXT, M.wallExt, -1, WALL_H, 6)
  gable(THREE, H, g, M.wallExt, -7, 1, 6, WALL_H, WALL_H + rise * (5.3 / run))
  gable(THREE, H, g, M.wallExt, 5, 1, 6, WALL_H, WALL_H + rise * (5.3 / run))

  // Night wing: two-storey timber tower with glass bands and a flat roof
  H.box(g, 6.44, 3.0, 8.44, M.clad, -4, WALL_H, -3)
  H.box(g, 0.05, 1.3, 6, M.darkGlass, -0.76, WALL_H + 0.9, -3, noShadow)
  H.box(g, 4.4, 1.3, 0.05, M.darkGlass, -4, WALL_H + 0.9, -7.24, noShadow)
  H.box(g, 0.05, 1.3, 4, M.darkGlass, -7.24, WALL_H + 0.9, -3, noShadow)
  H.box(g, 6.9, 0.28, 8.9, roofMat, -4, WALL_H + 3.0, -3)
  for (let k = 0; k < 9; k++) H.box(g, 0.08, 2.4, 0.1, M.travertine, -6.4 + k * 0.6, WALL_H + 0.3, 1.27)

  // Travertine entrance portal + open front door
  H.box(g, 0.4, 2.9, 0.5, M.travertine, -5.05, 0, 6.3)
  H.box(g, 0.4, 2.9, 0.5, M.travertine, -2.95, 0, 6.3)
  H.box(g, 2.5, 0.3, 0.5, M.travertine, -4, 2.9, 6.3)
  const hinge = new THREE.Group()
  hinge.position.set(-4.7, 0, 5.95)
  hinge.rotation.y = 1.35
  H.box(hinge, 1.38, 2.38, 0.06, M.clad, 0.69, 0, 0)
  g.add(hinge)

  // Courtyard: timber deck, pool, travertine garden walls, shade pergola
  H.flat(g, 6, 8, M.deck, 2, 0.03, -3)
  H.box(g, 4.0, 0.12, 5.6, M.travertine, 2.6, 0, -3.6, { cast: false })
  H.flat(g, 3.6, 5.2, M.water, 2.6, 0.13, -3.6)
  H.box(g, 0.3, 1.8, 8, M.travertine, 5.0, 0, -3)
  H.box(g, 6.3, 1.8, 0.3, M.travertine, 2, 0, -7)
  ;[[-0.6, -0.9], [4.6, -0.9], [-0.6, 0.6], [4.6, 0.6]].forEach(([px, pz]) => H.box(g, 0.12, 2.7, 0.12, M.clad, px, 0, pz))
  for (let k = 0; k < 10; k++) H.box(g, 0.08, 0.1, 1.8, M.clad, -0.5 + k * 0.56, 2.7, -0.15)
  H.box(g, 0.7, 0.3, 1.8, M.white, 0.4, 0, -5.6)
  H.box(g, 0.7, 0.3, 1.8, M.white, 1.4, 0, -5.6)

  // status marker on the tower roof
  const status = STATUS[unit.status]
  const disc = H.mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.1, 40),
    new THREE.MeshStandardMaterial({ color: status.color, emissive: status.color, emissiveIntensity: 0.45 }),
    g,
    noShadow,
  )
  disc.position.set(-4, WALL_H + 3.36, -3)

  if (unit.car) addCar(H, g, M, 7.6, 8, index % 4 === 0)

  const pick = new THREE.Mesh(
    new THREE.BoxGeometry(13, 7, 14),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  )
  pick.position.set(-1, 3.5, -0.5)
  pick.userData.unit = index
  g.add(pick)

  g.position.set(unit.x, 0, unit.z)
  g.rotation.y = unit.rot
  const cos = Math.cos(unit.rot)
  const sin = Math.sin(unit.rot)
  const toWorld = ([lx, lz], y = 0) => new THREE.Vector3(unit.x + lx * cos + lz * sin, y, unit.z - lx * sin + lz * cos)
  return { group: g, roofMat, pick, disc, unit, toWorld, rot: unit.rot }
}

function seeded(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

// Flat elliptical ring (or disc when inner = 0), lying on the ground
function ellipseRing(THREE, H, parent, mat, ox, oz, inner, y) {
  const shape = new THREE.Shape()
  shape.absellipse(0, 0, ox, oz, 0, Math.PI * 2, false, 0)
  if (inner) {
    const hole = new THREE.Path()
    hole.absellipse(0, 0, inner[0], inner[1], 0, Math.PI * 2, true, 0)
    shape.holes.push(hole)
  }
  const m = H.mesh(new THREE.ShapeGeometry(shape, 96), mat, parent, { cast: false, receive: true })
  m.rotation.x = -Math.PI / 2
  m.position.y = y
  return m
}

export function buildCompound(THREE) {
  const M = makeMaterials(THREE)
  const H = helpers(THREE)
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#dfe9f1', 220, 700)

  // ground: desert outside, landscaped inside the wall
  H.flat(scene, 900, 900, M.sand, 0, -0.02, 0)
  H.flat(scene, 144, 196, M.grass, 0, 0, -4)

  // perimeter wall with a south gate
  const wallH = 2.2
  H.box(scene, 0.4, wallH, 196, M.perimeter, -72, 0, -4)
  H.box(scene, 0.4, wallH, 196, M.perimeter, 72, 0, -4)
  H.box(scene, 144, wallH, 0.4, M.perimeter, 0, 0, -102)
  H.box(scene, 65, wallH, 0.4, M.perimeter, -39.5, 0, 94)
  H.box(scene, 65, wallH, 0.4, M.perimeter, 39.5, 0, 94)
  H.box(scene, 1.4, 3.8, 1.4, M.clad, -6.6, 0, 94)
  H.box(scene, 1.4, 3.8, 1.4, M.clad, 6.6, 0, 94)
  H.box(scene, 4, 3, 4, M.wallExt, 11, 0, 90)
  H.box(scene, 4.6, 0.2, 4.6, M.clad, 11, 3, 90)

  // Oval ring road with sidewalks, gate road and clubhouse spur
  ellipseRing(THREE, H, scene, M.sidewalk, RX + ROAD / 2 + 1.5, RZ + ROAD / 2 + 1.5, [RX + ROAD / 2, RZ + ROAD / 2], 0.015)
  ellipseRing(THREE, H, scene, M.asphalt, RX + ROAD / 2, RZ + ROAD / 2, [RX - ROAD / 2, RZ - ROAD / 2], 0.02)
  ellipseRing(THREE, H, scene, M.sidewalk, RX - ROAD / 2, RZ - ROAD / 2, [RX - ROAD / 2 - 1.5, RZ - ROAD / 2 - 1.5], 0.015)
  H.box(scene, 8, 0.04, 42, M.asphalt, 0, 0, RZ + 21 + 2, { cast: false })
  H.box(scene, 7, 0.04, 26, M.asphalt, 0, 0, -RZ - 13 - 2, { cast: false })

  // Central park: lawn, jogging loop, lagoon with stone rim, pavilion
  ellipseRing(THREE, H, scene, M.lawn, RX - ROAD / 2 - 1.5, RZ - ROAD / 2 - 1.5, null, 0.01)
  ellipseRing(THREE, H, scene, M.pavers, 23, 35, [21.5, 33.5], 0.025)
  ellipseRing(THREE, H, scene, M.travertine, 13.2, 21.2, [12, 20], 0.06)
  ellipseRing(THREE, H, scene, M.water, 12, 20, null, 0.05)
  const pav = new THREE.Group()
  pav.position.set(15, 0, -6)
  ;[[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => H.box(pav, 0.25, 3, 0.25, M.clad, x, 0, z))
  H.box(pav, 5, 0.3, 5, M.roof, 0, 3, 0)
  H.flat(pav, 5, 5, M.deck, 0, 0.04, 0)
  scene.add(pav)

  // Clubhouse + pool at the head of the oval
  H.flat(scene, 30, 10, M.pavers, 0, 0.03, -RZ - 33)
  H.box(scene, 20, 0.15, 5, M.travertine, 0, 0, -RZ - 33, { cast: false })
  H.flat(scene, 18.6, 3.8, M.water, 0, 0.16, -RZ - 33)
  H.box(scene, 26, 5.5, 12, M.wallExt, 0, 0, -RZ - 44)
  H.box(scene, 22, 4, 0.1, M.darkGlass, 0, 0.6, -RZ - 37.95, { cast: false })
  H.box(scene, 28, 0.4, 14, M.clad, 0, 5.5, -RZ - 44)

  // villas
  const houses = UNITS.map((u, i) => {
    const h = buildHouse(THREE, H, M, u, i)
    scene.add(h.group)
    return h
  })

  greenery(THREE, scene, houses, seeded(11))

  // lighting
  scene.add(new THREE.HemisphereLight('#eef6ff', '#b3a98f', 0.9))
  const sun = new THREE.DirectionalLight('#fff3df', 2.6)
  sun.position.set(70, 120, 45)
  sun.castShadow = true
  sun.shadow.mapSize.set(4096, 4096)
  Object.assign(sun.shadow.camera, { left: -115, right: 115, top: 115, bottom: -115, near: 10, far: 330 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  sun.target.position.set(0, 0, -4)
  scene.add(sun, sun.target)
  const fillLight = new THREE.DirectionalLight('#e3edf7', 0.9)
  fillLight.position.set(-60, 50, -30)
  scene.add(fillLight)

  const lamps = LAMP_SPOTS.map(() => {
    const l = new THREE.PointLight('#ffe8c8', 0, 9, 1.6)
    scene.add(l)
    return l
  })

  return { scene, houses, lamps, M, H }
}

// ── Interiors (added only to the villa being visited) ────
export function buildInterior(THREE, M, H, markTexture) {
  const g = new THREE.Group()
  const o = { cast: false, receive: false }
  const B = (w, h, d, m, x, y, z) => H.box(g, w, h, d, m, x, y, z, o)
  const ball = (r, m, x, y, z) => {
    const s = H.mesh(new THREE.SphereGeometry(r, 16, 12), m, g, o)
    s.position.set(x, y, z)
    return s
  }
  const rug = (w, d, x, z) => H.flat(g, w, d, M.rug, x, 0.03, z)
  const plant = (x, z, s = 1) => {
    const p = H.mesh(new THREE.CylinderGeometry(0.2 * s, 0.16 * s, 0.4 * s, 16), M.pot, g, o)
    p.position.set(x, 0.2 * s, z)
    ball(0.32 * s, M.leaf, x, 0.75 * s, z)
    ball(0.24 * s, M.leaf, x + 0.12 * s, 0.98 * s, z + 0.05 * s)
  }

  // Entrance & dining hall
  rug(3, 2.2, -4, 3.6)
  B(1.7, 0.05, 0.95, M.woodLight, -5.2, 0.74, 2.0)
  ;[[-5.85, 1.62], [-5.85, 2.38], [-4.55, 1.62], [-4.55, 2.38]].forEach(([x, z]) => B(0.06, 0.74, 0.06, M.wood, x, 0, z))
  ;[[-5.6, 1.3], [-4.8, 1.3], [-5.6, 2.7], [-4.8, 2.7]].forEach(([x, z]) => {
    B(0.42, 0.45, 0.42, M.navySoft, x, 0, z)
    B(0.42, 0.45, 0.06, M.navySoft, x, 0.45, z + (z > 2 ? 0.18 : -0.18))
  })
  B(0.01, 0.8, 0.01, M.black, -5.2, 2.2, 2.0)
  ball(0.16, M.lamp, -5.2, 2.12, 2.0)
  B(0.4, 0.8, 1.6, M.wood, -6.75, 0, 3.5)
  B(0.03, 0.95, 0.95, M.navy, -1.08, 1.2, 5.3)
  if (markTexture) {
    const art = H.mesh(new THREE.PlaneGeometry(0.62, 0.64), new THREE.MeshBasicMaterial({ map: markTexture, transparent: true }), g, o)
    art.position.set(-1.11, 1.67, 5.3)
    art.rotation.y = -Math.PI / 2
  }
  plant(-6.4, 5.4, 1.1)

  // Living room
  rug(3.4, 2.4, 3.0, 4.4)
  B(2.6, 0.42, 0.95, M.fabric, 3.2, 0, 5.35)
  B(2.6, 0.5, 0.22, M.fabric, 3.2, 0.42, 5.72)
  B(0.2, 0.62, 0.95, M.fabric, 1.9, 0, 5.35)
  B(0.2, 0.62, 0.95, M.fabric, 4.5, 0, 5.35)
  B(1.15, 0.12, 0.7, M.fabricDark, 2.62, 0.42, 5.28)
  B(1.15, 0.12, 0.7, M.fabricDark, 3.78, 0.42, 5.28)
  B(0.42, 0.38, 0.12, M.navy, 2.3, 0.54, 5.55)
  B(0.42, 0.38, 0.12, M.navySoft, 4.1, 0.54, 5.55)
  B(1.1, 0.05, 0.6, M.woodLight, 3.2, 0.36, 4.2)
  B(0.9, 0.3, 0.4, M.wood, 3.2, 0.06, 4.2)
  B(0.85, 0.42, 0.85, M.navySoft, 0.2, 0, 3.4)
  B(0.85, 0.45, 0.2, M.navySoft, 0.2, 0.42, 3.72)
  plant(4.7, 3.6)
  B(0.04, 1.5, 0.04, M.black, -0.6, 0, 5.6)
  const shade = H.mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 20, 1, true), M.lamp, g, o)
  shade.position.set(-0.6, 1.6, 5.6)

  // Kitchen
  B(0.62, 0.88, 1.8, M.navy, 4.65, 0, 2.1)
  B(0.66, 0.04, 1.84, M.stone, 4.64, 0.88, 2.1)
  B(0.45, 0.02, 0.6, M.black, 4.65, 0.92, 2.5)
  B(0.4, 0.02, 0.5, M.white, 4.65, 0.92, 1.6)
  B(0.62, 2.1, 0.7, M.white, 4.65, 0, 3.45)
  B(0.9, 0.9, 1.8, M.navySoft, 3.6, 0, 2.0)
  B(1.0, 0.04, 1.9, M.stone, 3.6, 0.9, 2.0)
  ;[1.55, 2.45].forEach((z) => {
    B(0.38, 0.04, 0.38, M.woodLight, 2.95, 0.65, z)
    B(0.04, 0.65, 0.04, M.black, 2.95, 0, z)
    B(0.01, 0.75, 0.01, M.black, 3.6, 2.25, z)
    ball(0.12, M.lamp, 3.6, 2.17, z)
  })

  // Pool gallery
  B(0.4, 0.42, 2.4, M.woodLight, -2.15, 0, -5.6)
  plant(-1.35, -6.6)
  plant(-2.1, 0.55, 0.9)

  // Bedroom 2
  B(1.5, 1.0, 0.08, M.woodLight, -4.7, 0, -2.92)
  B(1.4, 0.3, 2.0, M.wood, -4.7, 0, -1.95)
  B(1.35, 0.2, 1.95, M.linen, -4.7, 0.3, -1.95)
  B(1.38, 0.06, 1.2, M.navySoft, -4.7, 0.5, -1.55)
  B(0.6, 0.12, 0.35, M.white, -4.7, 0.5, -2.65)
  B(0.6, 0.04, 1.3, M.woodLight, -6.65, 0.74, -1.3)
  B(0.6, 0.74, 0.04, M.woodLight, -6.65, 0, -1.93)
  B(0.6, 0.74, 0.04, M.woodLight, -6.65, 0, -0.67)
  B(0.45, 0.45, 0.45, M.navy, -6.1, 0, -1.3)
  B(2.0, 2.2, 0.6, M.white, -5.6, 0, 0.65)

  // Master bedroom
  B(2.0, 1.1, 0.08, M.woodLight, -4.7, 0, -6.92)
  B(1.9, 0.32, 2.1, M.wood, -4.7, 0, -5.85)
  B(1.8, 0.22, 2.0, M.linen, -4.7, 0.32, -5.85)
  B(1.84, 0.07, 1.3, M.navy, -4.7, 0.54, -5.45)
  B(0.65, 0.14, 0.36, M.white, -5.15, 0.54, -6.6)
  B(0.65, 0.14, 0.36, M.white, -4.25, 0.54, -6.6)
  B(0.45, 0.5, 0.4, M.wood, -6.0, 0, -6.7)
  B(0.45, 0.5, 0.4, M.wood, -3.4, 0, -6.7)
  ball(0.11, M.lamp, -6.0, 0.65, -6.7)
  ball(0.11, M.lamp, -3.4, 0.65, -6.7)
  B(2.0, 2.2, 0.6, M.white, -5.8, 0, -3.35)
  rug(2.6, 1.6, -4.7, -4.4)

  return g
}

// ── Greenery (all instanced) ─────────────────────────────
function greenery(THREE, scene, houses, rnd) {
  const dummy = new THREE.Object3D()
  const GREENS = ['#3f6b3d', '#4d7d45', '#5b8d4f', '#6f9a58', '#35603a', '#7aa463']
  const FLOWERS = ['#f5c6d6', '#ffe27a', '#ffffff', '#f08a9e', '#c9a7f0']
  const leafMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 })
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#7a5a3c', roughness: 0.9 })
  const frondMat = new THREE.MeshStandardMaterial({ color: '#4f8a46', roughness: 0.7, side: THREE.DoubleSide })
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)]
  const place = (geo, mat, list, colors, { cast = true } = {}) => {
    const mesh = new THREE.InstancedMesh(geo, mat, list.length)
    list.forEach((p, i) => {
      dummy.position.set(p.x, p.y ?? 0, p.z)
      dummy.rotation.set(0, rnd() * Math.PI * 2, 0)
      dummy.scale.set(p.s, p.sy ?? p.s, p.s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      if (colors) mesh.setColorAt(i, new THREE.Color(pick(colors)))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.castShadow = cast
    mesh.receiveShadow = true
    scene.add(mesh)
  }
  const onEllipse = (rx, rz, t) => [rx * Math.sin(t), -rz * Math.cos(t)]
  const nearHouse = (x, z, d) => houses.some((h) => Math.hypot(x - h.unit.x, z - h.unit.z) < d)

  const trees = []
  // avenue trees on the park side of the ring
  for (let k = 0; k < 40; k++) {
    const t = (k / 40) * Math.PI * 2
    if (Math.abs(Math.sin(t / 2)) < 0.08) continue // keep the clubhouse spur clear
    if (Math.abs(Math.cos(t / 2)) < 0.08) continue // keep the gate road clear
    const [x, z] = onEllipse(RX - 7, RZ - 7, t)
    trees.push({ x, z, s: 0.85 + rnd() * 0.2 })
  }
  // park clusters between the jogging loop and the lagoon
  for (let k = 0; k < 26; k++) {
    const t = rnd() * Math.PI * 2
    const f = 0.62 + rnd() * 0.12
    const [x, z] = onEllipse((RX - 7) * f + 3, (RZ - 7) * f + 3, t)
    if (Math.hypot(x - 15, z + 6) < 5) continue
    trees.push({ x, z, s: 0.9 + rnd() * 0.4 })
  }
  // garden trees on every plot
  houses.forEach((h) => {
    ;[[-8.6, -8.2], [8.6, -8.2], [8.8, 9.2], [-9, 9.2], [7.6, 0]].forEach(([lx, lz]) => {
      const p = h.toWorld([lx, lz])
      trees.push({ x: p.x, z: p.z, s: 0.9 + rnd() * 0.35 })
    })
  })
  // outer belt between the plots and the wall
  for (let k = 0, tries = 0; k < 110 && tries < 2000; tries++) {
    const x = -69 + rnd() * 138
    const z = -99 + rnd() * 190
    const inside = (x / (RX + 30)) ** 2 + (z / (RZ + 30)) ** 2 < 1
    if (inside || nearHouse(x, z, 16) || Math.abs(x) < 7 || (Math.abs(x) < 18 && z < -RZ - 26)) continue
    trees.push({ x, z, s: 0.95 + rnd() * 0.6 })
    k++
  }

  place(new THREE.CylinderGeometry(0.16, 0.26, 2.4, 8), trunkMat, trees.map((t) => ({ x: t.x, y: 1.2 * t.s, z: t.z, s: t.s })), null)
  const crownGeo = new THREE.IcosahedronGeometry(1, 2)
  ;[
    { ox: 0, oy: 3.6, oz: 0, r: 1.9 },
    { ox: -0.95, oy: 3.1, oz: 0.5, r: 1.35 },
    { ox: 0.85, oy: 4.1, oz: -0.4, r: 1.45 },
  ].forEach((c) => place(crownGeo, leafMat, trees.map((t) => ({ x: t.x + c.ox * t.s, y: c.oy * t.s, z: t.z + c.oz * t.s, s: c.r * t.s })), GREENS))

  // palms ringing the lagoon and flanking the clubhouse and gate
  const palms = []
  for (let k = 0; k < 14; k++) palms.push(onEllipse(15.5, 23.5, (k / 14) * Math.PI * 2 + 0.2))
  palms.push([-16, -RZ - 30], [16, -RZ - 30], [-10, 88], [10, 86])
  palms.forEach(([x, z]) => {
    const h = 6.5 + rnd() * 2
    const pg = new THREE.Group()
    pg.position.set(x, 0, z)
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, h, 10), trunkMat)
    trunk.position.y = h / 2
    trunk.castShadow = true
    pg.add(trunk)
    for (let k = 0; k < 8; k++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.22, 3.2, 4, 1, true), frondMat)
      f.geometry.translate(0, -1.6, 0)
      f.rotation.set(Math.PI / 2 - 0.5, (k / 8) * Math.PI * 2, 0, 'YXZ')
      f.position.y = h
      f.castShadow = true
      pg.add(f)
    }
    scene.add(pg)
  })

  // shrubs along each frontage and flower beds by the door (path and driveway kept clear)
  const shrubs = []
  const flowers = []
  const clear = (lx) => (lx > -5.3 && lx < -2.7) || (lx > 5.6 && lx < 9.6)
  houses.forEach((h) => {
    for (let i = 0; i < 24; i++) {
      const lx = -9 + rnd() * 18
      if (clear(lx)) continue
      const p = h.toWorld([lx, 9.1 + rnd() * 0.5])
      shrubs.push({ x: p.x, y: 0.45, z: p.z, s: 0.55 + rnd() * 0.35, sy: 0.6 + rnd() * 0.3 })
    }
    for (let i = 0; i < 14; i++) {
      const side = i % 2 ? 1 : -1
      const p = h.toWorld([side * (9.1 + rnd() * 0.3), -8.5 + rnd() * 17])
      shrubs.push({ x: p.x, y: 0.45, z: p.z, s: 0.5 + rnd() * 0.3, sy: 0.6 })
    }
    for (let i = 0; i < 22; i++) {
      const lx = -8.5 + rnd() * 13
      if (clear(lx)) continue
      const p = h.toWorld([lx, 6.9 + rnd() * 1.6])
      flowers.push({ x: p.x, y: 0.12, z: p.z, s: 0.22 + rnd() * 0.12 })
    }
  })
  place(new THREE.IcosahedronGeometry(1, 2), leafMat, shrubs, GREENS)
  place(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 }), flowers, FLOWERS, { cast: false })
}
