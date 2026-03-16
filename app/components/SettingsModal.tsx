import { useState } from "react";
import { useMatchStore, MatchFormat } from "../../store/useMatchStore";
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
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  const toggleFullscreen = () => { 
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); 
    else document.exitFullscreen(); 
  };

  if (!isOpen) return null;

  const formats: MatchFormat[] = ['bestOf3', 'bestOf5', 'proSet', 'superTiebreak'];
  const formatLabels: Record<MatchFormat, string> = {
    bestOf3: t.bestOf3,
    bestOf5: t.bestOf5,
    proSet: t.proSet,
    superTiebreak: t.superTiebreak
  };

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

         {/* ADVANCED POLISHED DROPDOWN MENU */}
         <div className="relative">
           <button 
             onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)}
             className={`w-full py-3 px-4 bg-slate-800 border ${isFormatDropdownOpen ? 'border-emerald-500' : 'border-slate-700'} rounded-xl flex items-center justify-between text-white transition-all active:scale-[0.98]`}
           >
             <div className="flex flex-col items-start">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{t.format}</span>
               <span className="font-black uppercase text-lg leading-none">
                 {formatLabels[matchFormat]}
               </span>
             </div>
             <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isFormatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} size={24} />
           </button>

           {isFormatDropdownOpen && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-700 rounded-xl overflow-hidden z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
               {formats.map((format) => (
                 <button
                   key={format}
                   onClick={() => {
                     setMatchFormat(format);
                     setIsFormatDropdownOpen(false);
                   }}
                   className={`w-full py-4 px-4 text-left font-black uppercase tracking-wider transition-colors border-b border-slate-700/50 last:border-0 ${
                     matchFormat === format ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                   }`}
                 >
                   {formatLabels[format]}
                 </button>
               ))}
             </div>
           )}
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