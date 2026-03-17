import { useState, useEffect } from "react";
import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Bluetooth, Activity, CheckCircle2 } from "lucide-react";

interface HardwareWizardProps {
  isOpen: boolean;
  onClose: () => void;
  testSignals: { team1: boolean; team2: boolean; undo: boolean };
}

export default function HardwareWizard({ isOpen, onClose, testSignals }: HardwareWizardProps) {
  const { language, team1, team2 } = useMatchStore();
  const t = dict[language] || dict.en;

  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (dontShowAgain) localStorage.setItem('padelReadmeDismissed', 'true');
    else localStorage.removeItem('padelReadmeDismissed');
  }, [dontShowAgain]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 md:p-8 rounded-3xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-y-auto text-white" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Bluetooth className="text-blue-500" size={32} />
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest italic">{t.hardwareSetup}</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Instructions */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider mb-2">{t.flicInstructions}</h3>
            <p className="text-slate-400 text-sm mb-6">{t.flicSwipeInfo}</p>

            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="font-bold">{t.step1}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="font-bold">{t.step2}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="font-bold">{t.step3}</p>
              </div>
            </div>
          </div>

          {/* Right Side: Button Tester */}
          <div className="flex-1 flex flex-col bg-black/50 p-6 rounded-2xl border-2 border-slate-800">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Activity className="text-amber-400" />
              <h3 className="font-black uppercase tracking-wider text-amber-400">{t.testConnection}</h3>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${testSignals.team1 ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
                <span className="font-black uppercase text-lg">{team1.name} (A / 1)</span>
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${testSignals.team1 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-slate-600'}`} />
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${testSignals.team2 ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
                <span className="font-black uppercase text-lg">{team2.name} (D / 2)</span>
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${testSignals.team2 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-slate-600'}`} />
              </div>

              <div className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${testSignals.undo ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
                <span className="font-black uppercase text-lg">{t.undo} (U / 3)</span>
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${testSignals.undo ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,1)]' : 'bg-slate-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${dontShowAgain ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600 group-hover:border-slate-500'}`}>
              {dontShowAgain && <CheckCircle2 size={16} className="text-white" />}
            </div>
            <span className="text-slate-400 font-bold uppercase tracking-wider">{t.dontShowAgain}</span>
          </label>

          <button onClick={onClose} className="w-full md:w-auto px-10 py-4 bg-emerald-500 text-black font-black uppercase text-xl rounded-full active:scale-95 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            {t.startMatch}
          </button>
        </div>

      </div>
    </div>
  );
}