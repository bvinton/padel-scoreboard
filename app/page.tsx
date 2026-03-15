"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { Undo2, Settings, CircleDot, Trophy, RotateCcw } from "lucide-react";

export default function HomePage() {
  const {
    team1, team2, server, isTiebreak, useGoldenPoint, matchFormat,
    matchWinner, matchWinnerDismissed, scorePoint, undo,
    toggleGoldenPoint, toggleServer, setMatchFormat, resetMatch,
  } = useMatchStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastProcessedId, setLastProcessedId] = useState(0);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  // --- SCREEN WAKE LOCK ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); } catch (e) {}
    };
    requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, []);

  // --- SOUND EFFECT ---
  useEffect(() => {
    winSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
  }, []);

  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && winSoundRef.current) {
      winSoundRef.current.play().catch(e => console.log("Audio play blocked"));
    }
  }, [matchWinner, matchWinnerDismissed]);

  // --- FLIC POLL ---
  useEffect(() => {
    const pollFlic = async () => {
      try {
        const res = await fetch('/api/flic');
        const data = await res.json();
        if (data.id > lastProcessedId) {
          setLastProcessedId(data.id);
          if (data.type === 'team1') scorePoint('team1');
          if (data.type === 'team2') scorePoint('team2');
          if (data.type === 'undo') undo();
        }
      } catch (e) {}
    };
    const interval = setInterval(pollFlic, 500);
    return () => clearInterval(interval);
  }, [lastProcessedId, scorePoint, undo]);

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;

  return (
    <main className="h-screen w-full flex flex-col bg-slate-950 text-slate-50 select-none overflow-hidden p-1 md:p-3 gap-1 font-sans">
      
      {/* VICTORY OVERLAY */}
      {matchWinner && !matchWinnerDismissed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl" onClick={() => scorePoint("team1")}>
          <div className="relative flex flex-col items-center justify-center bg-slate-900 border-4 border-amber-400 p-10 rounded-[4rem] text-center" onClick={(e) => e.stopPropagation()}>
            <Trophy className="h-16 w-16 text-amber-400 mb-6" />
            <h2 className="text-6xl md:text-8xl font-black mb-2 text-white italic tracking-tighter uppercase">
              {matchWinner === 'team1' ? 'Team 1' : 'Team 2'}
            </h2>
            <h3 className="text-3xl font-black text-amber-400 uppercase italic mb-10 tracking-widest">VICTORY</h3>
            <button onClick={resetMatch} className="bg-amber-500 text-slate-950 px-10 py-5 rounded-full text-2xl font-black uppercase shadow-lg active:scale-95">
              <RotateCcw className="inline mr-3 w-8 h-8" /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      {settingsOpen && (
        <section className="absolute top-12 left-4 right-4 z-40 bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex flex-col gap-4">
            <button onClick={toggleGoldenPoint} className={`px-4 py-3 rounded-full font-bold border-2 ${useGoldenPoint ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>Golden Point: {useGoldenPoint ? 'On' : 'Off'}</button>
            <button onClick={toggleServer} className="bg-slate-800 px-6 py-3 rounded-full font-bold border border-slate-600">Swap Server</button>
            <div className="flex gap-2">
              <button onClick={() => setMatchFormat(3)} className={`flex-1 py-3 rounded-full font-bold ${matchFormat === 3 ? 'bg-indigo-500 text-white' : 'text-slate-500 bg-slate-800'}`}>Best of 3</button>
              <button onClick={() => setMatchFormat(5)} className={`flex-1 py-3 rounded-full font-bold ${matchFormat === 5 ? 'bg-indigo-500 text-white' : 'text-slate-500 bg-slate-800'}`}>Best of 5</button>
            </div>
            <button onClick={() => setSettingsOpen(false)} className="mt-2 text-slate-500 underline text-sm">Close Settings</button>
          </div>
        </section>
      )}

      {/* Teams Section */}
      <section className="flex-[14] flex flex-col gap-1.5 min-h-0">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`flex-1 rounded-[2rem] border-4 flex flex-col px-6 py-3 relative overflow-hidden transition-all duration-300 ${
              server === t.id 
                ? "border-emerald-500 bg-emerald-500/10 shadow-[inset_0_0_40px_rgba(16,185,129,0.1)]" 
                : "border-slate-800/40 bg-slate-900/30"
            }`}
          >
            {/* Team Header */}
            <div className="flex justify-between w-full h-6 z-20">
              <span className={`text-lg font-black italic tracking-tighter ${server === t.id ? "text-emerald-400" : "text-slate-700"}`}>
                {t.label}
              </span>
              {server === t.id && (
                <span className="bg-emerald-500/20 px-3 py-0.5 rounded-full text-[10px] font-black border border-emerald-400/50 text-emerald-400 tracking-widest flex items-center gap-1">
                  <CircleDot size={10} className="animate-pulse" /> SERVING
                </span>
              )}
            </div>

            {/* Score (Centered) */}
            <div className="flex-1 flex items-center justify-center pointer-events-none z-10 -mt-2">
              <span className="text-[12rem] md:text-[15rem] font-black text-white leading-none italic drop-shadow-2xl">
                {formatPoints(t.data.points)}
              </span>
            </div>

            {/* Sets/Games Boxes (Restructured for no overlap) */}
            <div className="flex items-end justify-between w-full z-20 pb-1">
              <div className="flex flex-col items-center bg-slate-950/80 px-8 py-2 rounded-3xl border border-slate-800/60 min-w-[190px]">
                <span className="text-[9px] text-slate-500 font-bold tracking-[0.2em]">SETS</span>
                <span className="text-8xl font-black text-slate-100 leading-none mt-1">{t.data.sets}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/80 px-8 py-2 rounded-3xl border border-slate-800/60 min-w-[190px]">
                <span className="text-[9px] text-slate-500 font-bold tracking-[0.2em]">GAMES</span>
                <span className="text-8xl font-black text-slate-100 leading-none mt-1">{t.data.games}</span>
              </div>
            </div>

          </button>
        ))}
      </section>

      {/* Footer */}
      <footer className="flex-[1] flex items-center justify-between px-4 border-t border-slate-800/20">
        <button onClick={undo} className="text-xs font-black text-slate-500 flex items-center gap-1 uppercase hover:text-slate-300">
          <Undo2 size={14} /> Undo
        </button>
        <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
            {isTiebreak ? 'Tiebreak' : 'Regular'}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={resetMatch} className="text-[9px] font-bold text-slate-800 uppercase hover:text-red-500">Reset</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1 text-slate-600 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </footer>
    </main>
  );
}