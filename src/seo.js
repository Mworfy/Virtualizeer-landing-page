// SEO + GEO configuration shared by the live app (usePageMeta) and the build-time
// pre-renderer (scripts/prerender.mjs). Change SITE_URL when a custom domain is added.
import { company, services, faqs } from './content.js'

export const SITE_URL = 'https://virtualizeer-landing-page.vercel.app'
export const SITE_NAME = 'Virtualizeer'
export const OG_IMAGE = `${SITE_URL}/brand/og.png`

export const ORG_DESCRIPTION =
  'Virtualizeer is a Cairo based studio that creates 360° virtual tours, measurable 3D digital twins and websites for real estate developers, brokers, hotels, retail and construction in Egypt.'

// Real, verifiable facts only. Placeholder content (sample projects, testimonials, stats,
// phone number) is deliberately left out until it is real.
export const FACTS = {
  email: company.email,
  location: company.location,
  sameAs: company.socials.map((s) => s.href),
}

const svc = Object.fromEntries(services.map((s) => [s.slug, s]))

// Per route title + description. `title` is the part before " | Virtualizeer".
export const ROUTES = {
  '/': {
    title: 'Virtual Tours, Digital Twins & Real Estate Websites in Egypt',
    description:
      'Virtualizeer creates 360° virtual tours, 3D digital twins and websites for real estate in Egypt. Let buyers walk through homes, compounds and off plan projects online.',
    priority: 1.0,
  },
  '/virtual-tours': {
    title: '360° Virtual Tours for Real Estate in Egypt',
    description:
      '360° virtual tours for real estate, hotels, showrooms, restaurants, gyms, schools, nurseries, clinics, offices, malls, event venues and museums in Cairo and across Egypt. Floor plans, hotspots, VR and Google Street View.',
    priority: 0.9,
  },
  '/digital-twins': {
    title: '3D Digital Twins for Real Estate, Off Plan Sales & Facilities',
    description:
      'Measurable 3D digital twins of buildings, compounds and factories. Interactive off plan compound walkthroughs, construction progress capture and facility management in Egypt.',
    priority: 0.9,
  },
  '/web-development': {
    title: 'Real Estate Website Development with Virtual Tours',
    description:
      'Fast, modern real estate and property websites with virtual tours and 3D digital twins built in. Listing portals, landing pages and booking flows for developers and brokers in Egypt.',
    priority: 0.8,
  },
  '/new-zayed-atlas': {
    title: 'New Zayed Atlas: 3D Map of New Zayed Compounds',
    description:
      'Interactive 3D map of New Zayed, Egypt: compounds and developers, Sphinx International Airport, Sheikh Zayed City and the Cairo Alex Desert Road. Look up and compare New Zayed compounds.',
    priority: 0.9,
  },
  '/projects': {
    title: 'Projects: Virtual Tours, Digital Twins & Websites',
    description: 'Virtual tour, digital twin and website projects by Virtualizeer for real estate, hospitality and construction.',
    priority: 0.6,
  },
  '/about': {
    title: 'About Us: 3D Capture & Web Studio in Cairo',
    description: 'Virtualizeer is a team of 3D capture specialists and web developers in Cairo, Egypt, bringing real places online.',
    priority: 0.6,
  },
  '/contact': {
    title: 'Contact: Get a Virtual Tour or Digital Twin Quote',
    description: 'Tell us about your property, compound or facility and get a quote for a virtual tour, digital twin or website from Virtualizeer.',
    priority: 0.7,
  },
}

export const routeMeta = (path) => ROUTES[path] ?? null
export const canonicalFor = (path) => `${SITE_URL}${path === '/' ? '/' : path}`

// ── JSON-LD builders ──────────────────────────────────────
export const orgLd = () => ({
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/lockup-navy.png`,
  image: OG_IMAGE,
  description: ORG_DESCRIPTION,
  email: FACTS.email,
  sameAs: FACTS.sameAs,
  address: { '@type': 'PostalAddress', addressLocality: 'Cairo', addressCountry: 'EG' },
  areaServed: { '@type': 'Country', name: 'Egypt' },
  knowsAbout: [
    'Virtual tours', '360 degree photography', 'Matterport style 3D tours', 'Digital twins', '3D scanning',
    'Real estate marketing', 'Off plan property sales', 'Construction progress documentation',
    'Facility management', 'Real estate website development', 'New Zayed', 'Sheikh Zayed City',
  ],
  makesOffer: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, url: `${SITE_URL}${s.path}` } })),
})

export const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: ORG_DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en',
})

export const serviceLd = (slug) => {
  const s = svc[slug]
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.name,
    description: s.intro,
    url: `${SITE_URL}${s.path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Egypt' },
    audience: { '@type': 'Audience', audienceType: s.useCases.join(', ') },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${s.name} features`,
      itemListElement: s.features.map((f) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: f.title, description: f.text } })),
    },
  }
}

export const faqLd = (items = faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

export const breadcrumbLd = (trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: canonicalFor(path) })),
})
