import React, { useState, useRef, useEffect } from 'react';
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
  ChevronUp,
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const modesList = Object.keys(MAP_MODES) as MapMode[];
  const activeConfig = MAP_MODES[activeMode];

  return (
    <div
      ref={ref}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
    >
      {/* Dropdown panel — opens upward */}
      {open && (
        <div className="mb-2 bg-slate-950/95 border border-slate-700/60 rounded-2xl shadow-2xl overflow-y-auto max-h-[60vh] backdrop-blur-md w-56">
          {modesList.map((modeKey) => {
            const config = MAP_MODES[modeKey];
            const isActive = activeMode === modeKey;
            return (
              <button
                key={modeKey}
                onClick={() => { onSelectMode(modeKey); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-slate-500'}>
                  {MODE_ICONS[modeKey]}
                </span>
                <span>{config.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger button — shows current mode */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-700/60 shadow-xl backdrop-blur-md text-xs font-semibold text-white hover:border-amber-500/50 transition-all"
      >
        <span className="text-amber-400">{MODE_ICONS[activeMode]}</span>
        <span>{activeConfig?.label ?? 'Map View'}</span>
        <ChevronUp
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
};
