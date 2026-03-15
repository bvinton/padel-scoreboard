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
    <main className="h-screen w-full flex flex-col bg-slate-950 text-slate-50 select-none overflow-hidden p-1 gap-1">
      
      {/* Settings Overlay */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-[3rem] w-full max-w-md flex flex-col gap-4">
             <button onClick={toggleGoldenPoint} className="py-4 rounded-2xl bg-slate-800 border border-emerald-500 text-emerald-400 font-bold">Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
             <button onClick={() => setSettingsOpen(false)} className="py-4 bg-white text-black font-black rounded-2xl">CLOSE</button>
          </div>
        </div>
      )}

      {/* Main Scoreboard Content */}
      <section className="h-[92%] flex flex-col gap-1">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`h-[49%] rounded-[2rem] border-4 flex flex-col px-6 py-2 relative overflow-hidden transition-all ${
              server === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800/60 bg-slate-900/40"
            }`}
          >
            {/* Header (15% Height) */}
            <div className="h-[15%] flex justify-between items-center w-full">
              <span className="text-xl font-black italic tracking-tighter text-slate-400">{t.label}</span>
              {server === t.id && <span className="text-[10px] font-black text-emerald-400 border border-emerald-400/50 px-3 py-1 rounded-full animate-pulse uppercase">Serving</span>}
            </div>

            {/* Score (50% Height) */}
            <div className="h-[50%] flex items-center justify-center">
              <span className="text-[32vh] font-black leading-none italic drop-shadow-2xl">
                {formatPoints(t.data.points)}
              </span>
            </div>

            {/* Boxes (35% Height) - These now stay inside the border */}
            <div className="h-[35%] flex justify-between items-center w-full gap-4 pb-2">
              <div className="flex-1 h-full bg-slate-950/80 rounded-[1.5rem] border border-slate-800/80 flex flex-col items-center justify-center">
                <span className="text-[1.2vh] text-slate-500 font-bold uppercase tracking-widest">Sets</span>
                <span className="text-[13vh] font-black leading-none text-slate-100">{t.data.sets}</span>
              </div>
              <div className="flex-1 h-full bg-slate-950/80 rounded-[1.5rem] border border-slate-800/80 flex flex-col items-center justify-center">
                <span className="text-[1.2vh] text-slate-500 font-bold uppercase tracking-widest">Games</span>
                <span className="text-[13vh] font-black leading-none text-slate-100">{t.data.games}</span>
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Ultra Slim Footer (8% Height) */}
      <footer className="h-[8%] flex items-center justify-between px-6 border-t border-slate-800/50">
        <button onClick={undo} className="text-xs font-black text-slate-500 hover:text-white uppercase">Undo</button>
        <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{isTiebreak ? 'Tiebreak' : 'Regular'}</div>
        <div className="flex items-center gap-4">
          <button onClick={resetMatch} className="text-[10px] font-bold text-slate-800 hover:text-red-500 uppercase">Reset</button>
          <button onClick={() => setSettingsOpen(true)} className="p-1 text-slate-700 hover:text-white"><Settings size={18} /></button>
        </div>
      </footer>
    </main>
  );
}