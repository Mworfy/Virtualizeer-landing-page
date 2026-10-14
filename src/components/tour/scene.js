// Procedural apartment used by the built-in interactive tour.
// Plan (metres, x → right, z → down on the minimap):
//   Living room  x[-5,0] z[-3,3]   Kitchen/dining x[0,5] z[-3,3]   Bedroom x[-5,0] z[3,7]

export const H = 2.8 // ceiling height
export const EYE = 1.6

export const POINTS = [
  { name: 'Living room', pos: [-2.3, 1.9], yaw: 0.12 },
  { name: 'Dining area', pos: [1.0, -0.6], yaw: -Math.PI / 2 + 0.7 },
  { name: 'Kitchen', pos: [1.3, 1.6], yaw: -Math.PI / 2 - 0.2 },
  { name: 'Bedroom', pos: [-1.0, 3.9], yaw: Math.PI - 0.35 },
]

// Every move passes through this point so the camera walks through doorways, not walls.
export const HUB = [-0.6, 1.0]

// Wall segments [x1, z1, x2, z2] — also drawn on the minimap.
export const WALLS = [
  [-5, -3, 5, -3],
  [-5, -3, -5, 7],
  [5, -3, 5, 3],
  [0, 3, 5, 3],
  [-5, 7, 0, 7],
  [0, 3, 0, 7],
  [-5, 3, -1.6, 3], // living | bedroom, door at x[-1.6,-0.4]
  [-0.4, 3, 0, 3],
  [0, -3, 0, -1.5], // living | kitchen, opening at z[-1.5,1.5]
  [0, 1.5, 0, 3],
]

export function canvasTexture(THREE, w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function woodTexture(THREE) {
  const t = canvasTexture(THREE, 512, 512, (g) => {
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const plankH = 64
    for (let y = 0; y < 512; y += plankH) {
      let x = -((y / plankH) % 2) * 160
      while (x < 512) {
        const w = 320
        g.fillStyle = `hsl(30, 30%, ${66 + rnd() * 9}%)`
        g.fillRect(x, y, w, plankH)
        g.strokeStyle = 'rgba(90,60,30,0.10)'
        g.lineWidth = 1
        for (let i = 0; i < 7; i++) {
          const yy = y + rnd() * plankH
          g.beginPath()
          g.moveTo(x, yy)
          g.bezierCurveTo(x + 100, yy + 3, x + 200, yy - 3, x + w, yy)
          g.stroke()
        }
        g.fillStyle = 'rgba(60,40,20,.28)'
        g.fillRect(x, y, 2, plankH)
        x += w
      }
      g.fillStyle = 'rgba(60,40,20,.28)'
      g.fillRect(0, y, 512, 2)
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(5, 5)
  t.anisotropy = 8
  return t
}

function skyTexture(THREE) {
  return canvasTexture(THREE, 512, 512, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#7fb0dc')
    grad.addColorStop(0.7, '#d9e9f6')
    grad.addColorStop(1, '#eef4f9')
    g.fillStyle = grad
    g.fillRect(0, 0, w, h)
    // distant skyline
    let x = 0
    let s = 3
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    g.fillStyle = '#b7cbdd'
    while (x < w) {
      const bw = 30 + rnd() * 50
      const bh = 60 + rnd() * 140
      g.fillRect(x, h - bh, bw, bh)
      x += bw + 4
    }
    g.fillStyle = '#9fb48f'
    for (let i = 0; i < 14; i++) {
      g.beginPath()
      g.arc(rnd() * w, h - 10, 30 + rnd() * 30, 0, Math.PI * 2)
      g.fill()
    }
  })
}

export function buildScene(THREE, { markTexture }) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#e7edf3')

  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts })
  const M = {
    wall: mat('#f3f2ef', { roughness: 0.95 }),
    navyWall: mat('#0f2a40', { roughness: 0.9 }),
    ceiling: mat('#fbfbfa', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.55 }),
    floor: new THREE.MeshStandardMaterial({ map: woodTexture(THREE), roughness: 0.7 }),
    fabric: mat('#c7cbd0'),
    fabricDark: mat('#9aa3ad'),
    navy: mat('#0f2a40', { roughness: 0.6 }),
    navySoft: mat('#2b4a66'),
    wood: mat('#a87d55', { roughness: 0.6 }),
    woodLight: mat('#c9a57f', { roughness: 0.6 }),
    white: mat('#f7f7f5', { roughness: 0.4 }),
    stone: mat('#e9e6e1', { roughness: 0.3 }),
    black: mat('#1b1f24', { roughness: 0.4 }),
    frame: mat('#2a2f35', { roughness: 0.5 }),
    rug: mat('#dcd5c9', { roughness: 1 }),
    plant: mat('#4f7a52'),
    pot: mat('#e3ddd3'),
    linen: mat('#fafafa', { roughness: 0.9 }),
    lamp: new THREE.MeshStandardMaterial({ color: '#fff6e5', emissive: '#ffe2b0', emissiveIntensity: 1.2 }),
    sky: new THREE.MeshBasicMaterial({ map: skyTexture(THREE) }),
  }

  const box = (w, h, d, m, x, y, z, parent = scene) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    mesh.position.set(x, y + h / 2, z)
    parent.add(mesh)
    return mesh
  }

  // Floor & ceiling
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), M.floor)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, 2)
  scene.add(floor)
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), M.ceiling)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, H, 2)
  scene.add(ceiling)

  // Walls
  const T = 0.12
  WALLS.forEach(([x1, z1, x2, z2]) => {
    const len = Math.hypot(x2 - x1, z2 - z1) + T
    const horizontal = z1 === z2
    box(horizontal ? len : T, H, horizontal ? T : len, M.wall, (x1 + x2) / 2, 0, (z1 + z2) / 2)
  })
  // navy feature wall (living room, west) drawn as a panel just inside the wall
  box(0.02, H, 6, M.navyWall, -4.93, 0, 0)

  // Windows: sky plane + frame
  const windowOn = ({ x, z, w, y0, y1, axis }) => {
    const h = y1 - y0
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.sky)
    const g = new THREE.Group()
    g.add(sky)
    const f = 0.06
    box(w + f * 2, f, f * 1.5, M.frame, 0, -h / 2 - f, 0, g)
    box(w + f * 2, f, f * 1.5, M.frame, 0, h / 2, 0, g)
    box(f, h, f * 1.5, M.frame, -w / 2 - f / 2, -h / 2, 0, g)
    box(f, h, f * 1.5, M.frame, w / 2 + f / 2, -h / 2, 0, g)
    box(f * 0.7, h, f, M.frame, 0, -h / 2, 0, g)
    box(w + 0.3, 0.04, 0.22, M.white, 0, -h / 2 - f - 0.04, 0.08, g) // sill
    g.position.set(x, y0 + h / 2, z)
    if (axis === 'x') g.rotation.y = Math.PI / 2
    if (axis === '-z') g.rotation.y = Math.PI
    scene.add(g)
  }
  windowOn({ x: -2.5, z: -2.93, w: 3.0, y0: 0.45, y1: 2.45 })
  windowOn({ x: 2.6, z: -2.93, w: 2.0, y0: 0.9, y1: 2.35 })
  windowOn({ x: -4.93, z: 5.0, w: 1.6, y0: 0.9, y1: 2.3, axis: 'x' })

  // ── Living room ──
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), M.rug)
  rug.rotation.x = -Math.PI / 2
  rug.position.set(-2.5, 0.006, -0.9)
  scene.add(rug)
  // sofa (faces +z, back to the window)
  box(2.3, 0.42, 0.95, M.fabric, -2.5, 0, -1.95)
  box(2.3, 0.5, 0.22, M.fabric, -2.5, 0.42, -2.31)
  box(0.2, 0.62, 0.95, M.fabric, -3.65, 0, -1.95)
  box(0.2, 0.62, 0.95, M.fabric, -1.35, 0, -1.95)
  box(0.95, 0.12, 0.7, M.fabricDark, -2.98, 0.42, -1.85)
  box(0.95, 0.12, 0.7, M.fabricDark, -2.02, 0.42, -1.85)
  box(0.42, 0.38, 0.12, M.navy, -3.3, 0.54, -2.12)
  box(0.42, 0.38, 0.12, M.navySoft, -1.7, 0.54, -2.12)
  // coffee table
  box(1.1, 0.05, 0.6, M.woodLight, -2.5, 0.36, -0.75)
  box(0.9, 0.3, 0.4, M.wood, -2.5, 0.06, -0.75)
  box(0.25, 0.06, 0.18, M.navy, -2.7, 0.41, -0.7)
  // side table + floor lamp
  box(0.45, 0.5, 0.45, M.wood, -4.2, 0, -2.0)
  box(0.04, 1.5, 0.04, M.black, -4.4, 0, -2.5)
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.3, 24, 1, true), M.lamp)
  shade.position.set(-4.4, 1.6, -2.5)
  scene.add(shade)
  // TV wall (faces the sofa)
  box(2.0, 0.45, 0.42, M.navy, -2.5, 0, 2.7)
  box(1.4, 0.8, 0.05, M.black, -2.5, 0.9, 2.86)
  // plant
  const plant = (x, z, s = 1) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * s, 0.16 * s, 0.4 * s, 20), M.pot)
    pot.position.set(x, 0.2 * s, z)
    scene.add(pot)
    ;[[0, 0.75, 0, 0.32], [0.12, 0.95, 0.06, 0.24], [-0.1, 1.05, -0.05, 0.2]].forEach(([dx, y, dz, r]) => {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(r * s, 16, 12), M.plant)
      leaf.position.set(x + dx * s, y * s, z + dz * s)
      scene.add(leaf)
    })
  }
  plant(-0.6, -2.5)
  plant(-4.5, 2.5, 1.15)
  // brand art on the navy wall
  if (markTexture) {
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 1.14),
      new THREE.MeshBasicMaterial({ map: markTexture, transparent: true }),
    )
    art.position.set(-4.9, 1.65, -0.2)
    art.rotation.y = Math.PI / 2
    scene.add(art)
  }
  // shelf on navy wall
  box(0.25, 0.04, 1.6, M.woodLight, -4.8, 0.95, 1.6)
  box(0.18, 0.28, 0.2, M.white, -4.8, 0.99, 1.2)
  box(0.18, 0.2, 0.3, M.woodLight, -4.8, 0.99, 1.9)

  // ── Kitchen & dining ──
  box(0.62, 0.88, 4.2, M.navy, 4.62, 0, -0.75) // base cabinets
  box(0.68, 0.04, 4.24, M.stone, 4.6, 0.88, -0.75) // counter
  box(0.36, 0.7, 4.2, M.white, 4.74, 1.55, -0.75) // upper cabinets
  box(0.02, 0.6, 4.2, M.stone, 4.93, 0.92, -0.75) // splashback
  box(0.5, 0.02, 0.4, M.black, 4.6, 0.925, -1.2) // hob
  box(0.42, 0.02, 0.5, M.white, 4.6, 0.925, 0.3) // sink
  box(0.7, 2.2, 0.66, M.white, 4.62, 0, 1.95) // fridge column
  // island
  box(0.95, 0.9, 1.9, M.navySoft, 3.0, 0, 1.0)
  box(1.05, 0.04, 2.0, M.stone, 3.0, 0.9, 1.0)
  ;[0.4, 1.0, 1.6].forEach((z) => {
    box(0.36, 0.04, 0.36, M.woodLight, 2.2, 0.65, z)
    box(0.04, 0.65, 0.04, M.black, 2.2, 0, z)
  })
  // dining table + chairs
  box(1.6, 0.05, 0.9, M.woodLight, 2.4, 0.72, -1.7)
  ;[[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]].forEach(([dx, dz]) =>
    box(0.05, 0.72, 0.05, M.wood, 2.4 + dx, 0, -1.7 + dz),
  )
  ;[[-0.4, -0.65], [0.4, -0.65], [-0.4, 0.65], [0.4, 0.65]].forEach(([dx, dz]) => {
    box(0.42, 0.04, 0.42, M.navy, 2.4 + dx, 0.45, -1.7 + dz)
    box(0.42, 0.45, 0.04, M.navy, 2.4 + dx, 0.49, -1.7 + dz + (dz > 0 ? 0.19 : -0.19))
    box(0.36, 0.45, 0.36, M.black, 2.4 + dx, 0, -1.7 + dz).scale.set(0.12, 1, 0.12)
  })
  // pendants
  const pendant = (x, z, drop = 0.9) => {
    box(0.01, drop, 0.01, M.black, x, H - drop, z)
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), M.lamp)
    bulb.position.set(x, H - drop - 0.08, z)
    scene.add(bulb)
  }
  pendant(3.0, 0.5)
  pendant(3.0, 1.5)
  pendant(2.4, -1.7, 1.05)
  plant(0.6, 2.5, 0.9)

  // ── Bedroom ──
  box(1.9, 1.05, 0.08, M.woodLight, -2.6, 0, 6.9) // headboard
  box(1.8, 0.32, 2.1, M.wood, -2.6, 0, 5.85)
  box(1.72, 0.22, 2.0, M.linen, -2.6, 0.32, 5.85)
  box(1.76, 0.07, 1.25, M.navy, -2.6, 0.54, 5.35)
  box(0.62, 0.14, 0.36, M.white, -3.0, 0.54, 6.6)
  box(0.62, 0.14, 0.36, M.white, -2.2, 0.54, 6.6)
  box(0.45, 0.5, 0.4, M.wood, -3.85, 0, 6.6)
  box(0.45, 0.5, 0.4, M.wood, -1.35, 0, 6.6)
  ;[-3.85, -1.35].forEach((x) => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), M.lamp)
    l.position.set(x, 0.65, 6.6)
    scene.add(l)
  })
  box(0.6, 2.1, 1.6, M.white, -0.35, 0, 5.6) // wardrobe
  const bedRug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), M.rug)
  bedRug.rotation.x = -Math.PI / 2
  bedRug.position.set(-2.6, 0.006, 4.4)
  scene.add(bedRug)

  // Doorway trim (makes openings read as doors)
  box(0.05, 2.1, 0.14, M.white, -1.6, 0, 3)
  box(0.05, 2.1, 0.14, M.white, -0.4, 0, 3)
  box(1.2, 0.7, T + 0.01, M.wall, -1.0, 2.1, 3)

  // Lighting
  scene.add(new THREE.HemisphereLight('#ffffff', '#c9b79e', 2.2))
  const sun = new THREE.DirectionalLight('#fff4e0', 1.6)
  sun.position.set(-2, 6, -8)
  scene.add(sun)
  const fill = new THREE.DirectionalLight('#dce8f5', 0.6)
  fill.position.set(6, 4, 8)
  scene.add(fill)
  ;[[-2.5, 0], [2.7, 0], [-2.5, 5]].forEach(([x, z]) => {
    const p = new THREE.PointLight('#ffe8c8', 3.2, 0, 2)
    p.position.set(x, H - 0.3, z)
    scene.add(p)
  })

  return scene
}
