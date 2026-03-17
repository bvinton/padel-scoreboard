"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { dict } from "./translations";
import HardwareWizard from "./components/HardwareWizard";
import SettingsModal from "./components/SettingsModal";
import AppOverlays from "./components/AppOverlays";
import Footer from "./components/Footer";
import ArchiveModal from "./components/ArchiveModal";
import PointLogModal from "./components/PointLogModal";
import KeyboardListener from "./components/KeyboardListener";
import WebhookListener from "./components/WebhookListener";
import { MoreVertical } from "lucide-react";

interface SavedMatch {
  id: number;
  date: string;
  team1Name: string;
  team2Name: string;
  scores: string; 
}

export default function HomePage() {
  const {
    team1, team2, server, isTiebreak, matchWinner, matchWinnerDismissed, 
    setScores, scorePoint, undo, resetMatch, umpireEnabled,
    isOutdoorMode, language
  } = useMatchStore();

  const t = dict[language] || dict.en; 

  const [isMounted, setIsMounted] = useState(false);
  const [appStarted, setAppStarted] = useState(false); 
  const [isOnline, setIsOnline] = useState(false);     
  
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  
  const [roomCode, setRoomCode] = useState<string>("");
  const [testSignals, setTestSignals] = useState({ team1: false, team2: false, undo: false });
  const [burnInShift, setBurnInShift] = useState({ x: 0, y: 0 });
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  const lastActionRef = useRef<{type: 'score'|'undo', team?: 'team1'|'team2', beforePoints: string, beforeGames: number, beforeSets: number} | null>(null);

  const [historyLog, setHistoryLog] = useState<{id: number, time: string, msg: string}[]>([]);
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistoryLog(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 30));
  };

  const speakScore = (text: string) => {
    if (!umpireEnabled || typeof window === "undefined" || !appStarted) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    const targetLang = language === 'es' ? 'es' : 'en';
    const preferredVoice = voices.find(v => 
      (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("low") || v.name.toLowerCase().includes("hombre")) && 
      v.lang.startsWith(targetLang)
    );
    const fallbackVoice = voices.find(v => v.lang.startsWith(targetLang));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    else if (fallbackVoice) utterance.voice = fallbackVoice;
    
    utterance.rate = 1.05;
    utterance.pitch = 0.85;
    window.speechSynthesis.speak(utterance);
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
  };

  const handleReset = () => {
    addLog(language === 'es' ? "Partido Reiniciado" : "Match Reset"); setHistoryLog([]); setLocalDismissed(false); endTimeRef.current = null; setTimerStarted(false); setTimeLeft(0);
    resetMatch();
  };

  const handleSaveMatch = () => {
    let scoreString = setScores.map(set => `${set.team1}-${set.team2}`).join(', ');
    if (team1.games > 0 || team2.games > 0) { const currentScore = `${team1.games}-${team2.games}`; scoreString = scoreString ? `${scoreString}, ${currentScore}` : currentScore; }
    const newMatch: SavedMatch = { id: Date.now(), date: new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), team1Name: team1.name, team2Name: team2.name, scores: scoreString || "0-0" };
    const updated = [newMatch, ...savedMatches]; setSavedMatches(updated); localStorage.setItem('padelArchive', JSON.stringify(updated)); addLog(language === 'es' ? "Partido Guardado" : "Match Saved");
  };

  const deleteSavedMatch = (id: number) => { const updated = savedMatches.filter(m => m.id !== id); setSavedMatches(updated); localStorage.setItem('padelArchive', JSON.stringify(updated)); };
  const clearArchive = () => { if (window.confirm(language === 'es' ? "¿Borrar todo el historial?" : "Clear all match history?")) { setSavedMatches([]); localStorage.removeItem('padelArchive'); } };
  
  const generateNewRoomCode = () => { 
    if (window.confirm(language === 'es' ? "¿Desconectar botones Flic?" : "Disconnect Flic buttons?")) { 
      const newRoom = Math.random().toString(36).substring(2, 6).toUpperCase(); 
      localStorage.setItem('padelRoomCode', newRoom); 
      setRoomCode(newRoom); 
    } 
  };

  useEffect(() => {
    let savedRoom = localStorage.getItem('padelRoomCode');
    if (!savedRoom) { savedRoom = Math.random().toString(36).substring(2, 6).toUpperCase(); localStorage.setItem('padelRoomCode', savedRoom); }
    setRoomCode(savedRoom);
    if (localStorage.getItem('padelReadmeDismissed') !== 'true') setReadmeOpen(true);
  }, []);
  
  useEffect(() => {
    const shiftInterval = setInterval(() => {
      setBurnInShift({ x: Math.floor(Math.random() * 13) - 6, y: Math.floor(Math.random() * 13) - 6 });
    }, 60000); 
    return () => clearInterval(shiftInterval);
  }, []);

  const prevGames1 = useRef(team1.games); const prevGames2 = useRef(team2.games);
  const prevSets1 = useRef(team1.sets); const prevSets2 = useRef(team2.sets);
  const prevIsTiebreak = useRef(isTiebreak);

  useEffect(() => {
    if (!umpireEnabled) return;
    const isEs = language === 'es';

    if (isTiebreak && !prevIsTiebreak.current) { 
      speakScore(isEs ? "Seis iguales. Tiebreak." : "Six games all. Tiebreak."); 
      prevIsTiebreak.current = true; return; 
    }
    prevIsTiebreak.current = isTiebreak;

    if (matchWinner && !matchWinnerDismissed && !localDismissed) { 
      const winnerName = matchWinner === 'team1' ? team1.name : team2.name;
      speakScore(isEs ? `Juego, set y partido. ${winnerName}` : `Game, Set and Match. ${winnerName}`); 
      return; 
    }
    if (team1.sets > prevSets1.current) { 
      speakScore(isEs ? `Juego y set, ${team1.name}` : `Game and Set, ${team1.name}`); 
      prevSets1.current = team1.sets; prevGames1.current = 0; prevGames2.current = 0; return; 
    }
    if (team2.sets > prevSets2.current) { 
      speakScore(isEs ? `Juego y set, ${team2.name}` : `Game and Set, ${team2.name}`); 
      prevSets2.current = team2.sets; prevGames1.current = 0; prevGames2.current = 0; return; 
    }
    if (team1.games > prevGames1.current) { 
      speakScore(isEs ? `Juego, ${team1.name}` : `Game, ${team1.name}`); 
      prevGames1.current = team1.games; return; 
    }
    if (team2.games > prevGames2.current) { 
      speakScore(isEs ? `Juego, ${team2.name}` : `Game, ${team2.name}`); 
      prevGames2.current = team2.games; return; 
    }
    
    const p1 = team1.points; const p2 = team2.points;
    if (p1 === '0' && p2 === '0') return;
    
    if (p1 === 'Ad' || p2 === 'Ad') speakScore(isEs ? "Ventaja" : "Advantage");
    else if (p1 === '40' && p2 === '40') speakScore(isEs ? "Iguales" : "Deuce");
    else if (isTiebreak) speakScore(`${p1}, ${p2}`);
    else {
      const p1TextEn = p1 === '0' ? "Love" : p1; const p2TextEn = p2 === '0' ? "Love" : p2;
      const p1TextEs = p1 === '0' ? "Cero" : p1 === '15' ? "Quince" : p1 === '30' ? "Treinta" : "Cuarenta";
      const p2TextEs = p2 === '0' ? "Cero" : p2 === '15' ? "Quince" : p2 === '30' ? "Treinta" : "Cuarenta";

      const p1Text = isEs ? p1TextEs : p1TextEn;
      const p2Text = isEs ? p2TextEs : p2TextEn;

      if (p1 === p2) speakScore(isEs ? `${p1Text} iguales` : `${p1Text} All`); 
      else speakScore(`${p1Text}, ${p2Text}`);
    }
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, isTiebreak, matchWinner, localDismissed, team1.name, team2.name, matchWinnerDismissed, umpireEnabled, language]);

  useEffect(() => {
    if (!lastActionRef.current) return;
    const { type, team, beforePoints, beforeGames, beforeSets } = lastActionRef.current;
    const afterPoints = `${team1.points}-${team2.points}`; const afterGames = team1.games + team2.games; const afterSets = team1.sets + team2.sets;
    const isEs = language === 'es';
    
    if (type === 'undo') addLog(isEs ? `Deshacer en (${beforePoints}) a (${afterPoints})` : `Undo used at (${beforePoints}) score (${afterPoints})`);
    else if (type === 'score' && team) {
      const teamName = team === 'team1' ? team1.name : team2.name;
      if (matchWinner) addLog(isEs ? `Punto ${teamName} (${beforePoints}) Juego, Set y Partido` : `${teamName} point at (${beforePoints}) Game, Set and Match ${teamName}`);
      else if (afterSets > beforeSets) addLog(isEs ? `Punto ${teamName} (${beforePoints}) Juego y Set` : `${teamName} point at (${beforePoints}) Game and Set ${teamName}`);
      else if (afterGames > beforeGames) addLog(isEs ? `Punto ${teamName} (${beforePoints}) Juego` : `${teamName} point at (${beforePoints}) Game ${teamName}`);
      else addLog(isEs ? `Punto ${teamName} (${beforePoints}) marcador (${afterPoints})` : `${teamName} point at (${beforePoints}) score (${afterPoints})`);
    }
    lastActionRef.current = null;
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, matchWinner, team1.name, team2.name, language]);

  useEffect(() => {
    if (!timerStarted || !endTimeRef.current) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, (endTimeRef.current! - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) { clearInterval(interval); setTimeout(() => setTimerStarted(false), 2000); }
    }, 50);
    return () => clearInterval(interval);
  }, [timerStarted]);

  useEffect(() => { const saved = localStorage.getItem('padelArchive'); if (saved) { try { setSavedMatches(JSON.parse(saved)); } catch (e) {} } }, []);

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;
  const getBottomLeftX2 = () => timeLeft >= 16 ? ((timeLeft - 16) / 4) * 50 : 0; const getBottomRightX1 = () => timeLeft >= 16 ? 100 - (((timeLeft - 16) / 4) * 50) : 100;
  const getSideY2 = () => timeLeft >= 16 ? 100 : timeLeft >= 4 ? ((timeLeft - 4) / 12) * 100 : 0; const getTopLeftX1 = () => timeLeft >= 4 ? 0 : 50 - ((timeLeft / 4) * 50);
  const getTopRightX2 = () => timeLeft >= 4 ? 100 : 50 + ((timeLeft / 4) * 50);
  const getTimerStrokeColor = () => { 
    if (isOutdoorMode) return timeLeft > 10 ? "text-emerald-500" : "text-amber-500";
    if (timeLeft > 10) return "text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,1)]"; 
    return "text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,1)]"; 
  };

  if (!isMounted) {
    return <div className="fixed inset-0 bg-slate-950" />;
  }

  return (
    <main 
      style={{ 
        transform: `scale(1.02) translate(${burnInShift.x}px, ${burnInShift.y}px)`,
        transition: 'transform 5s ease-in-out, background-color 0.5s, color 0.5s' 
      }}
      className={`fixed inset-0 flex flex-col select-none overflow-hidden font-sans ${isOutdoorMode ? 'bg-white text-black' : 'bg-black text-white'}`}
    >
      <KeyboardListener handleScore={handleScore} handleUndo={handleUndo} setTestSignals={setTestSignals} />
      
      <WebhookListener 
        roomCode={roomCode} 
        handleScore={handleScore} 
        handleUndo={handleUndo} 
        setTestSignals={setTestSignals} 
        setIsOnline={setIsOnline} 
      />

      <AppOverlays 
        appStarted={appStarted} 
        handleAppStart={handleAppStart} 
        localDismissed={localDismissed} 
        setLocalDismissed={setLocalDismissed} 
        handleReset={handleReset} 
      />

      <HardwareWizard 
        isOpen={readmeOpen} 
        onClose={() => { setReadmeOpen(false); setTestSignals({ team1: false, team2: false, undo: false }); }} 
        testSignals={testSignals} 
      />

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        roomCode={roomCode} 
        generateNewRoomCode={generateNewRoomCode} 
      />

      <ArchiveModal 
        isOpen={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        savedMatches={savedMatches}
        deleteSavedMatch={deleteSavedMatch}
        clearArchive={clearArchive}
      />

      <PointLogModal 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        historyLog={historyLog}
      />

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
            {timeLeft <= 0 && <div className={`absolute inset-0 border-[6px] border-red-600 animate-pulse ${isOutdoorMode ? '' : 'shadow-[inset_0_0_40px_rgba(220,38,38,0.8)]'}`} />}
          </div>
        )}

        {[ { id: "team1", data: team1 }, { id: "team2", data: team2 } ].map((tTeam) => {
          const isServing = server === tTeam.id;
          const btnTheme = isOutdoorMode 
            ? (isServing ? "border-emerald-500 bg-emerald-50 z-10 shadow-sm" : "border-gray-300 bg-white")
            : (isServing ? "border-emerald-500/50 bg-emerald-500/20 shadow-[inset_0_0_40px_rgba(16,185,129,0.25)] z-10" : "border-slate-800 bg-slate-900/20");
          const sideColTheme = isOutdoorMode ? "border-gray-200 bg-gray-100" : "border-slate-800/30 bg-black/40";
          const labelTheme = isOutdoorMode ? "text-gray-500" : "text-slate-400";
          const smallNumTheme = isOutdoorMode ? "text-black" : "text-white";
          const nameTheme = isOutdoorMode 
            ? (isServing ? "text-emerald-700 font-extrabold" : "text-gray-500 font-bold")
            : (isServing ? "text-emerald-400 opacity-100" : "text-slate-400 opacity-60");

          return (
            <button key={tTeam.id} onClick={() => handleScore(tTeam.id as any)} className={`flex-1 min-h-0 border-b flex flex-row items-center relative transition-all ${btnTheme}`}>
              <div className="absolute top-1 md:top-3 left-3 md:left-8 z-20">
                <span className={`text-[10px] md:text-2xl italic uppercase ${nameTheme}`}>{tTeam.data.name}</span>
              </div>
              {isServing && (
                <div className="absolute top-1 md:top-3 right-3 md:right-8 z-20">
                  <span className={`px-2 md:px-5 py-0.5 rounded-full font-black text-[8px] md:text-sm animate-pulse uppercase ${isOutdoorMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}>{t.serving}</span>
                </div>
              )}
              <div className={`w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-r ${sideColTheme}`}>
                <span className={`text-[10px] md:text-xl font-black uppercase italic ${labelTheme}`}>{t.sets}</span>
                <span className={`text-[20vh] md:text-[25vh] font-black leading-none ${smallNumTheme}`}>{tTeam.data.sets}</span>
              </div>
              <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
                <span className={`text-[35vh] md:text-[50vh] font-black leading-none italic scale-x-[1.4] md:scale-x-[1.6] transform-gpu ${isOutdoorMode ? "text-black" : "text-white [text-shadow:_0_0_40px_rgba(255,255,255,0.3)]"}`}>
                  {formatPoints(tTeam.data.points)}
                </span>
              </div>
              <div className={`w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-l ${sideColTheme}`}>
                <span className={`text-[10px] md:text-xl font-black uppercase italic ${labelTheme}`}>{t.games}</span>
                <span className={`text-[20vh] md:text-[25vh] font-black leading-none ${smallNumTheme}`}>{tTeam.data.games}</span>
              </div>
            </button>
          )
        })}

        {/* NEW: The faint 3-dots trigger button floating in the bottom right corner */}
        <button 
          onClick={(e) => { e.stopPropagation(); setOptionsOpen(true); }}
          className={`absolute bottom-4 right-4 z-40 p-3 rounded-full transition-all backdrop-blur-sm shadow-lg ${isOutdoorMode ? 'bg-white/70 text-black/50 hover:bg-white hover:text-black border border-gray-200' : 'bg-slate-800/40 text-white/30 hover:bg-slate-800 hover:text-white border border-slate-700/50'}`}
        >
          <MoreVertical size={28} />
        </button>
      </section>

      {/* Conditionally render the new sliding footer */}
      {optionsOpen && (
        <Footer 
          handleUndo={handleUndo}
          handleSaveMatch={handleSaveMatch}
          handleReset={handleReset}
          setReadmeOpen={setReadmeOpen}
          setArchiveOpen={setArchiveOpen}
          setHistoryOpen={setHistoryOpen}
          setSettingsOpen={setSettingsOpen}
          onClose={() => setOptionsOpen(false)}
        />
      )}
    </main>
  );
}