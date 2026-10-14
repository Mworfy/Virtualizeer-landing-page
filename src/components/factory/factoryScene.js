// Procedural factory for the industrial digital twin demo.
// Cutaway building (walls sectioned at 3.2 m, open roof frame) with two production
// lines, robot cells, warehouse racking, loading docks and a forklift loop.

export const STATUS = {
  running: { label: 'Running', color: '#0ca30c' },
  idle: { label: 'Idle', color: '#fab219' },
  alert: { label: 'Alert', color: '#d03b3b' },
}

export const METRICS = [
  { key: 'temp', label: 'Motor temp', unit: '°C', limit: 85, digits: 0 },
  { key: 'vib', label: 'Vibration', unit: 'mm/s', limit: 4.5, digits: 1 },
  { key: 'thr', label: 'Throughput', unit: 'units/h', digits: 0 },
  { key: 'oee', label: 'OEE', unit: '%', digits: 0 },
]

export const MACHINES = [
  { id: 'A1', name: 'CNC mill 01', line: 'Line A', kind: 'cnc', pos: [-24, -9], status: 'running', base: { temp: 58, vib: 2.1, thr: 118, oee: 86 }, maint: 12 },
  { id: 'A2', name: 'Robot cell A', line: 'Line A', kind: 'robot', pos: [-12, -9], status: 'running', base: { temp: 46, vib: 1.4, thr: 120, oee: 91 }, maint: 27 },
  { id: 'A3', name: 'Vision inspection', line: 'Line A', kind: 'tunnel', pos: [-1, -9], status: 'running', base: { temp: 38, vib: 0.6, thr: 119, oee: 94 }, maint: 40 },
  { id: 'A4', name: 'Packaging', line: 'Line A', kind: 'pack', pos: [10, -9], status: 'running', base: { temp: 41, vib: 1.8, thr: 117, oee: 88 }, maint: 9 },
  { id: 'B1', name: 'Injection moulder 02', line: 'Line B', kind: 'moulder', pos: [-23, 3], status: 'running', base: { temp: 64, vib: 2.6, thr: 74, oee: 79 }, maint: 18 },
  {
    id: 'B2', name: 'Robot cell B', line: 'Line B', kind: 'robot', pos: [-12, 3], status: 'alert', base: { temp: 84, vib: 4.9, thr: 41, oee: 52 }, maint: 0,
    alert: 'Motor temperature above 85 °C on joint J3 and vibration rising. Predicted bearing failure within 48 h.',
  },
  {
    id: 'B3', name: 'Labeller', line: 'Line B', kind: 'labeller', pos: [-1, 3], status: 'idle', base: { temp: 33, vib: 0.3, thr: 0, oee: 0 }, maint: 33,
    alert: 'Starved: waiting for parts from Robot cell B.',
  },
  { id: 'B4', name: 'Palletiser', line: 'Line B', kind: 'palletiser', pos: [10, 3], status: 'running', base: { temp: 44, vib: 1.2, thr: 40, oee: 71 }, maint: 21 },
]

export const LINES = [
  { z: -9, from: -26, to: 13, speed: 1.2 },
  { z: 3, from: -20, to: 13, speed: 0.45 },
]

const FORKLIFT_PATH = [[-29, 8.5], [15.5, 8.5], [15.5, -16], [-29, -16]]

function seeded(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function buildFactory(THREE, { markTexture } = {}) {
  const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o })
  const M = {
    grass: std('#8fb27a', { roughness: 1 }),
    yard: std('#8c939a', { roughness: 0.95 }),
    concrete: std('#d4d7da', { roughness: 0.9 }),
    wall: std('#eceae5', { roughness: 0.9 }),
    cap: std('#0f2a40', { roughness: 0.6 }),
    steel: std('#4c5a68', { roughness: 0.5, metalness: 0.4 }),
    machine: std('#e3e7eb', { roughness: 0.5 }),
    machineDark: std('#2b3a48', { roughness: 0.5 }),
    navy: std('#0f2a40', { roughness: 0.5 }),
    robot: std('#f2f3f5', { roughness: 0.35 }),
    belt: std('#22272c', { roughness: 0.9 }),
    frame: std('#5b6874', { roughness: 0.6, metalness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: '#9fc0dc', roughness: 0.05, transparent: true, opacity: 0.3, depthWrite: false }),
    yellow: std('#e9b21a', { roughness: 0.7 }),
    line: new THREE.MeshBasicMaterial({ color: '#e9b21a' }),
    lineWhite: new THREE.MeshBasicMaterial({ color: '#f4f4f2' }),
    carton: std('#c79a63', { roughness: 0.9 }),
    pallet: std('#a8825a', { roughness: 0.9 }),
    rack: std('#2f6fa8', { roughness: 0.5, metalness: 0.3 }),
    rackBeam: std('#e9772e', { roughness: 0.6 }),
    leaf: std('#5f8f55'),
    trunk: std('#7a5a3c'),
    tyre: std('#202326', { roughness: 0.9 }),
    truck: std('#f1f2f3', { roughness: 0.4, metalness: 0.3 }),
    lightStrip: new THREE.MeshStandardMaterial({ color: '#dff3ff', emissive: '#bfe6ff', emissiveIntensity: 1.4 }),
    screen: new THREE.MeshStandardMaterial({ color: '#0f2a40', emissive: '#2f6fa8', emissiveIntensity: 0.8 }),
  }

  const add = (geo, mat, parent, { cast = true, receive = true } = {}) => {
    const m = new THREE.Mesh(geo, mat)
    m.castShadow = cast
    m.receiveShadow = receive
    parent.add(m)
    return m
  }
  const box = (parent, w, h, d, mat, x, y, z, opt) => {
    const m = add(new THREE.BoxGeometry(w, h, d), mat, parent, opt)
    m.position.set(x, y + h / 2, z)
    return m
  }
  const cyl = (parent, rt, rb, h, mat, x, y, z, opt, seg = 20) => {
    const m = add(new THREE.CylinderGeometry(rt, rb, h, seg), mat, parent, opt)
    m.position.set(x, y + h / 2, z)
    return m
  }
  const flat = (parent, w, d, mat, x, y, z) => {
    const m = add(new THREE.PlaneGeometry(w, d), mat, parent, { cast: false, receive: true })
    m.rotation.x = -Math.PI / 2
    m.position.set(x, y, z)
    return m
  }
  const outline = (parent, x0, z0, x1, z1, mat, y = 0.03, w = 0.12) => {
    flat(parent, x1 - x0, w, mat, (x0 + x1) / 2, y, z0)
    flat(parent, x1 - x0, w, mat, (x0 + x1) / 2, y, z1)
    flat(parent, w, z1 - z0, mat, x0, y, (z0 + z1) / 2)
    flat(parent, w, z1 - z0, mat, x1, y, (z0 + z1) / 2)
  }
  const noShadow = { cast: false, receive: false }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#d3e4f1')
  scene.fog = new THREE.Fog('#d8e7f2', 140, 380)

  // ── Site ──
  flat(scene, 700, 700, M.grass, 0, -0.02, 0)
  flat(scene, 110, 84, M.yard, 4, 0, 4)
  for (let i = 0; i < 12; i++) flat(scene, 0.15, 5, M.lineWhite, -26 + i * 4, 0.01, 34)
  const carCols = ['#e6e8ea', '#1d3347', '#9aa5b1', '#2f6fa8', '#e6e8ea']
  ;[-24, -16, -12, -4, 4, 12, 16].forEach((x, i) => {
    const c = std(carCols[i % carCols.length], { metalness: 0.5, roughness: 0.35 })
    box(scene, 1.9, 0.62, 4.3, c, x, 0.3, 34)
    box(scene, 1.7, 0.55, 2.3, c, x, 0.92, 34.3)
  })

  // ── Building shell: cutaway walls with navy section caps ──
  flat(scene, 64, 40, M.concrete, 0, 0.02, 0)
  const H = 3.2
  const wallX = (z, x0, x1) => {
    box(scene, x1 - x0, H, 0.4, M.wall, (x0 + x1) / 2, 0, z)
    box(scene, x1 - x0, 0.08, 0.42, M.cap, (x0 + x1) / 2, H, z, noShadow)
  }
  const wallZ = (x, z0, z1) => {
    box(scene, 0.4, H, z1 - z0, M.wall, x, 0, (z0 + z1) / 2)
    box(scene, 0.42, 0.08, z1 - z0, M.cap, x, H, (z0 + z1) / 2, noShadow)
  }
  wallX(-20, -32, 32)
  wallX(20, -32, -2)
  wallX(20, 4, 32) // personnel entrance gap
  wallZ(-32, -20, 20)
  wallZ(32, -20, 8.6)
  wallZ(32, 12.8, 13.6)
  wallZ(32, 17.8, 20) // two dock doors

  // Steel frame: columns + roof beams (roof removed for the cutaway)
  const cols = [-30, -18, -6, 6, 18, 30]
  cols.forEach((x) => {
    ;[-19.4, -3, 19.4].forEach((z) => box(scene, 0.45, 9, 0.45, M.steel, x, 0, z))
    box(scene, 0.3, 0.6, 39, M.steel, x, 9, 0)
  })
  ;[-19.4, -3, 19.4].forEach((z) => box(scene, 60.5, 0.5, 0.3, M.steel, 0, 9, z))

  // Floor markings: forklift lane + safety zones
  const loop = FORKLIFT_PATH
  for (let i = 0; i < loop.length; i++) {
    const [ax, az] = loop[i]
    const [bx, bz] = loop[(i + 1) % loop.length]
    const len = Math.hypot(bx - ax, bz - az)
    ;[-1.6, 1.6].forEach((off) => {
      const horizontal = az === bz
      const m = flat(scene, horizontal ? len + 3.2 : 0.14, horizontal ? 0.14 : len + 3.2, M.line, (ax + bx) / 2 + (horizontal ? 0 : off), 0.025, (az + bz) / 2 + (horizontal ? off : 0))
      m.receiveShadow = true
    })
  }
  outline(scene, -15.5, -14, -8.5, -6.5, M.line)
  outline(scene, -15.5, -2, -8.5, 5.5, M.line)
  outline(scene, 7, 0.5, 14, 8, M.line)

  // ── Conveyors ──
  LINES.forEach((l) => {
    const len = l.to - l.from
    const cx = (l.from + l.to) / 2
    box(scene, len, 0.12, 1.1, M.frame, cx, 0.72, l.z)
    box(scene, len, 0.04, 0.9, M.belt, cx, 0.84, l.z, { cast: false })
    box(scene, len, 0.18, 0.06, M.yellow, cx, 0.86, l.z - 0.55, { cast: false })
    box(scene, len, 0.18, 0.06, M.yellow, cx, 0.86, l.z + 0.55, { cast: false })
    for (let x = l.from + 0.6; x < l.to; x += 2.5) {
      box(scene, 0.08, 0.72, 0.08, M.frame, x, 0, l.z - 0.45)
      box(scene, 0.08, 0.72, 0.08, M.frame, x, 0, l.z + 0.45)
    }
  })
  const cartonGeo = new THREE.BoxGeometry(0.6, 0.45, 0.5)
  const flows = LINES.map((l) => {
    const count = Math.floor((l.to - l.from) / 2.2)
    const im = new THREE.InstancedMesh(cartonGeo, M.carton, count)
    im.castShadow = false
    im.receiveShadow = true
    scene.add(im)
    return { ...l, im, count, spacing: (l.to - l.from) / count }
  })

  // ── Machines ──
  const robotArm = (parent, x, z, scale = 1) => {
    const base = new THREE.Group()
    base.position.set(x, 0, z)
    base.scale.setScalar(scale)
    parent.add(base)
    cyl(base, 0.55, 0.7, 0.5, M.machineDark, 0, 0, 0)
    const turret = new THREE.Group()
    turret.position.y = 0.5
    base.add(turret)
    cyl(turret, 0.42, 0.48, 0.6, M.robot, 0, 0, 0)
    const shoulder = new THREE.Group()
    shoulder.position.y = 0.6
    turret.add(shoulder)
    add(new THREE.SphereGeometry(0.34, 16, 12), M.navy, shoulder)
    box(shoulder, 0.36, 1.8, 0.38, M.robot, 0, 0, 0)
    const elbow = new THREE.Group()
    elbow.position.y = 1.8
    shoulder.add(elbow)
    add(new THREE.SphereGeometry(0.28, 16, 12), M.navy, elbow)
    box(elbow, 0.28, 1.5, 0.3, M.robot, 0, 0, 0)
    const wrist = new THREE.Group()
    wrist.position.y = 1.5
    elbow.add(wrist)
    box(wrist, 0.32, 0.25, 0.32, M.navy, 0, 0, 0)
    box(wrist, 0.08, 0.3, 0.3, M.machineDark, -0.1, 0.2, 0)
    box(wrist, 0.08, 0.3, 0.3, M.machineDark, 0.1, 0.2, 0)
    return { turret, shoulder, elbow }
  }

  const machines = MACHINES.map((m, i) => {
    const g = new THREE.Group()
    const [x, z] = m.pos
    g.position.set(x, 0, z)
    scene.add(g)
    let arm = null
    switch (m.kind) {
      case 'cnc':
        box(g, 4.2, 2.8, 3.2, M.machine, 0, 0, 0)
        box(g, 4.25, 0.35, 3.25, M.navy, 0, 2.1, 0)
        box(g, 2.2, 1.2, 0.05, M.glass, -0.3, 0.9, 1.62, noShadow)
        box(g, 0.7, 1.6, 0.5, M.machineDark, 2.6, 0, 1.2)
        box(g, 0.5, 0.4, 0.04, M.screen, 2.6, 1.2, 1.46, noShadow)
        break
      case 'moulder':
        box(g, 6.5, 1.6, 2.2, M.machine, 0, 0, 0)
        box(g, 2.4, 0.8, 2.25, M.navy, 1.5, 1.6, 0)
        cyl(g, 0.5, 0.15, 1.1, M.machineDark, -2, 1.6, 0)
        cyl(g, 0.55, 0.55, 0.5, M.machineDark, -2, 2.7, 0)
        box(g, 0.5, 0.4, 0.04, M.screen, -0.4, 1.0, 1.12, noShadow)
        break
      case 'robot':
        flat(g, 6.6, 6.6, new THREE.MeshStandardMaterial({ color: '#e9b21a', transparent: true, opacity: 0.12 }), 0, 0.028, -1.2)
        arm = robotArm(g, 0, -2.2)
        box(g, 1.2, 0.9, 1.2, M.machineDark, 2.2, 0, -2.4)
        break
      case 'palletiser':
        arm = robotArm(g, 0, 2.2, 0.9)
        box(g, 1.2, 0.15, 1.0, M.pallet, 2.2, 0, 2.8)
        for (let k = 0; k < 6; k++) box(g, 0.55, 0.45, 0.45, M.carton, 1.9 + (k % 2) * 0.6, 0.15 + Math.floor(k / 2) * 0.46, 2.8)
        box(g, 1.2, 0.15, 1.0, M.pallet, -2.2, 0, 2.8)
        break
      case 'tunnel':
        box(g, 0.5, 2.4, 1.8, M.machine, -1.1, 0, 0)
        box(g, 0.5, 2.4, 1.8, M.machine, 1.1, 0, 0)
        box(g, 2.7, 0.6, 1.9, M.navy, 0, 2.4, 0)
        box(g, 2.0, 0.06, 1.2, M.lightStrip, 0, 2.36, 0, noShadow)
        break
      case 'pack':
        box(g, 3.4, 2.4, 2.8, M.machine, 0, 0, 0)
        box(g, 3.45, 0.3, 2.85, M.navy, 0, 1.8, 0)
        box(g, 1.6, 0.9, 0.05, M.glass, 0, 1.0, 1.42, noShadow)
        break
      case 'labeller':
        box(g, 1.4, 1.9, 2.2, M.machine, 0, 0, 0)
        cyl(g, 0.4, 0.4, 0.2, M.navy, 0, 1.9, 0.4)
        box(g, 0.45, 0.35, 0.04, M.screen, 0.2, 1.2, 1.12, noShadow)
        break
    }
    // status beacon
    const st = STATUS[m.status]
    const beaconMat = new THREE.MeshStandardMaterial({ color: st.color, emissive: st.color, emissiveIntensity: 0.9 })
    const poleX = m.kind === 'robot' ? 2.2 : m.kind === 'moulder' ? 3.0 : 1.9
    const poleZ = m.kind === 'robot' ? -2.4 : m.kind === 'palletiser' ? 1.0 : -1.2
    box(g, 0.08, 3.6, 0.08, M.steel, poleX, 0, poleZ)
    const beacon = add(new THREE.SphereGeometry(0.32, 20, 14), beaconMat, g, noShadow)
    beacon.position.set(poleX, 3.85, poleZ)
    const halo = add(
      new THREE.SphereGeometry(0.6, 20, 14),
      new THREE.MeshBasicMaterial({ color: st.color, transparent: true, opacity: 0.25, depthWrite: false }),
      g,
      noShadow,
    )
    halo.position.copy(beacon.position)

    const pick = new THREE.Mesh(
      new THREE.BoxGeometry(m.kind === 'moulder' ? 7 : 5.4, 4.6, 5.4),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
    )
    pick.position.set(0, 2.3, m.kind === 'robot' ? -1.2 : m.kind === 'palletiser' ? 1.2 : 0)
    pick.userData.machine = i
    g.add(pick)

    // hover/selection ring
    const ring = add(
      new THREE.RingGeometry(3.3, 3.55, 64),
      new THREE.MeshBasicMaterial({ color: '#2f6fa8', transparent: true, opacity: 0.9, depthWrite: false }),
      g,
      noShadow,
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.set(0, 0.04, pick.position.z)
    ring.visible = false

    return { group: g, data: m, arm, beacon, halo, pick, ring }
  })

  // ── Warehouse racking ──
  const rnd = seeded(5)
  ;[-15, -9, -3, 3].forEach((z) => {
    for (let x = 19; x <= 30; x += 2.8) {
      ;[-0.55, 0.55].forEach((dz) => box(scene, 0.12, 6, 0.12, M.rack, x - 1.35, 0, z + dz))
      ;[-0.55, 0.55].forEach((dz) => box(scene, 0.12, 6, 0.12, M.rack, x + 1.35, 0, z + dz))
      ;[0.15, 2.1, 4.05].forEach((y) => {
        box(scene, 2.8, 0.14, 0.12, M.rackBeam, x, y, z - 0.55)
        box(scene, 2.8, 0.14, 0.12, M.rackBeam, x, y, z + 0.55)
        if (rnd() > 0.2) {
          box(scene, 1.15, 0.14, 1.0, M.pallet, x - 0.65, y + 0.14, z)
          box(scene, 1.0, 0.9 + rnd() * 0.5, 0.9, M.carton, x - 0.65, y + 0.28, z)
        }
        if (rnd() > 0.3) {
          box(scene, 1.15, 0.14, 1.0, M.pallet, x + 0.65, y + 0.14, z)
          box(scene, 1.0, 0.9 + rnd() * 0.5, 0.9, M.carton, x + 0.65, y + 0.28, z)
        }
      })
    }
  })

  // ── Control room ──
  box(scene, 10, 0.2, 8, M.machine, -25, 0, 15)
  box(scene, 10, 3.2, 0.12, M.glass, -25, 0.2, 11, noShadow)
  box(scene, 0.12, 3.2, 8, M.glass, -20, 0.2, 15, noShadow)
  box(scene, 10.2, 0.25, 8.2, M.navy, -25, 3.4, 15)
  box(scene, 4, 0.8, 1, M.machineDark, -25, 0.2, 13)
  ;[-26.4, -25, -23.6].forEach((x) => box(scene, 1.2, 0.75, 0.06, M.screen, x, 1.05, 12.6, noShadow))
  if (markTexture) {
    const logo = add(new THREE.PlaneGeometry(2.6, 2.7), new THREE.MeshBasicMaterial({ map: markTexture, transparent: true }), scene, noShadow)
    logo.rotation.x = -Math.PI / 2
    logo.position.set(-25, 3.56, 15)
  }

  // ── Loading docks + truck ──
  ;[10.7, 15.7].forEach((z) => {
    box(scene, 0.3, 0.6, 4, M.yellow, 32.2, 3.2, z, noShadow)
    flat(scene, 6, 4, M.concrete, 35, 0.015, z)
  })
  box(scene, 12, 3.4, 2.5, M.truck, 41, 1.0, 10.7)
  box(scene, 12.05, 0.4, 2.55, M.navy, 41, 2.2, 10.7, noShadow)
  box(scene, 2.6, 2.6, 2.5, M.navy, 48.6, 0.6, 10.7)
  box(scene, 0.05, 1, 2.2, M.glass, 49.92, 1.9, 10.7, noShadow)
  ;[[37, 9.4], [37, 12], [45, 9.4], [45, 12], [48.6, 9.4], [48.6, 12]].forEach(([x, z]) => {
    const w = add(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16), M.tyre, scene)
    w.rotation.x = Math.PI / 2
    w.position.set(x, 0.5, z)
  })

  // ── Forklift ──
  const fork = new THREE.Group()
  box(fork, 1.2, 0.9, 2.2, M.yellow, 0, 0.25, 0)
  box(fork, 1.1, 0.06, 1.2, M.machineDark, 0, 2.2, -0.2)
  ;[[-0.5, -0.7], [0.5, -0.7], [-0.5, 0.3], [0.5, 0.3]].forEach(([x, z]) => box(fork, 0.05, 1.1, 0.05, M.machineDark, x, 1.15, z))
  box(fork, 0.9, 2.4, 0.12, M.machineDark, 0, 0, 1.2)
  box(fork, 0.12, 0.06, 1.1, M.steel, -0.3, 0.2, 1.8)
  box(fork, 0.12, 0.06, 1.1, M.steel, 0.3, 0.2, 1.8)
  box(fork, 1.1, 0.14, 1.0, M.pallet, 0, 0.26, 1.8)
  box(fork, 0.95, 0.8, 0.85, M.carton, 0, 0.4, 1.8)
  ;[[-0.62, -0.7], [0.62, -0.7], [-0.62, 0.7], [0.62, 0.7]].forEach(([x, z]) => {
    const w = add(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14), M.tyre, fork)
    w.rotation.z = Math.PI / 2
    w.position.set(x, 0.28, z)
  })
  fork.traverse((o) => (o.castShadow = false))
  scene.add(fork)
  const loopLens = loop.map((p, i) => {
    const q = loop[(i + 1) % loop.length]
    return Math.hypot(q[0] - p[0], q[1] - p[1])
  })
  const loopTotal = loopLens.reduce((a, b) => a + b, 0)

  // ── Trees ──
  const trees = []
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2
    trees.push([4 + Math.cos(a) * (66 + rnd() * 10), 4 + Math.sin(a) * (52 + rnd() * 8), 0.9 + rnd() * 0.5])
  }
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 2.4, 8), M.trunk, trees.length)
  const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.9, 1), M.leaf, trees.length)
  const m4 = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  trees.forEach(([x, z, s], i) => {
    m4.compose(new THREE.Vector3(x, 1.2 * s, z), q, new THREE.Vector3(s, s, s))
    trunks.setMatrixAt(i, m4)
    m4.compose(new THREE.Vector3(x, 3.7 * s, z), q, new THREE.Vector3(s, s, s))
    crowns.setMatrixAt(i, m4)
  })
  ;[trunks, crowns].forEach((im) => {
    im.castShadow = true
    scene.add(im)
  })

  // ── Light ──
  scene.add(new THREE.HemisphereLight('#eef6ff', '#a9a08a', 2.0))
  const sun = new THREE.DirectionalLight('#fff3df', 2.4)
  sun.position.set(45, 90, 55)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 60, bottom: -60, near: 10, far: 250 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  scene.add(sun, sun.target)
  const fill = new THREE.DirectionalLight('#e3edf7', 0.8)
  fill.position.set(-50, 40, -40)
  scene.add(fill)

  // ── Animation ──
  const dummy = new THREE.Object3D()
  const animate = (t, { motion = true } = {}) => {
    const time = motion ? t : 0
    flows.forEach((f) => {
      for (let i = 0; i < f.count; i++) {
        const len = f.to - f.from
        const x = f.from + ((((time * f.speed + i * f.spacing) % len) + len) % len)
        dummy.position.set(x, 1.1, f.z)
        dummy.updateMatrix()
        f.im.setMatrixAt(i, dummy.matrix)
      }
      f.im.instanceMatrix.needsUpdate = true
    })
    machines.forEach((m, i) => {
      if (m.arm) {
        const stalled = m.data.status === 'alert'
        const k = stalled ? 0.15 : 1
        const ph = i * 1.7
        m.arm.turret.rotation.y = Math.sin(time * 0.9 * k + ph) * 1.3
        m.arm.shoulder.rotation.z = -0.45 + Math.sin(time * 1.2 * k + ph) * 0.35
        m.arm.elbow.rotation.z = 1.25 + Math.sin(time * 1.4 * k + ph + 1) * 0.45
      }
      const pulse = m.data.status === 'alert' && motion ? 0.5 + 0.5 * Math.sin(t * 4) : 0.6
      m.halo.material.opacity = m.data.status === 'alert' ? 0.15 + pulse * 0.35 : 0.18
      m.halo.scale.setScalar(m.data.status === 'alert' ? 1 + pulse * 0.6 : 1)
    })
    // forklift
    let d = ((time * 3) % loopTotal + loopTotal) % loopTotal
    let s = 0
    while (d > loopLens[s]) d -= loopLens[s++]
    const [ax, az] = loop[s]
    const [bx, bz] = loop[(s + 1) % loop.length]
    const k = d / loopLens[s]
    fork.position.set(ax + (bx - ax) * k, 0, az + (bz - az) * k)
    fork.rotation.y = Math.atan2(bx - ax, bz - az)
  }
  animate(0)

  return { scene, machines, animate }
}
