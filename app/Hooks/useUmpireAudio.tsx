import { useEffect, useRef } from "react";
import { useMatchStore } from "../../store/useMatchStore";

export default function useUmpireAudio(appStarted: boolean, localDismissed: boolean) {
  const {
    team1, team2, isTiebreak, matchWinner, matchWinnerDismissed,
    umpireEnabled, language
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
}