"use client";

import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { useProfileStore } from "../store/useProfileStore";
import { dict } from "./translations";
import HardwareWizard from "./components/HardwareWizard";
import SettingsModal from "./components/SettingsModal";
import MatchSetupModal from "./components/MatchSetupModal"; // NEW
import UserGuideModal from "./components/UserGuideModal";   // NEW
import AppOverlays from "./components/AppOverlays";
import Footer from "./components/Footer";
import ArchiveModal from "./components/ArchiveModal";
import PointLogModal from "./components/PointLogModal";
import KeyboardListener from "./components/KeyboardListener";
import WebhookListener from "./components/WebhookListener";
import ServeTimer from "./components/ServeTimer";
import PlayerPanel from "./components/PlayerPanel";
import PlayerRosterModal from "./components/PlayerRosterModal";
import PlayerSelectModal from "./components/PlayerSelectModal";
import LockedWarningModal from "./components/LockedWarningModal";
import useUmpireAudio from "./Hooks/useUmpireAudio";
import { MoreHorizontal } from "lucide-react";

interface SavedMatch {
  id: number;
  date: string;
  team1Name: string;
  team2Name: string;
  scores: string; 
}

export default function HomePage() {
  const {
    team1, team2, server, matchWinner, setScores, scorePoint, undo, 
    resetMatch, isOutdoorMode, language, history, matchStats
  } = useMatchStore();

  const { recordMatchResult } = useProfileStore();

  const t = dict[language] || dict.en; 

  const [isMounted, setIsMounted] = useState(false);
  const [appStarted, setAppStarted] = useState(false); 
  const [isOnline, setIsOnline] = useState(false);     
  
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [matchSetupOpen, setMatchSetupOpen] = useState(false); // NEW
  const [userGuideOpen, setUserGuideOpen] = useState(false);   // NEW
  const [historyOpen, setHistoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  
  const [playerSelectConfig, setPlayerSelectConfig] = useState<{ teamId: 'team1' | 'team2', playerIndex: 0 | 1 } | null>(null);
  const [lockedWarningOpen, setLockedWarningOpen] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [testSignals, setTestSignals] = useState({ team1: false, team2: false, undo: false });
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  const lastActionRef = useRef<{type: 'score'|'undo', team?: 'team1'|'team2', beforePoints: string, beforeGames: number, beforeSets: number} | null>(null);

  const [historyLog, setHistoryLog] = useState<{id: number, time: string, msg: string}[]>([]);
  const [savedMatches, setSavedMatches] = useState<SavedMatch[]>([]);

  useUmpireAudio(appStarted, localDismissed);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistoryLog(prev => [{ id: Date.now(), time, msg }, ...prev].slice(0, 30));
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
    addLog(language === 'es' ? "Partido Reiniciado (Sin guardar estadísticas)" : "Match Reset (No Stats Recorded)"); 
    setHistoryLog([]); setLocalDismissed(false); endTimeRef.current = null; setTimerStarted(false); setTimeLeft(0);
    resetMatch();
  };

  const handleEndMatch = () => {
    let scoreString = setScores.map(set => `${set.team1}-${set.team2}`).join(', ');
    if (team1.games > 0 || team2.games > 0) { const currentScore = `${team1.games}-${team2.games}`; scoreString = scoreString ? `${scoreString}, ${currentScore}` : currentScore; }
    const newMatch: SavedMatch = { id: Date.now(), date: new Date().toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), team1Name: team1.name, team2Name: team2.name, scores: scoreString || "0-0" };
    const updated = [newMatch, ...savedMatches]; setSavedMatches(updated); localStorage.setItem('padelArchive', JSON.stringify(updated)); 

    if (matchWinner) {
      const t1TotalGames = setScores.reduce((sum, set) => sum + set.team1, 0) + team1.games;
      const t2TotalGames = setScores.reduce((sum, set) => sum + set.team2, 0) + team2.games;

      const team1Ids = team1.players ? team1.players.map(p => p.id) : [];
      const team1Stats = {
        points: matchStats.team1.totalPoints,
        games: t1TotalGames,
        sets: team1.sets,
        serviceGames: matchStats.team1.serviceGamesWon,
        breaks: matchStats.team1.breaksWon
      };

      const team2Ids = team2.players ? team2.players.map(p => p.id) : [];
      const team2Stats = {
        points: matchStats.team2.totalPoints,
        games: t2TotalGames,
        sets: team2.sets,
        serviceGames: matchStats.team2.serviceGamesWon,
        breaks: matchStats.team2.breaksWon
      };

      const durationMinutes = matchStats.startTime ? Math.round((Date.now() - matchStats.startTime) / 60000) : 0;

      recordMatchResult(
        matchWinner, 
        team1Ids, 
        team1Stats, 
        team2Ids, 
        team2Stats, 
        durationMinutes
      );
      
      addLog(language === 'es' ? "Partido Finalizado y Estadísticas Guardadas" : "Match Ended & Deep Stats Recorded");
    } else {
      addLog(language === 'es' ? "Partido Guardado (Sin Ganador)" : "Match Saved (No Winner)");
    }

    setLocalDismissed(false); endTimeRef.current = null; setTimerStarted(false); setTimeLeft(0);
    resetMatch();
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

  const handlePlayerSlotClick = (teamId: 'team1' | 'team2', playerIndex: 0 | 1) => {
    if (history.length > 0) {
      setLockedWarningOpen(true);
    } else {
      setPlayerSelectConfig({ teamId, playerIndex });
    }
  };

  if (!isMounted) {
    return <div className="fixed inset-0 bg-slate-950" />;
  }

  return (
    <main 
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

      {/* NEW: Extracted Menu Modals */}
      <MatchSetupModal 
        isOpen={matchSetupOpen}
        onClose={() => setMatchSetupOpen(false)}
        setRosterOpen={setRosterOpen}
        setHistoryOpen={setHistoryOpen}
        setArchiveOpen={setArchiveOpen}
      />

      <UserGuideModal
        isOpen={userGuideOpen}
        onClose={() => setUserGuideOpen(false)}
        isOutdoorMode={isOutdoorMode}
      />

      {/* Existing Modals */}
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
        setReadmeOpen={setReadmeOpen}       // NEW
        setUserGuideOpen={setUserGuideOpen} // NEW
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

      <PlayerRosterModal 
        isOpen={rosterOpen}
        onClose={() => setRosterOpen(false)}
        isOutdoorMode={isOutdoorMode}
      />

      <PlayerSelectModal 
        isOpen={playerSelectConfig !== null}
        onClose={() => setPlayerSelectConfig(null)}
        teamId={playerSelectConfig?.teamId || null}
        playerIndex={playerSelectConfig?.playerIndex ?? null}
        isOutdoorMode={isOutdoorMode}
      />

      <LockedWarningModal
        isOpen={lockedWarningOpen}
        onClose={() => setLockedWarningOpen(false)}
        isOutdoorMode={isOutdoorMode}
      />

      <ServeTimer timerStarted={timerStarted} timeLeft={timeLeft} isOutdoorMode={isOutdoorMode} />

      <section className="flex-grow flex flex-col p-0 relative overflow-hidden">
        <PlayerPanel 
          teamId="team1" 
          teamData={team1} 
          isServing={server === "team1"} 
          isOutdoorMode={isOutdoorMode} 
          t={t} 
          handleScore={handleScore}
          onPlayerClick={handlePlayerSlotClick} 
        />
        <PlayerPanel 
          teamId="team2" 
          teamData={team2} 
          isServing={server === "team2"} 
          isOutdoorMode={isOutdoorMode} 
          t={t} 
          handleScore={handleScore}
          onPlayerClick={handlePlayerSlotClick} 
        />

        <button 
          onClick={(e) => { e.stopPropagation(); setOptionsOpen(true); }}
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-40 px-8 py-1.5 rounded-xl transition-all backdrop-blur-sm shadow-lg ${isOutdoorMode ? 'bg-white/80 text-black/50 hover:bg-white hover:text-black border border-gray-300' : 'bg-slate-800/60 text-white/30 hover:bg-slate-800 hover:text-white border border-slate-700/50'}`}
        >
          <MoreHorizontal size={28} />
        </button>
      </section>

      {optionsOpen && (
        <Footer 
          handleUndo={handleUndo}
          handleEndMatch={handleEndMatch} 
          handleReset={handleReset}
          setMatchSetupOpen={setMatchSetupOpen} // NEW
          setSettingsOpen={setSettingsOpen}
          onClose={() => setOptionsOpen(false)}
        />
      )}
    </main>
  );
}