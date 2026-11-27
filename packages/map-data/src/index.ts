import { MapMode, StateProfile, TerritoryCode } from '@india-statecraft/shared-types';

export interface MapModeConfig {
  id: MapMode;
  label: string;
  description: string;
  unit: string;
  minVal: number;
  maxVal: number;
  colorStops: [number, string][]; // [normalized 0..1, hex color]
  getValue: (state: StateProfile) => number;
  formatValue: (val: number) => string;
}

export const MAP_MODES: Record<MapMode, MapModeConfig> = {
  terrain: {
    id: 'terrain',
    label: 'Terrain',
    description: 'Physical geography, river basins, mountain ranges, and natural biomes.',
    unit: 'Topography',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#d4e6b5'], // Plains
      [0.3, '#88b04b'], // Forest
      [0.6, '#bcaaa4'], // Plateaus / Hills
      [0.85, '#8d6e63'], // High mountains
      [1.0, '#ffffff'], // Snow / Glaciers
    ],
    getValue: () => 50,
    formatValue: () => 'Physical Topography',
  },
  economy: {
    id: 'economy',
    label: 'Economy (GSDP)',
    description: 'Gross State Domestic Product in Crore INR (Value Added).',
    unit: '₹ Cr',
    minVal: 10000,
    maxVal: 4000000,
    colorStops: [
      [0.0, '#e8f5e9'],
      [0.2, '#a5d6a7'],
      [0.5, '#4caf50'],
      [0.8, '#2e7d32'],
      [1.0, '#1b5e20'],
    ],
    getValue: (s) => s.economy.gsdpNominalCrore,
    formatValue: (v) => `₹${(v / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k Cr`,
  },
  population: {
    id: 'population',
    label: 'Population',
    description: 'Total population residing within state borders.',
    unit: 'People',
    minVal: 500000,
    maxVal: 250000000,
    colorStops: [
      [0.0, '#fff9c4'],
      [0.25, '#ffe082'],
      [0.5, '#ffb74d'],
      [0.75, '#ff7043'],
      [1.0, '#b71c1c'],
    ],
    getValue: (s) => s.demographics.population,
    formatValue: (v) => `${(v / 1000000).toFixed(1)}M`,
  },
  industry: {
    id: 'industry',
    label: 'Industry',
    description: 'Manufacturing capacity, industrial clusters, and SEZ density.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#eceff1'],
      [0.3, '#b0bec5'],
      [0.6, '#ff9800'],
      [0.85, '#f57c00'],
      [1.0, '#e65100'],
    ],
    getValue: (s) => s.industryOutputIndex,
    formatValue: (v) => `${v}/100`,
  },
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture',
    description: 'Agricultural output, foodgrain yield, and irrigated cropland.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#fffde7'],
      [0.3, '#dce775'],
      [0.6, '#9ccc65'],
      [0.85, '#689f38'],
      [1.0, '#33691e'],
    ],
    getValue: (s) => s.agricultureOutputIndex,
    formatValue: (v) => `${v}/100`,
  },
  naturalResources: {
    id: 'naturalResources',
    label: 'Natural Resources',
    description: 'Mineral deposits (coal, iron, bauxite) and renewable potential.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#efebe9'],
      [0.3, '#bcaaa4'],
      [0.6, '#8d6e63'],
      [0.85, '#ff8f00'],
      [1.0, '#bf360c'],
    ],
    getValue: (s) => s.naturalResourcesIndex,
    formatValue: (v) => `${v}/100`,
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'Highway density, grid reliability, and transit logistics connectivity.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#e0f7fa'],
      [0.3, '#80deea'],
      [0.6, '#26c6da'],
      [0.85, '#0097a7'],
      [1.0, '#006064'],
    ],
    getValue: (s) => s.infrastructure.powerGridReliabilityIndex,
    formatValue: (v) => `${v}/100`,
  },
  happiness: {
    id: 'happiness',
    label: 'Happiness & HDI',
    description: 'Quality of life, public health, literacy, and citizen satisfaction.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#fce4ec'],
      [0.3, '#f48fb1'],
      [0.6, '#ec407a'],
      [0.85, '#26a69a'],
      [1.0, '#004d40'],
    ],
    getValue: (s) => s.demographics.happinessIndex,
    formatValue: (v) => `${v}/100`,
  },
  research: {
    id: 'research',
    label: 'Research & Tech',
    description: 'Academic institutions, patent filings, and technology incubators.',
    unit: 'Score (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#ede7f6'],
      [0.3, '#b39ddb'],
      [0.6, '#7e57c2'],
      [0.85, '#512da8'],
      [1.0, '#311b92'],
    ],
    getValue: (s) => s.researchScore,
    formatValue: (v) => `${v}/100`,
  },
  militaryContribution: {
    id: 'militaryContribution',
    label: 'Defense Contribution',
    description: 'Armed forces recruitment, defense corridors, and strategic infrastructure.',
    unit: 'Score (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#f1f8e9'],
      [0.3, '#c5e1a5'],
      [0.6, '#7cb342'],
      [0.85, '#455a64'],
      [1.0, '#263238'],
    ],
    getValue: (s) => s.defenseContribution,
    formatValue: (v) => `${v}/100`,
  },
  trade: {
    id: 'trade',
    label: 'Trade Volume',
    description: 'Inter-state commerce, freight transit, and export throughput.',
    unit: 'Index (0-100)',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#e3f2fd'],
      [0.3, '#90caf9'],
      [0.6, '#42a5f5'],
      [0.85, '#1976d2'],
      [1.0, '#0d47a1'],
    ],
    getValue: (s) => s.tradeVolumeIndex,
    formatValue: (v) => `${v}/100`,
  },
  waterResources: {
    id: 'waterResources',
    label: 'Water Resources',
    description: 'Reservoir storage capacity %, annual rainfall, and groundwater health.',
    unit: 'Reservoir %',
    minVal: 0,
    maxVal: 100,
    colorStops: [
      [0.0, '#ffe0b2'],
      [0.3, '#80deea'],
      [0.6, '#4dd0e1'],
      [0.85, '#00acc1'],
      [1.0, '#006064'],
    ],
    getValue: (s) => s.water.reservoirStoragePercent,
    formatValue: (v) => `${v}% Storage`,
  },
};

/**
 * Computes color interpolated for a given mode and value
 */
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

/**
 * Centroids for all Indian States & UTs for camera navigation and labeling
 */
export const STATE_CENTROIDS: Record<TerritoryCode, [number, number]> = {
  AP: [79.74, 15.91],
  AR: [94.72, 28.21],
  AS: [92.93, 26.20],
  BR: [85.31, 25.09],
  CG: [81.86, 21.27],
  GA: [74.12, 15.29],
  GJ: [71.19, 22.25],
  HR: [76.08, 29.05],
  HP: [77.17, 31.10],
  JH: [85.27, 23.61],
  KA: [75.71, 15.31],
  KL: [76.27, 10.85],
  MP: [78.65, 22.97],
  MH: [75.71, 19.75],
  MN: [93.90, 24.66],
  ML: [91.36, 25.46],
  MZ: [92.93, 23.16],
  NL: [94.56, 26.15],
  OD: [84.45, 20.95],
  PB: [75.34, 31.14],
  RJ: [74.21, 27.02],
  SK: [88.51, 27.53],
  TN: [78.65, 11.12],
  TS: [79.01, 18.11],
  TR: [91.98, 23.94],
  UP: [80.94, 26.84],
  UK: [79.01, 30.06],
  WB: [87.85, 22.98],
  // Union Territories
  AN: [92.65, 11.74],
  CH: [76.77, 30.73],
  DNHDD: [72.93, 20.42],
  DL: [77.10, 28.70],
  JK: [74.79, 34.08],
  LA: [77.57, 34.15],
  LD: [72.63, 10.56],
  PY: [79.80, 11.94],
};
