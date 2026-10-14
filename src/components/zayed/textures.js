// Procedural textures (no external image assets)

export function canvasTexture(THREE, w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function seeded(seed) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function woodTexture(THREE) {
  const rnd = seeded(7)
  const t = canvasTexture(THREE, 512, 512, (g) => {
    const plankH = 64
    for (let y = 0; y < 512; y += plankH) {
      let x = -((y / plankH) % 2) * 160
      while (x < 512) {
        const w = 320
        g.fillStyle = `hsl(30, 30%, ${66 + rnd() * 9}%)`
        g.fillRect(x, y, w, plankH)
        g.strokeStyle = 'rgba(90,60,30,0.10)'
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
  t.anisotropy = 8
  return t
}

// Speckled noise for grass, asphalt, paving: base colour with light/dark flecks
export function noiseTexture(THREE, base, { light = 0.06, dark = 0.08, count = 9000, size = 2, seed = 3, repeat = 1 } = {}) {
  const rnd = seeded(seed)
  const t = canvasTexture(THREE, 256, 256, (g, w, h) => {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < count; i++) {
      const v = rnd()
      g.fillStyle = v < 0.5 ? `rgba(255,255,255,${light * rnd()})` : `rgba(0,0,0,${dark * rnd()})`
      g.fillRect(rnd() * w, rnd() * h, size * (0.5 + rnd()), size * (0.5 + rnd()))
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 8
  return t
}

// Large square paving with joints
export function paverTexture(THREE, base = '#d6cfc3', repeat = 1) {
  const rnd = seeded(9)
  const t = canvasTexture(THREE, 256, 256, (g, w, h) => {
    g.fillStyle = base
    g.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 64)
      for (let x = 0; x < w; x += 64) {
        g.fillStyle = `rgba(0,0,0,${0.02 + rnd() * 0.05})`
        g.fillRect(x + 2, y + 2, 60, 60)
      }
    g.fillStyle = 'rgba(0,0,0,.18)'
    for (let i = 0; i <= w; i += 64) {
      g.fillRect(i, 0, 2, h)
      g.fillRect(0, i, w, 2)
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 8
  return t
}
