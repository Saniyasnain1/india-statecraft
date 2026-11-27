import {
  BuildingCategory,
  BuildingDefinition,
  TrainType,
  TrainConfig,
  TaxPolicySettings,
} from '@india-statecraft/shared-types';

/**
 * India: Statecraft — Centralized Economic Configuration & Formulas
 * Universal Game Currency: USD ($)
 * Deterministic balance constants for strategy gameplay.
 */

export const DEFAULT_TAX_POLICY: TaxPolicySettings = {
  businessTaxRate: 0.18,       // 18% Corporate & industrial tax
  consumptionTaxRate: 0.12,    // 12% State Goods & Services Tax (SGST)
  propertyTaxRate: 0.05,       // 5% Stamp duty & land revenue
  stateExciseTaxRate: 0.22,    // 22% State excise duties
  vehicleTaxRate: 0.08,        // 8% Motor vehicle registration duties
  electricityDutyRate: 0.06,   // 6% Energy consumption tariffs
};

export const BUILDING_DEFINITIONS: Record<BuildingCategory, BuildingDefinition> = {
  FACTORY: {
    type: 'FACTORY',
    name: 'Industrial Manufacturing Hub',
    description: 'High-throughput manufacturing plant producing durable goods, electronics, and automotive parts.',
    constructionCostUSD: 25_000_000, // $25M
    constructionTimeTicks: 4,        // 4 months
    monthlyOperatingExpenseUSD: 350_000,
    requiredPowerMW: 15,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_800_000, // $1.8M/mo value added
    employmentProvided: 1_200,
    happinessBonus: 0,
  },
  FARM: {
    type: 'FARM',
    name: 'High-Yield Agri Complex',
    description: 'Precision agriculture and mechanized foodgrain farm with modern drip irrigation.',
    constructionCostUSD: 12_000_000, // $12M
    constructionTimeTicks: 3,        // 3 months
    monthlyOperatingExpenseUSD: 120_000,
    requiredPowerMW: 4,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 850_000,
    employmentProvided: 850,
    happinessBonus: 1,
  },
  POWER_PLANT: {
    type: 'POWER_PLANT',
    name: 'Solar Mega Park (300 MW)',
    description: 'Utility-scale photovoltaic generation facility providing clean, stable base-load electricity.',
    constructionCostUSD: 55_000_000, // $55M
    constructionTimeTicks: 6,
    monthlyOperatingExpenseUSD: 220_000,
    requiredPowerMW: 0,
    requiredWater: false,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_200_000,
    employmentProvided: 180,
    happinessBonus: 2,
  },
  MINE: {
    type: 'MINE',
    name: 'Deep Mineral Extraction Site',
    description: 'Bauxite, iron ore, and strategic mineral mining complex supplying domestic factories.',
    constructionCostUSD: 60_000_000, // $60M
    constructionTimeTicks: 8,
    monthlyOperatingExpenseUSD: 750_000,
    requiredPowerMW: 25,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 3_600_000,
    employmentProvided: 2_400,
    happinessBonus: -1,
  },
  UNIVERSITY: {
    type: 'UNIVERSITY',
    name: 'State Technical University & IIT',
    description: 'Premier tertiary engineering and management institution fostering innovation and tech startups.',
    constructionCostUSD: 45_000_000, // $45M
    constructionTimeTicks: 10,
    monthlyOperatingExpenseUSD: 850_000,
    requiredPowerMW: 8,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_100_000,
    employmentProvided: 650,
    happinessBonus: 4,
  },
  RESEARCH_CENTER: {
    type: 'RESEARCH_CENTER',
    name: 'Biotech & AI Research Lab',
    description: 'High-tech incubation laboratory developing pharmaceuticals, defense tech, and robotics patents.',
    constructionCostUSD: 40_000_000,
    constructionTimeTicks: 6,
    monthlyOperatingExpenseUSD: 950_000,
    requiredPowerMW: 12,
    requiredWater: false,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_900_000,
    employmentProvided: 400,
    happinessBonus: 2,
  },
  HOSPITAL: {
    type: 'HOSPITAL',
    name: 'Multi-Specialty Medical Institute',
    description: 'Advanced super-specialty hospital providing comprehensive diagnostics, intensive care, and surgery.',
    constructionCostUSD: 35_000_000,
    constructionTimeTicks: 6,
    monthlyOperatingExpenseUSD: 680_000,
    requiredPowerMW: 6,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 650_000,
    employmentProvided: 750,
    happinessBonus: 6,
  },
  SCHOOL: {
    type: 'SCHOOL',
    name: 'District Model School Network',
    description: 'Modern primary and secondary school campus improving statewide literacy and youth opportunities.',
    constructionCostUSD: 10_000_000,
    constructionTimeTicks: 3,
    monthlyOperatingExpenseUSD: 280_000,
    requiredPowerMW: 3,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 320_000,
    employmentProvided: 320,
    happinessBonus: 4,
  },
  RAILWAY_DEPOT: {
    type: 'RAILWAY_DEPOT',
    name: 'Intermodal Freight Terminal',
    description: 'Container transfer hub connecting industrial corridors with regional and interstate railway networks.',
    constructionCostUSD: 30_000_000,
    constructionTimeTicks: 5,
    monthlyOperatingExpenseUSD: 420_000,
    requiredPowerMW: 10,
    requiredWater: false,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 2_100_000,
    employmentProvided: 900,
    happinessBonus: 1,
  },
  DAM: {
    type: 'DAM',
    name: 'Multi-Purpose Hydro Dam',
    description: 'River-spanning hydroelectric dam generating power, flood control, and large-scale canal irrigation.',
    constructionCostUSD: 140_000_000, // $140M
    constructionTimeTicks: 16,
    monthlyOperatingExpenseUSD: 480_000,
    requiredPowerMW: 0,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: true, // Geographic suitability requirement
    monthlyGdpValueAddedUSD: 2_800_000,
    employmentProvided: 800,
    happinessBonus: 3,
  },
  SEAPORT: {
    type: 'SEAPORT',
    name: 'Deepwater Container Port',
    description: 'International maritime container terminal handling foreign trade and interstate coastal shipping.',
    constructionCostUSD: 180_000_000, // $180M
    constructionTimeTicks: 20,
    monthlyOperatingExpenseUSD: 1_400_000,
    requiredPowerMW: 30,
    requiredWater: false,
    requiresCoastal: true, // Geographic suitability requirement
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 7_500_000,
    employmentProvided: 3_200,
    happinessBonus: 2,
  },
  RESIDENTIAL: {
    type: 'RESIDENTIAL',
    name: 'Integrated Urban Township',
    description: 'Planned residential community with clean drinking water, public transit, and civic infrastructure.',
    constructionCostUSD: 50_000_000,
    constructionTimeTicks: 8,
    monthlyOperatingExpenseUSD: 500_000,
    requiredPowerMW: 20,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_200_000,
    employmentProvided: 500,
    happinessBonus: 5,
  },
};

// ----------------- TRAIN CONFIGURATIONS & PRICING -----------------
export const TRAIN_CONFIGS: Record<TrainType, TrainConfig> = {
  FREIGHT_HEAVY: {
    type: 'FREIGHT_HEAVY',
    name: 'Heavy Freight Rake (Coal & Minerals)',
    purchaseCostUSD: 4_500_000, // $4.5M per train
    operatingCostPer100KmUSD: 190,
    maintenanceCostPerMonthUSD: 28_000,
    cargoCapacityUnits: 4_500,
    passengerCapacity: 0,
    speedKmH: 75,
    revenuePerCargoUnitPer100KmUSD: 0.12,
    revenuePerPassengerPer100KmUSD: 0,
  },
  FREIGHT_CONTAINER: {
    type: 'FREIGHT_CONTAINER',
    name: 'Container Freight Express (Manufactured Goods)',
    purchaseCostUSD: 3_800_000,
    operatingCostPer100KmUSD: 150,
    maintenanceCostPerMonthUSD: 22_000,
    cargoCapacityUnits: 3_000,
    passengerCapacity: 0,
    speedKmH: 95,
    revenuePerCargoUnitPer100KmUSD: 0.16,
    revenuePerPassengerPer100KmUSD: 0,
  },
  PASSENGER_EXPRESS: {
    type: 'PASSENGER_EXPRESS',
    name: 'Intercity Superfast Express (Vande Bharat / Rajdhani)',
    purchaseCostUSD: 6_000_000,
    operatingCostPer100KmUSD: 260,
    maintenanceCostPerMonthUSD: 35_000,
    cargoCapacityUnits: 200,
    passengerCapacity: 1_100,
    speedKmH: 130,
    revenuePerCargoUnitPer100KmUSD: 0.20,
    revenuePerPassengerPer100KmUSD: 0.35,
  },
  PASSENGER_REGIONAL: {
    type: 'PASSENGER_REGIONAL',
    name: 'State Regional Commuter (MEMU / Passenger)',
    purchaseCostUSD: 2_800_000,
    operatingCostPer100KmUSD: 130,
    maintenanceCostPerMonthUSD: 18_000,
    cargoCapacityUnits: 0,
    passengerCapacity: 850,
    speedKmH: 80,
    revenuePerCargoUnitPer100KmUSD: 0,
    revenuePerPassengerPer100KmUSD: 0.22,
  },
};

/**
 * Transparent Transport Calculation Formula:
 * Revenue = (Cargo * CargoPrice + Passengers * PassengerPrice) * Trips
 * OperatingCost = (Distance / 100) * CostPer100Km * Trips
 * Profit = Revenue - OperatingCost - MaintenanceCost
 */
export function calculateTrainEconomics(
  distanceKm: number,
  trainType: TrainType,
  activeTrainsCount: number
): {
  monthlyRevenueUSD: number;
  monthlyOperatingCostUSD: number;
  monthlyMaintenanceCostUSD: number;
  monthlyProfitUSD: number;
  monthlyCargoUnits: number;
  monthlyPassengers: number;
  tripsPerMonth: number;
} {
  const config = TRAIN_CONFIGS[trainType];
  if (!config || activeTrainsCount <= 0 || distanceKm <= 0) {
    return {
      monthlyRevenueUSD: 0,
      monthlyOperatingCostUSD: 0,
      monthlyMaintenanceCostUSD: 0,
      monthlyProfitUSD: 0,
      monthlyCargoUnits: 0,
      monthlyPassengers: 0,
      tripsPerMonth: 0,
    };
  }

  // Each active train operates ~360 effective operational transit hours per month
  const oneWayTravelHours = Math.max(1, distanceKm / config.speedKmH);
  // Round trip with turnaround buffer (2 hours loading/unloading)
  const roundTripHours = oneWayTravelHours * 2 + 2;
  const tripsPerTrainPerMonth = Math.max(1, Math.floor(360 / roundTripHours));
  const totalTrips = tripsPerTrainPerMonth * activeTrainsCount;

  // Cargo & Passenger throughput (assuming ~85% average load factor)
  const loadFactor = 0.85;
  const cargoPerTrip = Math.round(config.cargoCapacityUnits * loadFactor);
  const passengersPerTrip = Math.round(config.passengerCapacity * loadFactor);

  const totalMonthlyCargo = cargoPerTrip * totalTrips;
  const totalMonthlyPassengers = passengersPerTrip * totalTrips;

  // Revenue calculation
  const cargoRevenue =
    totalMonthlyCargo * (distanceKm / 100) * config.revenuePerCargoUnitPer100KmUSD;
  const passengerRevenue =
    totalMonthlyPassengers * (distanceKm / 100) * config.revenuePerPassengerPer100KmUSD;
  const monthlyRevenue = Math.round(cargoRevenue + passengerRevenue);

  // Operating costs: fuel/electricity + crew per 100 km
  const monthlyOperatingCost = Math.round(
    totalTrips * (distanceKm / 100) * config.operatingCostPer100KmUSD * 2 // round trip distance
  );

  // Fixed monthly maintenance
  const monthlyMaintenanceCost = config.maintenanceCostPerMonthUSD * activeTrainsCount;

  const monthlyProfit = monthlyRevenue - monthlyOperatingCost - monthlyMaintenanceCost;

  return {
    monthlyRevenueUSD: monthlyRevenue,
    monthlyOperatingCostUSD: monthlyOperatingCost,
    monthlyMaintenanceCostUSD: monthlyMaintenanceCost,
    monthlyProfitUSD: monthlyProfit,
    monthlyCargoUnits: totalMonthlyCargo,
    monthlyPassengers: totalMonthlyPassengers,
    tripsPerMonth: totalTrips,
  };
}
