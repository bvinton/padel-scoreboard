import { useMatchStore } from "../../store/useMatchStore";
import { dict } from "../translations";
import { Globe, Smartphone, RotateCcw, Play, Trophy } from "lucide-react";

interface AppOverlaysProps {
  appStarted: boolean;
  handleAppStart: () => void;
  localDismissed: boolean;
  setLocalDismissed: (v: boolean) => void;
  handleReset: () => void;
}

export default function AppOverlays({ appStarted, handleAppStart, localDismissed, setLocalDismissed, handleReset }: AppOverlaysProps) {
  const {
    team1, team2, matchWinner, matchWinnerDismissed,
    language, setLanguage, hasSelectedLanguage
  } = useMatchStore();

  const t = dict[language] || dict.en;

  return (
    <>
      {/* 0: LANGUAGE SELECTION OVERLAY */}
      {!hasSelectedLanguage && (
        <div className="absolute inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center gap-10 p-6 text-center">
          <Globe size={100} className="text-emerald-500 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest italic drop-shadow-lg">Select Language</h1>
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
            <button 
              onClick={() => setLanguage('en')} 
              className="flex-1 py-8 bg-slate-800 border-4 border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 rounded-[2rem] text-3xl font-black text-white uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('es')} 
              className="flex-1 py-8 bg-slate-800 border-4 border-slate-700 hover:border-emerald-500 hover:bg-slate-800/80 rounded-[2rem] text-3xl font-black text-white uppercase tracking-widest active:scale-95 transition-all shadow-xl"
            >
              Español
            </button>
          </div>
        </div>
      )}

      {/* 1: ROTATE DEVICE */}
      {hasSelectedLanguage && (
        <div className="hidden portrait:flex fixed inset-0 z-[600] bg-slate-950 items-center justify-center flex-col gap-8 p-10 text-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse rounded-full" />
            <Smartphone size={100} className="text-emerald-400 relative z-10" />
            <RotateCcw size={45} className="text-amber-400 absolute -bottom-2 -right-4 z-20" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-white italic drop-shadow-lg">{t.rotateDevice}</h2>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm md:text-lg">{t.landscapeRequired}</p>
          </div>
        </div>
      )}

      {/* 2: TAP TO START */}
      {hasSelectedLanguage && !appStarted && (
        <div className="absolute inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center gap-6 cursor-pointer" onClick={handleAppStart}>
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse rounded-full" />
            <Play size={100} className="text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest italic text-center text-white drop-shadow-lg">
            {t.tapToStart}
          </h1>
          <p className="text-slate-400 text-sm md:text-lg font-bold uppercase tracking-wider text-center px-8">
            {t.keepsScreenAwake}
          </p>
        </div>
      )}

      {/* 3: MATCH WINNER */}
      {matchWinner && !matchWinnerDismissed && !localDismissed && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl" onClick={() => setLocalDismissed(true)}>
          <div className="relative flex flex-col items-center bg-slate-900 border-4 md:border-8 border-amber-400 p-8 md:p-16 rounded-3xl md:rounded-[4rem] text-center shadow-[0_0_100px_rgba(251,191,36,0.4)]" onClick={e => e.stopPropagation()}>
            <Trophy className="w-16 h-16 md:w-24 md:h-24 text-amber-400 mb-4 md:mb-8 animate-pulse" />
            <h2 className="text-5xl md:text-8xl font-black mb-2 md:mb-4 italic uppercase tracking-tighter text-white">
              {matchWinner === 'team1' ? team1.name : team2.name}
            </h2>
            <button onClick={handleReset} className="bg-amber-500 text-black px-10 md:px-20 py-4 md:py-8 rounded-full text-2xl md:text-4xl font-black uppercase active:scale-95 transition-transform flex items-center gap-4">
              <RotateCcw size={40} /> {t.playAgain}
            </button>
          </div>
        </div>
      )}
    </>
  );
}