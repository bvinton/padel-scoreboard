"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { Undo2, Settings, Trophy, RotateCcw, Maximize, MessageSquareText, Smartphone, Save, History, Trash2, Volume2, VolumeX } from "lucide-react";

interface SavedMatch {
  id: number;
  date: string;
  team1Name: string;
  team2Name: string;
  scores: string; 
}

export default function HomePage() {
  const {
    team1, team2, server, isTiebreak, useGoldenPoint, matchFormat,
    matchWinner, matchWinnerDismissed, setScores, scorePoint, undo,
    toggleGoldenPoint, toggleServer, setMatchFormat, resetMatch,
  } = useMatchStore();

  const [lastProcessedId, setLastProcessedId] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  const [umpireEnabled, setUmpireEnabled] = useState(false);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);

  const [team1Name, setTeam1Name] = useState("TEAM 1");
  const [team2Name, setTeam2Name] = useState("TEAM 2");

  const [historyLog, setHistoryLog] = useState<{id: number, time: string, msg: string}[]>([]);
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);

  // --- 1. CORE UTILITIES ---
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistoryLog(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 30));
  };

  const speakScore = (text: string) => {
    if (!umpireEnabled || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("low")) && 
      (v.lang.includes("en-GB") || v.lang.includes("en-US"))
    );
    if (maleVoice) utterance.voice = maleVoice;
    utterance.rate = 1.05;
    utterance.pitch = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // --- 2. HANDLERS ---
  const handleScore = (team: 'team1' | 'team2') => {
    if (matchWinner && !localDismissed) {
      setLocalDismissed(true);
      return;
    }
    addLog(`${team === 'team1' ? team1Name : team2Name} scored`);
    setTimerStarted(true);
    setTimeLeft(20);
    scorePoint(team);
  };

  const handleUndo = () => {
    addLog("Undo used");
    undo();
    setTimerStarted(false);
    setTimeLeft(0);
    setLocalDismissed(false);
    prevGames1.current = team1.games; prevGames2.current = team2.games;
    prevSets1.current = team1.sets; prevSets2.current = team2.sets;
    prevIsTiebreak.current = isTiebreak;
  };

  const handleReset = () => {
    addLog("Match Reset");
    setHistoryLog([]); 
    setLocalDismissed(false); 
    setTimerStarted(false);
    setTimeLeft(0);
    prevGames1.current = 0; prevGames2.current = 0;
    prevSets1.current = 0; prevSets2.current = 0;
    prevIsTiebreak.current = false;
    resetMatch();
  };

  const handleSaveMatch = () => {
    let scoreString = setScores.map(set => `${set.team1}-${set.team2}`).join(', ');
    if (team1.games > 0 || team2.games > 0) {
      const currentScore = `${team1.games}-${team2.games}`;
      scoreString = scoreString ? `${scoreString}, ${currentScore}` : currentScore;
    }
    const newMatch: SavedMatch = {
      id: Date.now(),
      date: new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      team1Name, team2Name, scores: scoreString || "0-0"
    };
    const updated = [newMatch, ...savedMatches];
    setSavedMatches(updated);
    localStorage.setItem('padelArchive', JSON.stringify(updated));
    addLog("Match Saved");
  };

  const deleteSavedMatch = (id: number) => {
    const updated = savedMatches.filter(m => m.id !== id);
    setSavedMatches(updated);
    localStorage.setItem('padelArchive', JSON.stringify(updated));
  };

  const clearArchive = () => {
    if (window.confirm("Clear all match history?")) {
      setSavedMatches([]); localStorage.removeItem('padelArchive');
    }
  };

  // --- 3. EFFECTS ---
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const prevGames1 = useRef(team1.games);
  const prevGames2 = useRef(team2.games);
  const prevSets1 = useRef(team1.sets);
  const prevSets2 = useRef(team2.sets);
  const prevIsTiebreak = useRef(isTiebreak);

  useEffect(() => {
    if (!umpireEnabled) return;
    if (isTiebreak && !prevIsTiebreak.current) {
        speakScore("Six games all. Tiebreak.");
        prevIsTiebreak.current = true;
        return;
    }
    prevIsTiebreak.current = isTiebreak;
    if (matchWinner && !matchWinnerDismissed && !localDismissed) {
      speakScore(`Game, Set and Match. ${matchWinner === 'team1' ? team1Name : team2Name}`);
      return;
    }
    if (team1.sets > prevSets1.current) {
        speakScore(`Game and Set, ${team1Name}`);
        prevSets1.current = team1.sets;
        prevGames1.current = 0; prevGames2.current = 0;
        return;
    }
    if (team2.sets > prevSets2.current) {
        speakScore(`Game and Set, ${team2Name}`);
        prevSets2.current = team2.sets;
        prevGames1.current = 0; prevGames2.current = 0;
        return;
    }
    if (team1.games > prevGames1.current) {
        speakScore(`Game, ${team1Name}`);
        prevGames1.current = team1.games;
        return;
    }
    if (team2.games > prevGames2.current) {
        speakScore(`Game, ${team2Name}`);
        prevGames2.current = team2.games;
        return;
    }
    const p1 = team1.points; const p2 = team2.points;
    if (p1 === '0' && p2 === '0') return;
    if (p1 === 'Ad' || p2 === 'Ad') speakScore("Advantage");
    else if (p1 === '40' && p2 === '40') speakScore("Deuce");
    else if (isTiebreak) speakScore(`${p1}, ${p2}`);
    else {
      const p1Text = p1 === '0' ? "Love" : p1;
      const p2Text = p2 === '0' ? "Love" : p2;
      if (p1 === p2) speakScore(`${p1Text} All`);
      else speakScore(`${p1Text}, ${p2Text}`);
    }
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, isTiebreak, matchWinner, localDismissed, team1Name, team2Name, matchWinnerDismissed, umpireEnabled]);

  useEffect(() => {
    const saved = localStorage.getItem('padelArchive');
    if (saved) { try { setSavedMatches(JSON.parse(saved)); } catch (e) {} }
  }, []);

  // --- AGGRESSIVE WAKE LOCK ---
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen');
      } catch (err) {}
    };
    requestWakeLock();
    const handleVisibilityChange = () => { if (wakeLock !== null && document.visibilityState === 'visible') requestWakeLock(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const lockInterval = setInterval(requestWakeLock, 30000);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(lockInterval);
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, []);

  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { winSoundRef.current = new Audio("https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3"); }, []);
  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && !localDismissed && winSoundRef.current) { winSoundRef.current.play().catch(() => {}); }
  }, [matchWinner, matchWinnerDismissed, localDismissed]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

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
  }, [lastProcessedId, team1Name, team2Name, matchWinner, localDismissed]);

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;

  const getTimerStrokeColor = () => {
    if (timeLeft > 10) return "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]";
    if (timeLeft > 5) return "text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]";
    return "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse";
  };

  return (
    <main className="fixed inset-0 flex flex-col bg-black text-white select-none overflow-hidden font-sans">
      
      <div className="hidden portrait:flex fixed inset-0 z-[200] bg-black items-center justify-center flex-col gap-8 p-10 text-center">
        <Smartphone size={80} className="text-emerald-500 animate-pulse" />
        <h2 className="text-4xl font-black uppercase tracking-widest text-white italic">Rotate Device</h2>
      </div>

      {matchWinner && !matchWinnerDismissed && !localDismissed && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setLocalDismissed(true)}>
          <div className="relative flex flex-col items-center bg-slate-900 border-4 md:border-8 border-amber-400 p-8 md:p-16 rounded-3xl md:rounded-[4rem] text-center shadow-[0_0_100px_rgba(251,191,36,0.4)]" onClick={e => e.stopPropagation()}>
            <span className="absolute -top-8 -left-8 text-6xl animate-bounce">🎇</span>
            <span className="absolute -top-8 -right-8 text-6xl animate-bounce delay-150">🎆</span>
             <Trophy className="w-16 h-16 md:w-24 md:h-24 text-amber-400 mb-4 md:mb-8 animate-pulse" />
            <h2 className="text-5xl md:text-8xl font-black mb-2 md:mb-4 italic uppercase tracking-tighter">
              {matchWinner === 'team1' ? team1Name : team2Name}
            </h2>
            <button onClick={handleReset} className="bg-amber-500 text-black px-10 md:px-20 py-4 md:py-8 rounded-full text-2xl md:text-4xl font-black uppercase active:scale-95 transition-transform flex items-center gap-4">
              <RotateCcw size={40} /> Play Again
            </button>
            <p className="mt-4 text-slate-500 text-xs uppercase tracking-widest font-bold">Tap background to dismiss</p>
          </div>
        </div>
      )}

      {/* SCOREBOARD SECTION WITH NEW SVG ARENA SHOT CLOCK */}
      <section className="flex-grow flex flex-col p-1 relative overflow-hidden">
        
        {/* THE SHOT CLOCK LASER TRACER */}
        {timerStarted && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-lg md:rounded-[1.5rem]" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* RIGHT HALF (Starts top-middle 50,0 -> goes to 100,0 -> down to 100,100 -> back to 50,100) */}
            <path
              d="M 50 0 L 100 0 L 100 100 L 50 100"
              fill="none"
              stroke="currentColor"
              className={`transition-all duration-100 ease-linear ${getTimerStrokeColor()}`}
              strokeWidth="10"
              vectorEffect="non-scaling-stroke"
              pathLength="100"
              strokeDasharray="100"
              style={{ strokeDashoffset: (timeLeft / 20) * 100 }}
            />
            {/* LEFT HALF (Starts top-middle 50,0 -> goes to 0,0 -> down to 0,100 -> back to 50,100) */}
            <path
              d="M 50 0 L 0 0 L 0 100 L 50 100"
              fill="none"
              stroke="currentColor"
              className={`transition-all duration-100 ease-linear ${getTimerStrokeColor()}`}
              strokeWidth="10"
              vectorEffect="non-scaling-stroke"
              pathLength="100"
              strokeDasharray="100"
              style={{ strokeDashoffset: (timeLeft / 20) * 100 }}
            />
          </svg>
        )}

        {[ { id: "team1", data: team1, label: team1Name }, { id: "team2", data: team2, label: team2Name } ].map((t) => (
          <button 
            key={t.id} 
            onClick={() => handleScore(t.id as any)} 
            className={`flex-1 min-h-0 border-b flex flex-row items-center relative transition-all ${
              server === t.id 
                ? "border-emerald-500/50 bg-emerald-500/20 shadow-[inset_0_0_40px_rgba(16,185,129,0.25)] z-10" 
                : "border-slate-800 bg-slate-900/20"
            }`}
          >
            
            <div className="absolute top-1 md:top-3 left-3 md:left-8 z-20">
              <span className={`text-[10px] md:text-2xl font-black italic uppercase transition-all duration-300 ${
                server === t.id 
                  ? "text-emerald-400 opacity-100 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
                  : "text-slate-400 opacity-60"
              }`}>
                {t.label}
              </span>
            </div>

            {server === t.id && (
              <div className="absolute top-1 md:top-3 right-3 md:right-8 z-20">
                <span className="bg-emerald-500 text-black px-2 md:px-5 py-0.5 rounded-full font-black text-[8px] md:text-sm animate-pulse uppercase">SERVING</span>
              </div>
            )}
            
            <div className="w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-r border-slate-800/30 bg-black/40">
              <span className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-widest italic">Sets</span>
              <span className="text-[20vh] md:text-[23vh] font-black leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{t.data.sets}</span>
            </div>
            
            <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
              <span className="text-[32vh] md:text-[45vh] font-black leading-none italic scale-x-[1.4] md:scale-x-[1.6] transform-gpu [text-shadow:_0_0_40px_rgb(255_255_255_/_30%),_0_0_10px_rgb(255_255_255_/_60%)]">
                {formatPoints(t.data.points)}
              </span>
            </div>
            
            <div className="w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-l border-slate-800/30 bg-black/40">
              <span className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-widest italic">Games</span>
              <span className="text-[20vh] md:text-[23vh] font-black leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{t.data.games}</span>
            </div>
            
          </button>
        ))}
      </section>

      <footer className="flex-none h-[40px] flex items-center justify-between px-2 md:px-10 border-t border-slate-900 bg-slate-950/95 z-50">
        <div className="flex items-center gap-1 md:gap-4 h-full">
          <button onClick={handleUndo} className="flex items-center gap-1 bg-slate-900/50 px-2 md:px-4 py-0.5 rounded h-[30px] active:scale-95 transition-all">
            <Undo2 className="w-3.5 h-3.5 md:w-5 md:h-5 text-slate-500" />
            <span className="text-[10px] md:text-lg font-black text-slate-500 uppercase hidden md:inline">Undo</span>
          </button>
          <button onClick={handleSaveMatch} className="flex items-center gap-1 bg-indigo-900/40 px-2 md:px-4 py-0.5 rounded h-[30px] active:scale-95 transition-all">
            <Save className="w-3.5 h-3.5 md:w-5 md:h-5 text-indigo-400" />
            <span className="text-[10px] md:text-lg font-black text-indigo-400 uppercase hidden md:inline">Save</span>
          </button>
        </div>
        
        <div className={`px-3 py-0.5 rounded-full border-slate-800 font-black uppercase text-[8px] md:text-sm ${
          isTiebreak ? 'text-amber-400 animate-pulse' : 'text-slate-600'
        }`}>
          {isTiebreak ? 'TIEBREAK' : 'MATCH'}
        </div>

        <div className="flex items-center gap-1 md:gap-3 h-full">
          <button onClick={handleReset} className="text-[10px] md:text-lg font-black text-red-900/80 uppercase mr-1 md:mr-4">Reset</button>
          <button onClick={() => setArchiveOpen(true)} className="p-1 text-indigo-400 active:scale-95"><History size={20} /></button>
          <button onClick={() => setHistoryOpen(true)} className="p-1 text-slate-600 active:scale-95"><MessageSquareText size={20} /></button>
          <button onClick={() => setSettingsOpen(true)} className="p-1 text-slate-600 active:scale-95"><Settings size={20} /></button>
        </div>
      </footer>

      {/* MODALS */}
      {archiveOpen && (
        <div className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-2" onClick={() => setArchiveOpen(false)}>
          <div className="bg-slate-900 border-2 border-slate-700 p-4 rounded-2xl w-full max-w-3xl flex flex-col gap-3 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black uppercase text-center text-slate-500 border-b border-slate-800 pb-2 italic">Saved Matches</h2>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {savedMatches.length === 0 ? (
                <div className="text-center text-slate-600 font-bold py-10 text-xl uppercase italic">No matches saved yet</div>
              ) : (
                savedMatches.map(match => (
                  <div key={match.id} className="bg-slate-800 p-3 rounded-xl flex items-center justify-between border-l-4 border-indigo-500">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-xs font-bold uppercase">{match.date}</span>
                      <span className="text-white font-black text-lg uppercase italic">{match.team1Name} vs {match.team2Name}</span>
                      <span className="text-emerald-400 font-mono font-bold text-xl tracking-widest">{match.scores}</span>
                    </div>
                    <button onClick={() => deleteSavedMatch(match.id)} className="p-2 text-red-500"><Trash2 size={24} /></button>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <button onClick={clearArchive} className="text-red-900/50 text-xs uppercase">Clear All</button>
              <button onClick={() => setArchiveOpen(false)} className="py-2 px-8 bg-white text-black font-black rounded-xl uppercase">Close</button>
            </div>
          </div>
        </div>
      )}

      {historyOpen && (
        <div className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-2" onClick={() => setHistoryOpen(false)}>
          <div className="bg-slate-900 border-2 border-slate-700 p-4 rounded-2xl w-full max-w-2xl flex flex-col gap-3 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-black uppercase text-center text-slate-500 border-b border-slate-800 pb-2 italic">Match Log</h2>
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {historyLog.map(log => (
                <div key={log.id} className="bg-slate-800 p-3 rounded-xl flex justify-between items-center border-l-4 border-emerald-500">
                  <span className="text-white font-bold text-sm uppercase">{log.msg}</span>
                  <span className="text-slate-400 text-xs font-mono bg-black/30 px-2 py-1 rounded-lg">{log.time}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setHistoryOpen(false)} className="py-3 bg-white text-black font-black rounded-xl uppercase">Close</button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-2" onClick={() => setSettingsOpen(false)}>
          <div className="bg-slate-900 border-2 border-slate-700 p-4 rounded-2xl w-full max-w-xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h2 className="text-xl font-black uppercase text-center text-slate-500 italic">Settings</h2>
             <div className="grid grid-cols-2 gap-2">
               <input value={team1Name} onChange={e => setTeam1Name(e.target.value)} placeholder="TEAM 1" className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-black uppercase text-center outline-none" maxLength={15} />
               <input value={team2Name} onChange={e => setTeam2Name(e.target.value)} placeholder="TEAM 2" className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-black uppercase text-center outline-none" maxLength={15} />
             </div>
             <button onClick={() => setUmpireEnabled(!umpireEnabled)} className={`py-4 rounded-xl border-2 text-lg font-black uppercase flex items-center justify-center gap-4 ${umpireEnabled ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
               <Volume2 size={24} /> Umpire: {umpireEnabled ? 'ON' : 'OFF'}
             </button>
             <button onClick={toggleFullscreen} className="py-3 rounded-xl bg-slate-800 border border-slate-600 text-lg font-black uppercase flex items-center justify-center gap-4 transition-all active:scale-95">
               <Maximize size={24} /> Fullscreen
             </button>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMatchFormat(3)} className={`py-3 rounded-xl border text-lg font-black uppercase ${matchFormat === 3 ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Best of 3</button>
                <button onClick={() => setMatchFormat(5)} className={`py-3 rounded-xl border text-lg font-black uppercase ${matchFormat === 5 ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Best of 5</button>
             </div>
             <button onClick={toggleGoldenPoint} className={`py-3 rounded-xl border text-lg font-black uppercase ${useGoldenPoint ? 'bg-emerald-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
             <button onClick={toggleServer} className="py-3 bg-slate-800 border border-slate-600 rounded-xl text-lg font-black uppercase transition-all active:scale-95">Swap Server</button>
             <button onClick={() => setSettingsOpen(false)} className="py-3 bg-white text-black font-black rounded-xl uppercase mt-2 transition-all active:scale-95">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}