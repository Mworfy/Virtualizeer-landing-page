// ───────────────────────────────────────────────────────────────
// All editable site content lives here.
// Search for "TODO" to find every placeholder that needs real info.
// ───────────────────────────────────────────────────────────────

export const company = {
  name: 'Virtualizeer',
  tagline: 'Step inside before you arrive.',
  email: 'info@virtualizeer.com',
  phone: '+20 100 000 0000', // TODO: real phone
  whatsapp: '201000000000', // TODO: WhatsApp number, digits only with country code
  location: 'Cairo, Egypt', // TODO: city / address
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/virtualizeer' },
    { label: 'Instagram', href: 'https://www.instagram.com/virtualizeer/' },
  ],
}

// Optional: paste one of your own tour links (Matterport, Kuula, 3DVista, etc.).
// Leave empty to show the built in interactive 3D apartment tour instead.
export const demoTourUrl = ''

export const services = [
  {
    slug: 'virtual-tours',
    path: '/virtual-tours',
    icon: 'Rotate3d',
    name: 'Virtual Tours',
    short: '360° walkthroughs anyone can explore from any screen.',
    headline: 'Let people walk through your space from anywhere.',
    intro: 'High resolution 360° tours that open on any phone, laptop or VR headset. No app needed.',
    get useCases() { return this.sectors.map((x) => x.name) },
    features: [
      { icon: 'Orbit', title: '360° walkthroughs', text: 'Move room to room in crisp HDR.' },
      { icon: 'MapPin', title: 'Hotspots', text: 'Tag products, videos and links in the space.' },
      { icon: 'LayoutGrid', title: 'Floor plan & dollhouse', text: 'Visitors always know where they are.' },
      { icon: 'Glasses', title: 'VR ready', text: 'Works in headsets and any browser.' },
      { icon: 'Map', title: 'Google Street View', text: 'Be found and seen inside on Google Maps.' },
      { icon: 'Share2', title: 'Share & embed', text: 'One link for listings, socials and QR codes.' },
    ],
    sectors: [
      { icon: 'Building2', name: 'Real estate' },
      { icon: 'BedDouble', name: 'Hotels & resorts' },
      { icon: 'Palmtree', name: 'Holiday homes' },
      { icon: 'Sofa', name: 'Furniture showrooms' },
      { icon: 'Car', name: 'Car showrooms' },
      { icon: 'ShoppingBag', name: 'Retail & malls' },
      { icon: 'UtensilsCrossed', name: 'Restaurants & cafés' },
      { icon: 'Dumbbell', name: 'Gyms & clubs' },
      { icon: 'Flower2', name: 'Spas & salons' },
      { icon: 'GraduationCap', name: 'Schools & universities' },
      { icon: 'Baby', name: 'Nurseries' },
      { icon: 'Stethoscope', name: 'Clinics & hospitals' },
      { icon: 'Briefcase', name: 'Offices & coworking' },
      { icon: 'PartyPopper', name: 'Event & wedding venues' },
      { icon: 'Landmark', name: 'Museums & culture' },
      { icon: 'Factory', name: 'Factories & warehouses' },
    ],
    deliverables: ['Hosted tour with a share link', 'Embed code for your website', 'Floor plan and dollhouse view', 'Branded intro and hotspots', 'HD stills for marketing'],
  },
  {
    slug: 'digital-twins',
    path: '/digital-twins',
    icon: 'Box',
    name: 'Digital Twins',
    short: 'Accurate 3D copies of buildings you can measure.',
    headline: 'A precise digital copy of your building.',
    intro: 'Measure, plan and manage your space remotely, from one shared 3D model.',
    features: [
      { icon: 'Ruler', title: 'Measure anything', text: 'Point to point, right in the model.' },
      { icon: 'HardHat', title: 'Construction progress', text: 'Compare stages and catch issues early.' },
      { icon: 'Tags', title: 'Asset tagging', text: 'Pin equipment and documents in place.' },
      { icon: 'FileBox', title: 'BIM & CAD exports', text: 'Point clouds, OBJ, E57 and floor plans.' },
      { icon: 'Building2', title: 'Facility management', text: 'Plan work without a site visit.' },
      { icon: 'ShieldCheck', title: 'As built records', text: 'A dated record for insurance and handover.' },
    ],
    useCases: ['Construction', 'Facility management', 'Architecture & interiors', 'Industrial sites', 'Insurance', 'Heritage'],
    deliverables: ['Measurable 3D model', 'Point cloud and mesh exports', 'Floor plans', 'Tagged asset library', 'Progress capture schedule'],
  },
  {
    slug: 'web-development',
    path: '/web-development',
    icon: 'Code2',
    name: 'Web Development',
    short: 'Fast websites and web apps, with your tours built in.',
    headline: 'Websites that show your space and convert visitors.',
    intro: 'Fast, accessible websites with your tours and 3D built right in.',
    features: [
      { icon: 'MonitorSmartphone', title: 'Responsive', text: 'Great on every screen.' },
      { icon: 'Zap', title: 'Fast', text: 'Quick to load, even on mobile data.' },
      { icon: 'Rotate3d', title: 'Tours built in', text: 'Tours and 3D feel native, not bolted on.' },
      { icon: 'Search', title: 'SEO ready', text: 'Easy for people to find you.' },
      { icon: 'LayoutDashboard', title: 'Easy to update', text: 'Your team edits content itself.' },
      { icon: 'LifeBuoy', title: 'Support', text: 'Hosting and updates after launch.' },
    ],
    useCases: ['Company websites', 'Property portals', 'Landing pages', 'Booking flows', 'Web apps', 'Ecommerce'],
    deliverables: ['Design', 'Responsive build', 'Content editing setup', 'Analytics and SEO', 'Launch and handover'],
  },
]

export const process = [
  { title: 'Discover', text: 'A short call about your goals.' },
  { title: 'Capture', text: 'We scan on site with pro 3D cameras.' },
  { title: 'Build', text: 'We polish and brand it.' },
  { title: 'Launch', text: 'You get a link, embeds and support.' },
]

export const stats = [
  // TODO: replace with your real numbers
  { value: '120+', label: 'Spaces captured' },
  { value: '1M+', label: 'Sq ft digitised' },
  { value: '48h', label: 'Typical turnaround' },
  { value: '4.9', label: 'Average client rating' },
]

export const industries = [
  { icon: 'Building2', name: 'Real estate' },
  { icon: 'BedDouble', name: 'Hospitality' },
  { icon: 'ShoppingBag', name: 'Retail' },
  { icon: 'GraduationCap', name: 'Education' },
  { icon: 'HardHat', name: 'Construction' },
  { icon: 'Landmark', name: 'Culture & venues' },
]

// TODO: replace with real projects. `category` must be one of: tours, twins, web.
// `tourUrl` is optional, when set, the project page shows the live tour.
// `image` is optional, put files in /public/projects/ and reference as '/projects/name.jpg'.
export const projects = [
  {
    slug: 'nile-view-penthouse',
    title: 'Nile View Penthouse',
    client: 'Sample Realty', // TODO
    category: 'tours',
    location: 'Zamalek, Cairo',
    year: '2026',
    summary: 'A 4 bedroom penthouse tour that let overseas buyers view the property remotely.',
    challenge: 'Most interested buyers lived abroad and could not visit in person.',
    solution: 'A full 360° tour with floor plan, dollhouse view and hotspots for finishes and appliances.',
    results: ['3× more qualified inquiries', 'Sold to an overseas buyer', '40% fewer in person viewings'],
    tourUrl: demoTourUrl, // TODO: this project's real tour link
    demoTour: true, // shows the built in 3D tour while tourUrl is empty
  },
  {
    slug: 'boutique-hotel',
    title: 'Boutique Hotel Showcase',
    client: 'Sample Hotels', // TODO
    category: 'tours',
    location: 'Red Sea',
    year: '2026',
    summary: 'Room and amenity tours embedded on the booking site and Google Maps.',
    challenge: 'Guests booked on photos alone and expectations were hard to set.',
    solution: 'Tours for every room type, pool and restaurant, published to Google Street View.',
    results: ['Higher direct bookings', 'Longer time on site', 'Fewer pre booking questions'],
    tourUrl: '',
  },
  {
    slug: 'office-tower-twin',
    title: 'Office Tower Digital Twin',
    client: 'Sample Developments', // TODO
    category: 'twins',
    location: 'New Capital',
    year: '2026',
    summary: 'A measurable twin of 12 floors used for fit out planning and facility management.',
    challenge: 'Tenants and contractors needed accurate dimensions without repeated site visits.',
    solution: 'A full building scan with tagged MEP assets and exported point clouds for the design team.',
    results: ['Weeks saved in fit out planning', 'Single source of truth for 6 contractors', 'As built record for handover'],
    tourUrl: '',
  },
  {
    slug: 'construction-progress',
    title: 'Construction Progress Capture',
    client: 'Sample Contractors', // TODO
    category: 'twins',
    location: 'Sheikh Zayed',
    year: '2025',
    summary: 'Monthly scans of a residential compound to track progress against plan.',
    challenge: 'Remote stakeholders lacked a clear view of site progress.',
    solution: 'Scheduled captures with side by side comparisons and issue tagging.',
    results: ['Issues caught before closing walls', 'Fewer site visits for stakeholders', 'Clear documentation trail'],
    tourUrl: '',
  },
  // Real web projects. `live` adds a link to the site; `delivered` replaces the results list.
  {
    slug: 'youth-speak-forum',
    title: 'Youth Speak Forum',
    client: '',
    category: 'web',
    location: 'Online',
    year: '2026',
    summary: 'An event website with a living, interactive hero and registrations that land straight in Google Sheets.',
    challenge: 'The forum needed a site that felt as alive as the event and could take delegate, partner, speaker and sponsor registrations without a backend team.',
    solution: 'A lively site with a voice animation that responds to visitors, a logo that builds itself as you scroll, simple registration for every group and a QR page for posters.',
    delivered: ['Built from scratch', 'Registration for delegates, partners, speakers and sponsors', 'Branded confirmation emails for everyone who registers'],
    image: '/work/ysf-desktop.jpg',
    live: 'https://ysf.aiesecus.org/',
  },
  {
    slug: 'konnect',
    title: 'Konnect',
    client: 'Konnect HR services',
    category: 'web',
    location: 'Online',
    year: '2026',
    summary: 'A hiring platform where applicants apply with CVs, companies browse talent by field and HR teams share tracked apply links.',
    challenge: 'Matching applicants to companies by field was manual, and HR teams could not tell which links brought in which applicants.',
    solution: 'A platform where job seekers build a profile with their CV, companies browse talent by field, and recruiters share personal apply links.',
    delivered: ['Built from scratch', 'Separate journeys for job seekers, companies and recruiters', 'Talent organised by field of experience'],
    image: '/work/konnect-desktop.jpg',
    live: 'https://konnect-services.com/',
  },
  {
    slug: 'youth-to-business',
    title: 'Youth to Business (Y2B)',
    client: 'AIESEC in Egypt',
    category: 'web',
    location: 'Cairo',
    year: '2026',
    summary: 'A conference website with ticket sales, promo codes and content the organising team updates themselves.',
    challenge: 'The team needed to sell tickets with early bird rates and promo codes, and update the site daily without a developer.',
    solution: 'A conference site where visitors buy tickets with early bird prices and promo codes, while the team updates dates, speakers and partners on their own.',
    delivered: ['Built from scratch', 'Ticket sales with early bird prices and promo codes', 'Pages for the agenda, speakers, partners and FAQs'],
    image: '/work/y2b-desktop.jpg',
    live: 'https://youth2business.aiesec.org.eg/',
  },
]

// TODO: replace with real client quotes
export const testimonials = [
  {
    quote: 'The tour did the first viewing for us. Buyers arrived already convinced.',
    name: 'Client Name',
    role: 'Sales Director, Sample Realty',
  },
  {
    quote: 'Having accurate measurements of the whole building online saved our design team weeks.',
    name: 'Client Name',
    role: 'Project Manager, Sample Developments',
  },
  {
    quote: 'Fast, professional and the website finally shows our space the way it feels in person.',
    name: 'Client Name',
    role: 'Owner, Sample Dining',
  },
]


export const partners = [
  { name: 'Career 180', logo: '/partners/career180.webp', url: 'https://career-180.com/' },
  { name: 'AIESEC', logo: '/partners/aiesec.png', url: 'https://aiesec.org/' },
]

export const faqs = [
  { q: 'What is a virtual tour?', a: 'An interactive 360° walkthrough of a real space, on any phone, computer or VR headset.' },
  { q: 'How is a digital twin different?', a: 'A tour shows a space. A twin is a 3D model you can also measure, tag and manage.' },
  { q: 'Can you show a project before it is built?', a: 'Yes. We build 3D compounds and homes from plans, so buyers can walk through them early.' },
  { q: 'How long does it take?', a: 'Most spaces take 1 to 2 hours to capture, and the tour is ready within 48 hours.' },
  { q: 'Do visitors need an app?', a: 'No. Tours open in any modern browser.' },
  { q: 'Can it go on my website?', a: 'Yes. We give you embed code, or build a new site around it.' },
]

export const team = [
  // TODO: real team members (photo optional: '/team/name.jpg')
  { name: 'Founder Name', role: 'Founder & CEO' },
  { name: 'Team Member', role: '3D Capture Lead' },
  { name: 'Team Member', role: 'Lead Web Developer' },
]
