import React from 'react';
import { useMatchStore } from '../../store/useMatchStore';
import { dict } from '../translations';
import { Users, User, History, Archive, X, ClipboardList, UserMinus } from 'lucide-react';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  setRosterOpen: (v: boolean) => void;
  setHistoryOpen: (v: boolean) => void;
  setArchiveOpen: (v: boolean) => void;
}

export default function MatchSetupModal({ isOpen, onClose, setRosterOpen, setHistoryOpen, setArchiveOpen }: MatchSetupModalProps) {
  const { language, isOutdoorMode, matchType, toggleMatchType, clearAllPlayers } = useMatchStore();
  const t = dict[language] || dict.en;

  if (!isOpen) return null;

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className={`${bgColor} border ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'} rounded-2xl w-full max-w-sm flex flex-col shadow-2xl animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-6 border-b border-inherit bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <ClipboardList className={isOutdoorMode ? "text-blue-600" : "text-blue-400"} size={28} />
            <h2 className="text-xl font-black uppercase tracking-widest">Match Setup</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          
          {/* Match Type Toggle */}
          <button 
            onClick={toggleMatchType} 
            className={`w-full py-4 px-5 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-between border-2 ${isOutdoorMode ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-900/20 text-blue-400 border-blue-800/50'}`}
          >
            <div className="flex items-center gap-3">
              {matchType === 'doubles' ? <Users size={24} /> : <User size={24} />}
              <span>Mode</span>
            </div>
            <span className="text-xl">{matchType === 'doubles' ? 'DOUBLES' : 'SINGLES'}</span>
          </button>

          {/* NEW: Clear Active Players moved here */}
          <button 
            onClick={() => { clearAllPlayers(); onClose(); }} 
            className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex justify-center items-center gap-3 border ${isOutdoorMode ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-red-900/10 text-red-400 border-red-900/30 hover:bg-red-900/20'}`}
          >
            <UserMinus size={18} /> Clear Active Players
          </button>

          <hr className={isOutdoorMode ? 'border-gray-200' : 'border-slate-800'} />

          {/* Player Roster */}
          <button 
            onClick={() => { setRosterOpen(true); onClose(); }} 
            className={`w-full py-4 px-5 rounded-xl font-black uppercase tracking-wider transition-all flex items-center gap-4 border ${panelColor}`}
          >
            <Users size={24} className="text-cyan-500" /> Player Roster
          </button>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <button 
              onClick={() => { setHistoryOpen(true); onClose(); }} 
              className={`py-4 rounded-xl font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 border ${panelColor}`}
            >
              <History size={24} className="text-amber-500" />
              <span className="text-xs">Point Log</span>
            </button>

            <button 
              onClick={() => { setArchiveOpen(true); onClose(); }} 
              className={`py-4 rounded-xl font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-2 border ${panelColor}`}
            >
              <Archive size={24} className="text-purple-500" />
              <span className="text-xs">Saved Matches</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}