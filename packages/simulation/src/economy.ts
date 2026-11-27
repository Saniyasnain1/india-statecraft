import { EconomyMetrics, BudgetBreakdown } from '@india-statecraft/shared-types';

/**
 * Steps the state economy forward by one monthly tick.
 * Respects Indian constitutional fiscal rules:
 * - No personal income tax.
 * - Revenue from SGST, State Excise, Stamp Duty, Motor Vehicle Tax, Electricity Duty, and Central Transfers.
 * - Value-added GSDP expansion.
 */
export function stepEconomy(
  prevEconomy: EconomyMetrics,
  infrastructureScore: number,
  isMonsoonMonth: boolean
): EconomyMetrics {
  const prevBudget = prevEconomy.budget;

  // 1. GSDP monthly expansion based on capital expenditure, infrastructure quality, and seasonal effects
  const capexBonus = Math.min(0.005, (prevBudget.capitalExpenditure / prevEconomy.gsdpNominalCrore) * 1.5);
  const infraMultiplier = (infrastructureScore / 100) * 0.003;
  const seasonalAgriBoost = isMonsoonMonth ? 0.001 : 0.0002;
  const monthlyGrowthRate = 0.004 + capexBonus + infraMultiplier + seasonalAgriBoost; // ~6-8% annual equivalent

  const nextGsdp = Math.round(prevEconomy.gsdpNominalCrore * (1 + monthlyGrowthRate));

  // 2. State Own Tax Revenue (SOTR) calculations
  // SGST grows with nominal consumption and industrial activity
  const nextSgst = Math.round(prevBudget.sgst * (1 + monthlyGrowthRate * 1.05));
  const nextExcise = Math.round(prevBudget.stateExcise * 1.002);
  const nextStamp = Math.round(prevBudget.stampDutyRegistration * (1 + monthlyGrowthRate));
  const nextVehicle = Math.round(prevBudget.motorVehicleTax * 1.003);
  const nextElectricity = Math.round(prevBudget.electricityDuty * (1 + monthlyGrowthRate * 0.8));
  const nextNonTax = Math.round(prevBudget.nonTaxRevenue * 1.002);
  const nextUnionDevolution = Math.round(prevBudget.unionDevolutionAndGrants * 1.003);

  const totalMonthlyRevenue =
    nextSgst + nextExcise + nextStamp + nextVehicle + nextElectricity + nextNonTax + nextUnionDevolution;

  // 3. Expenditures
  // Committed expenditures: salaries, pensions, debt servicing
  const annualInterestRate = 0.075; // ~7.5% state development loans (SDL)
  const monthlyDebtService = Math.round((prevEconomy.stateDebtCrore * (annualInterestRate / 12)));
  const nextSalaries = Math.round(prevBudget.salariesAndPensions * 1.002); // Dearness allowance (DA) adjustments
  const nextWelfare = prevBudget.welfareAndSubsidies;
  const nextCapEx = prevBudget.capitalExpenditure;
  const nextMaintenance = Math.round(prevBudget.maintenanceOperations * 1.001);

  const totalMonthlyExpenditure =
    nextSalaries + monthlyDebtService + nextWelfare + nextCapEx + nextMaintenance;

  // 4. Monthly fiscal balance & debt accumulation
  const monthlyDeficit = totalMonthlyExpenditure - totalMonthlyRevenue;
  const nextDebt = Math.max(0, Math.round(prevEconomy.stateDebtCrore + Math.max(0, monthlyDeficit)));

  // Annualized fiscal deficit ratio to GSDP
  const annualizedDeficit = Math.max(0, monthlyDeficit) * 12;
  const fiscalDeficitRatio = Number((annualizedDeficit / nextGsdp).toFixed(4));

  const updatedBudget: BudgetBreakdown = {
    sgst: nextSgst,
    stateExcise: nextExcise,
    stampDutyRegistration: nextStamp,
    motorVehicleTax: nextVehicle,
    electricityDuty: nextElectricity,
    nonTaxRevenue: nextNonTax,
    unionDevolutionAndGrants: nextUnionDevolution,
    salariesAndPensions: nextSalaries,
    debtServicing: monthlyDebtService,
    welfareAndSubsidies: nextWelfare,
    capitalExpenditure: nextCapEx,
    maintenanceOperations: nextMaintenance,
  };

  return {
    ...prevEconomy,
    gsdpNominalCrore: nextGsdp,
    monthlyRevenueCrore: totalMonthlyRevenue,
    monthlyExpenditureCrore: totalMonthlyExpenditure,
    fiscalDeficitGsdpRatio: fiscalDeficitRatio,
    stateDebtCrore: nextDebt,
    budget: updatedBudget,
    dataOrigin: 'SIMULATED_DYNAMIC',
  };
}
