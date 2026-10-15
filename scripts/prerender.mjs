// Build-time pre-rendering for SEO and GEO.
// Writes a static HTML file per route (own title, description, canonical, Open Graph,
// JSON-LD and readable content) so search engines and AI crawlers that do not run
// JavaScript still see the page. React replaces the fallback content on load.
// Also writes sitemap.xml, robots.txt, llms.txt and llms-full.txt.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { company, services, process as steps, faqs, industries, projects } from '../src/content.js'
import { COMPOUNDS, REGION } from '../src/components/atlas/data.js'
import {
  SITE_URL, SITE_NAME, OG_IMAGE, ORG_DESCRIPTION, ROUTES, canonicalFor,
  orgLd, websiteLd, serviceLd, faqLd, breadcrumbLd,
} from '../src/seo.js'
import {
  AR_NAME, AR_ORG_DESCRIPTION, AR_PATH, AR_ROUTES, AR_NAV, AR_SERVICES, AR_PROCESS, AR_INDUSTRIES, AR_FAQS,
  AR_REGION, AR_LANDMARKS, unitAr, deliveryAr, acresToFeddan,
} from '../src/seo.ar.js'
import { GUIDES, LOCATIONS, AR_GUIDE, GUIDES_UPDATED } from '../src/seo.guides.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const today = new Date().toISOString().slice(0, 10)

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
const realCompounds = COMPOUNDS.filter((c) => !c.concept)

// ── Shared fallback chrome ──
const nav = `<nav aria-label="Main"><a href="/">Virtualizeer</a> · ${services.map((s) => `<a href="${s.path}">${esc(s.name)}</a>`).join(' · ')} · <a href="/new-zayed-atlas">New Zayed Atlas</a> · <a href="/projects">Projects</a> · <a href="/about">About</a> · <a href="/contact">Contact</a></nav>`
const footer = `<footer><p>${esc(ORG_DESCRIPTION)}</p><p>Email: <a href="mailto:${esc(company.email)}">${esc(company.email)}</a> · ${esc(company.location)}</p><p>${company.socials.map((s) => `<a href="${esc(s.href)}">${esc(s.label)}</a>`).join(' · ')}</p></footer>`
const faqHtml = (items) => `<section><h2>Frequently asked questions</h2>${items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>`
const serviceHtml = (s) => `<section><h2>${esc(s.name)}</h2><p>${esc(s.intro)}</p><ul>${s.features.map((f) => `<li><strong>${esc(f.title)}:</strong> ${esc(f.text)}</li>`).join('')}</ul>${s.sectors ? `<h3>Who it is for</h3><ul>${s.sectors.map((x) => `<li>${esc(x.name)}</li>`).join('')}</ul>` : `<p>Use cases: ${esc(s.useCases.join(', '))}.</p>`}<p>What you receive: ${esc(s.deliverables.join(', '))}.</p></section>`
const stepsHtml = `<section><h2>How it works</h2><ol>${steps.map((p) => `<li><strong>${esc(p.title)}:</strong> ${esc(p.text)}</li>`).join('')}</ol></section>`

// ── Route bodies ──
// Websites shown on the Web Development page (keep in sync with src/pages/WebDevelopment.jsx)
const PORTFOLIO = [
  { name: 'Where it all begins', client: 'AIESEC in Egypt', origin: 'co developed', url: 'https://whereitallbegins.aiesec.org.eg/', text: 'A cinematic website inviting international students to Egypt with destination stories, the volunteer, talent and teacher programmes and an AIESEC sign in journey.' },
  { name: 'Youth Speak Forum', client: '', origin: 'built from scratch', url: 'https://ysf.aiesecus.org/', text: 'An event website with a living, interactive canvas hero, a scroll driven logo assembly and registrations saved to Google Sheets with branded confirmation emails.' },
  { name: 'Konnect', client: 'Konnect HR services', origin: 'built from scratch', url: 'https://konnect-services.com/', text: 'An HR outsourcing platform in Next.js and TypeScript where applicants apply with CVs, companies browse talent by field and HR teams share tracked apply links.' },
  { name: 'Youth to Business (Y2B)', client: 'AIESEC in Egypt', origin: 'built from scratch', url: 'https://youth2business.aiesec.org.eg/', text: 'A Django conference website with ticketing, early bird pricing, promo codes, checkout and an admin for all event content.' },
  { name: 'MEA XLDS 2026', client: 'AIESEC in the Middle East and Africa', origin: 'built from scratch', url: 'https://mea-xlds.aiesec.org.eg/', text: 'The regional leadership conference website with registrations.' },
  { name: 'AIESEC in the United States', client: '', origin: 'co developed', url: 'https://aiesecus.org/', text: 'The national website for volunteering, internships and youth leadership, with programme sign ups, a blog, news, donations and a CMS.' },
  { name: 'AIESEC in Egypt', client: 'AIESEC in Egypt', origin: 'co developed', url: 'https://aiesec.org.eg/', text: 'The national landing page, built together with the AIESEC in Egypt team.' },
]

const bodies = {
  '/': () => `<h1>Virtual tours, digital twins and real estate websites in Egypt</h1>
    <p>${esc(ORG_DESCRIPTION)}</p>
    ${services.map((s) => `<section><h2><a href="${s.path}">${esc(s.name)}</a></h2><p>${esc(s.short)} ${esc(s.intro)}</p></section>`).join('')}
    <section><h2>Industries we serve</h2><p>${esc(industries.map((i) => i.name).join(', '))}.</p></section>
    <section><h2><a href="/new-zayed-atlas">New Zayed Atlas</a></h2><p>An interactive 3D map of New Zayed with ${realCompounds.length} compounds to look up and compare.</p></section>
    ${stepsHtml}${faqHtml(faqs)}`,
  '/virtual-tours': () => `<h1>360° virtual tours for real estate in Egypt</h1>${serviceHtml(services[0])}${stepsHtml}${faqHtml(faqs.slice(0, 4))}`,
  '/digital-twins': () => `<h1>3D digital twins for real estate, off plan sales and facilities</h1>${serviceHtml(services[1])}
    <section><h2>Interactive use cases</h2>
      <h3>Residential compound: off plan sales</h3><p>Buyers explore a compound masterplan from above, click a villa, fly down to first person and walk through every room before it is built.</p>
      <h3>Manufacturing plant</h3><p>A cut away 3D factory connected to live machine data: machine status, alerts, temperature, vibration, throughput and OEE, with maintenance work orders.</p>
      <h3>Zayed Reimagined, New Zayed</h3><p>A concept compound of 10 L shaped courtyard villas around an oval park and lagoon, opened from a map of New Zayed and fully walkable room by room.</p>
      <h3><a href="/new-zayed-atlas">New Zayed Atlas</a></h3><p>A 3D reference map of New Zayed with its compounds, Sphinx International Airport, Sheikh Zayed City and the Cairo Alex Desert Road.</p>
    </section>${stepsHtml}`,
  '/web-development': () => `<h1>Websites people remember, built to rank and convert</h1>
    <p>We design and build fast, interactive websites for real estate, events and brands: 3D experiences, Arabic and English, forms wired to your tools, and SEO that works for search engines and AI assistants.</p>
    <section><h2>Websites we have built</h2><ul>${PORTFOLIO.map((w) => `<li><strong><a href="${w.url}">${esc(w.name)}</a></strong>${w.client ? ` for ${esc(w.client)}` : ''} (${w.origin}): ${esc(w.text)}</li>`).join('')}</ul></section>
    <section><h2>What we build</h2><ul><li>Real estate websites and portals with virtual tours, 3D masterplans and live availability</li><li>Event and campaign sites with registration, QR codes and confirmation emails</li><li>Interactive 3D experiences, digital twins and maps</li><li>Company websites</li><li>Web apps and dashboards</li><li>Ecommerce</li></ul></section>
    <section><h2>Built in on every site</h2><ul><li>Fast on any connection</li><li>Prerendered pages, structured data, sitemaps and llms.txt for search engines and AI assistants</li><li>Arabic and English with right to left layouts</li><li>Forms connected to Google Sheets, email or your CRM</li><li>Accessibility</li><li>Full ownership and a clean handover</li></ul></section>
    ${serviceHtml(services[2])}`,
  '/new-zayed-atlas': () => `<h1>New Zayed Atlas: interactive 3D map of New Zayed compounds</h1>
    <p>${esc(REGION.summary)} New Zayed covers about 35 million m².</p>
    <p>The map highlights Sphinx International Airport, Sheikh Zayed City, 6th of October, New Giza, New Sphinx City, Smart Village, Mall of Arabia, the Grand Egyptian Museum and the Giza Pyramids, connected by the Cairo Alex Desert Road, Al Dabaa Axis, Rod El Farag Axis and 26th of July Axis.</p>
    <section><h2>Compounds in New Zayed</h2><ul>${realCompounds.map((c) => `<li><strong>${esc(c.name)}</strong> by ${esc(c.developer)}${c.acres ? `, about ${c.acres} acres` : ''}. Unit types: ${esc(c.units.join(', '))}.${c.delivery ? ` Delivery: ${esc(c.delivery)}.` : ''}</li>`).join('')}</ul>
    <p>Compound locations on the map are indicative. Confirm details with each developer.</p></section>`,
  '/projects': () => `<h1>Projects</h1><p>Virtual tour, digital twin and website projects by Virtualizeer. Explore the interactive demos on the <a href="/digital-twins">Digital Twins</a> page and the <a href="/new-zayed-atlas">New Zayed Atlas</a>.</p>`,
  '/about': () => `<h1>About Virtualizeer</h1><p>${esc(ORG_DESCRIPTION)}</p><p>We help developers, brokers, hotels, retailers and contractors show their spaces with the clarity of a visit and the reach of the web.</p>`,
  '/contact': () => `<h1>Contact Virtualizeer</h1><p>Tell us about your property, compound or facility and we will reply within one business day with a tailored quote for a virtual tour, digital twin or website.</p><p>Email: <a href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>`,
}

// ── Route JSON-LD ──
const crumbs = (path, name) => breadcrumbLd([['Home', '/'], [name, path]])
const routeLd = {
  '/': () => [orgLd(), websiteLd(), faqLd()],
  '/virtual-tours': () => [orgLd(), serviceLd('virtual-tours'), crumbs('/virtual-tours', 'Virtual Tours')],
  '/digital-twins': () => [orgLd(), serviceLd('digital-twins'), crumbs('/digital-twins', 'Digital Twins')],
  '/web-development': () => [
    orgLd(), serviceLd('web-development'),
    ...PORTFOLIO.map((w) => ({ '@context': 'https://schema.org', '@type': 'WebSite', name: w.name, url: w.url, description: w.text, creator: { '@id': `${SITE_URL}/#organization` } })),
    crumbs('/web-development', 'Web Development'),
  ],
  '/new-zayed-atlas': () => [
    orgLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'New Zayed Atlas',
      url: canonicalFor('/new-zayed-atlas'),
      applicationCategory: 'ReferenceApplication',
      operatingSystem: 'Any (web browser)',
      description: ROUTES['/new-zayed-atlas'].description,
      creator: { '@id': `${SITE_URL}/#organization` },
      about: { '@type': 'Place', name: 'New Zayed', description: REGION.summary, containedInPlace: { '@type': 'Country', name: 'Egypt' } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Residential compounds in New Zayed',
      numberOfItems: realCompounds.length,
      itemListElement: realCompounds.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Place', name: c.name, description: `Residential compound by ${c.developer} in New Zayed, Egypt.`, containedInPlace: { '@type': 'Place', name: 'New Zayed' } },
      })),
    },
    crumbs('/new-zayed-atlas', 'New Zayed Atlas'),
  ],
  '/projects': () => [orgLd(), crumbs('/projects', 'Projects')],
  '/about': () => [orgLd(), crumbs('/about', 'About')],
  '/contact': () => [orgLd(), crumbs('/contact', 'Contact')],
}

// ── Page writer ──
const stripHead = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta name="description"[^>]*>\s*/i, '')
    .replace(/<meta property="og:[^"]+"[^>]*>\s*/gi, '')

const hreflang = (enPath) => {
  const ar = AR_PATH[enPath]
  if (!ar) return []
  return [
    `<link rel="alternate" hreflang="en" href="${canonicalFor(enPath)}" />`,
    `<link rel="alternate" hreflang="ar" href="${SITE_URL}${ar}" />`,
    `<link rel="alternate" hreflang="x-default" href="${canonicalFor(enPath)}" />`,
  ]
}

function page({ path, title, description, body, jsonld = [], index = true }) {
  const url = canonicalFor(path)
  const fullTitle = `${title} | ${SITE_NAME}`
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="${index ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow'}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(fullTitle)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    `<meta name="geo.region" content="EG-C" />`,
    `<meta name="geo.placename" content="Cairo" />`,
    `<link rel="alternate" type="text/plain" title="LLM summary" href="${SITE_URL}/llms.txt" />`,
    ...(index ? hreflang(path) : []),
    ...jsonld.map(ld),
  ].join('\n    ')
  const fallback = `<div class="seo-fallback">${nav}<main>${body}</main>${footer}</div>`
  return stripHead(template)
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
}

function write(path, html) {
  const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

// Indexable routes
for (const [path, meta] of Object.entries(ROUTES)) {
  write(path, page({ path, title: meta.title, description: meta.description, body: bodies[path](), jsonld: routeLd[path]() }))
}
// Sample project pages: rendered for users, kept out of search until the content is real
for (const p of projects) {
  write(`/projects/${p.slug}`, page({ path: `/projects/${p.slug}`, title: p.title, description: p.summary, body: `<h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p>${p.live ? `<p>${esc(p.challenge)}</p><p>${esc(p.solution)}</p><p>Live site: <a href="${p.live}">${p.live}</a></p>` : ""}`, index: Boolean(p.live) }))
}


// ── Arabic pages (standalone, right to left, not linked from the English site) ──
const arUrl = (p) => `${SITE_URL}${p}`
const arCss = `
  :root { --navy: #0f2a40; --ink: #0f2a40; --ink2: #4a5866; --line: #e2e5ea; --bg2: #f5f5f7; --gold: #c9a35a; --accent: #2f6fa8; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif; color: var(--ink); background: #fff; line-height: 1.8; font-size: 17px; }
  a { color: var(--accent); }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }
  header { position: sticky; top: 0; z-index: 5; background: rgba(255,255,255,.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--line); }
  header .wrap { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 68px; flex-wrap: wrap; padding-block: 8px; }
  header img { height: 28px; width: auto; display: block; }
  nav { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: .95rem; }
  nav a { color: var(--ink2); text-decoration: none; padding: 6px 0; }
  nav a[aria-current] { color: var(--ink); font-weight: 700; }
  .hero { background: linear-gradient(180deg, #fff, var(--bg2)); padding: 64px 0 48px; }
  h1 { font-size: clamp(1.9rem, 4.5vw, 3rem); line-height: 1.3; font-weight: 800; letter-spacing: 0; }
  .lead { font-size: 1.15rem; color: var(--ink2); margin-top: 16px; max-width: 46rem; }
  .cta { display: inline-flex; align-items: center; min-height: 48px; padding: 0 24px; border-radius: 999px; background: var(--navy); color: #fff; text-decoration: none; font-weight: 700; margin-top: 24px; }
  .cta.ghost { background: transparent; color: var(--navy); border: 1px solid #cfd5dc; margin-inline-start: 8px; }
  section { padding: 44px 0; border-bottom: 1px solid var(--line); }
  h2 { font-size: 1.6rem; font-weight: 800; margin-bottom: 14px; }
  h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 4px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .card { background: var(--bg2); border-radius: 18px; padding: 20px; }
  .card p, .muted { color: var(--ink2); }
  ul.list, ol.list { padding-inline-start: 22px; display: grid; gap: 6px; }
  .pills { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; list-style: none; }
  .pills li { background: var(--bg2); border-radius: 999px; padding: 6px 14px; font-size: .95rem; }
  details { border-bottom: 1px solid var(--line); padding: 14px 0; }
  summary { cursor: pointer; font-weight: 700; }
  details p { color: var(--ink2); margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: .95rem; }
  th, td { text-align: start; padding: 10px 8px; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--ink2); font-weight: 700; }
  td bdi { font-weight: 700; color: var(--navy); }
  footer { background: #0a1e2e; color: #b8c5d1; padding: 40px 0; margin-top: 0; }
  footer a { color: #fff; }
  footer p { margin-bottom: 6px; }
  :focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
`
const arNav = (current) =>
  `<nav aria-label="القائمة الرئيسية">${AR_NAV.map(([p, l]) => `<a href="${p}"${p === current ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`
const arFooter = (enPath) => `<footer><div class="wrap">
  <p>${esc(AR_ORG_DESCRIPTION)}</p>
  <p>البريد الإلكتروني: <a href="mailto:${esc(company.email)}">${esc(company.email)}</a> · القاهرة، مصر</p>
  <p>${company.socials.map((s) => `<a href="${esc(s.href)}" rel="noopener">${esc(s.label)}</a>`).join(' · ')}</p>
  <p><a href="${canonicalFor(enPath)}" hreflang="en" lang="en">English</a></p>
</div></footer>`
const arCta = `<a class="cta" href="/ar/contact">اطلب عرض سعر</a>`
const arService = (i) => {
  const s = AR_SERVICES[i]
  return `<section><div class="wrap"><h2>المميزات</h2><div class="grid">${s.features.map(([t, d]) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}</div></div></section>
  <section><div class="wrap"><h2>الاستخدامات</h2><ul class="pills">${s.useCases.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>
  <h2 style="margin-top:28px">ما ستحصل عليه</h2><ul class="list">${s.deliverables.map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div></section>`
}
const arSteps = `<section><div class="wrap"><h2>كيف نعمل</h2><ol class="list">${AR_PROCESS.map(([t, d]) => `<li><strong>${esc(t)}:</strong> ${esc(d)}</li>`).join('')}</ol></div></section>`
const arFaq = (items) => `<section><div class="wrap"><h2>الأسئلة الشائعة</h2>${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`

const arBodies = {
  '/ar': () => `${AR_SERVICES.map((s, i) => `<section><div class="wrap"><h2><a href="${['/ar/virtual-tours', '/ar/digital-twins', '/ar/web-development'][i]}">${esc(s.name)}</a></h2><p class="muted">${esc(s.short)} ${esc(s.intro)}</p></div></section>`).join('')}
    <section><div class="wrap"><h2>القطاعات التي نخدمها</h2><ul class="pills">${AR_INDUSTRIES.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div></section>
    <section><div class="wrap"><h2><a href="/ar/new-zayed-atlas">أطلس زايد الجديدة</a></h2><p class="muted">خريطة تفاعلية ثلاثية الأبعاد لمدينة زايد الجديدة تضم ${realCompounds.length} كمبوندًا يمكنك البحث عنها والمقارنة بينها.</p></div></section>
    ${arSteps}${arFaq(AR_FAQS)}`,
  '/ar/virtual-tours': () => `${arService(0)}${arSteps}${arFaq(AR_FAQS.slice(0, 4))}`,
  '/ar/digital-twins': () => `${arService(1)}
    <section><div class="wrap"><h2>أمثلة تفاعلية</h2><div class="grid">
      <div class="card"><h3>كمبوند سكني: البيع قبل البناء</h3><p>يستكشف المشترون المخطط العام للكمبوند من أعلى، ثم يختارون فيلا وينتقلون إلى منظور الشخص الأول ويتجولون داخل كل غرفة قبل بنائها.</p></div>
      <div class="card"><h3>مصنع</h3><p>نموذج ثلاثي الأبعاد مفتوح لمصنع مرتبط ببيانات الآلات المباشرة: حالة الآلات والتنبيهات والحرارة والاهتزاز والإنتاجية وأوامر الصيانة.</p></div>
      <div class="card"><h3>زايد ريإيماجند، زايد الجديدة</h3><p>كمبوند تصوري من 10 فيلات بفناء على شكل حرف L حول حديقة بيضاوية وبحيرة، يُفتح من خريطة زايد الجديدة ويمكن التجول فيه غرفة غرفة.</p></div>
      <div class="card"><h3><a href="/ar/new-zayed-atlas">أطلس زايد الجديدة</a></h3><p>خريطة مرجعية ثلاثية الأبعاد لزايد الجديدة وكمبونداتها ومطار سفنكس الدولي ومدينة الشيخ زايد وطريق مصر الإسكندرية الصحراوي.</p></div>
    </div><a class="cta ghost" href="/digital-twins" hreflang="en" lang="en" style="margin-inline-start:0">جرب الأمثلة التفاعلية (بالإنجليزية)</a></div></section>${arSteps}`,
  '/ar/web-development': () => `${arService(2)}${arSteps}`,
  '/ar/new-zayed-atlas': () => `<section><div class="wrap"><h2>عن زايد الجديدة</h2><p class="muted">${esc(AR_REGION)}</p><p class="muted" style="margin-top:10px">${esc(AR_LANDMARKS)}</p>
      <a class="cta" href="/new-zayed-atlas" hreflang="en">افتح الأطلس التفاعلي ثلاثي الأبعاد</a></div></section>
    <section><div class="wrap"><h2>كمبوندات زايد الجديدة</h2>
      <table><thead><tr><th scope="col">الكمبوند</th><th scope="col">المطور</th><th scope="col">المساحة</th><th scope="col">أنواع الوحدات</th><th scope="col">التسليم</th></tr></thead><tbody>
      ${realCompounds.map((c) => `<tr><td><bdi>${esc(c.name)}</bdi></td><td><bdi>${esc(c.developer)}</bdi></td><td>${c.acres ? `حوالي ${acresToFeddan(c.acres)} فدان` : 'غير معلنة'}</td><td>${esc(c.units.map(unitAr).join('، '))}</td><td>${esc(deliveryAr(c.delivery) ?? 'غير معلن')}</td></tr>`).join('')}
      </tbody></table>
      <p class="muted" style="margin-top:12px">مواقع الكمبوندات على الخريطة تقريبية، ويُرجى التأكد من التفاصيل مع كل مطور.</p></div></section>`,
  '/ar/about': () => `<section><div class="wrap"><p class="muted">بدأنا Virtualizeer بعد أن رأينا المشترين والضيوف وفرق المشروعات يتخذون قرارات كبيرة بناءً على بضع صور فقط. الصور تُسطّح المكان، أما الجولة الافتراضية فتتيح التنقل داخله، والتوأم الرقمي يتيح القياس والتخطيط بداخله.</p><p class="muted" style="margin-top:10px">نصور ونبني وننشر الأماكن لقطاعات العقارات والضيافة والتجزئة والمقاولات، ونبني المواقع التي توصلها إلى الجمهور المناسب.</p></div></section>`,
  '/ar/contact': () => `<section><div class="wrap"><p class="muted">أخبرنا عن العقار أو الكمبوند أو المنشأة، وسنرد عليك خلال يوم عمل واحد بعرض سعر مناسب لجولة افتراضية أو توأم رقمي أو موقع إلكتروني.</p>
      <p style="margin-top:16px">البريد الإلكتروني: <a href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>
      <a class="cta" href="mailto:${esc(company.email)}">راسلنا عبر البريد الإلكتروني</a><a class="cta ghost" href="/contact" hreflang="en" lang="en">نموذج الاتصال (بالإنجليزية)</a></div></section>`,
}

const arLd = (path, meta) => {
  const out = [
    { ...orgLd(), description: AR_ORG_DESCRIPTION },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${arUrl(path)}#webpage`,
      url: arUrl(path),
      name: meta.title,
      description: meta.description,
      inLanguage: 'ar',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
    },
  ]
  if (meta.service !== undefined) {
    const s = AR_SERVICES[meta.service]
    out.push({
      '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.intro, inLanguage: 'ar', url: arUrl(path),
      provider: { '@id': `${SITE_URL}/#organization` }, areaServed: { '@type': 'Country', name: 'مصر' },
    })
  }
  if (path === '/ar') out.push({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'ar', mainEntity: AR_FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })
  if (path === '/ar/new-zayed-atlas') out.push({
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'كمبوندات زايد الجديدة', inLanguage: 'ar', numberOfItems: realCompounds.length,
    itemListElement: realCompounds.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Place', name: c.name, description: `كمبوند سكني من تطوير ${c.developer} في زايد الجديدة، مصر.` } })),
  })
  if (path !== '/ar') out.push({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [['الرئيسية', '/ar'], [meta.h1, path]].map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: arUrl(p) })),
  })
  return out
}

for (const [path, meta] of Object.entries(AR_ROUTES)) {
  const fullTitle = `${meta.title} | Virtualizeer`
  const lead = path === '/ar' ? AR_ORG_DESCRIPTION : meta.description
  const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(meta.description)}" />
    <link rel="canonical" href="${arUrl(path)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="alternate" hreflang="ar" href="${arUrl(path)}" />
    <link rel="alternate" hreflang="en" href="${canonicalFor(meta.en)}" />
    <link rel="alternate" hreflang="x-default" href="${canonicalFor(meta.en)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(AR_NAME)}" />
    <meta property="og:locale" content="ar_EG" />
    <meta property="og:locale:alternate" content="en_US" />
    <meta property="og:url" content="${arUrl(path)}" />
    <meta property="og:title" content="${esc(fullTitle)}" />
    <meta property="og:description" content="${esc(meta.description)}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(fullTitle)}" />
    <meta name="twitter:description" content="${esc(meta.description)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="geo.region" content="EG-C" />
    <meta name="geo.placename" content="القاهرة" />
    <meta name="theme-color" content="#F5F5F7" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>${arCss}</style>
    ${arLd(path, meta).map(ld).join('\n    ')}
  </head>
  <body>
    <header><div class="wrap"><a href="/ar" aria-label="Virtualizeer الرئيسية"><img src="/brand/logo-h-navy.png" alt="Virtualizeer" width="140" height="28" /></a>${arNav(path)}</div></header>
    <main>
      <div class="hero"><div class="wrap"><h1>${esc(meta.h1)}</h1><p class="lead">${esc(lead)}</p>${path === '/ar/contact' ? '' : arCta}</div></div>
      ${arBodies[path]()}
    </main>
    ${arFooter(meta.en)}
  </body>
</html>
`
  if (path === '/ar') {
    write('/ar', html)
    mkdirSync(join(dist, 'ar'), { recursive: true })
    writeFileSync(join(dist, 'ar', 'index.html'), html)
  } else write(path, html)
}

// ── English guides and location pages (static, linked from the site footer) ──
const enCss = arCss.replace("font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif;", "font-family: 'Inter', system-ui, sans-serif;")
  + ` h1, h2 { font-family: 'Manrope', 'Inter', sans-serif; letter-spacing: -0.02em; } h1 { letter-spacing: -0.03em; } .note { font-size: .9rem; color: var(--ink2); background: var(--bg2); border-radius: 12px; padding: 10px 14px; margin-top: 18px; }`
const EN_NAV = [['/', 'Home'], ['/virtual-tours', 'Virtual Tours'], ['/digital-twins', 'Digital Twins'], ['/web-development', 'Web Development'], ['/new-zayed-atlas', 'New Zayed Atlas'], ['/contact', 'Contact']]
const enNav = `<nav aria-label="Main">${EN_NAV.map(([p, l]) => `<a href="${p}">${l}</a>`).join('')}</nav>`
const enFooter = (arPath) => `<footer><div class="wrap">
  <p>${esc(ORG_DESCRIPTION)}</p>
  <p>Email: <a href="mailto:${esc(company.email)}">${esc(company.email)}</a> · ${esc(company.location)}</p>
  <p>Guides: ${GUIDES.map((g) => `<a href="${g.path}">${esc(g.h1.split(':')[0])}</a>`).join(' · ')}</p>
  <p>Areas: ${LOCATIONS.map((l) => `<a href="${l.path}">${esc(l.area)}</a>`).join(' · ')}</p>
  ${arPath ? `<p><a href="${arPath}" hreflang="ar" lang="ar">العربية</a></p>` : ''}
</div></footer>`
const sectionHtml = (sec) => `<section><div class="wrap"><h2>${esc(sec.h2)}</h2>
  ${(sec.p ?? []).map((t) => `<p class="muted">${esc(t)}</p>`).join('')}
  ${sec.list ? `<ul class="list">${sec.list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
  ${sec.table ? `<table><thead><tr>${sec.table.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${sec.table.rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('')}</tr>`).join('')}</tbody></table>` : ''}
</div></section>`
const faqSection = (items, h2 = 'Frequently asked questions') => `<section><div class="wrap"><h2>${h2}</h2>${items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>`
const faqLdFrom = (items, lang = 'en') => ({ '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })
const articleLd = (path, meta, lang = 'en') => ({
  '@context': 'https://schema.org', '@type': 'Article', headline: meta.h1, description: meta.description, inLanguage: lang,
  datePublished: GUIDES_UPDATED, dateModified: GUIDES_UPDATED, mainEntityOfPage: `${SITE_URL}${path}`, image: OG_IMAGE,
  author: { '@id': `${SITE_URL}/#organization` }, publisher: { '@id': `${SITE_URL}/#organization` },
})
const crumbsLd = (trail) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map(([n, p], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: `${SITE_URL}${p}` })) })

function staticPage({ lang, path, title, description, h1, lead, body, jsonld, alternates, cta = true }) {
  const ar = lang === 'ar'
  const fullTitle = `${title} | Virtualizeer`
  const alts = alternates ? Object.entries(alternates).map(([hl, p]) => `<link rel="alternate" hreflang="${hl}" href="${SITE_URL}${p}" />`).join('\n    ') : ''
  return `<!doctype html>
<html lang="${lang}"${ar ? ' dir="rtl"' : ''}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(fullTitle)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${SITE_URL}${path}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    ${alts}
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${ar ? esc(AR_NAME) : SITE_NAME}" />
    <meta property="og:locale" content="${ar ? 'ar_EG' : 'en_US'}" />
    <meta property="og:url" content="${SITE_URL}${path}" />
    <meta property="og:title" content="${esc(fullTitle)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(fullTitle)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="geo.region" content="EG-C" />
    <meta name="theme-color" content="#F5F5F7" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?${ar ? 'family=IBM+Plex+Sans+Arabic:wght@400;600;700' : 'family=Inter:wght@400;500;600&family=Manrope:wght@700;800'}&display=swap" rel="stylesheet" />
    <style>${ar ? arCss : enCss}</style>
    ${jsonld.map(ld).join('\n    ')}
  </head>
  <body>
    <header><div class="wrap"><a href="${ar ? '/ar' : '/'}" aria-label="Virtualizeer"><img src="/brand/logo-h-navy.png" alt="Virtualizeer" width="140" height="28" /></a>${ar ? arNav(path) : enNav}</div></header>
    <main>
      <div class="hero"><div class="wrap"><h1>${esc(h1)}</h1><p class="lead">${esc(lead)}</p>${cta ? `<a class="cta" href="${ar ? '/ar/contact' : '/contact'}">${ar ? 'اطلب عرض سعر' : 'Get a quote'}</a>` : ''}</div></div>
      ${body}
    </main>
    ${ar ? arFooter(alternates?.en ?? '/') : enFooter(alternates?.ar)}
  </body>
</html>
`
}

const extraUrls = []
for (const g of GUIDES) {
  const isCompanies = Boolean(g.companies)
  const companiesHtml = isCompanies
    ? `<section><div class="wrap"><h2>Companies at a glance</h2>
        <table><thead><tr><th scope="col">Company</th><th scope="col">Based</th><th scope="col">Focus</th></tr></thead><tbody>
        ${g.companies.map((c) => `<tr><th scope="row">${esc(c.name)}</th><td>${esc(c.based)}</td><td>${esc(c.focus)}</td></tr>`).join('')}
        </tbody></table><p class="note">${esc(g.disclosure)}</p></div></section>
      <section><div class="wrap"><h2>What each company offers</h2>${g.companies.map((c) => `<h3>${esc(c.name)}</h3><p class="muted" style="margin-bottom:14px">${esc(c.about)}</p>`).join('')}</div></section>`
    : ''
  const links = g.links ? `<section><div class="wrap">${g.links.map(([p, l], i) => `<a class="cta${i ? ' ghost' : ''}" href="${p}">${esc(l)}</a>`).join('')}</div></section>` : ''
  const body = companiesHtml + g.sections.map(sectionHtml).join('') + links + (g.faqs ? faqSection(g.faqs) : '')
  const alternates = g.path === AR_GUIDE.en ? { en: g.path, ar: AR_GUIDE.path, 'x-default': g.path } : null
  const jsonld = [
    orgLd(), articleLd(g.path, g),
    ...(isCompanies ? [{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Virtual tour and digital twin companies in Egypt', numberOfItems: g.companies.length, itemListElement: g.companies.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Organization', name: c.name, description: c.about } })) }] : []),
    ...(g.faqs ? [faqLdFrom(g.faqs)] : []),
    crumbsLd([['Home', '/'], ['Guides', g.path], [g.h1, g.path]].slice(0, 1).concat([[g.h1, g.path]])),
  ]
  write(g.path, staticPage({ lang: 'en', path: g.path, title: g.title, description: g.description, h1: g.h1, lead: g.lead, body, jsonld, alternates }))
  extraUrls.push({ path: g.path, priority: isCompanies ? 0.8 : 0.7, alternates })
}
for (const l of LOCATIONS) {
  const body = `<section><div class="wrap"><h2>${esc(l.area)}</h2><p class="muted">${esc(l.local)}</p></div></section>
    <section><div class="wrap"><h2>What we capture in ${esc(l.area)}</h2><ul class="pills">${l.fits.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></div></section>
    <section><div class="wrap"><h2>Our services</h2><div class="grid">${services.map((sv) => `<div class="card"><h3><a href="${sv.path}">${esc(sv.name)}</a></h3><p>${esc(sv.short)}</p></div>`).join('')}</div></div></section>
    ${(l.links ?? []).length ? `<section><div class="wrap">${l.links.map(([p, t]) => `<a class="cta ghost" style="margin-inline-start:0" href="${p}">${esc(t)}</a>`).join('')}</div></section>` : ''}
    ${stepsHtml.replace('<section>', '<section><div class="wrap">').replace('</section>', '</div></section>')}`
  const jsonld = [
    orgLd(),
    { '@context': 'https://schema.org', '@type': 'Service', name: `Virtual tours and digital twins in ${l.area}`, description: l.description, provider: { '@id': `${SITE_URL}/#organization` }, areaServed: { '@type': 'Place', name: `${l.area}, Egypt` }, url: `${SITE_URL}${l.path}` },
    crumbsLd([['Home', '/'], [l.area, l.path]]),
  ]
  write(l.path, staticPage({ lang: 'en', path: l.path, title: l.title, description: l.description, h1: l.title, lead: l.description, body, jsonld }))
  extraUrls.push({ path: l.path, priority: 0.7, alternates: null })
}
// Arabic companies guide
{
  const g = AR_GUIDE
  const body = `<section><div class="wrap"><h2>الشركات في لمحة</h2>
      <table><thead><tr><th scope="col">الشركة</th><th scope="col">المقر</th><th scope="col">ما تقدمه</th></tr></thead><tbody>
      ${g.companies.map(([n, b, a]) => `<tr><td><bdi>${esc(n)}</bdi></td><td>${esc(b)}</td><td>${esc(a)}</td></tr>`).join('')}
      </tbody></table><p class="muted" style="margin-top:12px">${esc(g.disclosure)}</p></div></section>
    <section><div class="wrap"><h2>كيف تختار شركة جولات افتراضية في مصر</h2><ul class="list">${g.checklist.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div></section>`
  const alternates = { ar: g.path, en: g.en, 'x-default': g.en }
  const jsonld = [
    { ...orgLd(), description: AR_ORG_DESCRIPTION },
    articleLd(g.path, g, 'ar'),
    { '@context': 'https://schema.org', '@type': 'ItemList', inLanguage: 'ar', name: 'شركات الجولات الافتراضية والتوأم الرقمي في مصر', numberOfItems: g.companies.length, itemListElement: g.companies.map(([n, , a], i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': 'Organization', name: n, description: a } })) },
    crumbsLd([['الرئيسية', '/ar'], [g.h1, g.path]]),
  ]
  write(g.path, staticPage({ lang: 'ar', path: g.path, title: g.title, description: g.description, h1: g.h1, lead: g.lead, body, jsonld, alternates }))
  extraUrls.push({ path: g.path, priority: 0.8, alternates })
}

for (const p of projects.filter((x) => x.live)) extraUrls.push({ path: `/projects/${p.slug}`, priority: 0.6, alternates: null })

// ── sitemap.xml (with hreflang alternates) ──
const alt = (enPath) => {
  const ar = AR_PATH[enPath]
  if (!ar) return ''
  return `\n    <xhtml:link rel="alternate" hreflang="en" href="${canonicalFor(enPath)}"/>\n    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl(ar)}"/>\n    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalFor(enPath)}"/>`
}
const urls = [
  ...Object.entries(ROUTES).map(([path, m]) => `  <url><loc>${canonicalFor(path)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${m.priority.toFixed(1)}</priority>${alt(path)}\n  </url>`),
  ...Object.entries(AR_ROUTES).map(([path, m]) => `  <url><loc>${arUrl(path)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${(ROUTES[m.en]?.priority ?? 0.6).toFixed(1)}</priority>${alt(m.en)}\n  </url>`),
  ...extraUrls.map((u) => `  <url><loc>${SITE_URL}${u.path}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u.priority.toFixed(1)}</priority>${u.alternates ? Object.entries(u.alternates).map(([hl, p]) => `\n    <xhtml:link rel="alternate" hreflang="${hl}" href="${SITE_URL}${p}"/>`).join('') : ''}\n  </url>`),
].join('\n')
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`)

// ── robots.txt: welcome search engines and AI assistants ──
const aiBots = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'Bingbot',
  'DuckAssistBot', 'meta-externalagent', 'Amazonbot', 'CCBot', 'cohere-ai', 'MistralAI-User', 'YouBot',
]
writeFileSync(
  join(dist, 'robots.txt'),
  `# Virtualizeer welcomes search engines and AI assistants.\nUser-agent: *\nAllow: /\n\n${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)

// ── llms.txt (llmstxt.org) and llms-full.txt ──
const llms = `# ${SITE_NAME}

> ${ORG_DESCRIPTION}

${SITE_NAME} captures real spaces as 360° virtual tours and measurable 3D digital twins, and builds real estate websites with those experiences built in. It also builds interactive 3D experiences for off plan sales, letting buyers explore a compound and walk through a home before it is built.

Contact: ${company.email}. Based in ${company.location}. Serves clients across Egypt.

## Services
${services.map((s) => `- [${s.name}](${SITE_URL}${s.path}): ${s.short}`).join('\n')}

## Interactive work
- [Digital Twins showcase](${SITE_URL}/digital-twins): residential compound off plan walkthrough, manufacturing plant twin with live data, and Zayed Reimagined, a New Zayed concept compound.
- [New Zayed Atlas](${SITE_URL}/new-zayed-atlas): 3D map of New Zayed, Egypt, with ${realCompounds.length} compounds to look up and compare, plus Sphinx International Airport, Sheikh Zayed City and the Cairo Alex Desert Road.

## Company
- [About](${SITE_URL}/about)
- [Contact and quotes](${SITE_URL}/contact)

## Guides
${GUIDES.map((g) => `- [${g.title}](${SITE_URL}${g.path}): ${g.description}`).join('\n')}

## Areas served
${LOCATIONS.map((l) => `- [${l.area}](${SITE_URL}${l.path})`).join('\n')}

## Arabic (العربية)
${Object.entries(AR_ROUTES).map(([p, m]) => `- [${m.title}](${SITE_URL}${p})`).join('\n')}

## Optional
- [Full text for AI assistants](${SITE_URL}/llms-full.txt)
`
writeFileSync(join(dist, 'llms.txt'), llms)

const llmsFull = `${llms}
---

# Services in detail
${services.map((s) => `
## ${s.name}
${s.intro}

Features:
${s.features.map((f) => `- ${f.title}: ${f.text}`).join('\n')}

Use cases: ${s.useCases.join(', ')}.
Deliverables: ${s.deliverables.join(', ')}.
URL: ${SITE_URL}${s.path}
`).join('')}
# How it works
${steps.map((p, i) => `${i + 1}. ${p.title}: ${p.text}`).join('\n')}

# Industries
${industries.map((i) => `- ${i.name}`).join('\n')}

# Frequently asked questions
${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}

# New Zayed, Egypt
${REGION.summary} About 35 million m².

Compounds in New Zayed listed in the New Zayed Atlas (details change often; confirm with each developer):
${realCompounds.map((c) => `- ${c.name}, by ${c.developer}${c.acres ? `, about ${c.acres} acres` : ''}. Unit types: ${c.units.join(', ')}.${c.delivery ? ` Delivery: ${c.delivery}.` : ''}`).join('\n')}

Atlas: ${SITE_URL}/new-zayed-atlas
`
writeFileSync(join(dist, 'llms-full.txt'), llmsFull)

console.log(`prerendered ${Object.keys(ROUTES).length} pages + ${Object.keys(AR_ROUTES).length} Arabic pages + ${extraUrls.length} guide/location pages + ${projects.length} project pages, sitemap, robots, llms.txt`)
