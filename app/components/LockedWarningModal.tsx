import React from 'react';
import { Lock, X } from 'lucide-react';

interface LockedWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOutdoorMode: boolean;
}

export default function LockedWarningModal({ isOpen, onClose, isOutdoorMode }: LockedWarningModalProps) {
  if (!isOpen) return null;

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black border-gray-300' : 'bg-slate-900 text-white border-slate-700';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className={`${bgColor} border rounded-2xl w-full max-w-sm flex flex-col shadow-2xl animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
        
        <div className="flex flex-col items-center text-center p-8 gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-2">
            <Lock size={32} />
          </div>
          
          <h2 className="text-xl font-black uppercase tracking-widest">Match in Progress</h2>
          
          <p className={`text-sm font-bold opacity-70 leading-relaxed ${isOutdoorMode ? 'text-gray-600' : 'text-slate-300'}`}>
            Players cannot be swapped once a match has started to protect stat tracking. 
            <br/><br/>
            Please <strong className={isOutdoorMode ? 'text-black' : 'text-white'}>Reset</strong> the match if you need to make changes.
          </p>
        </div>

        <div className={`p-4 border-t ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'}`}>
          <button 
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-wider active:scale-95 transition-all ${isOutdoorMode ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
}