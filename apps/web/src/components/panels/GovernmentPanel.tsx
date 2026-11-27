import React, { useState } from 'react';
import { X, TrendingUp, Sliders, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { StateProfile, TaxPolicySettings, PlayerAction } from '@india-statecraft/shared-types';
import { formatUSD } from '@india-statecraft/map-data';

interface GovernmentPanelProps {
  stateProfile: StateProfile;
  isPlayerControlled: boolean;
  onClose: () => void;
  onDispatchAction: (action: PlayerAction) => void;
}

export const GovernmentPanel: React.FC<GovernmentPanelProps> = ({
  stateProfile,
  isPlayerControlled,
  onClose,
  onDispatchAction,
}) => {
  const currentPolicy = stateProfile.economy.taxPolicy;

  const [policy, setPolicy] = useState<TaxPolicySettings>({
    businessTaxRate: currentPolicy.businessTaxRate,
    consumptionTaxRate: currentPolicy.consumptionTaxRate,
    propertyTaxRate: currentPolicy.propertyTaxRate,
    stateExciseTaxRate: currentPolicy.stateExciseTaxRate,
    vehicleTaxRate: currentPolicy.vehicleTaxRate,
    electricityDutyRate: currentPolicy.electricityDutyRate,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSliderChange = (key: keyof TaxPolicySettings, value: number) => {
    setPolicy((prev) => {
      const next = { ...prev, [key]: value };
      setHasChanges(true);
      return next;
    });
  };

  const handleApplyChanges = () => {
    onDispatchAction({
      type: 'UPDATE_TAX_POLICY',
      stateCode: stateProfile.code,
      taxPolicy: policy,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setPolicy({ ...currentPolicy });
    setHasChanges(false);
  };

  // Projected tax revenues using value-added GDP components
  const gdp = stateProfile.economy.gdpUSD;
  const projectedBusinessTaxUSD = (gdp * 0.28 * policy.businessTaxRate) / 12;
  const projectedConsumptionTaxUSD = (gdp * 0.42 * policy.consumptionTaxRate) / 12;
  const projectedPropertyTaxUSD = (gdp * 0.12 * policy.propertyTaxRate) / 12;
  const projectedExciseUSD = (gdp * 0.08 * policy.stateExciseTaxRate) / 12;
  const projectedVehicleUSD = (gdp * 0.05 * policy.vehicleTaxRate) / 12;
  const projectedElectricityUSD = (gdp * 0.05 * policy.electricityDutyRate) / 12;

  const totalProjectedMonthlyUSD =
    projectedBusinessTaxUSD +
    projectedConsumptionTaxUSD +
    projectedPropertyTaxUSD +
    projectedExciseUSD +
    projectedVehicleUSD +
    projectedElectricityUSD;

  // Average tax burden calculation
  const avgRate =
    (policy.businessTaxRate +
      policy.consumptionTaxRate +
      policy.propertyTaxRate +
      policy.stateExciseTaxRate +
      policy.vehicleTaxRate +
      policy.electricityDutyRate) / 6;

  const isHighTax = avgRate > 0.16;
  const isBusinessHostile = policy.businessTaxRate > 0.24;

  return (
    <div className="absolute top-20 right-6 bottom-24 w-[460px] glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
              State Taxation & Directives
            </h2>
            <p className="text-[11px] text-slate-400">
              {stateProfile.name} • {stateProfile.politics.rulingPartyName} Government
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

      {/* Constitutional Disclaimer Note */}
      <div className="bg-sky-950/40 border-b border-sky-800/30 px-4 py-2 flex items-start gap-2 text-[11px] text-sky-200/90">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <span>
          Under the Indian Constitution, <strong>personal income tax</strong> is levied exclusively by the Central Union Government. State governments finance budgets through SGST, business licenses, stamp duties, excise, and vehicle taxes.
        </span>
      </div>

      {/* Sliders Container */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Total Projected Monthly Revenue */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Projected Monthly State Tax Revenue
            </div>
            <div className="text-xl font-black font-mono text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-4 h-4" />
              {formatUSD(totalProjectedMonthlyUSD)}/mo
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isHighTax
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {isHighTax ? 'High Tax Regime' : 'Competitive Tax'}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {isBusinessHostile && (
          <div className="bg-amber-950/40 border border-amber-600/30 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>High business tax (&gt;24%) reduces private industrial investment and slows GDP growth.</span>
          </div>
        )}

        {isHighTax && (
          <div className="bg-rose-950/40 border border-rose-600/30 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>High overall tax burden dampens voter approval and risks election backlash.</span>
          </div>
        )}

        {/* Slider 1: Business Tax */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">Business & Industrial Tax</span>
            <span className="font-mono text-amber-400 font-bold">
              {(policy.businessTaxRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.40"
            step="0.01"
            value={policy.businessTaxRate}
            disabled={!isPlayerControlled}
            onChange={(e) => handleSliderChange('businessTaxRate', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5% (Pro-growth)</span>
            <span>Yield: {formatUSD(projectedBusinessTaxUSD)}/mo</span>
            <span>40% (High burden)</span>
          </div>
        </div>

        {/* Slider 2: Consumption Tax (SGST) */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">State GST (SGST / Consumption)</span>
            <span className="font-mono text-amber-400 font-bold">
              {(policy.consumptionTaxRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.28"
            step="0.01"
            value={policy.consumptionTaxRate}
            disabled={!isPlayerControlled}
            onChange={(e) => handleSliderChange('consumptionTaxRate', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5%</span>
            <span>Yield: {formatUSD(projectedConsumptionTaxUSD)}/mo</span>
            <span>28% (GST Max)</span>
          </div>
        </div>

        {/* Slider 3: Property & Stamp Duty */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">Property & Stamp Duty</span>
            <span className="font-mono text-amber-400 font-bold">
              {(policy.propertyTaxRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.15"
            step="0.01"
            value={policy.propertyTaxRate}
            disabled={!isPlayerControlled}
            onChange={(e) => handleSliderChange('propertyTaxRate', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>2%</span>
            <span>Yield: {formatUSD(projectedPropertyTaxUSD)}/mo</span>
            <span>15%</span>
          </div>
        </div>

        {/* Slider 4: State Excise */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">State Excise Duty (Spirits/Fuel)</span>
            <span className="font-mono text-amber-400 font-bold">
              {(policy.stateExciseTaxRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.55"
            step="0.01"
            value={policy.stateExciseTaxRate}
            disabled={!isPlayerControlled}
            onChange={(e) => handleSliderChange('stateExciseTaxRate', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>10%</span>
            <span>Yield: {formatUSD(projectedExciseUSD)}/mo</span>
            <span>55%</span>
          </div>
        </div>

        {/* Slider 5: Motor Vehicle Duty */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">Motor Vehicle Registration Tariff</span>
            <span className="font-mono text-amber-400 font-bold">
              {(policy.vehicleTaxRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.20"
            step="0.01"
            value={policy.vehicleTaxRate}
            disabled={!isPlayerControlled}
            onChange={(e) => handleSliderChange('vehicleTaxRate', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>2%</span>
            <span>Yield: {formatUSD(projectedVehicleUSD)}/mo</span>
            <span>20%</span>
          </div>
        </div>

        {/* Slider 6: Electricity Duty */}
        <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-200">State Electricity Duty</span>
            <span className="font-mono text-amber-400 font-bold">
              {(policy.electricityDutyRate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.20"
            step="0.01"
            value={policy.electricityDutyRate}
            disabled={!isPlayerControlled}
            onChange={(e) => handleSliderChange('electricityDutyRate', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>2%</span>
            <span>Yield: {formatUSD(projectedElectricityUSD)}/mo</span>
            <span>20%</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {isPlayerControlled && (
        <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApplyChanges}
            disabled={!hasChanges}
            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle className="w-4 h-4" />
            Enact State Budget Directives
          </button>
        </div>
      )}
    </div>
  );
};
