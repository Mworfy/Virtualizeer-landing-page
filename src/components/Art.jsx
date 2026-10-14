import { useId } from 'react'

// Brand styled generative illustrations used wherever there is no photo yet.
// variant: 'tours' | 'twins' | 'web'. `seed` shifts the composition so cards differ.

function hash(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function Art({ variant = 'tours', seed = '' }) {
  const uid = useId().replace(/:/g, '')
  const h = hash(seed + variant)
  const angle = 110 + (h % 50)
  const shift = (h % 7) * 12

  return (
    <div className="art" aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`g${uid}`} gradientTransform={`rotate(${angle - 90} .5 .5)`}>
            <stop offset="0" stopColor="#163a57" />
            <stop offset="1" stopColor="#0a1e2e" />
          </linearGradient>
          <radialGradient id={`r${uid}`} cx="0.8" cy="0.1" r="0.8">
            <stop offset="0" stopColor="#3b82c4" stopOpacity=".35" />
            <stop offset="1" stopColor="#3b82c4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill={`url(#g${uid})`} />
        <rect width="400" height="300" fill={`url(#r${uid})`} />
        {/* logo stripe motif */}
        <g opacity=".06" fill="#fff">
          <path d={`M${-40 + shift} -10 h26 l130 330 h-26z`} />
          <path d={`M${0 + shift} -10 h40 l130 330 h-40z`} />
        </g>
        {variant === 'tours' && <Tours />}
        {variant === 'twins' && <Twins offset={h % 3} />}
        {variant === 'web' && <Web />}
      </svg>
    </div>
  )
}

function Tours() {
  // Panorama sphere with hotspots
  return (
    <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2">
      <circle cx="200" cy="150" r="88" />
      <ellipse cx="200" cy="150" rx="88" ry="28" />
      <ellipse cx="200" cy="150" rx="88" ry="58" strokeOpacity=".3" />
      <ellipse cx="200" cy="150" rx="30" ry="88" />
      <ellipse cx="200" cy="150" rx="62" ry="88" strokeOpacity=".3" />
      <path d="M112 150h176" strokeOpacity=".3" />
      <g fill="#fff" stroke="none">
        <circle cx="252" cy="118" r="6" />
        <circle cx="160" cy="176" r="5" fillOpacity=".8" />
        <circle cx="226" cy="196" r="4" fillOpacity=".6" />
      </g>
      <circle cx="252" cy="118" r="13" strokeOpacity=".7" />
    </g>
  )
}

function Twins({ offset }) {
  // Isometric building wireframe with a measurement line
  const iso = (x, y, z) => [200 + (x - y) * 0.866 * 22, 190 + (x + y) * 0.5 * 22 - z * 22]
  const pt = (p) => p.join(',')
  const floors = 3 + offset
  const lines = []
  for (let f = 0; f <= floors; f++) {
    const z = f * 1.1
    lines.push([iso(-2, -2, z), iso(2, -2, z), iso(2, 2, z), iso(-2, 2, z)])
  }
  return (
    <g fill="none" stroke="#fff" strokeWidth="1.2">
      {lines.map((poly, i) => (
        <polygon key={i} points={poly.map(pt).join(' ')} strokeOpacity={i === 0 ? 0.7 : 0.4} fill={i === lines.length - 1 ? 'rgba(255,255,255,.06)' : 'none'} />
      ))}
      {[[-2, -2], [2, -2], [2, 2], [-2, 2]].map(([x, y], i) => (
        <line key={i} x1={iso(x, y, 0)[0]} y1={iso(x, y, 0)[1]} x2={iso(x, y, floors * 1.1)[0]} y2={iso(x, y, floors * 1.1)[1]} strokeOpacity=".55" />
      ))}
      {/* floor grid */}
      {[-1, 0, 1].map((k) => (
        <g key={k} strokeOpacity=".18">
          <line x1={iso(k, -2, 0)[0]} y1={iso(k, -2, 0)[1]} x2={iso(k, 2, 0)[0]} y2={iso(k, 2, 0)[1]} />
          <line x1={iso(-2, k, 0)[0]} y1={iso(-2, k, 0)[1]} x2={iso(2, k, 0)[0]} y2={iso(2, k, 0)[1]} />
        </g>
      ))}
      {/* measurement */}
      <g stroke="#8fb8dd" strokeOpacity=".9">
        <line x1={iso(2.6, -2, 0)[0]} y1={iso(2.6, -2, 0)[1]} x2={iso(2.6, 2, 0)[0]} y2={iso(2.6, 2, 0)[1]} strokeDasharray="4 4" />
        <circle cx={iso(2.6, -2, 0)[0]} cy={iso(2.6, -2, 0)[1]} r="3" fill="#8fb8dd" />
        <circle cx={iso(2.6, 2, 0)[0]} cy={iso(2.6, 2, 0)[1]} r="3" fill="#8fb8dd" />
      </g>
      <g fill="#fff" stroke="none">
        <circle cx={iso(-1, 1, 2.2)[0]} cy={iso(-1, 1, 2.2)[1]} r="4" />
        <circle cx={iso(1, -1, 1.1)[0]} cy={iso(1, -1, 1.1)[1]} r="4" fillOpacity=".7" />
      </g>
    </g>
  )
}

function Web() {
  // Browser window with an embedded tour sphere
  return (
    <g>
      <rect x="70" y="58" width="260" height="184" rx="14" fill="rgba(255,255,255,.08)" stroke="#fff" strokeOpacity=".45" />
      <path d="M70 84h260" stroke="#fff" strokeOpacity=".3" />
      <g fill="#fff" fillOpacity=".55">
        <circle cx="86" cy="71" r="3.5" /><circle cx="98" cy="71" r="3.5" /><circle cx="110" cy="71" r="3.5" />
      </g>
      <rect x="132" y="66" width="120" height="10" rx="5" fill="#fff" fillOpacity=".15" />
      <rect x="88" y="102" width="92" height="10" rx="5" fill="#fff" fillOpacity=".7" />
      <rect x="88" y="120" width="70" height="7" rx="3.5" fill="#fff" fillOpacity=".3" />
      <rect x="88" y="133" width="80" height="7" rx="3.5" fill="#fff" fillOpacity=".3" />
      <rect x="88" y="152" width="52" height="16" rx="8" fill="#fff" fillOpacity=".85" />
      <rect x="196" y="100" width="118" height="124" rx="10" fill="#0a1e2e" stroke="#fff" strokeOpacity=".3" />
      <g fill="none" stroke="#fff" strokeOpacity=".5">
        <circle cx="255" cy="162" r="36" />
        <ellipse cx="255" cy="162" rx="36" ry="12" />
        <ellipse cx="255" cy="162" rx="12" ry="36" />
      </g>
      <circle cx="274" cy="148" r="4" fill="#fff" />
      <rect x="88" y="186" width="92" height="38" rx="8" fill="#fff" fillOpacity=".08" stroke="#fff" strokeOpacity=".2" />
    </g>
  )
}
