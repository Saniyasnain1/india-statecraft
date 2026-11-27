/**
 * BharatFront: Economic World — Master Game Configuration & Balancing
 * Universal Game Currency: Gold
 * Focus: Economic competition, trade routes, logistics, diplomacy, infrastructure
 */

export interface BuildingCostConfig {
  city: number;
  factory: number;
  river_dock: number;
  port: number;
  airport: number;
}

export type BuildingType = 'city' | 'factory' | 'river_dock' | 'port' | 'airport';

export interface TerritorySizeLimits {
  maxCities: number;
  maxFactories: number;
}

export const BHARATFRONT_CONFIG = {
  GAME_TITLE: 'BharatFront: Economic World',
  CURRENCY_NAME: 'Gold',
  DEFAULT_STARTING_GOLD: 750_000,
  
  // Base construction costs (within prompt ranges)
  BASE_COSTS: {
    city: 600_000,        // 500K–1M
    factory: 700_000,     // 500K–900K
    river_dock: 350_000,  // 250K–500K
    port: 850_000,        // 750K–1M
    airport: 900_000,     // 750K–1M
  } as BuildingCostConfig,

  COST_GROWTH_FACTOR: 1.6,
  MAX_BUILDING_COST_CAP: 10_000_000,
  MAX_BUILDING_LEVEL: 10,
  UPGRADE_BONUS_PER_LEVEL: 0.25, // +25% per level above Level 1

  POPULATION_PER_CITY_LEVEL: 250_000,

  // Trade Payout Tiers (Exact prompt specifications)
  TRADE_BASE_PAYOUTS: {
    OWN_STATION: 10_000,
    NEUTRAL_OTHER: 25_000,
    TRADE_PACT_RAIL_RIVER: 40_000,
    TRADE_PACT_SEA: 55_000,
    EMBARGOED: 0,
  },

  // Landlocked State Chartered Sea Boat Transit Fee (Exact prompt specification)
  LANDLOCKED_PORT_TRANSIT_FEE: 12_000,

  // Territory Density Caps (Exact prompt specifications)
  TERRITORY_LIMITS: {
    small_ut: { maxCities: 2, maxFactories: 2 } as TerritorySizeLimits,
    medium_state: { maxCities: 4, maxFactories: 4 } as TerritorySizeLimits,
    large_state: { maxCities: 6, maxFactories: 5 } as TerritorySizeLimits,
  },

  // Train spawn tuning constant k
  TRAIN_SPAWN_K: 1.25,
};

/**
 * Progressive Construction Cost:
 * cost = min(baseCost * 1.6^ownedCount, 10,000,000)
 */
export function calculateBuildingCost(buildingType: BuildingType, ownedCount: number): number {
  const base = BHARATFRONT_CONFIG.BASE_COSTS[buildingType] || 500_000;
  const cost = base * Math.pow(BHARATFRONT_CONFIG.COST_GROWTH_FACTOR, ownedCount);
  return Math.min(Math.round(cost), BHARATFRONT_CONFIG.MAX_BUILDING_COST_CAP);
}

/**
 * Progressive Upgrade Cost:
 * cost = min(baseCost * 0.75 * 1.35^currentLevel, 10,000,000)
 */
export function calculateUpgradeCost(buildingType: BuildingType, currentLevel: number): number {
  if (currentLevel >= BHARATFRONT_CONFIG.MAX_BUILDING_LEVEL) return Infinity;
  const base = BHARATFRONT_CONFIG.BASE_COSTS[buildingType] || 500_000;
  const cost = base * 0.75 * Math.pow(1.35, currentLevel);
  return Math.min(Math.round(cost), BHARATFRONT_CONFIG.MAX_BUILDING_COST_CAP);
}

/**
 * Building performance & payout multiplier by level:
 * Level 1: 1.00x, Level 2: 1.25x, Level 3: 1.50x ... Level 10: 3.25x
 */
export function getBuildingLevelMultiplier(level: number): number {
  return 1.0 + Math.max(0, level - 1) * BHARATFRONT_CONFIG.UPGRADE_BONUS_PER_LEVEL;
}

/**
 * Train Spawn Chance:
 * chance = level / ((totalOwnerFactories + 8) * k)
 */
export function calculateTrainSpawnChance(level: number, totalOwnerFactories: number, k: number = BHARATFRONT_CONFIG.TRAIN_SPAWN_K): number {
  return level / ((totalOwnerFactories + 8) * k);
}

/**
 * Economy Allocation Worker Output:
 * industrial output ∝ workers^0.78
 */
export function calculateIndustrialOutput(workers: number, efficiencyMultiplier: number = 1.0): number {
  if (workers <= 0) return 0;
  return Math.pow(workers, 0.78) * efficiencyMultiplier;
}

/**
 * Format Gold Currency cleanly with K, M, B
 */
export function formatGold(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(2)}B Gold`;
  }
  if (abs >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M Gold`;
  }
  if (abs >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K Gold`;
  }
  return `${Math.round(val).toLocaleString()} Gold`;
}

/**
 * Ten Major Indian Navigable Rivers [longitude, latitude] polylines
 */
export const INDIAN_RIVER_POLYLINES: Record<string, { name: string; coordinates: [number, number][] }> = {
  ganga: {
    name: 'Ganga River',
    coordinates: [
      [78.60, 30.15], [78.16, 29.94], [78.85, 28.90], [80.33, 26.45],
      [81.84, 25.43], [82.97, 25.31], [83.98, 25.68], [85.14, 25.61],
      [86.97, 25.25], [87.92, 24.80], [88.10, 22.50], [88.15, 22.02],
      [88.25, 21.65]
    ]
  },
  yamuna: {
    name: 'Yamuna River',
    coordinates: [
      [78.46, 31.01], [77.50, 30.20], [77.22, 28.61], [77.67, 27.49],
      [78.01, 27.18], [79.02, 26.75], [80.35, 25.90], [81.84, 25.43] // joins Ganga at Prayagraj
    ]
  },
  brahmaputra: {
    name: 'Brahmaputra River',
    coordinates: [
      [95.30, 28.10], [94.91, 27.47], [93.75, 26.85], [92.80, 26.65],
      [91.73, 26.14], [90.65, 26.18], [89.97, 26.02], [89.70, 25.15],
      [90.45, 23.50], [90.50, 22.20]
    ]
  },
  godavari: {
    name: 'Godavari River',
    coordinates: [
      [73.79, 19.99], [74.75, 19.80], [76.05, 19.35], [77.31, 19.15],
      [78.09, 18.67], [79.80, 18.75], [80.85, 17.65], [81.78, 17.00],
      [82.20, 16.50]
    ]
  },
  krishna: {
    name: 'Krishna River',
    coordinates: [
      [73.66, 17.92], [74.57, 16.85], [75.90, 16.20], [77.35, 16.25],
      [78.55, 16.10], [80.05, 16.60], [80.64, 16.50], [80.90, 15.80]
    ]
  },
  narmada: {
    name: 'Narmada River',
    coordinates: [
      [81.75, 22.67], [80.50, 22.85], [79.93, 23.18], [78.20, 22.80],
      [76.50, 22.25], [74.50, 21.95], [72.98, 21.70], [72.60, 21.60]
    ]
  },
  tapi: {
    name: 'Tapi River',
    coordinates: [
      [78.25, 21.77], [76.50, 21.35], [75.30, 21.20], [73.80, 21.30],
      [72.83, 21.17], [72.70, 21.10]
    ]
  },
  mahanadi: {
    name: 'Mahanadi River',
    coordinates: [
      [81.90, 20.30], [81.80, 21.15], [82.80, 21.40], [83.97, 21.46],
      [84.85, 20.80], [85.88, 20.46], [86.60, 20.30]
    ]
  },
  kaveri: {
    name: 'Kaveri River',
    coordinates: [
      [75.49, 12.38], [76.69, 12.42], [77.70, 12.05], [78.15, 11.45],
      [78.69, 10.79], [79.50, 10.95], [79.85, 11.14]
    ]
  },
  sutlej: {
    name: 'Sutlej River',
    coordinates: [
      [78.60, 31.50], [77.50, 31.30], [76.43, 31.41], [75.80, 30.90],
      [74.90, 31.10], [74.30, 31.10]
    ]
  }
};

/**
 * Global Ocean Waypoint Network for Cargo Ships
 */
export const GLOBAL_OCEAN_WAYPOINTS: Record<string, [number, number]> = {
  // Indian Coastal Ports
  mumbai_port: [72.85, 18.95],
  kandla_port: [70.22, 23.00],
  kochi_port: [76.27, 9.97],
  chennai_port: [80.30, 13.08],
  vizag_port: [83.30, 17.70],
  kolkata_port: [88.10, 22.02],

  // Sea Waypoints (Navigable water coordinates)
  arabian_sea_mid: [68.0, 16.5],
  bay_of_bengal_mid: [88.0, 14.0],
  gulf_of_aden: [48.0, 12.5],
  strait_of_hormuz: [56.3, 26.3],
  dubai_port: [55.27, 25.20],
  bab_el_mandeb: [43.4, 12.6],
  red_sea_mid: [38.0, 20.0],
  suez_canal: [32.5, 29.9],
  mediterranean_east: [32.0, 32.5],
  mediterranean_mid: [18.0, 35.0],
  strait_of_gibraltar: [-5.6, 35.9],
  north_atlantic_off_spain: [-9.5, 42.0],
  english_channel: [0.0, 50.5],
  london_port: [0.12, 51.50],
  rotterdam_port: [4.48, 51.92],
  transatlantic_mid: [-40.0, 40.0],
  new_york_port: [-74.00, 40.71],
  strait_of_malacca: [98.0, 4.0],
  singapore_port: [103.82, 1.35],
  south_china_sea: [112.0, 14.0],
  shanghai_port: [121.50, 31.23],
  tokyo_port: [139.75, 35.68],
  indian_ocean_south: [65.0, -10.0],
  cape_of_good_hope: [18.5, -34.4],
  sydney_port: [151.21, -33.87],
};

/**
 * Curated Pool of Real English City Names for Indian States & World Powers
 */
export const ENGLISH_CITY_NAME_POOLS: Record<string, string[]> = {
  // Indian States & UTs
  MH: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'],
  GJ: ['Gandhinagar', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Kandla'],
  KA: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Ballari', 'Shivamogga'],
  TN: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore'],
  UP: ['Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Noida', 'Bareilly', 'Aligarh'],
  DL: ['New Delhi', 'Delhi Central', 'Dwarka', 'Rohini', 'Connaught Place', 'Saket', 'Okhla'],
  PB: ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
  HR: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Hisar', 'Karnal', 'Panchkula', 'Rohtak'],
  CH: ['Chandigarh', 'Manimajra', 'Sector 17 Hub'],
  WB: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Haldia', 'Kharagpur'],
  AP: ['Amaravati', 'Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kakinada', 'Nellore'],
  TS: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'],
  KL: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad'],
  RJ: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar'],
  MP: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas'],
  BR: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif'],
  OD: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Paradip'],
  JH: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'],
  AS: ['Dispur', 'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia'],
  UK: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Rudrapur'],
  HP: ['Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Baddi'],
  JK: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
  LA: ['Leh', 'Kargil', 'Diskit'],
  GA: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  CG: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
  TR: ['Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar'],
  ML: ['Shillong', 'Tura', 'Jowai', 'Nongpoh'],
  MN: ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
  NL: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
  MZ: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
  SK: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
  AR: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  AN: ['Port Blair', 'Diglipur', 'Mayabunder'],
  LD: ['Kavaratti', 'Agatti', 'Andrott'],
  PY: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  DNHDD: ['Daman', 'Diu', 'Silvassa'],

  // World Powers
  USA: ['Washington', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco', 'Seattle'],
  CHN: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Wuhan', 'Tianjin'],
  JPN: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Kyoto', 'Kobe', 'Fukuoka'],
  DEU: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Dusseldorf'],
  GBR: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh', 'Glasgow'],
  FRA: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Bordeaux'],
  ARE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  SGP: ['Singapore Central', 'Jurong', 'Changi'],
  NLD: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
  AUS: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  RUS: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Vladivostok'],
  EGY: ['Cairo', 'Alexandria', 'Giza', 'Port Said'],
  BRA: ['Brasilia', 'Sao Paulo', 'Rio de Janeiro', 'Salvador'],
  ZAF: ['Pretoria', 'Johannesburg', 'Cape Town', 'Durban'],
  KOR: ['Seoul', 'Busan', 'Incheon', 'Daegu'],
  SAU: ['Riyadh', 'Jeddah', 'Dammam', 'Mecca'],
};
