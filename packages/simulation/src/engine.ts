import {
  GameState,
  PlayerAction,
  StateProfile,
  TerritoryCode,
  IndianStateCode,
} from '@india-statecraft/shared-types';
import {
  ALL_TERRITORIES_DATA,
  BUILDING_DEFINITIONS,
  getProgressiveBuildingCostUSD,
  getBuildingUpgradeCostUSD,
  MAX_BUILDING_LEVEL,
  calculateTrainEconomics,
  DEFAULT_GAME_TIME_CONFIG,
} from '@india-statecraft/game-data';
import { stepEconomy } from './economy.js';
import { stepDemographics } from './demographics.js';
import { stepHydrology } from './hydrology.js';
import { stepPolitics, ElectionResult } from './politics.js';

export interface StepOutput {
  nextState: GameState;
  electionResults: Partial<Record<TerritoryCode, ElectionResult>>;
}

/**
 * Creates fresh initial game state.
 */
export function createInitialGameState(selectedState: IndianStateCode = 'MH'): GameState {
  const secondsPerYear1x = DEFAULT_GAME_TIME_CONFIG.secondsPerYear1x; // 2160s = 36 min/yr
  return {
    version: '0.2.0',
    phase: 'STATE_SELECT', // Start in state selection mode
    selectedPlayerState: selectedState,
    inspectedState: selectedState,
    clock: {
      currentTick: 1,
      currentYear: 2026,
      currentMonth: 1,
      currentDay: 1,
      isPaused: false,
      speed: 1,
      tickRateMs: Math.round((secondsPerYear1x * 1000) / 12), // 180,000 ms at 1x
      secondsPerYear1x,
    },
    states: JSON.parse(JSON.stringify(ALL_TERRITORIES_DATA)),
    globalMarketPrices: {
      freightCargoUnitUSD: 0.15,
      passengerKmUSD: 0.28,
      powerMWhUSD: 65,
      rawMaterialsUnitUSD: 42,
    },
  };
}

/**
 * Pure deterministic reducer stepping the simulation forward.
 */
export function stepSimulation(currentState: GameState, action?: PlayerAction): StepOutput {
  let state = { ...currentState };

  if (action) {
    state = handlePlayerAction(state, action);
    // If the action was just UI state, speed, or pause, return immediately without ticking time
    if (
      action.type === 'SELECT_STATE_TO_PLAY' ||
      action.type === 'SET_INSPECTED_STATE' ||
      action.type === 'SET_GAME_PHASE' ||
      action.type === 'SET_GAME_SPEED' ||
      action.type === 'SET_PACING_CONFIG' ||
      action.type === 'TOGGLE_PAUSE'
    ) {
      return { nextState: state, electionResults: {} };
    }
  }

  // If clock is paused or speed is 0 or still in state select phase, don't tick time
  if (state.clock.isPaused || state.clock.speed === 0 || state.phase !== 'PLAYING') {
    return { nextState: state, electionResults: {} };
  }

  // 1. Advance the clock
  const nextTick = state.clock.currentTick + 1;
  let nextMonth = state.clock.currentMonth + 1;
  let nextYear = state.clock.currentYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const isMonsoon = nextMonth >= 6 && nextMonth <= 9;
  const nextStates: Record<TerritoryCode, StateProfile> = {} as any;
  const electionResults: Partial<Record<TerritoryCode, ElectionResult>> = {};

  // 2. Step all 28 states and 8 UTs
  for (const [code, prevState] of Object.entries(state.states) as [TerritoryCode, StateProfile][]) {
    // 2a. Advance building construction ticks
    const updatedBuildings = prevState.buildings.map((b) => {
      if (b.isUnderConstruction && b.ticksRemaining > 0) {
        const remaining = b.ticksRemaining - 1;
        return {
          ...b,
          ticksRemaining: remaining,
          isUnderConstruction: remaining > 0,
        };
      }
      return b;
    });

    // 2b. Recalculate train route economics
    const updatedRoutes = prevState.routes.map((route) => {
      const eco = calculateTrainEconomics(route.distanceKm, route.trainType, route.activeTrainsCount);
      return {
        ...route,
        cargoCarriedMonthlyUnits: eco.monthlyCargoUnits,
        passengersCarriedMonthly: eco.monthlyPassengers,
        monthlyRevenueUSD: eco.monthlyRevenueUSD,
        monthlyOperatingCostUSD: eco.monthlyOperatingCostUSD,
        monthlyMaintenanceCostUSD: eco.monthlyMaintenanceCostUSD,
        monthlyProfitUSD: eco.monthlyProfitUSD,
      };
    });

    // 2c. Economy step (USD values)
    const nextEconomy = stepEconomy(
      prevState.economy,
      updatedBuildings,
      updatedRoutes,
      prevState.infrastructure.powerGridReliabilityIndex,
      isMonsoon
    );

    const monthlyGrowth =
      (nextEconomy.gdpUSD - prevState.economy.gdpUSD) / Math.max(1, prevState.economy.gdpUSD);

    // 2d. Demographics step
    const nextDemographics = stepDemographics(
      prevState.demographics,
      monthlyGrowth,
      prevState.infrastructure.powerGridReliabilityIndex
    );

    // 2e. Hydrology step
    const nextWater = stepHydrology(prevState.water, nextMonth);

    // 2f. Politics step
    const { politics: nextPolitics, electionResult } = stepPolitics(
      prevState.politics,
      nextDemographics.happinessIndex,
      nextDemographics.unemploymentRate,
      nextEconomy.taxPolicy
    );

    if (electionResult && electionResult.occurred) {
      electionResults[code] = electionResult;
    }

    const steppedProfile: StateProfile = {
      ...prevState,
      buildings: updatedBuildings,
      routes: updatedRoutes,
      economy: nextEconomy,
      demographics: nextDemographics,
      water: nextWater,
      politics: nextPolitics,
      industryOutputIndex: Math.min(
        100,
        Math.round(prevState.industryOutputIndex * (1 + monthlyGrowth * 0.5))
      ),
      agricultureOutputIndex: Math.min(
        100,
        Math.round(prevState.agricultureOutputIndex * (isMonsoon ? 1.01 : 0.998))
      ),
      tradeVolumeIndex: Math.min(
        100,
        Math.round(prevState.tradeVolumeIndex * (1 + monthlyGrowth * 0.4))
      ),
    };

    // Computer-driven AI states build Cities, Factories, Railway Stations, Ports & Dams
    nextStates[code] =
      code !== state.selectedPlayerState
        ? runAIStateDecision(steppedProfile, nextTick)
        : steppedProfile;
  }

  const nextGameState: GameState = {
    ...state,
    clock: {
      ...state.clock,
      currentTick: nextTick,
      currentYear: nextYear,
      currentMonth: nextMonth,
    },
    states: nextStates,
  };

  return { nextState: nextGameState, electionResults };
}

function handlePlayerAction(state: GameState, action: PlayerAction): GameState {
  switch (action.type) {
    case 'SELECT_STATE_TO_PLAY':
      return {
        ...state,
        selectedPlayerState: action.stateCode,
        inspectedState: action.stateCode,
        phase: 'PLAYING',
      };

    case 'SET_INSPECTED_STATE':
      return {
        ...state,
        inspectedState: action.stateCode,
      };

    case 'SET_GAME_PHASE':
      return {
        ...state,
        phase: action.phase,
      };

    case 'TOGGLE_PAUSE':
      return {
        ...state,
        clock: {
          ...state.clock,
          isPaused: !state.clock.isPaused,
        },
      };

    case 'SET_GAME_SPEED': {
      const spd = action.speed;
      const seconds1x = state.clock.secondsPerYear1x || DEFAULT_GAME_TIME_CONFIG.secondsPerYear1x;
      const tickRateMs = spd === 0 ? 0 : Math.round((seconds1x * 1000) / (12 * spd));
      return {
        ...state,
        clock: {
          ...state.clock,
          speed: spd,
          isPaused: spd === 0,
          tickRateMs: tickRateMs > 0 ? tickRateMs : state.clock.tickRateMs,
        },
      };
    }

    case 'SET_PACING_CONFIG': {
      const seconds1x = action.secondsPerYear1x;
      const spd = state.clock.speed;
      const tickRateMs = spd === 0 ? 0 : Math.round((seconds1x * 1000) / (12 * spd));
      return {
        ...state,
        clock: {
          ...state.clock,
          secondsPerYear1x: seconds1x,
          tickRateMs: tickRateMs > 0 ? tickRateMs : state.clock.tickRateMs,
        },
      };
    }

    case 'UPDATE_TAX_POLICY': {
      const stateObj = state.states[action.stateCode];
      if (!stateObj) return state;

      const updatedPolicy = {
        ...stateObj.economy.taxPolicy,
        ...action.taxPolicy,
      };

      return {
        ...state,
        states: {
          ...state.states,
          [action.stateCode]: {
            ...stateObj,
            economy: {
              ...stateObj.economy,
              taxPolicy: updatedPolicy,
            },
          },
        },
      };
    }

    case 'COMMENCE_BUILDING_CONSTRUCTION': {
      const stateObj = state.states[action.stateCode];
      const buildingDef = BUILDING_DEFINITIONS[action.buildingType];
      if (!stateObj || !buildingDef) return state;

      // Progressive OpenFront-style cost scaling balanced for USD economy
      const ownedOfType = stateObj.buildings.filter((b) => b.type === action.buildingType).length;
      const costUSD = getProgressiveBuildingCostUSD(action.buildingType, ownedOfType);

      // Check treasury funds
      if (stateObj.economy.treasuryUSD < costUSD) {
        return state; // Insufficient funds
      }

      // Check geographic suitability
      if (buildingDef.requiresRiver && stateObj.majorRivers.length === 0) {
        return state; // Dam requires a river
      }
      if (
        buildingDef.requiresCoastal &&
        stateObj.infrastructure.portType !== 'COASTAL_PORT' &&
        stateObj.majorRivers.length === 0
      ) {
        return state; // Seaport requires coastal geography or a navigable river
      }

      const newBuildingInstance = {
        id: `b_${action.stateCode.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: action.buildingType,
        level: 1,
        isUnderConstruction: true,
        ticksRemaining: buildingDef.constructionTimeTicks,
        totalTicks: buildingDef.constructionTimeTicks,
        healthPercent: 100,
        coords: action.coords,
        locationName: action.locationName,
      };

      const nextTreasury = stateObj.economy.treasuryUSD - costUSD;

      return {
        ...state,
        states: {
          ...state.states,
          [action.stateCode]: {
            ...stateObj,
            economy: {
              ...stateObj.economy,
              treasuryUSD: nextTreasury,
            },
            buildings: [...stateObj.buildings, newBuildingInstance],
          },
        },
      };
    }

    case 'UPGRADE_BUILDING': {
      const stateObj = state.states[action.stateCode];
      if (!stateObj) return state;

      const idx = stateObj.buildings.findIndex((b) => b.id === action.buildingId);
      if (idx === -1) return state;

      const target = stateObj.buildings[idx];
      const currentLevel = target.level || 1;
      if (currentLevel >= MAX_BUILDING_LEVEL) return state;

      const upgradeCost = getBuildingUpgradeCostUSD(target.type, currentLevel);
      if (stateObj.economy.treasuryUSD < upgradeCost) {
        return state;
      }

      const updatedBuildings = stateObj.buildings.map((b, i) =>
        i === idx ? { ...b, level: currentLevel + 1 } : b
      );

      return {
        ...state,
        states: {
          ...state.states,
          [action.stateCode]: {
            ...stateObj,
            economy: {
              ...stateObj.economy,
              treasuryUSD: stateObj.economy.treasuryUSD - upgradeCost,
            },
            buildings: updatedBuildings,
          },
        },
      };
    }

    case 'PURCHASE_TRAIN_ROUTE': {
      const stateObj = state.states[action.stateCode];
      if (!stateObj) return state;

      const eco = calculateTrainEconomics(
        action.distanceKm,
        action.trainType,
        action.activeTrainsCount
      );

      const newRoute = {
        id: `route_${Date.now()}`,
        name: `${action.fromCity} ↔ ${action.toCity} Transit`,
        trainType: action.trainType,
        originState: action.stateCode,
        destinationState: action.stateCode,
        originCity: action.fromCity,
        destinationCity: action.toCity,
        distanceKm: action.distanceKm,
        activeTrainsCount: action.activeTrainsCount,
        isInterstate: false,
        cargoCarriedMonthlyUnits: eco.monthlyCargoUnits,
        passengersCarriedMonthly: eco.monthlyPassengers,
        monthlyRevenueUSD: eco.monthlyRevenueUSD,
        monthlyOperatingCostUSD: eco.monthlyOperatingCostUSD,
        monthlyMaintenanceCostUSD: eco.monthlyMaintenanceCostUSD,
        monthlyProfitUSD: eco.monthlyProfitUSD,
      };

      return {
        ...state,
        states: {
          ...state.states,
          [action.stateCode]: {
            ...stateObj,
            routes: [...stateObj.routes, newRoute],
          },
        },
      };
    }

    case 'REBALANCE_PUBLIC_BUDGET': {
      const stateObj = state.states[action.stateCode];
      if (!stateObj) return state;

      const totalDiscretionary =
        stateObj.economy.budget.publicInvestmentUSD + stateObj.economy.budget.welfareAndSubsidiesUSD;
      const newInvest = Math.round(totalDiscretionary * action.publicInvestmentShare);
      const newWelfare = totalDiscretionary - newInvest;

      return {
        ...state,
        states: {
          ...state.states,
          [action.stateCode]: {
            ...stateObj,
            economy: {
              ...stateObj.economy,
              budget: {
                ...stateObj.economy.budget,
                publicInvestmentUSD: newInvest,
                welfareAndSubsidiesUSD: newWelfare,
              },
            },
          },
        },
      };
    }

    default:
      return state;
  }
}

const AI_STATE_CENTERS: Partial<Record<TerritoryCode, [number, number]>> = {
  MH: [75.7, 19.7], GJ: [71.2, 22.2], KA: [75.7, 15.3], TN: [78.6, 11.1],
  UP: [80.9, 26.8], WB: [87.8, 22.9], AP: [79.7, 15.9], TS: [79.0, 17.8],
  KL: [76.2, 10.8], RJ: [74.2, 27.0], MP: [77.4, 23.2], BR: [85.3, 25.6],
  PB: [75.3, 31.1], HR: [76.3, 29.0], OD: [85.0, 20.9], JH: [85.3, 23.6],
  AS: [92.9, 26.2], CG: [81.8, 21.2], UK: [79.0, 30.0], HP: [77.1, 31.1],
  GA: [74.0, 15.3], TR: [91.7, 23.8], ML: [91.3, 25.5], MN: [93.9, 24.8],
  NL: [94.5, 26.1], MZ: [92.9, 23.1], SK: [88.5, 27.5], AR: [94.7, 28.2],
  DL: [77.2, 28.6], JK: [74.8, 33.7], LA: [77.5, 34.2], CH: [76.77, 30.73],
  PY: [79.8, 11.9], AN: [92.7, 11.6], LD: [72.6, 10.5], DNHDD: [72.9, 20.4],
};

/**
 * Computer-driven AI state economic decisions:
 * AI states respect the exact same treasury, geographic, and progressive cost rules
 * to build Cities, Factories, Railway Stations, Sea Ports, Dams, and upgrade them.
 */
function runAIStateDecision(stateObj: StateProfile, tick: number): StateProfile {
  // Stagger AI decisions across ticks so all 35 AI states don't build on the exact same frame
  const codeHash = stateObj.code.charCodeAt(0) + (stateObj.code.charCodeAt(1) || 0);
  if ((tick + codeHash) % 3 !== 0) return stateObj;

  const treasury = stateObj.economy.treasuryUSD;
  const center = AI_STATE_CENTERS[stateObj.code] || [78.9, 22.5];

  // Prioritize upgrading an existing completed building when affordable
  const upgradable = stateObj.buildings.find(
    (b) => !b.isUnderConstruction && (b.level || 1) < 4
  );
  if (upgradable && (tick + codeHash) % 6 === 0) {
    const upgCost = getBuildingUpgradeCostUSD(upgradable.type, upgradable.level || 1);
    if (treasury >= upgCost * 1.25) {
      return {
        ...stateObj,
        economy: { ...stateObj.economy, treasuryUSD: treasury - upgCost },
        buildings: stateObj.buildings.map((b) =>
          b.id === upgradable.id ? { ...b, level: (b.level || 1) + 1 } : b
        ),
      };
    }
  }

  // Otherwise construct new infrastructure based on state needs
  const counts = {
    RESIDENTIAL: stateObj.buildings.filter((b) => b.type === 'RESIDENTIAL').length,
    FACTORY: stateObj.buildings.filter((b) => b.type === 'FACTORY').length,
    RAILWAY_DEPOT: stateObj.buildings.filter((b) => b.type === 'RAILWAY_DEPOT').length,
    SEAPORT: stateObj.buildings.filter((b) => b.type === 'SEAPORT').length,
    DAM: stateObj.buildings.filter((b) => b.type === 'DAM').length,
  };

  let targetType: 'RESIDENTIAL' | 'FACTORY' | 'RAILWAY_DEPOT' | 'SEAPORT' | 'DAM' | null = null;
  if (counts.FACTORY < 4 && counts.FACTORY <= counts.RESIDENTIAL) {
    targetType = 'FACTORY';
  } else if (counts.RESIDENTIAL < 4) {
    targetType = 'RESIDENTIAL';
  } else if (counts.RAILWAY_DEPOT < 3) {
    targetType = 'RAILWAY_DEPOT';
  } else if (
    counts.SEAPORT < 2 &&
    (stateObj.infrastructure.portType === 'COASTAL_PORT' || stateObj.majorRivers.length > 0)
  ) {
    targetType = 'SEAPORT';
  } else if (counts.DAM < 2 && stateObj.majorRivers.length > 0) {
    targetType = 'DAM';
  }

  if (!targetType) return stateObj;

  const cost = getProgressiveBuildingCostUSD(targetType, counts[targetType]);
  if (treasury < cost * 1.2) return stateObj; // Keep 20% fiscal reserve

  const def = BUILDING_DEFINITIONS[targetType];
  // Deterministic geographic offset within state radius
  const angle = ((tick * 137.5 + codeHash * 41) % 360) * (Math.PI / 180);
  const radius = 0.35 + ((tick + codeHash) % 5) * 0.12;
  const coords: [number, number] = [
    Number((center[0] + Math.cos(angle) * radius).toFixed(4)),
    Number((center[1] + Math.sin(angle) * radius).toFixed(4)),
  ];

  const cityNamePool = stateObj.majorCities.filter(
    (c) => !stateObj.buildings.some((b) => b.locationName === c)
  );
  const locationName =
    targetType === 'RESIDENTIAL'
      ? cityNamePool[0] || `${stateObj.name} City ${counts.RESIDENTIAL + 1}`
      : undefined;

  return {
    ...stateObj,
    economy: { ...stateObj.economy, treasuryUSD: treasury - cost },
    buildings: [
      ...stateObj.buildings,
      {
        id: `ai_${stateObj.code.toLowerCase()}_${tick}_${counts[targetType]}`,
        type: targetType,
        level: 1,
        isUnderConstruction: true,
        ticksRemaining: def.constructionTimeTicks,
        totalTicks: def.constructionTimeTicks,
        healthPercent: 100,
        coords,
        locationName,
      },
    ],
  };
}
