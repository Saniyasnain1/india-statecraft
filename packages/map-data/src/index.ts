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
  { name: 'Mumbai', stateCode: 'MH', coords: [72.8777, 19.0760], isCapital: true, populationM: 21.0 },
  { name: 'New Delhi', stateCode: 'DL', coords: [77.2090, 28.6139], isCapital: true, populationM: 20.5 },
  { name: 'Bengaluru', stateCode: 'KA', coords: [77.5946, 12.9716], isCapital: true, populationM: 13.2 },
  { name: 'Kolkata', stateCode: 'WB', coords: [88.3639, 22.5726], isCapital: true, populationM: 15.1 },
  { name: 'Chennai', stateCode: 'TN', coords: [80.2707, 13.0827], isCapital: true, populationM: 11.5 },
  { name: 'Hyderabad', stateCode: 'TS', coords: [78.4867, 17.3850], isCapital: true, populationM: 10.5 },
  { name: 'Ahmedabad', stateCode: 'GJ', coords: [72.5714, 23.0225], isCapital: false, populationM: 8.6 },
  { name: 'Pune', stateCode: 'MH', coords: [73.8567, 18.5204], isCapital: false, populationM: 7.2 },
  { name: 'Surat', stateCode: 'GJ', coords: [72.8311, 21.1702], isCapital: false, populationM: 6.8 },
  { name: 'Jaipur', stateCode: 'RJ', coords: [75.7873, 26.9124], isCapital: true, populationM: 4.1 },
  { name: 'Lucknow', stateCode: 'UP', coords: [80.9462, 26.8467], isCapital: true, populationM: 3.8 },
  { name: 'Bhopal', stateCode: 'MP', coords: [77.4126, 23.2599], isCapital: true, populationM: 2.5 },
  { name: 'Patna', stateCode: 'BR', coords: [85.1376, 25.5941], isCapital: true, populationM: 2.6 },
  { name: 'Chandigarh', stateCode: 'CH', coords: [76.7794, 30.7333], isCapital: true, populationM: 1.2 },
  { name: 'Bhubaneswar', stateCode: 'OD', coords: [85.8245, 20.2961], isCapital: true, populationM: 1.1 },
  { name: 'Thiruvananthapuram', stateCode: 'KL', coords: [76.9366, 8.5241], isCapital: true, populationM: 1.2 },
  { name: 'Guwahati', stateCode: 'AS', coords: [91.7362, 26.1445], isCapital: false, populationM: 1.2 },
  { name: 'Ranchi', stateCode: 'JH', coords: [85.3096, 23.3441], isCapital: true, populationM: 1.4 },
  { name: 'Raipur', stateCode: 'CG', coords: [81.6296, 21.2514], isCapital: true, populationM: 1.5 },
  { name: 'Dehradun', stateCode: 'UK', coords: [78.0322, 30.3165], isCapital: true, populationM: 0.9 },
  { name: 'Shimla', stateCode: 'HP', coords: [77.1734, 31.1048], isCapital: true, populationM: 0.2 },
  { name: 'Panaji', stateCode: 'GA', coords: [73.8278, 15.4909], isCapital: true, populationM: 0.15 },
  { name: 'Srinagar', stateCode: 'JK', coords: [74.7973, 34.0837], isCapital: true, populationM: 1.5 },
  { name: 'Leh', stateCode: 'LA', coords: [77.5771, 34.1526], isCapital: true, populationM: 0.05 },
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
