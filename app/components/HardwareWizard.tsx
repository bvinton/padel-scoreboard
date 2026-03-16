import { useState, useRef } from "react";
import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Globe, ChevronLeft, ChevronRight, Check, Copy, RadioTower, CheckCircle2 } from "lucide-react";

interface HardwareWizardProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  testSignals: { team1: boolean; team2: boolean; undo: boolean };
}

export default function HardwareWizard({ isOpen, onClose, roomCode, testSignals }: HardwareWizardProps) {
  const { language } = useMatchStore();
  const t = dict[language] || dict.en; 
  
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardImageIndex, setWizardImageIndex] = useState(1); 
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const touchStart = useRef<{x: number, y: number} | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCloseReadme = () => { 
    if (dontShowAgain) localStorage.setItem('padelReadmeDismissed', 'true'); 
    onClose(); 
    setTimeout(() => { setWizardStep(1); setWizardImageIndex(1); }, 500);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const xDist = touchStart.current.x - e.changedTouches[0].clientX;
    const yDist = touchStart.current.y - e.changedTouches[0].clientY;

    if (Math.abs(xDist) > Math.abs(yDist) && Math.abs(xDist) > 40) {
      if (xDist > 0 && wizardImageIndex < 3) setWizardImageIndex(prev => prev + 1);
      if (xDist < 0 && wizardImageIndex > 1) setWizardImageIndex(prev => prev - 1);
    }
    touchStart.current = null;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[300] bg-black/95 flex items-center justify-center p-4" onClick={handleCloseReadme}>
      <div className="bg-slate-900 border-2 md:border-4 border-emerald-500 p-6 md:p-10 rounded-2xl md:rounded-[3rem] w-full max-w-4xl flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(16,185,129,0.2)]" onClick={e => e.stopPropagation()}>
         
         <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-black uppercase text-emerald-400 tracking-widest italic leading-none">{t.hardwareSetup}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs md:text-sm mt-1">{t.courtId}: <span className="text-white font-mono">{roomCode}</span></p>
            </div>
            <div className="flex gap-1 md:gap-2">
              {[1,2,3,4,5].map(step => (
                <div key={step} className={`h-2 w-8 md:w-12 rounded-full transition-colors ${wizardStep === step ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : wizardStep > step ? 'bg-emerald-900' : 'bg-slate-800'}`} />
              ))}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[40vh]">
            {wizardStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <Globe className="text-emerald-400" /> {t.flicInstructions}
                </h3>
                <p className="text-slate-300 md:text-lg italic tracking-tight">{t.flicSwipeInfo}</p>
                
                <div 
                  className="relative bg-black/40 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  <div className="aspect-[16/9] flex items-center justify-center relative bg-slate-950">
                    <img 
                      src={`/hardwaresetup${wizardImageIndex}.jpg`} 
                      alt={`Setup Step ${wizardImageIndex}`}
                      className="max-h-full max-w-full object-contain pointer-events-none select-none"
                    />
                    <button 
                      onClick={() => setWizardImageIndex(prev => Math.max(1, prev - 1))}
                      className={`absolute left-2 md:left-4 p-2 md:p-4 bg-emerald-500 text-black rounded-full shadow-lg transition-all active:scale-90 ${wizardImageIndex === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                      <ChevronLeft size={36} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setWizardImageIndex(prev => Math.min(3, prev + 1))}
                      className={`absolute right-2 md:right-4 p-2 md:p-4 bg-emerald-500 text-black rounded-full shadow-lg transition-all active:scale-90 ${wizardImageIndex === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                      <ChevronRight size={36} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="bg-slate-800/95 p-4 flex items-center justify-between border-t border-slate-700">
                    <p className="text-white font-black uppercase text-[10px] md:text-xs tracking-widest italic pr-4">
                      {wizardImageIndex === 1 && t.step1}
                      {wizardImageIndex === 2 && t.step2}
                      {wizardImageIndex === 3 && t.step3}
                    </p>
                    <div className="flex gap-2 flex-shrink-0">
                      {[1,2,3].map(i => (
                        <div key={i} className={`h-2 w-6 rounded-full transition-colors ${wizardImageIndex === i ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]' : 'bg-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3"><span className="w-4 h-12 bg-emerald-500 rounded-full"></span><h3 className="text-2xl md:text-3xl font-black uppercase text-white">{t.team1} {t.button}</h3></div>
                <p className="text-slate-300">{t.copyUrlTeam1}</p>
                <div className="flex items-center gap-2 bg-black/60 p-3 md:p-4 rounded-xl border border-slate-700">
                  <code className="text-emerald-400 font-mono break-all text-sm md:text-base flex-1">https://padel-scoreboard-mocha.vercel.app/api/flic?room={roomCode}&type=team1</code>
                  <button onClick={() => handleCopy(`https://padel-scoreboard-mocha.vercel.app/api/flic?room=${roomCode}&type=team1`, 'team1')} className={`p-3 md:p-4 rounded-xl ${copiedLink === 'team1' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                    {copiedLink === 'team1' ? <Check size={24} /> : <Copy size={24} />}
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3"><span className="w-4 h-12 bg-indigo-500 rounded-full"></span><h3 className="text-2xl md:text-3xl font-black uppercase text-white">{t.team2} {t.button}</h3></div>
                <p className="text-slate-300">{t.copyUrlTeam2}</p>
                <div className="flex items-center gap-2 bg-black/60 p-3 md:p-4 rounded-xl border border-slate-700">
                  <code className="text-indigo-400 font-mono break-all text-sm md:text-base flex-1">https://padel-scoreboard-mocha.vercel.app/api/flic?room={roomCode}&type=team2</code>
                  <button onClick={() => handleCopy(`https://padel-scoreboard-mocha.vercel.app/api/flic?room=${roomCode}&type=team2`, 'team2')} className={`p-3 md:p-4 rounded-xl ${copiedLink === 'team2' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                    {copiedLink === 'team2' ? <Check size={24} /> : <Copy size={24} />}
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
               <div className="space-y-6">
                 <div className="flex items-center gap-3"><span className="w-4 h-12 bg-amber-500 rounded-full"></span><h3 className="text-2xl md:text-3xl font-black uppercase text-white">{t.undo} {t.button}</h3></div>
                 <p className="text-slate-300">{t.copyUrlUndo}</p>
                 <div className="flex items-center gap-2 bg-black/60 p-3 md:p-4 rounded-xl border border-slate-700">
                   <code className="text-amber-400 font-mono break-all text-sm md:text-base flex-1">https://padel-scoreboard-mocha.vercel.app/api/flic?room={roomCode}&type=undo</code>
                   <button onClick={() => handleCopy(`https://padel-scoreboard-mocha.vercel.app/api/flic?room=${roomCode}&type=undo`, 'undo')} className={`p-3 md:p-4 rounded-xl ${copiedLink === 'undo' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                     {copiedLink === 'undo' ? <Check size={24} /> : <Copy size={24} />}
                   </button>
                 </div>
               </div>
            )}

            {wizardStep === 5 && (
              <div className="space-y-8 flex flex-col items-center pt-4">
                <RadioTower size={64} className="text-emerald-500 animate-pulse" />
                <h3 className="text-2xl md:text-4xl font-black uppercase text-white text-center italic tracking-widest">{t.testConnection}</h3>
                <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-4">
                  <div className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${testSignals.team1 ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800/50 border-slate-700'}`}>
                    {testSignals.team1 ? <CheckCircle2 size={40} className="text-emerald-500 mb-2" /> : <div className="w-10 h-10 rounded-full bg-slate-700 mb-2 animate-pulse" />}
                    <span className="font-bold uppercase text-[10px] md:text-xs">{t.team1}</span>
                  </div>
                  <div className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${testSignals.team2 ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800/50 border-slate-700'}`}>
                    {testSignals.team2 ? <CheckCircle2 size={40} className="text-indigo-500 mb-2" /> : <div className="w-10 h-10 rounded-full bg-slate-700 mb-2 animate-pulse" />}
                    <span className="font-bold uppercase text-[10px] md:text-xs">{t.team2}</span>
                  </div>
                  <div className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ${testSignals.undo ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-slate-800/50 border-slate-700'}`}>
                    {testSignals.undo ? <CheckCircle2 size={40} className="text-amber-500 mb-2" /> : <div className="w-10 h-10 rounded-full bg-slate-700 mb-2 animate-pulse" />}
                    <span className="font-bold uppercase text-[10px] md:text-xs">{t.undo}</span>
                  </div>
                </div>
              </div>
            )}
         </div>

         <div className="flex items-center justify-between border-t-2 border-slate-800 pt-6 mt-4">
            <div className="flex items-center gap-2">
              {wizardStep === 1 && (
                <>
                  <input type="checkbox" id="dontShow" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
                  <label htmlFor="dontShow" className="text-slate-400 font-bold uppercase text-xs cursor-pointer select-none">{t.dontShowAgain}</label>
                </>
              )}
            </div>
            <div className="flex gap-4">
              {wizardStep > 1 && <button onClick={() => setWizardStep(p => p - 1)} className="px-6 py-3 bg-slate-800 text-white rounded-xl uppercase font-bold hover:bg-slate-700 active:scale-95 transition-all"><ChevronLeft /></button>}
              {wizardStep < 5 ? (
                <button onClick={() => setWizardStep(p => p + 1)} className="px-8 py-3 bg-emerald-500 text-black rounded-xl uppercase font-black flex items-center gap-2 active:scale-95 transition-all">{t.next} <ChevronRight /></button>
              ) : (
                <button onClick={handleCloseReadme} className="px-10 py-3 bg-emerald-500 text-black rounded-xl uppercase font-black active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">{t.startMatch}</button>
              )}
            </div>
         </div>
      </div>
    </div>
  );
}