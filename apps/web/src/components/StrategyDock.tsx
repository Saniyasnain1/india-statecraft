import React from 'react';
import { Sliders, DollarSign, Building2, Train, Vote } from 'lucide-react';

export type ActivePanel = 'GOVERNMENT' | 'ECONOMY' | 'INDUSTRY' | 'TRANSPORT' | 'ELECTIONS' | null;

interface StrategyDockProps {
  activePanel: ActivePanel;
  onTogglePanel: (panel: ActivePanel) => void;
  unreadCount?: number;
}

export const StrategyDock: React.FC<StrategyDockProps> = ({
  activePanel,
  onTogglePanel,
}) => {
  const tabs = [
    {
      id: 'GOVERNMENT' as ActivePanel,
      label: 'Government',
      sublabel: 'Taxes & Directives',
      icon: Sliders,
      color: 'amber',
    },
    {
      id: 'ECONOMY' as ActivePanel,
      label: 'Economy',
      sublabel: 'GDP & Cashflow',
      icon: DollarSign,
      color: 'emerald',
    },
    {
      id: 'INDUSTRY' as ActivePanel,
      label: 'Industry',
      sublabel: 'Capital Projects',
      icon: Building2,
      color: 'orange',
    },
    {
      id: 'TRANSPORT' as ActivePanel,
      label: 'Transport',
      sublabel: 'Railways & Trains',
      icon: Train,
      color: 'sky',
    },
    {
      id: 'ELECTIONS' as ActivePanel,
      label: 'Elections',
      sublabel: 'Mandate & Approval',
      icon: Vote,
      color: 'purple',
    },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="glass-panel rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl">
        {tabs.map((tab) => {
          const isActive = activePanel === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTogglePanel(isActive ? null : tab.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <div className="text-left leading-none">
                <div className="text-xs font-bold">{tab.label}</div>
                <div className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                  {tab.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
