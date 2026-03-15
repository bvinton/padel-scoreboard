"use client";

import { useState } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { Undo2, Settings, CircleDot, ArrowRightLeft, Trophy, RotateCcw } from "lucide-react";

const TAP_LOCK_MS = 250;

export default function HomePage() {
  const {
    team1,
    team2,
    server,
    isTiebreak,
    useGoldenPoint,
    matchFormat,
    matchWinner,
    matchWinnerDismissed, // <-- Grab the new flag
    scorePoint,
    undo,
    toggleGoldenPoint,
    toggleServer,
    setMatchFormat,
    resetMatch,
  } = useMatchStore();

  const [tapLocked, setTapLocked] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleScore = (team: "team1" | "team2") => {
    if (tapLocked) return;
    setTapLocked(true);
    // Notice we no longer block clicks if there is a matchWinner.
    // The store will handle dismissing the screen on the first click!
    scorePoint(team);
    window.setTimeout(() => setTapLocked(false), TAP_LOCK_MS);
  };

  const formatPoints = (points: string | number) => {
    if (typeof points === "number") return points.toString();
    return points;
  };

  return (
    <main className="relative h-screen w-full flex flex-col bg-slate-950 text-slate-50 select-none overflow-hidden p-3 md:p-5 gap-3 md:gap-4">
      
      {/* --- VICTORY OVERLAY (FIREWORKS) --- */}
      {/* Only show if there is a winner AND we haven't dismissed it yet */}
      {matchWinner && !matchWinnerDismissed && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-500"
          // Clicking anywhere on the background also dismisses it, just like a Flic click!
          onClick={() => scorePoint("team1")} 
        >
          <div 
            className="relative flex flex-col items-center justify-center bg-slate-900 border-4 border-amber-400 p-8 md:p-16 rounded-[3rem] shadow-[0_0_100px_rgba(251,191,36,0.5)] transform transition-all scale-100 animate-in zoom-in-90 duration-500"
            onClick={(e) => e.stopPropagation()} // Stop background clicks from firing if you click the box
          >
            <span className="absolute -top-10 -left-10 text-6xl animate-bounce">🎇</span>
            <span className="absolute -top-10 -right-10 text-6xl animate-bounce delay-100">🎆</span>
            <span className="absolute -bottom-10 -left-10 text-6xl animate-pulse">🎊</span>
            <span className="absolute -bottom-10 -right-10 text-6xl animate-pulse delay-200">🎉</span>
            
            <Trophy className="h-20 w-20 md:h-32 md:w-32 text-amber-400 mb-6 animate-pulse" />
            
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tight uppercase mb-2">
              {matchWinner === 'team1' ? 'Team 1' : 'Team 2'}
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-amber-400 uppercase tracking-[0.2em] mb-12">
              Wins the Match!
            </h3>
            
            <p className="text-slate-400 text-sm md:text-xl uppercase tracking-widest mb-6 text-center">
              Tap any score button to continue playing
            </p>

            <button
              type="button"
              onClick={resetMatch}
              className="inline-flex items-center gap-3 bg-amber-500 text-slate-950 px-8 py-4 md:px-12 md:py-6 rounded-full text-2xl md:text-4xl font-black uppercase tracking-wider shadow-lg active:scale-95 transition-transform hover:bg-amber-400"
            >
              <RotateCcw className="h-8 w-8 md:h-10 md:w-10" />
              Reset & Play Again
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {settingsOpen && (
        <section className="px-2 z-40">
          <div className="flex flex-col gap-4 md:gap-6 rounded-3xl bg-slate-900/95 px-6 py-5 md:py-6 border border-slate-700 shadow-xl backdrop-blur-md">
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-lg font-semibold uppercase tracking-wide text-slate-400">
                  Match Length
                </p>
                <p className="text-base md:text-xl font-medium mt-1 text-slate-200">
                  Total sets to play
                </p>
              </div>
              <div className="flex bg-slate-800 p-1.5 rounded-full border border-slate-700 gap-1">
                <button
                  onClick={() => setMatchFormat(3)}
                  className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-xl font-bold transition-colors ${
                    matchFormat === 3 ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Best of 3
                </button>
                <button
                  onClick={() => setMatchFormat(5)}
                  className={`px-4 md:px-6 py-2 rounded-full text-sm md:text-xl font-bold transition-colors ${
                    matchFormat === 5 ? "bg-indigo-500 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Best of 5
                </button>
              </div>
            </div>

            <div className="h-px w-full bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-lg font-semibold uppercase tracking-wide text-slate-400">
                  Scoring Mode
                </p>
                <p className="text-base md:text-xl font-medium mt-1 text-slate-200">
                  {useGoldenPoint ? "Punto de Oro (Golden Point)" : "Traditional Advantage"}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleGoldenPoint}
                className={`relative inline-flex h-10 w-20 md:h-12 md:w-24 items-center rounded-full transition-colors ${
                  useGoldenPoint ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-8 w-8 md:h-10 md:w-10 transform rounded-full bg-white shadow-md transition-transform ${
                    useGoldenPoint ? "translate-x-11 md:translate-x-13" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="h-px w-full bg-slate-800" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-lg font-semibold uppercase tracking-wide text-slate-400">
                  Current Server
                </p>
                <p className="text-base md:text-xl font-medium mt-1 text-slate-200">
                  Manually swap who is serving
                </p>
              </div>
              <button
                type="button"
                onClick={toggleServer}
                className="inline-flex items-center gap-2 rounded-full bg-slate-800 border-2 border-slate-600 px-5 py-2 md:px-6 md:py-3 text-sm md:text-xl font-bold text-slate-200 active:scale-95 transition-transform"
              >
                <ArrowRightLeft className="h-4 w-4 md:h-6 md:w-6" />
                Swap
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Main Scoreboard Area */}
      <section className="flex-1 flex flex-col gap-4 min-h-0">
        <button
          type="button"
          onClick={() => handleScore("team1")}
          className={`group flex-1 rounded-[2.5rem] border-4 flex flex-col px-6 md:px-10 py-4 md:py-6 active:scale-[0.98] transition-transform relative overflow-hidden ${
            server === "team1"
              ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_60px_rgba(16,185,129,0.3)]"
              : "border-slate-800 bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-between w-full h-8 md:h-12 z-20">
            <span className="text-xl md:text-4xl uppercase tracking-[0.2em] font-bold text-slate-400">
              Team 1
            </span>
            {server === "team1" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 md:py-2 text-sm md:text-2xl font-bold uppercase tracking-wider text-emerald-300 border-2 border-emerald-400/50">
                <CircleDot className="h-4 w-4 md:h-6 md:w-6" />
                Serving
              </span>
            )}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-[9rem] md:text-[16rem] lg:text-[20rem] font-black leading-none tabular-nums tracking-tighter text-white drop-shadow-lg scale-x-[1.2] md:scale-x-[1.3] scale-y-[1.1] origin-center">
              {formatPoints(team1.points)}
            </span>
          </div>

          <div className="flex-1 flex items-end justify-between w-full pb-2 md:pb-4 relative z-20">
            <div className="flex flex-col items-start w-[25%]">
              <span className="text-sm md:text-2xl text-slate-400 uppercase tracking-[0.2em] font-semibold">
                Sets
              </span>
              <span className="text-7xl md:text-[8rem] lg:text-[9rem] font-bold leading-none tabular-nums text-slate-300">
                {team1.sets}
              </span>
            </div>
            
            <div className="flex flex-col items-end w-[25%]">
              <span className="text-sm md:text-2xl uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Games
              </span>
              <span className="text-7xl md:text-[8rem] lg:text-[9rem] font-bold leading-none tabular-nums text-slate-300">
                {team1.games}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleScore("team2")}
          className={`group flex-1 rounded-[2.5rem] border-4 flex flex-col px-6 md:px-10 py-4 md:py-6 active:scale-[0.98] transition-transform relative overflow-hidden ${
            server === "team2"
              ? "border-cyan-400 bg-cyan-500/15 shadow-[0_0_60px_rgba(34,211,238,0.3)]"
              : "border-slate-800 bg-slate-900/60"
          }`}
        >
          <div className="flex items-center justify-between w-full h-8 md:h-12 z-20">
            <span className="text-xl md:text-4xl uppercase tracking-[0.2em] font-bold text-slate-400">
              Team 2
            </span>
            {server === "team2" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-1.5 md:py-2 text-sm md:text-2xl font-bold uppercase tracking-wider text-cyan-300 border-2 border-cyan-400/50">
                <CircleDot className="h-4 w-4 md:h-6 md:w-6" />
                Serving
              </span>
            )}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-[9rem] md:text-[16rem] lg:text-[20rem] font-black leading-none tabular-nums tracking-tighter text-white drop-shadow-lg scale-x-[1.2] md:scale-x-[1.3] scale-y-[1.1] origin-center">
              {formatPoints(team2.points)}
            </span>
          </div>

          <div className="flex-1 flex items-end justify-between w-full pb-2 md:pb-4 relative z-20">
            <div className="flex flex-col items-start w-[25%]">
              <span className="text-sm md:text-2xl text-slate-400 uppercase tracking-[0.2em] font-semibold">
                Sets
              </span>
              <span className="text-7xl md:text-[8rem] lg:text-[9rem] font-bold leading-none tabular-nums text-slate-300">
                {team2.sets}
              </span>
            </div>
            
            <div className="flex flex-col items-end w-[25%]">
              <span className="text-sm md:text-2xl uppercase tracking-[0.2em] text-slate-400 font-semibold">
                Games
              </span>
              <span className="text-7xl md:text-[8rem] lg:text-[9rem] font-bold leading-none tabular-nums text-slate-300">
                {team2.games}
              </span>
            </div>
          </div>
        </button>
      </section>

      {/* Bottom Control Bar */}
      <footer className="relative flex items-center justify-between mt-1 md:mt-2 px-2 pb-1 md:pb-2">
        
        <div className="flex z-10">
          <button
            type="button"
            onClick={undo}
            className="inline-flex items-center justify-center gap-2 md:gap-3 rounded-full bg-slate-900 text-slate-100 px-6 py-3 md:px-8 md:py-5 text-lg md:text-2xl font-bold border-2 border-slate-700 shadow-sm active:scale-95 disabled:opacity-50"
            // You can't undo while the victory overlay is showing. Dismiss it first!
            disabled={!!matchWinner && !matchWinnerDismissed}
          >
            <Undo2 className="h-5 w-5 md:h-8 md:w-8" />
            Undo
          </button>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">
            Best of {matchFormat} Sets
          </span>
          <span
            className={`pointer-events-auto inline-flex items-center gap-2 rounded-full px-5 md:px-8 py-2 md:py-3 border-2 md:border-4 text-sm md:text-2xl font-bold tracking-wide ${
              isTiebreak
                ? "border-amber-400/60 bg-amber-500/10 text-amber-300"
                : "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            <CircleDot className="h-4 w-4 md:h-6 md:w-6" />
            {isTiebreak ? "Tiebreak" : "Regular Games"}
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8 z-10">
          <button
            type="button"
            onClick={resetMatch}
            className="text-lg md:text-2xl font-bold text-slate-400 underline underline-offset-4 active:text-slate-200"
          >
            Reset match
          </button>
          
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-700 bg-slate-900 px-5 py-3 md:px-8 md:py-5 text-lg md:text-2xl font-bold text-slate-100 shadow-sm active:scale-95"
          >
            <Settings className="h-5 w-5 md:h-8 md:w-8" />
            Settings
          </button>
        </div>
      </footer>
    </main>
  );
}