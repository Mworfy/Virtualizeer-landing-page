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
const serviceHtml = (s) => `<section><h2>${esc(s.name)}</h2><p>${esc(s.intro)}</p><ul>${s.features.map((f) => `<li><strong>${esc(f.title)}:</strong> ${esc(f.text)}</li>`).join('')}</ul><p>Use cases: ${esc(s.useCases.join(', '))}.</p><p>What you receive: ${esc(s.deliverables.join(', '))}.</p></section>`
const stepsHtml = `<section><h2>How it works</h2><ol>${steps.map((p) => `<li><strong>${esc(p.title)}:</strong> ${esc(p.text)}</li>`).join('')}</ol></section>`

// ── Route bodies ──
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
  '/web-development': () => `<h1>Real estate website development with virtual tours built in</h1>${serviceHtml(services[2])}${stepsHtml}`,
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
  '/web-development': () => [orgLd(), serviceLd('web-development'), crumbs('/web-development', 'Web Development')],
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
  write(`/projects/${p.slug}`, page({ path: `/projects/${p.slug}`, title: p.title, description: p.summary, body: `<h1>${esc(p.title)}</h1><p>${esc(p.summary)}</p>`, index: false }))
}

// ── sitemap.xml ──
const urls = Object.entries(ROUTES)
  .map(([path, m]) => `  <url><loc>${canonicalFor(path)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${m.priority.toFixed(1)}</priority></url>`)
  .join('\n')
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)

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

console.log(`prerendered ${Object.keys(ROUTES).length} pages + ${projects.length} project pages, sitemap, robots, llms.txt`)
