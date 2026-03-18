import { dict } from "../translations";
import { useMatchStore } from "../../store/useMatchStore";
// NEW: Imported 'User' for the Singles icon
import { RotateCcw, Undo2, Settings, History, Archive, HelpCircle, X, Users, User } from "lucide-react";

interface FooterProps {
  handleUndo: () => void;
  handleSaveMatch: () => void;
  handleReset: () => void;
  setReadmeOpen: (v: boolean) => void;
  setArchiveOpen: (v: boolean) => void;
  setHistoryOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setRosterOpen: (v: boolean) => void;
  onClose: () => void;
}

export default function Footer({
  handleUndo, handleSaveMatch, handleReset,
  setReadmeOpen, setArchiveOpen, setHistoryOpen, setSettingsOpen, setRosterOpen, onClose
}: FooterProps) {
  // NEW: Destructured matchType and toggleMatchType from the store
  const { language, isOutdoorMode, matchType, toggleMatchType } = useMatchStore();
  const t = dict[language] || dict.en;

  const btnBase = `flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-black uppercase text-xs active:scale-95 transition-all ${isOutdoorMode ? 'bg-gray-200 text-black border border-gray-300 shadow-sm' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 shadow-md'}`;

  // NEW: A slightly highlighted base for the mode toggle to make it stand out
  const modeBtnBase = `flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-black uppercase text-xs active:scale-95 transition-all shadow-md border ${isOutdoorMode ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border-blue-700/50'}`;

  return (
    <div className={`absolute bottom-0 left-0 right-0 p-2 flex flex-wrap items-center justify-center gap-2 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-full duration-200 ${isOutdoorMode ? 'bg-white/95 backdrop-blur-md border-t border-gray-200' : 'bg-slate-900/95 backdrop-blur-md border-t border-slate-800'}`}>
      
      {/* NEW: Match Type Toggle (Singles/Doubles) */}
      <button 
        onClick={() => { toggleMatchType(); onClose(); }} 
        className={modeBtnBase}
      >
        {matchType === 'doubles' ? (
          <><Users size={16} className="text-blue-400" /> DOUBLES</>
        ) : (
          <><User size={16} className="text-blue-400" /> SINGLES</>
        )}
      </button>

      {/* Existing Buttons */}
      <button onClick={() => { setRosterOpen(true); onClose(); }} className={btnBase}>
        <Users size={16} className="text-cyan-400" /> Players
      </button>

      <button onClick={() => { setHistoryOpen(true); onClose(); }} className={btnBase}><History size={16} className="text-amber-400" /></button>
      <button onClick={() => { setArchiveOpen(true); onClose(); }} className={btnBase}><Archive size={16} className="text-purple-400" /></button>
      <button onClick={() => { handleSaveMatch(); onClose(); }} className={btnBase}>{t.save}</button>
      <button onClick={() => { handleUndo(); onClose(); }} className={btnBase}><Undo2 size={16} className="text-amber-500" /> {t.undo}</button>
      <button onClick={() => { handleReset(); onClose(); }} className={btnBase}><RotateCcw size={16} className="text-red-500" /> {t.reset}</button>
      <button onClick={() => { setSettingsOpen(true); onClose(); }} className={btnBase}><Settings size={16} className="text-emerald-400" /> {t.settings}</button>
      
      <button onClick={() => { setReadmeOpen(true); onClose(); }} className={btnBase}><HelpCircle size={16} className="text-blue-400" /></button>

      {/* Dedicated Close Button */}
      <button onClick={onClose} className={`ml-2 p-2 rounded-lg font-black active:scale-95 transition-all flex items-center gap-1 ${isOutdoorMode ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-red-500/20 text-red-500 hover:bg-red-500/40 border border-red-500/30'}`}>
        <X size={18} />
      </button>
    </div>
  );
}