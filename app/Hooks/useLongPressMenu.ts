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

  // FIXED: If the finger moves (scrolling) or lifts, instantly cancel the menu timer!
  const handleTouchEndOrMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return {
    optionsOpen, 
    setOptionsOpen,
    showWelcomeHint, 
    setShowWelcomeHint,
    touchHandlers: {
      onMouseDown: handleTouchStart,
      onMouseUp: handleTouchEndOrMove,
      onMouseMove: handleTouchEndOrMove, // Cancel on mouse move
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEndOrMove,
      onTouchMove: handleTouchEndOrMove, // Cancel on touch drag/scroll
      onContextMenu: (e: React.MouseEvent) => e.preventDefault()
    }
  };
}