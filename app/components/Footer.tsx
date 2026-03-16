import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Undo2, Save, HelpCircle, History, MessageSquareText, Settings, Wifi, WifiOff } from "lucide-react";

interface FooterProps {
  handleUndo: () => void;
  handleSaveMatch: () => void;
  handleReset: () => void;
  isOnline: boolean;
  setReadmeOpen: (v: boolean) => void;
  setArchiveOpen: (v: boolean) => void;
  setHistoryOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
}

export default function Footer({
  handleUndo, handleSaveMatch, handleReset, isOnline,
  setReadmeOpen, setArchiveOpen, setHistoryOpen, setSettingsOpen
}: FooterProps) {
  const { language, isTiebreak, isOutdoorMode } = useMatchStore();
  const t = dict[language] || dict.en;

  return (
    <footer className={`flex-none h-[40px] flex items-center justify-between px-2 md:px-10 border-t z-50 transition-colors ${isOutdoorMode ? 'bg-gray-200 border-gray-300' : 'bg-slate-950/95 border-slate-900'}`}>
      <div className="flex items-center gap-1 md:gap-4 h-full">
        <button onClick={handleUndo} className={`flex items-center gap-1 px-2 md:px-4 py-0.5 rounded h-[30px] active:scale-95 transition-all ${isOutdoorMode ? 'bg-white border' : 'bg-slate-900/50'}`}>
          <Undo2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-500" />
          <span className="text-[10px] md:text-lg font-black uppercase hidden md:inline text-slate-500">{t.undo}</span>
        </button>
        <button onClick={handleSaveMatch} className={`flex items-center gap-1 px-2 md:px-4 py-0.5 rounded h-[30px] active:scale-95 transition-all ${isOutdoorMode ? 'bg-indigo-100 border' : 'bg-indigo-900/40'}`}>
          <Save className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-400" />
          <span className="text-[10px] md:text-lg font-black uppercase hidden md:inline text-indigo-400">{t.save}</span>
        </button>
      </div>
      <div className={`px-3 py-0.5 rounded-full font-black uppercase text-[8px] md:text-sm ${isTiebreak ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}>
        {isTiebreak ? t.tiebreak : t.match}
      </div>
      <div className="flex items-center gap-1 md:gap-3 h-full">
        <button onClick={handleReset} className="text-[10px] md:text-lg font-black uppercase mr-1 md:mr-2 text-red-900/80 hover:text-red-500 active:scale-95 transition-all">{t.reset}</button>
        <div className="p-1 md:p-1.5 rounded-full border mr-1 md:mr-2 border-slate-800 bg-black/40 shadow-inner">
          {isOnline ? <Wifi size={16} className="text-emerald-500" /> : <WifiOff size={16} className="text-red-500 animate-pulse" />}
        </div>
        <button onClick={() => setReadmeOpen(true)} className="text-emerald-500 p-1 active:scale-95 transition-all"><HelpCircle size={20} /></button>
        <button onClick={() => setArchiveOpen(true)} className="text-indigo-400 p-1 active:scale-95 transition-all"><History size={20} /></button>
        <button onClick={() => setHistoryOpen(true)} className="text-slate-600 p-1 active:scale-95 transition-all"><MessageSquareText size={20} /></button>
        <button onClick={() => setSettingsOpen(true)} className="text-slate-600 p-1 active:scale-95 transition-all"><Settings size={20} /></button>
      </div>
    </footer>
  );
}