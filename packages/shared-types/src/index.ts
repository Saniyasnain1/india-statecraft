/**
 * India: Statecraft — Shared Type Definitions
 * Universal Game Currency: USD ($)
 */

export type IndianStateCode =
  | 'AP' | 'AR' | 'AS' | 'BR' | 'CG' | 'GA' | 'GJ' | 'HR'
  | 'HP' | 'JH' | 'KA' | 'KL' | 'MP' | 'MH' | 'MN' | 'ML'
  | 'MZ' | 'NL' | 'OD' | 'PB' | 'RJ' | 'SK' | 'TN' | 'TS'
  | 'TR' | 'UP' | 'UK' | 'WB';

export type UnionTerritoryCode =
  | 'AN' | 'CH' | 'DNHDD' | 'DL' | 'JK' | 'LA' | 'LD' | 'PY';

export type TerritoryCode = IndianStateCode | UnionTerritoryCode;

export type MapMode =
  | 'normal'
  | 'terrain'
  | 'economy'
  | 'population'
  | 'industry'
  | 'agriculture'
  | 'naturalResources'
  | 'infrastructure'
  | 'happiness'
  | 'research'
  | 'militaryContribution'
  | 'trade'
  | 'waterResources';

export type GameSpeed = 0 | 1 | 2 | 4 | 8;
export type GamePhase = 'WORLD_SELECT' | 'STATE_SELECT' | 'PLAYING';
export type ActiveTab = 'overview' | 'government' | 'economy' | 'industry' | 'transport' | 'research' | 'diplomacy' | 'elections';

export interface TaxPolicySettings {
  businessTaxRate: number;      // e.g. 0.18 (18%)
  consumptionTaxRate: number;   // SGST equivalent, e.g. 0.12 (12%)
  propertyTaxRate: number;      // e.g. 0.05 (5%)
  stateExciseTaxRate: number;   // e.g. 0.20 (20%)
  vehicleTaxRate: number;       // e.g. 0.08 (8%)
  electricityDutyRate: number;  // e.g. 0.06 (6%)
}

export interface BudgetBreakdownUSD {
  // Monthly Revenues ($ USD)
  businessTaxRevenueUSD: number;
  consumptionTaxRevenueUSD: number;
  propertyTaxRevenueUSD: number;
  exciseTaxRevenueUSD: number;
  vehicleTaxRevenueUSD: number;
  electricityTaxRevenueUSD: number;
  transportProfitsUSD: number;
  centralTransfersUSD: number;
  
  // Monthly Expenditures ($ USD)
  publicSalariesUSD: number;
  infrastructureMaintenanceUSD: number;
  welfareAndSubsidiesUSD: number;
  debtServicingUSD: number;
  publicInvestmentUSD: number;
}

export interface EconomyMetrics {
  treasuryUSD: number;
  gdpUSD: number;
  gdpGrowthRate: number; // e.g. 0.065 for 6.5% annual
  growthRateAnnual?: number;
  gdpPerCapitaUSD: number;
  monthlyRevenueUSD: number;
  monthlyExpenditureUSD: number;
  monthlySurplusUSD: number;
  debtUSD: number;
  inflationRate: number; // e.g. 0.045 for 4.5%
  taxPolicy: TaxPolicySettings;
  budget: BudgetBreakdownUSD;
}

export interface DemographicMetrics {
  population: number;
  urbanizationRate: number;
  literacyRate: number;
  laborForceSize: number;
  unemploymentRate: number;
  netMonthlyMigration: number;
  happinessIndex: number; // 0 to 100
}

export interface InfrastructureMetrics {
  highwayLengthKm: number;
  railwayLengthKm: number;
  powerCapacityMW: number;
  powerGridReliabilityIndex: number; // 0 to 100
  portType: 'COASTAL_PORT' | 'DRY_PORT_TRANSIT';
  airportCount: number;
  isCoastal?: boolean;
}

export interface WaterMetrics {
  groundwaterStressLevel: 'SAFE' | 'SEMI_CRITICAL' | 'CRITICAL' | 'OVER_EXPLOITED';
  annualRainfallMm: number;
  damCount: number;
  reservoirStoragePercent: number; // 0 to 100
  irrigationCoveragePercent: number; // 0 to 100
  downstreamDischargeCusecs: number;
  groundwaterStressRatio?: number;
  reservoirCapacityTmc?: number;
  storagePercent?: number;
  majorRivers?: string[];
}

export interface PoliticalMetrics {
  rulingPartyName: string;
  chiefMinisterName: string;
  governingApprovalPercent: number;
  monthsUntilNextElection: number;
  termsServed: number;
}

// ----------------- TRANSPORT & TRAINS -----------------
export type TrainType = 'FREIGHT_HEAVY' | 'FREIGHT_CONTAINER' | 'PASSENGER_EXPRESS' | 'PASSENGER_REGIONAL';

export interface TrainConfig {
  type: TrainType;
  name: string;
  purchaseCostUSD: number;
  operatingCostPer100KmUSD: number;
  maintenanceCostPerMonthUSD: number;
  cargoCapacityUnits: number;
  passengerCapacity: number;
  speedKmH: number;
  revenuePerCargoUnitPer100KmUSD: number;
  revenuePerPassengerPer100KmUSD: number;
}

export interface TrainRoute {
  id: string;
  name: string;
  trainType: TrainType;
  originState: TerritoryCode;
  destinationState: TerritoryCode;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  activeTrainsCount: number;
  isInterstate: boolean;
  cargoCarriedMonthlyUnits: number;
  passengersCarriedMonthly: number;
  monthlyRevenueUSD: number;
  monthlyOperatingCostUSD: number;
  monthlyMaintenanceCostUSD: number;
  monthlyProfitUSD: number;
}

// ----------------- BUILDINGS & DEVELOPMENT -----------------
export type BuildingCategory =
  | 'FACTORY'
  | 'FARM'
  | 'POWER_PLANT'
  | 'MINE'
  | 'UNIVERSITY'
  | 'RESEARCH_CENTER'
  | 'HOSPITAL'
  | 'SCHOOL'
  | 'RAILWAY_DEPOT'
  | 'DAM'
  | 'SEAPORT'
  | 'RESIDENTIAL';

export interface BuildingDefinition {
  type: BuildingCategory;
  name: string;
  description: string;
  constructionCostUSD: number;
  constructionTimeTicks: number; // in months
  monthlyOperatingExpenseUSD: number;
  requiredPowerMW: number;
  requiredWater: boolean;
  requiresCoastal: boolean;
  requiresRiver: boolean;
  monthlyGdpValueAddedUSD: number;
  employmentProvided: number;
  happinessBonus: number;
}

export interface StateBuildingInstance {
  id: string;
  type: BuildingCategory;
  isUnderConstruction: boolean;
  ticksRemaining: number;
  totalTicks: number;
  healthPercent: number;
}

// ----------------- FULL STATE PROFILE -----------------
export interface StateProfile {
  code: TerritoryCode;
  name: string;
  isUnionTerritory: boolean;
  isUT?: boolean;
  capital: string;
  majorCities: string[];
  areaSqKm: number;
  majorRivers: string[];
  neighboringStates: TerritoryCode[];
  
  economy: EconomyMetrics;
  demographics: DemographicMetrics;
  infrastructure: InfrastructureMetrics;
  water: WaterMetrics;
  politics: PoliticalMetrics;
  
  routes: TrainRoute[];
  buildings: StateBuildingInstance[];

  // Scores 0-100 for thematic map visualizations
  researchScore: number;
  defenseContribution: number;
  industryOutputIndex: number;
  agricultureOutputIndex: number;
  naturalResourcesIndex: number;
  tradeVolumeIndex: number;
}

// ----------------- GAME CLOCK & STATE -----------------
export interface GameSimulationClock {
  currentTick: number; // Cumulative daily ticks
  currentYear: number;
  currentMonth: number; // 1..12
  currentDay: number; // 1..30
  isPaused: boolean;
  speed: GameSpeed;
  tickRateMs: number;
  secondsPerYear1x: number; // Configurable game-time pacing (default 2160 = 36 min/yr)
}

export interface GameState {
  version: string;
  phase: GamePhase;
  selectedPlayerState: TerritoryCode;
  inspectedState: TerritoryCode;
  clock: GameSimulationClock;
  states: Record<TerritoryCode, StateProfile>;
  globalMarketPrices: {
    freightCargoUnitUSD: number;
    passengerKmUSD: number;
    powerMWhUSD: number;
    rawMaterialsUnitUSD: number;
  };
}

export type PlayerAction =
  | { type: 'SELECT_STATE_TO_PLAY'; stateCode: TerritoryCode }
  | { type: 'SET_INSPECTED_STATE'; stateCode: TerritoryCode }
  | { type: 'SET_GAME_PHASE'; phase: GamePhase }
  | { type: 'SET_GAME_SPEED'; speed: GameSpeed }
  | { type: 'SET_PACING_CONFIG'; secondsPerYear1x: number }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'UPDATE_TAX_POLICY'; stateCode: TerritoryCode; taxPolicy: TaxPolicySettings }
  | { type: 'PURCHASE_TRAIN_ROUTE'; stateCode: TerritoryCode; fromCity: string; toCity: string; trainType: TrainType; activeTrainsCount: number; distanceKm: number }
  | { type: 'COMMENCE_BUILDING_CONSTRUCTION'; stateCode: TerritoryCode; buildingType: BuildingCategory }
  | { type: 'REBALANCE_PUBLIC_BUDGET'; stateCode: TerritoryCode; publicInvestmentShare: number; welfareShare: number };
