"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { Undo2, Settings, CircleDot, ArrowRightLeft, Trophy, RotateCcw } from "lucide-react";

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

  // --- SOUND EFFECT LOGIC ---
  useEffect(() => {
    winSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
  }, []);

  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && winSoundRef.current) {
      winSoundRef.current.play().catch(e => console.log("Audio play blocked by browser"));
    }
  }, [matchWinner, matchWinnerDismissed]);

  // --- FLIC POLL LOGIC ---
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
    <main className="h-screen w-full flex flex-col bg-slate-950 text-slate-50 select-none overflow-hidden p-2 md:p-4 gap-2 font-sans">
      
      {/* VICTORY OVERLAY */}
      {matchWinner && !matchWinnerDismissed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => scorePoint("team1")}>
          <div className="relative flex flex-col items-center justify-center bg-slate-900 border-4 border-amber-400 p-10 rounded-[4rem] text-center shadow-[0_0_100px_rgba(251,191,36,0.2)]" onClick={(e) => e.stopPropagation()}>
            <span className="absolute -top-10 -left-10 text-6xl animate-bounce">🎇</span>
            <span className="absolute -top-10 -right-10 text-6xl animate-bounce delay-100">🎆</span>
            <span className="absolute -bottom-10 -left-10 text-6xl animate-pulse">🎊</span>
            <span className="absolute -bottom-10 -right-10 text-6xl animate-pulse delay-200">🎉</span>
            <Trophy className="h-20 w-20 text-amber-400 mb-6 animate-pulse" />
            <h2 className="text-6xl md:text-8xl font-black mb-2 text-white italic tracking-tighter">
              {matchWinner === 'team1' ? 'TEAM 1' : 'TEAM 2'}
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-amber-400 uppercase italic mb-10 tracking-widest">VICTORY</h3>
            <button onClick={resetMatch} className="bg-amber-500 text-slate-950 px-10 py-5 rounded-full text-2xl font-black uppercase shadow-lg active:scale-95 transition-transform">
              <RotateCcw className="inline mr-3 w-8 h-8" /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {settingsOpen && (
        <section className="absolute top-16 left-4 right-4 z-40 bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400">SETS</span>
              <div className="flex bg-slate-800 rounded-full p-1">
                {[3, 5].map(n => (
                  <button key={n} onClick={() => setMatchFormat(n as 3|5)} className={`px-4 py-2 rounded-full font-bold ${matchFormat === n ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>Best of {n}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400">GOLDEN POINT</span>
              <button onClick={toggleGoldenPoint} className={`px-4 py-2 rounded-full font-bold border-2 ${useGoldenPoint ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>{useGoldenPoint ? 'On' : 'Off'}</button>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-400">SERVER</span>
              <button onClick={toggleServer} className="bg-slate-800 px-6 py-2 rounded-full font-bold border border-slate-600 active:bg-slate-700">Swap Server</button>
            </div>
          </div>
        </section>
      )}

      {/* Teams Section */}
      <section className="flex-[12] flex flex-col gap-2 min-h-0">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`flex-1 rounded-[2.5rem] border-4 flex flex-col px-8 py-4 relative overflow-hidden transition-all duration-300 ${
              server === t.id 
                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.2)]" 
                : "border-slate-800/50 bg-slate-900/40"
            }`}
          >
            {/* Header Info */}
            <div className="flex justify-between w-full h-8 z-20">
              <span className={`text-xl font-black italic tracking-tighter ${server === t.id ? "text-emerald-400" : "text-slate-600"}`}>
                {t.label}
              </span>
              {server === t.id && (
                <span className="bg-emerald-500/20 px-4 py-0.5 rounded-full text-[10px] font-black border border-emerald-400/50 text-emerald-300 tracking-widest flex items-center gap-1">
                  <CircleDot size={10} className="animate-pulse" /> SERVING
                </span>
              )}
            </div>

            {/* Main Score (Centered vertically in the middle area) */}
            <div className="flex-1 flex items-center justify-center pointer-events-none z-10">
              <span className="text-[12rem] md:text-[16rem] font-black text-white leading-none italic drop-shadow-2xl translate-y-2">
                {formatPoints(t.data.points)}
              </span>
            </div>

            {/* Sets/Games Boxes */}
            <div className="flex items-end justify-between w-full pb-2 z-20">
              <div className="flex flex-col items-center bg-slate-950/60 px-10 py-3 rounded-[2rem] border-2 border-slate-800/80 min-w-[210px]">
                <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] mb-1">SETS</span>
                <span className="text-[9.5rem] font-black text-slate-100 leading-[0.8] mb-1">{t.data.sets}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/60 px-10 py-3 rounded-[2rem] border-2 border-slate-800/80 min-w-[210px]">
                <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] mb-1">GAMES</span>
                <span className="text-[9.5rem] font-black text-slate-100 leading-[0.8] mb-1">{t.data.games}</span>
              </div>
            </div>

          </button>
        ))}
      </section>

      {/* Footer Controls */}
      <footer className="flex-[1] grid grid-cols-3 items-center pt-1 border-t border-slate-800/30">
        <div className="flex justify-start">
          <button onClick={undo} className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl font-black text-slate-300 active:scale-95 transition-transform uppercase tracking-wider text-xs flex items-center gap-2">
            <Undo2 size={16} /> UNDO
          </button>
        </div>
        
        <div className="text-center">
          <div className={`inline-block px-3 py-0.5 rounded-full border text-[10px] font-black uppercase ${isTiebreak ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'border-slate-800 text-slate-600'}`}>
            {isTiebreak ? 'Tiebreak' : 'Regular'}
          </div>
        </div>

        <div className="flex justify-end items-center gap-3">
          <button onClick={resetMatch} className="hidden md:block text-slate-600 font-bold text-[10px] uppercase hover:text-red-400 transition-colors">Reset</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-2 bg-slate-900 border border-slate-700 rounded-xl active:bg-slate-800">
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </footer>
    </main>
  );
}