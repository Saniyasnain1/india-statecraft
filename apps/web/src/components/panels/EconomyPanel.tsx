import React from 'react';
import { X, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, ShieldAlert } from 'lucide-react';
import { StateProfile, PlayerAction } from '@india-statecraft/shared-types';
import { formatUSD } from '@india-statecraft/map-data';

interface EconomyPanelProps {
  stateProfile: StateProfile;
  isPlayerControlled: boolean;
  onClose: () => void;
  onDispatchAction: (action: PlayerAction) => void;
}

export const EconomyPanel: React.FC<EconomyPanelProps> = ({
  stateProfile,
  onClose,
}) => {
  const { economy, demographics } = stateProfile;
  const budget = economy.budget;

  const netMonthlyCashflow = economy.monthlyRevenueUSD - economy.monthlyExpenditureUSD;
  const isSurplus = netMonthlyCashflow >= 0;

  // Sectoral GDP Shares
  const gdp = economy.gdpUSD;
  const agriShareUSD = gdp * 0.18;
  const industryShareUSD = gdp * 0.32;
  const servicesShareUSD = gdp * 0.50;

  const perCapitaUSD = Math.round(gdp / demographics.population);

  return (
    <div className="absolute top-20 right-6 bottom-24 w-[480px] glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
              State Economy & Treasury Cashflow
            </h2>
            <p className="text-[11px] text-slate-400">
              {stateProfile.name} • Macroeconomic Balance Sheet
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
        {/* Top Cards: Treasury & Annual GDP */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              State Treasury Reserves
            </div>
            <div className="text-xl font-black font-mono text-amber-400">
              {formatUSD(economy.treasuryUSD)}
            </div>
            <div className={`text-[11px] font-mono flex items-center gap-1 ${
              isSurplus ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isSurplus ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isSurplus ? '+' : ''}{formatUSD(netMonthlyCashflow)}/mo net
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Annual State GDP (Value-Added)
            </div>
            <div className="text-xl font-black font-mono text-emerald-400">
              {formatUSD(economy.gdpUSD)}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Per Capita: <span className="text-slate-200 font-bold">${perCapitaUSD.toLocaleString()}/yr</span>
            </div>
          </div>
        </div>

        {/* Value-Added Sectoral Composition */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-400" />
              Economic Output Composition
            </span>
            <span className="text-emerald-400 font-mono font-normal">
              +{(economy.gdpGrowthRate * 100).toFixed(1)}% YoY Growth
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 flex overflow-hidden border border-white/10">
            <div className="bg-amber-500 h-full" style={{ width: '18%' }} title="Agriculture (18%)" />
            <div className="bg-sky-500 h-full" style={{ width: '32%' }} title="Industry & Manufacturing (32%)" />
            <div className="bg-emerald-500 h-full" style={{ width: '50%' }} title="Services & IT (50%)" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div>
              <div className="text-amber-400 font-semibold">🌾 Agriculture</div>
              <div className="text-slate-300 font-bold">{formatUSD(agriShareUSD)}</div>
              <div className="text-[10px] text-slate-500">18% of GDP</div>
            </div>
            <div>
              <div className="text-sky-400 font-semibold">🏭 Industry</div>
              <div className="text-slate-300 font-bold">{formatUSD(industryShareUSD)}</div>
              <div className="text-[10px] text-slate-500">32% of GDP</div>
            </div>
            <div>
              <div className="text-emerald-400 font-semibold">💼 Services</div>
              <div className="text-slate-300 font-bold">{formatUSD(servicesShareUSD)}</div>
              <div className="text-[10px] text-slate-500">50% of GDP</div>
            </div>
          </div>
        </div>

        {/* Monthly Treasury Ledger */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Monthly Budget Balance Sheet
          </div>

          <div className="space-y-2 text-xs">
            {/* Inflows */}
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-emerald-400 border-b border-emerald-500/20 pb-1">
                <span>Total Monthly Receipts:</span>
                <span className="font-mono">+{formatUSD(economy.monthlyRevenueUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>State GST & Consumption Duty:</span>
                <span className="font-mono text-slate-300">{formatUSD(budget.consumptionTaxRevenueUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Corporate & Industrial Tax:</span>
                <span className="font-mono text-slate-300">{formatUSD(budget.businessTaxRevenueUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Union Central Devolution & Grants:</span>
                <span className="font-mono text-slate-300">{formatUSD(budget.centralTransfersUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Railway Profits & State Assets:</span>
                <span className="font-mono text-slate-300">{formatUSD(budget.transportProfitsUSD)}</span>
              </div>
            </div>

            {/* Outflows */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between font-bold text-rose-400 border-b border-rose-500/20 pb-1">
                <span>Total Monthly Expenditures:</span>
                <span className="font-mono">-{formatUSD(economy.monthlyExpenditureUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Civil Service Salaries & Pensions:</span>
                <span className="font-mono text-slate-300">-{formatUSD(budget.publicSalariesUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Public Welfare, Subsidies & Food:</span>
                <span className="font-mono text-slate-300">-{formatUSD(budget.welfareAndSubsidiesUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Public Capital Investment:</span>
                <span className="font-mono text-slate-300">-{formatUSD(budget.publicInvestmentUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Infrastructure Maintenance:</span>
                <span className="font-mono text-slate-300">-{formatUSD(budget.infrastructureMaintenanceUSD)}</span>
              </div>
              <div className="flex justify-between text-slate-400 pl-2 text-[11px]">
                <span>Debt Servicing & Interest:</span>
                <span className="font-mono text-slate-300">-{formatUSD(budget.debtServicingUSD)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Debt Profile */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-slate-200">Public Debt Outstanding</div>
              <div className="text-[10px] text-slate-400">Total sovereign liabilities & state development loans</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-slate-100">{formatUSD(economy.debtUSD)}</div>
            <div className="text-[10px] font-mono text-slate-400">
              {((economy.debtUSD / economy.gdpUSD) * 100).toFixed(1)}% of GDP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
