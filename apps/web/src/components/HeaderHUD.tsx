import React from 'react';
import { Play, Pause, RefreshCw, TrendingUp, DollarSign, Users, Award, ChevronRight } from 'lucide-react';
import { GameSimulationClock, StateProfile, GameSpeed } from '@india-statecraft/shared-types';
import { formatUSD } from '@india-statecraft/map-data';

interface HeaderHUDProps {
  clock: GameSimulationClock;
  playerState: StateProfile;
  onTogglePause: () => void;
  onSetSpeed: (speed: GameSpeed) => void;
  onOpenStateSelect: () => void;
  onOpenAuth: () => void;
  isAutosaving: boolean;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  clock,
  playerState,
  onTogglePause,
  onSetSpeed,
  onOpenStateSelect,
  isAutosaving,
}) => {
  const { economy, demographics, politics } = playerState;
  const netMonthly = economy.monthlyRevenueUSD - economy.monthlyExpenditureUSD;
  const isNetPositive = netMonthly >= 0;

  const speeds: GameSpeed[] = [1, 2, 4, 8];

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-4">
      {/* Left: Branding & State Badge */}
      <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3.5 pointer-events-auto bg-slate-950/80 shadow-2xl border border-white/10">
        <button
          onClick={onOpenStateSelect}
          title="Switch Governed State"
          className="flex items-center gap-2.5 text-left group hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm tracking-wider shadow-md shadow-amber-500/20">
            {playerState.code}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-wider uppercase text-slate-100 group-hover:text-amber-400 transition-colors">
                {playerState.name}
              </span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                CM
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {politics.rulingPartyName}
            </div>
          </div>
        </button>
      </div>

      {/* Center: Live Economic HUD Bar */}
      <div className="glass-panel rounded-2xl px-5 py-2 flex items-center gap-6 pointer-events-auto bg-slate-950/85 shadow-2xl border border-white/10">
        {/* Treasury ($) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Treasury</div>
            <div className="text-xs font-black font-mono text-amber-400 flex items-center gap-1">
              {formatUSD(economy.treasuryUSD)}
              <span className={`text-[9px] font-mono font-bold ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({isNetPositive ? '+' : ''}{formatUSD(netMonthly)}/mo)
              </span>
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* State GDP ($) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">GDP (Value Added)</div>
            <div className="text-xs font-black font-mono text-emerald-400 flex items-center gap-1">
              {formatUSD(economy.gdpUSD)}
              <span className="text-[9px] text-emerald-300 font-mono font-normal">
                (+{(economy.gdpGrowthRate * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Public Approval (%) */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Approval</div>
            <div className="text-xs font-black font-mono text-purple-300">
              {politics.governingApprovalPercent}%
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Population */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Population</div>
            <div className="text-xs font-black font-mono text-sky-300">
              {(demographics.population / 1_000_000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Right: Simulation Clock & Speeds */}
      <div className="glass-panel rounded-2xl px-4 py-2 flex items-center gap-4 pointer-events-auto bg-slate-950/80 shadow-2xl border border-white/10">
        {/* Date */}
        <div className="text-right">
          <div className="text-xs font-bold text-slate-100 font-mono tracking-wide">
            {MONTH_NAMES[clock.currentMonth - 1]} {clock.currentYear}
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            Tick #{clock.currentTick} (1 Mo/Tick)
          </div>
        </div>

        {/* Play/Pause & Speed Buttons (0x, 1x, 2x, 4x, 8x) */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={onTogglePause}
            title={clock.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
            className={`p-1.5 rounded-lg transition-colors ${
              clock.isPaused
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {clock.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {speeds.map((spd) => {
            const isCurrent = !clock.isPaused && clock.speed === spd;
            return (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  isCurrent
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {spd}x
              </button>
            );
          })}
        </div>

        {/* Autosave pulse */}
        {isAutosaving && (
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
        )}
      </div>
    </header>
  );
};
