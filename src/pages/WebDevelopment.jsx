import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility, ArrowRight, Box, Building2, CalendarDays, Check, Code, ExternalLink, FileSpreadsheet, Gauge,
  Languages, LayoutTemplate, Map, Maximize2, Monitor, Play, Search, ShoppingBag, Smartphone, Tablet, Workflow,
} from 'lucide-react'
import { CTABand, FAQ, Reveal, SectionHeader, usePageMeta } from '../components/ui.jsx'

// Live demo copy of the Youth Speak Forum site (public/work/ysf). Registration is disabled there.
const YSF = {
  src: '/work/ysf/site.html',
  live: 'https://ysf.aiesecus.org/',
  host: 'ysf.aiesecus.org',
  posters: { desktop: '/work/ysf-desktop.jpg', mobile: '/work/ysf-mobile.jpg' },
}
const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, w: 1440, h: 900 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, w: 820, h: 1180 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, w: 390, h: 844 },
]

function SitePreview() {
  const stageRef = useRef(null)
  const narrow = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 720px)').matches
  const [device, setDevice] = useState(narrow ? 'mobile' : 'desktop')
  const [loaded, setLoaded] = useState(false)
  const [scale, setScale] = useState(1)
  const d = DEVICES.find((x) => x.id === device)

  // Render the site at its real viewport size, then scale it to fit the stage
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const fit = () => {
      const pad = device === 'desktop' ? 0 : 28
      setScale(Math.min((el.clientWidth - pad) / d.w, (el.clientHeight - pad) / d.h, 1))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [device, d.w, d.h])

  return (
    <div className="wd-preview">
      <div className="wd-preview__bar">
        <span className="wd-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="wd-url"><span className="wd-lock" aria-hidden="true" />{YSF.host}</span>
        <div className="wd-devices" role="group" aria-label="Preview device">
          {DEVICES.map(({ id, label, icon: I }) => (
            <button key={id} aria-pressed={device === id} onClick={() => setDevice(id)} title={label}>
              <I aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </div>
        <div className="wd-preview__actions">
          <a href={YSF.src} target="_blank" rel="noopener" className="wd-iconbtn" aria-label="Open the preview full screen" title="Full screen"><Maximize2 aria-hidden="true" /></a>
          <a href={YSF.live} target="_blank" rel="noopener" className="wd-iconbtn" aria-label="Visit the live site" title="Live site"><ExternalLink aria-hidden="true" /></a>
        </div>
      </div>
      <div ref={stageRef} className={`wd-stage wd-stage--${device}`}>
        {loaded ? (
          <div
            className={`wd-viewport${device !== 'desktop' ? ' is-device' : ''}`}
            style={{ width: d.w, height: d.h, transform: `translate(-50%, -50%) scale(${scale})` }}
          >
            <iframe src={YSF.src} title="Youth Speak Forum website, interactive preview" loading="lazy" />
          </div>
        ) : (
          <div className="wd-poster">
            <img src={device === 'desktop' ? YSF.posters.desktop : YSF.posters.mobile} alt="" loading="lazy"
              className={device === 'desktop' ? '' : 'is-phone'} />
            <button className="wd-launch" onClick={() => setLoaded(true)}>
              <span className="wd-launch__icon"><Play aria-hidden="true" /></span>
              <span><strong>Launch the interactive site</strong><em>Move your cursor, scroll, open the forms</em></span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const built = [
  'A Living Voice hero: a live waveform and voice particles drawn on canvas that react to the cursor.',
  'A scroll driven logo assembly, where the Youth Speak mark builds itself as visitors scroll.',
  'Delegate and partner registration in modals, plus a standalone page for QR codes on posters.',
  'Submissions saved to Google Sheets by type (delegates, partners, speakers, sponsors) with branded confirmation emails.',
  'Optional ambient sound generated in the browser, only after the visitor turns it on.',
  'Event structured data, Open Graph and a sitemap, so the forum shows up in search and looks right when shared.',
]
const stack = ['HTML', 'CSS', 'JavaScript', 'Canvas', 'Web Audio', 'Google Apps Script', 'Google Sheets', 'SEO']

const kinds = [
  { icon: Building2, title: 'Real estate websites and portals', text: 'Project sites and listing portals with virtual tours, 3D masterplans and live availability.' },
  { icon: CalendarDays, title: 'Event and campaign sites', text: 'Launch pages with registration, QR codes and confirmation emails, ready for a deadline.' },
  { icon: Box, title: 'Interactive 3D experiences', text: 'Three.js scenes, digital twins and maps that run smoothly in any browser.', to: '/digital-twins' },
  { icon: LayoutTemplate, title: 'Company websites', text: 'Clear, fast sites that explain what you do and turn visitors into inquiries.' },
  { icon: Code, title: 'Web apps and dashboards', text: 'Internal tools, booking flows and data dashboards connected to your systems.' },
  { icon: ShoppingBag, title: 'Ecommerce', text: 'Online stores with fast product pages, payments and inventory.' },
]

const builtIn = [
  { icon: Gauge, title: 'Fast on any connection', text: 'Lean code, optimised images and lazy loading, so pages open quickly on mobile data.' },
  { icon: Search, title: 'Found by search and AI', text: 'Prerendered pages, structured data, sitemaps and llms.txt, so search engines and AI assistants can read every page.' },
  { icon: Languages, title: 'Arabic and English', text: 'Right to left layouts and bilingual SEO for audiences in Egypt and the Gulf.' },
  { icon: FileSpreadsheet, title: 'Forms that work', text: 'Registrations and inquiries go straight to Google Sheets, email or your CRM.' },
  { icon: Accessibility, title: 'Accessible', text: 'Keyboard navigation, screen reader labels, clear contrast and reduced motion support.' },
  { icon: Workflow, title: 'Yours to own', text: 'Your domain, your accounts and a clean handover, with a CMS when your team needs one.' },
]

const steps = [
  { title: 'Discover', text: 'A short call to agree goals, audience, pages and the one action each visitor should take.' },
  { title: 'Design', text: 'Structure, copy and a visual direction you approve before any code is written.' },
  { title: 'Build and connect', text: 'Development, forms, analytics and SEO, tested on real phones and browsers.' },
  { title: 'Launch and grow', text: 'Go live on your domain, then improve with data, content and new features.' },
]

const more = [
  { icon: Building2, title: 'Off plan compound walkthrough', text: 'Fly from a masterplan into a villa and walk every room.', to: '/digital-twins' },
  { icon: Map, title: 'New Zayed Atlas', text: 'A full screen 3D map web app with a compound directory and comparison.', to: '/new-zayed-atlas' },
  { icon: Monitor, title: 'Interactive 3D tour', text: 'The walkable apartment on our home page, built with Three.js.', to: '/' },
]

const faqs = [
  { q: 'How long does a website take?', a: 'A focused landing page or event site usually takes a few weeks. Larger portals and web apps are planned in phases, and we agree the timeline after a short discovery call.' },
  { q: 'Will I own the website?', a: 'Yes. The code, content, domain and accounts are yours, and we hand everything over at launch.' },
  { q: 'Can you build in Arabic?', a: 'Yes. We build bilingual Arabic and English sites with proper right to left layouts and Arabic SEO.' },
  { q: 'Can you connect forms to our tools?', a: 'Yes. Forms can send to Google Sheets, email or your CRM, with a confirmation email for the visitor.' },
  { q: 'Do you look after the site after launch?', a: 'Yes. We offer hosting, updates and improvements after launch.' },
]

export default function WebDevelopment() {
  usePageMeta('Web Development')
  return (
    <>
      <section className="wd-hero">
        <div className="container wd-hero__grid">
          <div className="intro">
            <span className="eyebrow">Web Development</span>
            <h1 className="h1">Websites people remember, built to rank and convert.</h1>
            <p className="lead">
              We design and build fast, interactive websites for real estate, events and brands: 3D experiences, Arabic and
              English, forms wired to your tools, and SEO that works for both search engines and AI assistants.
            </p>
            <div className="btn-row" style={{ marginTop: 28 }}>
              <Link to="/contact" state={{ service: 'Web Development' }} className="btn btn--primary">Get a quote <ArrowRight aria-hidden="true" /></Link>
              <a href="#work" className="btn btn--secondary">See the work</a>
            </div>
            <ul className="wd-hero__ticks">
              {['Interactive and 3D', 'Arabic and English', 'Search and AI ready'].map((t) => <li key={t}><Check aria-hidden="true" />{t}</li>)}
            </ul>
          </div>
          <div className="wd-hero__shot intro" style={{ '--delay': '150ms' }} aria-hidden="true">
            <div className="wd-hero__browser"><img src={YSF.posters.desktop} alt="" /></div>
            <div className="wd-hero__phone"><img src={YSF.posters.mobile} alt="" /></div>
          </div>
        </div>
      </section>

      <section id="work" className="section" aria-labelledby="work-title">
        <div className="container">
          <SectionHeader
            eyebrow="Featured project"
            title={<span id="work-title">Youth Speak Forum for AIESEC</span>}
            lead="An event website with a living, interactive hero and registrations that land straight in Google Sheets. Explore the real site below, then switch between desktop, tablet and mobile."
          />
          <Reveal><SitePreview /></Reveal>
          <p className="wd-note">Registration is turned off in this preview. The live site is at <a href={YSF.live} target="_blank" rel="noopener">{YSF.host}</a>.</p>

          <div className="wd-case">
            <Reveal className="wd-case__built">
              <h3 className="h3">What we built</h3>
              <ul className="check-list">
                {built.map((b) => <li key={b}><Check aria-hidden="true" />{b}</li>)}
              </ul>
            </Reveal>
            <Reveal className="card wd-case__facts" delay={80}>
              <dl>
                <div><dt>Client</dt><dd>AIESEC, Youth Speak Forum</dd></div>
                <div><dt>Project</dt><dd>Event website and registration</dd></div>
                <div><dt>Delivered</dt><dd>Design, development, forms, emails, SEO</dd></div>
              </dl>
              <h4>Built with</h4>
              <ul className="wd-chips">{stack.map((s) => <li key={s}>{s}</li>)}</ul>
              <a href={YSF.live} target="_blank" rel="noopener" className="link-arrow">Visit the live site <ExternalLink aria-hidden="true" /></a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="kinds-title">
        <div className="container">
          <SectionHeader eyebrow="What we build" title={<span id="kinds-title">From launch pages to full platforms.</span>} />
          <div className="grid grid-3">
            {kinds.map(({ icon: I, title, text, to }, i) => (
              <Reveal key={title} delay={(i % 3) * 70} className="card">
                <div className="icon-tile"><I aria-hidden="true" /></div>
                <h3 className="h3">{title}</h3>
                <p>{text}</p>
                {to && <Link to={to} className="link-arrow">See examples <ArrowRight aria-hidden="true" /></Link>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--navy" aria-labelledby="builtin-title">
        <div className="container">
          <SectionHeader eyebrow="Built in, not bolted on" title={<span id="builtin-title">Every site ships with the things that matter.</span>}
            lead="This website is built the same way: prerendered for search and AI, bilingual, accessible and fast." />
          <div className="wd-builtin">
            {builtIn.map(({ icon: I, title, text }, i) => (
              <Reveal key={title} delay={(i % 3) * 70} className="wd-builtin__item">
                <I aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="process-title">
        <div className="container">
          <SectionHeader eyebrow="Process" title={<span id="process-title">Clear steps, no surprises.</span>} />
          <ol className="steps">
            {steps.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 80} className="step">
                <h3 className="h3">{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="more-title">
        <div className="container">
          <SectionHeader eyebrow="More interactive work" title={<span id="more-title">Built for the browser, no apps to install.</span>} />
          <div className="grid grid-3">
            {more.map(({ icon: I, title, text, to }, i) => (
              <Reveal key={title} delay={i * 70}>
                <Link to={to} className="card card--link" style={{ display: 'block', height: '100%' }}>
                  <div className="icon-tile icon-tile--navy"><I aria-hidden="true" /></div>
                  <h3 className="h3">{title}</h3>
                  <p style={{ marginBottom: 12 }}>{text}</p>
                  <span className="link-arrow">Open <ArrowRight aria-hidden="true" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="wd-faq-title">
        <div className="container">
          <SectionHeader center eyebrow="FAQ" title={<span id="wd-faq-title">Questions about your website.</span>} />
          <FAQ items={faqs} />
        </div>
      </section>

      <CTABand title="Ready for a website people remember?" lead="Tell us what you need and we’ll reply within one business day with a plan and a quote." />
    </>
  )
}
