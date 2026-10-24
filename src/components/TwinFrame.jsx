import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, X } from 'lucide-react'

// Wraps a 3D digital twin demo with a full screen mode that works on desktop and mobile.
// Uses the native Fullscreen API where available (desktop, Android) and always applies a
// fixed-position layout so iPhone Safari, which has no element fullscreen, still works.
export default function TwinFrame({ className = '', title = 'Digital twin', children }) {
  const rootRef = useRef(null)
  const openerRef = useRef(null)
  const wasFull = useRef(false)
  const [full, setFull] = useState(false)

  const enter = useCallback(() => {
    setFull(true)
    try { rootRef.current?.requestFullscreen?.()?.catch(() => {}) } catch { /* fixed layout still applies */ }
  }, [])

  const exit = useCallback(() => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    if (!full) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') exit() }
    // The browser leaves native fullscreen on Esc or a swipe; keep our state in step
    const onFs = () => { if (!document.fullscreenElement) setFull(false) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('fullscreenchange', onFs)
    return () => {
      html.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('fullscreenchange', onFs)
    }
  }, [full, exit])

  // Hand focus back to the opener after leaving
  useEffect(() => {
    if (wasFull.current && !full) openerRef.current?.focus({ preventScroll: true })
    wasFull.current = full
  }, [full])

  // Leave native fullscreen if the page unmounts mid-session
  useEffect(() => () => {
    if (document.fullscreenElement === rootRef.current) document.exitFullscreen?.().catch(() => {})
  }, [])

  return (
    <div
      ref={rootRef}
      className={`twin${full ? ' is-full' : ''}`}
      role={full ? 'dialog' : undefined}
      aria-modal={full ? 'true' : undefined}
      aria-label={full ? `${title}, full screen` : undefined}
    >
      {full && (
        <div className="twin__bar">
          <span className="twin__title">{title}</span>
          <button type="button" className="twin__exit" onClick={exit} aria-label="Exit full screen" autoFocus>
            <X aria-hidden="true" /> <span>Exit</span>
          </button>
        </div>
      )}
      <div className={`tour ${className}`}>{children}</div>
      {!full && (
        <div className="twin__toolbar">
          <button ref={openerRef} type="button" className="btn btn--secondary btn--sm" onClick={enter}>
            <Maximize2 aria-hidden="true" /> Full screen
          </button>
        </div>
      )}
    </div>
  )
}
