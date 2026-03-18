import { useState, useRef } from 'react';

export function useLongPressMenu() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showWelcomeHint, setShowWelcomeHint] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setOptionsOpen(true);
      setShowWelcomeHint(false); 
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    }, 600); 
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return {
    optionsOpen, 
    setOptionsOpen,
    showWelcomeHint, 
    setShowWelcomeHint,
    touchHandlers: {
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEnd,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault()
    }
  };
}