import { DemographicMetrics } from '@india-statecraft/shared-types';

/**
 * Steps state demographics and inter-state labor migration.
 */
export function stepDemographics(
  prevDemographics: DemographicMetrics,
  monthlyGsdpGrowth: number,
  infrastructureScore: number
): DemographicMetrics {
  // 1. Natural monthly population growth (~0.8% annually = 0.00067 monthly)
  const naturalGrowth = Math.round(prevDemographics.population * 0.00067);

  // 2. Net migration effect: high happiness & growing economy attract workers
  let netMigration = prevDemographics.netMonthlyMigration;
  if (prevDemographics.happinessIndex > 72 && monthlyGsdpGrowth > 0.005) {
    netMigration = Math.round(netMigration * 1.02 + 50);
  } else if (prevDemographics.happinessIndex < 60) {
    netMigration = Math.round(netMigration * 0.98 - 80);
  }

  const nextPopulation = prevDemographics.population + naturalGrowth + netMigration;

  // 3. Labor force is approximately 40-45% of population
  const nextLaborForce = Math.round(nextPopulation * 0.42);

  // 4. Unemployment adjusts based on economic expansion and infrastructure
  let nextUnemployment = prevDemographics.unemploymentRate;
  if (monthlyGsdpGrowth > 0.005) {
    nextUnemployment = Math.max(0.025, nextUnemployment - 0.0005);
  } else if (monthlyGsdpGrowth < 0.002) {
    nextUnemployment = Math.min(0.12, nextUnemployment + 0.0005);
  }

  // 5. Happiness index calculation: driven by employment, literacy, and infrastructure
  const employmentScore = (1 - nextUnemployment) * 60;
  const infraBonus = (infrastructureScore / 100) * 20;
  const literacyBonus = prevDemographics.literacyRate * 20;
  const rawHappiness = Math.round(employmentScore + infraBonus + literacyBonus);
  const nextHappiness = Math.max(20, Math.min(95, rawHappiness));

  return {
    ...prevDemographics,
    population: nextPopulation,
    laborForceSize: nextLaborForce,
    unemploymentRate: Number(nextUnemployment.toFixed(4)),
    netMonthlyMigration: netMigration,
    happinessIndex: nextHappiness,
    dataOrigin: 'SIMULATED_DYNAMIC',
  };
}
