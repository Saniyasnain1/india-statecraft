import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  Droplets,
  Users,
  Building2,
  Vote,
  Anchor,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { StateProfile, PlayerAction } from '@india-statecraft/shared-types';

interface StateDetailDrawerProps {
  stateProfile: StateProfile;
  isPlayerControlled: boolean;
  onClose: () => void;
  onDispatchAction: (action: PlayerAction) => void;
}

export const StateDetailDrawer: React.FC<StateDetailDrawerProps> = ({
  stateProfile,
  isPlayerControlled,
  onClose,
  onDispatchAction,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'water' | 'reforms'>('overview');

  const { economy, demographics, water, infrastructure, politics } = stateProfile;
  const budget = economy.budget;

  return (
    <div className="absolute top-20 right-6 bottom-20 w-96 glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-slate-100">{stateProfile.name}</h2>
            <span className="text-[10px] font-mono bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
              {stateProfile.code}
            </span>
            {isPlayerControlled && (
              <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                PLAYER
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Capital: <span className="text-slate-200 font-medium">{stateProfile.capital}</span> • {stateProfile.areaSqKm.toLocaleString('en-IN')} km²
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
      <div className="flex border-b border-white/10 text-xs font-semibold bg-slate-950/30">
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
          Budget
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
          onClick={() => setActiveTab('reforms')}
          className={`flex-1 py-2.5 text-center transition-colors ${
            activeTab === 'reforms'
              ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Directives
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
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
                <span>Next Election In:</span>
                <span className="font-mono text-slate-200">
                  {politics.monthsUntilNextElection} Months ({Math.ceil(politics.monthsUntilNextElection / 12)} Yrs)
                </span>
              </div>
            </div>

            {/* Economic Snapshot */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  GSDP (Value Added)
                </span>
                <span className="font-bold font-mono text-emerald-400">
                  ₹{(economy.gsdpNominalCrore / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k Cr
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Per Capita Income:</span>
                <span className="font-mono text-slate-200">
                  ₹{economy.perCapitaIncomeINR.toLocaleString('en-IN')}/yr
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Fiscal Deficit / GSDP:</span>
                <span className={`font-mono font-bold ${economy.fiscalDeficitGsdpRatio > 0.035 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {(economy.fiscalDeficitGsdpRatio * 100).toFixed(2)}%
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
                  {(demographics.population / 1000000).toFixed(2)} Million
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

            {/* Logistics & Transit */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Anchor className="w-4 h-4 text-amber-400" />
                  Trade & Logistics
                </span>
                <span className="font-mono text-amber-300">
                  {infrastructure.portAccessType === 'COASTAL_PORT' ? 'Coastal Seaport' : 'Inland Dry Port'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Power Grid Reliability:</span>
                <span className="font-mono text-slate-200">
                  {infrastructure.powerGridReliabilityIndex}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Highway Density:</span>
                <span className="font-mono text-slate-200">
                  {infrastructure.highwayDensityKmPer1000SqKm} km/1000 km²
                </span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Constitutional Rule:</strong> States cannot levy personal income tax. Revenue is derived from SGST, state excise, stamp duty, motor vehicle taxes, and central devolution.
              </span>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Monthly Receipts (₹ Cr)
              </h3>
              <div className="flex justify-between text-slate-400">
                <span>State GST (SGST):</span>
                <span className="font-mono text-slate-200">₹{budget.sgst} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>State Excise:</span>
                <span className="font-mono text-slate-200">₹{budget.stateExcise} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stamp Duty & Land:</span>
                <span className="font-mono text-slate-200">₹{budget.stampDutyRegistration} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Motor Vehicle Tax:</span>
                <span className="font-mono text-slate-200">₹{budget.motorVehicleTax} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Central Transfers:</span>
                <span className="font-mono text-slate-200">₹{budget.unionDevolutionAndGrants} Cr</span>
              </div>
              <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-emerald-400">
                <span>Total Monthly Revenue:</span>
                <span className="font-mono">₹{economy.monthlyRevenueCrore} Cr</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Monthly Outlays (₹ Cr)
              </h3>
              <div className="flex justify-between text-slate-400">
                <span>Salaries & Pensions:</span>
                <span className="font-mono text-slate-200">₹{budget.salariesAndPensions} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Debt Servicing (Interest):</span>
                <span className="font-mono text-slate-200">₹{budget.debtServicing} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Welfare & Subsidies:</span>
                <span className="font-mono text-slate-200">₹{budget.welfareAndSubsidies} Cr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capital Expenditure (CapEx):</span>
                <span className="font-mono text-sky-400">₹{budget.capitalExpenditure} Cr</span>
              </div>
              <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-rose-400">
                <span>Total Monthly Outlay:</span>
                <span className="font-mono">₹{economy.monthlyExpenditureCrore} Cr</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'water' && (
          <div className="space-y-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Hydrological Basins
                </span>
                <span className="font-bold font-mono text-cyan-400">
                  {water.activeDamsCount} Dams
                </span>
              </div>

              <div className="text-slate-400">
                Major Rivers:{' '}
                <span className="text-slate-200 font-medium">
                  {stateProfile.majorRivers.length > 0 ? stateProfile.majorRivers.join(', ') : 'Coastal Runoffs'}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Reservoir Storage:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {water.reservoirStoragePercent}% Capacity
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Groundwater Status:</span>
                <span
                  className={`font-mono font-bold ${
                    water.groundwaterStressLevel === 'OVER_EXPLOITED'
                      ? 'text-rose-400'
                      : water.groundwaterStressLevel === 'CRITICAL'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {water.groundwaterStressLevel}
                </span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Downstream River Flow:</span>
                <span className="font-mono text-slate-200">
                  {water.downstreamDischargeCusecs.toLocaleString('en-IN')} cusecs
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reforms' && (
          <div className="space-y-3">
            {!isPlayerControlled ? (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-400 text-center">
                This state is currently governed by AI. Select your player-controlled state ({stateProfile.code}) to issue executive orders.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    State Tax & Tariff Directives
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Adjust SGST Rate:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() =>
                            onDispatchAction({
                              type: 'ADJUST_TAX_RATES',
                              stateCode: stateProfile.code as any,
                              sgstAdjustment: -0.05,
                              stampDutyAdjustment: 0,
                            })
                          }
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() =>
                            onDispatchAction({
                              type: 'ADJUST_TAX_RATES',
                              stateCode: stateProfile.code as any,
                              sgstAdjustment: 0.05,
                              stampDutyAdjustment: 0,
                            })
                          }
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px]"
                        >
                          +5%
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span>Budget Rebalance:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() =>
                            onDispatchAction({
                              type: 'ALLOCATE_BUDGET',
                              stateCode: stateProfile.code as any,
                              capexShare: 0.6,
                              welfareShare: 0.4,
                            })
                          }
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono text-[11px]"
                          title="Boost CapEx (Infrastructure/growth)"
                        >
                          Boost CapEx
                        </button>
                        <button
                          onClick={() =>
                            onDispatchAction({
                              type: 'ALLOCATE_BUDGET',
                              stateCode: stateProfile.code as any,
                              capexShare: 0.3,
                              welfareShare: 0.7,
                            })
                          }
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-[11px]"
                          title="Boost Welfare (Approval rating)"
                        >
                          Boost Welfare
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Special Economic Corridors
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Zone dedicated manufacturing corridors and solar parks to increase industrial output index and attract domestic & foreign investment.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
