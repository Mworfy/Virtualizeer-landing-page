import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { company, services } from '../content.js'

const navItems = [
  ...services.map((s) => ({ to: s.path, label: s.name })),
  { to: '/projects', label: 'Projects' },
  // { to: '/about', label: 'About' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const toggleRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <header className={`nav${scrolled || open ? ' is-scrolled' : ''}`}>
        <div className="container nav__inner">
          <Link to="/" className="nav__logo" aria-label={`${company.name} home`}>
            <img src="/brand/logo-h-navy.png" alt="" width="150" height="30" />
          </Link>
          <nav className="nav__links" aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className="nav__link">
                {item.label}
              </NavLink>
            ))}
            {pathname !== '/' && (
              <NavLink to="/" end className="nav__link">
                Home
              </NavLink>
            )}
            <Link to="/contact" className="btn btn--primary btn--sm nav__cta">
              Get a quote
            </Link>
          </nav>
          <button
            ref={toggleRef}
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>
      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Main">
          <ul>
            {[...(pathname !== '/' ? [{ to: '/', label: 'Home' }] : []), ...navItems, { to: '/contact', label: 'Contact' }].map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === '/'} className="m-link">
                  {item.label}
                  <ArrowRight aria-hidden="true" size={20} />
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="btn btn--primary">
            Get a quote
          </Link>
        </nav>
      )}
    </>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/brand/logo-h-white.png" alt={company.name} width="170" height="34" />
            <p>Virtual tours, digital twins and websites that let people experience a space before they arrive.</p>
          </div>
          <div>
            <h2>Services</h2>
            <ul>
              {services.map((s) => (
                <li key={s.slug}><Link to={s.path}>{s.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h2>Connect</h2>
            <ul>
              <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
              {company.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2024 {company.name}. All rights reserved.</span>
          <span>{company.location}</span>
        </div>
      </div>
    </footer>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
