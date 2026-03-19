import { useState, useRef } from 'react';

export function useLongPressMenu() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showWelcomeHint, setShowWelcomeHint] = useState(true);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Record the exact starting coordinates of the finger/mouse
    startPos.current = { x: clientX, y: clientY };

    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    longPressTimer.current = setTimeout(() => {
      setOptionsOpen(true);
      setShowWelcomeHint(false); 
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    }, 600); 
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!startPos.current || !longPressTimer.current) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Calculate how far the finger has actually moved
    const dx = clientX - startPos.current.x;
    const dy = clientY - startPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // FIXED: Only cancel the long press if the finger moves more than 15 pixels!
    if (distance > 15) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    startPos.current = null;
  };

  return {
    optionsOpen, 
    setOptionsOpen,
    showWelcomeHint, 
    setShowWelcomeHint,
    touchHandlers: {
      onMouseDown: handleStart,
      onMouseUp: handleEnd,
      onMouseMove: handleMove, 
      onTouchStart: handleStart,
      onTouchEnd: handleEnd,
      onTouchMove: handleMove, 
      onContextMenu: (e: React.MouseEvent) => e.preventDefault() 
    }
  };
}