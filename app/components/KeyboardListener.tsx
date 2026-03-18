import { useEffect } from 'react';

interface KeyboardListenerProps {
  handleScore: (team: 'team1' | 'team2') => void;
  handleUndo: () => void;
  setTestSignals: React.Dispatch<React.SetStateAction<{ team1: boolean; team2: boolean; undo: boolean }>>;
}

export default function KeyboardListener({ handleScore, handleUndo, setTestSignals }: KeyboardListenerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes if the user is typing in a text input (like adding player names)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '1') {
        setTestSignals(prev => ({ ...prev, team1: true }));
        handleScore('team1');
        setTimeout(() => setTestSignals(prev => ({ ...prev, team1: false })), 300);
      } else if (e.key === '2') {
        setTestSignals(prev => ({ ...prev, team2: true }));
        handleScore('team2');
        setTimeout(() => setTestSignals(prev => ({ ...prev, team2: false })), 300);
      } else if (e.key === '3') {
        setTestSignals(prev => ({ ...prev, undo: true }));
        handleUndo();
        setTimeout(() => setTestSignals(prev => ({ ...prev, undo: false })), 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScore, handleUndo, setTestSignals]);

  return null;
}