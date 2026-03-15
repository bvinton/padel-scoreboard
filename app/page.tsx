"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
// Added 'Smartphone' to the imports for the rotate icon
import { Undo2, Settings, CircleDot, Trophy, RotateCcw, Maximize, List, Smartphone } from "lucide-react";

export default function HomePage() {
  const {
    team1, team2, server, isTiebreak, useGoldenPoint, matchFormat,
    matchWinner, matchWinnerDismissed, scorePoint, undo,
    toggleGoldenPoint, toggleServer, setMatchFormat, resetMatch,
  } = useMatchStore();

  const [lastProcessedId, setLastProcessedId] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // --- CUSTOM TEAM NAMES ---
  const [team1Name, setTeam1Name] = useState("TEAM 1");
  const [team2Name, setTeam2Name] = useState("TEAM 2");

  // --- HISTORY LOG ---
  const [historyLog, setHistoryLog] = useState<{id: number, time: string, msg: string}[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistoryLog(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 30));
  };

  const handleScore = (team: 'team1' | 'team2') => {
    addLog(`${team === 'team1' ? team1Name : team2Name} scored`);
    scorePoint(team);
  };

  const handleUndo = () => {
    addLog("Undo button used");
    undo();
  };

  const handleReset = () => {
    addLog("Match Reset");
    setHistoryLog([]);
    resetMatch();
  };

  // --- WAKE LOCK (PREVENT SCREEN SLEEP) ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.log("Wake Lock blocked by browser or not supported.");
      }
    };
    
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') requestWakeLock();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  // --- SOUND EFFECT LOGIC ---
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    winSoundRef.current = new Audio("https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3");
  }, []);

  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && winSoundRef.current) {
      winSoundRef.current.play().catch(e => console.log("Audio play blocked."));
    }
  }, [matchWinner, matchWinnerDismissed]);

  // --- FULLSCREEN LOGIC ---
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.error(e));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  // --- FLIC POLL LOGIC ---
  useEffect(() => {
    const pollFlic = async () => {
      try {
        const res = await fetch('/api/flic');
        const data = await res.json();
        if (data.id > lastProcessedId) {
          setLastProcessedId(data.id);
          if (data.type === 'team1') handleScore('team1');
          if (data.type === 'team2') handleScore('team2');
          if (data.type === 'undo') handleUndo();
        }
      } catch (e) {}
    };
    const interval = setInterval(pollFlic, 500);
    return () => clearInterval(interval);
  }, [lastProcessedId, team1Name, team2Name]);

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;

  return (
    <main className="h-screen w-full flex flex-col bg-black text-white select-none overflow-hidden p-1 font-sans">
      
      {/* --- NEW: PORTRAIT MODE WARNING OVERLAY --- */}
      {/* This ONLY shows when the device is held vertically, completely covering the screen */}
      <div className="hidden portrait:flex fixed inset-0 z-[200] bg-black items-center justify-center flex-col gap-8 p-10 text-center">
        <div className="relative flex items-center justify-center w-32 h-32">
          <Smartphone size={80} className="text-emerald-500 animate-pulse absolute" />
          <RotateCcw size={40} className="text-white absolute -bottom-2 -right-2 bg-black rounded-full p-1" />
        </div>
        <h2 className="text-5xl font-black uppercase tracking-widest text-white italic mt-4">Rotate Device</h2>
        <p className="text-2xl text-slate-400 font-bold uppercase tracking-wide">Please turn your phone sideways to use the scoreboard.</p>
      </div>

      {/* --- VICTORY OVERLAY --- */}
      {matchWinner && !matchWinnerDismissed && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={handleReset}>
          <div className="relative flex flex-col items-center bg-slate-900 border-8 border-amber-400 p-16 rounded-[4rem] text-center shadow-[0_0_100px_rgba(251,191,36,0.4)]" onClick={e => e.stopPropagation()}>
            <span className="absolute -top-16 -left-16 text-8xl animate-bounce">🎇</span>
            <span className="absolute -top-16 -right-16 text-8xl animate-bounce delay-150">🎆</span>
            <span className="absolute -bottom-16 -left-16 text-8xl animate-pulse">🎊</span>
            <span className="absolute -bottom-16 -right-16 text-8xl animate-pulse delay-300">🎉</span>
            <Trophy className="h-24 w-24 text-amber-400 mb-8 animate-pulse" />
            <h2 className="text-8xl font-black mb-4 text-white italic uppercase tracking-tighter">
              {matchWinner === 'team1' ? team1Name : team2Name}
            </h2>
            <h3 className="text-4xl font-black text-amber-400 uppercase italic mb-12 tracking-[0.2em]">Victory Fanfare</h3>
            <button onClick={handleReset} className="bg-amber-500 text-black px-20 py-8 rounded-full text-4xl font-black uppercase shadow-2xl active:scale-95 transition-transform flex items-center gap-4">
              <RotateCcw size={40} /> Play Again
            </button>
          </div>
        </div>
      )}

      {/* --- HISTORY LOG OVERLAY --- */}
      {historyOpen && (
        <div className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={() => setHistoryOpen(false)}>
          <div className="bg-slate-900 border-4 border-slate-700 p-10 rounded-[3rem] w-full max-w-2xl flex flex-col gap-6 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h2 className="text-3xl font-black uppercase text-center text-slate-500 tracking-widest border-b-2 border-slate-800 pb-4">Match Log</h2>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
              {historyLog.length === 0 ? (
                <div className="text-center text-slate-600 font-bold py-10 text-2xl uppercase italic">No points scored yet</div>
              ) : (
                historyLog.map(log => (
                  <div key={log.id} className="bg-slate-800 p-5 rounded-2xl flex justify-between items-center border-l-4 border-emerald-500 shadow-md">
                    <span className="text-white font-bold text-xl uppercase tracking-wider">{log.msg}</span>
                    <span className="text-slate-400 text-lg font-mono bg-black/30 px-3 py-1 rounded-lg">{log.time}</span>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setHistoryOpen(false)} className="py-6 bg-white text-black text-3xl font-black rounded-3xl uppercase mt-4 active:scale-95 transition-transform">Close Log</button>
          </div>
        </div>
      )}

      {/* --- SETTINGS OVERLAY --- */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
          <div className="bg-slate-900 border-4 border-slate-700 p-8 rounded-[3rem] w-full max-w-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h2 className="text-2xl font-black uppercase text-center text-slate-500 tracking-widest">Match Settings</h2>
             
             <div className="grid grid-cols-2 gap-4">
               <input value={team1Name} onChange={e => setTeam1Name(e.target.value)} placeholder="TEAM 1" className="bg-slate-800 border-4 border-slate-700 rounded-3xl p-5 text-white text-2xl font-black uppercase text-center focus:border-indigo-500 outline-none transition-colors" maxLength={15} />
               <input value={team2Name} onChange={e => setTeam2Name(e.target.value)} placeholder="TEAM 2" className="bg-slate-800 border-4 border-slate-700 rounded-3xl p-5 text-white text-2xl font-black uppercase text-center focus:border-indigo-500 outline-none transition-colors" maxLength={15} />
             </div>

             <button onClick={toggleFullscreen} className="py-5 rounded-3xl bg-indigo-600 border-4 border-white text-2xl font-black uppercase flex items-center justify-center gap-4 transition-transform active:scale-95">
               <Maximize size={28} /> {document.fullscreenElement ? 'Exit Fullscreen' : 'Enable Fullscreen'}
             </button>
             
             <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMatchFormat(3)} className={`py-5 rounded-3xl border-4 text-2xl font-black uppercase transition-all ${matchFormat === 3 ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Best of 3</button>
                <button onClick={() => setMatchFormat(5)} className={`py-5 rounded-3xl border-4 text-2xl font-black uppercase transition-all ${matchFormat === 5 ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Best of 5</button>
             </div>

             <button onClick={toggleGoldenPoint} className={`py-5 rounded-3xl border-4 text-2xl font-black uppercase tracking-tighter transition-all ${useGoldenPoint ? 'bg-emerald-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
             <button onClick={toggleServer} className="py-5 rounded-3xl bg-slate-800 border-4 border-slate-600 text-2xl font-black uppercase tracking-tighter">Swap Server</button>
             <button onClick={() => setSettingsOpen(false)} className="py-5 bg-white text-black text-2xl font-black rounded-3xl uppercase mt-2">Close Settings</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <section className="h-[92%] flex flex-col gap-1">
        {[ { id: "team1", data: team1, label: team1Name }, { id: "team2", data: team2, label: team2Name } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => handleScore(t.id as any)} 
            className={`flex-1 rounded-[1.5rem] border-[6px] flex flex-row items-center relative transition-all ${
              server === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900/20"
            }`}
          >
            <div className="absolute top-2 left-6 z-20">
              <span className="text-2xl font-black italic opacity-30 uppercase tracking-tighter">{t.label}</span>
            </div>

            {server === t.id && (
              <div className="absolute top-2 right-6 z-20">
                <span className="bg-emerald-500 text-black px-4 py-1 rounded-full font-black text-sm animate-pulse uppercase">SERVING</span>
              </div>
            )}

            <div className="w-[22%] h-full flex flex-col items-center justify-center border-r-2 border-slate-800/50 bg-black/40">
              <span className="text-xl font-black text-slate-600 uppercase tracking-widest">Sets</span>
              <span className="text-[23vh] font-black leading-none">{t.data.sets}</span>
            </div>

            <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
              <span className="text-[40vh] font-black leading-none italic scale-x-[1.6] transform-gpu drop-shadow-[0_20px_40px_rgba(0,0,0,1)]">
                {formatPoints(t.data.points)}
              </span>
            </div>

            <div className="w-[22%] h-full flex flex-col items-center justify-center border-l-2 border-slate-800/50 bg-black/40">
              <span className="text-xl font-black text-slate-600 uppercase tracking-widest">Games</span>
              <span className="text-[23vh] font-black leading-none">{t.data.games}</span>
            </div>
          </button>
        ))}
      </section>

      {/* Footer */}
      <footer className="h-[8%] flex items-center justify-between px-10 border-t border-slate-900 bg-slate-950/50">
        <button onClick={handleUndo} className="group flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-6 py-2 rounded-2xl active:scale-95 transition-all">
          <Undo2 size={24} className="text-slate-500 group-hover:text-white transition-colors" />
          <span className="text-xl font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Undo</span>
        </button>
        
        <div className={`px-8 py-2 rounded-full border-2 font-black uppercase tracking-[0.4em] text-sm transition-all duration-500 ${
          isTiebreak 
          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse' 
          : 'bg-slate-900/40 border-slate-800 text-slate-600'
        }`}>
          {isTiebreak ? 'TIEBREAK MODE' : 'REGULAR GAME'}
        </div>

        <div className="flex items-center gap-6">
          <button onClick={handleReset} className="text-xl font-black text-red-900/80 hover:text-red-500 uppercase tracking-widest transition-colors mr-4">Reset</button>
          
          <button onClick={() => setHistoryOpen(true)} className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-600 hover:text-white transition-all active:scale-95">
            <List size={28} />
          </button>

          <button onClick={() => setSettingsOpen(true)} className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-600 hover:text-white transition-all active:scale-95">
            <Settings size={28} />
          </button>
        </div>
      </footer>
    </main>
  );
}