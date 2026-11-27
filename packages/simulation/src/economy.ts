import {
  EconomyMetrics,
  BudgetBreakdownUSD,
  StateBuildingInstance,
  TrainRoute,
} from '@india-statecraft/shared-types';
import { BUILDING_DEFINITIONS } from '@india-statecraft/game-data';

/**
 * Steps the state economy forward by one monthly settlement.
 * Universal Currency: USD ($)
 *
 * Deterministic Macroeconomic Balance:
 * - Revenues depend on actual economic activity and defined tax rates.
 * - Public expenditures scale with population, debt, infrastructure, and inflation.
 * - Prevents runaway compounding or explosive cash accumulation.
 */
export function stepEconomy(
  prevEconomy: EconomyMetrics,
  buildings: StateBuildingInstance[],
  routes: TrainRoute[],
  infrastructureScore: number,
  isMonsoonMonth: boolean
): EconomyMetrics {
  const taxPolicy = prevEconomy.taxPolicy;

  // 1. Calculate operational building outputs & public maintenance expenses
  let monthlyBuildingGdpValueAddedUSD = 0;
  let monthlyBuildingPublicExpenseUSD = 0;

  for (const b of buildings) {
    if (!b.isUnderConstruction) {
      const def = BUILDING_DEFINITIONS[b.type];
      if (def) {
        monthlyBuildingGdpValueAddedUSD += def.monthlyGdpValueAddedUSD;
        // Public maintenance of state-supported assets
        monthlyBuildingPublicExpenseUSD += def.monthlyOperatingExpenseUSD;
      }
    }
  }

  // 2. Transport profit contribution
  let totalTransportProfitsUSD = 0;
  for (const r of routes) {
    totalTransportProfitsUSD += r.monthlyProfitUSD;
  }

  // 3. Realistic Annual GDP Growth Rate
  // Annual growth target for Indian states: 4.5% to 8.5% per annum
  const taxDrag = (taxPolicy.businessTaxRate - 0.18) * 0.02; // High business taxes dampen private capital
  const infraEffect = ((infrastructureScore - 50) / 100) * 0.008; // High grid/logistics reliability boosts output
  const seasonalAgriBoost = isMonsoonMonth ? 0.003 : 0.001;
  const capexEffect = Math.min(0.015, (prevEconomy.budget.publicInvestmentUSD / Math.max(1, prevEconomy.gdpUSD)) * 2.0);

  // Annualized real GDP growth (bounded between -1.5% and +9.5%)
  const targetAnnualGrowth = Math.max(-0.015, Math.min(0.095, 0.055 + infraEffect + seasonalAgriBoost + capexEffect - taxDrag));
  const effectiveMonthlyGrowth = targetAnnualGrowth / 12;

  // New Nominal Annual GDP
  // Building additions increase annual output capacity proportionally
  const annualBuildingContribution = monthlyBuildingGdpValueAddedUSD * 12 * 0.15; // Incremental expansion
  const nextGdp = Math.round(prevEconomy.gdpUSD * (1 + effectiveMonthlyGrowth) + annualBuildingContribution);
  const monthlyGdp = nextGdp / 12;

  // 4. Tax Revenues based on defined statutory policies & economic activity
  // Business Tax: ~22% of monthly GDP represents corporate/industrial value-added
  const businessTaxYield = Math.round(monthlyGdp * 0.22 * taxPolicy.businessTaxRate);

  // Consumption Tax (SGST): ~38% of monthly GDP represents taxed retail goods & services
  const consumptionTaxYield = Math.round(monthlyGdp * 0.38 * taxPolicy.consumptionTaxRate);

  // Property & Stamp Duty: ~12% of monthly GDP in real estate / land transfers
  const propertyTaxYield = Math.round(monthlyGdp * 0.12 * taxPolicy.propertyTaxRate);

  // State Excise Duty: ~6% of monthly GDP in spirits, fuel surcharges
  const exciseTaxYield = Math.round(monthlyGdp * 0.06 * taxPolicy.stateExciseTaxRate);

  // Motor Vehicle Registration Duty: ~5% of monthly GDP
  const vehicleTaxYield = Math.round(monthlyGdp * 0.05 * taxPolicy.vehicleTaxRate);

  // State Electricity Duty: ~6% of monthly GDP in commercial/residential power tariffs
  const electricityTaxYield = Math.round(monthlyGdp * 0.06 * taxPolicy.electricityDutyRate);

  // Central Union Devolution & Grants (Finance Commission transfers)
  const centralTransfers = Math.round(prevEconomy.budget.centralTransfersUSD * (1 + 0.04 / 12));

  // Non-tax revenue (railway profits, state royalties, licensing)
  const nonTaxNetProfits = Math.max(0, Math.round(totalTransportProfitsUSD));

  const totalMonthlyRevenue =
    businessTaxYield +
    consumptionTaxYield +
    propertyTaxYield +
    exciseTaxYield +
    vehicleTaxYield +
    electricityTaxYield +
    centralTransfers +
    nonTaxNetProfits;

  // 5. Expenditures (Meaningful, scaled, and non-trivial)
  // Debt servicing: ~7.0% per annum on outstanding state debt
  const annualInterestRate = 0.07;
  const monthlyDebtService = Math.round(prevEconomy.debtUSD * (annualInterestRate / 12));

  // Public Salaries & Civil Administration (police, teachers, healthcare, bureaucrats)
  const publicSalaries = Math.round(
    prevEconomy.budget.publicSalariesUSD * (1 + (prevEconomy.inflationRate || 0.045) / 12)
  );

  // Infrastructure & Asset Maintenance (roads, water pipelines, power transmission, schools/hospitals)
  const baseInfraMaintenance = Math.round(prevEconomy.budget.infrastructureMaintenanceUSD * (1 + 0.002));
  const infraMaintenance = baseInfraMaintenance + Math.round(monthlyBuildingPublicExpenseUSD);

  // Welfare, Subsidies & Food Security
  const welfareSubsidies = prevEconomy.budget.welfareAndSubsidiesUSD;

  // Public Capital Investment (CapEx)
  const publicInvestment = prevEconomy.budget.publicInvestmentUSD;

  // Transport losses if any route runs at a deficit
  const transportLosses = totalTransportProfitsUSD < 0 ? Math.abs(Math.round(totalTransportProfitsUSD)) : 0;

  const totalMonthlyExpenditure =
    publicSalaries +
    infraMaintenance +
    welfareSubsidies +
    monthlyDebtService +
    publicInvestment +
    transportLosses;

  // 6. Net Monthly Fiscal Balance
  const monthlySurplus = totalMonthlyRevenue - totalMonthlyExpenditure;
  const nextTreasury = prevEconomy.treasuryUSD + monthlySurplus;

  // If treasury goes negative, the state must borrow (issue bonds), expanding debt
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
    centralTransfersUSD: centralTransfers,
    publicSalariesUSD: publicSalaries,
    infrastructureMaintenanceUSD: infraMaintenance,
    welfareAndSubsidiesUSD: welfareSubsidies,
    debtServicingUSD: monthlyDebtService,
    publicInvestmentUSD: publicInvestment,
  };

  const perCapita = Math.round(nextGdp / Math.max(1, (prevEconomy.gdpUSD / Math.max(1, prevEconomy.gdpPerCapitaUSD))));

  return {
    ...prevEconomy,
    treasuryUSD: Math.round(nextTreasury),
    gdpUSD: nextGdp,
    gdpGrowthRate: Number(targetAnnualGrowth.toFixed(4)),
    growthRateAnnual: Number(targetAnnualGrowth.toFixed(4)),
    gdpPerCapitaUSD: perCapita,
    monthlyRevenueUSD: totalMonthlyRevenue,
    monthlyExpenditureUSD: totalMonthlyExpenditure,
    monthlySurplusUSD: monthlySurplus,
    debtUSD: Math.round(nextDebt),
    budget: updatedBudget,
  };
}
