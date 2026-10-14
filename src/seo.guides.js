// Guides and location pages (prerendered, linked from the site footer).
// Competitor descriptions are paraphrased from each company's own public website
// (October 2026) and attributed. Keep them factual and neutral; update when they change.
// Copy rule for this site: no dashes or hyphens in visible text.

export const GUIDES_UPDATED = '2026-10-14'

// Each section: { h2, p: [], list: [], table: { head: [], rows: [[]] } }
export const GUIDES = [
  {
    path: '/guides/virtual-tour-companies-egypt',
    title: 'Virtual Tour & Digital Twin Companies in Egypt (2026 Guide)',
    description:
      'Compare virtual tour, Matterport and digital twin companies in Egypt: 360thru, NAV3D, Megalodon360, THE FUTURE 3D, VR Masr, Vortex BD, 3D Geoscan, Cairoscope, VisEngine and Virtualizeer. What each offers and how to choose.',
    h1: 'Virtual tour and digital twin companies in Egypt: 2026 guide',
    lead: 'Choosing a partner for 360° virtual tours, Matterport style 3D tours, digital twins or interactive masterplans? Here is what the main providers in Egypt and the region offer, and the questions to ask before you hire one.',
    disclosure: 'Published by Virtualizeer, one of the companies listed. Details come from each company’s public website as of October 2026 and may change.',
    companies: [
      { name: 'Virtualizeer', based: 'Cairo', focus: '360° tours, digital twins, interactive 3D masterplans, real estate websites', about: 'Cairo based studio that combines 360° virtual tours, measurable digital twins, interactive 3D masterplans for off plan sales and real estate web development in one team, in English and Arabic.' },
      { name: '360thru', based: 'Cairo and Sharjah', focus: 'Matterport 3D tours, 360° photography, Google Street View', about: 'Describes itself as a virtual tour provider for real estate, hospitality, retail and construction across Egypt and the Gulf, focused on Matterport 3D tours, 360° photography, virtual staging, floor plans and Google Street View. Its website shows client logos including SODIC.' },
      { name: 'NAV3D', based: 'New Cairo', focus: '3D digital twins, VR and AR tours', about: 'Founded in 2018 according to its website, NAV3D creates 3D digital twins with dollhouse views, VR tours with voice guides and AR walkthroughs, with testimonials from hotel and real estate clients such as Emaar Misr and Fairmont Nile City.' },
      { name: 'Megalodon360', based: 'Cairo', focus: '360° virtual tours and VR for real estate', about: 'Cairo studio for 360° virtual tours and VR experiences in real estate, which presents itself as one of the first 360 tour specialists in Egypt.' },
      { name: 'THE FUTURE 3D', based: 'Cairo', focus: 'Laser scanning, drones, heritage, engineering digital twins', about: 'Reality capture firm offering laser scanning, drone capture, heritage documentation and digital twins connected to building systems, aimed mainly at engineering and facilities.' },
      { name: '3D Geoscan', based: 'Egypt', focus: 'Geospatial scanning, 3D modelling, facility management', about: 'Egyptian geospatial scanning and 3D modelling company that also lists digital twin and facility management solutions.' },
      { name: 'VR Masr', based: 'Cairo', focus: 'VR and 3D digital twin models', about: 'Small Cairo VR studio producing immersive 3D digital twin models and real estate visualisation.' },
      { name: 'Vortex BD', based: 'Giza', focus: 'Photoreal CGI, virtual tours, VR and AR', about: 'Giza based CGI studio producing photoreal visuals for real estate and brands, with virtual tour and VR/AR services.' },
      { name: 'Cairoscope', based: 'Not stated', focus: '360° virtual tours for real estate', about: 'Provider of 360° virtual tours for real estate listings.' },
      { name: 'VisEngine', based: 'Dubai, UAE', focus: 'Interactive 3D masterplans, architectural rendering', about: 'Dubai visualisation studio known for interactive 3D masterplans for UAE developers, with rendering work for developers in Egypt.' },
    ],
    sections: [
      {
        h2: 'How to choose a virtual tour company in Egypt',
        list: [
          'Match the product to the goal: a 360° tour for listings and hotels, a measurable digital twin for construction and facilities, an interactive masterplan for off plan sales.',
          'Ask for live examples in your segment, not just a showreel: apartments, villas, compounds, hotels or factories.',
          'Check turnaround time from shoot to live link, and how revisions work.',
          'Ask who owns the hosting account and what the yearly subscription costs after the first year.',
          'Confirm Google Street View publishing and website embedding are included.',
          'For digital twins, ask about measurement accuracy and export formats (point cloud, OBJ, E57, floor plans).',
          'For off plan projects, check whether the tool shows availability, prices and unit details, and whether it connects to your CRM or website.',
          'If your buyers search in Arabic, ask whether the experience and the website support Arabic.',
        ],
      },
    ],
    faqs: [
      ['What is the difference between a 360° tour and a Matterport tour?', 'A 360° tour links panoramic photos so visitors look around from fixed points. A Matterport style 3D tour also captures depth, which adds a dollhouse view, floor plans and measurements.'],
      ['Which companies build interactive masterplans for off plan projects in Egypt?', 'Interactive masterplans are less common than 360° tours. Regionally, Dubai based VisEngine is known for them. In Egypt, Virtualizeer builds interactive compound masterplans where buyers fly from the masterplan into a villa and walk every room.'],
      ['How long does a virtual tour shoot take?', 'Most apartments and villas take one to two hours on site. Hotels, malls and large buildings are usually scheduled over one or more days.'],
    ],
  },
  {
    path: '/guides/matterport-vs-360-vs-digital-twin',
    title: 'Matterport vs 360° Tour vs Digital Twin: Which Do You Need?',
    description:
      'The difference between 360° virtual tours, Matterport style 3D tours, digital twins and interactive 3D masterplans, with recommendations for apartments, villas, hotels, compounds, construction and factories in Egypt.',
    h1: 'Matterport vs 360° tour vs digital twin: which do you need?',
    lead: 'Four technologies get called “virtual tours”. They solve different problems and cost different amounts. Here is how to pick the right one for your property or project.',
    sections: [
      { h2: '360° virtual tour', p: ['Panoramic photos taken from several points and linked together. Visitors look around and jump between points. Fast to shoot, light to load and ideal for listings, hotels, restaurants and showrooms, published to your website and Google Maps.'] },
      { h2: 'Matterport style 3D tour', p: ['A depth sensing camera captures the space so visitors can walk through it smoothly, open a dollhouse view, read a floor plan and take rough measurements. The standard for premium residential listings, hotels and retail. Matterport is a trademark of Matterport, Inc.; similar results are possible with other 3D capture systems.'] },
      { h2: 'Digital twin', p: ['A measurable 3D model of a building, site or factory used for work, not only marketing: precise measurements, asset tagging, construction progress tracking, facility management and exports for architects and engineers (point cloud, OBJ, E57). Factories can link live machine data to the model.'] },
      { h2: 'Interactive 3D masterplan', p: ['Built from plans and renders before anything exists. Buyers explore the whole compound from above, see which units are available, then fly into a unit and walk through every room. Built for off plan sales.'] },
      {
        h2: 'Side by side',
        table: {
          head: ['', '360° tour', '3D tour', 'Digital twin', '3D masterplan'],
          rows: [
            ['Needs a built space', 'Yes', 'Yes', 'Yes', 'No'],
            ['Dollhouse and floor plan', 'Floor plan optional', 'Yes', 'Yes', 'Yes'],
            ['Measurements', 'No', 'Approximate', 'Precise', 'From plans'],
            ['Best for', 'Listings, hotels, venues', 'Premium homes, hotels, retail', 'Construction, facilities, factories', 'Off plan compounds and towers'],
          ],
        },
      },
      {
        h2: 'Which one for your project?',
        list: [
          'Apartment or villa for rent or resale: 360° tour, or a 3D tour for premium listings.',
          'Hotel, resort or venue: 360° or 3D tour published to Google Maps and your booking site.',
          'Compound or tower that is not built yet: interactive 3D masterplan with unit walkthroughs.',
          'Construction site: digital twin captured at each stage to track progress.',
          'Factory or large facility: digital twin, optionally connected to live machine data.',
        ],
      },
    ],
    faqs: [
      ['Is a Matterport tour the same as a digital twin?', 'A Matterport style tour is a kind of digital twin focused on presentation. A full digital twin adds precise measurement, asset data and links to building or machine systems for operations.'],
      ['Can I have both a tour and a digital twin?', 'Yes. Both can be captured in the same site visit, so one shoot serves marketing and operations.'],
    ],
  },
  {
    path: '/guides/interactive-3d-masterplan-off-plan',
    title: 'Interactive 3D Masterplans for Off Plan Sales in Egypt',
    description:
      'How interactive 3D masterplans help developers in Egypt sell off plan: explore the compound from above, check unit availability, fly into a villa and walk every room before it is built.',
    h1: 'Interactive 3D masterplans for off plan sales in Egypt',
    lead: 'Off plan sales depend on imagination. An interactive 3D masterplan lets buyers see the compound, choose a unit and walk through it before construction finishes, on a phone, in the sales center or on your website.',
    sections: [
      { h2: 'What buyers can do', list: ['Orbit the whole masterplan: roads, landscaping, clubhouse and amenities.', 'See unit availability at a glance (available, reserved, sold).', 'Click a unit and fly down to its front door in one continuous camera move.', 'Walk through every room with hotspots, and see specs and starting prices.', 'Book a viewing or send an inquiry from inside the experience.'] },
      { h2: 'Why developers use it', list: ['Sell phases before they are built, with fewer site visits.', 'Give brokers one link that shows the whole project.', 'Show amenities and views that renders alone cannot.', 'Update availability as units sell.'] },
      { h2: 'What we need from you', list: ['Masterplan and unit plans (CAD or PDF).', 'Elevations, finishes and renders if available.', 'Unit list with types, areas and availability.', 'Branding and the call to action you want buyers to take.'] },
      { h2: 'See it working', p: ['Try the residential compound and Zayed Reimagined demos on our Digital Twins page, and explore New Zayed in the New Zayed Atlas.'] },
    ],
    faqs: [
      ['Does it work on phones?', 'Yes. It runs in the browser on phones, tablets and computers, with no app to install.'],
      ['Can it connect to our CRM or website?', 'Yes. It can be embedded on your website, and availability and inquiries can connect to your CRM.'],
    ],
    links: [['/digital-twins', 'Try the interactive demos'], ['/new-zayed-atlas', 'Open the New Zayed Atlas']],
  },
]

// Location pages: unique local context + shared service summary
export const LOCATIONS = [
  {
    path: '/locations/new-cairo',
    area: 'New Cairo',
    title: 'Virtual Tours & Digital Twins in New Cairo (Fifth Settlement)',
    description: '360° virtual tours, 3D digital twins and real estate websites for villas, apartments, compounds, offices and showrooms in New Cairo and the Fifth Settlement.',
    local: 'New Cairo and the Fifth Settlement mix gated villa and apartment compounds with offices, clinics, schools and retail along the 90th Street corridor. Buyers often shortlist several compounds at once, so a tour that opens on any phone saves everyone a drive.',
    fits: ['Villa and apartment resale listings', 'Compound sales centers and model units', 'Offices and coworking spaces', 'Showrooms and restaurants', 'Schools and clinics'],
  },
  {
    path: '/locations/sheikh-zayed',
    area: 'Sheikh Zayed',
    title: 'Virtual Tours & Digital Twins in Sheikh Zayed',
    description: '360° virtual tours, 3D digital twins and real estate websites for villas, compounds, malls and hotels in Sheikh Zayed City along the Cairo Alex Desert Road.',
    local: 'Sheikh Zayed City is one of west Cairo’s most established villa districts, with mature compounds, malls and hospitality close to the Cairo Alex Desert Road. Many buyers and tenants live abroad, which makes remote viewing especially valuable.',
    fits: ['Standalone villas and townhouses', 'Compound resale and rentals', 'Malls, retail and restaurants', 'Hotels and serviced apartments', 'Clinics and schools'],
  },
  {
    path: '/locations/new-zayed',
    area: 'New Zayed',
    title: 'Off Plan 3D Tours & Masterplans in New Zayed',
    description: 'Interactive 3D masterplans, off plan walkthroughs and virtual tours for compounds in New Zayed, opposite Sphinx International Airport. Explore the New Zayed Atlas.',
    local: 'New Zayed is the western expansion of Sheikh Zayed City, south of the Cairo Alex Desert Road and opposite Sphinx International Airport. Most projects are selling off plan, so buyers rely on visuals to choose a unit.',
    fits: ['Interactive compound masterplans', 'Off plan unit walkthroughs', 'Sales center and model unit tours', 'Project websites with availability', 'Construction progress digital twins'],
    links: [['/new-zayed-atlas', 'Open the New Zayed Atlas']],
  },
  {
    path: '/locations/6th-of-october',
    area: '6th of October',
    title: 'Virtual Tours & Digital Twins in 6th of October City',
    description: '360° virtual tours and 3D digital twins for homes, compounds, factories, universities and malls in 6th of October City.',
    local: '6th of October City combines residential compounds, large universities, malls such as Mall of Arabia and one of Egypt’s biggest industrial zones, so it needs both marketing tours and operational digital twins.',
    fits: ['Residential compounds and apartments', 'Factories and warehouses', 'Universities and schools', 'Malls and retail', 'Hotels and event venues'],
  },
  {
    path: '/locations/new-capital',
    area: 'New Administrative Capital',
    title: 'Off Plan 3D Tours & Digital Twins in the New Administrative Capital',
    description: 'Interactive 3D masterplans, off plan tower and compound walkthroughs, and construction progress digital twins for projects in the New Administrative Capital.',
    local: 'The New Administrative Capital is dominated by off plan towers, business district offices and residential compounds still under construction, so developers need to sell what buyers cannot yet visit and track progress remotely.',
    fits: ['Off plan towers and commercial units', 'Interactive residential masterplans', 'Construction progress digital twins', 'Office and retail leasing tours', 'Project websites'],
  },
]

// Arabic version of the companies guide (unlinked from the English site; reachable from Arabic pages)
export const AR_GUIDE = {
  path: '/ar/guides/virtual-tour-companies-egypt',
  en: '/guides/virtual-tour-companies-egypt',
  title: 'أفضل شركات الجولات الافتراضية والتوأم الرقمي في مصر: دليل 2026',
  description:
    'قارن بين شركات الجولات الافتراضية وماتربورت والتوأم الرقمي في مصر: 360thru وNAV3D وMegalodon360 وTHE FUTURE 3D وVR Masr وVortex BD و3D Geoscan وCairoscope وVisEngine وVirtualizeer. ماذا تقدم كل شركة وكيف تختار.',
  h1: 'شركات الجولات الافتراضية والتوأم الرقمي في مصر: دليل 2026',
  lead: 'تبحث عن شركة لتصوير جولة افتراضية 360 درجة أو جولة ثلاثية الأبعاد بأسلوب ماتربورت أو توأم رقمي أو ماستر بلان تفاعلي؟ إليك ما تقدمه أبرز الشركات في مصر والمنطقة، والأسئلة التي يجب أن تطرحها قبل التعاقد.',
  disclosure: 'ينشر هذا الدليل Virtualizeer، وهي إحدى الشركات المذكورة. المعلومات مأخوذة من المواقع الرسمية لكل شركة حتى أكتوبر 2026 وقد تتغير.',
  companies: [
    ['Virtualizeer', 'القاهرة', 'استوديو في القاهرة يجمع الجولات الافتراضية 360 درجة والتوائم الرقمية القابلة للقياس والماستر بلان التفاعلي للبيع على الخريطة وتصميم المواقع العقارية في فريق واحد، بالعربية والإنجليزية.'],
    ['360thru', 'القاهرة والشارقة', 'تقدم نفسها كمزود للجولات الافتراضية للعقارات والفنادق والتجزئة والإنشاءات في مصر والخليج، مع تركيز على جولات ماتربورت والتصوير 360 درجة والتأثيث الافتراضي ومخططات الأدوار وخرائط جوجل.'],
    ['NAV3D', 'القاهرة الجديدة', 'تأسست عام 2018 وفقًا لموقعها، وتصمم توائم رقمية ثلاثية الأبعاد وجولات واقع افتراضي بمرشد صوتي وتجارب واقع معزز، مع شهادات من عملاء في الفنادق والعقارات.'],
    ['Megalodon360', 'القاهرة', 'استوديو للجولات الافتراضية 360 درجة والواقع الافتراضي في قطاع العقارات، ويقدم نفسه كأحد أوائل المتخصصين في الجولات 360 في مصر.'],
    ['THE FUTURE 3D', 'القاهرة', 'شركة مسح ثلاثي الأبعاد بالليزر والطائرات المسيرة وتوثيق التراث وتوائم رقمية مرتبطة بأنظمة المباني، موجهة أساسًا للهندسة وإدارة المرافق.'],
    ['3D Geoscan', 'مصر', 'شركة مصرية للمسح الجيومكاني والنمذجة ثلاثية الأبعاد، وتقدم أيضًا حلول التوأم الرقمي وإدارة المرافق.'],
    ['VR Masr', 'القاهرة', 'استوديو واقع افتراضي صغير في القاهرة ينتج نماذج توأم رقمي ثلاثية الأبعاد ومحتوى بصري للعقارات.'],
    ['Vortex BD', 'الجيزة', 'استوديو صور ثلاثية الأبعاد واقعية للعقارات والعلامات التجارية، مع خدمات الجولات الافتراضية والواقع الافتراضي والمعزز.'],
    ['Cairoscope', 'غير معلن', 'مزود جولات افتراضية 360 درجة لإعلانات العقارات.'],
    ['VisEngine', 'دبي، الإمارات', 'استوديو في دبي معروف بالماستر بلان التفاعلي ثلاثي الأبعاد لمطوري الإمارات، مع أعمال تصميم بصري لمطورين في مصر.'],
  ],
  checklist: [
    'اختر المنتج المناسب لهدفك: جولة 360 للإعلانات والفنادق، توأم رقمي للإنشاءات والمرافق، ماستر بلان تفاعلي للبيع على الخريطة.',
    'اطلب أمثلة حقيقية في نفس نوع مشروعك: شقق أو فيلات أو كمبوندات أو فنادق أو مصانع.',
    'اسأل عن مدة التسليم من التصوير حتى الرابط النهائي.',
    'اسأل عن ملكية حساب الاستضافة وتكلفة الاشتراك السنوي بعد السنة الأولى.',
    'تأكد من النشر على خرائط جوجل وإمكانية تضمين الجولة في موقعك.',
    'إذا كان عملاؤك يبحثون بالعربية، تأكد من دعم التجربة والموقع للغة العربية.',
  ],
}
