// Procedural residential compound for the off-plan digital-twin demo.
// World units are metres. The boulevard runs along z; villas face it from both sides.
import { woodTexture } from '../tour/scene.js'

export const EYE = 1.65
const WALL_H = 3.0
const T_EXT = 0.22
const T_INT = 0.12

// ── Units ───────────────────────────────────────────────
export const STATUS = {
  available: { label: 'Available', color: '#2fb171' },
  reserved: { label: 'Reserved', color: '#f0a33a' },
  sold: { label: 'Sold', color: '#9aa5b1' },
}
const STATUS_SEQ = ['available', 'sold', 'available', 'reserved', 'available', 'available', 'reserved', 'available', 'sold', 'available', 'available', 'sold']

export const UNITS = Array.from({ length: 12 }, (_, i) => {
  const left = i < 6
  const n = i % 6
  return {
    id: `${left ? 'A' : 'B'}-${String(n + 1).padStart(2, '0')}`,
    x: left ? -17 : 17,
    z: -50 + n * 20,
    rot: left ? Math.PI / 2 : -Math.PI / 2,
    status: STATUS_SEQ[i],
    price: `EGP ${(9.2 + ((i * 7) % 5) * 0.3).toFixed(1)}M`,
    pool: i % 3 !== 1,
    car: i % 2 === 0,
  }
})
export const UNIT_SPEC = { type: 'Garden Villa', beds: 2, area: '165 m²', plot: '400 m²', delivery: 'Q4 2027' }

// ── Villa plan (local coords: x across the frontage, +z towards the street) ──
const win = (a, b, y0 = 0.9, y1 = 2.4) => ({ a, b, y0, y1, glass: true })
const door = (a, b, y1 = 2.3) => ({ a, b, y0: 0, y1 })
export const HOUSE_WALLS = [
  { axis: 'x', at: 5, from: -6, to: 6, ext: true, openings: [win(-5, -2), door(-0.7, 0.7, 2.4), win(2.2, 5.2)] },
  { axis: 'x', at: -5, from: -6, to: 6, ext: true, openings: [win(-5, -2.5), win(-0.6, 0.6, 1.6, 2.3), win(2.2, 5.2, 1.1, 2.3)] },
  { axis: 'z', at: -6, from: -5, to: 5, ext: true, openings: [win(-2, 0)] },
  { axis: 'z', at: 6, from: -5, to: 5, ext: true, openings: [win(-4, -2, 1.1, 2.3), win(0.5, 4.2, 0.05, 2.6)] },
  { axis: 'z', at: -1.5, from: -5, to: 5, openings: [door(-1.6, -0.6), door(2.4, 3.4)] },
  { axis: 'x', at: 0.5, from: -6, to: -1.5, openings: [] },
  { axis: 'z', at: 1.5, from: -5, to: 5, openings: [door(0.5, 4, 2.6)] },
  { axis: 'x', at: -1, from: 1.5, to: 6, openings: [door(2.5, 5.2, 2.6)] },
  { axis: 'x', at: -2, from: -1.5, to: 1.5, openings: [door(-0.45, 0.45, 2.2)] },
]

// Floor-plan lines for the minimap (gaps at doorways)
export function planLines() {
  const lines = []
  HOUSE_WALLS.forEach((w) => {
    let cur = w.from
    const gaps = w.openings.filter((o) => o.y0 < 0.1).sort((a, b) => a.a - b.a)
    const push = (a, b) => {
      if (b - a < 0.01) return
      lines.push(w.axis === 'x' ? [a, w.at, b, w.at] : [w.at, a, w.at, b])
    }
    gaps.forEach((o) => {
      push(cur, o.a)
      cur = o.b
    })
    push(cur, w.to)
  })
  return lines
}

// Navigation graph (local coords). Waypoints are doorways the camera walks through.
export const NODES = {
  front: { pos: [0, 9.5], yaw: 0, name: 'Front garden' },
  hall: { pos: [0, 3.2], yaw: -Math.PI / 2 + 0.35, name: 'Entrance hall' },
  living: { pos: [2.4, 3.6], yaw: -0.48, name: 'Living room' },
  kitchen: { pos: [3.8, -1.6], yaw: 0.1, name: 'Kitchen' },
  master: { pos: [-2.8, -0.1], yaw: 0.35, name: 'Master bedroom' },
  bed2: { pos: [-3.0, 2.0], yaw: Math.PI / 2, name: 'Bedroom 2' },
  dLiv: { pos: [1.5, 3.4] },
  lk: { pos: [2.1, -0.2] },
  dB2: { pos: [-1.5, 2.9] },
  hallMid: { pos: [0, 0.6] },
  dMas: { pos: [-1.5, -1.1] },
}
export const STOPS = ['front', 'hall', 'living', 'kitchen', 'master', 'bed2']
const EDGES = [
  ['front', 'hall'], ['hall', 'dLiv'], ['dLiv', 'living'], ['living', 'lk'], ['lk', 'kitchen'],
  ['hall', 'dB2'], ['dB2', 'bed2'], ['hall', 'hallMid'], ['hallMid', 'dMas'], ['dMas', 'master'],
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

// Interior lights (local), repositioned onto whichever villa is open
export const LAMP_SPOTS = [
  [3.8, 2.6, 1.4],
  [3.8, 2.6, -3.0],
  [-3.7, 2.6, -2.4],
  [-3.7, 2.6, 2.7],
]

// ── Materials & helpers ─────────────────────────────────
export function makeMaterials(THREE) {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o })
  const floorTex = woodTexture(THREE)
  floorTex.repeat.set(6, 5)
  return {
    sand: std('#dccbaa', { roughness: 1 }),
    grass: std('#8db075', { roughness: 1 }),
    lawn: std('#9cc283', { roughness: 1 }),
    asphalt: std('#5f6871', { roughness: 0.95 }),
    sidewalk: std('#dcd8d0'),
    pavers: std('#cdc5b8'),
    concrete: std('#e4e1db'),
    wallExt: std('#f4f1ec', { roughness: 0.9 }),
    wallInt: std('#f7f6f3', { roughness: 0.95 }),
    perimeter: std('#e8dfcf'),
    clad: std('#23415c', { roughness: 0.7 }),
    roof: std('#e9e6e0'),
    frame: std('#2a2f35', { roughness: 0.5 }),
    glass: new THREE.MeshStandardMaterial({ color: '#9fc0dc', roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.25, depthWrite: false }),
    darkGlass: std('#1d3347', { roughness: 0.15, metalness: 0.4 }),
    water: std('#4fa8dc', { roughness: 0.08, metalness: 0.1 }),
    hedge: std('#5b884d'),
    leaf: std('#5f8f55'),
    trunk: std('#7a5a3c'),
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.7 }),
    ceiling: std('#fbfbfa', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.35 }),
    fabric: std('#c7cbd0'),
    fabricDark: std('#9aa3ad'),
    navy: std('#0f2a40', { roughness: 0.6 }),
    navySoft: std('#2b4a66'),
    wood: std('#a87d55', { roughness: 0.6 }),
    woodLight: std('#c9a57f', { roughness: 0.6 }),
    white: std('#f7f7f5', { roughness: 0.4 }),
    stone: std('#e9e6e1', { roughness: 0.3 }),
    black: std('#1b1f24', { roughness: 0.4 }),
    linen: std('#fafafa', { roughness: 0.9 }),
    rug: std('#dcd5c9', { roughness: 1 }),
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
      const len = o.b - o.a
      const c = (o.a + o.b) / 2
      const f = 0.05
      const noShadow = { cast: false, receive: false }
      seg(len, o.y1 - o.y0, 0.03, M.glass, c, o.y0, noShadow)
      seg(len + f * 2, f, t + 0.03, M.frame, c, o.y1, noShadow)
      if (o.y0 > 0.1) seg(len + f * 2, f, t + 0.03, M.frame, c, o.y0 - f, noShadow)
      seg(f, o.y1 - o.y0, t + 0.03, M.frame, o.a - f / 2, o.y0, noShadow)
      seg(f, o.y1 - o.y0, t + 0.03, M.frame, o.b + f / 2, o.y0, noShadow)
      if (len > 2.4) seg(f * 0.8, o.y1 - o.y0, t + 0.02, M.frame, c, o.y0, noShadow)
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

function buildHouse(THREE, H, M, unit, index) {
  const g = new THREE.Group()

  // plot
  H.flat(g, 20, 20, M.lawn, 0, 0.012, 1)
  H.flat(g, 1.6, 6, M.pavers, 0, 0.02, 8)
  H.flat(g, 3.2, 6.2, M.concrete, 7.6, 0.02, 8)
  H.box(g, 0.6, 1.1, 20, M.hedge, -9.7, 0, 1)
  H.box(g, 0.6, 1.1, 20, M.hedge, 9.7, 0, 1)
  H.box(g, 19.4, 1.1, 0.6, M.hedge, 0, 0, -8.7)
  H.box(g, 8.6, 0.6, 0.5, M.hedge, -5.1, 0, 10.6)
  H.box(g, 5.2, 0.6, 0.5, M.hedge, 3.4, 0, 10.6)

  // house
  H.flat(g, 12, 10, M.floor, 0, 0.022, 0)
  HOUSE_WALLS.forEach((w) => buildWall(THREE, H, g, M, w))
  const ceil = H.mesh(new THREE.PlaneGeometry(12, 10), M.ceiling, g, { cast: false, receive: false })
  ceil.rotation.x = Math.PI / 2
  ceil.position.set(0, WALL_H - 0.002, 0)

  const roofMat = M.roof.clone()
  H.box(g, 12.6, 0.35, 10.6, roofMat, 0, WALL_H, 0)
  H.box(g, 12.6, 0.45, 0.2, roofMat, 0, WALL_H + 0.35, 5.2)
  H.box(g, 12.6, 0.45, 0.2, roofMat, 0, WALL_H + 0.35, -5.2)
  H.box(g, 0.2, 0.45, 10.6, roofMat, 6.2, WALL_H + 0.35, 0)
  // upper volume (roof suite) in brand navy
  H.box(g, 5.8, 2.8, 7, M.clad, -3.1, WALL_H + 0.35, -1.2)
  H.box(g, 6.1, 0.25, 7.3, roofMat, -3.1, WALL_H + 3.15, -1.2)
  H.box(g, 4.6, 1.3, 0.05, M.darkGlass, -3.1, WALL_H + 1.0, 2.33, { cast: false })
  H.box(g, 0.05, 1.3, 4.6, M.darkGlass, -0.18, WALL_H + 1.0, -1.2, { cast: false })
  // entrance canopy + open front door
  H.box(g, 3.4, 0.15, 1.8, M.clad, 0, 2.55, 5.95)
  const hinge = new THREE.Group()
  hinge.position.set(-0.7, 0, 4.95)
  hinge.rotation.y = 1.35
  H.box(hinge, 1.38, 2.38, 0.06, M.clad, 0.69, 0, 0)
  g.add(hinge)
  // status marker on the roof
  const status = STATUS[unit.status]
  const disc = H.mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.1, 40),
    new THREE.MeshStandardMaterial({ color: status.color, emissive: status.color, emissiveIntensity: 0.45 }),
    g,
    { cast: false, receive: false },
  )
  disc.position.set(3, WALL_H + 0.42, 0)

  // garden extras
  if (unit.pool) {
    H.box(g, 5.6, 0.12, 2.8, M.stone, -1.5, 0, -7.1, { cast: false })
    H.flat(g, 5, 2.2, M.water, -1.5, 0.13, -7.1)
  }
  if (unit.car) addCar(H, g, M, 7.6, 8, index % 4 === 0)

  // invisible hit volume for picking from the air
  const pick = new THREE.Mesh(
    new THREE.BoxGeometry(13, 7, 11),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  )
  pick.position.set(0, 3.5, 0)
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

export function buildCompound(THREE) {
  const M = makeMaterials(THREE)
  const H = helpers(THREE)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#cfe3f3')
  scene.fog = new THREE.Fog('#d6e6f2', 170, 520)

  // ground: desert outside, landscaped inside the wall
  H.flat(scene, 900, 900, M.sand, 0, -0.02, 0)
  H.flat(scene, 84, 196, M.grass, 0, 0, -14)

  // perimeter wall with gate
  const wallH = 2.2
  H.box(scene, 0.4, wallH, 196, M.perimeter, -42, 0, -14)
  H.box(scene, 0.4, wallH, 196, M.perimeter, 42, 0, -14)
  H.box(scene, 84, wallH, 0.4, M.perimeter, 0, 0, -112)
  H.box(scene, 36, wallH, 0.4, M.perimeter, -24, 0, 84)
  H.box(scene, 36, wallH, 0.4, M.perimeter, 24, 0, 84)
  H.box(scene, 1.4, 3.6, 1.4, M.clad, -6.4, 0, 84)
  H.box(scene, 1.4, 3.6, 1.4, M.clad, 6.4, 0, 84)
  H.box(scene, 4, 3, 4, M.wallExt, 10, 0, 80)
  H.box(scene, 4.6, 0.2, 4.6, M.clad, 10, 3, 80)

  // roads
  H.box(scene, 8, 0.04, 146, M.asphalt, 0, 0, 11, { cast: false })
  H.box(scene, 2, 0.08, 146, M.sidewalk, -5, 0, 11, { cast: false })
  H.box(scene, 2, 0.08, 146, M.sidewalk, 5, 0, 11, { cast: false })
  H.box(scene, 1.2, 0.18, 118, M.lawn, 0, 0, 0, { cast: false })
  const round = H.mesh(new THREE.CylinderGeometry(11, 11, 0.04, 56), M.asphalt, scene, { cast: false })
  round.position.set(0, 0.02, -72)
  const island = H.mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.25, 48), M.lawn, scene, { cast: false })
  island.position.set(0, 0.12, -72)
  const fountain = H.mesh(new THREE.CylinderGeometry(3, 3.2, 0.6, 40), M.stone, scene)
  fountain.position.set(0, 0.3, -72)
  const fWater = H.mesh(new THREE.CylinderGeometry(2.7, 2.7, 0.1, 40), M.water, scene, { cast: false })
  fWater.position.set(0, 0.6, -72)
  H.box(scene, 0.5, 2.2, 0.5, M.stone, 0, 0, -72)

  // clubhouse + pool
  H.flat(scene, 30, 9, M.pavers, 0, 0.03, -87.5)
  H.box(scene, 20, 0.15, 5, M.stone, 0, 0, -87.5, { cast: false })
  H.flat(scene, 18.6, 3.8, M.water, 0, 0.16, -87.5)
  H.box(scene, 26, 5.5, 12, M.wallExt, 0, 0, -98)
  H.box(scene, 22, 4, 0.1, M.darkGlass, 0, 0.6, -91.95, { cast: false })
  H.box(scene, 28, 0.4, 14, M.clad, 0, 5.5, -98)
  ;[-9, -3, 3, 9].forEach((x) => H.box(scene, 0.3, 0.3, 4, M.white, x, 0.15, -82.5)) // loungers

  // villas
  const houses = UNITS.map((u, i) => {
    const h = buildHouse(THREE, H, M, u, i)
    scene.add(h.group)
    return h
  })

  // trees (instanced)
  const trees = []
  const rnd = seeded(11)
  for (let z = -56; z <= 60; z += 8) trees.push([0, z, 0.75])
  UNITS.forEach((u) => {
    const side = u.x < 0 ? -5 : 5
    trees.push([side, u.z - 4.5, 0.9], [side, u.z + 4.5, 0.9])
  })
  houses.forEach((h, i) => {
    const p = h.toWorld([6.5, -6.6])
    trees.push([p.x, p.z, 0.9 + (i % 3) * 0.12])
  })
  for (let i = 0; i < 70; i++) {
    const side = i % 2 ? 1 : -1
    trees.push([side * (29 + rnd() * 11), -108 + rnd() * 186, 0.9 + rnd() * 0.5])
  }
  for (let i = 0; i < 16; i++) trees.push([-26 + rnd() * 52, -106 - rnd() * 4 + (i % 2) * 2, 1 + rnd() * 0.4])
  ;[[-14, -84], [14, -84], [-16, -94], [16, -94], [-8, -66], [8, -66]].forEach(([x, z]) => trees.push([x, z, 1.1]))

  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.24, 2.4, 8)
  const crownGeo = new THREE.IcosahedronGeometry(1.8, 1)
  const trunks = new THREE.InstancedMesh(trunkGeo, M.trunk, trees.length)
  const crowns = new THREE.InstancedMesh(crownGeo, M.leaf, trees.length)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  trees.forEach(([x, z, s], i) => {
    m4.compose(new THREE.Vector3(x, 1.2 * s, z), q, new THREE.Vector3(s, s, s))
    trunks.setMatrixAt(i, m4)
    m4.compose(new THREE.Vector3(x, (2.4 + 1.2) * s, z), q, new THREE.Vector3(s, s * 0.9, s))
    crowns.setMatrixAt(i, m4)
  })
  ;[trunks, crowns].forEach((im) => {
    im.castShadow = true
    im.receiveShadow = true
    scene.add(im)
  })

  // lighting
  scene.add(new THREE.HemisphereLight("#eef6ff", "#b3a98f", 2.3))
  const sun = new THREE.DirectionalLight('#fff3df', 2.6)
  sun.position.set(70, 120, 45)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -115, right: 115, top: 115, bottom: -115, near: 10, far: 330 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  sun.target.position.set(0, 0, -14)
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

// Furnished interior, added only to the villa being visited
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

  // Living
  rug(3.2, 2.4, 4.0, 1.2)
  B(2.6, 0.42, 0.95, M.fabric, 4.0, 0, -0.2)
  B(2.6, 0.5, 0.22, M.fabric, 4.0, 0.42, -0.57)
  B(0.2, 0.62, 0.95, M.fabric, 2.7, 0, -0.2)
  B(0.2, 0.62, 0.95, M.fabric, 5.3, 0, -0.2)
  B(1.15, 0.12, 0.7, M.fabricDark, 3.42, 0.42, -0.12)
  B(1.15, 0.12, 0.7, M.fabricDark, 4.58, 0.42, -0.12)
  B(0.42, 0.38, 0.12, M.navy, 3.1, 0.54, -0.42)
  B(0.42, 0.38, 0.12, M.navySoft, 4.9, 0.54, -0.42)
  B(1.1, 0.05, 0.6, M.woodLight, 4.0, 0.36, 1.3)
  B(0.9, 0.3, 0.4, M.wood, 4.0, 0.06, 1.3)
  B(0.85, 0.42, 0.85, M.navySoft, 5.3, 0, 2.5)
  B(0.2, 0.45, 0.85, M.navySoft, 5.62, 0.42, 2.5)
  plant(5.5, 4.4)
  B(0.04, 1.5, 0.04, M.black, 1.95, 0, 4.55)
  const shade = H.mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 20, 1, true), M.lamp, g, o)
  shade.position.set(1.95, 1.6, 4.55)

  // Kitchen
  B(3.8, 0.88, 0.62, M.navy, 3.9, 0, -4.64)
  B(3.86, 0.04, 0.66, M.stone, 3.9, 0.88, -4.62)
  B(0.6, 0.02, 0.45, M.black, 3.0, 0.92, -4.6)
  B(0.5, 0.02, 0.4, M.white, 4.8, 0.92, -4.6)
  B(3.2, 0.04, 0.28, M.woodLight, 3.9, 2.45, -4.82)
  B(0.7, 2.1, 0.62, M.white, 5.6, 0, -1.45)
  B(2.2, 0.9, 0.9, M.navySoft, 3.9, 0, -2.9)
  B(2.3, 0.04, 1.0, M.stone, 3.9, 0.9, -2.9)
  ;[3.3, 4.5].forEach((x) => {
    B(0.38, 0.04, 0.38, M.woodLight, x, 0.65, -2.1)
    B(0.04, 0.65, 0.04, M.black, x, 0, -2.1)
    B(0.01, 0.75, 0.01, M.black, x, 2.25, -2.9)
    ball(0.12, M.lamp, x, 2.17, -2.9)
  })

  // Master bedroom
  B(2.0, 1.1, 0.08, M.woodLight, -3.75, 0, -4.86)
  B(1.9, 0.32, 2.1, M.wood, -3.75, 0, -3.8)
  B(1.8, 0.22, 2.0, M.linen, -3.75, 0.32, -3.8)
  B(1.84, 0.07, 1.3, M.navy, -3.75, 0.54, -3.4)
  B(0.65, 0.14, 0.36, M.white, -4.2, 0.54, -4.55)
  B(0.65, 0.14, 0.36, M.white, -3.3, 0.54, -4.55)
  B(0.45, 0.5, 0.4, M.wood, -5.15, 0, -4.65)
  B(0.45, 0.5, 0.4, M.wood, -2.35, 0, -4.65)
  ball(0.11, M.lamp, -5.15, 0.65, -4.65)
  ball(0.11, M.lamp, -2.35, 0.65, -4.65)
  B(2.2, 2.3, 0.6, M.white, -4.7, 0, 0.12)
  rug(2.6, 1.6, -3.75, -2.1)

  // Bedroom 2
  B(2.0, 0.3, 1.2, M.wood, -4.95, 0, 2.7)
  B(1.95, 0.2, 1.15, M.linen, -4.95, 0.3, 2.7)
  B(1.3, 0.06, 1.18, M.navySoft, -4.6, 0.5, 2.7)
  B(0.35, 0.12, 0.6, M.white, -5.7, 0.5, 2.7)
  B(1.4, 0.04, 0.6, M.woodLight, -3.8, 0.74, 4.5)
  B(0.04, 0.74, 0.6, M.woodLight, -4.48, 0, 4.5)
  B(0.04, 0.74, 0.6, M.woodLight, -3.12, 0, 4.5)
  B(0.45, 0.45, 0.45, M.navy, -3.8, 0, 3.9)
  B(0.45, 0.5, 0.06, M.navy, -3.8, 0.45, 3.7)

  // Entrance hall
  B(0.35, 0.8, 1.4, M.wood, -1.25, 0, 0.9)
  B(0.03, 0.95, 0.95, M.navy, -1.42, 1.2, 0.9)
  if (markTexture) {
    const art = H.mesh(new THREE.PlaneGeometry(0.62, 0.64), new THREE.MeshBasicMaterial({ map: markTexture, transparent: true }), g, o)
    art.position.set(-1.39, 1.67, 0.9)
    art.rotation.y = Math.PI / 2
  }
  plant(1.05, 4.45, 1.1)

  // Bathroom
  B(1.2, 0.85, 0.5, M.woodLight, 0, 0, -4.7)
  B(1.25, 0.04, 0.54, M.white, 0, 0.85, -4.7)
  B(0.9, 0.8, 0.03, M.darkGlass, 0, 1.2, -4.92)
  B(0.4, 0.42, 0.6, M.white, 1.0, 0, -4.6)

  return g
}
