import React from 'react';
import { Play, Pause, FastForward, Shield, Cloud, HardDrive, RefreshCw } from 'lucide-react';
import { GameSimulationClock, TerritoryCode } from '@india-statecraft/shared-types';

interface HeaderHUDProps {
  clock: GameSimulationClock;
  selectedStateCode: TerritoryCode;
  selectedStateName: string;
  onTogglePause: () => void;
  onSetSpeed: (speedMs: number) => void;
  onOpenAuth: () => void;
  isAutosaving: boolean;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  clock,
  selectedStateCode,
  selectedStateName,
  onTogglePause,
  onSetSpeed,
  onOpenAuth,
  isAutosaving,
}) => {
  const isSpeedFast = clock.tickRateMs < 1000;

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Left: Branding & State Focus */}
      <div className="glass-panel rounded-xl px-5 py-2.5 flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm tracking-wider">
            IS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm tracking-wider uppercase text-slate-100">
                India: Statecraft
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                v0.1.0-alpha
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Governing:</span>
              <span className="font-semibold text-sky-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                {selectedStateName} ({selectedStateCode})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Clock, Speed Controls & Electoral Mandate */}
      <div className="glass-panel rounded-xl px-5 py-2 flex items-center gap-6 pointer-events-auto">
        {/* Date Display */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-100 font-mono">
              {MONTH_NAMES[clock.currentMonth - 1]} {clock.currentYear}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Tick #{clock.currentTick} (1 Mo/Tick)
            </div>
          </div>

          {/* Time Controls */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5">
            <button
              onClick={onTogglePause}
              title={clock.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
              className={`p-1.5 rounded transition-colors ${
                clock.isPaused
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {clock.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onSetSpeed(isSpeedFast ? 2000 : 650)}
              title={isSpeedFast ? 'Normal Speed (1x)' : 'Fast Forward (3x)'}
              className={`p-1.5 rounded transition-colors ${
                isSpeedFast
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Guest Mode, Save Indicator & Auth */}
      <div className="glass-panel rounded-xl px-4 py-2 flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          {isAutosaving ? (
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : (
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>Guest Mode (Local)</span>
        </div>

        <button
          onClick={onOpenAuth}
          className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
        >
          <Cloud className="w-3.5 h-3.5 text-sky-400" />
          <span>Cloud Sync</span>
        </button>
      </div>
    </header>
  );
};
