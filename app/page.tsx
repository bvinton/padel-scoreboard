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
    <main className="h-screen w-full flex flex-col bg-black text-white select-none overflow-hidden p-1 font-sans">
      
      {/* Settings Overlay */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
          <div className="bg-slate-900 border-4 border-slate-700 p-10 rounded-[3rem] w-full max-w-xl flex flex-col gap-6" onClick={e => e.stopPropagation()}>
             <button onClick={toggleGoldenPoint} className="py-6 rounded-3xl bg-slate-800 border-4 border-emerald-500 text-3xl font-black uppercase tracking-tighter">Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
             <button onClick={toggleServer} className="py-6 rounded-3xl bg-slate-800 border-4 border-slate-600 text-3xl font-black uppercase tracking-tighter">Swap Server</button>
             <button onClick={() => setSettingsOpen(false)} className="py-6 bg-white text-black text-3xl font-black rounded-3xl uppercase">Close</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <section className="h-[92%] flex flex-col gap-1">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`h-[49%] rounded-[1.5rem] border-[6px] flex flex-row items-center relative transition-all ${
              server === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900/20"
            }`}
          >
            {/* Label Overlay (Top Left) */}
            <div className="absolute top-2 left-6 z-20">
              <span className="text-2xl font-black italic opacity-30 uppercase tracking-tighter">{t.label}</span>
            </div>

            {/* Serving Indicator (Top Right) */}
            {server === t.id && (
              <div className="absolute top-2 right-6 z-20">
                <span className="bg-emerald-500 text-black px-4 py-1 rounded-full font-black text-sm animate-pulse uppercase">SERVING</span>
              </div>
            )}

            {/* 1. SETS (Increased to 22% Width) */}
            <div className="w-[22%] h-full flex flex-col items-center justify-center border-r-2 border-slate-800/50 bg-black/40">
              <span className="text-xl font-black text-slate-600 uppercase tracking-widest">Sets</span>
              {/* Increased from 20vh to 23vh */}
              <span className="text-[23vh] font-black leading-none">{t.data.sets}</span>
            </div>

            {/* 2. MAIN SCORE (Center - Max Scale) */}
            <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
              <span className="text-[40vh] font-black leading-none italic scale-x-[1.6] transform-gpu drop-shadow-[0_20px_40px_rgba(0,0,0,1)]">
                {formatPoints(t.data.points)}
              </span>
            </div>

            {/* 3. GAMES (Increased to 22% Width) */}
            <div className="w-[22%] h-full flex flex-col items-center justify-center border-l-2 border-slate-800/50 bg-black/40">
              <span className="text-xl font-black text-slate-600 uppercase tracking-widest">Games</span>
              {/* Increased from 20vh to 23vh */}
              <span className="text-[23vh] font-black leading-none">{t.data.games}</span>
            </div>
          </button>
        ))}
      </section>

      {/* Footer */}
      <footer className="h-[8%] flex items-center justify-between px-10 border-t border-slate-900">
        <button onClick={undo} className="text-2xl font-black text-slate-600 hover:text-white uppercase tracking-tighter">Undo</button>
        <div className="text-xl font-black text-slate-800 uppercase tracking-[1em]">{isTiebreak ? 'Tiebreak' : 'Regular'}</div>
        <div className="flex items-center gap-10">
          <button onClick={resetMatch} className="text-2xl font-black text-red-900 hover:text-red-500 uppercase tracking-tighter">Reset</button>
          <button onClick={() => setSettingsOpen(true)} className="p-2 text-slate-600"><Settings size={32} /></button>
        </div>
      </footer>
    </main>
  );
}