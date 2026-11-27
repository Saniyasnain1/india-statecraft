import { PoliticalMetrics } from '@india-statecraft/shared-types';

export interface ElectionResult {
  occurred: boolean;
  won: boolean;
  approvalAtElection: number;
  message: string;
}

/**
 * Steps the political approval and 5-year electoral cycle.
 */
export function stepPolitics(
  prevPolitics: PoliticalMetrics,
  happinessScore: number,
  fiscalDeficitRatio: number,
  unemploymentRate: number
): { politics: PoliticalMetrics; electionResult?: ElectionResult } {
  // 1. Calculate approval swing based on public mood and governance metrics
  let approvalDelta = 0;
  if (happinessScore > 75) approvalDelta += 0.4;
  else if (happinessScore < 55) approvalDelta -= 0.5;

  if (unemploymentRate > 0.07) approvalDelta -= 0.3;
  if (fiscalDeficitRatio > 0.04) approvalDelta -= 0.2; // Fiscal overextension penalty

  const nextApproval = Math.max(10, Math.min(95, Math.round(prevPolitics.governingApprovalPercent + approvalDelta)));

  // 2. Election clock tick
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
    monthsLeft = 60; // Reset to 5 years
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
