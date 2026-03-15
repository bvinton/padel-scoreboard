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
  const [timeLeft, setTimeLeft] = useState(0);

  const [team1Name, setTeam1Name] = useState("TEAM 1");
  const [team2Name, setTeam2Name] = useState("TEAM 2");

  const [historyLog, setHistoryLog] = useState<{id: number, time: string, msg: string}[]>([]);
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 0.1));
    }, 100);
    return () => clearInterval(interval);
  }, [timeLeft]);

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
    if (matchWinner && !matchWinnerDismissed) {
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
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, isTiebreak, matchWinner]);

  useEffect(() => {
    const saved = localStorage.getItem('padelArchive');
    if (saved) { try { setSavedMatches(JSON.parse(saved)); } catch (e) {} }
  }, []);

  const handleScore = (team: 'team1' | 'team2') => {
    addLog(`${team === 'team1' ? team1Name : team2Name} scored`);
    setTimeLeft(20);
    scorePoint(team);
  };

  const handleUndo = () => {
    undo();
    setTimeLeft(0);
    prevGames1.current = team1.games; prevGames2.current = team2.games;
    prevSets1.current = team1.sets; prevSets2.current = team2.sets;
    prevIsTiebreak.current = isTiebreak;
  };

  const handleReset = () => {
    setHistoryLog([]); setLocalDismissed(false); setTimeLeft(0);
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

  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator) wakeLock = await (navigator as any).wakeLock.request('screen'); } catch (err) {}
    };
    requestWakeLock();
  }, []);

  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { winSoundRef.current = new Audio("https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3"); }, []);
  useEffect(() => {
    if (matchWinner && !matchWinnerDismissed && winSoundRef.current) { winSoundRef.current.play().catch(() => {}); }
  }, [matchWinner, matchWinnerDismissed]);

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
  }, [lastProcessedId, team1Name, team2Name]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistoryLog(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 30));
  };

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;

  const getTimerColor = () => {
    if (timeLeft > 10) return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]";
    if (timeLeft > 5) return "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]";
    return "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]";
  };

  return (
    <main className="h-screen w-full flex flex-col bg-black text-white select-none overflow-hidden font-sans">
      
      {/* SERVE TIMER (6px FIXED) */}
      <div className="h-[6px] w-full bg-black relative">
        {timeLeft > 0 && (
          <div className="absolute top-0 left-0 h-full z-[250] transition-all duration-100 ease-linear"
               style={{ width: `${(timeLeft / 20) * 100}%` }}>
            <div className={`h-full w-full ${getTimerColor()}`} />
          </div>
        )}
      </div>

      {/* PORTRAIT OVERLAY */}
      <div className="hidden portrait:flex fixed inset-0 z-[200] bg-black items-center justify-center flex-col gap-8 p-10 text-center">
        <Smartphone size={80} className="text-emerald-500 animate-pulse" />
        <h2 className="text-4xl font-black uppercase tracking-widest text-white italic">Rotate Device</h2>
      </div>

      {/* SCOREBOARD SECTION (CALCULATED HEIGHT TO NEVER OVERLAP) */}
      <section style={{ height: 'calc(100vh - 66px)' }} className="flex flex-col gap-1 p-1">
        {[ { id: "team1", data: team1, label: team1Name }, { id: "team2", data: team2, label: team2Name } ].map((t) => (
          <button key={t.id} onClick={() => handleScore(t.id as any)} className={`flex-1 rounded-xl md:rounded-[2rem] border-[3px] md:border-[6px] flex flex-row items-center relative transition-all ${server === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900/20"}`}>
            
            <div className="absolute top-1 md:top-3 left-3 md:left-8 z-20">
              <span className="text-[10px] md:text-2xl font-black italic text-slate-400 opacity-60 uppercase">{t.label}</span>
            </div>
            {server === t.id && (
              <div className="absolute top-1 md:top-3 right-3 md:right-8 z-20">
                <span className="bg-emerald-500 text-black px-2 md:px-5 py-0.5 md:py-1.5 rounded-full font-black text-[8px] md:text-sm animate-pulse uppercase">SERVING</span>
              </div>
            )}
            
            <div className="w-[25%] md:w-[22%] h-full flex flex-col items-center justify-center border-r-2 border-slate-800/50 bg-black/40">
              <span className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-widest italic">Sets</span>
              <span className="text-[18vh] md:text-[23vh] font-black leading-none">{t.data.sets}</span>
            </div>

            <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
              <span className="text-[30vh] md:text-[45vh] font-black leading-none italic scale-x-[1.6] transform-gpu [text-shadow:_0_0_40px_rgb(255_255_255_/_30%)]">
                {formatPoints(t.data.points)}
              </span>
            </div>

            <div className="w-[25%] md:w-[22%] h-full flex flex-col items-center justify-center border-l-2 border-slate-800/50 bg-black/40">
              <span className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-widest italic">Games</span>
              <span className="text-[18vh] md:text-[23vh] font-black leading-none">{t.data.games}</span>
            </div>
          </button>
        ))}
      </section>

      {/* FOOTER (LOCKED AT 60px) */}
      <footer className="h-[60px] flex items-center justify-between px-2 md:px-10 border-t border-slate-900 bg-slate-950/80">
        <div className="flex items-center gap-1 md:gap-4">
          <button onClick={handleUndo} className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 md:px-6 py-1.5 rounded-lg active:scale-95 transition-all">
            <Undo2 className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
            <span className="text-[10px] md:text-lg font-black text-slate-500 uppercase hidden md:inline tracking-tighter">Undo</span>
          </button>
          <button onClick={handleSaveMatch} className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-500/50 px-3 md:px-6 py-1.5 rounded-lg active:scale-95 hover:bg-indigo-600 transition-all">
            <Save className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
            <span className="text-[10px] md:text-lg font-black text-indigo-400 uppercase hidden md:inline tracking-tighter">Save</span>
          </button>
        </div>
        
        <div className={`px-2 md:px-8 py-1.5 rounded-full border-2 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-sm transition-all duration-500 ${
          isTiebreak 
          ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse' 
          : 'bg-slate-900/40 border-slate-800 text-slate-600'
        }`}>
          {isTiebreak ? 'TIEBREAK' : 'MATCH'}
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          <button onClick={handleReset} className="text-[10px] md:text-lg font-black text-red-900/80 hover:text-red-500 uppercase tracking-widest mr-1 md:mr-4">Reset</button>
          <button onClick={() => setArchiveOpen(true)} className="p-1.5 md:p-2 bg-slate-900/50 border border-slate-800 rounded-lg text-indigo-400 active:scale-95 transition-all">
            <History className="w-4 h-4 md:w-6 md:h-6" />
          </button>
          <button onClick={() => setHistoryOpen(true)} className="p-1.5 md:p-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-600 active:scale-95 transition-all">
            <MessageSquareText className="w-4 h-4 md:w-6 md:h-6" />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="p-1.5 md:p-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-600 active:scale-95 transition-all">
            <Settings className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
      </footer>
    </main>
  );
}