import React, { useState } from 'react';
import { Shield, TrendingUp, DollarSign, Users, Search, Eye, MapPin } from 'lucide-react';
import { StateProfile, TerritoryCode } from '@india-statecraft/shared-types';
import { formatUSD } from '@india-statecraft/map-data';

interface StateSelectionScreenProps {
  states: Record<TerritoryCode, StateProfile>;
  onSelectStateToPlay: (code: TerritoryCode) => void;
  onSpectate: () => void;
}

type RegionFilter = 'ALL' | 'NORTH' | 'SOUTH' | 'WEST' | 'EAST' | 'CENTRAL' | 'NORTHEAST' | 'UT';

const REGION_MAP: Record<RegionFilter, TerritoryCode[]> = {
  ALL: [],
  NORTH: ['DL', 'PB', 'HR', 'HP', 'UK', 'UP', 'CH', 'JK', 'LA'],
  SOUTH: ['TN', 'KA', 'AP', 'TS', 'KL', 'PY', 'LD'],
  WEST: ['MH', 'GJ', 'RJ', 'GA', 'DNHDD'],
  EAST: ['WB', 'BR', 'JH', 'OD', 'AN'],
  CENTRAL: ['MP', 'CG'],
  NORTHEAST: ['AS', 'AR', 'MN', 'ML', 'MZ', 'NL', 'SK', 'TR'],
  UT: ['DL', 'JK', 'LA', 'CH', 'AN', 'DNHDD', 'LD', 'PY'],
};

export const StateSelectionScreen: React.FC<StateSelectionScreenProps> = ({
  states,
  onSelectStateToPlay,
  onSpectate,
}) => {
  const [selectedCode, setSelectedCode] = useState<TerritoryCode>('MH');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState<RegionFilter>('ALL');

  const selectedState = states[selectedCode] || states['MH'];

  // Filter state list
  const stateList = Object.values(states).filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeRegion === 'ALL') return true;
    return REGION_MAP[activeRegion]?.includes(st.code);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 font-sans text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl shadow-lg shadow-amber-500/20">
            IS
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-black text-2xl tracking-wider uppercase text-slate-100">
                India: Statecraft
              </h1>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                Strategy Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a State or Union Territory to Govern as Chief Minister
            </p>
          </div>
        </div>

        {/* Spectate Button */}
        <button
          onClick={onSpectate}
          className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-slate-900/60 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Eye className="w-4 h-4 text-sky-400" />
          Spectate Simulation (Autonomous AI)
        </button>
      </div>

      {/* Main Grid: Left Roster & Right Spotlight */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 min-h-0">
        {/* Left Column: State Search & Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 space-y-3">
          {/* Search & Region Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state, capital, or code..."
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Region Pills */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
              {(['ALL', 'NORTH', 'SOUTH', 'WEST', 'EAST', 'CENTRAL', 'NORTHEAST', 'UT'] as RegionFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeRegion === r
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* State Card Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {stateList.map((st) => {
              const isSelected = selectedCode === st.code;
              return (
                <button
                  key={st.code}
                  onClick={() => setSelectedCode(st.code)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/30'
                      : 'border-white/10 bg-slate-900/50 hover:bg-slate-900/80 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-100 truncate">
                        {st.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 border border-white/5">
                        {st.code}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {st.capital}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">{formatUSD(st.economy.gdpUSD)}</span>
                    <span className="text-slate-400">{(st.demographics.population / 1_000_000).toFixed(1)}M</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected State Profile Spotlight (5 cols) */}
        {selectedState && (
          <div className="lg:col-span-5 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-white/15 bg-slate-900/70 shadow-2xl">
            <div className="space-y-5 overflow-y-auto pr-1">
              {/* State Header & Crest */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-2xl text-slate-100 tracking-wide">
                      {selectedState.name}
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {selectedState.code}
                    </span>
                    {selectedState.isUnionTerritory && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        UNION TERRITORY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Capital: <strong className="text-slate-200">{selectedState.capital}</strong></span>
                    <span>•</span>
                    <span>Area: <strong className="text-slate-200">{selectedState.areaSqKm.toLocaleString('en-US')} km²</strong></span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-lg">
                  {selectedState.code}
                </div>
              </div>

              {/* High-Level Economic Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    Starting Treasury
                  </div>
                  <div className="text-xl font-black font-mono text-amber-400">
                    {formatUSD(selectedState.economy.treasuryUSD)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Monthly Rev: +{formatUSD(selectedState.economy.monthlyRevenueUSD)}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    State GDP (Value-Added)
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-400">
                    {formatUSD(selectedState.economy.gdpUSD)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    YoY Growth: +{(selectedState.economy.gdpGrowthRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Demographics & Quality of Life */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Users className="w-4 h-4 text-sky-400" />
                    Demographics & Citizens
                  </span>
                  <span className="font-mono font-bold text-slate-100">
                    {(selectedState.demographics.population / 1_000_000).toFixed(2)} Million
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                  <div>
                    <div className="text-slate-400">Literacy:</div>
                    <div className="text-slate-200 font-bold">{(selectedState.demographics.literacyRate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Unemployment:</div>
                    <div className="text-slate-200 font-bold">{(selectedState.demographics.unemploymentRate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Approval:</div>
                    <div className="text-emerald-400 font-bold">{selectedState.politics.governingApprovalPercent}%</div>
                  </div>
                </div>
              </div>

              {/* Strategic Advantages */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="font-semibold text-slate-300 uppercase text-[10px] tracking-wider">
                  Strategic Profile & Infrastructure
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {selectedState.infrastructure.portType === 'COASTAL_PORT' && (
                    <span className="px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      🌊 Maritime Coastal Port Access
                    </span>
                  )}
                  {(selectedState.majorRivers || []).length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      💧 River Basin ({selectedState.majorRivers.slice(0, 2).join(', ')})
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    🚆 {(selectedState.routes || []).length} Railway Corridors
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    🏛️ {selectedState.politics.rulingPartyName}
                  </span>
                </div>
              </div>
            </div>

            {/* Play Button */}
            <div className="pt-4 border-t border-white/10 mt-4">
              <button
                onClick={() => onSelectStateToPlay(selectedState.code)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Shield className="w-5 h-5 fill-current" />
                Take Oath of Office • Govern {selectedState.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
