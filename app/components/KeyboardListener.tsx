import { useEffect, useRef } from "react";

interface KeyboardListenerProps {
  handleScore: (team: 'team1' | 'team2') => void;
  handleUndo: () => void;
  setTestSignals: React.Dispatch<React.SetStateAction<{ team1: boolean; team2: boolean; undo: boolean }>>;
}

export default function KeyboardListener({ handleScore, handleUndo, setTestSignals }: KeyboardListenerProps) {
  const handlersRef = useRef({ handleScore, handleUndo, setTestSignals });
  useEffect(() => { handlersRef.current = { handleScore, handleUndo, setTestSignals }; });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      const triggerSignal = (type: 'team1' | 'team2' | 'undo') => {
        handlersRef.current.setTestSignals(prev => ({ ...prev, [type]: true }));
        setTimeout(() => {
          handlersRef.current.setTestSignals(prev => ({ ...prev, [type]: false }));
        }, 500); // 500ms flash effect
      };
      
      if (['1', 'arrowleft', 'pageup', 'a'].includes(key)) {
        e.preventDefault();
        triggerSignal('team1');
        handlersRef.current.handleScore('team1');
      } else if (['2', 'arrowright', 'pagedown', 'd', 'enter'].includes(key)) {
        e.preventDefault();
        triggerSignal('team2');
        handlersRef.current.handleScore('team2');
      } else if (['3', 'backspace', 'escape', 'u'].includes(key)) {
        e.preventDefault();
        triggerSignal('undo');
        handlersRef.current.handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null; 
}