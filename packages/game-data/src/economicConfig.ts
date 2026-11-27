import {
  BuildingCategory,
  BuildingDefinition,
  TrainType,
  TrainConfig,
  TaxPolicySettings,
  GameSpeed,
} from '@india-statecraft/shared-types';

/**
 * India: Statecraft — Centralized Economic Configuration & Formulas
 * Universal Game Currency: USD ($)
 * Deterministic balance constants for realistic strategy gameplay.
 */

// ----------------- PACING & GAME CLOCK -----------------
// Target: approximately 30–45 minutes of real time per in-game year at 1× speed.
// Default: 36 minutes = 2,160 seconds per year = 180 seconds per month = 6.0 seconds per day.
export const DEFAULT_GAME_TIME_CONFIG = {
  secondsPerYear1x: 2160,
  daysPerMonth: 30,
  monthsPerYear: 12,
  daysPerYear: 360,
};

export function getTickRateFromSpeed(speed: GameSpeed, secondsPerYear1x: number = 2160): number {
  if (speed === 0) return 6000;
  const msPerDay1x = (secondsPerYear1x * 1000) / 360;
  return Math.max(50, Math.round(msPerDay1x / speed));
}

// ----------------- DEFAULT TAX POLICY -----------------
// Constitutional realism: NO state personal income tax.
export const DEFAULT_TAX_POLICY: TaxPolicySettings = {
  businessTaxRate: 0.18,       // 18% Corporate & industrial tax
  consumptionTaxRate: 0.12,    // 12% State Goods & Services Tax (SGST)
  propertyTaxRate: 0.05,       // 5% Stamp duty & land registration
  stateExciseTaxRate: 0.22,    // 22% State excise duties (spirits/fuel)
  vehicleTaxRate: 0.08,        // 8% Motor vehicle registration tariffs
  electricityDutyRate: 0.06,   // 6% Energy consumption tariffs
};

// ----------------- CAPITAL PROJECTS & BUILDINGS -----------------
export const BUILDING_DEFINITIONS: Record<BuildingCategory, BuildingDefinition> = {
  FACTORY: {
    type: 'FACTORY',
    name: 'Industrial Manufacturing Hub',
    description: 'High-throughput manufacturing plant producing automotive, electronics, and engineering exports.',
    constructionCostUSD: 25_000_000, // $25M
    constructionTimeTicks: 4,        // 4 months
    monthlyOperatingExpenseUSD: 180_000, // Public regulatory & logistics support
    requiredPowerMW: 25,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_200_000,
    employmentProvided: 1_400,
    happinessBonus: 0,
  },
  FARM: {
    type: 'FARM',
    name: 'Commercial Agri Complex',
    description: 'Mechanized foodgrain and cash-crop production with canal irrigation and cold-storage silos.',
    constructionCostUSD: 20_000_000, // $20M
    constructionTimeTicks: 6,
    monthlyOperatingExpenseUSD: 80_000,
    requiredPowerMW: 6,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 600_000,
    employmentProvided: 950,
    happinessBonus: 1,
  },
  POWER_PLANT: {
    type: 'POWER_PLANT',
    name: 'Solar Mega Park (400 MW)',
    description: 'Utility-scale solar generation providing clean grid power, reducing blackouts and industrial tariffs.',
    constructionCostUSD: 85_000_000, // $85M
    constructionTimeTicks: 12,
    monthlyOperatingExpenseUSD: 140_000,
    requiredPowerMW: 0,
    requiredWater: false,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 900_000,
    employmentProvided: 220,
    happinessBonus: 2,
  },
  MINE: {
    type: 'MINE',
    name: 'Strategic Mineral Mine',
    description: 'Iron ore, bauxite, and rare earth extraction feeding domestic heavy industry.',
    constructionCostUSD: 95_000_000, // $95M
    constructionTimeTicks: 14,
    monthlyOperatingExpenseUSD: 320_000,
    requiredPowerMW: 35,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 2_400_000,
    employmentProvided: 2_100,
    happinessBonus: -1,
  },
  UNIVERSITY: {
    type: 'UNIVERSITY',
    name: 'State Institute of Technology',
    description: 'Premier tertiary technical and engineering university driving innovation, patents, and tech startups.',
    constructionCostUSD: 65_000_000, // $65M
    constructionTimeTicks: 12,
    monthlyOperatingExpenseUSD: 450_000, // State-funded academic ops
    requiredPowerMW: 10,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 700_000,
    employmentProvided: 750,
    happinessBonus: 4,
  },
  RESEARCH_CENTER: {
    type: 'RESEARCH_CENTER',
    name: 'Biotech & Advanced R&D Lab',
    description: 'Applied laboratory advancing pharmaceutical development, semiconductor design, and aerospace.',
    constructionCostUSD: 55_000_000,
    constructionTimeTicks: 10,
    monthlyOperatingExpenseUSD: 380_000,
    requiredPowerMW: 12,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_100_000,
    employmentProvided: 480,
    happinessBonus: 2,
  },
  HOSPITAL: {
    type: 'HOSPITAL',
    name: 'District Medical Super-Specialty',
    description: 'Public healthcare facility equipped with intensive care, trauma surgery, and diagnostics.',
    constructionCostUSD: 40_000_000,
    constructionTimeTicks: 8,
    monthlyOperatingExpenseUSD: 520_000, // Public healthcare budget
    requiredPowerMW: 8,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 450_000,
    employmentProvided: 900,
    happinessBonus: 5,
  },
  SCHOOL: {
    type: 'SCHOOL',
    name: 'Network of Model Public Schools',
    description: 'Secondary educational network boosting literacy, digital skills, and vocational training.',
    constructionCostUSD: 18_000_000,
    constructionTimeTicks: 6,
    monthlyOperatingExpenseUSD: 280_000,
    requiredPowerMW: 4,
    requiredWater: false,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 250_000,
    employmentProvided: 600,
    happinessBonus: 4,
  },
  RAILWAY_DEPOT: {
    type: 'RAILWAY_DEPOT',
    name: 'Multi-Modal Logistics Freight Terminal',
    description: 'Marshalling yard and container freight transfer hub connecting factories with rail corridors.',
    constructionCostUSD: 50_000_000,
    constructionTimeTicks: 8,
    monthlyOperatingExpenseUSD: 260_000,
    requiredPowerMW: 15,
    requiredWater: false,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 1_400_000,
    employmentProvided: 1_100,
    happinessBonus: 1,
  },
  DAM: {
    type: 'DAM',
    name: 'Multi-Purpose Hydroelectric Dam',
    description: 'River dam providing clean hydroelectric power, reservoir flood buffers, and canal irrigation.',
    constructionCostUSD: 160_000_000, // $160M
    constructionTimeTicks: 24,        // 24 months
    monthlyOperatingExpenseUSD: 360_000,
    requiredPowerMW: 0,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: true, // Geographic constraint
    monthlyGdpValueAddedUSD: 2_100_000,
    employmentProvided: 850,
    happinessBonus: 3,
  },
  SEAPORT: {
    type: 'SEAPORT',
    name: 'Deepwater Maritime Container Port',
    description: 'Major international seaport handling containerized maritime cargo, coastal shipping, and customs.',
    constructionCostUSD: 220_000_000, // $220M
    constructionTimeTicks: 28,        // 28 months
    monthlyOperatingExpenseUSD: 850_000,
    requiredPowerMW: 40,
    requiredWater: false,
    requiresCoastal: true, // Geographic constraint
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 4_500_000,
    employmentProvided: 3_800,
    happinessBonus: 3,
  },
  RESIDENTIAL: {
    type: 'RESIDENTIAL',
    name: 'Smart Urban Township',
    description: 'High-density planned residential sector with public transit, clean tap water, and sanitation.',
    constructionCostUSD: 60_000_000,
    constructionTimeTicks: 10,
    monthlyOperatingExpenseUSD: 340_000,
    requiredPowerMW: 25,
    requiredWater: true,
    requiresCoastal: false,
    requiresRiver: false,
    monthlyGdpValueAddedUSD: 800_000,
    employmentProvided: 550,
    happinessBonus: 5,
  },
};

// ----------------- TRAIN CONFIGURATIONS & PRICING -----------------
export const TRAIN_CONFIGS: Record<TrainType, TrainConfig> = {
  FREIGHT_HEAVY: {
    type: 'FREIGHT_HEAVY',
    name: 'Heavy Freight Rake (Coal & Minerals)',
    purchaseCostUSD: 6_500_000, // $6.5M upfront capital
    operatingCostPer100KmUSD: 420,
    maintenanceCostPerMonthUSD: 45_000,
    cargoCapacityUnits: 4_500,
    passengerCapacity: 0,
    speedKmH: 70,
    revenuePerCargoUnitPer100KmUSD: 0.14,
    revenuePerPassengerPer100KmUSD: 0,
  },
  FREIGHT_CONTAINER: {
    type: 'FREIGHT_CONTAINER',
    name: 'Container Freight Express (Manufactured Goods)',
    purchaseCostUSD: 5_200_000,
    operatingCostPer100KmUSD: 340,
    maintenanceCostPerMonthUSD: 38_000,
    cargoCapacityUnits: 2_800,
    passengerCapacity: 0,
    speedKmH: 90,
    revenuePerCargoUnitPer100KmUSD: 0.18,
    revenuePerPassengerPer100KmUSD: 0,
  },
  PASSENGER_EXPRESS: {
    type: 'PASSENGER_EXPRESS',
    name: 'Intercity Superfast Express (Vande Bharat / Rajdhani)',
    purchaseCostUSD: 8_500_000,
    operatingCostPer100KmUSD: 520,
    maintenanceCostPerMonthUSD: 55_000,
    cargoCapacityUnits: 150,
    passengerCapacity: 1_100,
    speedKmH: 130,
    revenuePerCargoUnitPer100KmUSD: 0.22,
    revenuePerPassengerPer100KmUSD: 0.38,
  },
  PASSENGER_REGIONAL: {
    type: 'PASSENGER_REGIONAL',
    name: 'State Regional Commuter (MEMU / Passenger)',
    purchaseCostUSD: 3_800_000,
    operatingCostPer100KmUSD: 280,
    maintenanceCostPerMonthUSD: 28_000,
    cargoCapacityUnits: 0,
    passengerCapacity: 850,
    speedKmH: 80,
    revenuePerCargoUnitPer100KmUSD: 0,
    revenuePerPassengerPer100KmUSD: 0.24,
  },
};

/**
 * Transparent Transport Calculation Formula:
 * Revenue = (Cargo * CargoPrice + Passengers * PassengerPrice) * Trips * LoadFactor
 * OperatingCost = (Distance / 100) * CostPer100Km * Trips * 2 (round trip)
 * MaintenanceCost = MaintenanceCostPerMonth * ActiveTrains
 * Profit = Revenue - OperatingCost - MaintenanceCost
 */
export function calculateTrainEconomics(
  distanceKm: number,
  trainType: TrainType,
  activeTrainsCount: number,
  demandUtilization: number = 0.72 // 72% average realistic capacity utilization
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

  // Trains operate scheduled round trips with turnaround loading buffers
  const oneWayHours = Math.max(1, distanceKm / config.speedKmH);
  const roundTripHours = oneWayHours * 2 + 3; // +3 hours terminal turnaround
  const tripsPerTrainPerMonth = Math.max(1, Math.floor(320 / roundTripHours));
  const totalTrips = tripsPerTrainPerMonth * activeTrainsCount;

  // Realized throughput clamped by route demand
  const effectiveLoadFactor = Math.max(0.30, Math.min(0.95, demandUtilization));
  const cargoPerTrip = Math.round(config.cargoCapacityUnits * effectiveLoadFactor);
  const passengersPerTrip = Math.round(config.passengerCapacity * effectiveLoadFactor);

  const totalMonthlyCargo = cargoPerTrip * totalTrips;
  const totalMonthlyPassengers = passengersPerTrip * totalTrips;

  // Revenue
  const cargoRevenue =
    totalMonthlyCargo * (distanceKm / 100) * config.revenuePerCargoUnitPer100KmUSD;
  const passengerRevenue =
    totalMonthlyPassengers * (distanceKm / 100) * config.revenuePerPassengerPer100KmUSD;
  const monthlyRevenue = Math.round(cargoRevenue + passengerRevenue);

  // Operating costs: fuel/electricity + crew for round trips
  const monthlyOperatingCost = Math.round(
    totalTrips * (distanceKm / 100) * config.operatingCostPer100KmUSD * 2
  );

  // Maintenance
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
