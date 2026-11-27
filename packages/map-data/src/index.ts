import { MapMode, StateProfile, TerritoryCode } from '@india-statecraft/shared-types';

export interface MapModeConfig {
  id: MapMode;
  label: string;
  description: string;
  unit: string;
  minVal: number;
  maxVal: number;
  colorStops: [number, string][];
  getValue: (state: StateProfile) => number;
  formatValue: (val: number) => string;
}

export function formatUSD(val: number): string {
  if (Math.abs(val) >= 1_000_000_000) {
    return `$${(val / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `$${(val / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `$${(val / 1_000).toFixed(0)}K`;
  }
  return `$${val.toLocaleString('en-US')}`;
}

// Real geographic terrain / elevation scores (0-100) based on physical topography
const TERRAIN_ELEVATION_SCORES: Record<TerritoryCode, number> = {
  LA: 96, // Ladakh (High-altitude cold desert / Trans-Himalayas)
  JK: 90, // Jammu & Kashmir (Greater Himalayas & Pir Panjal)
  HP: 88, // Himachal Pradesh (Western Himalayas)
  UK: 86, // Uttarakhand (Garhwal & Kumaon Himalayas)
  SK: 92, // Sikkim (Kanchenjunga Himalayas)
  AR: 85, // Arunachal Pradesh (Eastern Himalayas)
  NL: 78, // Nagaland (Naga Hills)
  MN: 75, // Manipur (Manipur Hills)
  MZ: 74, // Mizoram (Mizo Hills)
  ML: 72, // Meghalaya (Shillong Plateau)
  AS: 35, // Assam (Brahmaputra Valley)
  TR: 32, // Tripura (Low hill ridges & valleys)
  KL: 60, // Kerala (Western Ghats & coastal strip)
  MH: 52, // Maharashtra (Deccan basalt plateau & Sahyadri)
  KA: 54, // Karnataka (Malnad & Deccan plateau)
  TN: 48, // Tamil Nadu (Eastern Ghats & Nilgiris)
  AP: 42, // Andhra Pradesh (Eastern Ghats & coastal delta)
  TS: 46, // Telangana (Deccan semi-arid plateau)
  MP: 50, // Madhya Pradesh (Vindhya & Satpura ranges)
  CG: 52, // Chhattisgarh (Bastar plateau & Maikal hills)
  JH: 55, // Jharkhand (Chota Nagpur plateau)
  OD: 48, // Odisha (Eastern Ghats & Mahanadi delta)
  GA: 45, // Goa (Konkan coast & Western Ghats edge)
  RJ: 35, // Rajasthan (Aravalli range & Thar Desert)
  GJ: 28, // Gujarat (Girnar hills, Kathiawar & Rann)
  PB: 22, // Punjab (Fertile alluvial plain)
  HR: 20, // Haryana (Indo-Gangetic plain)
  DL: 18, // Delhi (Yamuna basin & northern ridge)
  UP: 18, // Uttar Pradesh (Gangetic plain)
  BR: 16, // Bihar (Middle Ganga alluvial basin)
  WB: 14, // West Bengal (Bengal delta & Sundarbans, Darjeeling north)
  CH: 22, // Chandigarh (Shivalik foothills plain)
  AN: 30, // Andaman & Nicobar (Volcanic archipelago)
  LD: 10, // Lakshadweep (Coral atolls)
  PY: 12, // Puducherry (Coromandel coast)
  DNHDD: 15, // Dadra, Nagar Haveli, Daman & Diu
};

export const MAP_MODES: Record<MapMode, MapModeConfig> = {
  // 0. Normal: Flat political view — clean state colours, no data overlay
  normal: {
    id: 'normal',
    label: 'Normal View',
    description: 'Default political map view. Each state shown with a distinct flat colour. No data overlay.',
    unit: '',
    minVal: 0,
    maxVal: 1,
    colorStops: [[0, '#1e3a5f'], [1, '#1e3a5f']],
    getValue: (_s) => 0,
    formatValue: (_v) => '',
  },

  // 1. Terrain: Topographic physical relief
  terrain: {
    id: 'terrain',
    label: 'Terrain & Relief',
    description: 'Physical topography, elevation relief, mountain ranges, plateaus, and river basins.',
    unit: 'Elevation Index',
    minVal: 10,
    maxVal: 96,
    colorStops: [
      [0.0, '#2d6a4f'],  // Coastal plains & river deltas (green)
      [0.25, '#74c69d'], // Low fertile plains
      [0.45, '#d4a373'], // Deccan plateau / Aravalli hills (warm earth)
      [0.70, '#a3704c'], // High mountain ranges & escarpments
      [1.0, '#e8ecef'],  // Trans-Himalayan high alpine peaks (snow white)
    ],
    getValue: (s) => TERRAIN_ELEVATION_SCORES[s.code] || 40,
    formatValue: (v) => `${v}/100 Topography`,
  },

  // 2. Economy: Dummynation Golden Glow Heatmap
  economy: {
    id: 'economy',
    label: 'Economy (GDP)',
    description: 'Annual Gross State Domestic Product in USD. Represented via Dummynation Golden Glow heatmap.',
    unit: 'USD ($)',
    minVal: 1_000_000_000,     // $1B (Sikkim / Mizoram)
    maxVal: 450_000_000_000,   // $450B (Maharashtra)
    colorStops: [
      [0.0, '#1c170e'], // Very weak: dark, muted brownish charcoal
      [0.15, '#453213'], // Weak: warm brownish bronze
      [0.35, '#7c5817'], // Developing: deep amber bronze
      [0.60, '#b88616'], // Average: rich golden yellow
      [0.82, '#ebb118'], // Strong: bright golden amber
      [1.0, '#ffe81a'],  // Powerhouse: intense incandescent golden glow
    ],
    getValue: (s) => s.economy.gdpUSD,
    formatValue: (v) => formatUSD(v),
  },

  // 3. Population: Demographic Distribution
  population: {
    id: 'population',
    label: 'Population',
    description: 'Total population residing within state borders.',
    unit: 'Citizens',
    minVal: 500_000,
    maxVal: 250_000_000,
    colorStops: [
      [0.0, '#1e293b'],  // Sparse (<1M)
      [0.15, '#3b82f6'], // Moderate
      [0.40, '#0284c7'], // Large
      [0.70, '#f97316'], // Very high
      [1.0, '#dc2626'],  // Ultra high (>200M, e.g. UP)
    ],
    getValue: (s) => s.demographics.population,
    formatValue: (v) => `${(v / 1_000_000).toFixed(1)}M`,
  },

  // 4. Industry: Manufacturing Output Index
  industry: {
    id: 'industry',
    label: 'Industry Output',
    description: 'Industrial manufacturing capacity, factory clusters, SEZs, and production volume.',
    unit: 'Index (0-100)',
    minVal: 10,
    maxVal: 95,
    colorStops: [
      [0.0, '#181e29'],
      [0.25, '#334155'],
      [0.50, '#d97706'],
      [0.75, '#f59e0b'],
      [1.0, '#fef08a'],
    ],
    getValue: (s) => s.industryOutputIndex,
    formatValue: (v) => `${v}/100 Industry`,
  },

  // 5. Agriculture: Foodgrain & Agri Output
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture',
    description: 'Foodgrain harvest yield, irrigated cropland, and agricultural commodities output.',
    unit: 'Index (0-100)',
    minVal: 15,
    maxVal: 95,
    colorStops: [
      [0.0, '#14281d'],
      [0.25, '#2d5a3f'],
      [0.55, '#52b788'],
      [0.80, '#95d5b2'],
      [1.0, '#d8f3dc'],
    ],
    getValue: (s) => s.agricultureOutputIndex,
    formatValue: (v) => `${v}/100 Agri Yield`,
  },

  // 6. Natural Resources: Minerals & Renewables
  naturalResources: {
    id: 'naturalResources',
    label: 'Resources',
    description: 'Mineral deposits (iron ore, bauxite, coal), solar irradiance, and natural commodities.',
    unit: 'Index (0-100)',
    minVal: 10,
    maxVal: 95,
    colorStops: [
      [0.0, '#261c14'],
      [0.25, '#5c4033'],
      [0.55, '#a0522d'],
      [0.80, '#cd853f'],
      [1.0, '#ffdead'],
    ],
    getValue: (s) => s.naturalResourcesIndex,
    formatValue: (v) => `${v}/100 Mineral/Solar`,
  },

  // 7. Infrastructure: Power Grid & Transport Reliability
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Electrical power grid reliability, highway network density, and logistical connectivity.',
    unit: 'Reliability %',
    minVal: 40,
    maxVal: 98,
    colorStops: [
      [0.0, '#2b1b17'],
      [0.30, '#78350f'],
      [0.60, '#0284c7'],
      [0.85, '#38bdf8'],
      [1.0, '#a7f3d0'],
    ],
    getValue: (s) => s.infrastructure.powerGridReliabilityIndex,
    formatValue: (v) => `${v}% Grid Reliability`,
  },

  // 8. Happiness & HDI: Living Standards
  happiness: {
    id: 'happiness',
    label: 'Happiness & HDI',
    description: 'Composite Human Development Index: literacy, public health, low unemployment, and approval.',
    unit: 'HDI / Score',
    minVal: 45,
    maxVal: 92,
    colorStops: [
      [0.0, '#3f1d38'],
      [0.30, '#701a75'],
      [0.60, '#a21caf'],
      [0.85, '#e879f9'],
      [1.0, '#fae8ff'],
    ],
    getValue: (s) => s.demographics.happinessIndex,
    formatValue: (v) => `${v}/100 HDI Score`,
  },

  // 9. Research & Technology: Innovation
  research: {
    id: 'research',
    label: 'Research & Tech',
    description: 'Premier tertiary technical universities (IIT/NIT), research patents, and technology hubs.',
    unit: 'Tech Index',
    minVal: 10,
    maxVal: 95,
    colorStops: [
      [0.0, '#111827'],
      [0.30, '#312e81'],
      [0.60, '#4f46e5'],
      [0.85, '#818cf8'],
      [1.0, '#c7d2fe'],
    ],
    getValue: (s) => s.researchScore,
    formatValue: (v) => `${v}/100 Innovation`,
  },

  // 10. Military Contribution: Strategic Logistics
  militaryContribution: {
    id: 'militaryContribution',
    label: 'Defense Hub',
    description: 'Defense industrial corridors, ordnance manufacturing facilities, and armed forces recruitment.',
    unit: 'Defense Index',
    minVal: 10,
    maxVal: 95,
    colorStops: [
      [0.0, '#1c1917'],
      [0.30, '#44403c'],
      [0.60, '#047857'],
      [0.85, '#10b981'],
      [1.0, '#6ee7b7'],
    ],
    getValue: (s) => s.defenseContribution,
    formatValue: (v) => `${v}/100 Strategic`,
  },

  // 11. Trade Volume: Interstate & Maritime
  trade: {
    id: 'trade',
    label: 'Trade Volume',
    description: 'Interstate rail freight, seaport container throughput, and foreign merchandise exports.',
    unit: 'Trade Index',
    minVal: 10,
    maxVal: 95,
    colorStops: [
      [0.0, '#172554'],
      [0.30, '#1d4ed8'],
      [0.60, '#2563eb'],
      [0.85, '#60a5fa'],
      [1.0, '#dbeafe'],
    ],
    getValue: (s) => s.tradeVolumeIndex,
    formatValue: (v) => `${v}/100 Logistics`,
  },

  // 12. Water Security: Reservoir Storage & Basin Stress
  waterResources: {
    id: 'waterResources',
    label: 'Water Security',
    description: 'Reservoir storage capacity %, groundwater replenishment, and major perennial river discharge.',
    unit: 'Storage %',
    minVal: 15,
    maxVal: 95,
    colorStops: [
      [0.0, '#7f1d1d'],  // Severe water stress (red)
      [0.25, '#c2410c'], // High stress (orange)
      [0.50, '#eab308'], // Moderate (yellow)
      [0.75, '#0284c7'], // Adequate (cyan)
      [1.0, '#06b6d4'],  // Abundant reservoir storage (luminous cyan)
    ],
    getValue: (s) => s.water.reservoirStoragePercent,
    formatValue: (v) => `${v}% Storage Capacity`,
  },
};

// Smooth RGB color interpolation for silky heatmap gradients
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (clean.length === 3) {
    const r = ((bigint >> 8) & 0xf) * 17;
    const g = ((bigint >> 4) & 0xf) * 17;
    const b = (bigint & 0xf) * 17;
    return [r, g, b];
  }
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

function interpolateHex(c1: string, c2: string, factor: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const r = r1 + (r2 - r1) * factor;
  const g = g1 + (g2 - g1) * factor;
  const b = b1 + (b2 - b1) * factor;
  return rgbToHex(r, g, b);
}

/**
 * Returns a smooth, continuous hex color from the defined gradient scale.
 */
export function getMapColorForValue(mode: MapMode, val: number): string {
  const config = MAP_MODES[mode];
  if (!config) return '#334155';
  const norm = Math.max(0, Math.min(1, (val - config.minVal) / Math.max(1, config.maxVal - config.minVal)));
  const stops = config.colorStops;

  for (let i = 0; i < stops.length - 1; i++) {
    const [t1, c1] = stops[i];
    const [t2, c2] = stops[i + 1];
    if (norm >= t1 && norm <= t2) {
      const segmentRatio = (norm - t1) / Math.max(0.0001, t2 - t1);
      return interpolateHex(c1, c2, segmentRatio);
    }
  }
  return stops[stops.length - 1][1];
}

export const STATE_CENTROIDS: Record<TerritoryCode, [number, number]> = {
  AP: [80.2, 15.8],
  AR: [94.5, 28.1],
  AS: [92.9, 26.2],
  BR: [85.5, 25.5],
  CG: [81.8, 21.3],
  GA: [74.0, 15.3],
  GJ: [71.5, 22.3],
  HR: [76.2, 29.1],
  HP: [77.2, 31.8],
  JH: [85.3, 23.6],
  KA: [75.8, 14.8],
  KL: [76.4, 10.4],
  MP: [78.5, 23.2],
  MH: [75.5, 19.5],
  MN: [93.9, 24.7],
  ML: [91.4, 25.5],
  MZ: [92.9, 23.2],
  NL: [94.4, 26.1],
  OD: [84.5, 20.5],
  PB: [75.4, 31.0],
  RJ: [73.8, 26.6],
  SK: [88.5, 27.5],
  TN: [78.4, 11.0],
  TS: [79.0, 17.8],
  TR: [91.8, 23.8],
  UP: [80.8, 27.0],
  UK: [79.2, 30.1],
  WB: [87.8, 23.2],
  AN: [92.8, 11.6],
  CH: [76.8, 30.7],
  DNHDD: [72.9, 20.4],
  DL: [77.1, 28.7],
  JK: [74.8, 33.7],
  LA: [77.6, 34.2],
  LD: [72.6, 10.6],
  PY: [79.8, 11.9],
};

// Strategic city coordinates for the game map
export interface CityNode {
  name: string;
  stateCode: TerritoryCode;
  coords: [number, number];
  isCapital: boolean;
  populationM: number;
}

export const MAJOR_CITIES: CityNode[] = [
  // Maharashtra
  { name: 'Mumbai', stateCode: 'MH', coords: [72.8777, 19.0760], isCapital: true, populationM: 21.0 },
  { name: 'Pune', stateCode: 'MH', coords: [73.8567, 18.5204], isCapital: false, populationM: 7.2 },
  { name: 'Nagpur', stateCode: 'MH', coords: [79.0882, 21.1458], isCapital: false, populationM: 3.1 },
  { name: 'Nashik', stateCode: 'MH', coords: [73.7898, 19.9975], isCapital: false, populationM: 2.1 },
  { name: 'Aurangabad', stateCode: 'MH', coords: [75.3433, 19.8762], isCapital: false, populationM: 1.5 },
  { name: 'Solapur', stateCode: 'MH', coords: [75.9064, 17.6599], isCapital: false, populationM: 1.1 },
  // Gujarat
  { name: 'Gandhinagar', stateCode: 'GJ', coords: [72.6369, 23.2156], isCapital: true, populationM: 0.4 },
  { name: 'Ahmedabad', stateCode: 'GJ', coords: [72.5714, 23.0225], isCapital: false, populationM: 8.6 },
  { name: 'Surat', stateCode: 'GJ', coords: [72.8311, 21.1702], isCapital: false, populationM: 6.8 },
  { name: 'Vadodara', stateCode: 'GJ', coords: [73.1812, 22.3072], isCapital: false, populationM: 2.3 },
  { name: 'Rajkot', stateCode: 'GJ', coords: [70.8022, 22.3039], isCapital: false, populationM: 2.0 },
  // Karnataka
  { name: 'Bengaluru', stateCode: 'KA', coords: [77.5946, 12.9716], isCapital: true, populationM: 13.2 },
  { name: 'Mysuru', stateCode: 'KA', coords: [76.6394, 12.2958], isCapital: false, populationM: 1.3 },
  { name: 'Hubballi', stateCode: 'KA', coords: [75.1240, 15.3647], isCapital: false, populationM: 1.1 },
  { name: 'Mangaluru', stateCode: 'KA', coords: [74.8560, 12.9141], isCapital: false, populationM: 0.7 },
  // Tamil Nadu
  { name: 'Chennai', stateCode: 'TN', coords: [80.2707, 13.0827], isCapital: true, populationM: 11.5 },
  { name: 'Coimbatore', stateCode: 'TN', coords: [76.9558, 11.0168], isCapital: false, populationM: 2.9 },
  { name: 'Madurai', stateCode: 'TN', coords: [78.1198, 9.9252], isCapital: false, populationM: 1.8 },
  { name: 'Tiruchirappalli', stateCode: 'TN', coords: [78.7047, 10.7905], isCapital: false, populationM: 1.2 },
  // Uttar Pradesh
  { name: 'Lucknow', stateCode: 'UP', coords: [80.9462, 26.8467], isCapital: true, populationM: 3.8 },
  { name: 'Kanpur', stateCode: 'UP', coords: [80.3319, 26.4499], isCapital: false, populationM: 3.3 },
  { name: 'Varanasi', stateCode: 'UP', coords: [82.9739, 25.3176], isCapital: false, populationM: 1.7 },
  { name: 'Agra', stateCode: 'UP', coords: [78.0081, 27.1767], isCapital: false, populationM: 2.2 },
  { name: 'Prayagraj', stateCode: 'UP', coords: [81.8463, 25.4358], isCapital: false, populationM: 1.5 },
  // West Bengal
  { name: 'Kolkata', stateCode: 'WB', coords: [88.3639, 22.5726], isCapital: true, populationM: 15.1 },
  { name: 'Siliguri', stateCode: 'WB', coords: [88.3953, 26.7271], isCapital: false, populationM: 1.1 },
  { name: 'Durgapur', stateCode: 'WB', coords: [87.3119, 23.5204], isCapital: false, populationM: 0.7 },
  // Telangana & Andhra Pradesh
  { name: 'Hyderabad', stateCode: 'TS', coords: [78.4867, 17.3850], isCapital: true, populationM: 10.5 },
  { name: 'Warangal', stateCode: 'TS', coords: [79.5941, 17.9689], isCapital: false, populationM: 1.0 },
  { name: 'Amaravati', stateCode: 'AP', coords: [80.5150, 16.5131], isCapital: true, populationM: 0.5 },
  { name: 'Visakhapatnam', stateCode: 'AP', coords: [83.2185, 17.6868], isCapital: false, populationM: 2.3 },
  { name: 'Vijayawada', stateCode: 'AP', coords: [80.6480, 16.5062], isCapital: false, populationM: 1.5 },
  // Rajasthan & Madhya Pradesh
  { name: 'Jaipur', stateCode: 'RJ', coords: [75.7873, 26.9124], isCapital: true, populationM: 4.1 },
  { name: 'Jodhpur', stateCode: 'RJ', coords: [73.0243, 26.2389], isCapital: false, populationM: 1.5 },
  { name: 'Udaipur', stateCode: 'RJ', coords: [73.7125, 24.5854], isCapital: false, populationM: 0.7 },
  { name: 'Bhopal', stateCode: 'MP', coords: [77.4126, 23.2599], isCapital: true, populationM: 2.5 },
  { name: 'Indore', stateCode: 'MP', coords: [75.8577, 22.7196], isCapital: false, populationM: 3.3 },
  { name: 'Jabalpur', stateCode: 'MP', coords: [79.9864, 23.1815], isCapital: false, populationM: 1.5 },
  // Bihar, Odisha, Jharkhand, Chhattisgarh
  { name: 'Patna', stateCode: 'BR', coords: [85.1376, 25.5941], isCapital: true, populationM: 2.6 },
  { name: 'Gaya', stateCode: 'BR', coords: [85.0002, 24.7914], isCapital: false, populationM: 0.6 },
  { name: 'Bhubaneswar', stateCode: 'OD', coords: [85.8245, 20.2961], isCapital: true, populationM: 1.1 },
  { name: 'Cuttack', stateCode: 'OD', coords: [85.8830, 20.4625], isCapital: false, populationM: 0.8 },
  { name: 'Ranchi', stateCode: 'JH', coords: [85.3096, 23.3441], isCapital: true, populationM: 1.4 },
  { name: 'Jamshedpur', stateCode: 'JH', coords: [86.2029, 22.8046], isCapital: false, populationM: 1.6 },
  { name: 'Raipur', stateCode: 'CG', coords: [81.6296, 21.2514], isCapital: true, populationM: 1.5 },
  { name: 'Bilaspur', stateCode: 'CG', coords: [82.1409, 22.0797], isCapital: false, populationM: 0.6 },
  // Kerala & Goa
  { name: 'Thiruvananthapuram', stateCode: 'KL', coords: [76.9366, 8.5241], isCapital: true, populationM: 1.2 },
  { name: 'Kochi', stateCode: 'KL', coords: [76.2673, 9.9312], isCapital: false, populationM: 2.1 },
  { name: 'Kozhikode', stateCode: 'KL', coords: [75.7804, 11.2588], isCapital: false, populationM: 2.0 },
  { name: 'Panaji', stateCode: 'GA', coords: [73.8278, 15.4909], isCapital: true, populationM: 0.15 },
  // North & Northeast
  { name: 'New Delhi', stateCode: 'DL', coords: [77.2090, 28.6139], isCapital: true, populationM: 20.5 },
  { name: 'Chandigarh', stateCode: 'CH', coords: [76.7794, 30.7333], isCapital: true, populationM: 1.2 },
  { name: 'Amritsar', stateCode: 'PB', coords: [74.8723, 31.6340], isCapital: false, populationM: 1.4 },
  { name: 'Ludhiana', stateCode: 'PB', coords: [75.8573, 30.9010], isCapital: false, populationM: 1.9 },
  { name: 'Gurugram', stateCode: 'HR', coords: [77.0266, 28.4595], isCapital: false, populationM: 1.5 },
  { name: 'Faridabad', stateCode: 'HR', coords: [77.3178, 28.4089], isCapital: false, populationM: 1.8 },
  { name: 'Dehradun', stateCode: 'UK', coords: [78.0322, 30.3165], isCapital: true, populationM: 0.9 },
  { name: 'Shimla', stateCode: 'HP', coords: [77.1734, 31.1048], isCapital: true, populationM: 0.2 },
  { name: 'Srinagar', stateCode: 'JK', coords: [74.7973, 34.0837], isCapital: true, populationM: 1.5 },
  { name: 'Jammu', stateCode: 'JK', coords: [74.8570, 32.7266], isCapital: false, populationM: 0.8 },
  { name: 'Leh', stateCode: 'LA', coords: [77.5771, 34.1526], isCapital: true, populationM: 0.05 },
  { name: 'Guwahati', stateCode: 'AS', coords: [91.7362, 26.1445], isCapital: false, populationM: 1.2 },
  { name: 'Dispur', stateCode: 'AS', coords: [91.7898, 26.1433], isCapital: true, populationM: 0.2 },
  { name: 'Shillong', stateCode: 'ML', coords: [91.8933, 25.5788], isCapital: true, populationM: 0.4 },
  { name: 'Imphal', stateCode: 'MN', coords: [93.9368, 24.8170], isCapital: true, populationM: 0.5 },
  { name: 'Agartala', stateCode: 'TR', coords: [91.2868, 23.8315], isCapital: true, populationM: 0.6 },
  { name: 'Aizawl', stateCode: 'MZ', coords: [92.7176, 23.7271], isCapital: true, populationM: 0.4 },
  { name: 'Kohima', stateCode: 'NL', coords: [94.1086, 25.6751], isCapital: true, populationM: 0.2 },
  { name: 'Gangtok', stateCode: 'SK', coords: [88.6138, 27.3314], isCapital: true, populationM: 0.15 },
  { name: 'Itanagar', stateCode: 'AR', coords: [93.6053, 27.0844], isCapital: true, populationM: 0.1 },
  { name: 'Port Blair', stateCode: 'AN', coords: [92.7265, 11.6234], isCapital: true, populationM: 0.15 },
  { name: 'Kavaratti', stateCode: 'LD', coords: [72.6369, 10.5669], isCapital: true, populationM: 0.02 },
  { name: 'Puducherry', stateCode: 'PY', coords: [79.8083, 11.9416], isCapital: true, populationM: 0.3 },
  { name: 'Daman', stateCode: 'DNHDD', coords: [72.8328, 20.3974], isCapital: true, populationM: 0.1 },
];

// Major Indian Railway Corridors for map rendering
export const RAILWAY_CORRIDORS: { fromCity: string; toCity: string; fromCoords: [number, number]; toCoords: [number, number] }[] = [
  { fromCity: 'Mumbai', toCity: 'Pune', fromCoords: [72.8777, 19.0760], toCoords: [73.8567, 18.5204] },
  { fromCity: 'Mumbai', toCity: 'Ahmedabad', fromCoords: [72.8777, 19.0760], toCoords: [72.5714, 23.0225] },
  { fromCity: 'Ahmedabad', toCity: 'Jaipur', fromCoords: [72.5714, 23.0225], toCoords: [75.7873, 26.9124] },
  { fromCity: 'Jaipur', toCity: 'New Delhi', fromCoords: [75.7873, 26.9124], toCoords: [77.2090, 28.6139] },
  { fromCity: 'New Delhi', toCity: 'Chandigarh', fromCoords: [77.2090, 28.6139], toCoords: [76.7794, 30.7333] },
  { fromCity: 'New Delhi', toCity: 'Lucknow', fromCoords: [77.2090, 28.6139], toCoords: [80.9462, 26.8467] },
  { fromCity: 'Lucknow', toCity: 'Patna', fromCoords: [80.9462, 26.8467], toCoords: [85.1376, 25.5941] },
  { fromCity: 'Patna', toCity: 'Kolkata', fromCoords: [85.1376, 25.5941], toCoords: [88.3639, 22.5726] },
  { fromCity: 'Kolkata', toCity: 'Bhubaneswar', fromCoords: [88.3639, 22.5726], toCoords: [85.8245, 20.2961] },
  { fromCity: 'Bhubaneswar', toCity: 'Chennai', fromCoords: [85.8245, 20.2961], toCoords: [80.2707, 13.0827] },
  { fromCity: 'Chennai', toCity: 'Bengaluru', fromCoords: [80.2707, 13.0827], toCoords: [77.5946, 12.9716] },
  { fromCity: 'Bengaluru', toCity: 'Hyderabad', fromCoords: [77.5946, 12.9716], toCoords: [78.4867, 17.3850] },
  { fromCity: 'Hyderabad', toCity: 'Nagpur', fromCoords: [78.4867, 17.3850], toCoords: [79.0882, 21.1458] },
  { fromCity: 'Nagpur', toCity: 'Bhopal', fromCoords: [79.0882, 21.1458], toCoords: [77.4126, 23.2599] },
  { fromCity: 'Bhopal', toCity: 'New Delhi', fromCoords: [77.4126, 23.2599], toCoords: [77.2090, 28.6139] },
  { fromCity: 'Chennai', toCity: 'Thiruvananthapuram', fromCoords: [80.2707, 13.0827], toCoords: [76.9366, 8.5241] },
];

// Major Indian Rivers for map rendering & riverfront validation (Dam / River Port)
export interface RiverPolyline {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export const INDIAN_RIVERS: RiverPolyline[] = [
  {
    id: 'ganga',
    name: 'Ganga',
    coordinates: [
      [78.60, 30.15], [78.16, 29.94], [78.85, 28.90], [80.33, 26.45],
      [81.84, 25.43], [82.97, 25.31], [83.98, 25.68], [85.14, 25.61],
      [86.97, 25.25], [87.92, 24.80], [88.10, 22.50], [88.15, 22.02], [88.25, 21.65],
    ],
  },
  {
    id: 'yamuna',
    name: 'Yamuna',
    coordinates: [
      [78.46, 31.01], [77.50, 30.20], [77.22, 28.61], [77.67, 27.49],
      [78.01, 27.18], [79.02, 26.75], [80.35, 25.90], [81.84, 25.43],
    ],
  },
  {
    id: 'brahmaputra',
    name: 'Brahmaputra',
    coordinates: [
      [95.30, 28.10], [94.91, 27.47], [93.75, 26.85], [92.80, 26.65],
      [91.73, 26.14], [90.65, 26.18], [89.97, 26.02], [89.70, 25.15], [90.45, 23.50],
    ],
  },
  {
    id: 'godavari',
    name: 'Godavari',
    coordinates: [
      [73.79, 19.99], [74.75, 19.80], [76.05, 19.35], [77.31, 19.15],
      [78.09, 18.67], [79.80, 18.75], [80.85, 17.65], [81.78, 17.00], [82.20, 16.50],
    ],
  },
  {
    id: 'krishna',
    name: 'Krishna',
    coordinates: [
      [73.66, 17.92], [74.57, 16.85], [75.90, 16.20], [77.35, 16.25],
      [78.55, 16.10], [80.05, 16.60], [80.64, 16.50], [80.90, 15.80],
    ],
  },
  {
    id: 'narmada',
    name: 'Narmada',
    coordinates: [
      [81.75, 22.67], [80.50, 22.85], [79.93, 23.18], [78.20, 22.80],
      [76.50, 22.25], [74.50, 21.95], [72.98, 21.70], [72.60, 21.60],
    ],
  },
  {
    id: 'tapi',
    name: 'Tapi',
    coordinates: [
      [78.25, 21.77], [76.50, 21.35], [75.30, 21.20], [73.80, 21.30],
      [72.83, 21.17], [72.70, 21.10],
    ],
  },
  {
    id: 'mahanadi',
    name: 'Mahanadi',
    coordinates: [
      [81.90, 20.30], [81.80, 21.15], [82.80, 21.40], [83.97, 21.46],
      [84.85, 20.80], [85.88, 20.46], [86.60, 20.30],
    ],
  },
  {
    id: 'kaveri',
    name: 'Kaveri',
    coordinates: [
      [75.49, 12.38], [76.69, 12.42], [77.70, 12.05], [78.15, 11.45],
      [78.69, 10.79], [79.50, 10.95], [79.85, 11.14],
    ],
  },
  {
    id: 'sutlej',
    name: 'Sutlej',
    coordinates: [
      [78.60, 31.50], [77.50, 31.30], [76.43, 31.41], [75.80, 30.90],
      [74.90, 31.10], [74.30, 31.10],
    ],
  },
];

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a[1] * Math.PI) / 180) *
      Math.cos((b[1] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Returns true if [lon, lat] is within maxKm of any navigable river segment.
 */
export function isPointNearRiver(coords: [number, number], maxKm = 65): boolean {
  for (const river of INDIAN_RIVERS) {
    for (let i = 0; i < river.coordinates.length - 1; i++) {
      const p1 = river.coordinates[i];
      const p2 = river.coordinates[i + 1];
      // Check endpoints and midpoint
      const mid: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
      if (
        haversineKm(coords, p1) <= maxKm ||
        haversineKm(coords, p2) <= maxKm ||
        haversineKm(coords, mid) <= maxKm
      ) {
        return true;
      }
    }
  }
  return false;
}
