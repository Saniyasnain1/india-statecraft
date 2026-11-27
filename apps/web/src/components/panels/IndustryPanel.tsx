import React, { useState } from 'react';
import { X, Building2, Hammer, Plus, Clock, AlertTriangle, Layers } from 'lucide-react';
import { StateProfile, BuildingCategory, PlayerAction, StateBuildingInstance } from '@india-statecraft/shared-types';
import { BUILDING_DEFINITIONS } from '@india-statecraft/game-data';
import { formatUSD } from '@india-statecraft/map-data';

interface IndustryPanelProps {
  stateProfile: StateProfile;
  isPlayerControlled: boolean;
  onClose: () => void;
  onDispatchAction: (action: PlayerAction) => void;
}

export const IndustryPanel: React.FC<IndustryPanelProps> = ({
  stateProfile,
  isPlayerControlled,
  onClose,
  onDispatchAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BuildingCategory | null>(null);

  const allBuildings: StateBuildingInstance[] = stateProfile.buildings || [];
  const activeConstruction = allBuildings.filter((b) => b.isUnderConstruction);
  const existingBuildings = allBuildings.filter((b) => !b.isUnderConstruction);

  // Group existing buildings by type
  const buildingCounts: Partial<Record<BuildingCategory, number>> = {};
  existingBuildings.forEach((b: StateBuildingInstance) => {
    buildingCounts[b.type] = (buildingCounts[b.type] || 0) + 1;
  });

  const isCoastal = stateProfile.infrastructure.portType === 'COASTAL_PORT';
  const hasRivers = (stateProfile.majorRivers || []).length > 0;

  const handleQueueBuilding = (type: BuildingCategory) => {
    const def = BUILDING_DEFINITIONS[type];
    if (!def) return;

    if (stateProfile.economy.treasuryUSD < def.constructionCostUSD) {
      alert(`Insufficient Treasury! You need ${formatUSD(def.constructionCostUSD)}, but currently have ${formatUSD(stateProfile.economy.treasuryUSD)}.`);
      return;
    }

    if (def.requiresCoastal && !isCoastal) {
      alert(`Geographic Constraint: Deepwater ports require direct ocean coastline access. ${stateProfile.name} is an inland territory.`);
      return;
    }

    if (def.requiresRiver && !hasRivers) {
      alert(`Geographic Constraint: Dams require perennial river basins. ${stateProfile.name} has no major river basin for dam construction.`);
      return;
    }

    onDispatchAction({
      type: 'COMMENCE_BUILDING_CONSTRUCTION',
      stateCode: stateProfile.code,
      buildingType: type,
    });

    setSelectedCategory(null);
  };

  return (
    <div className="absolute top-20 right-6 bottom-24 w-[490px] glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
              State Capital Projects & Industry
            </h2>
            <p className="text-[11px] text-slate-400">
              {stateProfile.name} • {existingBuildings.length} Operational Facilities
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Active Construction Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Hammer className="w-4 h-4 text-amber-400" />
              Construction Queue ({activeConstruction.length})
            </span>
          </div>

          {activeConstruction.length === 0 ? (
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 text-center text-slate-400 text-xs">
              No active projects underway. Select an infrastructure asset below to begin construction.
            </div>
          ) : (
            <div className="space-y-2">
              {activeConstruction.map((proj: StateBuildingInstance) => {
                const def = BUILDING_DEFINITIONS[proj.type];
                const progressPct = Math.round(
                  ((proj.totalTicks - proj.ticksRemaining) / proj.totalTicks) * 100
                );
                return (
                  <div
                    key={proj.id}
                    className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/30 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-100">{def?.name || proj.type}</span>
                      <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {proj.ticksRemaining} Mo Left
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Progress: {progressPct}%</span>
                      <span>Total Time: {proj.totalTicks} Months</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Existing Assets Summary */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-400" />
            Operational State Assets
          </span>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(BUILDING_DEFINITIONS) as BuildingCategory[]).map((cat) => {
              const def = BUILDING_DEFINITIONS[cat];
              const count = buildingCounts[cat] || 0;
              return (
                <div
                  key={cat}
                  className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="font-semibold text-xs text-slate-200 truncate">{def.name.split('(')[0]}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      +{formatUSD(def.monthlyGdpValueAddedUSD)}/mo
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm bg-slate-800 text-sky-300 px-2 py-0.5 rounded border border-white/10">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catalog of Constructible Buildings */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Commission New Infrastructure
          </span>

          <div className="space-y-2">
            {(Object.keys(BUILDING_DEFINITIONS) as BuildingCategory[]).map((cat) => {
              const def = BUILDING_DEFINITIONS[cat];
              const isSelected = selectedCategory === cat;
              const canAfford = stateProfile.economy.treasuryUSD >= def.constructionCostUSD;

              // Geographic checks
              const coastalBlocked = def.requiresCoastal && !isCoastal;
              const riverBlocked = def.requiresRiver && !hasRivers;
              const isBlocked = coastalBlocked || riverBlocked;

              return (
                <div
                  key={cat}
                  className={`bg-slate-900/70 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs">{def.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{def.description}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400 shrink-0 ml-2">
                      {formatUSD(def.constructionCostUSD)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                    <span>Build Time: {def.constructionTimeTicks} Mo</span>
                    <span>Op Exp: {formatUSD(def.monthlyOperatingExpenseUSD)}/mo</span>
                    <span className="text-emerald-400 font-bold">
                      +{formatUSD(def.monthlyGdpValueAddedUSD)}/mo GDP
                    </span>
                  </div>

                  {/* Geographic notes */}
                  {isBlocked && (
                    <div className="mt-2 text-[10px] text-rose-300 flex items-center gap-1 bg-rose-950/40 p-1.5 rounded">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {coastalBlocked && 'Requires direct maritime coastline access.'}
                      {riverBlocked && 'Requires a major river basin.'}
                    </div>
                  )}

                  {isPlayerControlled && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleQueueBuilding(cat)}
                        disabled={!canAfford || isBlocked}
                        className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Queue Construction ({formatUSD(def.constructionCostUSD)})
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
