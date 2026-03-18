import React, { useState } from 'react';
import { useMatchStore, MatchFormat } from '../../store/useMatchStore';
import { dict } from '../translations';
import { Users, User, X, ClipboardList, UserMinus, RefreshCw, Play, ChevronDown } from 'lucide-react';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayerClick: (team: 'team1' | 'team2', index: 0 | 1) => void; 
  setRosterOpen: (v: boolean) => void;
}

export default function MatchSetupModal({ isOpen, onClose, onPlayerClick, setRosterOpen }: MatchSetupModalProps) {
  const { 
    language, isOutdoorMode, matchType, toggleMatchType, clearAllPlayers, toggleServer, team1, team2, completeSetup,
    matchFormat, setMatchFormat, useGoldenPoint, toggleGoldenPoint, swapSidesRule, toggleSwapSidesRule 
  } = useMatchStore();
  
  const t = dict[language] || dict.en;
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);

  const formats: MatchFormat[] = ['bestOf3', 'bestOf5', 'proSet', 'superTiebreak'];
  const formatLabels: Record<MatchFormat, string> = { bestOf3: t.bestOf3, bestOf5: t.bestOf5, proSet: t.proSet, superTiebreak: t.superTiebreak };

  if (!isOpen) return null;

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className={`${bgColor} border ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'} rounded-2xl w-full max-w-md md:max-w-lg flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-5 border-b border-inherit bg-inherit z-10 shrink-0">
          <div className="flex items-center gap-3">
            <ClipboardList className={isOutdoorMode ? "text-blue-600" : "text-blue-400"} size={28} />
            <h2 className="text-xl font-black uppercase tracking-widest">Match Setup</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-4">
          
          <div className={`p-3 rounded-xl border ${panelColor} flex flex-col gap-2 shrink-0`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Match Rules</h3>

            <button onClick={toggleMatchType} className={`w-full py-3 px-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-between border ${isOutdoorMode ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-800/50'}`}>
              <div className="flex items-center gap-2">{matchType === 'doubles' ? <Users size={18} /> : <User size={18} />}<span className="text-xs">Mode</span></div>
              <span className="text-sm">{matchType === 'doubles' ? 'DOUBLES' : 'SINGLES'}</span>
            </button>

            <div className="relative">
               <button onClick={() => setIsFormatDropdownOpen(!isFormatDropdownOpen)} className={`w-full py-3 px-4 ${isOutdoorMode ? 'bg-gray-100 border-gray-300 text-black' : 'bg-slate-900 border-slate-700 text-white'} border rounded-xl flex items-center justify-between transition-all active:scale-[0.98]`}>
                 <div className="flex flex-col items-start">
                   <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mb-0.5">{t.format}</span>
                   <span className="font-black uppercase text-sm leading-none">{formatLabels[matchFormat]}</span>
                 </div>
                 <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isFormatDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} size={18} />
               </button>
               {isFormatDropdownOpen && (
                 <div className={`absolute top-full left-0 right-0 mt-1 ${isOutdoorMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700'} border rounded-xl overflow-hidden z-50 shadow-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200`}>
                   {formats.map((format) => (
                     <button key={format} onClick={() => { setMatchFormat(format); setIsFormatDropdownOpen(false); }} className={`w-full py-3 px-4 text-left font-black uppercase tracking-wider text-xs transition-colors border-b ${isOutdoorMode ? 'border-gray-200' : 'border-slate-700/50'} last:border-0 ${matchFormat === format ? 'bg-indigo-600 text-white' : (isOutdoorMode ? 'text-gray-700 hover:bg-gray-100' : 'text-slate-300 hover:bg-slate-700')}`}>
                       {formatLabels[format]}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <button 
                onClick={toggleGoldenPoint} 
                className={`flex flex-col items-center justify-center rounded-xl border transition-all active:scale-95 ${
                  useGoldenPoint 
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400' 
                    : (isOutdoorMode ? 'bg-gray-100 border-gray-300 text-gray-400' : 'bg-slate-900 border-slate-800 text-slate-600')
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.goldenPoint}</span>
                <span className="text-sm font-black uppercase mt-0.5">{useGoldenPoint ? t.on : t.off}</span>
              </button>

              <div className={`flex flex-col rounded-xl border overflow-hidden shadow-sm ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'}`}>
                <div className={`text-[9px] uppercase font-black tracking-widest text-center py-1.5 flex items-center justify-center gap-1 ${isOutdoorMode ? 'bg-gray-200 text-gray-600' : 'bg-slate-800 text-slate-400'}`}>
                  <RefreshCw size={10} /> {language === 'es' ? 'Cambio Lado' : 'Change Ends'}
                </div>
                <div className="flex flex-1">
                  <button onClick={() => swapSidesRule !== 'official' && toggleSwapSidesRule()} className={`flex-1 py-2 flex justify-center items-center text-[9px] font-black uppercase transition-all ${swapSidesRule === 'official' ? 'bg-indigo-600 text-white shadow-inner' : (isOutdoorMode ? 'bg-white text-gray-400 hover:bg-gray-50' : 'bg-slate-900 text-slate-500 hover:bg-slate-800')}`}>
                    {language === 'es' ? 'Oficial' : 'Official'}
                  </button>
                  <button onClick={() => swapSidesRule !== 'endOfSet' && toggleSwapSidesRule()} className={`flex-1 py-2 flex justify-center items-center text-[9px] font-black uppercase transition-all ${swapSidesRule === 'endOfSet' ? 'bg-emerald-600 text-white shadow-inner' : (isOutdoorMode ? 'bg-white text-gray-400 hover:bg-gray-50' : 'bg-slate-900 text-slate-500 hover:bg-slate-800')}`}>
                    {language === 'es' ? 'Set' : 'Set End'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${panelColor} flex flex-col gap-3 shrink-0`}>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team 1 Players</h3>
              <div className="flex gap-2">
                <button onClick={() => onPlayerClick('team1', 0)} className="flex-1 py-2 bg-black/10 dark:bg-black/30 rounded-lg text-xs font-bold border border-inherit truncate px-2 hover:bg-black/20 dark:hover:bg-black/50 transition-colors">
                  {team1.players?.[0]?.name || '+ Select P1'}
                </button>
                {matchType === 'doubles' && (
                  <button onClick={() => onPlayerClick('team1', 1)} className="flex-1 py-2 bg-black/10 dark:bg-black/30 rounded-lg text-xs font-bold border border-inherit truncate px-2 hover:bg-black/20 dark:hover:bg-black/50 transition-colors">
                    {team1.players?.[1]?.name || '+ Select P2'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Team 2 Players</h3>
              <div className="flex gap-2">
                <button onClick={() => onPlayerClick('team2', 0)} className="flex-1 py-2 bg-black/10 dark:bg-black/30 rounded-lg text-xs font-bold border border-inherit truncate px-2 hover:bg-black/20 dark:hover:bg-black/50 transition-colors">
                  {team2.players?.[0]?.name || '+ Select P1'}
                </button>
                {matchType === 'doubles' && (
                  <button onClick={() => onPlayerClick('team2', 1)} className="flex-1 py-2 bg-black/10 dark:bg-black/30 rounded-lg text-xs font-bold border border-inherit truncate px-2 hover:bg-black/20 dark:hover:bg-black/50 transition-colors">
                    {team2.players?.[1]?.name || '+ Select P2'}
                  </button>
                )}
              </div>
            </div>
            
            <button onClick={() => clearAllPlayers()} className="mt-1 w-full py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all flex justify-center items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20">
              <UserMinus size={14} /> Clear Players
            </button>
          </div>

          <button onClick={() => toggleServer()} className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-3 border ${panelColor} shrink-0`}>
            <RefreshCw size={18} className="text-indigo-400" /> {t.swapServer}
          </button>

          <hr className={`shrink-0 ${isOutdoorMode ? 'border-gray-200' : 'border-slate-800'}`} />

          {/* FIXED: Removed onClose() so Match Setup stays open quietly in the background */}
          <button onClick={() => setRosterOpen(true)} className={`w-full py-4 px-5 rounded-xl font-black uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-3 border ${panelColor} shrink-0`}>
            <Users size={20} className="text-cyan-500" /> Player Roster & Stats
          </button>

        </div>

        <div className="p-4 border-t border-inherit bg-inherit shrink-0">
          <button 
            onClick={() => { completeSetup(); onClose(); }} 
            className="w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] flex justify-center items-center gap-3 active:scale-95"
          >
            <Play size={20} /> START MATCH
          </button>
        </div>

      </div>
    </div>
  );
}