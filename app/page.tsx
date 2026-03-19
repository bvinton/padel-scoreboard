"use client";

import { useState, useEffect } from "react";
import { useMatchStore } from "../store/useMatchStore";
import { dict } from "./translations";

import { useWakeLock } from "./Hooks/useWakeLock";
import { useLongPressMenu } from "./Hooks/useLongPressMenu";
import { useMatchController } from "./Hooks/useMatchController";
import useUmpireAudio from "./Hooks/useUmpireAudio";

import HardwareWizard from "./components/HardwareWizard";
import SettingsModal from "./components/SettingsModal";
import MatchSetupModal from "./components/MatchSetupModal";
import UserGuideModal from "./components/UserGuideModal";
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

export default function HomePage() {
  const { team1, team2, server, matchWinner, isOutdoorMode, language, history, initialServerDecided, isSetupComplete, forceNewMatchState, isTiebreak, serveTimerEnabled } = useMatchStore();
  const t = dict[language] || dict.en; 

  const [isMounted, setIsMounted] = useState(false);
  const [appStarted, setAppStarted] = useState(false); 
  const [isOnline, setIsOnline] = useState(false);     
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [matchSetupOpen, setMatchSetupOpen] = useState(false);
  const [userGuideOpen, setUserGuideOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [localDismissed, setLocalDismissed] = useState(false);
  const [playerSelectConfig, setPlayerSelectConfig] = useState<{ teamId: 'team1' | 'team2', playerIndex: 0 | 1 } | null>(null);
  const [lockedWarningOpen, setLockedWarningOpen] = useState(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [testSignals, setTestSignals] = useState({ team1: false, team2: false, undo: false });

  const [returnToRoster, setReturnToRoster] = useState(false);

  const { requestWakeLock } = useWakeLock(appStarted);
  const { optionsOpen, setOptionsOpen, showWelcomeHint, setShowWelcomeHint, touchHandlers } = useLongPressMenu();
  const { timeLeft, timerStarted, historyLog, savedMatches, handleScore, handleUndo, handleReset, handleEndMatch, deleteSavedMatch, clearArchive } = useMatchController(localDismissed, setLocalDismissed, setShowWelcomeHint);
  useUmpireAudio(appStarted, localDismissed);

  const isAnyModalOpen = matchSetupOpen || settingsOpen || userGuideOpen || historyOpen || archiveOpen || readmeOpen || rosterOpen || lockedWarningOpen || (playerSelectConfig !== null);
  const isStartOfGame = (!isTiebreak && team1.points === '0' && team2.points === '0') || (isTiebreak && team1.points === 0 && team2.points === 0);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    let savedRoom = localStorage.getItem('padelRoomCode');
    if (!savedRoom) { savedRoom = Math.random().toString(36).substring(2, 6).toUpperCase(); localStorage.setItem('padelRoomCode', savedRoom); }
    setRoomCode(savedRoom);
    if (localStorage.getItem('padelReadmeDismissed') !== 'true') setReadmeOpen(true);
  }, []);

  const handleAppStart = async () => {
    setAppStarted(true);
    if (typeof window !== "undefined") {
      const silentUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(silentUtterance);
    }
    await requestWakeLock(); 
    const isBrandNewMatch = history.length === 0 && team1.points === '0' && team2.points === '0' && team1.games === 0 && team2.games === 0 && team1.sets === 0 && team2.sets === 0;
    if (isBrandNewMatch) forceNewMatchState();
  };

  const generateNewRoomCode = () => { 
    if (window.confirm(language === 'es' ? "¿Desconectar botones Flic?" : "Disconnect Flic buttons?")) { 
      const newRoom = Math.random().toString(36).substring(2, 6).toUpperCase(); 
      localStorage.setItem('padelRoomCode', newRoom); 
      setRoomCode(newRoom); 
    } 
  };

  const handlePlayerSlotClick = (teamId: 'team1' | 'team2', playerIndex: 0 | 1) => {
    setShowWelcomeHint(false); 
    if (history.length > 0) setLockedWarningOpen(true);
    else setPlayerSelectConfig({ teamId, playerIndex });
  };

  if (!isMounted) return <div className="fixed inset-0 bg-slate-950" />;

  const displayHint = (history.length === 0 && !matchWinner && isSetupComplete && initialServerDecided) || showWelcomeHint;

  return (
    <main 
      {...touchHandlers}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }} 
      className={`fixed inset-0 flex flex-col select-none overflow-hidden font-sans ${isOutdoorMode ? 'bg-white text-black' : 'bg-black text-white'}`}
    >
      <KeyboardListener handleScore={(team) => { if (!readmeOpen) handleScore(team); }} handleUndo={() => { if (!readmeOpen) handleUndo(); }} setTestSignals={setTestSignals} />
      <WebhookListener roomCode={roomCode} handleScore={(team) => { if (!readmeOpen) handleScore(team); }} handleUndo={() => { if (!readmeOpen) handleUndo(); }} setTestSignals={setTestSignals} setIsOnline={setIsOnline} />

      <AppOverlays appStarted={appStarted} handleAppStart={handleAppStart} localDismissed={localDismissed} setLocalDismissed={setLocalDismissed} handleReset={handleReset} openMatchSetup={() => setMatchSetupOpen(true)} isAnyModalOpen={isAnyModalOpen} />

      <MatchSetupModal isOpen={matchSetupOpen} onClose={() => setMatchSetupOpen(false)} onPlayerClick={handlePlayerSlotClick} setRosterOpen={setRosterOpen} />
      <UserGuideModal isOpen={userGuideOpen} onClose={() => setUserGuideOpen(false)} isOutdoorMode={isOutdoorMode} />
      <HardwareWizard isOpen={readmeOpen} onClose={() => { setReadmeOpen(false); setTestSignals({ team1: false, team2: false, undo: false }); }} testSignals={testSignals} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} roomCode={roomCode} generateNewRoomCode={generateNewRoomCode} setReadmeOpen={setReadmeOpen} setUserGuideOpen={setUserGuideOpen} />
      <PointLogModal isOpen={historyOpen} onClose={() => { setHistoryOpen(false); if (returnToRoster) { setRosterOpen(true); setReturnToRoster(false); } }} historyLog={historyLog} />
      <ArchiveModal isOpen={archiveOpen} onClose={() => { setArchiveOpen(false); if (returnToRoster) { setRosterOpen(true); setReturnToRoster(false); } }} savedMatches={savedMatches} deleteSavedMatch={deleteSavedMatch} clearArchive={clearArchive} />
      
      <PlayerRosterModal 
        isOpen={rosterOpen} 
        onClose={() => setRosterOpen(false)} 
        isOutdoorMode={isOutdoorMode} 
        setHistoryOpen={(v) => { if (v) { setReturnToRoster(true); setHistoryOpen(true); } else setHistoryOpen(false); }} 
        setArchiveOpen={(v) => { if (v) { setReturnToRoster(true); setArchiveOpen(true); } else setArchiveOpen(false); }} 
      />
      
      <PlayerSelectModal isOpen={playerSelectConfig !== null} onClose={() => setPlayerSelectConfig(null)} teamId={playerSelectConfig?.teamId || null} playerIndex={playerSelectConfig?.playerIndex ?? null} isOutdoorMode={isOutdoorMode} />
      <LockedWarningModal isOpen={lockedWarningOpen} onClose={() => setLockedWarningOpen(false)} isOutdoorMode={isOutdoorMode} />

      <ServeTimer timerStarted={timerStarted && !matchWinner && !isStartOfGame && serveTimerEnabled} timeLeft={timeLeft} isOutdoorMode={isOutdoorMode} />

      <section className="flex-grow flex flex-col p-0 relative overflow-hidden">
        <PlayerPanel teamId="team1" teamData={team1} isServing={server === "team1"} isOutdoorMode={isOutdoorMode} t={t} handleScore={handleScore} onPlayerClick={handlePlayerSlotClick} />
        <PlayerPanel teamId="team2" teamData={team2} isServing={server === "team2"} isOutdoorMode={isOutdoorMode} t={t} handleScore={handleScore} onPlayerClick={handlePlayerSlotClick} />
      </section>

      {optionsOpen && (
        <Footer handleUndo={handleUndo} handleEndMatch={handleEndMatch} handleReset={handleReset} setMatchSetupOpen={setMatchSetupOpen} setSettingsOpen={setSettingsOpen} onClose={() => setOptionsOpen(false)} />
      )}
    </main>
  );
}