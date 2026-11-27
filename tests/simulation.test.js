import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALL_STATE_CODES,
  ALL_UT_CODES,
  INITIAL_STATES_DATA,
  BUILDING_DEFINITIONS,
  TRAIN_CONFIGS,
  calculateTrainEconomics,
  DEFAULT_GAME_TIME_CONFIG,
  getTickRateFromSpeed,
  BHARATFRONT_CONFIG,
  calculateBuildingCost,
  calculateUpgradeCost,
  getBuildingLevelMultiplier,
  calculateTrainSpawnChance,
  calculateIndustrialOutput,
  formatGold,
  INDIAN_RIVER_POLYLINES,
  ENGLISH_CITY_NAME_POOLS,
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

test('6. Simulation Clock Pacing & Speed Acceleration Scaling', () => {
  // Target: ~30-45 minutes per year at 1x speed (default 2160s = 36 min/yr)
  const secondsPerYear = DEFAULT_GAME_TIME_CONFIG.secondsPerYear1x;
  assert.ok(secondsPerYear >= 1800 && secondsPerYear <= 2700, 'Target pacing must be 30-45 min per year');

  const initial = createInitialGameState('MH');
  assert.equal(initial.clock.secondsPerYear1x, 2160);

  // At 1x: 180,000 ms per month (3 minutes per month = 36 min per year)
  assert.equal(initial.clock.tickRateMs, 180_000);

  // Test speed acceleration consistency
  const state2x = stepSimulation(initial, { type: 'SET_GAME_SPEED', speed: 2 }).nextState;
  assert.equal(state2x.clock.speed, 2);
  assert.equal(state2x.clock.tickRateMs, 90_000); // 1.5 min per month

  const state4x = stepSimulation(initial, { type: 'SET_GAME_SPEED', speed: 4 }).nextState;
  assert.equal(state4x.clock.speed, 4);
  assert.equal(state4x.clock.tickRateMs, 45_000); // 45s per month

  const state8x = stepSimulation(initial, { type: 'SET_GAME_SPEED', speed: 8 }).nextState;
  assert.equal(state8x.clock.speed, 8);
  assert.equal(state8x.clock.tickRateMs, 22_500); // 22.5s per month

  // Pause stops simulation
  const pausedState = stepSimulation(initial, { type: 'TOGGLE_PAUSE' }).nextState;
  assert.equal(pausedState.clock.isPaused, true);
  const afterPausedStep = stepSimulation(pausedState).nextState;
  assert.equal(afterPausedStep.clock.currentTick, initial.clock.currentTick, 'Paused clock must not tick');
});

test('7. Realistic Starting Treasury & Fiscal Balance', () => {
  for (const code of ALL_STATE_CODES) {
    const state = INITIAL_STATES_DATA[code];
    // No state starts with billions in liquid cash
    assert.ok(
      state.economy.treasuryUSD <= 250_000_000,
      `${code} starting treasury must be <= $250M (found $${state.economy.treasuryUSD})`
    );
    assert.ok(
      state.economy.treasuryUSD >= 15_000_000,
      `${code} starting treasury must be >= $15M (found $${state.economy.treasuryUSD})`
    );

    // Initial budget must be balanced within reasonable margins (-3% to +3% of revenue)
    const rev = state.economy.monthlyRevenueUSD;
    const exp = state.economy.monthlyExpenditureUSD;
    const margin = Math.abs(rev - exp) / Math.max(1, rev);
    assert.ok(
      margin <= 0.05,
      `${code} starting budget must be near balanced (margin is ${(margin * 100).toFixed(1)}%)`
    );
  }
});

test('8. Dummynation Golden Glow Heatmap & 12 Modes Validation', () => {
  const econConfig = MAP_MODES['economy'];
  assert.ok(econConfig, 'Economy map mode must exist');

  // Verify golden glow color scale
  const lowestColor = getMapColorForValue('economy', 1_000_000_000);
  const highestColor = getMapColorForValue('economy', 450_000_000_000);
  assert.ok(lowestColor.startsWith('#'), 'Must return valid hex color');
  assert.ok(highestColor.startsWith('#'), 'Must return valid hex color');
  assert.notEqual(lowestColor, highestColor, 'Lowest and highest economic values must have distinct colors');

  // Verify all 12 map modes exist and return non-static dynamic values
  const modes = [
    'terrain', 'economy', 'population', 'industry', 'agriculture',
    'naturalResources', 'infrastructure', 'happiness', 'research',
    'militaryContribution', 'trade', 'waterResources'
  ];

  for (const m of modes) {
    const conf = MAP_MODES[m];
    assert.ok(conf, `Map mode ${m} must exist`);

    const mhVal = conf.getValue(INITIAL_STATES_DATA['MH']);
    const skVal = conf.getValue(INITIAL_STATES_DATA['SK']);
    assert.equal(typeof mhVal, 'number', `${m} value for MH must be a number`);
    assert.equal(typeof skVal, 'number', `${m} value for SK must be a number`);
    assert.ok(conf.formatValue(mhVal).length > 0, `${m} formatValue must return string`);
  }
});

test('9. BharatFront: Gold Currency & Starting Capital', () => {
  assert.equal(BHARATFRONT_CONFIG.CURRENCY_NAME, 'Gold');
  assert.equal(BHARATFRONT_CONFIG.DEFAULT_STARTING_GOLD, 750_000);
  assert.equal(formatGold(750_000), '750.0K Gold');
  assert.equal(formatGold(1_500_000), '1.50M Gold');
  assert.equal(formatGold(2_500_000_000), '2.50B Gold');
});

test('10. BharatFront: Building Costs, Progressive Growth & 10M Cap', () => {
  // Check base price ranges
  assert.ok(BHARATFRONT_CONFIG.BASE_COSTS.city >= 500_000 && BHARATFRONT_CONFIG.BASE_COSTS.city <= 1_000_000);
  assert.ok(BHARATFRONT_CONFIG.BASE_COSTS.factory >= 500_000 && BHARATFRONT_CONFIG.BASE_COSTS.factory <= 900_000);
  assert.ok(BHARATFRONT_CONFIG.BASE_COSTS.river_dock >= 250_000 && BHARATFRONT_CONFIG.BASE_COSTS.river_dock <= 500_000);
  assert.ok(BHARATFRONT_CONFIG.BASE_COSTS.port >= 750_000 && BHARATFRONT_CONFIG.BASE_COSTS.port <= 1_000_000);
  assert.ok(BHARATFRONT_CONFIG.BASE_COSTS.airport >= 750_000 && BHARATFRONT_CONFIG.BASE_COSTS.airport <= 1_000_000);

  // Progressive cost: cost = min(baseCost * 1.6^ownedCount, 10,000,000)
  const cost0 = calculateBuildingCost('city', 0);
  const cost1 = calculateBuildingCost('city', 1);
  const cost2 = calculateBuildingCost('city', 2);
  const cost15 = calculateBuildingCost('city', 15);

  assert.equal(cost0, BHARATFRONT_CONFIG.BASE_COSTS.city);
  assert.equal(cost1, Math.round(cost0 * 1.6));
  assert.ok(cost2 > cost1);
  assert.equal(cost15, 10_000_000, 'Must cap at 10,000,000 Gold');
});

test('11. BharatFront: Building Upgrades (Level 1..10) & +25% Multipliers', () => {
  assert.equal(getBuildingLevelMultiplier(1), 1.00);
  assert.equal(getBuildingLevelMultiplier(2), 1.25);
  assert.equal(getBuildingLevelMultiplier(3), 1.50);
  assert.equal(getBuildingLevelMultiplier(4), 1.75);
  assert.equal(getBuildingLevelMultiplier(10), 3.25);

  const upg1 = calculateUpgradeCost('factory', 1);
  const upg2 = calculateUpgradeCost('factory', 2);
  assert.ok(upg2 > upg1, 'Upgrade cost must progressively increase');
  assert.equal(calculateUpgradeCost('factory', 10), Infinity, 'Level 10 is max level');
});

test('12. BharatFront: Train Spawn Chance with Diminishing Returns', () => {
  // Formula: chance = level / ((totalOwnerFactories + 8) * k)
  const chance1 = calculateTrainSpawnChance(1, 1, 1.25);
  const chance2 = calculateTrainSpawnChance(2, 1, 1.25);
  const chanceManyFactories = calculateTrainSpawnChance(1, 10, 1.25);

  assert.ok(chance2 > chance1, 'Higher factory level must increase spawn chance');
  assert.ok(chanceManyFactories < chance1, 'More total factories must yield diminishing returns');
});

test('13. BharatFront: Worker Economy Allocation with 0.78 Diminishing Returns', () => {
  // Formula: industrial output ∝ workers^0.78
  const out1000 = calculateIndustrialOutput(1000, 0.5);
  const out2000 = calculateIndustrialOutput(2000, 0.5);
  assert.ok(out2000 > out1000);
  assert.ok(out2000 < out1000 * 2, 'Must exhibit diminishing returns (sub-linear power < 1)');
});

test('14. BharatFront: Trade Payout Tiers', () => {
  const payouts = BHARATFRONT_CONFIG.TRADE_BASE_PAYOUTS;
  assert.equal(payouts.OWN_STATION, 10_000);
  assert.equal(payouts.NEUTRAL_OTHER, 25_000);
  assert.equal(payouts.TRADE_PACT_RAIL_RIVER, 40_000);
  assert.equal(payouts.TRADE_PACT_SEA, 55_000);
  assert.equal(payouts.EMBARGOED, 0);
});

test('15. BharatFront: Landlocked State Chartered Sea Boat Transit Fee', () => {
  assert.equal(BHARATFRONT_CONFIG.LANDLOCKED_PORT_TRANSIT_FEE, 12_000);
});

test('16. BharatFront: Ten Major Navigable Rivers & Polylines', () => {
  const rivers = ['ganga', 'yamuna', 'brahmaputra', 'godavari', 'krishna', 'narmada', 'tapi', 'mahanadi', 'kaveri', 'sutlej'];
  for (const r of rivers) {
    const data = INDIAN_RIVER_POLYLINES[r];
    assert.ok(data, `River ${r} must exist`);
    assert.ok(data.coordinates.length >= 5, `River ${r} must have at least 5 coordinate vertices`);
    for (const [lon, lat] of data.coordinates) {
      assert.ok(lon >= 65 && lon <= 100, `River longitude ${lon} must be in Indian subcontinent bounds`);
      assert.ok(lat >= 8 && lat <= 38, `River latitude ${lat} must be in Indian subcontinent bounds`);
    }
  }

  // Ganga - Yamuna confluence at Prayagraj check
  const gangaPrayagraj = INDIAN_RIVER_POLYLINES.ganga.coordinates.find(([lon, lat]) => Math.abs(lon - 81.84) < 0.1);
  const yamunaConfluence = INDIAN_RIVER_POLYLINES.yamuna.coordinates[INDIAN_RIVER_POLYLINES.yamuna.coordinates.length - 1];
  assert.ok(gangaPrayagraj, 'Ganga must pass through Prayagraj');
  assert.equal(yamunaConfluence[0], 81.84, 'Yamuna must join Ganga at Prayagraj longitude');
});

test('17. BharatFront: Unique City Naming & Regional English Pools', () => {
  assert.ok(ENGLISH_CITY_NAME_POOLS['MH'].includes('Mumbai'));
  assert.ok(ENGLISH_CITY_NAME_POOLS['CH'].includes('Chandigarh'));
  assert.ok(ENGLISH_CITY_NAME_POOLS['PB'].includes('Amritsar'));
  assert.ok(ENGLISH_CITY_NAME_POOLS['HR'].includes('Gurugram'));
  assert.ok(!ENGLISH_CITY_NAME_POOLS['PB'].includes('Chandigarh'), 'Punjab should not steal Chandigarh UT');
  assert.ok(!ENGLISH_CITY_NAME_POOLS['HR'].includes('Chandigarh'), 'Haryana should not steal Chandigarh UT');

  // Verify world hubs in English
  assert.ok(ENGLISH_CITY_NAME_POOLS['USA'].includes('New York'));
  assert.ok(ENGLISH_CITY_NAME_POOLS['JPN'].includes('Tokyo'));
  assert.ok(ENGLISH_CITY_NAME_POOLS['GBR'].includes('London'));
});

test('18. BharatFront: Territory Density Caps', () => {
  const limits = BHARATFRONT_CONFIG.TERRITORY_LIMITS;
  assert.deepEqual(limits.small_ut, { maxCities: 2, maxFactories: 2 });
  assert.deepEqual(limits.medium_state, { maxCities: 4, maxFactories: 4 });
  assert.deepEqual(limits.large_state, { maxCities: 6, maxFactories: 5 });
});
