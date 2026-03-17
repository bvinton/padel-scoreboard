import { dict } from "../translations";
import { useMatchStore } from "../../store/useMatchStore";
import { RotateCcw, Undo2, Settings, History, Archive, HelpCircle } from "lucide-react";

interface FooterProps {
  handleUndo: () => void;
  handleSaveMatch: () => void;
  handleReset: () => void;
  setReadmeOpen: (v: boolean) => void;
  setArchiveOpen: (v: boolean) => void;
  setHistoryOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
}

export default function Footer({
  handleUndo, handleSaveMatch, handleReset,
  setReadmeOpen, setArchiveOpen, setHistoryOpen, setSettingsOpen
}: FooterProps) {
  const { language, isOutdoorMode } = useMatchStore();
  const t = dict[language] || dict.en;

  const btnBase = `flex items-center justify-center gap-2 px-3 md:px-5 py-3 rounded-xl font-black uppercase text-xs md:text-sm active:scale-95 transition-all ${isOutdoorMode ? 'bg-gray-200 text-black border border-gray-300' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'}`;

  return (
    <footer className={`p-2 md:p-4 flex flex-wrap items-center justify-center gap-2 md:gap-4 z-40 relative ${isOutdoorMode ? 'bg-white border-t border-gray-200' : 'bg-slate-900 border-t border-slate-800'}`}>
      <button onClick={() => setReadmeOpen(true)} className={btnBase}><HelpCircle size={18} className="text-blue-400" /></button>
      <button onClick={() => setHistoryOpen(true)} className={btnBase}><History size={18} className="text-amber-400" /></button>
      <button onClick={() => setArchiveOpen(true)} className={btnBase}><Archive size={18} className="text-purple-400" /></button>
      <button onClick={handleSaveMatch} className={btnBase}>{t.save}</button>
      <button onClick={handleUndo} className={btnBase}><Undo2 size={18} className="text-amber-500" /> {t.undo}</button>
      <button onClick={handleReset} className={btnBase}><RotateCcw size={18} className="text-red-500" /> {t.reset}</button>
      <button onClick={() => setSettingsOpen(true)} className={btnBase}><Settings size={18} className="text-emerald-400" /> {t.settings}</button>
    </footer>
  );
}