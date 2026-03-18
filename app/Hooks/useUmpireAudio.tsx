import { useEffect, useRef } from "react";
import { useMatchStore } from "../../store/useMatchStore";

export default function useUmpireAudio(appStarted: boolean, localDismissed: boolean) {
  const {
    team1, team2, isTiebreak, matchWinner, matchWinnerDismissed,
    umpireEnabled, language, matchType 
  } = useMatchStore();

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

  // FIXED: A single unified memory state that tracks the exact snapshot of the previous point
  const prev = useRef({
    t1Games: team1.games, t2Games: team2.games,
    t1Sets: team1.sets, t2Sets: team2.sets,
    p1: team1.points, p2: team2.points,
    tiebreak: isTiebreak
  });
  
  const prevMatchWinner = useRef<string | null>(null);

  useEffect(() => {
    // 1. INDEPENDENT MUSIC LOGIC
    if (!matchWinner) {
      prevMatchWinner.current = null;
    }

    if (matchWinner && !matchWinnerDismissed && !localDismissed) {
      if (prevMatchWinner.current !== matchWinner.key) {
        const audio = new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3'); 
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Autoplay blocked:", e));
        prevMatchWinner.current = matchWinner.key;
      }
    }

    // 2. UMPIRE VOICE LOGIC
    if (!umpireEnabled) {
      // If muted, we still must sync the memory so it doesn't break when unmuted!
      prev.current = { t1Games: team1.games, t2Games: team2.games, t1Sets: team1.sets, t2Sets: team2.sets, p1: team1.points, p2: team2.points, tiebreak: isTiebreak };
      return;
    }

    const isEs = language === 'es';

    const getSpokenName = (team: typeof team1) => {
      if (!team.players) return team.name; 
      if (matchType === 'singles') return team.players[0].name;
      return `${team.players[0].name} ${isEs ? 'y' : 'and'} ${team.players[1].name}`;
    };

    const t1Name = getSpokenName(team1);
    const t2Name = getSpokenName(team2);

    // Calculate exactly what changed since the last render
    const games1Won = team1.games > prev.current.t1Games;
    const games2Won = team2.games > prev.current.t2Games;
    const sets1Won = team1.sets > prev.current.t1Sets;
    const sets2Won = team2.sets > prev.current.t2Sets;
    const pointsChanged = team1.points !== prev.current.p1 || team2.points !== prev.current.p2;
    const tiebreakStarted = isTiebreak && !prev.current.tiebreak;

    // If numbers went backwards, the user hit Undo or Reset. We say nothing.
    const isResetOrUndo = team1.games < prev.current.t1Games || team2.games < prev.current.t2Games || team1.sets < prev.current.t1Sets || team2.sets < prev.current.t2Sets;

    if (isResetOrUndo) {
      // Do nothing, just let the refs sync at the bottom
    } else if (matchWinner && !matchWinnerDismissed && !localDismissed) { 
      speakScore(isEs ? `Juego, set y partido. ${matchWinner.name}` : `Game, Set and Match. ${matchWinner.name}`); 
    } else if (sets1Won) {
      speakScore(isEs ? `Juego y set, ${t1Name}` : `Game and Set, ${t1Name}`);
    } else if (sets2Won) {
      speakScore(isEs ? `Juego y set, ${t2Name}` : `Game and Set, ${t2Name}`);
    } else if (games1Won && !isTiebreak) {
      speakScore(isEs ? `Juego, ${t1Name}` : `Game, ${t1Name}`);
    } else if (games2Won && !isTiebreak) {
      speakScore(isEs ? `Juego, ${t2Name}` : `Game, ${t2Name}`);
    } else if (tiebreakStarted) {
      speakScore(isEs ? "Seis iguales. Tiebreak." : "Six games all. Tiebreak.");
    } else if (pointsChanged) {
      const p1 = team1.points; const p2 = team2.points;
      
      if (p1 === '0' && p2 === '0') {
        // New game started, we don't say 0-0 immediately after "Game"
      } else if (p1 === 'Ad' || p2 === 'Ad') {
        speakScore(isEs ? "Ventaja" : "Advantage");
      } else if (p1 === '40' && p2 === '40') {
        speakScore(isEs ? "Iguales" : "Deuce");
      } else if (isTiebreak) {
        speakScore(`${p1}, ${p2}`);
      } else {
        const p1TextEn = p1 === '0' ? "Love" : p1; const p2TextEn = p2 === '0' ? "Love" : p2;
        const p1TextEs = p1 === '0' ? "Cero" : p1 === '15' ? "Quince" : p1 === '30' ? "Treinta" : "Cuarenta";
        const p2TextEs = p2 === '0' ? "Cero" : p2 === '15' ? "Quince" : p2 === '30' ? "Treinta" : "Cuarenta";

        const p1Text = isEs ? p1TextEs : p1TextEn;
        const p2Text = isEs ? p2TextEs : p2TextEn;

        if (p1 === p2) speakScore(isEs ? `${p1Text} iguales` : `${p1Text} All`); 
        else speakScore(`${p1Text}, ${p2Text}`);
      }
    }

    // FIXED: Unconditionally sync the Umpire's memory at the end of every point so it never gets stuck
    prev.current = {
      t1Games: team1.games, t2Games: team2.games,
      t1Sets: team1.sets, t2Sets: team2.sets,
      p1: team1.points, p2: team2.points,
      tiebreak: isTiebreak
    };

  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, isTiebreak, matchWinner, localDismissed, team1.name, team2.name, team1.players, team2.players, matchWinnerDismissed, umpireEnabled, language, matchType, appStarted]);
}