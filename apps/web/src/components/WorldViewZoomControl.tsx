import React from 'react';
import { Globe, MapPin, Compass } from 'lucide-react';

interface WorldViewZoomControlProps {
  onZoomToWorld: () => void;
  onZoomToIndia: () => void;
  onZoomToState: () => void;
  selectedStateName: string;
}

export const WorldViewZoomControl: React.FC<WorldViewZoomControlProps> = ({
  onZoomToWorld,
  onZoomToIndia,
  onZoomToState,
  selectedStateName,
}) => {
  return (
    <div className="absolute top-20 left-6 z-20 pointer-events-auto">
      <div className="glass-panel rounded-xl p-1.5 flex flex-col gap-1 border border-white/10 shadow-xl">
        <button
          onClick={onZoomToIndia}
          title="Zoom to India Overview"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>India Overview</span>
        </button>

        <button
          onClick={onZoomToState}
          title={`Focus on ${selectedStateName}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>Focus State</span>
        </button>

        <button
          onClick={onZoomToWorld}
          title="Zoom to World Perspective"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Globe className="w-4 h-4 text-slate-400" />
          <span>World Map</span>
        </button>
      </div>
    </div>
  );
};
