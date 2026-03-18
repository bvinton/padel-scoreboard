import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Volume2, Maximize, Languages, BookOpen, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  generateNewRoomCode: () => void;
  setReadmeOpen: (v: boolean) => void;   
  setUserGuideOpen: (v: boolean) => void; 
}

export default function SettingsModal({ 
  isOpen, onClose, roomCode, generateNewRoomCode, setReadmeOpen, setUserGuideOpen 
}: SettingsModalProps) {
  const {
    umpireEnabled, toggleUmpire, language, setLanguage,
    isOutdoorMode, toggleOutdoorMode
  } = useMatchStore();
  
  const t = dict[language] || dict.en;

  const toggleFullscreen = () => { 
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); 
    else document.exitFullscreen(); 
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[200] bg-black/95 flex items-center justify-center p-2" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-4 rounded-2xl w-full max-w-xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto text-white" onClick={e => e.stopPropagation()}>
         <h2 className="text-xl font-black uppercase text-center text-slate-500 italic">{t.settings}</h2>
         
         <div className="flex flex-col gap-1 bg-slate-800 p-3 text-center rounded-xl">
           <span className="text-slate-400 text-xs font-bold uppercase">{t.activeRoomCode}</span>
           <div className="flex items-center justify-center gap-4">
             <span className="text-emerald-400 text-3xl font-black font-mono">{roomCode}</span>
             <button onClick={generateNewRoomCode} className="text-slate-400 text-xs uppercase underline">{t.regenerate}</button>
           </div>
         </div>

         <button onClick={toggleUmpire} className={`py-4 mt-2 rounded-xl border-2 font-black uppercase flex items-center justify-center gap-4 ${umpireEnabled ? 'bg-indigo-600 border-white text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
           <Volume2 size={24} /> {t.umpire}: {umpireEnabled ? t.on : t.off}
         </button>
         
         <div className="grid grid-cols-2 gap-2 mt-1">
            <button onClick={toggleFullscreen} className="py-4 rounded-xl bg-slate-800 text-white font-black uppercase flex items-center justify-center gap-4 active:scale-95 transition-all"><Maximize size={24} /> {t.fullscreen}</button>
            <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="py-4 rounded-xl bg-slate-800 text-emerald-400 font-black uppercase flex items-center justify-center gap-4 border border-emerald-500/30 active:scale-95 transition-all"><Languages size={24} /> {language === 'en' ? 'English' : 'Español'}</button>
         </div>
         
         <button onClick={toggleOutdoorMode} className={`py-4 mt-1 rounded-xl border-2 font-black uppercase transition-all flex items-center justify-center ${isOutdoorMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'bg-black border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}>{t.court}: {isOutdoorMode ? t.outdoor : t.indoor}</button>
         
         <div className="mt-4 border-t border-slate-700 pt-4 flex flex-col gap-2">
           <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest text-center mb-1">Help & Support</h3>
           <div className="grid grid-cols-2 gap-2">
             <button onClick={() => { setUserGuideOpen(true); onClose(); }} className="py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
               <BookOpen size={16} className="text-blue-400" /> User Guide
             </button>
             <button onClick={() => { setReadmeOpen(true); onClose(); }} className="py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">
               <Cpu size={16} className="text-purple-400" /> Hardware Setup
             </button>
           </div>
         </div>
         
         <button onClick={onClose} className="py-4 bg-white text-black font-black rounded-xl uppercase mt-2 active:scale-95 transition-all">{t.close}</button>
         <div className="text-center mt-2">
           <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Padel Pro v1.0 • Offline Ready</span>
         </div>
      </div>
    </div>
  );
}