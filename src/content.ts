import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Fuel,
  Luggage,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Plane,
  Route,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';

export const brand = {
  name: 'Chettinad Express',
  phone: '+91 98765 43210',
  cleanPhone: '919876543210',
  email: 'booking@chettinadexpress.com',
  city: 'Karaikudi',
  state: 'Tamil Nadu',
  pincode: '630301',
  taluk: 'Karaikudi Taluk',
  district: 'Sivagangai District',
  postOffice: 'Amaravathipudur Post',
  address:
    'No. 690/990, Samathuvapuram, Amaravathipudur Post, Amaravathipudur, Karaikudi Taluk, Sivagangai District, Tamil Nadu 630301',
  hours: 'Open 24 hours, 7 days a week',
  domain: 'https://chettinadexpress.com',
};

export const whatsappMessage =
  'Hi Chettinad Express, I want to book a one way drop taxi. Please share fare details.';

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Routes', href: '/routes' },
  { label: 'Tariff', href: '/services#tariff' },
  { label: 'Contact', href: '/contact' },
];

export const tripTypes = ['One Way', 'Round Trip', 'Airport'] as const;

export const vehicleRates = [
  {
    name: 'Sedan',
    examples: 'Dzire, Etios, Xcent, Aspire, Zest',
    seats: '4+1 seats',
    oneWay: 15,
    roundTrip: 13,
    dayRent: 'Drop min 130 km',
    bestFor: 'Solo, family, business travel',
    luggage: '2 medium bags',
    icon: Car,
  },
  {
    name: 'SUV',
    examples: 'Ertiga, Kia Carens, Enjoy, Rumion',
    seats: '6+1 seats',
    oneWay: 20,
    roundTrip: 18,
    dayRent: 'Drop min 130 km',
    bestFor: 'Families with luggage',
    luggage: '4 medium bags',
    icon: Luggage,
  },
  {
    name: 'MUV',
    examples: 'Innova, Xylo, Marazzo',
    seats: '7+1 seats',
    oneWay: 21,
    roundTrip: 18,
    dayRent: 'Drop min 130 km',
    bestFor: 'Large family and group travel',
    luggage: '5 large bags',
    icon: Users,
  },
  {
    name: 'Innova Crysta',
    examples: 'Innova Crysta',
    seats: '6+1 seats',
    oneWay: 26,
    roundTrip: 23,
    dayRent: 'Drop min 130 km',
    bestFor: 'Premium comfort outstation rides',
    luggage: '5 large bags',
    icon: Users,
  },
];

export type TripType = (typeof tripTypes)[number];
export type VehicleRate = (typeof vehicleRates)[number];

export const farePolicy = {
  minimumBillableKm: 130,
  roundTripMinimumKm: 250,
  driverBata: 400,
};

export const getMinimumKmForTrip = (tripType: TripType) =>
  tripType === 'Round Trip' ? farePolicy.roundTripMinimumKm : farePolicy.minimumBillableKm;

export const calculateFareEstimate = (
  tripType: TripType,
  distanceKm: number,
  selectedVehicle: VehicleRate,
) => {
  const minimumKm = getMinimumKmForTrip(tripType);
  const rawDistance = Number(distanceKm);
  const actualKm = Number.isFinite(rawDistance) && rawDistance > 0 ? Math.ceil(rawDistance) : minimumKm;
  const billableKm = Math.max(minimumKm, actualKm);
  const rate = tripType === 'Round Trip' ? selectedVehicle.roundTrip : selectedVehicle.oneWay;
  const multiplier = tripType === 'Round Trip' ? 2 : 1;
  const baseFare = billableKm * rate * multiplier;
  const totalFare = baseFare + farePolicy.driverBata;

  return {
    actualKm,
    baseFare,
    billableKm,
    driverBata: farePolicy.driverBata,
    minimumKm,
    multiplier,
    rate,
    totalFare,
  };
};

export const tariffRules = {
  gstNote: 'Per-km rates are inclusive of GST. Estimates include Rs.400 driver bata.',
  dropTrip: [
    'Driver bata Rs.400 is added automatically to every estimate.',
    'Minimum billable distance is 130 km; shorter drop trips are billed as 130 km.',
    'Waiting charges Rs.150 per hour.',
  ],
  roundTrip: [
    'Driver bata Rs.400 is added automatically to every estimate.',
    'Minimum running must be 250 km per day. For Karnataka, minimum is 300 km per day.',
    '1 day means 1 calendar day from 00:00 hrs to 23:59 hrs.',
  ],
  extraCharges: [
    'Hill station charges: Rs.300 for Sedan and Rs.500 for MUV.',
    'Night charges Rs.200 apply only for drop trips starting between 11 pm and 5 am.',
    'Washing charges for carrying pets: Rs.400 for Sedan and Rs.500 for MUV.',
    'Luggage charges Rs.300 for carrying extra luggage.',
    'Only 2 pickup and drop points are allowed. More than that will be chargeable.',
    'Extra person charge Rs.300.',
  ],
};

export const highlights: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: 'Verified drivers', value: '850+', icon: ShieldCheck },
  { label: 'Tamil Nadu routes', value: '120+', icon: Route },
  { label: 'Support desk', value: '24/7', icon: Phone },
  { label: 'On-time pickup', value: '98%', icon: Clock },
];

export const trustPoints: Array<{ title: string; body: string; icon: LucideIcon }> = [
  {
    title: 'Clear fare before pickup',
    body: 'Route, vehicle, tolls, and extra km details are shared before confirmation. No surprise charges at drop.',
    icon: CheckCircle2,
  },
  {
    title: 'Clean cabs for long rides',
    body: 'Sedan, SUV, MUV, and Innova Crysta options with AC, luggage room, and route-ready maintenance checked every trip.',
    icon: Car,
  },
  {
    title: 'Driver tracking and support',
    body: 'Dispatcher support stays active from pickup to drop, with a single helpline for any change in plan.',
    icon: Navigation,
  },
];

export const services: Array<{
  title: string;
  slug: string;
  body: string;
  longBody: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
}> = [
  {
    title: 'One way drop taxi',
    slug: '/outstation-taxi',
    body: 'Pay for the pickup-to-drop distance only on popular intercity routes.',
    longBody:
      'Most customers travelling between Tamil Nadu cities only need a single direction trip. Our one way drop taxi bills the actual route kilometres instead of a forced round trip, which is why it remains the most searched cab option in the state.',
    image: '/images/outstation-taxi.png',
    imageAlt: 'White sedan taxi driving on a scenic Tamil Nadu highway',
    icon: Route,
  },
  {
    title: 'Round trip cabs',
    slug: '/outstation-taxi',
    body: 'Flexible return plans for business visits, family functions, and temple tours.',
    longBody:
      'For trips where the same vehicle is needed for the return leg, round trip pricing works out cheaper per kilometre. Common for weddings, temple tours, and multi-day business visits across districts.',
    image: '/images/outstation-taxi.png',
    imageAlt: 'Comfortable outstation taxi on a green highway route',
    icon: CalendarDays,
  },
  {
    title: 'Airport taxi',
    slug: '/airport-taxi',
    body: 'Flight-aware pickups and drops for Chennai, Coimbatore, Madurai, and Trichy airports.',
    longBody:
      'Flight timings are tracked so the driver adjusts pickup for early arrivals or delays. Meet-and-greet at arrivals with a name board, and fixed airport-zone fares with no last-minute surge.',
    image: '/images/airport-taxi.png',
    imageAlt: 'White airport taxi waiting at a terminal pickup lane with luggage',
    icon: Plane,
  },
  {
    title: 'Local rental packages',
    slug: '/local-taxi',
    body: 'Hourly and day rental plans for city errands, meetings, and sightseeing.',
    longBody:
      'Within-city travel for meetings, hospital visits, shopping, or local sightseeing is billed on hourly packages (4hr/40km, 8hr/80km, 12hr/120km) with the same driver for the full booking window.',
    image: '/images/local-taxi.png',
    imageAlt: 'White local taxi parked on a bright city street',
    icon: Building2,
  },
];

const slugifyRouteCity = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getTaxiRouteSlug = (from: string, to: string) =>
  `${slugifyRouteCity(from)}-to-${slugifyRouteCity(to)}-taxi`;

const sedanDropFare = (km: number) => calculateFareEstimate('One Way', km, vehicleRates[0]).totalFare;

interface PopularRouteSeed {
  from: string;
  to: string;
  km: number;
  via: string;
  image: string;
  imageAlt: string;
  tripReason: string;
  destinationFocus: string;
}

const popularRouteSeeds: PopularRouteSeed[] = [
  {
    from: 'Chennai',
    to: 'Karaikudi',
    km: 405,
    via: 'Trichy and Pudukottai',
    image: '/images/destination-chennai.png',
    imageAlt: 'Chettinad Express sedan ready for a Chennai to Karaikudi highway trip',
    tripReason: 'Chettinad family visits, temple plans, weddings, and business travel.',
    destinationFocus: 'Karaikudi, Pillayarpatti, Kundrakudi, Devakottai, and Chettinad villages.',
  },
  {
    from: 'Chennai',
    to: 'Coimbatore',
    km: 505,
    via: 'Salem and Avinashi',
    image: '/images/destination-coimbatore.png',
    imageAlt: 'White sedan taxi on a scenic Coimbatore road near the Western Ghats',
    tripReason: 'Airport transfers, textile business visits, college travel, and family drops.',
    destinationFocus: 'Coimbatore city, Gandhipuram, Peelamedu, RS Puram, and airport pickups.',
  },
  {
    from: 'Chennai',
    to: 'Madurai',
    km: 462,
    via: 'Trichy and Dindigul',
    image: '/images/destination-madurai.png',
    imageAlt: 'White taxi on a Madurai road with temple scenery at sunset',
    tripReason: 'Temple visits, family functions, railway pickups, and overnight drops.',
    destinationFocus: 'Madurai city, Meenakshi Amman Temple, airport, and nearby temple towns.',
  },
  {
    from: 'Chennai',
    to: 'Trichy',
    km: 331,
    via: 'Villupuram and Perambalur',
    image: '/images/destination-trichy.png',
    imageAlt: 'White taxi on a Trichy road with Rockfort scenery in the background',
    tripReason: 'Srirangam trips, airport transfers, college travel, and central Tamil Nadu business visits.',
    destinationFocus: 'Trichy city, Srirangam, Rockfort, Thillai Nagar, and airport zones.',
  },
  {
    from: 'Chennai',
    to: 'Pondicherry',
    km: 155,
    via: 'ECR or Tindivanam',
    image: '/images/outstation-taxi.png',
    imageAlt: 'Outstation taxi on a bright Tamil Nadu coastal highway',
    tripReason: 'Weekend beach stays, White Town hotel drops, and family day trips.',
    destinationFocus: 'Pondicherry, White Town, Auroville, ECR resorts, and bus stand pickups.',
  },
  {
    from: 'Coimbatore',
    to: 'Madurai',
    km: 215,
    via: 'Dharapuram and Oddanchatram',
    image: '/images/destination-coimbatore.png',
    imageAlt: 'Coimbatore taxi route toward southern Tamil Nadu',
    tripReason: 'Business travel, temple visits, railway station drops, and family rides.',
    destinationFocus: 'Madurai city, temple zones, airport, and Coimbatore return pickups.',
  },
  {
    from: 'Madurai',
    to: 'Rameswaram',
    km: 172,
    via: 'Paramakudi and Ramanathapuram',
    image: '/images/destination-madurai.png',
    imageAlt: 'Madurai taxi route for a Rameswaram temple trip',
    tripReason: 'Pilgrimage travel, temple tour packages, and family coastal trips.',
    destinationFocus: 'Rameswaram temple, Pamban, Dhanushkodi, and railway station drops.',
  },
  {
    from: 'Salem',
    to: 'Bangalore',
    km: 204,
    via: 'Dharmapuri and Hosur',
    image: '/images/outstation-taxi.png',
    imageAlt: 'Intercity taxi on Salem to Bangalore highway route',
    tripReason: 'Corporate travel, airport connections, family visits, and one way drops.',
    destinationFocus: 'Bangalore city, Electronic City, Majestic, and airport-side transfers.',
  },
  {
    from: 'Trichy',
    to: 'Kodaikanal',
    km: 196,
    via: 'Dindigul and Batlagundu',
    image: '/images/destination-trichy.png',
    imageAlt: 'Trichy taxi route heading toward Kodaikanal hill station',
    tripReason: 'Hill station holidays, family tours, honeymoon rides, and resort drops.',
    destinationFocus: 'Kodaikanal Lake, resort areas, bus stand, and sightseeing pickup points.',
  },
];

export const popularRoutes = popularRouteSeeds.map((route) => ({
  ...route,
  sedan: sedanDropFare(route.km),
  slug: getTaxiRouteSlug(route.from, route.to),
}));

export interface SeoRouteLanding {
  from: string;
  to: string;
  slug: string;
  keyword: string;
  km: number;
  via: string;
  image: string;
  imageAlt: string;
  tripReason: string;
  destinationFocus: string;
  travelTime: string;
  metaDescription: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
}

const formatInr = (value: number) => `Rs.${value.toLocaleString('en-IN')}`;

const getApproxTravelTime = (km: number) => {
  const lower = Math.max(2, Math.floor(km / 60));
  const upper = Math.max(lower + 1, Math.ceil(km / 45));

  return `${lower}-${upper} hrs`;
};

const buildSeoRouteLanding = (route: PopularRouteSeed): SeoRouteLanding => {
  const sedanEstimate = calculateFareEstimate('One Way', route.km, vehicleRates[0]);
  const suvEstimate = calculateFareEstimate('One Way', route.km, vehicleRates[1]);
  const keyword = `${route.from} to ${route.to} taxi`;

  return {
    ...route,
    slug: getTaxiRouteSlug(route.from, route.to),
    keyword,
    travelTime: getApproxTravelTime(route.km),
    metaDescription: `Book ${keyword} with Chettinad Express. Approx ${route.km} km one way drop cab, Sedan estimate from ${formatInr(sedanEstimate.totalFare)}, Rs.400 driver bata included, 24/7 pickup support.`,
    highlights: [
      `Doorstep pickup from ${route.from} and direct drop at ${route.to}.`,
      `Approx ${route.km} km by road via ${route.via}; route km can be adjusted before confirmation.`,
      `Sedan estimate from ${formatInr(sedanEstimate.totalFare)} and SUV estimate from ${formatInr(suvEstimate.totalFare)}.`,
      `Minimum ${farePolicy.minimumBillableKm} km billing and Rs.${farePolicy.driverBata} driver bata are already included in estimates.`,
    ],
    faqs: [
      {
        question: `What is the ${keyword} fare?`,
        answer: `${route.from} to ${route.to} Sedan estimate is about ${formatInr(sedanEstimate.totalFare)} and SUV estimate is about ${formatInr(suvEstimate.totalFare)} for approx ${route.km} km. The estimate includes Rs.${farePolicy.driverBata} driver bata; toll, parking, permit, waiting, and other applicable charges are extra.`,
      },
      {
        question: `Can I book one way drop taxi from ${route.from} to ${route.to}?`,
        answer: `Yes. Chettinad Express supports one way drop taxi booking from ${route.from} to ${route.to} with Sedan, SUV, MUV, and Innova Crysta options.`,
      },
      {
        question: `Is there a minimum km for ${keyword}?`,
        answer: `Yes. One way drop trips follow a ${farePolicy.minimumBillableKm} km minimum billable distance. Since this route is approx ${route.km} km, billing is normally based on the route distance and selected car rate.`,
      },
      {
        question: `How long does ${keyword} usually take?`,
        answer: `Typical travel time is around ${getApproxTravelTime(route.km)} depending on pickup area, traffic, food breaks, and final drop location.`,
      },
    ],
  };
};

const reverseRouteSeed = (route: PopularRouteSeed): PopularRouteSeed => ({
  ...route,
  from: route.to,
  to: route.from,
  tripReason: `Return drops, airport or railway connections, family travel, and business visits from ${route.to}.`,
  destinationFocus: `${route.to} pickup areas and ${route.from} home, hotel, airport, railway station, and office drops.`,
});

export const seoRouteLandings = popularRouteSeeds.flatMap((route) => [
  buildSeoRouteLanding(route),
  buildSeoRouteLanding(reverseRouteSeed(route)),
]);

export const getSeoRouteBySlug = (slug: string) => seoRouteLandings.find((route) => route.slug === slug);

export const getSeoRouteByCities = (from: string, to: string) =>
  seoRouteLandings.find((route) => route.from === from && route.to === to);

export const routeSeoKeywords = [
  'Chennai to Karaikudi taxi',
  'Karaikudi to Chennai taxi',
  'Chennai to Trichy taxi',
  'Madurai to Chennai taxi',
  'Chennai to Coimbatore drop taxi',
  'Coimbatore to Madurai cab',
  'Trichy to Kodaikanal taxi',
  'Chennai to Pondicherry taxi',
];

export const destinationGallery = [
  {
    city: 'Coimbatore',
    image: '/images/destination-coimbatore.png',
    imageAlt: 'White sedan taxi on a scenic Coimbatore road near the Western Ghats',
    routeKeyword: 'Chennai to Coimbatore drop taxi',
    body: 'Airport transfers, textile business visits, and Western Ghats weekend drops.',
    routes: ['Chennai to Coimbatore', 'Coimbatore to Madurai'],
  },
  {
    city: 'Madurai',
    image: '/images/destination-madurai.png',
    imageAlt: 'White taxi on a Madurai road with temple scenery at sunset',
    routeKeyword: 'Madurai to Chennai taxi',
    body: 'Temple trips, railway pickups, family travel, and late-night drop cabs.',
    routes: ['Chennai to Madurai', 'Madurai to Rameswaram'],
  },
  {
    city: 'Trichy',
    image: '/images/destination-trichy.png',
    imageAlt: 'White taxi on a Trichy road with Rockfort scenery in the background',
    routeKeyword: 'Chennai to Trichy taxi',
    body: 'Central Tamil Nadu routes for Srirangam, airport pickups, and business travel.',
    routes: ['Chennai to Trichy', 'Trichy to Kodaikanal'],
  },
  {
    city: 'Chennai',
    image: '/images/destination-chennai.png',
    imageAlt: 'White taxi on a Chennai city road at dawn for outstation pickup',
    routeKeyword: 'Karaikudi to Chennai taxi',
    body: 'Doorstep pickup for airport, hospital, corporate, and outstation returns.',
    routes: ['Karaikudi to Chennai', 'Madurai to Chennai'],
  },
];

export const addressSuggestions: Array<{
  label: string;
  city: string;
  detail: string;
  keywords: string[];
}> = [
  { label: 'Samathuvapuram, Amaravathipudur, Karaikudi', city: 'Karaikudi', detail: 'Amaravathipudur Post, Karaikudi Taluk', keywords: ['samathuvapuram', 'amaravathipudur', 'karaikudi'] },
  { label: 'Karaikudi New Bus Stand, Karaikudi', city: 'Karaikudi', detail: 'Bus stand', keywords: ['karaikudi', 'bus stand'] },
  { label: 'Karaikudi Junction Railway Station, Karaikudi', city: 'Karaikudi', detail: 'Railway station', keywords: ['karaikudi', 'railway', 'station'] },
  { label: 'Chennai Airport (MAA), Chennai', city: 'Chennai', detail: 'Airport', keywords: ['meenambakkam', 'airport'] },
  { label: 'Chennai Central Railway Station, Chennai', city: 'Chennai', detail: 'Railway station', keywords: ['central', 'railway'] },
  { label: 'T Nagar, Chennai', city: 'Chennai', detail: 'Shopping and pickup area', keywords: ['tnagar', 'thyagaraya nagar'] },
  { label: 'Velachery, Chennai', city: 'Chennai', detail: 'Residential pickup area', keywords: ['velacheri'] },
  { label: 'Tambaram, Chennai', city: 'Chennai', detail: 'South Chennai pickup hub', keywords: ['tambaram'] },
  { label: 'Porur, Chennai', city: 'Chennai', detail: 'West Chennai pickup area', keywords: ['porur'] },
  { label: 'OMR Sholinganallur, Chennai', city: 'Chennai', detail: 'IT corridor pickup area', keywords: ['omr', 'sholinganallur'] },
  { label: 'Anna Salai, Chennai', city: 'Chennai', detail: 'Central city address', keywords: ['mount road', 'anna salai'] },
  { label: 'Coimbatore Airport, Coimbatore', city: 'Coimbatore', detail: 'Airport', keywords: ['peelamedu', 'airport'] },
  { label: 'Gandhipuram Bus Stand, Coimbatore', city: 'Coimbatore', detail: 'Bus stand', keywords: ['gandhipuram', 'bus stand'] },
  { label: 'Coimbatore Railway Junction, Coimbatore', city: 'Coimbatore', detail: 'Railway station', keywords: ['railway', 'junction'] },
  { label: 'RS Puram, Coimbatore', city: 'Coimbatore', detail: 'City pickup area', keywords: ['r s puram'] },
  { label: 'Madurai Airport, Madurai', city: 'Madurai', detail: 'Airport', keywords: ['airport'] },
  { label: 'Madurai Railway Junction, Madurai', city: 'Madurai', detail: 'Railway station', keywords: ['railway', 'junction'] },
  { label: 'Meenakshi Amman Temple, Madurai', city: 'Madurai', detail: 'Temple landmark', keywords: ['meenakshi', 'temple'] },
  { label: 'KK Nagar, Madurai', city: 'Madurai', detail: 'City pickup area', keywords: ['k k nagar'] },
  { label: 'Trichy Airport, Trichy', city: 'Trichy', detail: 'Airport', keywords: ['tiruchirappalli airport'] },
  { label: 'Trichy Central Bus Stand, Trichy', city: 'Trichy', detail: 'Bus stand', keywords: ['central bus stand'] },
  { label: 'Srirangam, Trichy', city: 'Trichy', detail: 'Temple and pickup area', keywords: ['srirangam temple'] },
  { label: 'Salem New Bus Stand, Salem', city: 'Salem', detail: 'Bus stand', keywords: ['new bus stand'] },
  { label: 'Salem Railway Junction, Salem', city: 'Salem', detail: 'Railway station', keywords: ['railway', 'junction'] },
  { label: 'Erode Railway Junction, Erode', city: 'Erode', detail: 'Railway station', keywords: ['railway', 'junction'] },
  { label: 'Vellore CMC Hospital, Vellore', city: 'Vellore', detail: 'Hospital landmark', keywords: ['cmc', 'hospital'] },
  { label: 'Pondicherry Bus Stand, Pondicherry', city: 'Pondicherry', detail: 'Bus stand', keywords: ['puducherry', 'bus stand'] },
  { label: 'White Town, Pondicherry', city: 'Pondicherry', detail: 'Tourist pickup area', keywords: ['puducherry', 'white town'] },
  { label: 'Tirunelveli Junction, Tirunelveli', city: 'Tirunelveli', detail: 'Railway station', keywords: ['railway', 'junction'] },
  { label: 'Thanjavur Big Temple, Thanjavur', city: 'Thanjavur', detail: 'Temple landmark', keywords: ['brihadeeswarar', 'big temple'] },
  { label: 'Rameswaram Temple, Rameswaram', city: 'Rameswaram', detail: 'Temple landmark', keywords: ['ramanathaswamy', 'temple'] },
  { label: 'Kodaikanal Lake, Kodaikanal', city: 'Kodaikanal', detail: 'Hill station landmark', keywords: ['lake'] },
  { label: 'Ooty Bus Stand, Ooty', city: 'Ooty', detail: 'Hill station pickup area', keywords: ['udhagamandalam', 'bus stand'] },
  { label: 'Tirupati Railway Station, Tirupati', city: 'Tirupati', detail: 'Railway station', keywords: ['railway', 'station'] },
  { label: 'Kanyakumari Vivekananda Rock Ferry, Kanyakumari', city: 'Kanyakumari', detail: 'Tourist pickup area', keywords: ['vivekananda', 'ferry'] },
  { label: 'Bangalore Airport, Bangalore', city: 'Bangalore', detail: 'Airport', keywords: ['kempegowda', 'airport'] },
  { label: 'Majestic Bus Stand, Bangalore', city: 'Bangalore', detail: 'Bus stand', keywords: ['majestic', 'kempegowda bus station'] },
];

export const routeCities = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Trichy',
  'Salem',
  'Erode',
  'Vellore',
  'Tirunelveli',
  'Thanjavur',
  'Pondicherry',
  'Karaikudi',
  'Bangalore',
  'Rameswaram',
  'Kodaikanal',
  'Ooty',
  'Tirupati',
  'Kanyakumari',
];

export const mapCities: Array<{
  name: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  note: string;
}> = [
  { name: 'Chennai', x: 78, y: 18, lat: 13.0827, lng: 80.2707, note: 'HQ and main pickup hub' },
  { name: 'Vellore', x: 64, y: 22, lat: 12.9165, lng: 79.1325, note: 'Frequent Chennai-bound drops' },
  { name: 'Pondicherry', x: 80, y: 32, lat: 11.9416, lng: 79.8083, note: 'Weekend and ECR route' },
  { name: 'Salem', x: 48, y: 38, lat: 11.6643, lng: 78.146, note: 'Central junction for outstation' },
  { name: 'Erode', x: 40, y: 44, lat: 11.341, lng: 77.7172, note: 'Coimbatore corridor stop' },
  { name: 'Coimbatore', x: 28, y: 48, lat: 11.0168, lng: 76.9558, note: 'Western region hub' },
  { name: 'Ooty', x: 20, y: 40, lat: 11.4102, lng: 76.695, note: 'Hill station tour route' },
  { name: 'Trichy', x: 56, y: 56, lat: 10.7905, lng: 78.7047, note: 'Central Tamil Nadu hub' },
  { name: 'Thanjavur', x: 64, y: 60, lat: 10.787, lng: 79.1378, note: 'Temple tour stop' },
  { name: 'Kodaikanal', x: 38, y: 62, lat: 10.2381, lng: 77.4892, note: 'Hill station tour route' },
  { name: 'Madurai', x: 46, y: 72, lat: 9.9252, lng: 78.1198, note: 'Southern region hub' },
  { name: 'Karaikudi', x: 58, y: 70, lat: 10.0735, lng: 78.7732, note: 'Chettinad and Chennai return route' },
  { name: 'Tirunelveli', x: 42, y: 86, lat: 8.7139, lng: 77.7567, note: 'Deep south route' },
  { name: 'Rameswaram', x: 64, y: 80, lat: 9.2876, lng: 79.3129, note: 'Pilgrimage route' },
  { name: 'Kanyakumari', x: 32, y: 94, lat: 8.0883, lng: 77.5385, note: 'Southern tip destination' },
  { name: 'Bangalore', x: 24, y: 20, lat: 12.9716, lng: 77.5946, note: 'Neighbour-state corporate route' },
  { name: 'Tirupati', x: 70, y: 8, lat: 13.6288, lng: 79.4192, note: 'Temple and airport corridor' },
];

const normalizeLocation = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getLocationCity = (value: string) => {
  const normalized = normalizeLocation(value);
  if (!normalized) return '';

  const exactAddress = addressSuggestions.find((item) => normalizeLocation(item.label) === normalized);
  if (exactAddress) return exactAddress.city;

  const exactCity = mapCities.find((city) => normalizeLocation(city.name) === normalized);
  if (exactCity) return exactCity.name;

  const cityInAddress = mapCities.find((city) => normalized.includes(normalizeLocation(city.name)));
  if (cityInAddress) return cityInAddress.name;

  return '';
};

export const getKnownRouteDistanceKm = (pickup: string, drop: string) => {
  const pickupCity = getLocationCity(pickup);
  const dropCity = getLocationCity(drop);

  if (!pickupCity || !dropCity || pickupCity === dropCity) return null;

  const match = popularRoutes.find(
    (route) =>
      (route.from === pickupCity && route.to === dropCity) ||
      (route.from === dropCity && route.to === pickupCity),
  );

  return match?.km ?? null;
};

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationSuggestion {
  id: string;
  label: string;
  city: string;
  detail: string;
  keywords: string[];
  coordinates: Coordinates;
  source: 'local' | 'osm';
  priority: number;
}

export interface RouteDistanceResult {
  distanceKm: number;
  durationMinutes?: number;
  source: 'known' | 'route' | 'estimated';
}

interface PhotonFeature {
  geometry?: {
    coordinates?: number[];
  };
  properties?: {
    osm_id?: number | string;
    osm_type?: string;
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    type?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
  }>;
}

const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/';
const OSRM_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving';

export const normalizeLocationSearch = normalizeLocation;

const titleCase = (value: string) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const cityCoordinates = new Map(mapCities.map((city) => [city.name, { lat: city.lat, lng: city.lng }]));

export const localLocationSuggestions: LocationSuggestion[] = [
  ...mapCities.map((city) => ({
    id: `city-${normalizeLocationSearch(city.name)}`,
    label: city.name,
    city: city.name,
    detail: 'City',
    keywords: [city.note],
    coordinates: { lat: city.lat, lng: city.lng },
    source: 'local' as const,
    priority: 0,
  })),
  ...addressSuggestions
    .map((item): LocationSuggestion | null => {
      const coordinates = cityCoordinates.get(item.city);
      if (!coordinates) return null;

      return {
        id: `local-${normalizeLocationSearch(item.label)}`,
        label: item.label,
        city: item.city,
        detail: item.detail,
        keywords: item.keywords,
        coordinates,
        source: 'local' as const,
        priority: 1,
      };
    })
    .filter((item): item is LocationSuggestion => Boolean(item)),
];

export const getLocalLocationSelection = (value: string) => {
  const normalized = normalizeLocationSearch(value);
  if (!normalized) return null;

  return (
    localLocationSuggestions.find((item) => normalizeLocationSearch(item.label) === normalized) ??
    localLocationSuggestions.find(
      (item) => item.detail === 'City' && normalizeLocationSearch(item.city) === normalized,
    ) ??
    null
  );
};

export const searchLocalLocations = (value: string) => {
  const query = normalizeLocationSearch(value);
  if (!query) return localLocationSuggestions.slice(0, 8);

  const terms = query.split(' ').filter(Boolean);

  return localLocationSuggestions
    .map((item) => {
      const labelText = normalizeLocationSearch(item.label);
      const cityText = normalizeLocationSearch(item.city);
      const detailText = normalizeLocationSearch(item.detail);
      const keywordText = item.keywords.map(normalizeLocationSearch).join(' ');
      const haystack = `${labelText} ${cityText} ${detailText} ${keywordText}`;

      let score = 0;
      if (labelText.startsWith(query)) score += 5;
      if (cityText.startsWith(query)) score += 4;
      if (haystack.includes(query)) score += 3;
      if (terms.every((term) => haystack.includes(term))) score += 2;

      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.priority - b.item.priority || a.item.label.localeCompare(b.item.label))
    .map((result) => result.item)
    .slice(0, 8);
};

const uniqueAddressParts = (parts: Array<string | undefined>) => {
  const seen = new Set<string>();

  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .filter((part) => {
      const key = normalizeLocationSearch(part);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const getPhotonAddressLabel = (properties: PhotonFeature['properties']) => {
  const streetAddress = uniqueAddressParts([properties?.housenumber, properties?.street]).join(' ');
  const primary = properties?.name?.trim() || streetAddress;
  const secondary = uniqueAddressParts([
    properties?.city,
    properties?.district,
    properties?.county,
    properties?.state,
    properties?.country,
    properties?.postcode,
  ]);

  return uniqueAddressParts([primary, ...secondary]).join(', ');
};

export const searchRemoteLocations = async (value: string, signal?: AbortSignal) => {
  const query = value.trim();
  if (query.length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    limit: '6',
    lang: 'en',
    lat: '11.1271',
    lon: '78.6569',
  });

  const response = await fetch(`${PHOTON_SEARCH_URL}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error('Address search failed');
  }

  const data = (await response.json()) as PhotonResponse;

  return (data.features ?? [])
    .map((feature): LocationSuggestion | null => {
      const [lng, lat] = feature.geometry?.coordinates ?? [];
      const properties = feature.properties;
      const label = getPhotonAddressLabel(properties);

      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !label) return null;

      const city = properties?.city ?? properties?.district ?? properties?.county ?? properties?.state ?? 'India';
      const detail = titleCase(properties?.type ?? 'Address');
      const id = `osm-${properties?.osm_type ?? 'photon'}-${properties?.osm_id ?? `${label}-${lat}-${lng}`}`;

      return {
        id,
        label,
        city,
        detail,
        keywords: [properties?.name ?? '', properties?.street ?? '', city, detail],
        coordinates: { lat, lng },
        source: 'osm',
        priority: 2,
      };
    })
    .filter((item): item is LocationSuggestion => Boolean(item));
};

export const getDrivingRouteDistance = async (
  pickup: Coordinates,
  drop: Coordinates,
  signal?: AbortSignal,
): Promise<RouteDistanceResult> => {
  const coordinates = `${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}`;
  const params = new URLSearchParams({
    overview: 'false',
    alternatives: 'false',
    steps: 'false',
  });

  const response = await fetch(`${OSRM_ROUTE_URL}/${coordinates}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error('Route calculation failed');
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];
  const distanceMeters = route?.distance;

  if (data.code !== 'Ok' || !Number.isFinite(distanceMeters)) {
    throw new Error('Route not found');
  }

  return {
    distanceKm: Math.max(1, Math.ceil(Number(distanceMeters) / 1000)),
    durationMinutes: route?.duration ? Math.max(1, Math.round(route.duration / 60)) : undefined,
    source: 'route',
  };
};

const getStraightLineDistanceKm = (pickup: Coordinates, drop: Coordinates) => {
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(drop.lat - pickup.lat);
  const dLng = toRadians(drop.lng - pickup.lng);
  const lat1 = toRadians(pickup.lat);
  const lat2 = toRadians(drop.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const getEstimatedRoadDistanceKm = (pickup: Coordinates, drop: Coordinates) =>
  Math.max(1, Math.ceil(getStraightLineDistanceKm(pickup, drop) * 1.25));

export const resolveRouteDistance = async (
  pickupLabel: string,
  dropLabel: string,
  pickupLocation: LocationSuggestion | null,
  dropLocation: LocationSuggestion | null,
  signal?: AbortSignal,
): Promise<RouteDistanceResult | null> => {
  const knownDistance = getKnownRouteDistanceKm(pickupLabel, dropLabel);
  const hasRemoteAddress = pickupLocation?.source === 'osm' || dropLocation?.source === 'osm';

  if (knownDistance && !hasRemoteAddress) {
    return { distanceKm: knownDistance, source: 'known' };
  }

  if (pickupLocation?.coordinates && dropLocation?.coordinates) {
    try {
      return await getDrivingRouteDistance(pickupLocation.coordinates, dropLocation.coordinates, signal);
    } catch (error) {
      if (signal?.aborted) throw error;

      return {
        distanceKm: getEstimatedRoadDistanceKm(pickupLocation.coordinates, dropLocation.coordinates),
        source: 'estimated',
      };
    }
  }

  if (knownDistance) {
    return { distanceKm: knownDistance, source: 'known' };
  }

  return null;
};

export const steps = [
  {
    title: 'Send trip details',
    body: 'Choose pickup, drop, date, time, vehicle, and trip type from the booking form or map.',
  },
  {
    title: 'Confirm transparent fare',
    body: 'Get route-based pricing with toll, permit, parking, and driver allowance notes.',
  },
  {
    title: 'Ride with support',
    body: 'Driver details arrive before pickup, and the support team remains reachable through the trip.',
  },
];

export const testimonials = [
  {
    quote:
      'Booked Chennai to Coimbatore at night. Driver arrived early, car was clean, and the fare matched the quote.',
    name: 'Arun K.',
    route: 'Chennai to Coimbatore',
  },
  {
    quote:
      'Airport pickup was smooth even after the flight delay. The support team updated the driver without extra calls.',
    name: 'Priya S.',
    route: 'Madurai Airport',
  },
  {
    quote:
      'Good for family temple travel. We used an Innova for two days and the route plan was handled well.',
    name: 'Ramesh V.',
    route: 'Trichy to Rameswaram',
  },
  {
    quote:
      'Used the local 8 hour package for a day of meetings around the city. Same driver waited at every stop.',
    name: 'Divya N.',
    route: 'Chennai local rental',
  },
];

export const faqs = [
  {
    question: 'What is the minimum km for one way drop taxi?',
    answer:
      'One way and airport drop trips have a minimum billable distance of 130 km, so shorter 50 km or 80 km trips are billed as 130 km. Round trips have a minimum of 250 km per day, and Karnataka round trips have a minimum of 300 km per day.',
  },
  {
    question: 'Are toll and permit charges included?',
    answer:
      'Per-km rates are inclusive of GST and the estimate includes Rs.400 driver bata. Toll, parking, interstate permit, waiting, night, hill station, pet, luggage, and extra stop charges are listed separately whenever they apply.',
  },
  {
    question: 'What are the driver bata and waiting charges?',
    answer:
      'Driver bata is a fixed Rs.400 and is included automatically in the displayed estimate for all trip types. Waiting charges are Rs.150 per hour when applicable.',
  },
  {
    question: 'What extra charges can apply?',
    answer:
      'Night charges are Rs.200 for drop trips starting between 11 pm and 5 am. Hill station charge is Rs.300 for Sedan and Rs.500 for MUV. Pet washing, extra luggage, extra person, and extra pickup/drop point charges may apply.',
  },
  {
    question: 'Can I book a taxi for early morning pickup?',
    answer:
      'Yes. Bookings are available 24/7. Early morning and late night trips are confirmed with driver details in advance.',
  },
  {
    question: 'Do you provide round trip and local rental?',
    answer:
      'Yes. You can book one way, round trip, airport transfer, city rental, corporate travel, and family tour packages.',
  },
  {
    question: 'How do I select my pickup or drop city?',
    answer:
      'Use the interactive Tamil Nadu map on the Contact page or booking widget to tap a city pin, or type the city name directly into the form.',
  },
  {
    question: 'What if my flight is delayed?',
    answer:
      'Airport pickups are tracked against the live flight schedule, so the driver adjusts arrival time automatically at no extra charge for reasonable delays.',
  },
];

export const badgeItems = [
  { label: 'No hidden return fare', icon: CheckCircle2 },
  { label: 'AC cabs', icon: Fuel },
  { label: 'Live phone support', icon: MessageCircle },
  { label: 'Doorstep pickup', icon: MapPin },
  { label: 'Rated 4.8/5', icon: Star },
];

export const aboutContent = {
  intro:
    'Chettinad Express started as a small Chennai-based outstation cab desk and has grown into a route network covering every major city and pilgrimage town in Tamil Nadu.',
  mission:
    'Our goal is simple: show a real fare before the trip starts, put a verified driver behind the wheel, and stay reachable for the whole journey.',
  values: [
    {
      title: 'Transparent pricing',
      body: 'Per-km tariffs are published openly. Toll, permit, and driver allowance are called out instead of bundled in.',
    },
    {
      title: 'Verified drivers',
      body: 'Every driver on the network is background-checked, licensed, and trained on long-route safety.',
    },
    {
      title: 'Local knowledge',
      body: 'Drivers know district roads, temple timings, and airport traffic patterns, not just GPS directions.',
    },
  ],
  stats: [
    { label: 'Years serving Tamil Nadu', value: '8+' },
    { label: 'Trips completed', value: '45,000+' },
    { label: 'Cities covered', value: '25+' },
    { label: 'Average rating', value: '4.8/5' },
  ],
};

export const outstationContent = {
  intro:
    'Outstation taxi covers every intercity trip across Tamil Nadu and neighbouring states: one way drops, round trips, multi-city tours, and business travel between districts.',
  highlights: [
    'One way billing on actual route distance, no forced return fare',
    'Round trip rate is lower per km for multi-day plans',
    'Sedan, SUV, MUV, and Innova Crysta fleet for any group size',
    'GST-inclusive per-km rates with Rs.400 driver bata included in the estimate',
    'Night driving and early morning pickup available 24/7',
  ],
};

export const localContent = {
  intro:
    'Local taxi is built for within-city travel: office commutes, hospital visits, shopping trips, wedding errands, and half-day or full-day sightseeing inside Chennai and other major cities.',
  packages: [
    { name: '4 hours / 40 km', sedan: 900, suv: 1300 },
    { name: '8 hours / 80 km', sedan: 1700, suv: 2400 },
    { name: '12 hours / 120 km', sedan: 2400, suv: 3300 },
  ],
};

export const airportContent = {
  intro:
    'Airport taxi service covers pickup and drop for Chennai, Coimbatore, Madurai, Trichy, and Pondicherry airports with flight-aware scheduling.',
  highlights: [
    'Driver tracks live flight status for arrivals',
    'Meet-and-greet with a name board at the terminal',
    'Fixed airport-zone fares, no surge pricing',
    'Early morning and red-eye flight pickups available',
    'Pre-booking recommended at least 3 hours before flight time',
  ],
};

