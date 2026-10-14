// Schematic map of New Zayed and its surroundings (original illustration, not to scale).
// Zayed Reimagined is the third project inside New Zayed; clicking it opens the 3D experience.

export const ROADS = [
  { name: 'Cairo–Alex Desert Road', d: 'M250 0 C 290 110, 300 190, 380 215 S 520 240, 600 290 S 730 400, 790 470 S 880 540, 900 560', major: true, label: [470, 236, 14] },
  { name: 'Al Dabaa Axis', d: 'M0 262 C 120 262, 260 262, 330 258 S 400 250, 425 238', major: true, label: [90, 252, 0] },
  { name: 'Rod El Farag Axis', d: 'M420 236 C 450 200, 480 160, 560 150 S 760 168, 1000 158', major: true, label: [700, 150, 0] },
  { name: '26th of July Axis', d: 'M330 560 C 470 470, 600 380, 720 330 S 900 300, 1000 300', major: true, label: [820, 300, -6] },
  { name: 'Middle Ring Road', d: 'M215 250 L 215 560', label: [205, 470, -90] },
  { name: 'Waslet Dahshur Road', d: 'M425 250 L 560 452', label: [470, 340, 56] },
  { name: 'Ring Road', d: 'M990 40 C 960 160, 930 280, 900 360 S 820 500, 790 560', label: [940, 230, -72] },
]

export const PLACES = [
  { name: 'New Sphinx City', x: 70, y: 150 },
  { name: 'Sheikh Zayed City', x: 560, y: 300 },
  { name: '6th of October', x: 360, y: 505 },
  { name: 'New Giza', x: 720, y: 430 },
]

export const LANDMARKS = [
  { name: 'Sphinx International Airport', x: 372, y: 112 },
  { name: 'Smart Village', x: 640, y: 236 },
  { name: 'Mall of Arabia', x: 520, y: 470 },
  { name: 'Grand Egyptian Museum', x: 860, y: 492 },
  { name: 'Giza Pyramids', x: 840, y: 532 },
]

// Existing projects in New Zayed, plus ours
export const MAP_PROJECTS = [
  { id: 'vye', name: 'VYE', by: 'SODIC', x: 268, y: 278 },
  { id: 'bellevie', name: 'Belle Vie', by: 'Emaar', x: 384, y: 248 },
  { id: 'zayed', name: 'Zayed Reimagined', by: 'Virtualizeer twin', x: 318, y: 226, ours: true },
]

export const NEW_ZAYED = 'M228 196 L 372 214 L 418 244 L 400 262 L 348 300 L 232 302 Z'

export default function NewZayedMap({ zooming, onOpen }) {
  const ours = MAP_PROJECTS.find((p) => p.ours)
  return (
    <div className={`zmap${zooming ? ' is-zooming' : ''}`}>
      <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="zmap__svg" role="img"
        aria-label="Map of New Zayed showing nearby roads and landmarks, and three projects in New Zayed: VYE by SODIC, Belle Vie by Emaar, and Zayed Reimagined">
        <defs>
          <pattern id="zgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity=".04" />
          </pattern>
          <radialGradient id="zglow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#e9c98f" stopOpacity=".35" />
            <stop offset="1" stopColor="#e9c98f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="zmap__world" style={{ transformOrigin: `${ours.x}px ${ours.y}px` }}>
          <rect width="1000" height="560" fill="#0f2a40" />
          <rect width="1000" height="560" fill="url(#zgrid)" />
          {/* Districts */}
          <path d="M420 250 L 600 270 L 700 360 L 600 420 L 470 380 Z" fill="#ffffff" fillOpacity=".035" />
          <path d={NEW_ZAYED} fill="#e9c98f" fillOpacity=".16" stroke="#e9c98f" strokeWidth="2" strokeDasharray="7 5" />
          <text x="232" y="186" className="zmap__district">NEW ZAYED</text>
          {/* Roads */}
          {ROADS.map((r) => (
            <g key={r.name}>
              <path d={r.d} fill="none" stroke={r.major ? '#d8b77d' : '#9fb3c4'} strokeOpacity={r.major ? 0.95 : 0.6} strokeWidth={r.major ? 7 : 3} strokeLinecap="round" />
              <text transform={`translate(${r.label[0]} ${r.label[1]}) rotate(${r.label[2]})`} className="zmap__road">{r.name}</text>
            </g>
          ))}
          {PLACES.map((p) => (
            <text key={p.name} x={p.x} y={p.y} className="zmap__place">{p.name.toUpperCase()}</text>
          ))}
          {LANDMARKS.map((l) => (
            <g key={l.name} transform={`translate(${l.x} ${l.y})`}>
              <path d="M0 0 C -6 -8, -6 -14, 0 -16 C 6 -14, 6 -8, 0 0 Z" fill="#9fb3c4" />
              <circle cy="-10" r="2.4" fill="#0f2a40" />
              <text x="9" y="-6" className="zmap__landmark">{l.name}</text>
            </g>
          ))}
          {/* Projects in New Zayed */}
          {MAP_PROJECTS.filter((p) => !p.ours).map((p) => (
            <g key={p.id} transform={`translate(${p.x} ${p.y})`} className="zmap__proj">
              <circle r="6" fill="#ffffff" fillOpacity=".85" />
              <text x="10" y="4" className="zmap__projlabel">{p.name} · {p.by}</text>
            </g>
          ))}
          <circle cx={ours.x} cy={ours.y} r="40" fill="url(#zglow)" />
        </g>
      </svg>

      {/* Our project: a real button so it works with keyboard and screen readers */}
      <button
        className="zmap__ours"
        style={{ left: `${(ours.x / 1000) * 100}%`, top: `${(ours.y / 560) * 100}%` }}
        onClick={onOpen}
        aria-label="Zayed Reimagined, project 3 in New Zayed. Explore in 3D"
      >
        <span className="zmap__pulse" aria-hidden="true" />
        <span className="zmap__dot" aria-hidden="true">3</span>
        <span className="zmap__card">
          <strong>Zayed Reimagined</strong>
          <span>10 L-shaped courtyard villas · New Zayed</span>
          <em>Explore in 3D →</em>
        </span>
      </button>

      <div className="zmap__legend">
        <span><i className="zmap__k zmap__k--ours" />Zayed Reimagined</span>
        <span><i className="zmap__k" />Other projects</span>
        <span><i className="zmap__k zmap__k--road" />Main roads</span>
      </div>
      <p className="zmap__note">Schematic map, not to scale</p>
    </div>
  )
}
