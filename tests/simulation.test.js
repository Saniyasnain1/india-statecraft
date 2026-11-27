import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALL_STATE_CODES,
  ALL_UT_CODES,
  INITIAL_STATES_DATA,
  BUILDING_DEFINITIONS,
  TRAIN_CONFIGS,
  calculateTrainEconomics,
} from '@india-statecraft/game-data';
import { MAP_MODES, getMapColorForValue, formatUSD } from '@india-statecraft/map-data';
import { createInitialGameState, stepSimulation } from '@india-statecraft/simulation';

test('1. Territory Coverage & Integrity', () => {
  assert.equal(ALL_STATE_CODES.length, 28, 'Must have exactly 28 Indian States');
  assert.equal(ALL_UT_CODES.length, 8, 'Must have exactly 8 Union Territories');

  for (const code of ALL_STATE_CODES) {
    const state = INITIAL_STATES_DATA[code];
    assert.ok(state, `State data for ${code} must exist`);
    assert.equal(state.isUnionTerritory, false, `${code} should be a state, not UT`);
    assert.ok(state.economy.gdpUSD > 0, `${code} GDP in USD must be > 0`);
    assert.ok(state.economy.treasuryUSD > 0, `${code} Treasury in USD must be > 0`);
    assert.ok(state.demographics.population > 0, `${code} Population must be > 0`);
    assert.ok(state.majorCities.length > 0, `${code} must have at least 1 major city`);
  }
});

test('2. Universal USD Currency & No State Personal Income Tax', () => {
  for (const code of ALL_STATE_CODES) {
    const state = INITIAL_STATES_DATA[code];
    const budget = state.economy.budget;

    // Check all values are USD numbers
    assert.equal(typeof state.economy.treasuryUSD, 'number');
    assert.equal(typeof state.economy.gdpUSD, 'number');
    assert.ok(state.economy.treasuryUSD >= 1_000_000, 'Starting treasury should be at least $1M');

    // Constitutional constraint: states have no personal income tax
    assert.equal(budget.personalIncomeTaxUSD, undefined);
    assert.ok(budget.businessTaxRevenueUSD >= 0);
    assert.ok(budget.consumptionTaxRevenueUSD >= 0);
  }

  // Check USD formatter
  assert.equal(formatUSD(450_000_000_000), '$450.0B');
  assert.equal(formatUSD(25_000_000), '$25.0M');
  assert.equal(formatUSD(500_000), '$500K');
});

test('3. Train Transport Economics Formula Consistency', () => {
  // Test heavy freight route: 300 km with 2 active trains
  const eco = calculateTrainEconomics(300, 'FREIGHT_HEAVY', 2);
  assert.ok(eco.tripsPerMonth > 0, 'Should calculate monthly trips');
  assert.ok(eco.monthlyCargoUnits > 0, 'Should transport cargo');
  assert.ok(eco.monthlyRevenueUSD > 0, 'Revenue must be positive');
  assert.ok(eco.monthlyOperatingCostUSD > 0, 'Operating cost must be positive');
  assert.ok(eco.monthlyMaintenanceCostUSD > 0, 'Maintenance cost must be positive');

  // Verify Profit = Revenue - Operating - Maintenance
  const expectedProfit =
    eco.monthlyRevenueUSD - eco.monthlyOperatingCostUSD - eco.monthlyMaintenanceCostUSD;
  assert.equal(eco.monthlyProfitUSD, expectedProfit, 'Profit formula must hold exactly');

  // Identical inputs must yield identical outputs (determinism)
  const eco2 = calculateTrainEconomics(300, 'FREIGHT_HEAVY', 2);
  assert.deepEqual(eco, eco2, 'Transport calculation must be 100% deterministic');
});

test('4. Building Definitions & Geographic Constraints', () => {
  const dam = BUILDING_DEFINITIONS['DAM'];
  assert.ok(dam, 'DAM building definition must exist');
  assert.equal(dam.requiresRiver, true, 'Dam must require a river');

  const seaport = BUILDING_DEFINITIONS['SEAPORT'];
  assert.ok(seaport, 'SEAPORT building definition must exist');
  assert.equal(seaport.requiresCoastal, true, 'Seaport must require coastal access');

  const factory = BUILDING_DEFINITIONS['FACTORY'];
  assert.equal(factory.constructionCostUSD, 25_000_000, 'Factory cost should be $25M');
  assert.equal(factory.constructionTimeTicks, 4, 'Factory should take 4 months to construct');
});

test('5. Simulation Engine Ticking, Value-Added GDP & Election Clock', () => {
  const initial = createInitialGameState('MH');
  initial.phase = 'PLAYING'; // Activate simulation
  assert.equal(initial.clock.currentTick, 1);
  assert.equal(initial.clock.currentYear, 2026);
  assert.equal(initial.clock.currentMonth, 1);

  const prevTreasury = initial.states['MH'].economy.treasuryUSD;
  const prevMonthsToElection = initial.states['MH'].politics.monthsUntilNextElection;

  const { nextState } = stepSimulation(initial);
  assert.equal(nextState.clock.currentTick, 2);
  assert.equal(nextState.clock.currentMonth, 2);

  // Treasury updates based on monthly surplus
  const nextTreasury = nextState.states['MH'].economy.treasuryUSD;
  const surplus = nextState.states['MH'].economy.monthlySurplusUSD;
  assert.equal(nextTreasury, prevTreasury + surplus, 'Treasury must update by monthly surplus');

  // Election clock decrements
  assert.equal(
    nextState.states['MH'].politics.monthsUntilNextElection,
    prevMonthsToElection - 1,
    'Months to election must decrement by 1 each month'
  );
});
