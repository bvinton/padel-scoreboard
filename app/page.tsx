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

  // --- REFRESH CHECK ---
  // If you see a PURPLE border on the Reset button, you are on the latest code.

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
    <main className="h-screen w-full flex flex-col bg-slate-950 text-slate-50 select-none overflow-hidden p-2 gap-2 font-sans">
      
      {/* Settings (Overlay) */}
      {settingsOpen && (
        <section className="absolute top-16 left-1/2 -translate-x-1/2 w-80 z-50 bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-2xl">
          <div className="flex flex-col gap-4 text-center">
            <h4 className="text-slate-500 font-bold">MATCH SETTINGS</h4>
            <button onClick={toggleGoldenPoint} className={`py-3 rounded-xl font-bold border-2 ${useGoldenPoint ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}`}>Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
            <button onClick={toggleServer} className="bg-slate-800 py-3 rounded-xl font-bold border border-slate-600">Swap Server</button>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={() => setMatchFormat(3)} className={`py-3 rounded-xl font-bold ${matchFormat === 3 ? 'bg-indigo-600' : 'bg-slate-800'}`}>Best of 3</button>
               <button onClick={() => setMatchFormat(5)} className={`py-3 rounded-xl font-bold ${matchFormat === 5 ? 'bg-indigo-600' : 'bg-slate-800'}`}>Best of 5</button>
            </div>
            <button onClick={() => setSettingsOpen(false)} className="mt-4 text-slate-400 underline">Close</button>
          </div>
        </section>
      )}

      {/* Victory Overlay */}
      {matchWinner && !matchWinnerDismissed && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md" onClick={() => scorePoint("team1")}>
          <div className="flex flex-col items-center bg-slate-900 border-4 border-amber-400 p-12 rounded-[3rem] text-center" onClick={(e) => e.stopPropagation()}>
            <Trophy className="h-16 w-16 text-amber-400 mb-4" />
            <h2 className="text-7xl font-black mb-6 text-white italic uppercase tracking-tighter">{matchWinner === 'team1' ? 'Team 1' : 'Team 2'} Wins</h2>
            <button onClick={resetMatch} className="bg-amber-500 text-slate-950 px-12 py-4 rounded-full text-2xl font-black uppercase">Play Again</button>
          </div>
        </div>
      )}

      {/* Scoreboard Body */}
      <section className="flex-[10] flex flex-col gap-2 min-h-0">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`flex-1 rounded-[2.5rem] border-4 flex flex-col px-6 py-2 relative overflow-hidden transition-all duration-300 ${
              server === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800/40 bg-slate-900/30"
            }`}
          >
            {/* Team Label & Serving */}
            <div className="flex justify-between items-center w-full z-20">
              <span className={`text-xl font-black italic tracking-tighter ${server === t.id ? "text-emerald-400" : "text-slate-700"}`}>{t.label}</span>
              {server === t.id && <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full animate-pulse border border-emerald-400/30 uppercase tracking-widest">Serving</span>}
            </div>

            {/* Main Content Area (Side-by-Side) */}
            <div className="flex-1 flex items-center justify-between w-full gap-4 mt-[-10px]">
              
              {/* SETS (Left) */}
              <div className="flex flex-col items-center justify-center bg-slate-950/60 w-1/4 h-[85%] rounded-[2rem] border-2 border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Sets</span>
                <span className="text-[7vh] md:text-[9vh] font-black text-slate-100 leading-none">{t.data.sets}</span>
              </div>

              {/* POINTS (Center) */}
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[35vh] font-black text-white leading-none italic drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] scale-x-125">
                  {formatPoints(t.data.points)}
                </span>
              </div>

              {/* GAMES (Right) */}
              <div className="flex flex-col items-center justify-center bg-slate-950/60 w-1/4 h-[85%] rounded-[2rem] border-2 border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Games</span>
                <span className="text-[7vh] md:text-[9vh] font-black text-slate-100 leading-none">{t.data.games}</span>
              </div>

            </div>
          </button>
        ))}
      </section>

      {/* Footer */}
      <footer className="flex-[1] flex items-center justify-between px-6 border-t border-slate-800/30">
        <button onClick={undo} className="bg-slate-900 border border-slate-700 px-5 py-2 rounded-xl text-xs font-black text-slate-300 active:scale-95 flex items-center gap-2">
          <Undo2 size={16} /> UNDO
        </button>
        
        <div className="px-4 py-1 rounded-full border border-slate-800 text-[10px] font-black uppercase text-slate-500">
            {isTiebreak ? 'Tiebreak Mode' : 'Regular Game'}
        </div>

        <div className="flex items-center gap-4">
          {/* PURPLE BORDER HERE TO VERIFY CODE UPDATE */}
          <button onClick={resetMatch} className="text-[10px] font-bold text-slate-700 border-2 border-purple-500/50 px-3 py-1 rounded-lg uppercase hover:text-red-400">Reset</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-500 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      </footer>
    </main>
  );
}