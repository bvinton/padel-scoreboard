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

  const [lastProcessedId, setLastProcessedId] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); } catch (e) {}
    };
    requestWakeLock();
    return () => { if (wakeLock) wakeLock.release(); };
  }, []);

  useEffect(() => {
    winSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
  }, []);

  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && winSoundRef.current) {
      winSoundRef.current.play().catch(e => console.log("Audio play blocked"));
    }
  }, [matchWinner, matchWinnerDismissed]);

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
    <main className="h-screen w-full flex flex-col bg-slate-950 text-slate-50 select-none overflow-hidden p-2 gap-1 font-sans">
      
      {/* Settings (Overlay) */}
      {settingsOpen && (
        <section className="absolute top-16 left-1/2 -translate-x-1/2 w-80 z-50 bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex flex-col gap-4">
            <button onClick={toggleGoldenPoint} className={`py-2 rounded-xl font-bold border-2 ${useGoldenPoint ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
            <button onClick={toggleServer} className="bg-slate-800 py-2 rounded-xl font-bold border border-slate-600">Swap Server</button>
            <button onClick={() => setMatchFormat(3)} className={`py-2 rounded-xl font-bold ${matchFormat === 3 ? 'bg-indigo-600' : 'bg-slate-800'}`}>Best of 3</button>
            <button onClick={() => setMatchFormat(5)} className={`py-2 rounded-xl font-bold ${matchFormat === 5 ? 'bg-indigo-600' : 'bg-slate-800'}`}>Best of 5</button>
          </div>
        </section>
      )}

      {/* Victory Overlay */}
      {matchWinner && !matchWinnerDismissed && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md" onClick={() => scorePoint("team1")}>
          <div className="flex flex-col items-center bg-slate-900 border-4 border-amber-400 p-12 rounded-[3rem] text-center" onClick={(e) => e.stopPropagation()}>
            <Trophy className="h-16 w-16 text-amber-400 mb-4 animate-bounce" />
            <h2 className="text-7xl font-black mb-6 text-white italic uppercase tracking-tighter">{matchWinner === 'team1' ? 'Team 1' : 'Team 2'} Wins</h2>
            <button onClick={resetMatch} className="bg-amber-500 text-slate-950 px-12 py-4 rounded-full text-2xl font-black uppercase">Play Again</button>
          </div>
        </div>
      )}

      {/* Scoreboard Body */}
      <section className="flex-[15] flex flex-col gap-1 min-h-0">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`flex-1 rounded-[2rem] border-4 flex flex-col px-4 py-2 relative overflow-hidden transition-all duration-300 ${
              server === t.id ? "border-emerald-500 bg-emerald-500/10 shadow-[inset_0_0_60px_rgba(16,185,129,0.15)]" : "border-slate-800/40 bg-slate-900/30"
            }`}
          >
            {/* Serving Indicator & Label */}
            <div className="flex justify-between items-center w-full h-6 z-20">
              <span className={`text-base font-black italic tracking-tighter ${server === t.id ? "text-emerald-400" : "text-slate-700"}`}>{t.label}</span>
              {server === t.id && <span className="text-[10px] font-black text-emerald-400 border border-emerald-400/50 px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">Serving</span>}
            </div>

            {/* Content Row: Sets | Score | Games */}
            <div className="flex-1 flex items-center justify-between w-full px-2 gap-4">
              
              {/* SETS BOX */}
              <div className="flex flex-col items-center justify-center bg-slate-950/80 w-36 h-28 rounded-2xl border border-slate-800 shadow-inner">
                <span className="text-[9px] text-slate-500 font-bold tracking-widest mb-1">SETS</span>
                <span className="text-7xl font-black text-slate-100 leading-none">{t.data.sets}</span>
              </div>

              {/* MAIN SCORE (The centerpiece) */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[16rem] font-black text-white leading-none italic drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] scale-x-[1.2] scale-y-[0.85] origin-center">
                  {formatPoints(t.data.points)}
                </span>
              </div>

              {/* GAMES BOX */}
              <div className="flex flex-col items-center justify-center bg-slate-950/80 w-36 h-28 rounded-2xl border border-slate-800 shadow-inner">
                <span className="text-[9px] text-slate-500 font-bold tracking-widest mb-1">GAMES</span>
                <span className="text-7xl font-black text-slate-100 leading-none">{t.data.games}</span>
              </div>

            </div>
          </button>
        ))}
      </section>

      {/* Ultra Compact Footer */}
      <footer className="flex-[1] flex items-center justify-between px-6 py-1 opacity-60 hover:opacity-100 transition-opacity">
        <button onClick={undo} className="text-xs font-black text-slate-400 uppercase flex items-center gap-1 hover:text-white"><Undo2 size={14} /> Undo</button>
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{isTiebreak ? 'Tiebreak Mode' : 'Regular Game'}</div>
        <div className="flex items-center gap-4">
          <button onClick={resetMatch} className="text-[10px] font-bold text-slate-700 uppercase hover:text-red-500">Reset</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1 text-slate-500 hover:text-white"><Settings size={18} /></button>
        </div>
      </footer>
    </main>
  );
}