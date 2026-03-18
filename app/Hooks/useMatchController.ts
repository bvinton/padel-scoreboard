import { useState, useEffect, useRef } from "react";
import { useMatchStore } from "../../store/useMatchStore";
import { useProfileStore } from "../../store/useProfileStore";

export interface SavedMatch {
  id: number;
  date: string;
  team1Name: string;
  team2Name: string;
  scores: string; 
}

export function useMatchController(
  localDismissed: boolean, 
  setLocalDismissed: (v: boolean) => void,
  setShowWelcomeHint: (v: boolean) => void
) {
  const {
    team1, team2, matchWinner, setScores, scorePoint, undo, 
    resetMatch, language, matchStats, initialServerDecided, setInitialServer
  } = useMatchStore();

  const { recordMatchResult } = useProfileStore();

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

  const handleScore = (team: 'team1' | 'team2') => {
    setShowWelcomeHint(false); 
    if (!initialServerDecided) {
      setInitialServer(team);
      return;
    }
    if (matchWinner && !localDismissed) { setLocalDismissed(true); return; }
    
    lastActionRef.current = { type: 'score', team: team, beforePoints: `${team1.points}-${team2.points}`, beforeGames: team1.games + team2.games, beforeSets: team1.sets + team2.sets };
    endTimeRef.current = Date.now() + 20000; setTimerStarted(true); setTimeLeft(20);
    scorePoint(team);
  };

  const handleUndo = () => {
    setShowWelcomeHint(false); 
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
    const updated = [newMatch, ...savedMatches]; 
    setSavedMatches(updated); 
    localStorage.setItem('padelArchive', JSON.stringify(updated)); 

    if (matchWinner) {
      const t1TotalGames = setScores.reduce((sum, set) => sum + set.team1, 0) + team1.games;
      const t2TotalGames = setScores.reduce((sum, set) => sum + set.team2, 0) + team2.games;

      const team1Ids = team1.players ? team1.players.map(p => p.id) : [];
      const team1Stats = { points: matchStats.team1.totalPoints, games: t1TotalGames, sets: team1.sets, serviceGames: matchStats.team1.serviceGamesWon, breaks: matchStats.team1.breaksWon };

      const team2Ids = team2.players ? team2.players.map(p => p.id) : [];
      const team2Stats = { points: matchStats.team2.totalPoints, games: t2TotalGames, sets: team2.sets, serviceGames: matchStats.team2.serviceGamesWon, breaks: matchStats.team2.breaksWon };

      const durationMinutes = matchStats.startTime ? Math.round((Date.now() - matchStats.startTime) / 60000) : 0;

      recordMatchResult(matchWinner.key, team1Ids, team1Stats, team2Ids, team2Stats, durationMinutes);
      addLog(language === 'es' ? "Partido Finalizado y Estadísticas Guardadas" : "Match Ended & Deep Stats Recorded");
    } else {
      addLog(language === 'es' ? "Partido Guardado (Sin Ganador)" : "Match Saved (No Winner)");
    }

    setLocalDismissed(false); endTimeRef.current = null; setTimerStarted(false); setTimeLeft(0);
    resetMatch();
  };

  const deleteSavedMatch = (id: number) => { 
    const updated = savedMatches.filter(m => m.id !== id); 
    setSavedMatches(updated); 
    localStorage.setItem('padelArchive', JSON.stringify(updated)); 
  };
  
  const clearArchive = () => { 
    if (window.confirm(language === 'es' ? "¿Borrar todo el historial?" : "Clear all match history?")) { 
      setSavedMatches([]); localStorage.removeItem('padelArchive'); 
    } 
  };

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
    if (!timerStarted || !endTimeRef.current || matchWinner) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, (endTimeRef.current! - Date.now()) / 1000);
      setTimeLeft(remaining);
      if (remaining <= 0) { clearInterval(interval); setTimeout(() => setTimerStarted(false), 2000); }
    }, 50);
    return () => clearInterval(interval);
  }, [timerStarted, matchWinner]);

  useEffect(() => { 
    const saved = localStorage.getItem('padelArchive'); 
    if (saved) { try { setSavedMatches(JSON.parse(saved)); } catch (e) {} } 
  }, []);

  return {
    timeLeft, timerStarted, historyLog, savedMatches,
    handleScore, handleUndo, handleReset, handleEndMatch,
    deleteSavedMatch, clearArchive
  };
}