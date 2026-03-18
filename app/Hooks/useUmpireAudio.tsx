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

  const prevGames1 = useRef(team1.games); 
  const prevGames2 = useRef(team2.games);
  const prevSets1 = useRef(team1.sets); 
  const prevSets2 = useRef(team2.sets);
  const prevIsTiebreak = useRef(isTiebreak);
  
  // NEW: Ref to ensure the music only plays exactly once per victory
  const prevMatchWinner = useRef<string | null>(null);

  useEffect(() => {
    // 1. INDEPENDENT MUSIC LOGIC
    // Reset the winner ref if match is cleared so it's ready for the next game
    if (!matchWinner) {
      prevMatchWinner.current = null;
    }

    if (matchWinner && !matchWinnerDismissed && !localDismissed) {
      if (prevMatchWinner.current !== matchWinner.key) {
        // The legendary FF7 Victory Fanfare!
        const audio = new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3'); 
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Autoplay blocked:", e));
        prevMatchWinner.current = matchWinner.key;
      }
    }

    // 2. UMPIRE VOICE LOGIC
    if (!umpireEnabled) return;
    const isEs = language === 'es';

    const getSpokenName = (team: typeof team1) => {
      if (!team.players) return team.name; 
      if (matchType === 'singles') return team.players[0].name;
      return `${team.players[0].name} ${isEs ? 'y' : 'and'} ${team.players[1].name}`;
    };

    const t1Name = getSpokenName(team1);
    const t2Name = getSpokenName(team2);

    if (isTiebreak && !prevIsTiebreak.current) { 
      speakScore(isEs ? "Seis iguales. Tiebreak." : "Six games all. Tiebreak."); 
      prevIsTiebreak.current = true; return; 
    }
    prevIsTiebreak.current = isTiebreak;

    if (team1.games > prevGames1.current) { 
      speakScore(isEs ? `Juego, ${t1Name}` : `Game, ${t1Name}`); 
      prevGames1.current = team1.games; return; 
    }
    if (team2.games > prevGames2.current) { 
      speakScore(isEs ? `Juego, ${t2Name}` : `Game, ${t2Name}`); 
      prevGames2.current = team2.games; return; 
    }

    if (matchWinner && !matchWinnerDismissed && !localDismissed) { 
      speakScore(isEs ? `Juego, set y partido. ${matchWinner.name}` : `Game, Set and Match. ${matchWinner.name}`); 
      return; 
    }
    
    if (team1.sets > prevSets1.current) { 
      speakScore(isEs ? `Juego y set, ${t1Name}` : `Game and Set, ${t1Name}`); 
      prevSets1.current = team1.sets; prevGames1.current = 0; prevGames2.current = 0; return; 
    }
    if (team2.sets > prevSets2.current) { 
      speakScore(isEs ? `Juego y set, ${t2Name}` : `Game and Set, ${t2Name}`); 
      prevSets2.current = team2.sets; prevGames1.current = 0; prevGames2.current = 0; return; 
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
  }, [team1.points, team2.points, team1.games, team2.games, team1.sets, team2.sets, isTiebreak, matchWinner, localDismissed, team1.name, team2.name, team1.players, team2.players, matchWinnerDismissed, umpireEnabled, language, matchType]);
}