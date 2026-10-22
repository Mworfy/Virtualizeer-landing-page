// The Virtualizeer mascot, built from primitives to match the pose sheet in "new design":
// white rounded head, black visor with glowing arc eyes, navy ear pods with gold rings and
// antennas, navy chest with a gold-ringed light, white limbs with gold cuffs.
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const PALETTE = {
  white: 0xf7f5f0,
  navy: 0x0e2742,
  gold: 0xd39a5a,
  visor: 0x05080c,
  eye: 0xd4f1ff,
  chest: 0xfff3dc,
}

// Apple-style spring: damping ratio + response (seconds), not mass/stiffness.
export class Spring {
  constructor(value = 0, { damping = 1, response = 0.4 } = {}) {
    this.value = value
    this.target = value
    this.velocity = 0
    this.damping = damping
    this.response = response
  }
  step(dt) {
    const k = (2 * Math.PI / this.response) ** 2
    const c = (4 * Math.PI * this.damping) / this.response
    let remaining = dt
    while (remaining > 0) {
      const h = Math.min(remaining, 1 / 240)
      const a = -k * (this.value - this.target) - c * this.velocity
      this.velocity += a * h
      this.value += this.velocity * h
      remaining -= h
    }
    return this.value
  }
  get resting() {
    return Math.abs(this.value - this.target) < 1e-4 && Math.abs(this.velocity) < 1e-3
  }
}

function materials() {
  return {
    white: new THREE.MeshPhysicalMaterial({ color: PALETTE.white, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.18 }),
    navy: new THREE.MeshPhysicalMaterial({ color: PALETTE.navy, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
    gold: new THREE.MeshStandardMaterial({ color: PALETTE.gold, metalness: 0.85, roughness: 0.28 }),
    // Keep reflections low so the eyes stay readable at steep angles
    visor: new THREE.MeshPhysicalMaterial({ color: PALETTE.visor, roughness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 0.35 }),
    eye: new THREE.MeshBasicMaterial({ color: PALETTE.eye }),
    chest: new THREE.MeshBasicMaterial({ color: PALETTE.chest }),
  }
}

function glowTexture(color) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function mesh(geometry, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s } = {}) {
  const m = new THREE.Mesh(geometry, material)
  m.position.set(x, y, z)
  m.rotation.set(rx, ry, rz)
  if (s) m.scale.set(...s)
  return m
}

function buildHead(mat) {
  const head = new THREE.Group()
  head.add(mesh(new RoundedBoxGeometry(1.8, 1.36, 1.3, 6, 0.42), mat.white))
  head.add(mesh(new RoundedBoxGeometry(1.26, 0.78, 0.22, 5, 0.16), mat.visor, { z: 0.6 }))

  // Gold corner brackets on the visor
  const bar = new THREE.BoxGeometry(0.13, 0.024, 0.01)
  const barV = new THREE.BoxGeometry(0.024, 0.13, 0.01)
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      head.add(mesh(bar, mat.gold, { x: sx * 0.45, y: sy * 0.27, z: 0.715 }))
      head.add(mesh(barV, mat.gold, { x: sx * 0.503, y: sy * 0.217, z: 0.715 }))
    }
  }

  // Smiling arc eyes (∩) with a soft glow behind them
  const eyes = new THREE.Group()
  eyes.position.z = 0.72
  const arc = new THREE.TorusGeometry(0.15, 0.042, 12, 32, Math.PI)
  const glow = new THREE.SpriteMaterial({ map: glowTexture('rgba(150,215,255,0.9)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 })
  const eyeMeshes = []
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group()
    eye.position.set(sx * 0.27, -0.06, 0)
    eye.add(mesh(arc, mat.eye))
    const halo = new THREE.Sprite(glow)
    halo.scale.set(0.6, 0.45, 1)
    halo.position.set(0, 0.06, -0.01)
    eye.add(halo)
    eyes.add(eye)
    eyeMeshes.push(eye)
  }
  head.add(eyes)

  // Ear pods with gold rings, plus antennas rising from them
  const pod = new THREE.CylinderGeometry(0.29, 0.29, 0.22, 32)
  const ring = new THREE.TorusGeometry(0.21, 0.045, 12, 40)
  const cap = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 32)
  const stem = new THREE.CylinderGeometry(0.035, 0.035, 0.3, 12)
  const bulb = new THREE.SphereGeometry(0.13, 24, 16)
  const antennas = []
  for (const sx of [-1, 1]) {
    head.add(mesh(pod, mat.navy, { x: sx * 0.93, rz: Math.PI / 2 }))
    head.add(mesh(ring, mat.gold, { x: sx * 1.04, ry: Math.PI / 2 }))
    head.add(mesh(cap, mat.white, { x: sx * 1.05, rz: Math.PI / 2 }))

    const antenna = new THREE.Group()
    antenna.position.set(sx * 0.82, 0.3, -0.12)
    antenna.rotation.z = -sx * 0.22
    antenna.add(mesh(stem, mat.navy, { y: 0.28 }))
    antenna.add(mesh(bulb, mat.navy, { y: 0.62, s: [1, 2, 1] }))
    head.add(antenna)
    antennas.push(antenna)
  }
  return { head, eyes, eyeMeshes, antennas }
}

function buildArm(mat, side) {
  const shoulder = new THREE.Group()
  shoulder.position.set(side * 0.66, 0.55, 0)
  shoulder.add(mesh(new THREE.SphereGeometry(0.21, 24, 16), mat.navy))
  const upper = new THREE.CapsuleGeometry(0.15, 0.22, 8, 16)
  shoulder.add(mesh(upper, mat.white, { y: -0.3 }))
  shoulder.add(mesh(new THREE.TorusGeometry(0.155, 0.04, 10, 32), mat.gold, { y: -0.47, rx: Math.PI / 2 }))
  shoulder.add(mesh(new THREE.CapsuleGeometry(0.18, 0.2, 8, 16), mat.white, { y: -0.68 }))
  shoulder.rotation.z = side * 0.32
  return shoulder
}

function buildLeg(mat, side) {
  const hip = new THREE.Group()
  hip.position.set(side * 0.27, -0.28, 0)
  hip.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 24), mat.navy, { y: -0.05 }))
  hip.add(mesh(new THREE.CapsuleGeometry(0.19, 0.14, 8, 16), mat.white, { y: -0.3 }))
  hip.add(mesh(new THREE.TorusGeometry(0.19, 0.035, 10, 32), mat.gold, { y: -0.36, rx: Math.PI / 2 }))
  hip.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 24), mat.navy, { y: -0.5 }))
  hip.add(mesh(new RoundedBoxGeometry(0.4, 0.2, 0.5, 4, 0.09), mat.white, { y: -0.62, z: 0.06 }))
  return hip
}

function buildBody(mat) {
  const body = new THREE.Group()
  body.add(mesh(new THREE.SphereGeometry(0.62, 40, 28), mat.white, { y: 0.18, s: [1, 1.05, 0.9] }))
  body.add(mesh(new THREE.SphereGeometry(0.6, 40, 28), mat.navy, { y: 0.52, s: [1.06, 0.68, 0.94] }))
  // The navy "tie" that flows down the front of the torso
  body.add(mesh(new THREE.CapsuleGeometry(0.13, 0.32, 8, 16), mat.navy, { y: 0.2, z: 0.46, rx: -0.25, s: [1.2, 1, 0.6] }))
  body.add(mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.2, 24), mat.navy, { y: 0.92 }))

  const chest = new THREE.Group()
  chest.position.set(0, 0.56, 0.54)
  chest.rotation.x = -0.3
  chest.add(mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 36), mat.gold))
  chest.add(mesh(new THREE.CircleGeometry(0.09, 32), mat.chest, { z: 0.005 }))
  body.add(chest)

  const armL = buildArm(mat, 1)
  const armR = buildArm(mat, -1)
  const legL = buildLeg(mat, 1)
  const legR = buildLeg(mat, -1)
  body.add(armL, armR, legL, legR)
  return { body, armL, armR, legL, legR }
}

export function createRobotScene(canvas, { width, height }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envMap
  pmrem.dispose()

  const key = new THREE.DirectionalLight(0xffffff, 1.4)
  key.position.set(-2.5, 4, 5)
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0xe8dcc8, 0.6))

  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50)
  camera.position.set(0, 1.3, 9.8)
  camera.lookAt(0, 1.22, 0)

  const mat = materials()
  const root = new THREE.Group()
  const { body, armL, armR, legL, legR } = buildBody(mat)
  const neck = new THREE.Group()
  neck.position.y = 1.0
  const { head, eyes, eyeMeshes, antennas } = buildHead(mat)
  // Big head, small body: the sheet's proportions
  head.position.y = 0.86
  head.scale.setScalar(1.3)
  neck.add(head)
  root.add(body, neck)
  scene.add(root)

  // Soft contact shadow that shrinks as the robot floats higher
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 0.7),
    new THREE.MeshBasicMaterial({ map: glowTexture('rgba(11,42,63,0.55)'), transparent: true, depthWrite: false }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = -1.12
  scene.add(shadow)

  return {
    renderer,
    scene,
    camera,
    parts: { root, body, neck, head, eyes, eyeMeshes, antennas, armL, armR, legL, legR, shadow },
    resize(w, h) {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    render() {
      renderer.render(scene, camera)
    },
    dispose() {
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          if (o.material.map) o.material.map.dispose()
          o.material.dispose()
        }
      })
      envMap.dispose()
      renderer.dispose()
    },
  }
}
