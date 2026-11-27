import { PoliticalMetrics, TaxPolicySettings } from '@india-statecraft/shared-types';

export interface ElectionResult {
  occurred: boolean;
  won: boolean;
  approvalAtElection: number;
  message: string;
}

/**
 * Steps the political approval and 5-year electoral cycle.
 * Taxes have direct gameplay trade-offs:
 * - High consumption/business tax rates reduce public satisfaction.
 * - Welfare and health/education investments increase approval.
 */
export function stepPolitics(
  prevPolitics: PoliticalMetrics,
  happinessScore: number,
  unemploymentRate: number,
  taxPolicy: TaxPolicySettings
): { politics: PoliticalMetrics; electionResult?: ElectionResult } {
  // 1. Calculate approval swing based on public mood and tax burden
  let approvalDelta = 0;
  if (happinessScore > 75) approvalDelta += 0.35;
  else if (happinessScore < 55) approvalDelta -= 0.45;

  if (unemploymentRate > 0.065) approvalDelta -= 0.30;
  else if (unemploymentRate < 0.045) approvalDelta += 0.20;

  // Excessive taxation backlash (e.g. if consumption tax > 18% or business tax > 24%)
  if (taxPolicy.consumptionTaxRate > 0.18) {
    approvalDelta -= (taxPolicy.consumptionTaxRate - 0.18) * 15;
  }
  if (taxPolicy.businessTaxRate > 0.25) {
    approvalDelta -= (taxPolicy.businessTaxRate - 0.25) * 10;
  }

  const nextApproval = Math.max(
    10,
    Math.min(95, Math.round(prevPolitics.governingApprovalPercent + approvalDelta))
  );

  // 2. Election clock (every 60 months = 5 years)
  let monthsLeft = prevPolitics.monthsUntilNextElection - 1;
  let terms = prevPolitics.termsServed;
  let electionResult: ElectionResult | undefined;

  if (monthsLeft <= 0) {
    const won = nextApproval >= 48;
    electionResult = {
      occurred: true,
      won,
      approvalAtElection: nextApproval,
      message: won
        ? `Victory! The administration secured a renewed 5-year democratic mandate with ${nextApproval}% approval.`
        : `Defeat! The ruling government failed to retain its majority, securing only ${nextApproval}% public approval.`,
    };
    monthsLeft = 60; // Reset to 5-year mandate
    if (won) {
      terms += 1;
    }
  }

  const updatedPolitics: PoliticalMetrics = {
    ...prevPolitics,
    governingApprovalPercent: nextApproval,
    monthsUntilNextElection: monthsLeft,
    termsServed: terms,
  };

  return { politics: updatedPolitics, electionResult };
}
