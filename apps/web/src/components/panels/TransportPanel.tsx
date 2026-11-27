import React, { useState } from 'react';
import { X, Train, Plus, ArrowRight, CheckCircle } from 'lucide-react';
import { StateProfile, TrainType, PlayerAction, TrainRoute } from '@india-statecraft/shared-types';
import { TRAIN_CONFIGS, calculateTrainEconomics } from '@india-statecraft/game-data';
import { formatUSD, RAILWAY_CORRIDORS } from '@india-statecraft/map-data';

interface TransportPanelProps {
  stateProfile: StateProfile;
  isPlayerControlled: boolean;
  onClose: () => void;
  onDispatchAction: (action: PlayerAction) => void;
}

export const TransportPanel: React.FC<TransportPanelProps> = ({
  stateProfile,
  isPlayerControlled,
  onClose,
  onDispatchAction,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCorridorIndex, setSelectedCorridorIndex] = useState(0);
  const [selectedTrainType, setSelectedTrainType] = useState<TrainType>('PASSENGER_EXPRESS');
  const [trainsCount, setTrainsCount] = useState(2);

  const routes: TrainRoute[] = stateProfile.routes || [];

  // Calculate state total railway stats
  let totalMonthlyProfitUSD = 0;
  let totalMonthlyRevenueUSD = 0;

  routes.forEach((r: TrainRoute) => {
    totalMonthlyProfitUSD += r.monthlyProfitUSD;
    totalMonthlyRevenueUSD += r.monthlyRevenueUSD;
  });

  // Calculate purchase modal economics preview
  const chosenCorridor = RAILWAY_CORRIDORS[selectedCorridorIndex] || RAILWAY_CORRIDORS[0];
  const chosenTrainConfig = TRAIN_CONFIGS[selectedTrainType];
  const upfrontPurchaseCostUSD = chosenTrainConfig.purchaseCostUSD * trainsCount;

  // Approximate distance based on coordinates
  const dx = chosenCorridor.toCoords[0] - chosenCorridor.fromCoords[0];
  const dy = chosenCorridor.toCoords[1] - chosenCorridor.fromCoords[1];
  const approxDistanceKm = Math.round(Math.sqrt(dx * dx + dy * dy) * 111);

  const previewEconomics = calculateTrainEconomics(
    approxDistanceKm,
    selectedTrainType,
    trainsCount
  );

  const handleCommissionRoute = () => {
    if (stateProfile.economy.treasuryUSD < upfrontPurchaseCostUSD) {
      alert(`Insufficient Treasury! You need ${formatUSD(upfrontPurchaseCostUSD)}, but only have ${formatUSD(stateProfile.economy.treasuryUSD)}.`);
      return;
    }

    onDispatchAction({
      type: 'PURCHASE_TRAIN_ROUTE',
      stateCode: stateProfile.code,
      fromCity: chosenCorridor.fromCity,
      toCity: chosenCorridor.toCity,
      trainType: selectedTrainType,
      activeTrainsCount: trainsCount,
      distanceKm: approxDistanceKm,
    });

    setShowAddModal(false);
  };

  return (
    <div className="absolute top-20 right-6 bottom-24 w-[480px] glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Train className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
              State Railway Operations
            </h2>
            <p className="text-[11px] text-slate-400">
              {stateProfile.name} • {routes.length} Active Corridors
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

      {/* Railway Overview Banner */}
      <div className="p-4 border-b border-white/10 bg-slate-950/40 grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Net Profit</div>
          <div className={`text-base font-black font-mono mt-0.5 ${totalMonthlyProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalMonthlyProfitUSD >= 0 ? '+' : ''}{formatUSD(totalMonthlyProfitUSD)}/mo
          </div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Gross Revenue</div>
          <div className="text-base font-black font-mono text-sky-400 mt-0.5">
            {formatUSD(totalMonthlyRevenueUSD)}/mo
          </div>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Active Corridors</div>
          <div className="text-base font-black font-mono text-amber-400 mt-0.5">
            {routes.length}
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3">
        {routes.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs space-y-2">
            <Train className="w-8 h-8 mx-auto text-slate-500 opacity-50" />
            <p>No operational railway train routes established yet.</p>
            <p className="text-[11px] text-slate-500">Commission new trains to generate profitable passenger and freight revenues!</p>
          </div>
        ) : (
          routes.map((route: TrainRoute) => {
            const config = TRAIN_CONFIGS[route.trainType];
            return (
              <div
                key={route.id}
                className="bg-slate-900/70 p-3.5 rounded-xl border border-white/10 hover:border-sky-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">
                      {route.originCity}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-bold text-slate-100 text-xs">
                      {route.destinationCity}
                    </span>
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    route.monthlyProfitUSD >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {route.monthlyProfitUSD >= 0 ? '+' : ''}{formatUSD(route.monthlyProfitUSD)}/mo
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-sky-300 font-medium">{config?.name || route.trainType}</span>
                  <span className="font-mono text-slate-300">{route.activeTrainsCount} Trains • {route.distanceKm} km</span>
                </div>

                {/* Economic Breakdown Formula Bar */}
                <div className="bg-slate-950/70 p-2 rounded-lg text-[10px] font-mono space-y-1 text-slate-400 border border-white/5">
                  <div className="flex justify-between">
                    <span>Revenue (Trips/Mo):</span>
                    <span className="text-emerald-400 font-bold">{formatUSD(route.monthlyRevenueUSD)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Op Cost + Maint ({config?.speedKmH || 90} km/h):</span>
                    <span className="text-rose-400 font-bold">
                      -{formatUSD(route.monthlyOperatingCostUSD + route.monthlyMaintenanceCostUSD)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5 text-slate-300">
                    <span>Throughput / mo:</span>
                    <span>
                      {route.passengersCarriedMonthly > 0 && `${route.passengersCarriedMonthly.toLocaleString()} Pax `}
                      {route.cargoCarriedMonthlyUnits > 0 && `${route.cargoCarriedMonthlyUnits.toLocaleString()} Tons`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Commission Button */}
      {isPlayerControlled && (
        <div className="p-3 border-t border-white/10 bg-slate-900/80">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            Commission New Railway Route
          </button>
        </div>
      )}

      {/* Modal: Purchase Train Route */}
      {showAddModal && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 p-5 flex flex-col justify-between">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Train className="w-4 h-4 text-sky-400" />
                Purchase & Commission Railway Rake
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Corridor */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold">Select Route Corridor:</label>
              <select
                value={selectedCorridorIndex}
                onChange={(e) => setSelectedCorridorIndex(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-sky-400"
              >
                {RAILWAY_CORRIDORS.map((c, i) => (
                  <option key={i} value={i}>
                    {c.fromCity} ↔ {c.toCity} (Approx {Math.round(Math.sqrt(Math.pow(c.toCoords[0] - c.fromCoords[0], 2) + Math.pow(c.toCoords[1] - c.fromCoords[1], 2)) * 111)} km)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Train Type */}
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-300 font-semibold">Select Train Type:</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TRAIN_CONFIGS) as TrainType[]).map((type) => {
                  const conf = TRAIN_CONFIGS[type];
                  const isSelected = selectedTrainType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedTrainType(type)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/15 text-slate-100'
                          : 'border-white/10 bg-slate-900/50 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-200">{conf.name.split('(')[0]}</div>
                      <div className="text-[10px] text-sky-400 font-mono mt-1">
                        Cost: {formatUSD(conf.purchaseCostUSD)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Speed: {conf.speedKmH} km/h
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Train Quantity Slider */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Number of Active Trains / Rakes:</span>
                <span className="font-mono text-sky-400 font-bold">{trainsCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={trainsCount}
                onChange={(e) => setTrainsCount(parseInt(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Economic Preview */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-white/10 space-y-2 text-xs">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Economic Projection
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Upfront Capital Cost:</span>
                <span className="font-mono font-bold text-rose-400">{formatUSD(upfrontPurchaseCostUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monthly Revenue ({previewEconomics.tripsPerMonth} trips):</span>
                <span className="font-mono text-emerald-400">+{formatUSD(previewEconomics.monthlyRevenueUSD)}/mo</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monthly Op & Maint Cost:</span>
                <span className="font-mono text-rose-400">-{formatUSD(previewEconomics.monthlyOperatingCostUSD + previewEconomics.monthlyMaintenanceCostUSD)}/mo</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10 font-bold">
                <span>Projected Monthly Profit:</span>
                <span className={`font-mono ${previewEconomics.monthlyProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {previewEconomics.monthlyProfitUSD >= 0 ? '+' : ''}{formatUSD(previewEconomics.monthlyProfitUSD)}/mo
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleCommissionRoute}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle className="w-4 h-4" />
              Pay {formatUSD(upfrontPurchaseCostUSD)} & Launch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
