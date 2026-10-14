
// video loading
function Play() {
  var video = document.getElementById("video");
  var mp4 = document.getElementById('mp4')
  mp4.src = "../../assets/images/Y2mate.Is - This Is Egypt-Mfxqy5a Ths-720P-1692625573 (Online-Video-Cutter.Com) (1)-1.m4v";
  var butt = document.getElementById('myButton')
  butt.style.display = "none";
  video.controls = true;
  video.load();
  video.play();
}

function PlayIGV() {
  var video = document.getElementById("video");
  var mp4 = document.getElementById('mp4')
  mp4.src = "../../assets/images/iGV/eps/y2mate.is - 6 weeks in Egypt - AIESEC Global Volunteering-yPwBx-FHmAM-720p-1694208637.mp4";
  var butt = document.getElementById('myButton')
  butt.style.display = "none";
  video.controls = true;
  video.load();
  video.play();
}

function PlayIGTa() {
  var video = document.getElementById("video");
  var mp4 = document.getElementById('mp4')
  mp4.src = "../../assets/images/iGTa/y2mate.is - Egypt Promotional Ad - AIESEC Egypt-Abrj6KXVrus-720p-1695126469.mp4";
  var butt = document.getElementById('myButton')
  butt.style.display = "none";
  video.controls = true;
  video.load();
  video.play();
}

function PlayIGTe() {
  var video = document.getElementById("video");
  var mp4 = document.getElementById('mp4')
  mp4.src = "../../assets/images/iGTe/y2mate.is - AIESEC Egypt GT teaching-s8UBQh5yeB0-720p-1695126625.mp4";
  var butt = document.getElementById('myButton')
  butt.style.display = "none";
  video.controls = true;
  video.load();
  video.play();
}

// faq
const details = document.querySelectorAll("details");
details.forEach((targetDetail) => {
  targetDetail.addEventListener("click", () => {
    details.forEach((detail) => {
      if (detail !== targetDetail) {
        detail.removeAttribute("open");
      }
    });
  });
});




let cards = document.querySelectorAll('.card-btn');

[...cards].forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelector(`.vid${card.dataset.id}`).classList.remove('hide-video');
  });
});

let blockers = document.querySelectorAll('.blocker');
[...blockers].forEach((blocker) => {
  blocker.addEventListener('click', () => {
    document.querySelector(`.vid${blocker.dataset.id}`).classList.add('hide-video');
    let video = document.querySelector(`.video${blocker.dataset.id}`);
    video.currentTime = 0;
    video.pause();
  })
});


function playCard(vid_id) {
  let video = document.querySelector(`.video${vid_id}`);
  let mp4 = document.getElementById(`mp4_${vid_id}`)
  let butt = document.getElementById(`myButton${vid_id}`);
  mp4.src = `../../assets/images/whyEgyptHero/videos/${butt.dataset.dist}.m4v`;
  butt.style.display = "none";
  video.controls = true;
  video.load();
  video.play();
}


window.onload = function(){
  //hide the preloader
  document.querySelector(".pre-loader").style.display = "none";
}


let mobNav = document.querySelector('#dropdown-head-mob');
let mobNav_menu = document.getElementById('mob-dropdown');
let cover = document.querySelector('.list-cover');
mobNav.addEventListener('click', () => {
  if(cover.style.transform == "translateY(1px)")cover.style.transform = "translateY(110px)"
  else cover.style.transform = "translateY(1px)"
  
})

let hamburger = document.querySelector('.hamburger');
let mob = document.querySelector('.mobile-nav')
hamburger.addEventListener('click', () => {
  if(mob.style.display == "none"){
    mob.style.display = "block"; 
    setTimeout(() => {document.querySelector('.nav-content').style.transform= "translateX(100%)";}, 100)
  }
  else {
    setTimeout(() => {document.querySelector('.nav-content').style.transform= "translateX(-100%)";}, 100)
    mob.style.display = "none";
  }
})
document.querySelector('.nav-blocker').addEventListener('click', () => {
  setTimeout(() => {document.querySelector('.nav-content').style.transform= "translateX(-100%)";}, 100)
  mob.style.display = "none"
})

// EP Journey functionality
const EXPA_GRAPHQL_ENDPOINT = 'https://gis-api.aiesec.org/graphql';
const EXPA_ACCESS_TOKEN = 'CbgJ-09wlOkGcmdlRQ6CpPJTatd6TUbT_NsKDhv9Ehg';

// Skyscanner Referrals deeplink — apply for mediaPartnerId: https://www.partners.skyscanner.net/product/travel-api
const SKYSCANNER_CONFIG = {
  mediaPartnerId: '',
  market: 'EG',
  locale: 'en-GB',
  currency: 'EGP',
  defaultDestination: 'cai',
  referralsBase: 'https://www.skyscanner.net/g/referrals/v1/flights/day-view/',
  transportBase: 'https://www.skyscanner.net/transport/flights/'
};

const SKYSCANNER_ORIGIN_MAP = {
  Turkey: { code: 'ist', label: 'Istanbul (IST)' },
  Brazil: { code: 'sao', label: 'São Paulo (SAO)' },
  Germany: { code: 'ber', label: 'Berlin (BER)' },
  France: { code: 'par', label: 'Paris (PAR)' },
  Italy: { code: 'rom', label: 'Rome (ROM)' },
  Spain: { code: 'mad', label: 'Madrid (MAD)' },
  Portugal: { code: 'lis', label: 'Lisbon (LIS)' },
  Netherlands: { code: 'ams', label: 'Amsterdam (AMS)' },
  Belgium: { code: 'bru', label: 'Brussels (BRU)' },
  Poland: { code: 'waw', label: 'Warsaw (WAW)' },
  Romania: { code: 'otp', label: 'Bucharest (OTP)' },
  Greece: { code: 'ath', label: 'Athens (ATH)' },
  India: { code: 'del', label: 'Delhi (DEL)' },
  Pakistan: { code: 'isb', label: 'Islamabad (ISB)' },
  Bangladesh: { code: 'dac', label: 'Dhaka (DAC)' },
  Indonesia: { code: 'jkt', label: 'Jakarta (JKT)' },
  Vietnam: { code: 'sgn', label: 'Ho Chi Minh City (SGN)' },
  Thailand: { code: 'bkk', label: 'Bangkok (BKK)' },
  Philippines: { code: 'mnl', label: 'Manila (MNL)' },
  Malaysia: { code: 'kul', label: 'Kuala Lumpur (KUL)' },
  China: { code: 'bjs', label: 'Beijing (BJS)' },
  Japan: { code: 'tyo', label: 'Tokyo (TYO)' },
  'South Korea': { code: 'sel', label: 'Seoul (SEL)' },
  Mexico: { code: 'mex', label: 'Mexico City (MEX)' },
  Colombia: { code: 'bog', label: 'Bogotá (BOG)' },
  Argentina: { code: 'bue', label: 'Buenos Aires (BUE)' },
  Chile: { code: 'scl', label: 'Santiago (SCL)' },
  Peru: { code: 'lim', label: 'Lima (LIM)' },
  Ecuador: { code: 'uio', label: 'Quito (UIO)' },
  Canada: { code: 'yto', label: 'Toronto (YTO)' },
  'United States': { code: 'nyc', label: 'New York (NYC)' },
  USA: { code: 'nyc', label: 'New York (NYC)' },
  'United Kingdom': { code: 'lon', label: 'London (LON)' },
  UK: { code: 'lon', label: 'London (LON)' },
  Australia: { code: 'syd', label: 'Sydney (SYD)' },
  'South Africa': { code: 'jnb', label: 'Johannesburg (JNB)' },
  Nigeria: { code: 'los', label: 'Lagos (LOS)' },
  Kenya: { code: 'nbo', label: 'Nairobi (NBO)' },
  Morocco: { code: 'cas', label: 'Casablanca (CAS)' },
  Tunisia: { code: 'tun', label: 'Tunis (TUN)' },
  Algeria: { code: 'alg', label: 'Algiers (ALG)' },
  Russia: { code: 'mow', label: 'Moscow (MOW)' },
  Ukraine: { code: 'iev', label: 'Kyiv (IEV)' },
  'Czech Republic': { code: 'prg', label: 'Prague (PRG)' },
  Hungary: { code: 'bud', label: 'Budapest (BUD)' },
  Austria: { code: 'vie', label: 'Vienna (VIE)' },
  Switzerland: { code: 'zrh', label: 'Zurich (ZRH)' },
  Sweden: { code: 'sto', label: 'Stockholm (STO)' },
  Norway: { code: 'osl', label: 'Oslo (OSL)' },
  Denmark: { code: 'cph', label: 'Copenhagen (CPH)' },
  Finland: { code: 'hel', label: 'Helsinki (HEL)' },
  Ireland: { code: 'dub', label: 'Dublin (DUB)' },
  Egypt: { code: 'cai', label: 'Cairo (CAI)' }
};

const SKYSCANNER_EGYPT_DESTINATIONS = {
  cai: 'Cairo (CAI)',
  aly: 'Alexandria (ALY)',
  hrg: 'Hurghada (HRG)',
  lxr: 'Luxor (LXR)',
  ssh: 'Sharm El Sheikh (SSH)',
  asw: 'Aswan (ASW)'
};

function normalizePlaceName(name) {
  return (name || '').trim().toLowerCase();
}

function getSkyscannerOriginFromHomeMc(homeMcName) {
  if (!homeMcName) return null;
  if (SKYSCANNER_ORIGIN_MAP[homeMcName]) {
    return SKYSCANNER_ORIGIN_MAP[homeMcName];
  }
  const normalized = normalizePlaceName(homeMcName);
  for (const [key, value] of Object.entries(SKYSCANNER_ORIGIN_MAP)) {
    if (normalizePlaceName(key) === normalized) return value;
    if (normalized.includes(normalizePlaceName(key)) || normalizePlaceName(key).includes(normalized)) {
      return value;
    }
  }
  return null;
}

function getEgyptDestinationCode(hostLc, location) {
  const text = normalizePlaceName([hostLc, location].filter(Boolean).join(' '));
  if (text.includes('alexandria') || text.includes('alex')) return 'aly';
  if (text.includes('hurghada')) return 'hrg';
  if (text.includes('luxor')) return 'lxr';
  if (text.includes('sharm')) return 'ssh';
  if (text.includes('aswan')) return 'asw';
  if (text.includes('cairo') || text.includes('giza')) return 'cai';
  return SKYSCANNER_CONFIG.defaultDestination;
}

function formatDateForSkyscanner(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateForTransportPath(dateValue) {
  const iso = formatDateForSkyscanner(dateValue);
  if (!iso) return '';
  return iso.replace(/-/g, '').slice(2);
}

function sanitizeSkyscannerPlaceCode(code) {
  return (code || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildSkyscannerFlightsUrl({ origin, destination, outboundDate, inboundDate }) {
  const originCode = sanitizeSkyscannerPlaceCode(origin);
  const destCode = sanitizeSkyscannerPlaceCode(destination || SKYSCANNER_CONFIG.defaultDestination);
  const outbound = formatDateForSkyscanner(outboundDate);
  const inbound = formatDateForSkyscanner(inboundDate);

  if (!originCode || !outbound) return null;

  if (SKYSCANNER_CONFIG.mediaPartnerId) {
    const params = new URLSearchParams({
      origin: originCode,
      destination: destCode,
      outboundDate: outbound,
      market: SKYSCANNER_CONFIG.market,
      locale: SKYSCANNER_CONFIG.locale,
      currency: SKYSCANNER_CONFIG.currency,
      mediaPartnerId: SKYSCANNER_CONFIG.mediaPartnerId
    });
    if (inbound) params.set('inboundDate', inbound);
    return `${SKYSCANNER_CONFIG.referralsBase}?${params.toString()}`;
  }

  const outPath = formatDateForTransportPath(outboundDate);
  const inPath = inbound ? formatDateForTransportPath(inboundDate) : '';
  let path = `${SKYSCANNER_CONFIG.transportBase}${originCode}/${destCode}/${outPath}/`;
  if (inPath) path += `${inPath}/`;
  return path;
}

function showFlightSearchError(message) {
  const el = document.getElementById('flightSearchError');
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.style.display = 'block';
  } else {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function getFlightSearchFormValues() {
  const originInput = document.getElementById('flightOrigin');
  const destSelect = document.getElementById('flightDestination');
  const outboundInput = document.getElementById('flightOutboundDate');
  const returnInput = document.getElementById('flightReturnDate');

  const originCode =
    originInput?.dataset?.skyscannerCode ||
    sanitizeSkyscannerPlaceCode(originInput?.value);
  const destination = destSelect?.value || SKYSCANNER_CONFIG.defaultDestination;
  const outboundDate = outboundInput?.value;
  const inboundDate = returnInput?.value || '';

  return { originCode, destination, outboundDate, inboundDate };
}

function handleFlightSearchClick() {
  const { originCode, destination, outboundDate, inboundDate } = getFlightSearchFormValues();

  if (!originCode) {
    showFlightSearchError('Please enter or select a departure city/airport code (e.g. ist, lon, par).');
    return;
  }
  if (!outboundDate) {
    showFlightSearchError('Please choose a departure date.');
    return;
  }
  if (inboundDate && inboundDate < outboundDate) {
    showFlightSearchError('Return date must be on or after the departure date.');
    return;
  }

  const url = buildSkyscannerFlightsUrl({
    origin: originCode,
    destination,
    outboundDate,
    inboundDate: inboundDate || null
  });

  if (!url) {
    showFlightSearchError('Could not build flight search URL. Check your inputs.');
    return;
  }

  showFlightSearchError('');
  window.open(url, '_blank', 'noopener,noreferrer');
}

function initFlightSearch(profile) {
  const section = document.getElementById('flight-search-section');
  if (!section) return;

  const originInput = document.getElementById('flightOrigin');
  const destSelect = document.getElementById('flightDestination');
  const outboundInput = document.getElementById('flightOutboundDate');
  const returnInput = document.getElementById('flightReturnDate');
  const searchBtn = document.getElementById('flightSearchBtn');

  if (!originInput || !destSelect || !outboundInput || !searchBtn) return;

  const originMatch = getSkyscannerOriginFromHomeMc(profile.homeMc);
  if (originMatch) {
    originInput.value = originMatch.label;
    originInput.dataset.skyscannerCode = originMatch.code;
  } else if (profile.homeMc) {
    originInput.value = profile.homeMc;
    originInput.removeAttribute('data-skyscanner-code');
  }

  const destCode = getEgyptDestinationCode(profile.hostLc, profile.location);
  destSelect.value = destCode;

  const outbound = formatDateForSkyscanner(profile.outboundDate);
  const inbound = formatDateForSkyscanner(profile.inboundDate);
  if (outbound) outboundInput.value = outbound;
  if (inbound) returnInput.value = inbound;

  if (!searchBtn.dataset.bound) {
    searchBtn.addEventListener('click', handleFlightSearchClick);
    searchBtn.dataset.bound = 'true';
  }

  if (!originInput.dataset.bound) {
    originInput.addEventListener('input', function () {
      const options = document.querySelectorAll('#flightOriginOptions option');
      let matchedCode = '';
      options.forEach(function (opt) {
        if (opt.value === originInput.value && opt.dataset.code) {
          matchedCode = opt.dataset.code;
        }
      });
      if (matchedCode) {
        originInput.dataset.skyscannerCode = matchedCode;
      } else {
        const manual = sanitizeSkyscannerPlaceCode(originInput.value);
        if (manual.length >= 3) {
          originInput.dataset.skyscannerCode = manual;
        } else {
          originInput.removeAttribute('data-skyscanner-code');
        }
      }
    });
    originInput.dataset.bound = 'true';
  }

  showFlightSearchError('');
}

// Core GraphQL fetch function (uses app GIS token; EP ID comes from EXPA login)
async function gqlFetch(query, variables = {}) {
  console.log('📡 Making GraphQL request:', { query, variables });
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': EXPA_ACCESS_TOKEN
  };
  
  const response = await fetch(EXPA_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });
  
  console.log('📊 Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ HTTP Error:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const json = await response.json();
  console.log('✅ GraphQL Response:', json);
  
  if (json.errors && json.errors.length) {
    console.error('❌ GraphQL Errors:', json.errors);
    throw new Error('GraphQL errors: ' + JSON.stringify(json.errors));
  }
  
  return json;
}

// Test function to debug API issues
function testAPI() {
  console.log('🧪 Testing API connection...');
  console.log('🔑 Access Token:', EXPA_ACCESS_TOKEN);
  console.log('🌐 API Endpoint:', EXPA_GRAPHQL_ENDPOINT);
  
  // Test with a simple query first
  const testQuery = `
    query TestQuery {
      allOpportunityApplication(
        filters: { person_id: 5652575 }
        page: 1
        per_page: 1
      ) {
        data {
          id
          status
          person {
            id
            full_name
          }
          opportunity {
            title
          }
        }
        paging {
          current_page
          total_pages
        }
      }
    }
  `;
  
  console.log('📋 Test query:', testQuery);
  
  gqlFetch(testQuery)
    .then(result => {
      console.log('✅ Test successful:', result);
    })
    .catch(error => {
      console.error('💥 Test failed:', error);
    });
}

// Make test function available globally for debugging
window.testAPI = testAPI;

// Login form handler - Direct fetch without localStorage
function handleEPLogin(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const epIdInput = document.getElementById('epId');
  const epId = epIdInput ? epIdInput.value.trim() : '';
  const errorMessage = document.getElementById('errorMessage');
  const loadingMessage = document.getElementById('loadingMessage');
  const loginBtn = document.querySelector('.login-btn');
  
  console.log('🚀 Login form submitted with EP ID:', epId);
  
  if (!epId) {
    console.log('❌ No EP ID provided');
    showError('Please enter your EP ID');
    return false;
  }
  
  // Disable button and show loading state
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Accessing...';
  }
  
  // Show loading state
  if (loadingMessage) {
  loadingMessage.style.display = 'block';
  }
  if (errorMessage) {
  errorMessage.style.display = 'none';
  }
  
  console.log('⏳ Starting EP data fetch...');
  
  // Fetch EP data from EXPA API and redirect with EP ID
  fetchEPData(epId)
    .then(data => {
      console.log('✅ EP data fetched successfully:', data);
      
      // Set authentication flag in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('epId', epId);
      
      // Store EP ID in URL parameter
      console.log('🔄 Redirecting to profile page with EP ID...');
      window.location.href = `where-my-journey-begins.html?epId=${epId}`;
    })
    .catch(error => {
      console.error('💥 Error in login handler:', error);
      showError('Invalid EP ID or unable to fetch data. Please try again.');
      
      // Reset button state on error
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Access My Journey';
      }
      if (loadingMessage) {
      loadingMessage.style.display = 'none';
      }
    });
  
  return false;
}

// Show error message
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

// Fetch EP data from EXPA API using the correct schema
async function fetchEPData(epId) {
  console.log('🔍 Starting EP data fetch for ID:', epId);
  
  try {
    const query = `
      query GetEPApplications($id: Int!) {
        allOpportunityApplication(filters: { person_id: $id }) {
          data {
            person {
              id
              full_name
              email
              contact_detail { phone }
              home_lc { name }
              home_mc { name }
            }
            opportunity {
              id
              title
              project_name
              project_description
              programme { short_name_display }
              sub_product { name }
              experience_type
              opportunity_duration_type { duration_type }
              host_lc { name }
              home_mc { name }
              branch { company { name } }
              sdg_info {
                id
                sdg_target {
                  id
                  target
                  goal_index
                  parent { id name sdg_goal_no }
                }
              }
              location
              description
              weekly_activities { week activity }
            }
            slot { start_date end_date }
            status
            updated_at
            date_approved
            date_realized
            experience_end_date
          }
        }
      }
    `;
    
    const variables = { id: parseInt(epId) };
    console.log('📋 Query variables:', variables);
    
    const result = await gqlFetch(query, variables);
    
    // Log the raw data fetched from the query
    console.log('🔍 Raw GraphQL response:', result);
    console.log('🔍 Raw applications data:', result.data?.allOpportunityApplication?.data);
    
    if (result.data && result.data.allOpportunityApplication && result.data.allOpportunityApplication.data.length > 0) {
      console.log('✅ EP applications found:', result.data.allOpportunityApplication.data.length);
      console.log('📋 First application raw data:', result.data.allOpportunityApplication.data[0]);
      return parseEPDataFromApplications(result.data.allOpportunityApplication.data, epId);
    } else {
      console.log('❌ No applications found for EP ID:', epId);
      throw new Error('EP not found or has no applications');
    }
  } catch (error) {
    console.error('💥 Error fetching EP data:', error);
    throw new Error('Unable to fetch EP data. Please check the EP ID and try again.');
  }
}

// No mock data - only use real API data

// Parse EP data from applications using the correct GraphQL structure
function parseEPDataFromApplications(applications, epId) {
  console.log('🔄 Parsing EP data from applications:', applications.length, 'applications');
  console.log('📊 Raw first application structure:', applications[0]);
  
  if (!applications || applications.length === 0) {
    throw new Error('No applications found for this EP');
  }
  
  // Get the first application to extract person info
  const firstApp = applications[0];
  const person = firstApp.person;
  const opportunity = firstApp.opportunity;
  
  console.log('👤 Person data:', person);
  console.log('👤 Person fields available:', Object.keys(person || {}));
  console.log('🎯 Opportunity data:', opportunity);
  console.log('🎯 Opportunity fields available:', Object.keys(opportunity || {}));
  console.log('🎯 Opportunity title:', opportunity?.title);
  console.log('🎯 Opportunity description:', opportunity?.description);
  console.log('🎯 Opportunity location:', opportunity?.location);
  console.log('🎯 Opportunity programme:', opportunity?.programme);
  
  // Get SDG information
  const sdg = opportunity?.sdg_info?.sdg_target?.parent || {};
  const sdgTarget = opportunity?.sdg_info?.sdg_target?.target || '';
  
  // Format weekly activities
  const weeklyActivities = (opportunity.weekly_activities || [])
    .map(w => `W${w.week}: ${w.activity}`)
    .join(' | ');
  
  console.log('📝 Weekly activities raw:', opportunity.weekly_activities);
  console.log('📝 Weekly activities formatted:', weeklyActivities);
  console.log('📅 Slot data:', firstApp.slot);
  console.log('📅 Slot start_date:', firstApp.slot?.start_date);
  console.log('📅 Slot end_date:', firstApp.slot?.end_date);
  
  const parsedData = {
    // Personal Details
    id: person.id || epId,
    name: person.full_name || '',
    email: person.email || '',
    phone: person.contact_detail?.phone || '',
    home_lc: person.home_lc?.name || '',
    home_mc: person.home_mc?.name || '',
    
    // Application Details
    status: firstApp.status || '',
    date_approved: firstApp.date_approved || '',
    date_realized: firstApp.date_realized || '',
    experience_end_date: firstApp.experience_end_date || '',
    last_updated: firstApp.updated_at || '',
    
    // Opportunity Details
    opportunity_id: opportunity.id || '',
    title: opportunity.title || '',
    project_name: opportunity.project_name || '',
    product: opportunity.programme?.short_name_display || '',
    sub_product: opportunity.sub_product?.name || '',
    experience_type: opportunity.experience_type || '',
    duration_type: opportunity.opportunity_duration_type?.duration_type || '',
    
    // Location & Organization
    host_lc: opportunity.host_lc?.name || '',
    host_mc: opportunity.home_mc?.name || '', // This is the host MC (Egypt)
    organization_name: opportunity.branch?.company?.name || '',
    location: opportunity.location || '',
    
    // SDG Information
    sdg_goal_no: sdg.sdg_goal_no || '',
    sdg_goal_name: sdg.name || '',
    sdg_target: sdgTarget || '',
    
    // Timeline
    slot_start_date: firstApp.slot?.start_date || '',
    slot_end_date: firstApp.slot?.end_date || '',
    
    // Additional fields
    project_description: opportunity.project_description || '',
    role_description: opportunity.description || '',
    weekly_activities: weeklyActivities || '',
    
    // Keep original fields for compatibility
    startDate: firstApp.slot?.start_date,
    endDate: firstApp.slot?.end_date,
    
    // Legacy fields for backward compatibility
    homeLC: person.home_lc?.name || '',
    homeMC: person.home_mc?.name || '',
    hostLC: opportunity.host_lc?.name || '',
    opportunity: {
      title: opportunity.title || '',
      description: opportunity.description || '',
      location: opportunity.location || '',
      programme: opportunity.programme?.short_name_display || ''
    },
    applicationsCount: applications.length
  };
  
  console.log('✅ Final parsed data:', parsedData);
  console.log('🔍 Key fields check:', {
    name: parsedData.name,
    product: parsedData.product,
    location: parsedData.location,
    title: parsedData.title,
    role_description: parsedData.role_description,
    startDate: parsedData.startDate,
    home_mc: parsedData.home_mc,
    homeMC: parsedData.homeMC
  });
  
  return parsedData;
}

// Show preloader
function showPreloader() {
  const preloader = document.querySelector('.pre-loader');
  if (preloader) {
    preloader.style.display = 'flex';
    preloader.style.zIndex = '9999';
    console.log('⏳ Preloader shown');
  } else {
    console.log('❌ Preloader element not found');
  }
}

// Hide preloader
function hidePreloader() {
  const preloader = document.querySelector('.pre-loader');
  if (preloader) {
    preloader.style.display = 'none';
    console.log('✅ Preloader hidden');
  } else {
    console.log('❌ Preloader element not found for hiding');
  }
}

// Load EP profile data - Direct fetch from API
function loadEPProfile() {
  console.log('🚀 loadEPProfile function called');
  console.log('🌐 Current URL:', window.location.href);
  console.log('🔍 URL search params:', window.location.search);

  if (window.__expaOAuthInProgress) {
    console.log('[EXPA] OAuth in progress, deferring profile load');
    return;
  }
  
  // Always show preloader first
  showPreloader();
  
  // Get EP ID from URL parameters or localStorage (set after EXPA login)
  const urlParams = new URLSearchParams(window.location.search);
  const epId = urlParams.get('epId') || localStorage.getItem('epId');
  
  console.log('📋 URL params object:', urlParams);
  console.log('🆔 EP ID from URL:', urlParams.get('epId'));
  console.log('🆔 EP ID used:', epId);
  
  if (!epId) {
    console.log('❌ No EP ID found in URL parameters');
    // Keep preloader showing and show error message after delay
    setTimeout(() => {
      hidePreloader();
      showNoDataMessage();
    }, 2000); // Show preloader for at least 2 seconds
    return;
  }
  
  console.log('🔍 Loading EP profile for ID:', epId);
  
  // Fetch EP data directly from API
  console.log('🔄 Starting API call for EP ID:', epId);
  fetchEPData(epId)
    .then(data => {
      console.log('✅ EP data fetched successfully:', data);
      
      // Store homeCountry in localStorage for currency converter
      if (data.home_mc || data.homeMC) {
        const homeMC = data.home_mc || data.homeMC;
        localStorage.setItem('homeCountry', homeMC);
        console.log('💾 Stored homeCountry in localStorage:', homeMC);
        
        // Dispatch custom event to notify currency converter
        window.dispatchEvent(new CustomEvent('homeCountryUpdated', { detail: { homeCountry: homeMC } }));
      }
      
      // Display the EP profile with real data
      displayEPProfile(data);
      
      // Hide preloader after successful display
      setTimeout(() => {
        hidePreloader();
      }, 1500); // Show preloader for at least 1.5 seconds
      
    })
    .catch(error => {
      console.error('💥 Error fetching EP data:', error);
      
      // Keep preloader showing and show error message after delay
      setTimeout(() => {
        hidePreloader();
        showNoDataMessage();
      }, 2000); // Show preloader for at least 2 seconds
    });
}

// Format weekly activities into bullet points
function formatWeeklyActivities(weeklyText) {
  if (!weeklyText) return '';
  
  // First, let's group all activities by week number
  const weekGroups = {};
  
  // Split by week markers and process each week
  const weeks = weeklyText.split(/(?=W\d+:)/);
  
  weeks.forEach(week => {
    if (week.trim()) {
      const weekMatch = week.match(/^(W\d+):\s*(.+)$/);
      if (weekMatch) {
        const weekNumber = weekMatch[1];
        const activities = weekMatch[2].split('|').map(activity => activity.trim()).filter(activity => activity);
        
        if (!weekGroups[weekNumber]) {
          weekGroups[weekNumber] = [];
        }
        weekGroups[weekNumber].push(...activities);
      }
    }
  });
  
  // Now build the HTML with each week appearing only once
  let html = '';
  Object.keys(weekGroups).sort().forEach(weekNumber => {
    html += `<div class="week-group">`;
    html += `<h5 class="week-title">${weekNumber}</h5>`;
    html += `<div class="week-activities">`;
    weekGroups[weekNumber].forEach(activity => {
      html += `<div class="activity-item">- ${activity}</div>`;
    });
    html += `</div></div>`;
  });
  
  return html;
}

// Display EP profile with countdown timer - Using Website Styles
function displayEPProfile(data) {
  console.log('📊 Displaying EP profile with data:', data);
  console.log('📊 Data fields:', {
    name: data.name,
    product: data.product,
    location: data.location,
    title: data.title,
    role_description: data.role_description,
    home_mc: data.home_mc,
    homeMC: data.homeMC,
    startDate: data.startDate,
    endDate: data.endDate
  });
  
  const journeyContent = document.getElementById('epJourneyContent');
  const countdownTimer = document.getElementById('countdownTimer');
  const profileContent = document.getElementById('epProfileContent');
  
  // Determine product-specific duration styling and label
  function getDurationMeta(product, weeksText) {
    const weeks = weeksText + ' weeks exchange';
    if (!product) return { cls: '', text: weeks };
    const normalized = (product || '').toLowerCase();
    if (normalized.indexOf('volunteer') !== -1 || normalized === 'gv') {
      return { cls: 'duration-gv', text: weeks }; // GV red
    }
    if (normalized.indexOf('talent') !== -1 || normalized === 'gta' || normalized === 'gt a') {
      return { cls: 'duration-gta', text: 'exchange period (' + weeks + ')' }; // GTa blue
    }
    if (normalized.indexOf('teacher') !== -1 || normalized === 'gte' || normalized === 'gt e') {
      return { cls: 'duration-gte', text: 'exchange period (' + weeks + ')' }; // GTe orange
    }
    return { cls: '', text: weeks };
  }

  const durationWeeks = calculateDuration(data.startDate, data.endDate);
  const durationMeta = getDurationMeta(data.product, durationWeeks);

  // Journey content - Left aligned like the name
  const journeyHTML = `
    <div class="ep-journey-info">
      <h2 class="ep-name">${data.name || 'N/A'}</h2>
      <p class="ep-subtitle">${data.product || 'N/A'} • ${data.location || 'N/A'}</p>
      <div class="ep-status-info">
        <span class="status-badge status-${data.status === 'approved' ? 'approved' : data.status}">${data.status.toUpperCase()}</span>
        <p class="ep-duration ${durationMeta.cls}">${durationMeta.text}</p>
      </div>
      
      <div class="ep-welcome-quote">
        <p class="welcome-text">"Your journey to <span class="highlight">Egypt</span> begins here — where <span class="highlight">ancient wonders</span> meet <span class="highlight">modern dreams</span>. We can't wait to welcome you soon."</p>
      </div>
    </div>
  `;
  
  // Countdown timer - Simple like website
  const countdownHTML = createCountdownTimer(data.startDate);
  
  // Profile content removed per request
  const profileHTML = ``;
  
  journeyContent.innerHTML = journeyHTML;
  countdownTimer.innerHTML = countdownHTML;
  profileContent.innerHTML = profileHTML;

  // Add Project Information section below the journey wrapper
  const projectInfoHTML = `
    <div class="ep-complete-info collapsible-section">
      <div class="collapsible-header" onclick="toggleCollapsible('project-info')">
        <div class="project-header-section">
          <h3>Project Information</h3>
          <span class="project-type-badge ${getProjectTypeClass(data.product)}">${getProjectTypeText(data.product)}</span>
        </div>
        <i class="fas fa-chevron-down collapsible-icon" id="project-info-icon"></i>
      </div>
      <div class="collapsible-content" id="project-info-content">
      
      <div class="project-overview">
        <div class="project-header">
          <h4>${data.title || 'Project Title'}</h4>
          <div class="project-meta">
            <span class="project-id">ID: ${data.opportunity_id || 'N/A'}</span>
            <span class="project-product">${data.product || 'N/A'}</span>
          </div>
        </div>
        
        <div class="project-details">
          <div class="detail-row">
            <span class="detail-label">Organization:</span>
            <span class="detail-value">${data.organization_name || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Host LC:</span>
            <span class="detail-value">${data.host_lc || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${data.location || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${data.slot_start_date || 'N/A'} - ${data.slot_end_date || 'N/A'}</span>
          </div>
        </div>
        
        ${data.sdg_goal_no ? `
          <div class="sdg-section">
            <h5>SDG Impact</h5>
            <div class="sdg-info">
              <div class="sdg-goal-header">
                <img src="assets/images/sdg-goals/sdg-${data.sdg_goal_no}.png" alt="SDG Goal ${data.sdg_goal_no}" class="sdg-icon" onerror="this.style.display='none'">
                <span class="sdg-goal">Goal ${data.sdg_goal_no}: ${data.sdg_goal_name || 'N/A'}</span>
              </div>
              <p class="sdg-target">${data.sdg_target || 'N/A'}</p>
            </div>
          </div>
        ` : ''}
      </div>
      
      ${data.project_description ? `
        <div class="project-description">
          <h4>Project Description</h4>
          <p>${data.project_description}</p>
        </div>
      ` : ''}
      
      ${(() => {
        console.log('🔍 Role description data:', data.role_description);
        console.log('🔍 Role description exists:', !!data.role_description);
        return '';
      })()}
      
      ${data.role_description ? `
        <div class="role-description">
          <h4>Role Description</h4>
          <p>${data.role_description}</p>
        </div>
      ` : '<div class="role-description"><h4>Role Description</h4><p>No role description available</p></div>'}
      
      ${data.weekly_activities ? `
        <div class="weekly-activities">
          <h4>Weekly Activities</h4>
          <div class="weekly-list">${formatWeeklyActivities(data.weekly_activities)}</div>
        </div>
      ` : ''}
      </div>
    </div>
  `;

  // Insert the project information section after the journey wrapper
  const journeyWrapper = document.querySelector('.journey-content-wrapper');
  if (journeyWrapper && journeyWrapper.parentNode) {
    const projectInfoDiv = document.createElement('div');
    projectInfoDiv.innerHTML = projectInfoHTML;
    journeyWrapper.parentNode.insertBefore(projectInfoDiv, journeyWrapper.nextSibling);
    
    // Add visa requirements section after project information
    console.log('🎯 Adding visa requirements for home_mc:', data.home_mc || data.homeMC);
    const visaRequirements = getVisaRequirements(data.home_mc || data.homeMC);
    if (visaRequirements) {
      console.log('✅ Visa requirements found, generating HTML...');
      const visaHTML = generateVisaRequirementsHTML(visaRequirements);
      const visaDiv = document.createElement('div');
      visaDiv.innerHTML = visaHTML;
      projectInfoDiv.parentNode.insertBefore(visaDiv, projectInfoDiv.nextSibling);
      console.log('✅ Visa requirements section added to DOM');
    } else {
      console.log('❌ No visa requirements found for:', data.home_mc);
    }
  }

  // Add Exchange Story section for mobile
  try {
    const scrollSection = document.querySelector('section.scrolling-txt');
    if (scrollSection && scrollSection.parentNode) {
      // Add Exchange Story text above scrolling section
      const exchangeStoryWrapper = document.createElement('div');
      exchangeStoryWrapper.innerHTML = `
        <section class="exchange-story-section">
          <div class="container">
            <div class="exchange-story-text" data-aos="fade-right" data-aos-offset="300" data-aos-easing="ease-in-sine" data-aos-duration="1200">
              <h2>YOUR <span>EXCHANGE STORY</span></h2>
              <p>Every AIESEC exchange is a unique journey of personal growth, cultural immersion, and professional development. Your experience will be filled with meaningful connections, new perspectives, and unforgettable memories that will shape your future.</p>
            </div>
            <div class="exchange-story-image" data-aos="fade-left" data-aos-offset="300" data-aos-easing="ease-in-sine" data-aos-duration="1200">
              <img src="assets/images/whyEgyptHero/culture.webp" alt="Exchange Story">
              <div class="img-border"></div>
            </div>
          </div>
        </section>`;
      scrollSection.parentNode.insertBefore(exchangeStoryWrapper, scrollSection);
    }
  } catch (e) { /* noop */ }

  // Inject product video ABOVE the scrolling text section based on product
  try {
    const scrollSection = document.querySelector('section.scrolling-txt');
    if (scrollSection && scrollSection.parentNode) {
      const product = (data.product || '').toLowerCase();
      let color = '#f85a40'; // default GV red
      let playHandler = 'PlayIGV()';
      let borderClass = 'border';
      if (product.indexOf('talent') !== -1 || product === 'gta' || product === 'gt a') {
        color = '#0cb9c1';
        playHandler = 'PlayIGTa()';
      } else if (product.indexOf('teacher') !== -1 || product === 'gte' || product === 'gt e') {
        color = '#f48924';
        playHandler = 'PlayIGTe()';
      }
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <section class="video" style="margin-top: 0;">
          <div class="egypt-video container">
            <div class="video-wrapper">
              <button class="fas fa-play play-btn" id="myButton" onclick="${playHandler}" style="color: ${color};"></button>
              <video id="video" class="home-video" poster="assets/images/Untitled-_1_resized.webp">
                <source id="mp4" type="video/mp4">
              </video>
              <div class="${borderClass}"></div>
            </div>
          </div>
        </section>`;
      scrollSection.parentNode.insertBefore(wrapper, scrollSection);
    }
  } catch (e) { /* noop */ }
  
  // Start countdown timer if start date is available
  if (data.startDate) {
    startCountdownTimer(data.startDate);
  }

  initFlightSearch({
    homeMc: data.home_mc || data.homeMC,
    hostLc: data.host_lc,
    location: data.location,
    outboundDate: data.slot_start_date || data.startDate,
    inboundDate: data.slot_end_date || data.endDate
  });
}

// Create countdown timer HTML - Clean Design
function createCountdownTimer(startDate) {
  if (!startDate) {
    return `
      <h2>Exchange Start Date</h2>
      <p>Start date not available</p>
    `;
  }
  
  const startDateTime = new Date(startDate);
  const now = new Date();
  
  if (startDateTime <= now) {
    return `
      <h2>Exchange Status</h2>
      <p>Your exchange has started</p>
    `;
  }
  
  return `
    <h2>Days Until Your <span>Exchange</span> Begins</h2>
    <div class="countdown-display">
      <div class="countdown-item">
        <span class="countdown-number" id="days">--</span>
        <span class="countdown-label">Days</span>
      </div>
    </div>
  `;
}

// Start countdown timer - Clean Design
function startCountdownTimer(startDate) {
  console.log('🕐 Starting countdown timer for:', startDate);
  const startDateTime = new Date(startDate);
  
  function updateCountdown() {
    const now = new Date();
    const timeLeft = startDateTime - now;
    
    console.log('⏰ Time left:', timeLeft, 'days:', Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
    
    if (timeLeft <= 0) {
      // Exchange has started
      document.getElementById('countdownTimer').innerHTML = `
        <h2>Exchange Status</h2>
        <p>Your exchange has started</p>
      `;
      return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    
    // Update display
    const daysEl = document.getElementById('days');
    if (daysEl) {
      daysEl.textContent = days.toString();
      console.log('✅ Updated countdown to:', days, 'days');
    } else {
      console.log('❌ Days element not found');
    }
  }
  
  // Update immediately
  updateCountdown();
  
  // Update every hour (since we only show days)
  setInterval(updateCountdown, 60 * 60 * 1000);
}

// Show no data message
function showNoDataMessage() {
  const profileContent = document.getElementById('epProfileContent');
  
  profileContent.innerHTML = `
    <div class="no-data">
      <h2>No EP Data Found</h2>
      <p>Please log in with your EP ID to view your journey.</p>
      <button class="back-btn" onclick="window.location.href='where-my-journey-begins-login.html'">
        Go to Login
      </button>
    </div>
  `;
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
}

// Visa Requirements Data Structure - Updated with exact country data
const VISA_REQUIREMENTS = {
          eVisaOnly: {
            countries: [
              'Albania', 'Armenia', 'Austria', 'Azerbaijan', 'Bahrain', 'Benin', 'Bosnia & Herzegovina', 'Bulgaria', 'Cambodia', 
              'Cameroon', 'Croatia', 'Ecuador', 'Estonia', 'Finland', 'France', 'Hong Kong', 'Hungary', 'Iceland', 
              'Italy', 'Japan', 'Kazakhstan', 'Korea', 'Latvia', 'Lithuania', 'Mainland China', 'Mexico', 'Moldova', 'Montenegro', 
              'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Portugal', 'Republic of Macedonia', 'Romania', 'Russia', 
              'Serbia', 'Singapore', 'Slovakia', 'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Turkey', 'Ukraine', 
              'UAE', 'UK', 'USA', 'Venezuela'
            ],
    type: 'E-Visa Only',
    badgeClass: 'visa-evisa',
    generalDocs: [
      'Passport (valid ≥ 6 months)',
      'National ID card',
      '6-month bank statement',
      '2-4 passport photos',
      'Round-trip flight tickets',
      'Invitation letter (AIESEC Egypt)',
      'Accommodation details'
    ],
    extraDocs: {
      'Argentina': ['Yellow Fever Certificate (mandatory for immigration)'],
      'Benin': ['National ID card'],
      'Bolivia': ['Bank statement'],
      'Brazil': ['Passport photos'],
      'Cameroon': ['Flight tickets'],
      'Colombia': ['Invitation Letter'],
      'Côte d\'Ivoire': ['Accommodation details'],
      'Ecuador': ['Flight tickets'],
      'Paraguay': ['Accommodation details'],
      'Peru': ['Accommodation details'],
      'Venezuela': ['Accommodation details']
    },
    processNotes: [
      'Apply at official Egypt E-Visa portal',
      'Bring original documents to immigration',
      'Keep login credentials safe',
      'Incomplete applications cause rejection',
      'Fees are non-refundable',
      'Download approved E-Visa after email confirmation'
    ]
  },

  eVisaOrArrival: {
    countries: [
      'Argentina', 'Australia', 'Belgium', 'Bolivia', 'Brazil', 'Canada', 'Chile', 'Colombia', 'Costa Rica', 'Côte d\'Ivoire', 
      'Czech Republic', 'Denmark', 'Dominican Republic', 'El Salvador', 'Georgia', 'Germany', 'Greece', 'Indonesia', 
      'Malaysia', 'Paraguay', 'Peru', 'Tanzania', 'The Netherlands'
    ],
    type: 'E-Visa or Visa on Arrival',
    badgeClass: 'visa-evisa',
    generalDocs: [
      'Passport (valid ≥ 6 months)',
      'National ID card',
      '6-month bank statement',
      '2-4 passport photos',
      'Round-trip flight tickets',
      'Invitation letter (AIESEC Egypt)',
      'Accommodation details'
    ],
    extraDocs: {
      'Argentina': ['Yellow Fever Certificate (mandatory for immigration)'],
      'Benin': ['National ID card'],
      'Bolivia': ['Bank statement'],
      'Brazil': ['Passport photos'],
      'Cameroon': ['Flight tickets'],
      'Colombia': ['Invitation Letter'],
      'Côte d\'Ivoire': ['Accommodation details'],
      'Ecuador': ['Flight tickets'],
      'Paraguay': ['Accommodation details'],
      'Peru': ['Accommodation details'],
      'Venezuela': ['Accommodation details']
    },
    processNotes: [
      'Apply at official Egypt E-Visa portal',
      'Bring original documents to immigration',
      'Keep login credentials safe',
      'Incomplete applications cause rejection',
      'Fees are non-refundable',
      'Download approved E-Visa after email confirmation'
    ],
    arrivalNotes: [
      'Visa on arrival is not guaranteed; apply in advance if possible',
      'Fee must be paid in USD or EUR only (USD 25 single / USD 60 multiple)',
      'Queues can be long; processing may take hours'
    ]
  },
  
  touristVisaOnly: {
    countries: [
      'Algeria', 'Bangladesh', 'Burkina Faso', 'Ethiopia', 'Ghana', 'Guatemala', 'India', 'Kenya', 'Kyrgyzstan', 'Liberia', 
      'Malawi', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Nicaragua', 'Nigeria', 
      'Pakistan', 'Panama', 'Philippines', 'Rwanda', 'Senegal', 'Sri Lanka', 'Thailand', 'Togo', 'Tunisia', 
      'Uganda', 'Vietnam'
    ],
    type: 'Tourist Visa',
    badgeClass: 'visa-tourist',
    generalDocs: [
      'Passport (valid ≥ 6 months, 2 blank pages)',
      '6-month bank statement',
      'National ID card',
      '2-4 passport photos',
      'Invitation Letter (AIESEC Egypt)',
      'Accommodation details',
      'Self Declaration form (from Embassy)',
      'Visa Fees (online/offline depending on country)',
      'Return Ticket (required at immigration)',
      'Flight to Egypt',
      'Income Certificate (as requested by Embassy)'
    ],
    extraDocs: {
      'Ethiopia': ['Yellow Fever Certificate (mandatory)'],
      'Ghana': ['Income Certificate'],
      'Guatemala': ['Income Certificate'],
      'India': ['E-Visa option available (alternative to Tourist Visa)'],
      'Kenya': ['No Criminal Certificate'],
      'Philippines': ['Family Registration Certificate'],
      'Tanzania': ['Student Letter if applicable'],
      'Thailand': ['Student Letter if applicable'],
      'Togo': ['Student Letter if applicable'],
      'Uganda': ['Student Letter if applicable'],
      'Tunisia': ['Security Permit'],
      'Vietnam': ['Student & House Registration Record + Bank Statement']
    },
    processNotes: [
      'Application only through Egyptian Embassy (no online method)',
      'Documents may vary by country; confirm locally',
      'Return ticket mandatory for immigration',
      'Some documents require government notarization'
    ]
  },
  
  freeEntry: {
    countries: ['Jordan', 'Kuwait', 'Lebanon', 'Malaysia'],
    type: 'Free Visa / No Visa Entry',
    badgeClass: 'visa-free',
    generalDocs: [
      'Passport (valid ≥ 6 months, 2 blank pages)',
      'National ID card',
      '6-month bank statement',
      'Round-trip flight tickets',
      'Invitation Letter (AIESEC Egypt)',
      'Accommodation details'
    ],
    extraDocs: {
      'Kuwait': ['E-Visa option also available (dual entry)'],
      'Lebanon': ['E-Visa option also available (dual entry)'],
      'Malaysia': ['Visa-free for 14 days only; beyond requires E-Visa']
    },
    processNotes: [
      'Contact Egyptian Embassy to confirm documents',
      'Return ticket checked at immigration; no entry without it'
    ]
  }
};

// Country name mapping for variations and AIESEC MC names
const COUNTRY_MAPPING = {
  // AIESEC Member Committee names
  'AIESEC United States': 'USA',
  'AIESEC USA': 'USA',
  'AIESEC United Kingdom': 'UK',
  'AIESEC UK': 'UK',
  'AIESEC United Arab Emirates': 'UAE',
  'AIESEC UAE': 'UAE',
  'AIESEC South Korea': 'Korea',
  'AIESEC Korea': 'Korea',
  'AIESEC Czech Republic': 'Czech Republic',
  'AIESEC Slovakia': 'Slovakia',
  'AIESEC China': 'Mainland China',
  'AIESEC Taiwan': 'Taiwan',
  'AIESEC Russia': 'Russia',
  'AIESEC Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'AIESEC Bosnia': 'Bosnia & Herzegovina',
  'AIESEC Côte d\'Ivoire': 'Côte d\'Ivoire',
  'AIESEC Ivory Coast': 'Côte d\'Ivoire',
  'AIESEC Cote D\'Ivoire': 'Côte d\'Ivoire',
  'AIESEC Republic of Macedonia': 'Republic of Macedonia',
  'AIESEC Macedonia': 'Republic of Macedonia',
  'AIESEC The Netherlands': 'The Netherlands',
  'AIESEC Hong Kong': 'Hong Kong',
  'AIESEC Georgia': 'Georgia',
  'AIESEC Germany': 'Germany',
  'AIESEC France': 'France',
  'AIESEC Italy': 'Italy',
  'AIESEC Spain': 'Spain',
  'AIESEC Netherlands': 'Netherlands',
  'AIESEC Belgium': 'Belgium',
  'AIESEC Austria': 'Austria',
  'AIESEC Switzerland': 'Switzerland',
  'AIESEC Sweden': 'Sweden',
  'AIESEC Norway': 'Norway',
  'AIESEC Denmark': 'Denmark',
  'AIESEC Finland': 'Finland',
  'AIESEC Poland': 'Poland',
  'AIESEC Hungary': 'Hungary',
  'AIESEC Romania': 'Romania',
  'AIESEC Bulgaria': 'Bulgaria',
  'AIESEC Croatia': 'Croatia',
  'AIESEC Serbia': 'Serbia',
  'AIESEC Montenegro': 'Montenegro',
  'AIESEC Albania': 'Albania',
  'AIESEC Greece': 'Greece',
  'AIESEC Turkey': 'Turkey',
  'AIESEC Ukraine': 'Ukraine',
  'AIESEC Canada': 'Canada',
  'AIESEC Mexico': 'Mexico',
  'AIESEC Brazil': 'Brazil',
  'AIESEC Argentina': 'Argentina',
  'AIESEC Chile': 'Chile',
  'AIESEC Colombia': 'Colombia',
  'AIESEC Peru': 'Peru',
  'AIESEC Venezuela': 'Venezuela',
  'AIESEC Bolivia': 'Bolivia',
  'AIESEC Paraguay': 'Paraguay',
  'AIESEC Uruguay': 'Uruguay',
  'AIESEC Ecuador': 'Ecuador',
  'AIESEC Costa Rica': 'Costa Rica',
  'AIESEC Panama': 'Panama',
  'AIESEC Guatemala': 'Guatemala',
  'AIESEC Honduras': 'Honduras',
  'AIESEC Nicaragua': 'Nicaragua',
  'AIESEC El Salvador': 'El Salvador',
  'AIESEC Dominican Republic': 'Dominican Republic',
  'AIESEC Jamaica': 'Jamaica',
  'AIESEC Trinidad and Tobago': 'Trinidad and Tobago',
  'AIESEC Barbados': 'Barbados',
  'AIESEC Japan': 'Japan',
  'AIESEC India': 'India',
  'AIESEC Pakistan': 'Pakistan',
  'AIESEC Bangladesh': 'Bangladesh',
  'AIESEC Sri Lanka': 'Sri Lanka',
  'AIESEC Nepal': 'Nepal',
  'AIESEC Bhutan': 'Bhutan',
  'AIESEC Myanmar': 'Myanmar',
  'AIESEC Thailand': 'Thailand',
  'AIESEC Vietnam': 'Vietnam',
  'AIESEC Cambodia': 'Cambodia',
  'AIESEC Laos': 'Laos',
  'AIESEC Malaysia': 'Malaysia',
  'AIESEC Singapore': 'Singapore',
  'AIESEC Indonesia': 'Indonesia',
  'AIESEC Philippines': 'Philippines',
  'AIESEC Brunei': 'Brunei',
  'AIESEC Australia': 'Australia',
  'AIESEC New Zealand': 'New Zealand',
  'AIESEC Fiji': 'Fiji',
  'AIESEC Papua New Guinea': 'Papua New Guinea',
  'AIESEC South Africa': 'South Africa',
  'AIESEC Nigeria': 'Nigeria',
  'AIESEC Ghana': 'Ghana',
  'AIESEC Kenya': 'Kenya',
  'AIESEC Tanzania': 'Tanzania',
  'AIESEC Uganda': 'Uganda',
  'AIESEC Rwanda': 'Rwanda',
  'AIESEC Ethiopia': 'Ethiopia',
  'AIESEC Egypt': 'Egypt',
  'AIESEC Morocco': 'Morocco',
  'AIESEC Tunisia': 'Tunisia',
  'AIESEC Algeria': 'Algeria',
  'AIESEC Libya': 'Libya',
  'AIESEC Sudan': 'Sudan',
  'AIESEC Jordan': 'Jordan',
  'AIESEC Lebanon': 'Lebanon',
  'AIESEC Syria': 'Syria',
  'AIESEC Iraq': 'Iraq',
  'AIESEC Iran': 'Iran',
  'AIESEC Afghanistan': 'Afghanistan',
  'AIESEC Kazakhstan': 'Kazakhstan',
  'AIESEC Uzbekistan': 'Uzbekistan',
  'AIESEC Kyrgyzstan': 'Kyrgyzstan',
  'AIESEC Tajikistan': 'Tajikistan',
  'AIESEC Turkmenistan': 'Turkmenistan',
  'AIESEC Mongolia': 'Mongolia',
  'AIESEC Armenia': 'Armenia',
  'AIESEC Azerbaijan': 'Azerbaijan',
  'AIESEC Georgia': 'Georgia',
  'AIESEC Moldova': 'Moldova',
  'AIESEC Latvia': 'Latvia',
  'AIESEC Lithuania': 'Lithuania',
  'AIESEC Estonia': 'Estonia',
  'AIESEC Iceland': 'Iceland',
  'AIESEC Ireland': 'Ireland',
  'AIESEC Portugal': 'Portugal',
  'AIESEC Luxembourg': 'Luxembourg',
  'AIESEC Malta': 'Malta',
  'AIESEC Cyprus': 'Cyprus',
  'AIESEC Israel': 'Israel',
  'AIESEC Palestine': 'Palestine',
  'AIESEC Saudi Arabia': 'Saudi Arabia',
  'AIESEC Kuwait': 'Kuwait',
  'AIESEC Bahrain': 'Bahrain',
  'AIESEC Qatar': 'Qatar',
  'AIESEC Oman': 'Oman',
  'AIESEC Yemen': 'Yemen',
  'AIESEC Senegal': 'Senegal',
  'AIESEC Mali': 'Mali',
  'AIESEC Burkina Faso': 'Burkina Faso',
  'AIESEC Niger': 'Niger',
  'AIESEC Chad': 'Chad',
  'AIESEC Cameroon': 'Cameroon',
  'AIESEC Central African Republic': 'Central African Republic',
  'AIESEC Democratic Republic of the Congo': 'Democratic Republic of the Congo',
  'AIESEC Republic of the Congo': 'Republic of the Congo',
  'AIESEC Gabon': 'Gabon',
  'AIESEC Equatorial Guinea': 'Equatorial Guinea',
  'AIESEC São Tomé and Príncipe': 'São Tomé and Príncipe',
  'AIESEC Angola': 'Angola',
  'AIESEC Zambia': 'Zambia',
  'AIESEC Zimbabwe': 'Zimbabwe',
  'AIESEC Botswana': 'Botswana',
  'AIESEC Namibia': 'Namibia',
  'AIESEC Lesotho': 'Lesotho',
  'AIESEC Swaziland': 'Swaziland',
  'AIESEC Madagascar': 'Madagascar',
  'AIESEC Mauritius': 'Mauritius',
  'AIESEC Seychelles': 'Seychelles',
  'AIESEC Comoros': 'Comoros',
  'AIESEC Djibouti': 'Djibouti',
  'AIESEC Somalia': 'Somalia',
  'AIESEC Eritrea': 'Eritrea',
  'AIESEC Liberia': 'Liberia',
  'AIESEC Sierra Leone': 'Sierra Leone',
  'AIESEC Guinea': 'Guinea',
  'AIESEC Guinea-Bissau': 'Guinea-Bissau',
  'AIESEC Cape Verde': 'Cape Verde',
  'AIESEC Gambia': 'Gambia',
  'AIESEC Togo': 'Togo',
  'AIESEC Benin': 'Benin',
  'AIESEC Malawi': 'Malawi',
  'AIESEC Mozambique': 'Mozambique',
  
  // Standard country name variations
  'United States': 'USA',
  'United States of America': 'USA',
  'US': 'USA',
  'United Kingdom': 'UK',
  'Great Britain': 'UK',
  'Britain': 'UK',
  'United Arab Emirates': 'UAE',
  'UAE': 'UAE',
  'South Korea': 'Korea',
  'North Korea': 'Korea',
  'Czech Republic': 'Czech Republic',
  'Slovak Republic': 'Slovakia',
  'Republic of Korea': 'Korea',
  'People\'s Republic of China': 'Mainland China',
  'China': 'Mainland China',
  'Hong Kong': 'Hong Kong',
  'Macau': 'Macau',
  'Taiwan': 'Taiwan',
  'Republic of China': 'Taiwan',
  'Russian Federation': 'Russia',
  'Russian Republic': 'Russia',
  'Soviet Union': 'Russia',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Bosnia': 'Bosnia & Herzegovina',
  'Herzegovina': 'Bosnia & Herzegovina',
  'Ivory Coast': 'Côte d\'Ivoire',
  'Cote d\'Ivoire': 'Côte d\'Ivoire',
  'Côte d\'Ivoire': 'Côte d\'Ivoire',
  'Cote D\'Ivoire': 'Côte d\'Ivoire',
  'Republic of Macedonia': 'Republic of Macedonia',
  'Macedonia': 'Republic of Macedonia',
  'The Netherlands': 'The Netherlands',
  'Netherlands': 'Netherlands',
  'Georgia': 'Georgia',
  'Mainland of China': 'Mainland China'
};

// Function to get visa requirements based on sending entity
function getVisaRequirements(homeMC) {
  console.log('🔍 Getting visa requirements for:', homeMC);
  
  if (!homeMC) {
    console.log('❌ No homeMC provided');
    return null;
  }
  
  // Normalize country name
  let countryName = homeMC.trim();
  console.log('📍 Original country name:', countryName);
  
  // Check mapping first
  if (COUNTRY_MAPPING[countryName]) {
    countryName = COUNTRY_MAPPING[countryName];
    console.log('🔄 Mapped to:', countryName);
  } else {
    console.log('⚠️ No mapping found for:', countryName);
  }
  
  // Check each visa category
  for (const [categoryKey, categoryData] of Object.entries(VISA_REQUIREMENTS)) {
    if (categoryData.countries.includes(countryName)) {
      console.log('✅ Found visa requirements for:', countryName, 'in category:', categoryKey);
      return {
        ...categoryData,
        country: countryName,
        extraDocsForCountry: categoryData.extraDocs[countryName] || []
      };
    }
  }
  
  // If country not found, return null
  console.log('❌ No visa requirements found for:', countryName);
  return null;
}

// Function to generate visa requirements HTML
function generateVisaRequirementsHTML(visaData) {
  const { type, badgeClass, generalDocs, extraDocsForCountry, processNotes, arrivalNotes, country } = visaData;
  
  // Check if country has multiple visa options (like India with Tourist Visa + E-Visa)
  const hasMultipleOptions = extraDocsForCountry.some(doc => 
    doc.toLowerCase().includes('e-visa') || doc.toLowerCase().includes('alternative')
  );
  
  // Determine badge text and class for multiple options
  let badgeText = type;
  let badgeClassFinal = badgeClass;
  
  if (hasMultipleOptions) {
    // For countries with multiple options, show both types in the badge
    if (type === 'Tourist Visa') {
      badgeText = 'Tourist Visa / E-Visa';
      badgeClassFinal = 'visa-multiple';
    } else if (type === 'E-Visa or Visa on Arrival') {
      badgeText = 'E-Visa / Visa on Arrival';
      badgeClassFinal = 'visa-multiple';
    } else if (type === 'Free Visa / No Visa Entry') {
      badgeText = 'Free Visa / E-Visa';
      badgeClassFinal = 'visa-multiple';
    }
  }
  
  let html = `
    <div class="visa-requirements-section collapsible-section">
      <div class="collapsible-header" onclick="toggleCollapsible('visa-requirements')">
        <div class="visa-header">
          <h3>Visa Requirements for ${country}</h3>
          <span class="visa-category-badge ${badgeClassFinal}">${badgeText}</span>
        </div>
        <i class="fas fa-chevron-down collapsible-icon" id="visa-requirements-icon"></i>
      </div>
      <div class="collapsible-content" id="visa-requirements-content">
        <div class="visa-disclaimer">
          <p><i class="fas fa-exclamation-triangle"></i> <strong>Important:</strong> Visa requirements may vary by country and are subject to change. Please verify current requirements with your local Egyptian embassy or consulate before traveling.</p>
        </div>
  `;
  
  // If country has multiple visa options, show buttons
  if (hasMultipleOptions) {
    html += `
        <div class="visa-options-buttons">
          <h4>Available Visa Options</h4>
          <div class="visa-buttons-container">
            <button class="visa-option-btn active" data-option="primary" onclick="showVisaOption('${country}', 'primary')">
              <i class="fas fa-passport"></i> ${type}
            </button>
    `;
    
    // Add secondary option button
    extraDocsForCountry.forEach(doc => {
      if (doc.toLowerCase().includes('e-visa')) {
        html += `
            <button class="visa-option-btn" data-option="evisa" onclick="showVisaOption('${country}', 'evisa')">
              <i class="fas fa-laptop"></i> E-Visa
            </button>
        `;
      }
    });
    
    html += `
          </div>
        </div>
        
        <div class="visa-option-content" id="visa-content-${country.replace(/\s+/g, '-').toLowerCase()}">
    `;
  }
  
  // Add documents section
  html += `
        <div class="visa-docs-section">
          <h4>Required Documents</h4>
          <ul class="visa-docs-list">
  `;
  
  // Add general documents
  generalDocs.forEach(doc => {
    html += `<li><i class="fas fa-check-circle"></i> ${doc}</li>`;
  });
  
  html += `
          </ul>
        </div>
  `;
  
  // Add country-specific extra documents if any
  if (extraDocsForCountry.length > 0) {
    html += `
        <div class="visa-extra-docs">
          <h4>Additional Requirements for ${country}</h4>
          <ul class="visa-docs-list">
    `;
    
    extraDocsForCountry.forEach(doc => {
      html += `<li><i class="fas fa-exclamation-triangle"></i> ${doc}</li>`;
    });
    
    html += `
          </ul>
        </div>
    `;
  }
  
  // Add process notes
  html += `
        <div class="visa-notes">
          <h4>Important Notes</h4>
          <ul class="visa-notes-list">
  `;
  
  processNotes.forEach(note => {
    html += `<li><i class="fas fa-info-circle"></i> ${note}</li>`;
  });
  
  // Add arrival notes for E-Visa or Visa on Arrival
  if (arrivalNotes) {
    arrivalNotes.forEach(note => {
      html += `<li><i class="fas fa-plane"></i> ${note}</li>`;
    });
  }
  
  html += `
          </ul>
        </div>
  `;
  
  // Close visa option content div if multiple options
  if (hasMultipleOptions) {
    html += `</div>`;
  }
  
  // Add visa extension info
  html += `
        <div class="visa-extension-info">
          <h4>Visa Extension Protocol</h4>
          <div class="extension-details">
            <p><strong>Requirements:</strong></p>
            <ul class="visa-docs-list">
              <li><i class="fas fa-check-circle"></i> Valid passport</li>
              <li><i class="fas fa-check-circle"></i> Existing E-Visa used for entry</li>
              <li><i class="fas fa-check-circle"></i> Fee (~ USD 45 cash)</li>
              <li><i class="fas fa-check-circle"></i> 2-4 passport photos</li>
              <li><i class="fas fa-check-circle"></i> Current Egypt address (accommodation)</li>
            </ul>
            <p><strong>Notes:</strong></p>
            <ul class="visa-notes-list">
              <li><i class="fas fa-info-circle"></i> Extension adds 3 months (valid as Foreign Residence Card)</li>
              <li><i class="fas fa-info-circle"></i> 2 weeks overstay allowed without fine</li>
              <li><i class="fas fa-info-circle"></i> Apply in person at Passports, Immigration & Nationality Administration, Abbasiya or Mugamma Tahrir</li>
              <li><i class="fas fa-info-circle"></i> Office hours: 8 a.m.–2 p.m. (Sun-Thu)</li>
              <li><i class="fas fa-exclamation-triangle"></i> Overstays → fines (≈ USD 100 for ≤ 3 months), possible travel ban for severe cases</li>
              <li><i class="fas fa-exclamation-triangle"></i> Fines payable at airport before departure</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;
  
  return html;
}

// Function to get project type class for styling
function getProjectTypeClass(product) {
  if (!product) return 'project-gv';
  
  const productLower = product.toLowerCase();
  if (productLower.includes('gta') || productLower.includes('global talent')) {
    return 'project-gta';
  } else if (productLower.includes('gte') || productLower.includes('global teacher')) {
    return 'project-gte';
  } else if (productLower.includes('gv') || productLower.includes('global volunteer')) {
    return 'project-gv';
  }
  return 'project-gv'; // Default to GV
}

// Function to get project type text
function getProjectTypeText(product) {
  if (!product) return 'GV';
  
  const productLower = product.toLowerCase();
  if (productLower.includes('gta') || productLower.includes('global talent')) {
    return 'GTa';
  } else if (productLower.includes('gte') || productLower.includes('global teacher')) {
    return 'GTe';
  } else if (productLower.includes('gv') || productLower.includes('global volunteer')) {
    return 'GV';
  }
  return 'GV'; // Default to GV
}

// Function to toggle collapsible sections
function toggleCollapsible(sectionId) {
  const content = document.getElementById(`${sectionId}-content`);
  const icon = document.getElementById(`${sectionId}-icon`);
  
  if (content && icon) {
    const isCollapsed = content.classList.contains('expanded') === false;
    
    if (isCollapsed) {
      // Expand
      content.classList.add('expanded');
      icon.classList.add('expanded');
      content.classList.remove('collapsed');
      icon.classList.remove('collapsed');
    } else {
      // Collapse
      content.classList.remove('expanded');
      icon.classList.remove('expanded');
      content.classList.add('collapsed');
      icon.classList.add('collapsed');
    }
  }
}

// Function to show different visa options
function showVisaOption(country, option) {
  const countryId = country.replace(/\s+/g, '-').toLowerCase();
  const contentDiv = document.getElementById(`visa-content-${countryId}`);
  const visaSection = contentDiv.closest('.visa-requirements-section');
  const buttons = visaSection.querySelectorAll('.visa-option-btn');
  
  // Update button states
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.option === option) {
      btn.classList.add('active');
    }
  });
  
  // Update content based on option
  if (option === 'evisa') {
    // Show E-Visa specific content
    contentDiv.innerHTML = `
      <div class="visa-docs-section">
        <h4>E-Visa Required Documents</h4>
        <ul class="visa-docs-list">
          <li><i class="fas fa-check-circle"></i> Passport (valid ≥ 6 months)</li>
          <li><i class="fas fa-check-circle"></i> National ID card</li>
          <li><i class="fas fa-check-circle"></i> 6-month bank statement</li>
          <li><i class="fas fa-check-circle"></i> 2-4 passport photos</li>
          <li><i class="fas fa-check-circle"></i> Round-trip flight tickets</li>
          <li><i class="fas fa-check-circle"></i> Invitation letter (AIESEC Egypt)</li>
          <li><i class="fas fa-check-circle"></i> Accommodation details</li>
        </ul>
      </div>
      
      <div class="visa-notes">
        <h4>E-Visa Process Notes</h4>
        <ul class="visa-notes-list">
          <li><i class="fas fa-info-circle"></i> Apply at official Egypt E-Visa portal</li>
          <li><i class="fas fa-info-circle"></i> Bring original documents to immigration</li>
          <li><i class="fas fa-info-circle"></i> Keep login credentials safe</li>
          <li><i class="fas fa-info-circle"></i> Incomplete applications cause rejection</li>
          <li><i class="fas fa-info-circle"></i> Fees are non-refundable</li>
          <li><i class="fas fa-info-circle"></i> Download approved E-Visa after email confirmation</li>
        </ul>
      </div>
    `;
  } else {
    // Show primary visa content (Tourist Visa for India)
    contentDiv.innerHTML = `
      <div class="visa-docs-section">
        <h4>Tourist Visa Required Documents</h4>
        <ul class="visa-docs-list">
          <li><i class="fas fa-check-circle"></i> Passport (valid ≥ 6 months, 2 blank pages)</li>
          <li><i class="fas fa-check-circle"></i> 6-month bank statement</li>
          <li><i class="fas fa-check-circle"></i> National ID card</li>
          <li><i class="fas fa-check-circle"></i> 2-4 passport photos</li>
          <li><i class="fas fa-check-circle"></i> Invitation Letter (AIESEC Egypt)</li>
          <li><i class="fas fa-check-circle"></i> Accommodation details</li>
          <li><i class="fas fa-check-circle"></i> Self Declaration form (from Embassy)</li>
          <li><i class="fas fa-check-circle"></i> Visa Fees (online/offline depending on country)</li>
          <li><i class="fas fa-check-circle"></i> Return Ticket (required at immigration)</li>
          <li><i class="fas fa-check-circle"></i> Flight to Egypt</li>
          <li><i class="fas fa-check-circle"></i> Income Certificate (as requested by Embassy)</li>
        </ul>
      </div>
      
      <div class="visa-notes">
        <h4>Tourist Visa Process Notes</h4>
        <ul class="visa-notes-list">
          <li><i class="fas fa-info-circle"></i> Application only through Egyptian Embassy (no online method)</li>
          <li><i class="fas fa-info-circle"></i> Documents may vary by country; confirm locally</li>
          <li><i class="fas fa-info-circle"></i> Return ticket mandatory for immigration</li>
          <li><i class="fas fa-info-circle"></i> Some documents require government notarization</li>
        </ul>
      </div>
    `;
  }
}

// Function to initialize login form
function initLoginForm() {
  const loginForm = document.getElementById('epLoginForm');
  if (loginForm) {
    console.log('📝 Login page detected');
    // Remove any existing listeners to prevent duplicates
    loginForm.removeEventListener('submit', handleEPLogin);
    // Add the event listener
    loginForm.addEventListener('submit', handleEPLogin);
    console.log('✅ Login form event listener attached');
  }
}

// Initialize EP journey functionality when DOM is loaded
function initializeEPJourney() {
  console.log('🚀 Initializing EP Journey...');
  
  // Show preloader immediately for profile page
  if (document.getElementById('epProfileContent')) {
    console.log('👤 Profile page detected - showing preloader');
    showPreloader();
  }
  
  // Initialize login form
  initLoginForm();
  
  // Check if we're on the profile page
  if (document.getElementById('epProfileContent')) {
    console.log('👤 Profile page detected');
    loadEPProfile();
    initScrollingText();
    initCollapsibleSections();
  } else {
    console.log('❌ Profile page elements not found');
  }
}

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEPJourney);
} else {
  // DOM is already loaded
  initializeEPJourney();
}

// Initialize collapsible sections - All sections collapsed by default
function initCollapsibleSections() {
  setTimeout(() => {
    const projectContent = document.getElementById('project-info-content');
    const visaContent = document.getElementById('visa-requirements-content');
    const projectIcon = document.getElementById('project-info-icon');
    const visaIcon = document.getElementById('visa-requirements-icon');
    
    console.log('🖥️ Screen width:', window.innerWidth);
    console.log('📦 Project content found:', !!projectContent);
    console.log('📦 Visa content found:', !!visaContent);
    
    if (projectContent) {
      // Collapse Project Information by default on all devices
      console.log('🔄 Collapsing Project Information by default');
      projectContent.classList.remove('expanded');
      projectContent.classList.add('collapsed');
      if (projectIcon) {
        projectIcon.classList.remove('expanded');
        projectIcon.classList.add('collapsed');
      }
      console.log('✅ Project Information collapsed');
    }
    
    if (visaContent) {
      // Always collapse Visa Requirements initially
      console.log('🔄 Collapsing Visa Requirements');
      visaContent.classList.remove('expanded');
      visaContent.classList.add('collapsed');
      if (visaIcon) {
        visaIcon.classList.remove('expanded');
        visaIcon.classList.add('collapsed');
      }
      console.log('✅ Visa Requirements collapsed');
    }
  }, 100);
}

// Scrolling text animation (from index.html)
function initScrollingText() {
  const line1 = document.getElementById('line-one');
  const line2 = document.getElementById('line-two');
  const line3 = document.getElementById('line-three');

  if (line1 && line2 && line3) {
    window.addEventListener('scroll', () => {
      let scrolled = window.scrollY;
      let val = scrolled * 0.5;

      line1.style.transform = `translateX(-${0.35 * val}px)`;
      line2.style.transform = `translateX(${0.35 * val}px)`;
      line3.style.transform = `translateX(-${0.35 * val}px)`;
    });
  }
}