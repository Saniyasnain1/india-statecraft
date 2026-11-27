import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Droplets,
  Users,
  Building2,
  Vote,
  Sliders,
  Train,
  DollarSign,
} from 'lucide-react';
import { StateProfile, PlayerAction } from '@india-statecraft/shared-types';
import { formatUSD } from '@india-statecraft/map-data';

interface StateDetailDrawerProps {
  stateProfile: StateProfile;
  isPlayerControlled: boolean;
  onClose: () => void;
  onDispatchAction: (action: PlayerAction) => void;
  onOpenPanel?: (panel: 'GOVERNMENT' | 'ECONOMY' | 'INDUSTRY' | 'TRANSPORT' | 'ELECTIONS') => void;
}

export const StateDetailDrawer: React.FC<StateDetailDrawerProps> = ({
  stateProfile,
  isPlayerControlled,
  onClose,
  onOpenPanel,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'water' | 'infrastructure'>('overview');

  const { economy, demographics, water, infrastructure, politics } = stateProfile;
  const budget = economy.budget;
  const perCapitaUSD = Math.round(economy.gdpUSD / demographics.population);

  return (
    <div className="absolute top-20 right-6 bottom-24 w-96 glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200 bg-slate-950/85">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-slate-100">{stateProfile.name}</h2>
            <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
              {stateProfile.code}
            </span>
            {isPlayerControlled && (
              <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                YOU GOVERN
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Capital: <span className="text-slate-200 font-medium">{stateProfile.capital}</span> • {stateProfile.areaSqKm.toLocaleString('en-US')} km²
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 text-xs font-semibold bg-slate-950/40">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'overview'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'budget'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Budget ($)
        </button>
        <button
          onClick={() => setActiveTab('water')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'water'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Water & Rivers
        </button>
        <button
          onClick={() => setActiveTab('infrastructure')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'infrastructure'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Transit
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
        {activeTab === 'overview' && (
          <>
            {/* Political Status */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Vote className="w-4 h-4 text-amber-400" />
                  Government
                </span>
                <span className="font-semibold text-slate-100">{politics.rulingPartyName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Public Approval:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {politics.governingApprovalPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Next Assembly Election:</span>
                <span className="font-mono text-slate-200">
                  {politics.monthsUntilNextElection} Months Remaining
                </span>
              </div>
            </div>

            {/* Economic Snapshot (USD) */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  State GDP (Value Added)
                </span>
                <span className="font-bold font-mono text-emerald-400">
                  {formatUSD(economy.gdpUSD)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Per Capita Income:</span>
                <span className="font-mono text-slate-200">
                  ${perCapitaUSD.toLocaleString()}/yr
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Annual Growth:</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{(economy.gdpGrowthRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Treasury Balance:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatUSD(economy.treasuryUSD)}
                </span>
              </div>
            </div>

            {/* Demographics & Quality of Life */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-sky-400" />
                  Demographics
                </span>
                <span className="font-bold font-mono text-slate-100">
                  {(demographics.population / 1_000_000).toFixed(2)} Million
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Literacy Rate:</span>
                <span className="font-mono text-slate-200">
                  {(demographics.literacyRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Unemployment:</span>
                <span className="font-mono text-slate-200">
                  {(demographics.unemploymentRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Happiness / HDI Index:</span>
                <span className="font-mono font-bold text-teal-400">
                  {demographics.happinessIndex}/100
                </span>
              </div>
            </div>

            {/* Quick Action Button for Player State */}
            {isPlayerControlled && onOpenPanel && (
              <div className="pt-2">
                <button
                  onClick={() => onOpenPanel('GOVERNMENT')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Sliders className="w-4 h-4" />
                  Manage State Taxation & Policies
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'budget' && (
          <>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span>Monthly Revenues ($)</span>
                <span className="text-emerald-400 font-mono">+{formatUSD(economy.monthlyRevenueUSD)}</span>
              </div>
              <div className="space-y-1 pl-2 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>SGST / Consumption:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.consumptionTaxRevenueUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Business & Corporate:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.businessTaxRevenueUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Union Devolution & Grants:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.centralTransfersUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Railways & Non-Tax:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.transportProfitsUSD)}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span>Monthly Expenditures ($)</span>
                <span className="text-rose-400 font-mono">-{formatUSD(economy.monthlyExpenditureUSD)}</span>
              </div>
              <div className="space-y-1 pl-2 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Salaries & Civil Service:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.publicSalariesUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Welfare & Subsidies:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.welfareAndSubsidiesUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CapEx & Public Investment:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.publicInvestmentUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Debt Interest:</span>
                  <span className="font-mono text-slate-200">{formatUSD(budget.debtServicingUSD)}</span>
                </div>
              </div>
            </div>

            {isPlayerControlled && onOpenPanel && (
              <button
                onClick={() => onOpenPanel('ECONOMY')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                View Full Economic Balance Sheet
              </button>
            )}
          </>
        )}

        {activeTab === 'water' && (
          <div className="space-y-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Droplets className="w-4 h-4 text-teal-400" />
                Hydrological Basins
              </div>
              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Groundwater Stress:</span>
                  <span className="font-mono text-slate-200">{water.groundwaterStressLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Rainfall:</span>
                  <span className="font-mono text-slate-200">{water.annualRainfallMm.toLocaleString()} mm</span>
                </div>
                <div className="flex justify-between">
                  <span>Reservoir Storage:</span>
                  <span className="font-mono text-teal-300 font-bold">{water.reservoirStoragePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Dams:</span>
                  <span className="font-mono text-slate-200 font-bold">{water.damCount}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Major Perennial Rivers:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(stateProfile.majorRivers || []).length > 0 ? (
                    stateProfile.majorRivers.map((r: string) => (
                      <span key={r} className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 text-[10px] font-mono border border-teal-500/20">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[10px]">No major inter-state river basins</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'infrastructure' && (
          <div className="space-y-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <Train className="w-4 h-4 text-sky-400" />
                Transit & Logistics Corridors
              </div>
              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Maritime Access:</span>
                  <span className="font-mono text-amber-300">
                    {infrastructure.portType === 'COASTAL_PORT' ? 'Coastal Seaport Access' : 'Inland Territory (Dry Port)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Train Routes:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {(stateProfile.routes || []).length} Routes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Operational Buildings:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {(stateProfile.buildings || []).length} Facilities
                  </span>
                </div>
              </div>
            </div>

            {isPlayerControlled && onOpenPanel && (
              <div className="space-y-2">
                <button
                  onClick={() => onOpenPanel('TRANSPORT')}
                  className="w-full py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-sky-500/30"
                >
                  <Train className="w-4 h-4" />
                  Manage Railways & Train Rakes
                </button>
                <button
                  onClick={() => onOpenPanel('INDUSTRY')}
                  className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/30"
                >
                  <Building2 className="w-4 h-4" />
                  Commission New Factories & Infrastructure
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
