/**
 * India: Statecraft — Shared Type Definitions
 */

export type IndianStateCode =
  | 'AP' // Andhra Pradesh
  | 'AR' // Arunachal Pradesh
  | 'AS' // Assam
  | 'BR' // Bihar
  | 'CG' // Chhattisgarh
  | 'GA' // Goa
  | 'GJ' // Gujarat
  | 'HR' // Haryana
  | 'HP' // Himachal Pradesh
  | 'JH' // Jharkhand
  | 'KA' // Karnataka
  | 'KL' // Kerala
  | 'MP' // Madhya Pradesh
  | 'MH' // Maharashtra
  | 'MN' // Manipur
  | 'ML' // Meghalaya
  | 'MZ' // Mizoram
  | 'NL' // Nagaland
  | 'OD' // Odisha
  | 'PB' // Punjab
  | 'RJ' // Rajasthan
  | 'SK' // Sikkim
  | 'TN' // Tamil Nadu
  | 'TS' // Telangana
  | 'TR' // Tripura
  | 'UP' // Uttar Pradesh
  | 'UK' // Uttarakhand
  | 'WB'; // West Bengal

export type UnionTerritoryCode =
  | 'AN' // Andaman and Nicobar Islands
  | 'CH' // Chandigarh
  | 'DNHDD' // Dadra and Nagar Haveli and Daman and Diu
  | 'DL' // Delhi (NCT)
  | 'JK' // Jammu and Kashmir
  | 'LA' // Ladakh
  | 'LD' // Lakshadweep
  | 'PY'; // Puducherry

export type TerritoryCode = IndianStateCode | UnionTerritoryCode;

export type MapMode =
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

export type DataOrigin = 'ESTABLISHED_BASELINE' | 'SIMULATED_DYNAMIC' | 'DEVELOPMENT_PLACEHOLDER';

export interface BudgetBreakdown {
  // Revenue receipts (in Crore INR per month)
  sgst: number;
  stateExcise: number;
  stampDutyRegistration: number;
  motorVehicleTax: number;
  electricityDuty: number;
  nonTaxRevenue: number;
  unionDevolutionAndGrants: number;
  // Expenditure (in Crore INR per month)
  salariesAndPensions: number;
  debtServicing: number;
  welfareAndSubsidies: number;
  capitalExpenditure: number;
  maintenanceOperations: number;
}

export interface EconomyMetrics {
  gsdpNominalCrore: number; // Gross State Domestic Product in Crore INR
  perCapitaIncomeINR: number;
  monthlyRevenueCrore: number;
  monthlyExpenditureCrore: number;
  fiscalDeficitGsdpRatio: number; // e.g. 0.028 for 2.8%
  stateDebtCrore: number;
  inflationRate: number; // percentage e.g. 5.1%
  budget: BudgetBreakdown;
  dataOrigin: DataOrigin;
}

export interface DemographicMetrics {
  population: number;
  urbanizationRate: number; // 0.0 to 1.0
  literacyRate: number;     // 0.0 to 1.0
  laborForceSize: number;
  unemploymentRate: number; // 0.0 to 1.0
  netMonthlyMigration: number;
  happinessIndex: number;   // 0 to 100
  dataOrigin: DataOrigin;
}

export interface InfrastructureMetrics {
  highwayDensityKmPer1000SqKm: number;
  powerGridReliabilityIndex: number; // 0 to 100
  portAccessType: 'COASTAL_PORT' | 'DRY_PORT_TRANSIT';
  portTransitFeeMonthlyCrore: number;
  internetBroadbandPenetration: number; // 0 to 1.0
  industrialParksCount: number;
  dataOrigin: DataOrigin;
}

export interface WaterMetrics {
  groundwaterStressLevel: 'SAFE' | 'SEMI_CRITICAL' | 'CRITICAL' | 'OVER_EXPLOITED';
  annualRainfallMm: number;
  activeDamsCount: number;
  reservoirStoragePercent: number; // 0 to 100
  irrigationCoveragePercent: number; // 0 to 100
  downstreamDischargeCusecs: number;
  dataOrigin: DataOrigin;
}

export interface PoliticalMetrics {
  rulingPartyName: string;
  chiefMinisterName: string;
  governingApprovalPercent: number; // 0 to 100
  monthsUntilNextElection: number;   // 0 to 60 (5 years)
  termsServed: number;
}

export interface StateProfile {
  code: TerritoryCode;
  name: string;
  isUnionTerritory: boolean;
  capital: string;
  areaSqKm: number;
  majorRivers: string[];
  neighboringStates: TerritoryCode[];
  economy: EconomyMetrics;
  demographics: DemographicMetrics;
  infrastructure: InfrastructureMetrics;
  water: WaterMetrics;
  politics: PoliticalMetrics;
  researchScore: number;       // 0 to 100
  defenseContribution: number; // 0 to 100 (recruitment, defense manufacturing, civil defense)
  industryOutputIndex: number; // 0 to 100
  agricultureOutputIndex: number; // 0 to 100
  naturalResourcesIndex: number;  // 0 to 100
  tradeVolumeIndex: number;       // 0 to 100
}

export interface GameSimulationClock {
  currentTick: number; // 1 tick = 1 month
  currentYear: number;
  currentMonth: number; // 1 = January, 12 = December
  isPaused: boolean;
  tickRateMs: number;
}

export interface GameState {
  version: string;
  selectedPlayerState: IndianStateCode;
  clock: GameSimulationClock;
  states: Record<TerritoryCode, StateProfile>;
}

export type PlayerAction =
  | { type: 'ADJUST_TAX_RATES'; stateCode: IndianStateCode; sgstAdjustment: number; stampDutyAdjustment: number }
  | { type: 'ALLOCATE_BUDGET'; stateCode: IndianStateCode; capexShare: number; welfareShare: number }
  | { type: 'CONSTRUCT_INFRASTRUCTURE'; stateCode: IndianStateCode; project: 'DAM' | 'HIGHWAY' | 'SOLAR_PARK' | 'INDUSTRIAL_CORRIDOR' }
  | { type: 'INTER_STATE_AGREEMENT'; fromState: IndianStateCode; toState: TerritoryCode; agreementType: 'WATER_SHARING' | 'PORT_TRANSIT' | 'POWER_TRADING' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'RESUME_SIMULATION' }
  | { type: 'SET_TICK_RATE'; rateMs: number };
