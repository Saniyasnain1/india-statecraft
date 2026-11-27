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

export const MAP_MODES: Record<MapMode, MapModeConfig> = {
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    description: 'Physical topography, river basins, mountain ranges, and natural biomes.',
    unit: 'Topography',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#3a506b'], // Coastal plains
      [0.3, '#2a9d8f'], // Forested plains
      [0.6, '#e9c46a'], // Deccan plateau
      [0.85, '#f4a261'], // Mountain ranges
      [1.0, '#e76f51'], // Himalayan peaks
    ],
    getValue: () => 50,
    formatValue: () => 'Physical Topography',
  },
  economy: {
    id: 'economy',
    label: 'GDP ($)',
    description: 'Gross State Domestic Product in USD (Value Added method).',
    unit: 'USD ($)',
    minVal: 1_000_000_000,
    maxVal: 450_000_000_000,
    colorStops: [
      [0.0, '#132a13'],
      [0.2, '#31572c'],
      [0.5, '#4f772d'],
      [0.8, '#90a955'],
      [1.0, '#ecf39e'],
    ],
    getValue: (s) => s.economy.gdpUSD,
    formatValue: (v) => formatUSD(v),
  },
  population: {
    id: 'population',
    label: 'Population',
    description: 'Total population residing within state borders.',
    unit: 'Citizens',
    minVal: 500_000,
    maxVal: 250_000_000,
    colorStops: [
      [0.0, '#3d0c02'],
      [0.25, '#780000'],
      [0.5, '#c1121f'],
      [0.75, '#fdf0d5'],
      [1.0, '#669bbc'],
    ],
    getValue: (s) => s.demographics.population,
    formatValue: (v) => `${(v / 1_000_000).toFixed(1)}M`,
  },
  industry: {
    id: 'industry',
    label: 'Industry',
    description: 'Manufacturing capacity, SEZ density, and factory output index.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#1b263b'],
      [0.3, '#415a77'],
      [0.6, '#778da9'],
      [0.85, '#e0a96d'],
      [1.0, '#fca311'],
    ],
    getValue: (s) => s.industryOutputIndex,
    formatValue: (v) => `${v}/100`,
  },
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture',
    description: 'Foodgrain yield, irrigated cropland %, and agricultural output.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#283618'],
      [0.3, '#606c38'],
      [0.6, '#dda15e'],
      [0.85, '#bc6c25'],
      [1.0, '#fefae0'],
    ],
    getValue: (s) => s.agricultureOutputIndex,
    formatValue: (v) => `${v}/100`,
  },
  naturalResources: {
    id: 'naturalResources',
    label: 'Resources',
    description: 'Mineral deposits (iron, bauxite, coal), solar, and wind potential.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#2b2d42'],
      [0.3, '#8d99ae'],
      [0.6, '#edf2f4'],
      [0.85, '#ef233c'],
      [1.0, '#d90429'],
    ],
    getValue: (s) => s.naturalResourcesIndex,
    formatValue: (v) => `${v}/100`,
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Power grid reliability, highway network, and railway transit density.',
    unit: 'Score (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#001219'],
      [0.3, '#005f73'],
      [0.6, '#0a9396'],
      [0.85, '#94d2bd'],
      [1.0, '#e9d8a6'],
    ],
    getValue: (s) => s.infrastructure.powerGridReliabilityIndex,
    formatValue: (v) => `${v}/100`,
  },
  happiness: {
    id: 'happiness',
    label: 'Happiness & HDI',
    description: 'Public health, literacy, employment rate, and citizen approval.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#582f0e'],
      [0.3, '#7f4f24'],
      [0.6, '#936639'],
      [0.85, '#a68a64'],
      [1.0, '#b6ad90'],
    ],
    getValue: (s) => s.demographics.happinessIndex,
    formatValue: (v) => `${v}/100`,
  },
  research: {
    id: 'research',
    label: 'Research & Tech',
    description: 'Academic universities, tech hubs, and patent filings.',
    unit: 'Score (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#10002b'],
      [0.3, '#3c096c'],
      [0.6, '#7b2cbf'],
      [0.85, '#9d4edd'],
      [1.0, '#e0aaff'],
    ],
    getValue: (s) => s.researchScore,
    formatValue: (v) => `${v}/100`,
  },
  militaryContribution: {
    id: 'militaryContribution',
    label: 'Defense Hub',
    description: 'Armed forces recruitment, defense manufacturing, and border logistics.',
    unit: 'Score (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#1f2421'],
      [0.3, '#216869'],
      [0.6, '#49a078'],
      [0.85, '#9cc5a1'],
      [1.0, '#dce1de'],
    ],
    getValue: (s) => s.defenseContribution,
    formatValue: (v) => `${v}/100`,
  },
  trade: {
    id: 'trade',
    label: 'Trade Volume',
    description: 'Interstate rail freight, seaport throughput, and export shipments.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#03045e'],
      [0.3, '#0077b6'],
      [0.6, '#00b4d8'],
      [0.85, '#90e0ef'],
      [1.0, '#caf0f8'],
    ],
    getValue: (s) => s.tradeVolumeIndex,
    formatValue: (v) => `${v}/100`,
  },
  waterResources: {
    id: 'waterResources',
    label: 'Water Security',
    description: 'Reservoir storage capacity %, river flow, and groundwater level.',
    unit: 'Storage %',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#d90429'], // Severe stress
      [0.3, '#f77f00'],
      [0.6, '#fcbf49'],
      [0.85, '#0077b6'],
      [1.0, '#00b4d8'], // Abundant water
    ],
    getValue: (s) => s.water.reservoirStoragePercent,
    formatValue: (v) => `${v}% Storage`,
  },
};

export function getMapColorForValue(mode: MapMode, val: number): string {
  const config = MAP_MODES[mode];
  if (!config) return '#888888';
  const norm = Math.max(0, Math.min(1, (val - config.minVal) / (config.maxVal - config.minVal)));
  const stops = config.colorStops;
  for (let i = 0; i < stops.length - 1; i++) {
    const [t1, c1] = stops[i];
    const [t2, c2] = stops[i + 1];
    if (norm >= t1 && norm <= t2) {
      return norm > (t1 + t2) / 2 ? c2 : c1;
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
