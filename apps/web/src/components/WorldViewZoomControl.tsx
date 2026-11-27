import React from 'react';
import { Globe, MapPin, Compass, ChevronRight } from 'lucide-react';

interface WorldViewZoomControlProps {
  onZoomToWorld: () => void;
  onZoomToIndia: () => void;
  onZoomToState: () => void;
  selectedStateName: string;
  currentLevel?: 'WORLD' | 'INDIA' | 'STATE';
}

export const WorldViewZoomControl: React.FC<WorldViewZoomControlProps> = ({
  onZoomToWorld,
  onZoomToIndia,
  onZoomToState,
  selectedStateName,
  currentLevel = 'INDIA',
}) => {
  return (
    <div className="absolute top-20 left-6 z-20 pointer-events-auto">
      <div className="glass-panel rounded-2xl p-1.5 flex items-center gap-1.5 border border-white/10 shadow-2xl bg-slate-950/80 backdrop-blur-xl">
        {/* World Button */}
        <button
          onClick={onZoomToWorld}
          title="Zoom to World Perspective"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentLevel === 'WORLD'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>World</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

        {/* India Overview Button */}
        <button
          onClick={onZoomToIndia}
          title="Zoom to India Overview"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentLevel === 'INDIA'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>India</span>
        </button>

        {selectedStateName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

            {/* State Button */}
            <button
              onClick={onZoomToState}
              title={`Zoom to ${selectedStateName}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentLevel === 'STATE'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{selectedStateName}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
