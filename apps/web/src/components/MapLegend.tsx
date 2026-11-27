import React from 'react';
import { MapMode } from '@india-statecraft/shared-types';
import { MAP_MODES } from '@india-statecraft/map-data';

interface MapLegendProps {
  mode: MapMode;
}

export const MapLegend: React.FC<MapLegendProps> = ({ mode }) => {
  const config = MAP_MODES[mode];
  if (!config) return null;

  const gradientString = `linear-gradient(to right, ${config.colorStops
    .map(([, color]) => color)
    .join(', ')})`;

  return (
    <div className="absolute bottom-20 left-6 z-20 pointer-events-auto">
      <div className="glass-panel rounded-xl p-3 w-64 shadow-xl border border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {config.label}
          </span>
          <span className="text-[10px] text-amber-400 font-mono">
            {config.unit}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
          {config.description}
        </p>

        {/* Color Ramp Bar */}
        <div
          className="h-2.5 rounded-full w-full mb-1.5 border border-white/15"
          style={{ background: gradientString }}
        />

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>{config.formatValue(config.minVal)}</span>
          <span>{config.formatValue(config.maxVal)}</span>
        </div>
      </div>
    </div>
  );
};
