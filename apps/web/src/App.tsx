import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  MapMode,
  TerritoryCode,
  PlayerAction,
} from '@india-statecraft/shared-types';
import { createInitialGameState, stepSimulation } from '@india-statecraft/simulation';
import { MapView } from './map/MapView';
import { HeaderHUD } from './components/HeaderHUD';
import { MapModeBar } from './components/MapModeBar';
import { MapLegend } from './components/MapLegend';
import { StateDetailDrawer } from './components/StateDetailDrawer';
import { WorldViewZoomControl } from './components/WorldViewZoomControl';
import { AuthModal } from './components/AuthModal';

const LOCAL_STORAGE_SAVE_KEY = 'india_statecraft_save_v1';

export const App: React.FC = () => {
  // 1. Initialize Game State (restore from local storage or create fresh)
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not parse local save, creating fresh state:', e);
    }
    return createInitialGameState('MH'); // Default starting state: Maharashtra
  });

  const [activeMode, setActiveMode] = useState<MapMode>('economy');
  const [inspectedStateCode, setInspectedStateCode] = useState<TerritoryCode>('MH');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [zoomTarget, setZoomTarget] = useState<'WORLD' | 'INDIA' | 'STATE' | null>(null);

  // Keep a stable ref to current state for the tick interval
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // 2. Dispatch player action
  const dispatchAction = useCallback((action: PlayerAction) => {
    setGameState((prev) => {
      const { nextState } = stepSimulation(prev, action);
      return nextState;
    });
  }, []);

  // 3. Simulation Tick Loop
  useEffect(() => {
    if (gameState.clock.isPaused) return;

    const intervalId = setInterval(() => {
      const { nextState, electionResults } = stepSimulation(stateRef.current);
      setGameState(nextState);

      // Alert if election occurred in the player's controlled state
      const playerElection = electionResults[nextState.selectedPlayerState];
      if (playerElection && playerElection.occurred) {
        alert(playerElection.message);
      }
    }, gameState.clock.tickRateMs);

    return () => clearInterval(intervalId);
  }, [gameState.clock.isPaused, gameState.clock.tickRateMs]);

  // 4. Local Guest Auto-Save Loop (Runs every 10 seconds or on state changes)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      setIsAutosaving(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVE_KEY, JSON.stringify(gameState));
      } catch (e) {
        console.error('Failed to save state to localStorage:', e);
      } finally {
        setTimeout(() => setIsAutosaving(false), 300);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [gameState]);

  // Handlers
  const handleTogglePause = () => {
    if (gameState.clock.isPaused) {
      dispatchAction({ type: 'RESUME_SIMULATION' });
    } else {
      dispatchAction({ type: 'PAUSE_SIMULATION' });
    }
  };

  const handleSetSpeed = (rateMs: number) => {
    dispatchAction({ type: 'SET_TICK_RATE', rateMs });
  };

  const handleSelectStateOnMap = (code: TerritoryCode) => {
    setInspectedStateCode(code);
    setIsDrawerOpen(true);
  };

  const inspectedStateProfile = gameState.states[inspectedStateCode];
  const playerControlledStateProfile = gameState.states[gameState.selectedPlayerState];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Header HUD */}
      <HeaderHUD
        clock={gameState.clock}
        selectedStateCode={gameState.selectedPlayerState}
        selectedStateName={playerControlledStateProfile.name}
        onTogglePause={handleTogglePause}
        onSetSpeed={handleSetSpeed}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isAutosaving={isAutosaving}
      />

      {/* 2. World / Subcontinent / State Camera Switcher */}
      <WorldViewZoomControl
        onZoomToWorld={() => setZoomTarget('WORLD')}
        onZoomToIndia={() => setZoomTarget('INDIA')}
        onZoomToState={() => setZoomTarget('STATE')}
        selectedStateName={inspectedStateProfile.name}
      />

      {/* 3. The Central MapLibre GL Map */}
      <MapView
        states={gameState.states}
        activeMode={activeMode}
        selectedStateCode={inspectedStateCode}
        onSelectState={handleSelectStateOnMap}
        zoomTarget={zoomTarget}
        onZoomComplete={() => setZoomTarget(null)}
      />

      {/* 4. Dynamic Map Mode Switcher (12 Modes) */}
      <MapModeBar activeMode={activeMode} onSelectMode={setActiveMode} />

      {/* 5. Thematic Map Legend */}
      <MapLegend mode={activeMode} />

      {/* 6. Chief Minister State Drawer */}
      {isDrawerOpen && inspectedStateProfile && (
        <StateDetailDrawer
          stateProfile={inspectedStateProfile}
          isPlayerControlled={inspectedStateCode === gameState.selectedPlayerState}
          onClose={() => setIsDrawerOpen(false)}
          onDispatchAction={dispatchAction}
        />
      )}

      {/* 7. Auth & Save Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
