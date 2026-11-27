import test from 'node:test';
import assert from 'node:assert/strict';

// Import compiled packages or direct sources
import { ALL_STATE_CODES, ALL_UT_CODES, INITIAL_STATES_DATA } from '../packages/game-data/dist/index.js';
import { MAP_MODES, getMapColorForValue } from '../packages/map-data/dist/index.js';
import { createInitialGameState, stepSimulation } from '../packages/simulation/dist/index.js';

test('1. Territory Coverage & Integrity', () => {
  assert.equal(ALL_STATE_CODES.length, 28, 'Must have exactly 28 Indian States');
  assert.equal(ALL_UT_CODES.length, 8, 'Must have exactly 8 Union Territories');

  // Verify all 28 states exist in INITIAL_STATES_DATA
  for (const code of ALL_STATE_CODES) {
    const state = INITIAL_STATES_DATA[code];
    assert.ok(state, `State data for ${code} must exist`);
    assert.equal(state.isUnionTerritory, false, `${code} should be a state, not UT`);
    assert.ok(state.economy.gsdpNominalCrore > 0, `${code} GSDP must be > 0`);
    assert.ok(state.demographics.population > 0, `${code} Population must be > 0`);
    assert.ok(state.water.reservoirStoragePercent >= 0, `${code} Reservoir storage must be >= 0`);
  }
});

test('2. Constitutional Fiscal Rules (No Personal Income Tax)', () => {
  for (const code of ALL_STATE_CODES) {
    const state = INITIAL_STATES_DATA[code];
    const budget = state.economy.budget;
    // States have SGST, State Excise, Stamp Duty, Vehicle Tax, Electricity Duty, and Union Devolution
    assert.ok(budget.sgst >= 0, `${code} SGST must be defined`);
    assert.ok(budget.unionDevolutionAndGrants >= 0, `${code} Union Devolution must be defined`);
    // State budget should NOT contain personal income tax
    assert.equal(budget.personalIncomeTax, undefined, 'States cannot levy personal income tax');
  }
});

test('3. Dynamic Map Modes (All 12 Modes Defined)', () => {
  const expectedModes = [
    'terrain',
    'economy',
    'population',
    'industry',
    'agriculture',
    'naturalResources',
    'infrastructure',
    'happiness',
    'research',
    'militaryContribution',
    'trade',
    'waterResources',
  ];

  for (const mode of expectedModes) {
    const modeConfig = MAP_MODES[mode];
    assert.ok(modeConfig, `Map mode ${mode} must have configuration`);
    assert.ok(modeConfig.colorStops.length >= 2, `Map mode ${mode} must have color stops`);

    // Verify color evaluation produces valid hex
    const color = getMapColorForValue(mode, 50);
    assert.match(color, /^#[0-9a-fA-F]{6}$/, `Color for ${mode} should be valid hex`);
  }
});

test('4. Simulation Engine Tick Determinism & Time Passage', () => {
  const initial = createInitialGameState('MH');
  assert.equal(initial.clock.currentTick, 1);
  assert.equal(initial.clock.currentYear, 2026);
  assert.equal(initial.clock.currentMonth, 1);
  assert.equal(initial.clock.isPaused, false);

  // Step 1 tick forward
  const { nextState } = stepSimulation(initial);
  assert.equal(nextState.clock.currentTick, 2, 'Clock tick should increment by 1');
  assert.equal(nextState.clock.currentMonth, 2, 'Month should increment by 1');

  // Verify GSDP grew realistically
  const prevGsdp = initial.states['MH'].economy.gsdpNominalCrore;
  const nextGsdp = nextState.states['MH'].economy.gsdpNominalCrore;
  assert.ok(nextGsdp > prevGsdp, 'GSDP should grow with capital expenditure');
});

test('5. Electoral Mandate & 5-Year Election Clock', () => {
  let state = createInitialGameState('MH');
  const startingMonths = state.states['MH'].politics.monthsUntilNextElection;
  assert.ok(startingMonths > 0 && startingMonths <= 60, 'Starting election months should be <= 60');

  // Advance simulation by 1 month
  const { nextState } = stepSimulation(state);
  assert.equal(
    nextState.states['MH'].politics.monthsUntilNextElection,
    startingMonths - 1,
    'Election countdown should decrement by 1 each month'
  );
});
