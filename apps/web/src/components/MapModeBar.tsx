import React from 'react';
import {
  Map,
  Globe,
  TrendingUp,
  Users,
  Factory,
  Wheat,
  Gem,
  Zap,
  Smile,
  GraduationCap,
  Shield,
  Truck,
  Droplets,
} from 'lucide-react';
import { MapMode } from '@india-statecraft/shared-types';
import { MAP_MODES } from '@india-statecraft/map-data';

interface MapModeBarProps {
  activeMode: MapMode;
  onSelectMode: (mode: MapMode) => void;
}

const MODE_ICONS: Record<MapMode, React.ReactNode> = {
  normal: <Map className="w-4 h-4" />,
  terrain: <Globe className="w-4 h-4" />,
  economy: <TrendingUp className="w-4 h-4" />,
  population: <Users className="w-4 h-4" />,
  industry: <Factory className="w-4 h-4" />,
  agriculture: <Wheat className="w-4 h-4" />,
  naturalResources: <Gem className="w-4 h-4" />,
  infrastructure: <Zap className="w-4 h-4" />,
  happiness: <Smile className="w-4 h-4" />,
  research: <GraduationCap className="w-4 h-4" />,
  militaryContribution: <Shield className="w-4 h-4" />,
  trade: <Truck className="w-4 h-4" />,
  waterResources: <Droplets className="w-4 h-4" />,
};

export const MapModeBar: React.FC<MapModeBarProps> = ({ activeMode, onSelectMode }) => {
  const modesList = Object.keys(MAP_MODES) as MapMode[];

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
      <div className="glass-panel rounded-2xl p-1 flex items-center gap-1 shadow-2xl max-w-[95vw] overflow-x-auto bg-slate-950/80">
        {modesList.map((modeKey) => {
          const config = MAP_MODES[modeKey];
          const isActive = activeMode === modeKey;

          return (
            <button
              key={modeKey}
              onClick={() => onSelectMode(modeKey)}
              title={config.description}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                {MODE_ICONS[modeKey]}
              </span>
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
