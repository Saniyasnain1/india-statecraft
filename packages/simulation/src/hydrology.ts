import { WaterMetrics } from '@india-statecraft/shared-types';

/**
 * Steps state hydrological metrics and seasonal water security.
 * India experiences the Southwest Monsoon primarily between June (Month 6) and September (Month 9).
 */
export function stepHydrology(
  prevWater: WaterMetrics,
  currentMonth: number
): WaterMetrics {
  const isSouthwestMonsoon = currentMonth >= 6 && currentMonth <= 9;
  const isPostMonsoon = currentMonth >= 10 && currentMonth <= 11;

  let storageDelta = 0;
  let discharge = prevWater.downstreamDischargeCusecs;

  if (isSouthwestMonsoon) {
    // Monsoon inflows fill reservoirs rapidly
    storageDelta = 4 + Math.random() * 3;
    discharge = Math.round(discharge * 1.35);
  } else if (isPostMonsoon) {
    storageDelta = -1;
    discharge = Math.round(discharge * 0.95);
  } else {
    // Dry pre-monsoon summer depletion
    storageDelta = -3;
    discharge = Math.max(1500, Math.round(discharge * 0.90));
  }

  const nextStorage = Math.max(15, Math.min(98, Math.round(prevWater.reservoirStoragePercent + storageDelta)));

  // Groundwater stress classification based on reservoir storage & irrigation
  let stress = prevWater.groundwaterStressLevel;
  if (nextStorage < 25) {
    stress = 'CRITICAL';
  } else if (nextStorage < 45) {
    stress = 'SEMI_CRITICAL';
  } else if (nextStorage > 60 && stress === 'SEMI_CRITICAL') {
    stress = 'SAFE';
  }

  return {
    ...prevWater,
    reservoirStoragePercent: nextStorage,
    downstreamDischargeCusecs: discharge,
    groundwaterStressLevel: stress,
    dataOrigin: 'SIMULATED_DYNAMIC',
  };
}
