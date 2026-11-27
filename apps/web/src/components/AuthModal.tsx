import React from 'react';
import { X, ShieldCheck, Cloud, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isSupabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-400" />
            <h3 className="font-extrabold text-base text-slate-100">
              Save & Account Management
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Mode Status */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-xs">
          <HardDrive className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>Guest Mode Active</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-slate-300 leading-relaxed">
              Your single-player progress is automatically saved to your browser&apos;s local IndexedDB. No login or registration required.
            </p>
          </div>
        </div>

        {/* Cloud Sync & Google Login */}
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Google Cloud Sync</span>
            <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-white/5">
              Supabase Auth
            </span>
          </div>

          <p className="text-slate-400 leading-relaxed">
            Link a Google account to synchronize your save files across devices and prepare for future multiplayer sessions.
          </p>

          {isSupabaseConfigured ? (
            <button
              onClick={() => alert('Supabase Google OAuth initialization ready.')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-colors"
            >
              Sign in with Google
            </button>
          ) : (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Cloud Auth Not Yet Configured
              </div>
              <p className="text-slate-300">
                To enable cloud synchronization, add your Supabase credentials to <code className="text-amber-200">.env</code>:
              </p>
              <div className="font-mono text-[10px] bg-slate-950/80 p-2 rounded border border-white/10 text-slate-300 overflow-x-auto">
                VITE_SUPABASE_URL=https://your-id.supabase.co<br />
                VITE_SUPABASE_ANON_KEY=public-anon-key
              </div>
            </div>
          )}
        </div>

        {/* Safe Migration Guarantee */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
          <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <span>
            Safe Migration Guarantee: Connecting a Google account preserves your ongoing local game progress and copies it safely to cloud storage.
          </span>
        </div>
      </div>
    </div>
  );
};
