import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { History, Trash2 } from "lucide-react";

interface SavedMatch {
  id: number;
  date: string;
  team1Name: string;
  team2Name: string;
  scores: string; 
}

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedMatches: SavedMatch[];
  deleteSavedMatch: (id: number) => void;
  clearArchive: () => void;
}

export default function ArchiveModal({ isOpen, onClose, savedMatches, deleteSavedMatch, clearArchive }: ArchiveModalProps) {
  const { language } = useMatchStore();
  const t = dict[language] || dict.en;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] bg-black/95 flex flex-col p-4 md:p-10" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-indigo-500/50 flex-1 rounded-3xl flex flex-col overflow-hidden max-w-4xl w-full mx-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-950">
          <h2 className="text-xl md:text-3xl font-black text-indigo-400 uppercase italic flex items-center gap-3">
            <History className="text-indigo-500" /> {language === 'es' ? 'Partidos Guardados' : 'Saved Matches'}
          </h2>
          <button onClick={onClose} className="text-slate-400 font-bold uppercase active:scale-95 transition-transform">{t.close}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {savedMatches.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 font-bold uppercase">{language === 'es' ? 'No hay partidos' : 'No saved matches'}</div>
          ) : (
            savedMatches.map(m => (
              <div key={m.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs font-bold">{m.date}</span>
                  <span className="text-white font-black text-lg md:text-xl uppercase">{m.team1Name} vs {m.team2Name}</span>
                  <span className="text-emerald-400 font-black text-xl">{m.scores}</span>
                </div>
                <button onClick={() => deleteSavedMatch(m.id)} className="p-3 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors"><Trash2 /></button>
              </div>
            ))
          )}
        </div>
        {savedMatches.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <button onClick={clearArchive} className="w-full py-4 rounded-xl border-2 border-red-900 text-red-500 font-black uppercase tracking-widest active:scale-95 transition-transform">
              {language === 'es' ? 'Borrar Todo' : 'Clear All'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}