import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Globe, Smartphone, RotateCcw, Play, Trophy, Share2, ClipboardList, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";

interface AppOverlaysProps {
  appStarted: boolean;
  handleAppStart: () => void;
  localDismissed: boolean;
  setLocalDismissed: (v: boolean) => void;
  handleReset: () => void;
  openMatchSetup: () => void; 
  isAnyModalOpen: boolean; // FIXED: The master radar flag
}

export default function AppOverlays({ appStarted, handleAppStart, localDismissed, setLocalDismissed, handleReset, openMatchSetup, isAnyModalOpen }: AppOverlaysProps) {
  const {
    team1, team2, matchWinner, matchWinnerDismissed,
    language, setLanguage, hasSelectedLanguage, setScores,
    initialServerDecided, setInitialServer,
    isSetupComplete, completeSetup, history,
    matchAnnouncement, clearAnnouncement 
  } = useMatchStore();

  const t = dict[language] || dict.en;
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isBrandNewMatch = history.length === 0 && team1.points === '0' && team2.points === '0' && team1.games === 0 && team2.games === 0 && team1.sets === 0 && team2.sets === 0;

  useEffect(() => {
    if (matchAnnouncement) {
      const timer = setTimeout(() => {
        clearAnnouncement();
      }, 7000); 
      return () => clearTimeout(timer);
    }
  }, [matchAnnouncement, clearAnnouncement]);

  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && !localDismissed) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#f59e0b', '#6366f1'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#f59e0b', '#6366f1'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [matchWinner, matchWinnerDismissed, localDismissed]);

  const handleShare = async () => { /* share logic */ };

  const team1FallbackName = team1?.name?.trim() ? team1.name : (language === 'es' ? 'Equipo 1' : 'Team 1');
  const team2FallbackName = team2?.name?.trim() ? team2.name : (language === 'es' ? 'Equipo 2' : 'Team 2');

  return (
    <>
      {!hasSelectedLanguage && (
        <div className="absolute inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center gap-10 p-6 text-center">
          <Globe size={100} className="text-emerald-500 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest italic drop-shadow-lg">Select Language</h1>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
            <button onClick={() => setLanguage('en')} className="flex-1 py-8 bg-slate-800 border-4 border-slate-700 hover:border-emerald-500 rounded-[2rem] text-3xl font-black text-white uppercase active:scale-95 transition-all shadow-xl">English</button>
            <button onClick={() => setLanguage('es')} className="flex-1 py-8 bg-slate-800 border-4 border-slate-700 hover:border-emerald-500 rounded-[2rem] text-3xl font-black text-white uppercase active:scale-95 transition-all shadow-xl">Español</button>
          </div>
        </div>
      )}

      {hasSelectedLanguage && (
        <div className="hidden portrait:flex fixed inset-0 z-[600] bg-slate-950 items-center justify-center flex-col gap-8 p-10 text-center">
          <Smartphone size={100} className="text-emerald-400 relative z-10" />
          <h2 className="text-4xl md:text-6xl font-black uppercase text-white italic">{t.rotateDevice}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-wider">{t.landscapeRequired}</p>
        </div>
      )}

      {/* FIXED: Hides if ANY modal is open to prevent blocking z-index issues */}
      {hasSelectedLanguage && !appStarted && !isAnyModalOpen && (
        <div className="absolute inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center gap-6 cursor-pointer" onClick={handleAppStart}>
          <Play size={100} className="text-emerald-400 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white drop-shadow-lg">{t.tapToStart}</h1>
          <p className="text-slate-400 font-bold uppercase">{t.keepsScreenAwake}</p>
        </div>
      )}

      {/* FIXED: Hides if ANY modal is open */}
      {hasSelectedLanguage && appStarted && !isSetupComplete && isBrandNewMatch && !isAnyModalOpen && (
        <div className="absolute inset-0 z-[450] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 p-6 animate-in fade-in duration-300">
          <h2 className="text-5xl md:text-6xl font-black uppercase text-white italic drop-shadow-lg tracking-widest text-center">
            {language === 'es' ? 'Nuevo Partido' : 'New Match'}
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-center max-w-lg mb-4">
            {language === 'es' ? 'Configura tus jugadores o inicia un partido rápido con valores predeterminados.' : 'Setup your players, or quick start with defaults.'}
          </p>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
            <button onClick={() => openMatchSetup()} className="flex-1 py-8 bg-blue-900/40 border-4 border-blue-700/50 hover:border-blue-400 rounded-[2rem] text-2xl font-black text-blue-300 uppercase active:scale-95 transition-all shadow-xl flex flex-col items-center gap-2">
              <ClipboardList size={32} /> {language === 'es' ? 'Configurar Partido' : 'Match Setup'}
            </button>
            <button onClick={() => completeSetup()} className="flex-1 py-8 bg-emerald-900/40 border-4 border-emerald-700/50 hover:border-emerald-400 rounded-[2rem] text-2xl font-black text-emerald-300 uppercase active:scale-95 transition-all shadow-xl flex flex-col items-center gap-2">
              <Zap size={32} /> {language === 'es' ? 'Inicio Rápido' : 'Quick Start'}
            </button>
          </div>
        </div>
      )}

      {/* FIXED: Hides if ANY modal is open */}
      {hasSelectedLanguage && appStarted && isSetupComplete && !initialServerDecided && isBrandNewMatch && !isAnyModalOpen && (
        <div className="absolute inset-0 z-[400] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 p-6 animate-in fade-in duration-300">
          <h2 className="text-5xl md:text-7xl font-black uppercase text-white italic drop-shadow-lg tracking-widest text-center">
            Play for Serve
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-center max-w-lg mb-4">
            {language === 'es' ? '¿Quién ganó el sorteo?' : 'Who won the toss / rally?'}
            <br/>
            <span className="text-xs md:text-sm text-emerald-500 mt-4 block">(Tap Flic 1x for {team1FallbackName}, 2x for {team2FallbackName})</span>
          </p>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl justify-center">
            <button onClick={() => setInitialServer('team1')} className="flex-1 py-10 bg-slate-800 border-4 border-slate-700 hover:border-emerald-500 rounded-[2rem] text-3xl md:text-4xl font-black text-white uppercase active:scale-95 transition-all shadow-xl">
              {team1FallbackName}
            </button>
            <button onClick={() => setInitialServer('team2')} className="flex-1 py-10 bg-slate-800 border-4 border-slate-700 hover:border-emerald-500 rounded-[2rem] text-3xl md:text-4xl font-black text-white uppercase active:scale-95 transition-all shadow-xl">
              {team2FallbackName}
            </button>
          </div>
        </div>
      )}

      {matchAnnouncement && !matchWinner && (
        <div 
          className="absolute inset-0 z-[350] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-6 animate-in zoom-in duration-300 cursor-pointer" 
          onClick={() => clearAnnouncement()}
        >
          <h2 className="text-5xl md:text-7xl font-black uppercase text-emerald-400 italic drop-shadow-[0_0_30px_rgba(52,211,153,0.4)] tracking-widest text-center whitespace-pre-line leading-tight">
            {matchAnnouncement.title}
          </h2>
          <p className="text-slate-300 font-black uppercase tracking-widest text-center text-xl md:text-3xl mt-4 bg-slate-800/50 px-8 py-3 rounded-full border border-slate-700 animate-pulse">
            {matchAnnouncement.subtitle}
          </p>
        </div>
      )}

      {matchWinner && !matchWinnerDismissed && !localDismissed && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => { if (!isExporting) setLocalDismissed(true); }}>
          <div 
            ref={cardRef} 
            className="relative flex flex-col items-center bg-slate-900 border-4 md:border-8 border-amber-400 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] text-center shadow-[0_0_100px_rgba(251,191,36,0.3)] max-h-[95vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <Trophy className="w-12 h-12 md:w-20 md:h-20 text-amber-400 mb-3 animate-pulse" />
            <h2 className="text-4xl md:text-7xl font-black mb-1 italic uppercase tracking-tighter text-white">{matchWinner.name}</h2>
            <div className="text-xl md:text-3xl text-white font-black uppercase tracking-widest mb-2">{team1.sets} - {team2.sets}</div>
            <div className="flex gap-2 md:gap-4 mb-6 md:mb-10">
              {setScores.map((set, idx) => (
                <div key={idx} className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  <span className="text-lg md:text-2xl font-black text-emerald-400">{set.team1}-{set.team2}</span>
                </div>
              ))}
            </div>
            {!isExporting && (
              <div className="flex flex-col md:flex-row gap-3 w-full">
                <button onClick={handleReset} className="flex-1 bg-amber-500 text-black px-6 py-4 rounded-full text-lg md:text-xl font-black uppercase active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <RotateCcw size={24} /> {t.playAgain}
                </button>
                <button onClick={handleShare} className="flex-1 bg-indigo-500 text-white px-6 py-4 rounded-full text-lg md:text-xl font-black uppercase active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <Share2 size={24} /> {language === 'es' ? 'Compartir' : 'Share'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}