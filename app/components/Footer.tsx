import { dict } from "../translations";
import { useMatchStore } from "../../store/useMatchStore";
import { RotateCcw, Undo2, Settings, X, Trophy, ClipboardList } from "lucide-react";

interface FooterProps {
  handleUndo: () => void;
  handleEndMatch: () => void;
  handleReset: () => void;
  setMatchSetupOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  onClose: () => void;
}

export default function Footer({
  handleUndo, handleEndMatch, handleReset,
  setMatchSetupOpen, setSettingsOpen, onClose
}: FooterProps) {
  const { language, isOutdoorMode } = useMatchStore();
  const t = dict[language] || dict.en;

  const btnBase = `flex items-center justify-center gap-2 px-3 md:px-4 py-3 rounded-lg font-black uppercase text-xs active:scale-95 transition-all ${isOutdoorMode ? 'bg-gray-200 text-black border-gray-300 shadow-sm' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 shadow-md'}`;
  const setupBtnBase = `flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-black uppercase text-xs active:scale-95 transition-all shadow-md border ${isOutdoorMode ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' : 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border-blue-700/50'}`;
  const endMatchBtnBase = `flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-black uppercase text-xs active:scale-95 transition-all shadow-md border ${isOutdoorMode ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' : 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500'}`;

  return (
    <div className={`fixed inset-x-0 bottom-0 p-4 flex flex-wrap items-center justify-center gap-3 z-[500] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full duration-300 ${isOutdoorMode ? 'bg-white/95 backdrop-blur-md border-t border-gray-200' : 'bg-slate-900/95 backdrop-blur-md border-t border-slate-800'}`}>
      
      <button onClick={() => { setMatchSetupOpen(true); onClose(); }} className={setupBtnBase}>
        <ClipboardList size={18} className={isOutdoorMode ? "text-blue-600" : "text-blue-400"} /> MATCH SETUP
      </button>

      <button onClick={() => { handleEndMatch(); onClose(); }} className={endMatchBtnBase}>
        <Trophy size={18} className={isOutdoorMode ? "text-emerald-600" : "text-emerald-100"} /> END MATCH
      </button>

      <button onClick={() => { handleUndo(); onClose(); }} className={btnBase}>
        <Undo2 size={18} className="text-amber-500" /> {t.undo}
      </button>
      
      <button onClick={() => { handleReset(); onClose(); }} className={btnBase}>
        <RotateCcw size={18} className="text-red-500" /> ABORT / RESET
      </button>
      
      <button onClick={() => { setSettingsOpen(true); onClose(); }} className={btnBase}>
        <Settings size={18} className="text-emerald-400" /> {t.settings}
      </button>

      <button onClick={onClose} className={`ml-2 p-3 rounded-lg font-black active:scale-95 transition-all flex items-center gap-1 ${isOutdoorMode ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/30'}`}>
        <X size={20} />
      </button>
    </div>
  );
}