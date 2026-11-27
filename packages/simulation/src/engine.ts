import {
  GameState,
  PlayerAction,
  StateProfile,
  TerritoryCode,
  IndianStateCode,
} from '@india-statecraft/shared-types';
import { ALL_TERRITORIES_DATA } from '@india-statecraft/game-data';
import { stepEconomy } from './economy.js';
import { stepDemographics } from './demographics.js';
import { stepHydrology } from './hydrology.js';
import { stepPolitics, ElectionResult } from './politics.js';

export interface StepOutput {
  nextState: GameState;
  electionResults: Partial<Record<TerritoryCode, ElectionResult>>;
}

/**
 * Creates a brand new fresh initial game state.
 */
export function createInitialGameState(selectedState: IndianStateCode = 'MH'): GameState {
  return {
    version: '0.1.0',
    selectedPlayerState: selectedState,
    clock: {
      currentTick: 1,
      currentYear: 2026,
      currentMonth: 1,
      isPaused: false,
      tickRateMs: 2000,
    },
    states: JSON.parse(JSON.stringify(ALL_TERRITORIES_DATA)),
  };
}

/**
 * Pure deterministic reducer stepping the simulation forward.
 */
export function stepSimulation(
  currentState: GameState,
  action?: PlayerAction
): StepOutput {
  // If an action was dispatched, handle it
  let state = { ...currentState };

  if (action) {
    state = handlePlayerAction(state, action);
    // If the action was just pause/resume or config change, return without stepping time
    if (
      action.type === 'PAUSE_SIMULATION' ||
      action.type === 'RESUME_SIMULATION' ||
      action.type === 'SET_TICK_RATE'
    ) {
      return { nextState: state, electionResults: {} };
    }
  }

  // If clock is paused, no time passage
  if (state.clock.isPaused) {
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
    // Economy
    const nextEconomy = stepEconomy(
      prevState.economy,
      prevState.infrastructure.powerGridReliabilityIndex,
      isMonsoon
    );

    const monthlyGrowth =
      (nextEconomy.gsdpNominalCrore - prevState.economy.gsdpNominalCrore) / prevState.economy.gsdpNominalCrore;

    // Demographics
    const nextDemographics = stepDemographics(
      prevState.demographics,
      monthlyGrowth,
      prevState.infrastructure.powerGridReliabilityIndex
    );

    // Hydrology
    const nextWater = stepHydrology(prevState.water, nextMonth);

    // Politics
    const { politics: nextPolitics, electionResult } = stepPolitics(
      prevState.politics,
      nextDemographics.happinessIndex,
      nextEconomy.fiscalDeficitGsdpRatio,
      nextDemographics.unemploymentRate
    );

    if (electionResult && electionResult.occurred) {
      electionResults[code] = electionResult;
    }

    nextStates[code] = {
      ...prevState,
      economy: nextEconomy,
      demographics: nextDemographics,
      water: nextWater,
      politics: nextPolitics,
      // Dynamic output index syncs
      industryOutputIndex: Math.min(
        100,
        Math.round(prevState.industryOutputIndex * (1 + monthlyGrowth * 0.5))
      ),
      agricultureOutputIndex: Math.min(
        100,
        Math.round(
          prevState.agricultureOutputIndex *
            (isMonsoon ? 1.01 : 0.998)
        )
      ),
      tradeVolumeIndex: Math.min(
        100,
        Math.round(prevState.tradeVolumeIndex * (1 + monthlyGrowth * 0.4))
      ),
    };
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
    case 'PAUSE_SIMULATION':
      return { ...state, clock: { ...state.clock, isPaused: true } };

    case 'RESUME_SIMULATION':
      return { ...state, clock: { ...state.clock, isPaused: false } };

    case 'SET_TICK_RATE':
      return { ...state, clock: { ...state.clock, tickRateMs: action.rateMs } };

    case 'ALLOCATE_BUDGET': {
      const stateObj = state.states[action.stateCode];
      if (!stateObj) return state;

      const totalDiscretionary =
        stateObj.economy.budget.capitalExpenditure + stateObj.economy.budget.welfareAndSubsidies;
      const newCapex = Math.round(totalDiscretionary * action.capexShare);
      const newWelfare = totalDiscretionary - newCapex;

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
                capitalExpenditure: newCapex,
                welfareAndSubsidies: newWelfare,
              },
            },
          },
        },
      };
    }

    case 'ADJUST_TAX_RATES': {
      const stateObj = state.states[action.stateCode];
      if (!stateObj) return state;

      const nextSgst = Math.round(stateObj.economy.budget.sgst * (1 + action.sgstAdjustment));
      const nextStamp = Math.round(
        stateObj.economy.budget.stampDutyRegistration * (1 + action.stampDutyAdjustment)
      );

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
                sgst: nextSgst,
                stampDutyRegistration: nextStamp,
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
