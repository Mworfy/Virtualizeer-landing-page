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
    short: 'Immersive 360° walkthroughs people can explore from any screen.',
    headline: 'Let people walk through your space from anywhere.',
    intro:
      'We capture your property, venue or store in high resolution 360° and turn it into a tour visitors can explore on their phone, laptop or VR headset, no app required.',
    features: [
      { icon: 'Orbit', title: '360° walkthroughs', text: 'Seamless room to room navigation with crisp HDR imagery.' },
      { icon: 'MapPin', title: 'Interactive hotspots', text: 'Tag products, add videos, links and notes right inside the space.' },
      { icon: 'LayoutGrid', title: 'Floor plans & dollhouse', text: 'A top down plan and 3D dollhouse view so visitors never get lost.' },
      { icon: 'Glasses', title: 'VR ready', text: 'Works in VR headsets as well as any modern browser.' },
      { icon: 'Map', title: 'Google Street View', text: 'Publish to Google Maps so customers find you and look inside.' },
      { icon: 'Share2', title: 'Share & embed', text: 'One link for listings, social posts, QR codes and your website.' },
    ],
    useCases: ['Real estate listings', 'Hotels & resorts', 'Restaurants & cafés', 'Retail showrooms', 'Universities & schools', 'Event venues'],
    deliverables: ['Hosted 360° tour with shareable link', 'Embed code for your website', 'Floor plan and dollhouse view', 'Branded intro and hotspots', 'HD stills for marketing'],
  },
  {
    slug: 'digital-twins',
    path: '/digital-twins',
    icon: 'Box',
    name: 'Digital Twins',
    short: 'Accurate, measurable 3D replicas of buildings and facilities.',
    headline: 'A precise digital copy of your building, ready to work with.',
    intro:
      'Our digital twins are dimensionally accurate 3D models of real spaces. Measure, plan, document and manage assets remotely and share a single source of truth with your whole team.',
    features: [
      { icon: 'Ruler', title: 'Measure anything', text: 'Point to point measurements directly in the model.' },
      { icon: 'HardHat', title: 'Construction progress', text: 'Capture each stage and compare to track progress and catch issues early.' },
      { icon: 'Tags', title: 'Asset tagging', text: 'Pin equipment, serial numbers and documents to their exact location.' },
      { icon: 'FileBox', title: 'BIM & CAD exports', text: 'Point clouds, OBJ, E57 and floor plans for architects and engineers.' },
      { icon: 'Building2', title: 'Facility management', text: 'Plan maintenance and renovations without a site visit.' },
      { icon: 'ShieldCheck', title: 'As built records', text: 'A permanent, timestamped record for insurance and handover.' },
    ],
    useCases: ['Construction & contractors', 'Facility management', 'Architecture & interiors', 'Industrial sites', 'Insurance & documentation', 'Heritage preservation'],
    deliverables: ['Measurable 3D model', 'Point cloud / mesh exports', 'Schematic floor plans', 'Tagged asset library', 'Progress capture schedule'],
  },
  {
    slug: 'web-development',
    path: '/web-development',
    icon: 'Code2',
    name: 'Web Development',
    short: 'Fast, modern websites and web apps built around your experience.',
    headline: 'Websites that show your space and convert visitors.',
    intro:
      'We design and build fast, accessible websites and web apps, with your virtual tours and digital twins built right in. From a polished landing page to a full property portal.',
    features: [
      { icon: 'MonitorSmartphone', title: 'Responsive design', text: 'Looks and works great on every screen size.' },
      { icon: 'Zap', title: 'Built for speed', text: 'Modern stacks, optimised images and great Core Web Vitals.' },
      { icon: 'Rotate3d', title: 'Tour integration', text: 'Tours and 3D models embedded natively, not bolted on.' },
      { icon: 'Search', title: 'SEO foundations', text: 'Clean structure and metadata so people can find you.' },
      { icon: 'LayoutDashboard', title: 'Easy to update', text: 'A CMS or admin panel so your team can edit content.' },
      { icon: 'LifeBuoy', title: 'Ongoing support', text: 'Hosting, maintenance and improvements after launch.' },
    ],
    useCases: ['Company websites', 'Property listing portals', 'Landing pages', 'Booking & inquiry flows', 'Web apps & dashboards', 'E commerce'],
    deliverables: ['UX & visual design', 'Responsive build', 'CMS / admin setup', 'Analytics & SEO setup', 'Launch & handover'],
  },
]

export const process = [
  { title: 'Discover', text: 'A short call to understand your space, goals and audience.' },
  { title: 'Capture', text: 'We scan on site with professional 3D and 360° cameras.' },
  { title: 'Build', text: 'We process, brand and polish your tour, twin or website.' },
  { title: 'Launch', text: 'You get a shareable link, embeds and ongoing support.' },
]

export const stats = [
  // TODO: replace with your real numbers
  { value: '120+', label: 'Spaces captured' },
  { value: '1M+', label: 'Sq ft digitised' },
  { value: '48h', label: 'Typical turnaround' },
  { value: '4.9', label: 'Average client rating' },
]

export const industries = [
  { icon: 'Home', name: 'Real estate' },
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
  {
    slug: 'property-portal',
    title: 'Property Listings Portal',
    client: 'Sample Realty', // TODO
    category: 'web',
    location: 'Online',
    year: '2026',
    summary: 'A listings website where every property opens straight into its virtual tour.',
    challenge: 'Listings lived on third party sites with no way to showcase tours.',
    solution: 'A fast, searchable portal with filters, inquiry forms and embedded tours.',
    results: ['Owned lead channel', 'Tours viewed on 70% of visits', 'Under 1s page loads'],
    tourUrl: '',
  },
  {
    slug: 'restaurant-site',
    title: 'Restaurant Website & Tour',
    client: 'Sample Dining', // TODO
    category: 'web',
    location: 'Alexandria',
    year: '2025',
    summary: 'A new website with menu, reservations and a tour of the dining room and terrace.',
    challenge: 'Event bookings needed guests to see the venue before committing.',
    solution: 'A responsive site with reservations and an embedded 360° tour of each area.',
    results: ['More private event inquiries', 'Higher reservation conversion', 'Easy menu updates'],
    tourUrl: '',
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

// TODO: client names/logos shown on the home page
export const clients = ['Sample Realty', 'Sample Hotels', 'Sample Developments', 'Sample Contractors', 'Sample Dining']

export const faqs = [
  { q: 'What is a virtual tour?', a: 'A virtual tour is an interactive 360° walkthrough of a real space. Visitors move from room to room on a phone, computer or VR headset, with floor plans and hotspots, without visiting in person.' },
  { q: 'What is a digital twin, and how is it different from a virtual tour?', a: 'A digital twin is a measurable 3D model of a building or site. A virtual tour shows what a space looks like; a digital twin also lets you measure, tag assets, track construction progress and manage facilities.' },
  { q: 'Can you show an off plan project before it is built?', a: 'Yes. We build interactive 3D models of compounds and homes from plans and renders, so buyers can explore the masterplan and walk through their unit before construction finishes.' },
  { q: 'How long does a capture take?', a: 'Most spaces up to 300 m² take 1 to 2 hours on site. Larger buildings are scheduled over one or more days.' },
  { q: 'How soon will my tour be ready?', a: 'Typically within 48 hours of the capture. Digital twins with exports and asset tagging take a few days longer.' },
  { q: 'Do visitors need to install anything?', a: 'No. Tours open in any modern browser on phones, tablets, computers and VR headsets.' },
  { q: 'Can you put the tour on my existing website?', a: 'Yes. We provide embed code that works with any website, or we can build a new site around it.' },
  { q: 'Where is the tour hosted?', a: 'We host it for you and handle the subscription. You can also take ownership of the hosting account.' },
]

export const team = [
  // TODO: real team members (photo optional: '/team/name.jpg')
  { name: 'Founder Name', role: 'Founder & CEO' },
  { name: 'Team Member', role: '3D Capture Lead' },
  { name: 'Team Member', role: 'Lead Web Developer' },
]
