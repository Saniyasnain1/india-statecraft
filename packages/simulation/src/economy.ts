import {
  EconomyMetrics,
  BudgetBreakdownUSD,
  StateBuildingInstance,
  TrainRoute,
} from '@india-statecraft/shared-types';
import { BUILDING_DEFINITIONS } from '@india-statecraft/game-data';

/**
 * Steps the state economy forward by one monthly tick.
 * Universal Currency: USD ($)
 *
 * Value-Added GDP Method:
 * Net monthly GDP = Base consumption + Value added from operational buildings + Transport throughput
 * Tax Yield: Calculated strictly from defined tax policy percentages.
 */
export function stepEconomy(
  prevEconomy: EconomyMetrics,
  buildings: StateBuildingInstance[],
  routes: TrainRoute[],
  infrastructureScore: number,
  isMonsoonMonth: boolean
): EconomyMetrics {
  const taxPolicy = prevEconomy.taxPolicy;

  // 1. Calculate building outputs & operating expenses from operational buildings
  let monthlyBuildingGdpValueAddedUSD = 0;
  let monthlyBuildingOperatingExpensesUSD = 0;

  for (const b of buildings) {
    if (!b.isUnderConstruction) {
      const def = BUILDING_DEFINITIONS[b.type];
      if (def) {
        monthlyBuildingGdpValueAddedUSD += def.monthlyGdpValueAddedUSD;
        monthlyBuildingOperatingExpensesUSD += def.monthlyOperatingExpenseUSD;
      }
    }
  }

  // 2. Transport profit contribution
  let totalTransportProfitsUSD = 0;
  for (const r of routes) {
    totalTransportProfitsUSD += r.monthlyProfitUSD;
  }

  // 3. GSDP Growth Rate
  // Driven by investment share, infrastructure score, tax burden effect
  // High business taxes (> 25%) depress growth; low taxes encourage capital formation
  const taxDrag = (taxPolicy.businessTaxRate - 0.18) * 0.05;
  const capexBonus = (prevEconomy.budget.publicInvestmentUSD / prevEconomy.gdpUSD) * 1.5;
  const infraMultiplier = (infrastructureScore / 100) * 0.002;
  const seasonalAgriBoost = isMonsoonMonth ? 0.0008 : 0.0002;

  const monthlyBaseGrowth = 0.0045 + capexBonus + infraMultiplier + seasonalAgriBoost - taxDrag;
  const effectiveMonthlyGrowth = Math.max(-0.01, monthlyBaseGrowth);

  // New Nominal GDP (Value Added)
  const nextGdp = Math.round(
    prevEconomy.gdpUSD * (1 + effectiveMonthlyGrowth) + monthlyBuildingGdpValueAddedUSD
  );
  const monthlyGdp = nextGdp / 12;

  // 4. Tax Revenues based on explicit policy rates
  // Business tax
  const businessTaxYield = Math.round(monthlyGdp * 0.20 * taxPolicy.businessTaxRate);
  // Consumption tax (SGST)
  const consumptionTaxYield = Math.round(monthlyGdp * 0.35 * taxPolicy.consumptionTaxRate);
  // Property & Stamp duties
  const propertyTaxYield = Math.round(monthlyGdp * 0.15 * taxPolicy.propertyTaxRate);
  // State Excise
  const exciseTaxYield = Math.round(monthlyGdp * 0.07 * taxPolicy.stateExciseTaxRate);
  // Vehicle tax
  const vehicleTaxYield = Math.round(monthlyGdp * 0.10 * taxPolicy.vehicleTaxRate);
  // Electricity duty
  const electricityTaxYield = Math.round(monthlyGdp * 0.08 * taxPolicy.electricityDutyRate);

  // Central devolution (Union transfers based on formula)
  const nextCentralTransfers = Math.round(prevEconomy.budget.centralTransfersUSD * 1.002);

  const totalMonthlyRevenue =
    businessTaxYield +
    consumptionTaxYield +
    propertyTaxYield +
    exciseTaxYield +
    vehicleTaxYield +
    electricityTaxYield +
    nextCentralTransfers +
    Math.max(0, totalTransportProfitsUSD);

  // 5. Expenditures
  const annualInterestRate = 0.065; // ~6.5% interest on state debt
  const monthlyDebtService = Math.round(prevEconomy.debtUSD * (annualInterestRate / 12));
  const publicSalaries = Math.round(prevEconomy.budget.publicSalariesUSD * 1.001);
  const infraMaintenance = Math.round(
    prevEconomy.budget.infrastructureMaintenanceUSD + monthlyBuildingOperatingExpensesUSD * 0.2
  );
  const welfareSubsidies = prevEconomy.budget.welfareAndSubsidiesUSD;
  const publicInvestment = prevEconomy.budget.publicInvestmentUSD;

  const totalMonthlyExpenditure =
    publicSalaries +
    infraMaintenance +
    welfareSubsidies +
    monthlyDebtService +
    publicInvestment +
    monthlyBuildingOperatingExpensesUSD;

  // 6. Net monthly balance & treasury accumulation
  const monthlySurplus = totalMonthlyRevenue - totalMonthlyExpenditure;
  const nextTreasury = prevEconomy.treasuryUSD + monthlySurplus;

  // Debt changes if deficit is negative and treasury is depleted
  let nextDebt = prevEconomy.debtUSD;
  if (nextTreasury < 0) {
    nextDebt += Math.abs(nextTreasury);
  }

  const updatedBudget: BudgetBreakdownUSD = {
    businessTaxRevenueUSD: businessTaxYield,
    consumptionTaxRevenueUSD: consumptionTaxYield,
    propertyTaxRevenueUSD: propertyTaxYield,
    exciseTaxRevenueUSD: exciseTaxYield,
    vehicleTaxRevenueUSD: vehicleTaxYield,
    electricityTaxRevenueUSD: electricityTaxYield,
    transportProfitsUSD: totalTransportProfitsUSD,
    centralTransfersUSD: nextCentralTransfers,
    publicSalariesUSD: publicSalaries,
    infrastructureMaintenanceUSD: infraMaintenance,
    welfareAndSubsidiesUSD: welfareSubsidies,
    debtServicingUSD: monthlyDebtService,
    publicInvestmentUSD: publicInvestment,
  };

  const annualizedGrowth = Number((effectiveMonthlyGrowth * 12).toFixed(4));
  const perCapita = Math.round(nextGdp / (prevEconomy.gdpUSD / Math.max(1, prevEconomy.gdpPerCapitaUSD)));

  return {
    ...prevEconomy,
    treasuryUSD: Math.round(nextTreasury),
    gdpUSD: nextGdp,
    gdpGrowthRate: annualizedGrowth,
    gdpPerCapitaUSD: perCapita,
    monthlyRevenueUSD: totalMonthlyRevenue,
    monthlyExpenditureUSD: totalMonthlyExpenditure,
    monthlySurplusUSD: monthlySurplus,
    debtUSD: Math.round(nextDebt),
    budget: updatedBudget,
  };
}
