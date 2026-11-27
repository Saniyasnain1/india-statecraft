import React from 'react';
import { X, Vote, ThumbsUp, Calendar } from 'lucide-react';
import { StateProfile } from '@india-statecraft/shared-types';

interface ElectionsPanelProps {
  stateProfile: StateProfile;
  onClose: () => void;
}

export const ElectionsPanel: React.FC<ElectionsPanelProps> = ({
  stateProfile,
  onClose,
}) => {
  const { politics, demographics } = stateProfile;

  const totalTermMonths = 60; // 5 years = 60 months
  const monthsRemaining = politics.monthsUntilNextElection;
  const monthsCompleted = Math.max(0, totalTermMonths - monthsRemaining);
  const termProgressPct = Math.round((monthsCompleted / totalTermMonths) * 100);

  const approval = politics.governingApprovalPercent;
  const isHighApproval = approval >= 60;
  const isVulnerable = approval < 48;

  // Projected vote share
  const projectedVoteShare = Math.min(85, Math.max(20, Math.round(approval * 0.82 + 5)));

  return (
    <div className="absolute top-20 right-6 bottom-24 w-[460px] glass-panel rounded-2xl z-20 flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm tracking-wide text-slate-100 uppercase">
              Electoral Mandate & Assembly Term
            </h2>
            <p className="text-[11px] text-slate-400">
              {stateProfile.name} • Legislative Assembly Cycle
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
        {/* 5-Year Term Timeline Progress */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              5-Year Assembly Term Progress
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {monthsRemaining} Mo Remaining
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-sky-500 to-amber-500 h-full transition-all duration-300"
              style={{ width: `${termProgressPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Swearing-In (Month 0)</span>
            <span>Completed: {termProgressPct}%</span>
            <span>General Election (Month 60)</span>
          </div>
        </div>

        {/* Public Approval & Reelection Forecast */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              CM Public Approval
            </div>
            <div className={`text-2xl font-black font-mono ${
              isHighApproval ? 'text-emerald-400' : isVulnerable ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {approval}%
            </div>
            <div className="text-[10px] text-slate-400">
              {isHighApproval ? 'Strong popular majority' : isVulnerable ? 'Vulnerable to anti-incumbency' : 'Competitive mandate'}
            </div>
          </div>

          <div className="bg-slate-900/70 p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Projected Vote Share
            </div>
            <div className="text-2xl font-black font-mono text-sky-400">
              {projectedVoteShare}%
            </div>
            <div className="text-[10px] text-slate-400">
              Threshold to win: 42%
            </div>
          </div>
        </div>

        {/* Key Determinants of Voter Approval */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5 space-y-3">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4 text-emerald-400" />
            Key Approval Determinants
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Economic Growth & Job Creation</span>
              <span className="font-mono text-emerald-400 font-bold">+ High Impact</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Welfare & Subsidies Reach</span>
              <span className="font-mono text-emerald-400 font-bold">+ Positive</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Tax Burden & Inflation</span>
              <span className="font-mono text-amber-400 font-bold">~ Sensitive</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50">
              <span className="text-slate-300">Unemployment Rate ({(demographics.unemploymentRate * 100).toFixed(1)}%)</span>
              <span className={`font-mono font-bold ${
                demographics.unemploymentRate > 0.07 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {demographics.unemploymentRate > 0.07 ? '- Negative' : '+ Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* Incumbent Ruling Party Card */}
        <div className="bg-slate-900/50 p-3.5 rounded-xl border border-white/5 space-y-1 text-xs">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            Governing Political Alliance
          </div>
          <div className="font-bold text-slate-100 text-sm">
            {politics.rulingPartyName}
          </div>
          <p className="text-[11px] text-slate-400">
            Formed after previous state assembly election. Needs &gt;50% public approval to secure an outright second term.
          </p>
        </div>
      </div>
    </div>
  );
};
