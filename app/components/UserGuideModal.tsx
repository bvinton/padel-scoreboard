import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOutdoorMode: boolean;
}

export default function UserGuideModal({ isOpen, onClose, isOutdoorMode }: UserGuideModalProps) {
  if (!isOpen) return null;

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black border-gray-300' : 'bg-slate-900 text-white border-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={onClose}>
      <div className={`${bgColor} border rounded-2xl w-full max-w-lg flex flex-col shadow-2xl animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-6 border-b border-inherit bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-500" size={28} />
            <h2 className="text-xl font-black uppercase tracking-widest">User Guide</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 text-center opacity-70 font-bold">
          <p>The comprehensive Padel Pro user guide will be added here soon!</p>
        </div>

      </div>
    </div>
  );
}