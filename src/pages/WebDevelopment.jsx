import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility, ArrowRight, Box, Building2, CalendarDays, Check, ChevronDown, Code, ExternalLink, FileSpreadsheet, Gauge,
  Languages, LayoutTemplate, Map, Maximize2, Monitor, Play, Search, ShoppingBag, Smartphone, Tablet, Workflow, X,
} from 'lucide-react'
import { CTABand, FAQ, Reveal, SectionHeader, usePageMeta } from '../components/ui.jsx'

// Portfolio. `src` is what loads in the device preview: a demo copy in public/work (forms off) or the live site.
const SCRATCH = 'Built from scratch'
const CODEV = 'Co developed'
const PROJECTS = [
  {
    id: 'wiab', name: 'Where it all begins', client: 'AIESEC in Egypt', type: 'Exchange programmes website', origin: CODEV,
    src: '/work/where-it-all-begins/index.html', live: 'https://whereitallbegins.aiesec.org.eg/', host: 'whereitallbegins.aiesec.org.eg',
    posters: { desktop: '/work/where-it-all-begins-desktop.jpg', mobile: '/work/where-it-all-begins-mobile.jpg' }, demo: true,
    summary: 'A cinematic website that invites international students to spend their exchange in Egypt and helps them choose the right programme.',
    built: [
      'Opens on a desert sunset scene of the pyramids that moves gently as you explore.',
      'A Why Egypt page that tours the country, from Cairo and Luxor to Aswan, Dahab and the White Desert.',
      'Clear pages for the three programmes: volunteering, internships and teaching abroad, each leading to real opportunities.',
      'Students can sign in with their AIESEC account and follow their own journey to Egypt.',
      'Warm colours, Egyptian patterns and the word Egypt in many languages, so the site feels like the trip itself.',
    ],
  },
  {
    id: 'ysf', name: 'Youth Speak Forum', client: '', type: 'Event website and registration', origin: SCRATCH,
    src: '/work/ysf/site.html', live: 'https://ysf.aiesecus.org/', host: 'ysf.aiesecus.org',
    posters: { desktop: '/work/ysf-desktop.jpg', mobile: '/work/ysf-mobile.jpg' }, demo: true,
    summary: 'The website for Youth Speak Forum, an event where young people discuss the issues that matter to them, with registration for everyone involved.',
    built: [
      'Opens with a living voice animation that responds as visitors move around the page.',
      'The Youth Speak logo builds itself piece by piece as visitors scroll.',
      'Delegates, partners, speakers and sponsors can each register in a few steps, right from the page.',
      'Every person who registers receives a branded confirmation email.',
      'A separate registration page for QR codes on posters and flyers.',
      'Optional ambient sound that visitors can turn on for a more immersive visit.',
    ],
  },
  {
    id: 'konnect', name: 'Konnect', client: 'Konnect HR services', type: 'HR outsourcing platform', origin: SCRATCH,
    src: 'https://konnect-services.com/', live: 'https://konnect-services.com/', host: 'konnect-services.com',
    posters: { desktop: '/work/konnect-desktop.jpg', mobile: '/work/konnect-mobile.jpg' },
    summary: 'A hiring platform that connects job seekers with companies, and helps recruiters find the right people faster.',
    built: [
      'Job seekers create a profile and upload their CV in minutes.',
      'Talent is organised by field of experience, so companies find suitable candidates quickly.',
      'Companies browse and shortlist candidates in one place.',
      'Recruiters share personal apply links and see which link brought in each applicant.',
      'A bold, modern look with a connecting rings animation that reflects the brand.',
    ],
  },
]
const MORE = [
  {
    id: 'y2b', name: 'Youth to Business (Y2B)', client: 'AIESEC in Egypt', type: 'Conference website and ticketing', origin: SCRATCH,
    src: '/work/y2b/index.html', live: 'https://youth2business.aiesec.org.eg/', host: 'youth2business.aiesec.org.eg',
    posters: { desktop: '/work/y2b-desktop.jpg', mobile: '/work/y2b-mobile.jpg' }, demo: true,
    summary: 'A conference website with ticket sales, promo codes and content the organising team updates themselves.',
    built: [
      'Ticket pricing with early bird rates and percentage promo codes, through to checkout.',
      'A Django admin where the team edits the hero, dates, venue, counters and buttons without code.',
      'Pages for the agenda, speakers, partners, companies, media and FAQs.',
      'Partner applications sent to the AIESEC partners API, with feedback and member forms saved to Google Sheets.',
      'Media stored on DigitalOcean Spaces and deployed with Docker.',
    ],
  },
  {
    id: 'mea-xlds', name: 'MEA XLDS 2026', client: 'AIESEC in the Middle East and Africa', type: 'Leadership conference website', origin: SCRATCH,
    src: '/work/mea-xlds/index.html', live: 'https://mea-xlds.aiesec.org.eg/', host: 'mea-xlds.aiesec.org.eg',
    posters: { desktop: '/work/mea-xlds-desktop.jpg', mobile: '/work/mea-xlds-mobile.jpg' }, demo: true,
    summary: 'The website for the regional leadership conference, with event details and registration for delegates.',
  },
  {
    id: 'aiesec-us', name: 'AIESEC in the United States', client: '', type: 'National website', origin: CODEV,
    src: 'https://aiesecus.org/', live: 'https://aiesecus.org/', host: 'aiesecus.org',
    posters: { desktop: '/work/aiesec-us-desktop.jpg', mobile: '/work/aiesec-us-mobile.jpg' },
    summary: 'The national website for volunteering, internships and youth leadership, with programme sign ups, stories, news and donations.',
  },
  {
    id: 'aiesec-egypt', name: 'AIESEC in Egypt', client: 'AIESEC in Egypt', type: 'National landing page', origin: CODEV,
    src: 'https://aiesec.org.eg/', live: 'https://aiesec.org.eg/', host: 'aiesec.org.eg',
    posters: { desktop: '/work/aiesec-egypt-desktop.jpg', mobile: '/work/aiesec-egypt-mobile.jpg' },
    summary: 'The new national landing page, built together with the AIESEC in Egypt team.',
  },
]
const ALL = [...PROJECTS, ...MORE]
const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor, w: 1440, h: 900 },
  { id: 'tablet', label: 'Tablet', icon: Tablet, w: 820, h: 1180 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone, w: 390, h: 844 },
]

function SitePreview({ project, autoload = false }) {
  const stageRef = useRef(null)
  const narrow = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 720px)').matches
  const [device, setDevice] = useState(narrow ? 'mobile' : 'desktop')
  const [loaded, setLoaded] = useState(autoload)
  const [scale, setScale] = useState(1)
  const d = DEVICES.find((x) => x.id === device)

  // A new project starts on its poster again
  useEffect(() => { setLoaded(autoload) }, [project.id, autoload])

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
        <span className="wd-url"><span className="wd-lock" aria-hidden="true" />{project.host}</span>
        <div className="wd-devices" role="group" aria-label="Preview device">
          {DEVICES.map(({ id, label, icon: I }) => (
            <button key={id} aria-pressed={device === id} onClick={() => setDevice(id)} title={label}>
              <I aria-hidden="true" /><span>{label}</span>
            </button>
          ))}
        </div>
        <div className="wd-preview__actions">
          <a href={project.src} target="_blank" rel="noopener" className="wd-iconbtn" aria-label="Open the preview full screen" title="Full screen"><Maximize2 aria-hidden="true" /></a>
          <a href={project.live} target="_blank" rel="noopener" className="wd-iconbtn" aria-label="Visit the live site" title="Live site"><ExternalLink aria-hidden="true" /></a>
        </div>
      </div>
      <div ref={stageRef} className={`wd-stage wd-stage--${device}`}>
        {loaded ? (
          <div
            className={`wd-viewport${device !== 'desktop' ? ' is-device' : ''}`}
            style={{ width: d.w, height: d.h, transform: `translate(-50%, -50%) scale(${scale})` }}
          >
            <iframe key={project.id} src={project.src} title={`${project.name} website, interactive preview`} loading="lazy" />
          </div>
        ) : (
          <div className="wd-poster">
            <img src={device === 'desktop' ? project.posters.desktop : project.posters.mobile} alt="" loading="lazy"
              className={device === 'desktop' ? '' : 'is-phone'} />
            <button className="wd-launch" onClick={() => setLoaded(true)}>
              <span className="wd-launch__icon"><Play aria-hidden="true" /></span>
              <span><strong>Launch the interactive site</strong><em>Scroll, click and switch devices</em></span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function OriginBadge({ origin }) {
  return <span className={`wd-badge${origin === CODEV ? ' wd-badge--co' : ''}`}>{origin}</span>
}

function PreviewNote({ project }) {
  return (
    <p className="wd-note">
      {project.demo ? 'Forms are turned off in this preview. ' : 'This is the live site. '}
      Visit it at <a href={project.live} target="_blank" rel="noopener">{project.host}</a>.
    </p>
  )
}

function FeaturedWork() {
  const [active, setActive] = useState(PROJECTS[0].id)
  const p = PROJECTS.find((x) => x.id === active)
  return (
    <>
      <div className="wd-tabs" role="tablist" aria-label="Featured projects">
        {PROJECTS.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === active} onClick={() => setActive(x.id)}>
            <strong>{x.name}</strong><em>{x.type}</em>
          </button>
        ))}
      </div>
      <Reveal><SitePreview project={p} /></Reveal>
      <PreviewNote project={p} />
      <div className="wd-case">
        <div className="wd-case__built">
          <OriginBadge origin={p.origin} />
          <h3 className="h3">{p.name}</h3>
          <p className="wd-case__summary">{p.summary}</p>
          <ul className="check-list">
            {p.built.map((b) => <li key={b}><Check aria-hidden="true" />{b}</li>)}
          </ul>
        </div>
        <div className="card wd-case__facts">
          <dl>
            {p.client && <div><dt>Client</dt><dd>{p.client}</dd></div>}
            <div><dt>Project</dt><dd>{p.type}</dd></div>
            <div><dt>How we worked</dt><dd>{p.origin}</dd></div>
          </dl>
          <a href={p.live} target="_blank" rel="noopener" className="link-arrow">Visit the live site <ExternalLink aria-hidden="true" /></a>
        </div>
      </div>
    </>
  )
}

function MoreWork() {
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  useEffect(() => {
    if (!viewing) return
    const onKey = (e) => e.key === 'Escape' && setViewing(null)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [viewing])
  return (
    <div className="wd-more">
      <button className="btn btn--secondary" aria-expanded={open} aria-controls="wd-more-grid" onClick={() => setOpen((o) => !o)}>
        {open ? 'Show fewer websites' : `Show more websites (${MORE.length})`}
        <ChevronDown aria-hidden="true" className={open ? 'is-flipped' : ''} />
      </button>
      {open && (
        <ul id="wd-more-grid" className="wd-more__grid">
          {MORE.map((x) => (
            <li key={x.id} className="card wd-more__card">
              <button className="wd-more__shot" onClick={() => setViewing(x)} aria-label={`Preview ${x.name} on desktop, tablet and mobile`}>
                <img src={x.posters.desktop} alt="" loading="lazy" />
                <span className="wd-more__play"><Play aria-hidden="true" /></span>
              </button>
              <OriginBadge origin={x.origin} />
              <h3 className="h3">{x.name}</h3>
              <p className="wd-more__meta">{x.client ? `${x.client} · ${x.type}` : x.type}</p>
              <p>{x.summary}</p>
              <div className="wd-more__links">
                <button className="link-arrow" onClick={() => setViewing(x)}>Preview on any device <ArrowRight aria-hidden="true" /></button>
                <a href={x.live} target="_blank" rel="noopener" className="link-arrow">Live site <ExternalLink aria-hidden="true" /></a>
              </div>
            </li>
          ))}
        </ul>
      )}
      {viewing && (
        <div className="wd-modal" role="dialog" aria-modal="true" aria-label={`${viewing.name} preview`} onClick={(e) => e.target === e.currentTarget && setViewing(null)}>
          <div className="wd-modal__inner">
            <div className="wd-modal__head">
              <div><OriginBadge origin={viewing.origin} /><h3 className="h3">{viewing.name}</h3></div>
              <button className="wd-modal__close" onClick={() => setViewing(null)} aria-label="Close preview" autoFocus><X aria-hidden="true" /></button>
            </div>
            <SitePreview project={viewing} autoload />
            <PreviewNote project={viewing} />
          </div>
        </div>
      )}
    </div>
  )
}

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

// Hero illustration: a site being assembled (wireframe browser, code and phone), not a screenshot
function HeroArt() {
  return (
    <div className="wd-art">
      <div className="wd-art__browser">
        <div className="wd-art__bar"><i /><i /><i /><span /></div>
        <div className="wd-art__page">
          <div className="wd-art__nav"><b /><span /><span /><span /><em /></div>
          <div className="wd-art__hero">
            <div><span className="l1" /><span className="l2" /><span className="l3" /><em /></div>
            <div className="wd-art__visual"><i className="r1" /><i className="r2" /><i className="dot" /></div>
          </div>
          <div className="wd-art__cards"><span /><span /><span /></div>
        </div>
      </div>
      <div className="wd-art__code">
        <p><span className="k">const</span> <span className="v">site</span> = {'{'}</p>
        <p className="in"><span className="p">fast</span>: <span className="b">true</span>,</p>
        <p className="in"><span className="p">languages</span>: [<span className="s">'ar'</span>, <span className="s">'en'</span>],</p>
        <p className="in"><span className="p">seo</span>: <span className="s">'search + AI'</span>,</p>
        <p>{'}'}</p>
      </div>
      <div className="wd-art__phone">
        <b /><span className="l1" /><span className="l2" /><div className="blk" /><span className="l3" /><em />
      </div>
      <div className="wd-art__chip wd-art__chip--a"><Gauge aria-hidden="true" />Fast</div>
      <div className="wd-art__chip wd-art__chip--b"><Languages aria-hidden="true" />AR · EN</div>
    </div>
  )
}

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
            <HeroArt />
          </div>
        </div>
      </section>

      <section id="work" className="section" aria-labelledby="work-title">
        <div className="container">
          <SectionHeader
            eyebrow="Selected work"
            title={<span id="work-title">Websites we have built</span>}
            lead="Three of our favourite projects, running for real below. Pick one, then switch between desktop, tablet and mobile."
          />
          <FeaturedWork />
          <MoreWork />
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
