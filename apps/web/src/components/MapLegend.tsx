import React from 'react';
import { MapMode } from '@india-statecraft/shared-types';
import { MAP_MODES } from '@india-statecraft/map-data';
import { Sparkles } from 'lucide-react';

interface MapLegendProps {
  mode: MapMode;
}

export const MapLegend: React.FC<MapLegendProps> = ({ mode }) => {
  const config = MAP_MODES[mode];
  if (!config) return null;

  const gradientString = `linear-gradient(to right, ${config.colorStops
    .map(([, color]) => color)
    .join(', ')})`;

  const isEconomyMode = mode === 'economy';

  return (
    <div className="absolute bottom-20 left-6 z-20 pointer-events-auto">
      <div className="glass-panel rounded-2xl p-3.5 w-72 shadow-2xl border border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            {isEconomyMode && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            {config.label}
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-bold">
            {config.unit}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
          {config.description}
        </p>

        {/* Color Ramp Bar with optional golden glow effect */}
        <div
          className={`h-3 rounded-full w-full mb-1.5 border border-white/15 ${
            isEconomyMode ? 'shadow-[0_0_12px_rgba(255,232,26,0.35)]' : ''
          }`}
          style={{ background: gradientString }}
        />

        <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono font-bold">
          <span>{config.formatValue(config.minVal)}</span>
          <span>{config.formatValue(config.maxVal)}</span>
        </div>

        {isEconomyMode && (
          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-amber-300/90 font-mono">
            <span>● Dark: Developing</span>
            <span>● Bright Gold: Powerhouse</span>
          </div>
        )}
      </div>
    </div>
  );
};
