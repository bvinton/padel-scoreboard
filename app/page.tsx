"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { Undo2, Settings, Trophy, RotateCcw, Maximize, MessageSquareText, Smartphone, Save, History, Trash2, Volume2, HelpCircle, Copy, Check, Wifi, WifiOff, Play } from "lucide-react"; 
import PusherClient from 'pusher-js';

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
    umpireEnabled, toggleUmpire, setTeamName
  } = useMatchStore();

  const [appStarted, setAppStarted] = useState(false); 
  const [isOnline, setIsOnline] = useState(false);     
  
  const [lastProcessedId, setLastProcessedId] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  
  const [roomCode, setRoomCode] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  const lastActionRef = useRef<{type: 'score'|'undo', team?: 'team1'|'team2', beforePoints: string, beforeGames: number, beforeSets: number} | null>(null);

  const [historyLog, setHistoryLog] = useState<{id: number, time: string, msg: string}[]>([]);
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistoryLog(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 30));
  };

  const speakScore = (text: string) => {
    if (!umpireEnabled || typeof window === "undefined" || !appStarted) return;
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleAppStart = async () => {
    setAppStarted(true);
    if (typeof window !== "undefined") {
      const silentUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(silentUtterance);
    }
    try {
      if ('wakeLock' in navigator) await (navigator as any).wakeLock.request('screen');
    } catch (err) {}
  };

  const handleScore = (team: 'team1' | 'team2') => {
    if (matchWinner && !localDismissed) { setLocalDismissed(true); return; }
    lastActionRef.current = { type: 'score', team: team, beforePoints: `${team1.points}-${team2.points}`, beforeGames: team1.games + team2.games, beforeSets: team1.sets + team2.sets };
    endTimeRef.current = Date.now() + 20000; setTimerStarted(true); setTimeLeft(20);
    scorePoint(team);
  };

  const handleUndo = () => {
    lastActionRef.current = { type: 'undo', beforePoints: `${team1.points}-${team2.points}`, beforeGames: team1.games + team2.games, beforeSets: team1.sets + team2.sets };
    undo(); endTimeRef.current = null; setTimerStarted(false); setTimeLeft(0); setLocalDismissed(false);
    prevGames1.current = team1.games; prevGames2.current = team2.games; prevSets1.current = team1.sets; prevSets2.current = team2.sets; prevIsTiebreak.current = isTiebreak;
  };

  const handleReset = () => {
    addLog("Match Reset to 0-0"); setHistoryLog([]); setLocalDismissed(false); endTimeRef.current = null; setTimerStarted(false); setTimeLeft(0);
    prevGames1.current = 0; prevGames2.current = 0; prevSets1.current = 0; prevSets2.current = 0; prevIsTiebreak.current = false; resetMatch();
  };

  const handleSaveMatch = () => {
    let scoreString = setScores.map(set => `${set.team1}-${set.team2}`).join(', ');
    if (team1.games > 0 || team2.games > 0) { const currentScore = `${team1.games}-${team2.games}`; scoreString = scoreString ? `${scoreString}, ${currentScore}` : currentScore; }
    const newMatch: SavedMatch = { id: Date.now(), date: new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), team1Name: team1.name, team2Name: team2.name, scores: scoreString || "0-0" };
    const updated = [newMatch, ...savedMatches]; setSavedMatches(updated); localStorage.setItem('padelArchive', JSON.stringify(updated)); addLog("Match Saved to Archive");
  };

  const deleteSavedMatch = (id: number) => { const updated = savedMatches.filter(m => m.id !== id); setSavedMatches(updated); localStorage.setItem('padelArchive', JSON.stringify(updated)); };
  const clearArchive = () => { if (window.confirm("Clear all match history?")) { setSavedMatches([]); localStorage.removeItem('padelArchive'); } };
  const handleCloseReadme = () => { if (dontShowAgain) localStorage.setItem('padelReadmeDismissed', 'true'); setReadmeOpen(false); };
  const generateNewRoomCode = () => { if (window.confirm("Disconnect Flic buttons?")) { const newRoom = Math.random().toString(36).substring(2, 6).toUpperCase(); localStorage.setItem('padelRoomCode', newRoom); setRoomCode(newRoom); setLastProcessedId(Date.now()); } };

  useEffect(() => {
    let savedRoom = localStorage.getItem('padelRoomCode');
    if (!savedRoom) { savedRoom = Math.random().toString(36).substring(2, 6).toUpperCase(); localStorage.setItem('padelRoomCode', savedRoom); }
    setRoomCode(savedRoom);
    if (localStorage.getItem('padelReadmeDismissed') !== 'true') setReadmeOpen(true);
  }, []);
  
  useEffect(() => {
    if (!lastActionRef.current) return;
    const { type, team, beforePoints, beforeGames, beforeSets } = lastActionRef.current;
    const afterPoints = `${team1.points}-${team2.points}`; const afterGames = team1.games + team2.games; const afterSets = team1.sets + team2.sets;
    
    if (type === 'undo') addLog(`Undo used at (${beforePoints}) score (${afterPoints})`);
    else if (type === 'score' && team) {
      const teamName = team === 'team1' ? team1.name : team2.name;
      if (matchWinner) addLog(`${teamName} point at (${beforePoints}) Game, Set and Match ${teamName}`);
      else if (afterSets > beforeSets) addLog(`${teamName} point at (${beforePoints}) Game and Set ${teamName}`);
      else if (afterGames > beforeGames) addLog(`${teamName} point at (${beforePoints}) Game ${teamName}`);
      else addLog(`${teamName} point at (${beforePoints}) score (${afterPoints})`);
    }
    lastActionRef.current = null;
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, matchWinner, team1.name, team2.name]);

  useEffect(() => {
    if (!timerStarted || !endTimeRef.current) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, (endTimeRef.current! - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) { clearInterval(interval); setTimeout(() => setTimerStarted(false), 2000); }
    }, 50);
    return () => clearInterval(interval);
  }, [timerStarted]);

  const prevGames1 = useRef(team1.games); const prevGames2 = useRef(team2.games);
  const prevSets1 = useRef(team1.sets); const prevSets2 = useRef(team2.sets);
  const prevIsTiebreak = useRef(isTiebreak);

  useEffect(() => {
    if (!umpireEnabled) return;
    if (isTiebreak && !prevIsTiebreak.current) { speakScore("Six games all. Tiebreak."); prevIsTiebreak.current = true; return; }
    prevIsTiebreak.current = isTiebreak;
    if (matchWinner && !matchWinnerDismissed && !localDismissed) { speakScore(`Game, Set and Match. ${matchWinner === 'team1' ? team1.name : team2.name}`); return; }
    if (team1.sets > prevSets1.current) { speakScore(`Game and Set, ${team1.name}`); prevSets1.current = team1.sets; prevGames1.current = 0; prevGames2.current = 0; return; }
    if (team2.sets > prevSets2.current) { speakScore(`Game and Set, ${team2.name}`); prevSets2.current = team2.sets; prevGames1.current = 0; prevGames2.current = 0; return; }
    if (team1.games > prevGames1.current) { speakScore(`Game, ${team1.name}`); prevGames1.current = team1.games; return; }
    if (team2.games > prevGames2.current) { speakScore(`Game, ${team2.name}`); prevGames2.current = team2.games; return; }
    
    const p1 = team1.points; const p2 = team2.points;
    if (p1 === '0' && p2 === '0') return;
    if (p1 === 'Ad' || p2 === 'Ad') speakScore("Advantage");
    else if (p1 === '40' && p2 === '40') speakScore("Deuce");
    else if (isTiebreak) speakScore(`${p1}, ${p2}`);
    else {
      const p1Text = p1 === '0' ? "Love" : p1; const p2Text = p2 === '0' ? "Love" : p2;
      if (p1 === p2) speakScore(`${p1Text} All`); else speakScore(`${p1Text}, ${p2Text}`);
    }
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, isTiebreak, matchWinner, localDismissed, team1.name, team2.name, matchWinnerDismissed, umpireEnabled]);

  useEffect(() => { const saved = localStorage.getItem('padelArchive'); if (saved) { try { setSavedMatches(JSON.parse(saved)); } catch (e) {} } }, []);

  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { winSoundRef.current = new Audio("https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3"); }, []);
  useEffect(() => { if (matchWinner && !matchWinnerDismissed && !localDismissed && winSoundRef.current) winSoundRef.current.play().catch(() => {}); }, [matchWinner, matchWinnerDismissed, localDismissed]);

  const toggleFullscreen = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen(); };

  const lastIdRef = useRef(lastProcessedId);
  const handlersRef = useRef({ handleScore, handleUndo });
  useEffect(() => { handlersRef.current = { handleScore, handleUndo }; });

  useEffect(() => {
    if (!roomCode) return; 
    fetch(`/api/flic?room=${roomCode}`).then(res => res.json()).then(data => {
         if (data.id) { lastIdRef.current = data.id; setLastProcessedId(data.id); }
    }).catch(() => {});

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '';
    if (!pusherKey) return; 

    const pusher = new PusherClient(pusherKey, { cluster: pusherCluster });
    pusher.connection.bind('state_change', function(states: { current: string }) { setIsOnline(states.current === 'connected'); });
    const channel = pusher.subscribe(`room-${roomCode}`);

    channel.bind('button-pressed', (data: { id: number, type: string }) => {
      if (data.id > lastIdRef.current) {
        lastIdRef.current = data.id;
        setLastProcessedId(data.id);
        if (data.type === 'team1') handlersRef.current.handleScore('team1');
        if (data.type === 'team2') handlersRef.current.handleScore('team2');
        if (data.type === 'undo') handlersRef.current.handleUndo();
      }
    });

    return () => { channel.unbind_all(); channel.unsubscribe(); pusher.disconnect(); };
  }, [roomCode]);

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;
  const getBottomLeftX2 = () => timeLeft >= 16 ? ((timeLeft - 16) / 4) * 50 : 0; const getBottomRightX1 = () => timeLeft >= 16 ? 100 - (((timeLeft - 16) / 4) * 50) : 100;
  const getSideY2 = () => timeLeft >= 16 ? 100 : timeLeft >= 4 ? ((timeLeft - 4) / 12) * 100 : 0; const getTopLeftX1 = () => timeLeft >= 4 ? 0 : 50 - ((timeLeft / 4) * 50);
  const getTopRightX2 = () => timeLeft >= 4 ? 100 : 50 + ((timeLeft / 4) * 50);
  const getTimerStrokeColor = () => { if (timeLeft > 10) return "text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,1)]"; return "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,1)]"; };

  return (
    <main className="fixed inset-0 flex flex-col bg-black text-white select-none overflow-hidden font-sans">
      
      {!appStarted && (
        <div className="absolute inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center gap-6 cursor-pointer" onClick={handleAppStart}>
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse rounded-full" />
            <Play size={100} className="text-emerald-400 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest italic text-center text-white drop-shadow-lg">
            Tap to Start App
          </h1>
          <p className="text-slate-400 text-sm md:text-lg font-bold uppercase tracking-wider text-center px-8">
            Keeps Screen Awake & Readies Audio (If Umpire is ON)
          </p>
        </div>
      )}

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
              {matchWinner === 'team1' ? team1.name : team2.name}
            </h2>
            <button onClick={handleReset} className="bg-amber-500 text-black px-10 md:px-20 py-4 md:py-8 rounded-full text-2xl md:text-4xl font-black uppercase active:scale-95 transition-transform flex items-center gap-4">
              <RotateCcw size={40} /> Play Again
            </button>
            <p className="mt-4 text-slate-500 text-xs uppercase tracking-widest font-bold">Tap background to dismiss</p>
          </div>
        </div>
      )}

      <section className="flex-grow flex flex-col p-1 relative overflow-hidden">
        {timerStarted && (
          <div className="absolute inset-1 pointer-events-none z-50 rounded-lg md:rounded-[1.5rem] overflow-hidden">
            {timeLeft > 0 && (
              <svg className="absolute inset-0 w-full h-full">
                <line x1={`${getTopLeftX1()}%`} y1="0%" x2="50%" y2="0%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
                <line x1="50%" y1="0%" x2={`${getTopRightX2()}%`} y2="0%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
                <line x1="0%" y1="0%" x2="0%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
                <line x1="100%" y1="0%" x2="100%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
                <line x1="0%" y1="100%" x2={`${getBottomLeftX2()}%`} y2="100%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
                <line x1={`${getBottomRightX1()}%`} y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
              </svg>
            )}
            {timeLeft <= 0 && <div className="absolute inset-0 border-[6px] border-red-600 shadow-[inset_0_0_40px_rgba(220,38,38,0.8)] animate-pulse" />}
          </div>
        )}

        {[ { id: "team1", data: team1 }, { id: "team2", data: team2 } ].map((t) => (
          <button key={t.id} onClick={() => handleScore(t.id as any)} className={`flex-1 min-h-0 border-b flex flex-row items-center relative transition-all ${server === t.id ? "border-emerald-500/50 bg-emerald-500/20 shadow-[inset_0_0_40px_rgba(16,185,129,0.25)] z-10" : "border-slate-800 bg-slate-900/20"}`}>
            <div className="absolute top-1 md:top-3 left-3 md:left-8 z-20">
              <span className={`text-[10px] md:text-2xl font-black italic uppercase transition-all duration-300 ${server === t.id ? "text-emerald-400 opacity-100 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "text-slate-400 opacity-60"}`}>{t.data.name}</span>
            </div>
            {server === t.id && <div className="absolute top-1 md:top-3 right-3 md:right-8 z-20"><span className="bg-emerald-500 text-black px-2 md:px-5 py-0.5 rounded-full font-black text-[8px] md:text-sm animate-pulse uppercase">SERVING</span></div>}
            
            <div className="w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-r border-slate-800/30 bg-black/40">
              <span className="text-[10px] md:text-xl font-black text-slate-400 uppercase tracking-widest italic">Sets</span>
              <span className="text-[20vh] md:text-[23vh] font-black leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{t.data.sets}</span>
            </div>
            
            <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
              <span className="text-[32vh] md:text-[45vh] font-black leading-none italic scale-x-[1.4] md:scale-x-[1.6] transform-gpu [text-shadow:_0_0_40px_rgb(255_255_255_/_30%),_0_0_10px_rgb(255_255_255_/_60%)]">{formatPoints(t.data.points)}</span>
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
        
        <div className={`px-3 py-0.5 rounded-full border-slate-800 font-black uppercase text-[8px] md:text-sm ${isTiebreak ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`}>
          {isTiebreak ? 'TIEBREAK' : 'MATCH'}
        </div>

        <div className="flex items-center gap-1 md:gap-3 h-full">
          <button onClick={handleReset} className="text-[10px] md:text-lg font-black text-red-900/80 uppercase mr-1 md:mr-2">Reset</button>
          
          <div className="flex items-center justify-center bg-black/40 p-1 md:p-1.5 rounded-full border border-slate-800 mr-1 md:mr-2" title={isOnline ? "Connected to Server" : "Offline / Reconnecting"}>
            {isOnline ? <Wifi size={16} className="text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]" /> : <WifiOff size={16} className="text-red-500 animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />}
          </div>
          
          <button onClick={() => setReadmeOpen(true)} className="p-1 text-emerald-500 active:scale-95"><HelpCircle size={20} /></button>
          <button onClick={() => setArchiveOpen(true)} className="p-1 text-indigo-400 active:scale-95"><History size={20} /></button>
          <button onClick={() => setHistoryOpen(true)} className="p-1 text-slate-600 active:scale-95"><MessageSquareText size={20} /></button>
          <button onClick={() => setSettingsOpen(true)} className="p-1 text-slate-600 active:scale-95"><Settings size={20} /></button>
        </div>
      </footer>

      {readmeOpen && (
        <div className="absolute inset-0 z-[300] bg-black/95 flex items-center justify-center p-4" onClick={handleCloseReadme}>
          <div className="bg-slate-900 border-2 md:border-4 border-emerald-500 p-6 md:p-10 rounded-2xl md:rounded-[3rem] w-full max-w-2xl flex flex-col gap-4 md:gap-6 max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]" onClick={e => e.stopPropagation()}>
             <h2 className="text-2xl md:text-4xl font-black uppercase text-center text-emerald-400 tracking-widest border-b-2 border-slate-800 pb-2 md:pb-4 italic">Welcome to Padel Pro</h2>
             <div className="text-slate-300 text-sm md:text-lg space-y-4 font-medium flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p>Welcome to your professional Padel Scoreboard! You can simply tap the screen to score points, but for the ultimate experience, connect your <strong>Flic Smart Buttons</strong>.</p>
                <div className="space-y-4">
                   <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-emerald-500 shadow-md">
                     <span className="block text-emerald-400 font-bold mb-2 uppercase text-sm">Team 1 Button</span>
                     <div className="flex items-center gap-2 bg-black/40 p-2 md:p-3 rounded-lg border border-slate-700">
                       <code className="text-white font-mono break-all text-xs md:text-sm flex-1">https://padel-scoreboard-mocha.vercel.app/api/flic?room={roomCode}&type=team1</code>
                       <button onClick={() => handleCopy(`https://padel-scoreboard-mocha.vercel.app/api/flic?room=${roomCode}&type=team1`, 'team1')} className={`p-2 rounded-lg transition-all flex-shrink-0 ${copiedLink === 'team1' ? 'bg-emerald-500 text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}>{copiedLink === 'team1' ? <Check size={18} /> : <Copy size={18} />}</button>
                     </div>
                   </div>
                   <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-indigo-500 shadow-md">
                     <span className="block text-indigo-400 font-bold mb-2 uppercase text-sm">Team 2 Button</span>
                     <div className="flex items-center gap-2 bg-black/40 p-2 md:p-3 rounded-lg border border-slate-700">
                       <code className="text-white font-mono break-all text-xs md:text-sm flex-1">https://padel-scoreboard-mocha.vercel.app/api/flic?room={roomCode}&type=team2</code>
                       <button onClick={() => handleCopy(`https://padel-scoreboard-mocha.vercel.app/api/flic?room=${roomCode}&type=team2`, 'team2')} className={`p-2 rounded-lg transition-all flex-shrink-0 ${copiedLink === 'team2' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}>{copiedLink === 'team2' ? <Check size={18} /> : <Copy size={18} />}</button>
                     </div>
                   </div>
                   <div className="bg-slate-800 p-4 rounded-xl border-l-4 border-amber-500 shadow-md">
                     <span className="block text-amber-400 font-bold mb-2 uppercase text-sm">Undo Button</span>
                     <div className="flex items-center gap-2 bg-black/40 p-2 md:p-3 rounded-lg border border-slate-700">
                       <code className="text-white font-mono break-all text-xs md:text-sm flex-1">https://padel-scoreboard-mocha.vercel.app/api/flic?room={roomCode}&type=undo</code>
                       <button onClick={() => handleCopy(`https://padel-scoreboard-mocha.vercel.app/api/flic?room=${roomCode}&type=undo`, 'undo')} className={`p-2 rounded-lg transition-all flex-shrink-0 ${copiedLink === 'undo' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}>{copiedLink === 'undo' ? <Check size={18} /> : <Copy size={18} />}</button>
                     </div>
                   </div>
                </div>
             </div>
             <div className="flex flex-col gap-3 mt-2 border-t border-slate-800 pt-4">
               <div className="flex items-center gap-3 justify-center">
                 <input type="checkbox" id="dontShow" checked={dontShowAgain} onChange={e => setDontShowAgain(e.target.checked)} className="w-5 h-5 md:w-6 md:h-6 accent-emerald-500 cursor-pointer" />
                 <label htmlFor="dontShow" className="text-slate-400 font-bold uppercase tracking-wider text-xs md:text-sm cursor-pointer select-none">Don't show this automatically again</label>
               </div>
               <button onClick={handleCloseReadme} className="py-3 md:py-5 bg-emerald-500 text-black font-black rounded-xl md:rounded-2xl uppercase active:scale-95 transition-transform text-lg md:text-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]">Got It, Let's Play</button>
             </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-2" onClick={() => setSettingsOpen(false)}>
          <div className="bg-slate-900 border-2 border-slate-700 p-4 rounded-2xl w-full max-w-xl flex flex-col gap-3 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h2 className="text-xl font-black uppercase text-center text-slate-500 italic">Settings</h2>
             <div className="flex flex-col gap-1 bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Room Code</span>
               <div className="flex items-center justify-center gap-4">
                 <span className="text-emerald-400 text-3xl font-black font-mono tracking-widest">{roomCode}</span>
                 <button onClick={generateNewRoomCode} className="text-slate-400 text-xs uppercase underline hover:text-white">Regenerate</button>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-2 mt-2">
               <input value={team1.name} onChange={e => setTeamName('team1', e.target.value)} placeholder="TEAM 1" className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-black uppercase text-center outline-none" maxLength={15} />
               <input value={team2.name} onChange={e => setTeamName('team2', e.target.value)} placeholder="TEAM 2" className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-lg font-black uppercase text-center outline-none" maxLength={15} />
             </div>
             <button onClick={toggleUmpire} className={`py-4 rounded-xl border-2 text-lg font-black uppercase flex items-center justify-center gap-4 ${umpireEnabled ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
               <Volume2 size={24} /> Umpire: {umpireEnabled ? 'ON' : 'OFF'}
             </button>
             <button onClick={toggleFullscreen} className="py-3 rounded-xl bg-slate-800 border border-slate-600 text-lg font-black uppercase flex items-center justify-center gap-4 transition-all active:scale-95"><Maximize size={24} /> Fullscreen</button>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMatchFormat(3)} className={`py-3 rounded-xl border text-lg font-black uppercase ${matchFormat === 3 ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Best of 3</button>
                <button onClick={() => setMatchFormat(5)} className={`py-3 rounded-xl border text-lg font-black uppercase ${matchFormat === 5 ? 'bg-indigo-600 border-white text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Best of 5</button>
             </div>
             
             {/* THE NEW GOLDEN POINT BUTTON */}
             <button onClick={toggleGoldenPoint} className={`py-3 rounded-xl border text-lg font-black uppercase transition-all ${useGoldenPoint ? 'bg-amber-500 border-white text-black' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>Golden Point: {useGoldenPoint ? 'ON' : 'OFF'}</button>
             
             <button onClick={toggleServer} className="py-3 bg-slate-800 border border-slate-600 rounded-xl text-lg font-black uppercase transition-all active:scale-95">Swap Server</button>
             <button onClick={() => setSettingsOpen(false)} className="py-3 bg-white text-black font-black rounded-xl uppercase mt-2 transition-all active:scale-95">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}