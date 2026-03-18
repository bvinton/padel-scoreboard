import React from 'react';
import { X, Cpu, Bluetooth, Keyboard } from 'lucide-react';

interface HardwareWizardProps {
  isOpen: boolean;
  onClose: () => void;
  testSignals: { team1: boolean; team2: boolean; undo: boolean };
}

export default function HardwareWizard({ isOpen, onClose, testSignals }: HardwareWizardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <Cpu className="text-purple-400" size={28} />
            <h2 className="text-xl font-black uppercase text-white tracking-widest">Hardware Setup</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] text-slate-300 space-y-6">
          
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-emerald-400 font-bold uppercase mb-2 flex items-center gap-2"><Bluetooth size={18}/> Flic Buttons (Bluetooth)</h3>
            <p className="text-sm mb-3">To use Flic buttons, open the Flic App on your device and configure each button to send a <strong>"Keyboard Event"</strong>.</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Bind Button 1 (Team 1) to the <strong className="text-white bg-slate-700 px-2 py-0.5 rounded">1</strong> key.</li>
              <li>Bind Button 2 (Team 2) to the <strong className="text-white bg-slate-700 px-2 py-0.5 rounded">2</strong> key.</li>
              <li>Bind Button 3 (Undo) to the <strong className="text-white bg-slate-700 px-2 py-0.5 rounded">3</strong> key.</li>
            </ul>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-blue-400 font-bold uppercase mb-2 flex items-center gap-2"><Keyboard size={18}/> Live Testing</h3>
            <p className="text-sm">Test your setup right now. Click your connected buttons or press <strong>1</strong>, <strong>2</strong>, or <strong>3</strong> on a keyboard. The indicators below will light up, but the match score will not change.</p>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              <div className={`px-4 py-3 rounded-lg font-black uppercase tracking-widest transition-all duration-75 ${testSignals.team1 ? 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981] scale-105' : 'bg-slate-900 border border-slate-700 text-slate-500'}`}>Team 1 (1)</div>
              <div className={`px-4 py-3 rounded-lg font-black uppercase tracking-widest transition-all duration-75 ${testSignals.team2 ? 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981] scale-105' : 'bg-slate-900 border border-slate-700 text-slate-500'}`}>Team 2 (2)</div>
              <div className={`px-4 py-3 rounded-lg font-black uppercase tracking-widest transition-all duration-75 ${testSignals.undo ? 'bg-amber-500 text-white shadow-[0_0_15px_#f59e0b] scale-105' : 'bg-slate-900 border border-slate-700 text-slate-500'}`}>Undo (3)</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}