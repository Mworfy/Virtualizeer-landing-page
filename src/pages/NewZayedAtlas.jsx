import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Building2, Check, ChevronDown, Compass, Info, Layers, ListFilter, Map as MapIcon,
  Minus, Plus, Scale, Search, Sparkles, X,
} from 'lucide-react'
import { CATEGORIES, COMPOUNDS, DISTRICTS, LANDMARK_MODELS, REGION, formatEGP } from '../components/atlas/data.js'
import { ROADS } from '../components/zayed/NewZayedMap.jsx'
import '../components/atlas/atlas.css'
import { usePageMeta } from '../components/ui.jsx'

const touch = typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches
const MAX_COMPARE = 3
const SORTS = [
  { id: 'size', label: 'Largest first' },
  { id: 'priceAsc', label: 'Lowest starting price' },
  { id: 'name', label: 'A to Z' },
]

export default function NewZayedAtlas() {
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const pinsRef = useRef(null)
  const atlas = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [intro, setIntro] = useState(true)
  const [selected, setSelected] = useState(null)
  const [hover, setHover] = useState(null)
  const [compare, setCompare] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('size')
  const [layers, setLayers] = useState({ compounds: true, landmarks: true, roads: true, districts: true })
  const [panel, setPanel] = useState(!touch)
  const [about, setAbout] = useState(false)
  const [quality, setQuality] = useState(touch ? 'fast' : 'high')
  const navigate = useNavigate()
  const location = useLocation()
  // Exit the Atlas: go back if we came from the site, otherwise to the Digital Twins page
  usePageMeta('New Zayed Atlas')
  const exitAtlas = () => (location.key !== 'default' ? navigate(-1) : navigate('/digital-twins'))

  useEffect(() => {
    let a
    let cancelled = false
    import('../components/atlas/atlasEngine.js')
      .then(({ createAtlas }) => {
        if (cancelled) return
        a = createAtlas({
          canvas: canvasRef.current,
          container: stageRef.current,
          pinRoot: pinsRef.current,
          quality,
          on: { hover: setHover, select: (id) => choose(id), interact: () => {} },
        })
        atlas.current = a
        if (import.meta.env.DEV) window.__atlas = a
        setReady(true)
      })
      .catch((e) => {
        console.error(e)
        setError(true)
      })
    return () => {
      cancelled = true
      a?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => atlas.current?.setQuality(quality), [quality])

  // Trackpad pinch arrives as ctrl+wheel: keep it on the map instead of zooming the whole page
  useEffect(() => {
    const el = stageRef.current
    const stop = (e) => e.ctrlKey && e.preventDefault()
    el?.addEventListener('wheel', stop, { passive: false })
    return () => el?.removeEventListener('wheel', stop)
  }, [])

  const choose = (id) => {
    setSelected(id)
    atlas.current?.select(id)
    if (touch) setPanel(false)
  }
  const toggleCompare = (id) =>
    setCompare((list) => (list.includes(id) ? list.filter((x) => x !== id) : list.length >= MAX_COMPARE ? list : [...list, id]))

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = COMPOUNDS.filter(
      (c) =>
        (category === 'all' || c.category === category) &&
        (!q || c.name.toLowerCase().includes(q) || c.developer.toLowerCase().includes(q)),
    )
    const byName = (a, b) => a.name.localeCompare(b.name)
    if (sort === 'size') out.sort((a, b) => (b.acres ?? -1) - (a.acres ?? -1) || byName(a, b))
    if (sort === 'priceAsc') out.sort((a, b) => (a.fromPrice ?? Infinity) - (b.fromPrice ?? Infinity) || byName(a, b))
    if (sort === 'name') out.sort(byName)
    return out
  }, [query, category, sort])

  const sel = COMPOUNDS.find((c) => c.id === selected)
  const compared = compare.map((id) => COMPOUNDS.find((c) => c.id === id))
  const explore = () => {
    setIntro(false)
    atlas.current?.start()
  }

  return (
    <div className={`atlas${intro ? ' atlas--intro' : ''}`} data-layers={Object.entries(layers).filter(([, v]) => v).map(([k]) => k).join(' ')}>
      <div className="atlas__stage" ref={stageRef}>
        <canvas ref={canvasRef} className="atlas__canvas" tabIndex={0}
          aria-label="3D map of New Zayed. Drag to pan, right drag or two finger drag to rotate, scroll to zoom. Use the directory to find compounds." />

        {/* Labels projected from 3D */}
        <div className="atlas__pins" ref={pinsRef} aria-hidden={intro}>
          {COMPOUNDS.map((c) => (
            <button key={c.id} data-pin={`c:${c.id}`} style={{ visibility: 'hidden' }}
              className={`apin apin--compound${c.concept ? ' is-concept' : ''}${selected === c.id ? ' is-selected' : ''}${hover === c.id ? ' is-hover' : ''}`}
              onClick={() => choose(c.id)} onMouseEnter={() => atlas.current?.setHover(c.id)} onMouseLeave={() => atlas.current?.setHover(null)}
              tabIndex={intro ? -1 : 0} aria-label={`${c.name} by ${c.developer}`}>
              <span className="apin__dot" />
              <span className="apin__text"><strong>{c.name}</strong><em>{c.developer}</em></span>
            </button>
          ))}
          {LANDMARK_MODELS.map((l) => (
            <button key={l.id} data-pin={`l:${l.id}`} className="apin apin--landmark" style={{ visibility: 'hidden' }}
              onClick={() => atlas.current?.flyToLandmark(l.id)} tabIndex={intro ? -1 : 0}>
              <Compass aria-hidden="true" /> {l.name}
            </button>
          ))}
          {DISTRICTS.map((d) => (
            <span key={d.id} data-pin={`d:${d.id}`} className={`apin apin--district${d.kind === 'focus' ? ' is-focus' : ''}`} style={{ visibility: 'hidden' }}>
              {d.name}
            </span>
          ))}
          {ROADS.map((r, i) => (
            <span key={r.name} data-pin={`r:r${i}`} className={`apin apin--road${r.major ? ' is-major' : ''}`} style={{ visibility: 'hidden' }}>{r.name}</span>
          ))}
        </div>

        {!ready && !error && <div className="atlas__loading"><span className="atlas__spinner" aria-label="Loading 3D map" /></div>}
        {error && <div className="atlas__loading">Your browser can’t display the 3D map.</div>}

        {/* Identity bar */}
        <header className="atlas__bar">
          <Link to="/" className="atlas__brand" aria-label="Back to Virtualizeer">
            <img src="/brand/mark-white.png" alt="" />
            <span><strong>NEW ZAYED</strong><em>Atlas</em></span>
          </Link>
          <div className="atlas__barright">
          {!intro && (
            <>
              <button className="aglass abtn" onClick={() => setPanel((p) => !p)} aria-expanded={panel} aria-controls="atlas-directory">
                <ListFilter aria-hidden="true" /> <span className="abtn__label">Directory</span>
              </button>
              <LayerMenu layers={layers} setLayers={setLayers} />
              <button className="aglass abtn" aria-pressed={quality === 'high'} onClick={() => setQuality((q) => (q === 'high' ? 'fast' : 'high'))}>
                <Sparkles aria-hidden="true" /> <span className="abtn__label">{quality === 'high' ? 'High quality' : 'Fast'}</span>
              </button>
              <button className="aglass abtn abtn--icon" onClick={() => setAbout(true)} aria-label="About this map"><Info aria-hidden="true" /></button>
            </>
          )}
            <button className="abtn abtn--icon abtn--exit" onClick={exitAtlas} aria-label="Exit the Atlas" title="Exit"><X aria-hidden="true" /></button>
          </div>
        </header>

        {/* Intro */}
        {intro && ready && (
          <section className="atlas__intro" aria-labelledby="atlas-title">
            <span className="atlas__eyebrow">Project 04 · A reference for Egypt’s new west</span>
            <h1 id="atlas-title">New Zayed <span>Atlas</span></h1>
            <p>{REGION.summary} Explore {COMPOUNDS.length - 1} compounds, compare them side by side, and see how the district connects to the airport, Sheikh Zayed and the Cairo Alex Desert Road.</p>
            <dl className="atlas__facts">
              <div><dt>Area</dt><dd>~35M m²</dd></div>
              <div><dt>Compounds mapped</dt><dd>{COMPOUNDS.length - 1}</dd></div>
              <div><dt>Gateway</dt><dd>Sphinx Airport</dd></div>
            </dl>
            <button className="atlas__cta" onClick={explore}>Explore the map <ArrowRight aria-hidden="true" /></button>
            <small>Compound positions are indicative.</small>
          </section>
        )}

        {/* Directory */}
        {!intro && panel && (
          <aside id="atlas-directory" className="atlas__panel" aria-label="Compound directory">
            <div className="apanel__head">
              <h2>Compounds <span>{list.length}</span></h2>
              <button className="abtn--close" onClick={() => setPanel(false)} aria-label="Close directory"><X aria-hidden="true" /></button>
            </div>
            <label className="asearch">
              <Search aria-hidden="true" />
              <span className="visually-hidden">Search compounds or developers</span>
              <input type="search" placeholder="Search compound or developer" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="achips" role="group" aria-label="Filter by type">
              {CATEGORIES.map((c) => (
                <button key={c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{c.label}</button>
              ))}
            </div>
            <label className="asort">
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <ul className="alist">
              {list.map((c) => (
                <li key={c.id} className={`aitem${selected === c.id ? ' is-selected' : ''}${c.concept ? ' is-concept' : ''}`}
                  onMouseEnter={() => atlas.current?.setHover(c.id)} onMouseLeave={() => atlas.current?.setHover(null)}>
                  <button className="aitem__main" onClick={() => choose(c.id)}>
                    <strong>{c.name}</strong>
                    <span>{c.developer}</span>
                    <span className="aitem__meta">
                      {c.acres ? `${c.acres} acres` : 'Size not listed'} · {c.concept ? 'Concept' : `From ${formatEGP(c.fromPrice)}`}
                    </span>
                  </button>
                  {!c.concept && (
                    <button className={`aitem__cmp${compare.includes(c.id) ? ' is-on' : ''}`} onClick={() => toggleCompare(c.id)}
                      aria-pressed={compare.includes(c.id)} disabled={!compare.includes(c.id) && compare.length >= MAX_COMPARE}
                      aria-label={`${compare.includes(c.id) ? 'Remove' : 'Add'} ${c.name} ${compare.includes(c.id) ? 'from' : 'to'} comparison`}>
                      {compare.includes(c.id) ? <Check aria-hidden="true" /> : <Scale aria-hidden="true" />}
                    </button>
                  )}
                </li>
              ))}
              {!list.length && <li className="aempty">No compounds match. Try another search or filter.</li>}
            </ul>
            <div className="apanel__jump">
              <span>Jump to</span>
              <button onClick={() => atlas.current?.focusNewZayed()}>New Zayed</button>
              <button onClick={() => atlas.current?.flyToLandmark('airport')}>Sphinx Airport</button>
              <button onClick={() => atlas.current?.flyToLandmark('oldzayed')}>Sheikh Zayed</button>
              <button onClick={() => atlas.current?.flyToLandmark('pyramids')}>Pyramids & GEM</button>
              <button onClick={() => atlas.current?.overview()}>Whole region</button>
            </div>
          </aside>
        )}

        {/* Detail card */}
        {!intro && sel && (
          <article className="acard" aria-labelledby="acard-title">
            <button className="abtn--close" onClick={() => { setSelected(null); atlas.current?.select(null) }} aria-label="Close details"><X aria-hidden="true" /></button>
            <span className="acard__eyebrow">{sel.concept ? 'Virtualizeer concept project' : 'Compound · New Zayed'}</span>
            <h2 id="acard-title">{sel.name}</h2>
            <p className="acard__dev"><Building2 aria-hidden="true" /> {sel.developer}</p>
            <dl className="acard__facts">
              <div><dt>Land area</dt><dd>{sel.acres ? `${sel.acres} acres` : 'Not listed'}</dd></div>
              <div><dt>Starting price</dt><dd>{sel.concept ? 'Concept' : formatEGP(sel.fromPrice)}</dd></div>
              <div><dt>Delivery</dt><dd>{sel.delivery ?? 'Not listed'}</dd></div>
            </dl>
            <div className="acard__units">
              {sel.units.map((u) => <span key={u}>{u}</span>)}
            </div>
            <div className="acard__actions">
              {sel.concept ? (
                <Link to={sel.link} className="atlas__cta atlas__cta--sm">Walk through it in 3D <ArrowRight aria-hidden="true" /></Link>
              ) : (
                <button className={`atlas__cta atlas__cta--sm${compare.includes(sel.id) ? ' is-on' : ''}`} onClick={() => toggleCompare(sel.id)}
                  disabled={!compare.includes(sel.id) && compare.length >= MAX_COMPARE}>
                  {compare.includes(sel.id) ? <><Check aria-hidden="true" /> In comparison</> : <><Scale aria-hidden="true" /> Add to compare</>}
                </button>
              )}
            </div>
          </article>
        )}

        {/* Compare tray + drawer */}
        {!intro && compare.length > 0 && !compareOpen && (
          <div className="atray aglass">
            <span>{compare.length} selected</span>
            {compared.map((c) => <span key={c.id} className="atray__chip">{c.name}<button onClick={() => toggleCompare(c.id)} aria-label={`Remove ${c.name}`}><X aria-hidden="true" /></button></span>)}
            <button className="atlas__cta atlas__cta--sm" onClick={() => setCompareOpen(true)} disabled={compare.length < 2}>Compare <Scale aria-hidden="true" /></button>
          </div>
        )}
        {compareOpen && (
          <section className="acompare" aria-labelledby="acompare-title">
            <div className="acompare__head">
              <h2 id="acompare-title">Compare compounds</h2>
              <button className="abtn--close" onClick={() => setCompareOpen(false)} aria-label="Close comparison"><X aria-hidden="true" /></button>
            </div>
            <div className="acompare__scroll">
              <table>
                <thead>
                  <tr><th scope="col"><span className="visually-hidden">Attribute</span></th>{compared.map((c) => <th key={c.id} scope="col">{c.name}</th>)}</tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Developer</th>{compared.map((c) => <td key={c.id}>{c.developer}</td>)}</tr>
                  <tr><th scope="row">Land area</th>{compared.map((c) => <td key={c.id}>{c.acres ? `${c.acres} acres` : 'Not listed'}</td>)}</tr>
                  <tr><th scope="row">Starting price</th>{compared.map((c) => <td key={c.id}>{formatEGP(c.fromPrice)}</td>)}</tr>
                  <tr><th scope="row">Delivery</th>{compared.map((c) => <td key={c.id}>{c.delivery ?? 'Not listed'}</td>)}</tr>
                  <tr><th scope="row">Unit types</th>{compared.map((c) => <td key={c.id}>{c.units.join(', ')}</td>)}</tr>
                  <tr><th scope="row"><span className="visually-hidden">Map</span></th>{compared.map((c) => (
                    <td key={c.id}><button className="alink" onClick={() => { setCompareOpen(false); choose(c.id) }}><MapIcon aria-hidden="true" /> Show on map</button></td>
                  ))}</tr>
                </tbody>
              </table>
            </div>
            <p className="acompare__note">Prices are starting prices and change often. Confirm with each developer.</p>
          </section>
        )}

        {/* Zoom + legend */}
        {!intro && (
          <>
            <div className="azoom aglass">
              <button onClick={() => atlas.current?.zoom(0.7)} aria-label="Zoom in"><Plus aria-hidden="true" /></button>
              <button onClick={() => atlas.current?.zoom(1.4)} aria-label="Zoom out"><Minus aria-hidden="true" /></button>
            </div>
            <div className="alegend aglass" aria-label="Legend">
              <span><i className="k k--nz" />New Zayed</span>
              <span><i className="k k--hw" />Highway</span>
              <span><i className="k k--cp" />Compound</span>
              <span><i className="k k--vz" />Virtualizeer concept</span>
            </div>
          </>
        )}

        {/* About */}
        {about && (
          <div className="aabout" role="dialog" aria-modal="true" aria-labelledby="aabout-title">
            <div className="aabout__box">
              <button className="abtn--close" onClick={() => setAbout(false)} aria-label="Close"><X aria-hidden="true" /></button>
              <h2 id="aabout-title">About the New Zayed Atlas</h2>
              <p>A visual reference for New Zayed: about 35 million m² south of the Cairo Alex Desert Road, opposite Sphinx International Airport.</p>
              <p>The map is schematic and not to scale. Roads and districts are simplified, and compound positions inside New Zayed are indicative, not surveyed. Compound details change often, so confirm them with each developer.</p>
              <Link to="/" className="alink"><ArrowLeft aria-hidden="true" /> Back to Virtualizeer</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LayerMenu({ layers, setLayers }) {
  const [open, setOpen] = useState(false)
  const items = [
    ['compounds', 'Compounds'],
    ['landmarks', 'Landmarks'],
    ['districts', 'Districts'],
    ['roads', 'Road names'],
  ]
  return (
    <div className="alayers">
      <button className="aglass abtn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Layers aria-hidden="true" /> <span className="abtn__label">Layers</span> <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div className="alayers__menu">
          {items.map(([k, label]) => (
            <label key={k}>
              <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers((l) => ({ ...l, [k]: e.target.checked }))} />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
