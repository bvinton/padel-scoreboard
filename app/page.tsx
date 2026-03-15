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
      
      {/* Settings Overlay */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-[3rem] w-full max-w-md flex flex-col gap-4">
             <button onClick={toggleGoldenPoint} className="py-4 rounded-2xl bg-slate-800 border-2 border-emerald-500 text-emerald-400 font-bold">Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
             <button onClick={toggleServer} className="py-4 rounded-2xl bg-slate-800 border border-slate-600 font-bold">Swap Server</button>
             <button onClick={() => setSettingsOpen(false)} className="py-4 text-slate-500 font-bold underline">Close</button>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {matchWinner && !matchWinnerDismissed && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md" onClick={() => scorePoint("team1")}>
          <div className="flex flex-col items-center bg-slate-900 border-4 border-amber-400 p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(251,191,36,0.3)]" onClick={(e) => e.stopPropagation()}>
            <Trophy className="h-20 w-20 text-amber-400 mb-6" />
            <h2 className="text-7xl font-black mb-6 text-white italic uppercase tracking-tighter">{matchWinner === 'team1' ? 'Team 1' : 'Team 2'} Wins</h2>
            <button onClick={resetMatch} className="bg-amber-500 text-slate-950 px-16 py-6 rounded-full text-3xl font-black uppercase">Play Again</button>
          </div>
        </div>
      )}

      {/* Teams Section */}
      <section className="flex-[15] flex flex-col gap-1 min-h-0">
        {[ { id: "team1", data: team1, label: "TEAM 1" }, { id: "team2", data: team2, label: "TEAM 2" } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => scorePoint(t.id as any)} 
            className={`flex-1 rounded-[2rem] border-4 flex flex-col px-6 py-2 relative overflow-hidden transition-all duration-300 ${
              server === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800/40 bg-slate-900/30"
            }`}
          >
            {/* Header: Label + Server */}
            <div className="flex justify-between items-center w-full h-[15%]">
              <span className={`text-xl font-black italic tracking-tighter ${server === t.id ? "text-emerald-400" : "text-slate-700"}`}>{t.label}</span>
              {server === t.id && <span className="text-[10px] font-black text-emerald-400 border border-emerald-400/50 px-4 py-1 rounded-full animate-pulse uppercase tracking-widest">Serving</span>}
            </div>

            {/* Main Score: Limited to 35% of screen height */}
            <div className="flex-1 flex items-center justify-center pointer-events-none">
              <span className="text-[35vh] font-black text-white leading-none italic drop-shadow-2xl translate-y-[-2vh]">
                {formatPoints(t.data.points)}
              </span>
            </div>

            {/* Bottom Row: Sets & Games (Limited to 25% of screen height) */}
            <div className="flex items-center justify-between w-full h-[30%] gap-4">
              <div className="flex flex-col items-center justify-center bg-slate-950/80 px-10 h-full rounded-[2rem] border border-slate-800/80 min-w-[200px]">
                <span className="text-[1.5vh] text-slate-600 font-bold tracking-widest uppercase">Sets</span>
                <span className="text-[15vh] font-black text-slate-100 leading-none">{t.data.sets}</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-950/80 px-10 h-full rounded-[2rem] border border-slate-800/80 min-w-[200px]">
                <span className="text-[1.5vh] text-slate-600 font-bold tracking-widest uppercase">Games</span>
                <span className="text-[15vh] font-black text-slate-100 leading-none">{t.data.games}</span>
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Footer */}
      <footer className="flex-[1] flex items-center justify-between px-6 border-t border-slate-800/30">
        <button onClick={undo} className="text-xs font-black text-slate-600 flex items-center gap-1 uppercase hover:text-white">
          <Undo2 size={14} /> Undo
        </button>
        <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
            {isTiebreak ? 'Tiebreak' : 'Regular'}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={resetMatch} className="text-[10px] font-bold text-slate-800 uppercase hover:text-red-500">Reset</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="p-1 text-slate-700 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </footer>
    </main>
  );
}