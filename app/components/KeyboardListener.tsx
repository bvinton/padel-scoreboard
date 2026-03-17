import { useEffect, useRef } from "react";

interface KeyboardListenerProps {
  handleScore: (team: 'team1' | 'team2') => void;
  handleUndo: () => void;
}

export default function KeyboardListener({ handleScore, handleUndo }: KeyboardListenerProps) {
  const handlersRef = useRef({ handleScore, handleUndo });
  useEffect(() => { handlersRef.current = { handleScore, handleUndo }; });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      
      if (['1', 'arrowleft', 'pageup', 'a'].includes(key)) {
        e.preventDefault();
        handlersRef.current.handleScore('team1');
      } else if (['2', 'arrowright', 'pagedown', 'd', 'enter'].includes(key)) {
        e.preventDefault();
        handlersRef.current.handleScore('team2');
      } else if (['3', 'backspace', 'escape', 'u'].includes(key)) {
        e.preventDefault();
        handlersRef.current.handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null; 
}