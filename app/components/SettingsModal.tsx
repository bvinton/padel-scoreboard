import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Volume2, Maximize, Languages, ChevronDown } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  generateNewRoomCode: () => void;
}

export default function SettingsModal({ isOpen, onClose, roomCode, generateNewRoomCode }: SettingsModalProps) {
  const {
    team1, team2, setTeamName,
    umpireEnabled, toggleUmpire,
    language, setLanguage,
    matchFormat, setMatchFormat,
    isOutdoorMode, toggleOutdoorMode,
    useGoldenPoint, toggleGoldenPoint,
    toggleServer
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

         <div className="grid grid-cols-2 gap-2">
           <input value={team1.name} onChange={e => setTeamName('team1', e.target.value)} placeholder={t.team1} className="bg-slate-800 rounded-xl p-3 text-white font-black uppercase text-center outline-none" />
           <input value={team2.name} onChange={e => setTeamName('team2', e.target.value)} placeholder={t.team2} className="bg-slate-800 rounded-xl p-3 text-white font-black uppercase text-center outline-none" />
         </div>

         {/* DROPDOWN MENU FOR FORMATS */}
         <div className="relative bg-slate-800 rounded-xl border border-slate-700">
           <span className="absolute top-1.5 left-3 text-[10px] font-black uppercase text-slate-400">{t.format}</span>
           <select 
             value={matchFormat} 
             onChange={(e) => setMatchFormat(Number(e.target.value) as 3 | 5)}
             className="w-full bg-transparent text-white font-black uppercase pt-6 pb-2 px-3 appearance-none outline-none cursor-pointer"
           >
             <option value={3} className="bg-slate-900">{t.bestOf3}</option>
             <option value={5} className="bg-slate-900">{t.bestOf5}</option>
           </select>
           <ChevronDown className="absolute right-3 top-4 text-slate-400 pointer-events-none" size={20} />
         </div>

         <button onClick={toggleUmpire} className={`py-4 rounded-xl border-2 font-black uppercase flex items-center justify-center gap-4 ${umpireEnabled ? 'bg-indigo-600 border-white text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
           <Volume2 size={24} /> {t.umpire}: {umpireEnabled ? t.on : t.off}
         </button>

         <div className="grid grid-cols-2 gap-2">
            <button onClick={toggleFullscreen} className="py-3 rounded-xl bg-slate-800 text-white font-black uppercase flex items-center justify-center gap-4 active:scale-95 transition-all"><Maximize size={24} /> {t.fullscreen}</button>
            <button onClick={() => setLanguage(language === 'en' ? 'es' : 'en')} className="py-3 rounded-xl bg-slate-800 text-emerald-400 font-black uppercase flex items-center justify-center gap-4 border border-emerald-500/30 active:scale-95 transition-all"><Languages size={24} /> {t.language}: {language === 'en' ? 'EN' : 'ES'}</button>
         </div>

         <div className="grid grid-cols-2 gap-2">
            <button onClick={toggleOutdoorMode} className={`py-3 rounded-xl border-2 font-black uppercase transition-all ${isOutdoorMode ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.6)]' : 'bg-black border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`}>{t.court}: {isOutdoorMode ? t.outdoor : t.indoor}</button>
            <button onClick={toggleGoldenPoint} className={`py-3 rounded-xl border font-black uppercase transition-all ${useGoldenPoint ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-500'}`}>{t.goldenPoint}: {useGoldenPoint ? t.on : t.off}</button>
         </div>

         <button onClick={toggleServer} className="py-3 bg-slate-800 rounded-xl text-white font-black uppercase active:scale-95 transition-all">{t.swapServer}</button>
         
         <button onClick={onClose} className="py-3 bg-white text-black font-black rounded-xl uppercase mt-2 active:scale-95 transition-all">{t.close}</button>
      </div>
    </div>
  );
}