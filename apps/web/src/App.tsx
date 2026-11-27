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

const LOCAL_STORAGE_SAVE_KEY = 'india_statecraft_save_v3';

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
  const [cameraLevel, setCameraLevel] = useState<'WORLD' | 'INDIA' | 'STATE'>('INDIA');
  const [monthProgress, setMonthProgress] = useState<number>(0);

  // Keep a stable ref to current state for the simulation loop
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const lastTickTimeRef = useRef<number>(Date.now());
  const accumulatedMsRef = useRef<number>(0);

  // 2. Dispatch player action
  const dispatchAction = useCallback((action: PlayerAction) => {
    setGameState((prev) => {
      const { nextState } = stepSimulation(prev, action);
      return nextState;
    });
  }, []);

  // 3. Fixed-Timestep Simulation Loop (Prevents tab acceleration & guarantees deterministic pacing)
  useEffect(() => {
    if (gameState.clock.isPaused || gameState.phase === 'STATE_SELECT' || gameState.clock.speed === 0) {
      lastTickTimeRef.current = Date.now();
      return;
    }

    lastTickTimeRef.current = Date.now();
    const intervalMs = 250; // 4Hz sub-tick for smooth UI progress & deterministic accumulator

    const timer = setInterval(() => {
      const now = Date.now();
      const deltaMs = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      // Bound delta to max 5s to avoid runaway bursts from background tabs
      const clampedDeltaMs = Math.min(5000, Math.max(0, deltaMs));
      accumulatedMsRef.current += clampedDeltaMs;

      const tickTargetMs = stateRef.current.clock.tickRateMs;
      const progress = Math.min(1, accumulatedMsRef.current / Math.max(1, tickTargetMs));
      setMonthProgress(progress);

      // When accumulated real time completes the target tick interval, step the simulation!
      if (accumulatedMsRef.current >= tickTargetMs) {
        accumulatedMsRef.current -= tickTargetMs;
        setMonthProgress(0);

        setGameState((prev) => {
          const { nextState, electionResults } = stepSimulation(prev);
          const playerElection = electionResults[nextState.selectedPlayerState];
          if (playerElection && playerElection.occurred) {
            setTimeout(() => alert(playerElection.message), 50);
          }
          return nextState;
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [gameState.clock.isPaused, gameState.clock.tickRateMs, gameState.clock.speed, gameState.phase]);

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
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [gameState]);

  // Handlers
  const handleTogglePause = () => {
    dispatchAction({ type: 'TOGGLE_PAUSE' });
  };

  const handleSetSpeed = (speed: GameSpeed) => {
    accumulatedMsRef.current = 0;
    setMonthProgress(0);
    dispatchAction({ type: 'SET_GAME_SPEED', speed });
  };

  const handleSetPacing = (secondsPerYear: number) => {
    accumulatedMsRef.current = 0;
    setMonthProgress(0);
    dispatchAction({ type: 'SET_PACING_CONFIG', secondsPerYear1x: secondsPerYear });
  };

  const handleSelectStateOnMap = (code: TerritoryCode) => {
    setInspectedStateCode(code);
    setIsDrawerOpen(true);
    setCameraLevel('STATE');
  };

  const handleSelectStateToPlay = (code: TerritoryCode) => {
    dispatchAction({ type: 'SELECT_STATE_TO_PLAY', stateCode: code });
    setInspectedStateCode(code);
    dispatchAction({ type: 'SET_GAME_PHASE', phase: 'PLAYING' });
    setZoomTarget('STATE');
    setCameraLevel('STATE');
  };

  const handleSpectate = () => {
    dispatchAction({ type: 'SET_GAME_PHASE', phase: 'PLAYING' });
    setZoomTarget('INDIA');
    setCameraLevel('INDIA');
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

      {/* 2. Top Header HUD with Progress & Speed Controls */}
      <HeaderHUD
        clock={gameState.clock}
        playerState={playerControlledStateProfile}
        monthProgress={monthProgress}
        onTogglePause={handleTogglePause}
        onSetSpeed={handleSetSpeed}
        onSetPacing={handleSetPacing}
        onOpenStateSelect={() => dispatchAction({ type: 'SET_GAME_PHASE', phase: 'STATE_SELECT' })}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isAutosaving={isAutosaving}
      />

      {/* 3. Camera Breadcrumb Navigation (World > India > State) */}
      <WorldViewZoomControl
        onZoomToWorld={() => {
          setZoomTarget('WORLD');
          setCameraLevel('WORLD');
        }}
        onZoomToIndia={() => {
          setZoomTarget('INDIA');
          setCameraLevel('INDIA');
        }}
        onZoomToState={() => {
          setZoomTarget('STATE');
          setCameraLevel('STATE');
        }}
        selectedStateName={inspectedStateProfile.name}
        currentLevel={cameraLevel}
      />

      {/* 4. MapLibre GL Strategic Map (Natural World Map & Dummynation Golden Glow Heatmap) */}
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

      {/* 6. Thematic Map Legend (Golden Glow in Economy Mode) */}
      <MapLegend mode={activeMode} />

      {/* 7. Strategy Dock (Bottom Consoles) */}
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
