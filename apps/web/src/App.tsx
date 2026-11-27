import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  MapMode,
  TerritoryCode,
  PlayerAction,
  GameSpeed,
} from '@india-statecraft/shared-types';
import { createInitialGameState, stepSimulation } from '@india-statecraft/simulation';
import { MapView } from './map/MapView';
import { HeaderHUD } from './components/HeaderHUD';
import { MapModeBar } from './components/MapModeBar';
import { MapLegend } from './components/MapLegend';
import { StateDetailDrawer } from './components/StateDetailDrawer';
import { WorldViewZoomControl } from './components/WorldViewZoomControl';
import { AuthModal } from './components/AuthModal';
import { StateSelectionScreen } from './components/StateSelectionScreen';
import { StrategyDock, ActivePanel } from './components/StrategyDock';
import { GovernmentPanel } from './components/panels/GovernmentPanel';
import { TransportPanel } from './components/panels/TransportPanel';
import { IndustryPanel } from './components/panels/IndustryPanel';
import { EconomyPanel } from './components/panels/EconomyPanel';
import { ElectionsPanel } from './components/panels/ElectionsPanel';

const LOCAL_STORAGE_SAVE_KEY = 'india_statecraft_save_v2';

export const App: React.FC = () => {
  // 1. Initialize Game State (restore from local storage or create fresh)
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.states && parsed.states.MH?.economy?.gdpUSD) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse local save, creating fresh state:', e);
    }
    // Start fresh in STATE_SELECT phase
    const fresh = createInitialGameState('MH');
    fresh.phase = 'STATE_SELECT';
    return fresh;
  });

  const [activeMode, setActiveMode] = useState<MapMode>('economy');
  const [inspectedStateCode, setInspectedStateCode] = useState<TerritoryCode>('MH');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
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
    if (gameState.clock.isPaused || gameState.phase === 'STATE_SELECT') return;

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
  }, [gameState.clock.isPaused, gameState.clock.tickRateMs, gameState.phase]);

  // 4. Local Guest Auto-Save Loop
  useEffect(() => {
    if (gameState.phase === 'STATE_SELECT') return;
    const saveTimer = setTimeout(() => {
      setIsAutosaving(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVE_KEY, JSON.stringify(gameState));
      } catch (e) {
        console.error('Failed to save state to localStorage:', e);
      } finally {
        setTimeout(() => setIsAutosaving(false), 300);
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [gameState]);

  // Handlers
  const handleTogglePause = () => {
    dispatchAction({ type: 'TOGGLE_PAUSE' });
  };

  const handleSetSpeed = (speed: GameSpeed) => {
    dispatchAction({ type: 'SET_GAME_SPEED', speed });
  };

  const handleSelectStateOnMap = (code: TerritoryCode) => {
    setInspectedStateCode(code);
    setIsDrawerOpen(true);
  };

  const handleSelectStateToPlay = (code: TerritoryCode) => {
    dispatchAction({ type: 'SELECT_STATE_TO_PLAY', stateCode: code });
    setInspectedStateCode(code);
    dispatchAction({ type: 'SET_GAME_PHASE', phase: 'PLAYING' });
  };

  const handleSpectate = () => {
    dispatchAction({ type: 'SET_GAME_PHASE', phase: 'PLAYING' });
  };

  const inspectedStateProfile = gameState.states[inspectedStateCode] || gameState.states['MH'];
  const playerControlledStateProfile = gameState.states[gameState.selectedPlayerState] || gameState.states['MH'];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. Pre-Game State Selection Screen */}
      {gameState.phase === 'STATE_SELECT' && (
        <StateSelectionScreen
          states={gameState.states}
          onSelectStateToPlay={handleSelectStateToPlay}
          onSpectate={handleSpectate}
        />
      )}

      {/* 2. Top Header HUD */}
      <HeaderHUD
        clock={gameState.clock}
        playerState={playerControlledStateProfile}
        onTogglePause={handleTogglePause}
        onSetSpeed={handleSetSpeed}
        onOpenStateSelect={() => dispatchAction({ type: 'SET_GAME_PHASE', phase: 'STATE_SELECT' })}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isAutosaving={isAutosaving}
      />

      {/* 3. Camera / Zoom Switcher */}
      <WorldViewZoomControl
        onZoomToWorld={() => setZoomTarget('WORLD')}
        onZoomToIndia={() => setZoomTarget('INDIA')}
        onZoomToState={() => setZoomTarget('STATE')}
        selectedStateName={inspectedStateProfile.name}
      />

      {/* 4. Central Strategy Map (MapLibre GL) */}
      <MapView
        states={gameState.states}
        activeMode={activeMode}
        selectedStateCode={inspectedStateCode}
        onSelectState={handleSelectStateOnMap}
        zoomTarget={zoomTarget}
        onZoomComplete={() => setZoomTarget(null)}
      />

      {/* 5. Thematic Map Modes Bar (12 Modes) */}
      <MapModeBar activeMode={activeMode} onSelectMode={setActiveMode} />

      {/* 6. Thematic Map Legend */}
      <MapLegend mode={activeMode} />

      {/* 7. Strategy Dock (Bottom Bar) */}
      <StrategyDock
        activePanel={activePanel}
        onTogglePanel={(p) => setActivePanel(p)}
      />

      {/* 8. Strategy Panels */}
      {activePanel === 'GOVERNMENT' && (
        <GovernmentPanel
          stateProfile={playerControlledStateProfile}
          isPlayerControlled={true}
          onClose={() => setActivePanel(null)}
          onDispatchAction={dispatchAction}
        />
      )}

      {activePanel === 'TRANSPORT' && (
        <TransportPanel
          stateProfile={playerControlledStateProfile}
          isPlayerControlled={true}
          onClose={() => setActivePanel(null)}
          onDispatchAction={dispatchAction}
        />
      )}

      {activePanel === 'INDUSTRY' && (
        <IndustryPanel
          stateProfile={playerControlledStateProfile}
          isPlayerControlled={true}
          onClose={() => setActivePanel(null)}
          onDispatchAction={dispatchAction}
        />
      )}

      {activePanel === 'ECONOMY' && (
        <EconomyPanel
          stateProfile={playerControlledStateProfile}
          isPlayerControlled={true}
          onClose={() => setActivePanel(null)}
          onDispatchAction={dispatchAction}
        />
      )}

      {activePanel === 'ELECTIONS' && (
        <ElectionsPanel
          stateProfile={playerControlledStateProfile}
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* 9. State Detail Drawer (when inspecting any state on the map) */}
      {isDrawerOpen && inspectedStateProfile && (
        <StateDetailDrawer
          stateProfile={inspectedStateProfile}
          isPlayerControlled={inspectedStateCode === gameState.selectedPlayerState}
          onClose={() => setIsDrawerOpen(false)}
          onDispatchAction={dispatchAction}
          onOpenPanel={(panel) => {
            setIsDrawerOpen(false);
            setActivePanel(panel);
          }}
        />
      )}

      {/* 10. Auth & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
