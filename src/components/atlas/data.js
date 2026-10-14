// New Zayed Atlas, dataset.
// Facts gathered from public listings in October 2026 (see SOURCES). Listing sites disagree
// in places and prices change often, so every figure carries its source and should be
// verified with the developer. Map positions inside New Zayed are INDICATIVE, not surveyed.

export const UPDATED = 'October 2026'

export const SOURCES = {
  nawy: { label: 'Nawy, New Zayed area page', url: 'https://www.nawy.com/area/new-zayed' },
  masharf: { label: 'Masharf, New Zayed projects & prices', url: 'https://masharf.com/en/new-zayed' },
  moh: { label: 'Ministry of Housing, Sheikh Zayed expansions (New Zayed)', url: 'https://blogs.realestate.gov.eg/news/housing-minister-follows-up-on-infrastructure-projects-in-sheikh-zayed-expansions-new-zayed/' },
  investgate: { label: 'Invest Gate, Ons New Zayed launch', url: 'https://invest-gate.me/news/mabany-edris-launches-ons-new-zayed-with-egp-13-5-bn-investment-across-84-feddans/' },
  shary: { label: 'Shary, Vert New Zayed', url: 'https://shary.com.eg/en/projects/vert-new-zayed/' },
  capsule: { label: 'Real Estate Capsule, Wanas', url: 'https://realestate-capsule.com/en/el-sheikh-zayed/wanas-compound/' },
}

// About the district (Ministry of Housing): ~35 million m², south of the Cairo Alex Desert Road,
// opposite Sphinx International Airport.
export const REGION = {
  name: 'New Zayed',
  areaM2: 35_000_000,
  summary: 'Western expansion of Sheikh Zayed City, south of the Cairo Alex Desert Road and opposite Sphinx International Airport.',
  source: 'moh',
}

// category drives the 3D massing and the filter: villas | apartments | mixed | unspecified
// pos is in the shared schematic map space (1000 × 560) used by the Project 03 map.
export const COMPOUNDS = [
  { id: 'bellevie', name: 'Belle Vie', developer: 'Emaar Misr', acres: 500, units: ['Apartments', 'Standalone villas', 'Townhouses', 'Clinics', 'Offices'], category: 'mixed', fromPrice: null, delivery: null, pos: [392, 246], sources: ['nawy'] },
  { id: 'solana', name: 'Solana West', developer: 'Ora Developers', acres: 316, units: ['Apartments', 'Duplexes', 'Penthouses', 'Lofts', 'Standalone villas', 'Twin houses', 'Townhouses'], category: 'mixed', fromPrice: 15_800_000, delivery: '2030', pos: [252, 216], sources: ['nawy', 'masharf'] },
  { id: 'elora', name: 'Elora', developer: 'Arabia Holding', acres: 227, units: ['Villas', 'Twin houses', 'Townhouses'], category: 'villas', fromPrice: 15_298_000, delivery: null, pos: [248, 248], sources: ['nawy', 'masharf'] },
  { id: 'rivers', name: 'Rivers', developer: 'Tatweer Misr', acres: 100, units: ['Apartments', 'Duplexes', 'Penthouses', 'Standalone villas', 'Townhouses', 'Twin villas'], category: 'mixed', fromPrice: null, delivery: null, pos: [278, 244], sources: ['nawy'] },
  { id: 'ons', name: 'Ons New Zayed', developer: 'Mabany Edris', acres: 87, units: ['Residential (84 feddans; EGP 13.5 bn investment)'], category: 'unspecified', fromPrice: null, delivery: null, pos: [362, 276], sources: ['investgate'] },
  { id: 'lugar', name: 'Lugar', developer: 'Gates Development', acres: 65, units: ['Studios', 'Apartments', 'Duplexes', 'Townhouses', 'Villas'], category: 'mixed', fromPrice: 5_640_410, delivery: null, pos: [302, 252], sources: ['nawy', 'masharf'] },
  { id: 'vert', name: 'Vert', developer: 'Palmier Developments', acres: 30, units: ['3 to 4 bedroom homes'], category: 'unspecified', fromPrice: 19_703_000, delivery: '2029', pos: [326, 252], sources: ['masharf', 'shary'] },
  { id: 'jirian', name: 'Jirian', developer: 'Nations of Sky, phases by Palm Hills & Mountain View', acres: null, units: ['Duplexes', 'Townhouses', 'Villas', '1 to 6 bedrooms'], category: 'mixed', fromPrice: 7_874_000, delivery: '2029 (Palm Hills phases)', pos: [284, 220], sources: ['nawy', 'masharf'] },
  { id: 'karmell', name: 'Karmell', developer: 'SODIC', acres: null, units: ['Villas', 'Apartments'], category: 'mixed', fromPrice: null, delivery: null, pos: [348, 226], sources: ['nawy'] },
  { id: 'vye', name: 'VYE', developer: 'SODIC', acres: null, units: ['Not stated'], category: 'unspecified', fromPrice: null, delivery: null, pos: [268, 280], sources: ['nawy'] },
  { id: 'qhills', name: 'Q Hills', developer: 'Q Developments', acres: null, units: ['1 to 5 bedrooms'], category: 'unspecified', fromPrice: 5_360_000, delivery: null, pos: [242, 272], sources: ['nawy', 'masharf'] },
  { id: 'keyofgreens', name: 'Key of Greens', developer: 'TBK Developments', acres: null, units: ['3 bedrooms'], category: 'unspecified', fromPrice: 9_944_125, delivery: null, pos: [294, 272], sources: ['nawy', 'masharf'] },
  { id: 'zayard', name: 'Zayard (North Strike, Elite, Villa, Memora)', developer: 'Palmier Developments', acres: null, units: ['3 to 4 bedrooms', 'Villas (Zayard Villa)'], category: 'villas', fromPrice: 10_586_000, delivery: null, pos: [352, 252], sources: ['nawy', 'masharf'] },
  { id: 'westview', name: 'Westview Residence', developer: 'HDP (Housing & Development Properties)', acres: null, units: ['2 to 3 bedrooms'], category: 'unspecified', fromPrice: 6_003_984, delivery: null, pos: [320, 274], sources: ['nawy', 'masharf'] },
  { id: 'vaha', name: 'Vaha', developer: 'AlKarma Developments', acres: null, units: ['3 to 5 bedrooms'], category: 'unspecified', fromPrice: 21_981_000, delivery: null, pos: [342, 270], sources: ['nawy', 'masharf'] },
  { id: 'marville', name: 'Mar Ville', developer: 'Al Marasem Development', acres: null, units: ['Studios', 'Apartments'], category: 'apartments', fromPrice: 8_800_000, delivery: '2030', pos: [372, 262], sources: ['nawy', 'masharf'] },
  { id: 'hillsofone', name: 'Hills of One', developer: 'People & Places', acres: null, units: ['Villas', 'Townhouses', 'Duplexes', 'Lofts', 'Studios', 'Apartments'], category: 'mixed', fromPrice: 9_871_000, delivery: '2028 to 2030 (by phase)', pos: [248, 292], sources: ['nawy', 'masharf'] },
  { id: 'tpearl', name: 'T Pearl', developer: 'Torec Developments', acres: null, units: ['3 to 6 bedrooms'], category: 'unspecified', fromPrice: 17_084_952, delivery: null, pos: [274, 296], sources: ['nawy', 'masharf'] },
  { id: 'dejoya', name: 'Dejoya (Residence, Primero Villas, Plaza)', developer: 'Taj Misr Developments', acres: null, units: ['Apartments', 'Villas'], category: 'mixed', fromPrice: 8_118_000, delivery: null, pos: [298, 292], sources: ['nawy', 'masharf'] },
  { id: 'parkvalley', name: 'Park Valley', developer: 'Efid Development', acres: null, units: ['4 bedrooms'], category: 'unspecified', fromPrice: 8_000_000, delivery: null, pos: [322, 292], sources: ['masharf'] },
  { id: 'midtown', name: 'Midtown New Zayed West', developer: 'Better Home', acres: null, units: ['Twin houses', 'Townhouses'], category: 'villas', fromPrice: 23_656_869, delivery: '2030', pos: [342, 290], sources: ['masharf'] },
  { id: 'naia', name: 'Naia West', developer: 'Naia Developments', acres: null, units: ['2 to 5 bedrooms'], category: 'unspecified', fromPrice: 10_126_000, delivery: null, pos: [370, 236], sources: ['masharf'] },
  { id: 'wanas', name: 'Wanas', developer: 'Concrete Group', acres: null, units: ['Townhouses', 'Twin houses'], category: 'villas', fromPrice: null, delivery: null, pos: [244, 232], sources: ['capsule'] },
  { id: 'zayed-reimagined', name: 'Zayed Reimagined', developer: 'Virtualizeer concept', acres: null, units: ['10 L shaped courtyard villas'], category: 'villas', fromPrice: null, delivery: null, pos: [318, 232], sources: [], concept: true, link: '/digital-twins#usecase-zayed' },
]

// Highlighted districts (schematic polygons in map space)
export const DISTRICTS = [
  { id: 'newzayed', name: 'New Zayed', poly: [[228, 196], [372, 214], [418, 244], [400, 262], [348, 300], [232, 302]], kind: 'focus' },
  { id: 'oldzayed', name: 'Sheikh Zayed City', poly: [[426, 252], [600, 270], [700, 360], [600, 420], [474, 380]], kind: 'city', density: 900 },
  { id: 'october', name: '6th of October', poly: [[250, 440], [470, 432], [500, 548], [240, 556]], kind: 'city', density: 650 },
  { id: 'newgiza', name: 'New Giza', poly: [[662, 392], [780, 384], [798, 462], [680, 470]], kind: 'villas', density: 160 },
  { id: 'newsphinx', name: 'New Sphinx City', poly: [[14, 86], [200, 96], [206, 226], [22, 232]], kind: 'future', density: 60 },
]

// Landmarks with a 3D model each
export const LANDMARK_MODELS = [
  { id: 'airport', name: 'Sphinx International Airport', pos: [350, 132], kind: 'airport' },
  { id: 'smartvillage', name: 'Smart Village', pos: [640, 236], kind: 'campus' },
  { id: 'mallofarabia', name: 'Mall of Arabia', pos: [520, 470], kind: 'mall' },
  { id: 'gem', name: 'Grand Egyptian Museum', pos: [862, 492], kind: 'museum' },
  { id: 'pyramids', name: 'Giza Pyramids', pos: [846, 536], kind: 'pyramids' },
]

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'villas', label: 'Villas & townhouses' },
  { id: 'mixed', label: 'Mixed use' },
  { id: 'apartments', label: 'Apartments' },
  { id: 'unspecified', label: 'Type not listed' },
]

export const formatEGP = (n) => (n == null ? 'Not listed' : `EGP ${(n / 1e6).toFixed(n >= 1e7 ? 1 : 2)}M`)
