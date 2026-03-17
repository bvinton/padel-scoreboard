import React from "react";

interface ServeTimerProps {
  timerStarted: boolean;
  timeLeft: number;
  isOutdoorMode: boolean;
}

export default function ServeTimer({ timerStarted, timeLeft, isOutdoorMode }: ServeTimerProps) {
  if (!timerStarted) return null;

  const getBottomLeftX2 = () => timeLeft >= 16 ? ((timeLeft - 16) / 4) * 50 : 0; 
  const getBottomRightX1 = () => timeLeft >= 16 ? 100 - (((timeLeft - 16) / 4) * 50) : 100;
  const getSideY2 = () => timeLeft >= 16 ? 100 : timeLeft >= 4 ? ((timeLeft - 4) / 12) * 100 : 0; 
  const getTopLeftX1 = () => timeLeft >= 4 ? 0 : 50 - ((timeLeft / 4) * 50);
  const getTopRightX2 = () => timeLeft >= 4 ? 100 : 50 + ((timeLeft / 4) * 50);
  
  const getTimerStrokeColor = () => { 
    if (isOutdoorMode) return timeLeft > 10 ? "text-emerald-500" : "text-amber-500";
    // Increased the drop-shadow glow from 12px to 16px to make the color transition more obvious
    if (timeLeft > 10) return "text-emerald-500 drop-shadow-[0_0_16px_rgba(16,185,129,1)]"; 
    return "text-amber-500 drop-shadow-[0_0_16px_rgba(245,158,11,1)]"; 
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {timeLeft > 0 && (
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {/* Increased strokeWidth from 6 to 9 for better visibility without being massive */}
          <line x1={`${getTopLeftX1()}%`} y1="0%" x2="50%" y2="0%" stroke="currentColor" strokeWidth="9" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
          <line x1="50%" y1="0%" x2={`${getTopRightX2()}%`} y2="0%" stroke="currentColor" strokeWidth="9" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
          <line x1="0%" y1="0%" x2="0%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="9" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
          <line x1="100%" y1="0%" x2="100%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="9" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
          <line x1="0%" y1="100%" x2={`${getBottomLeftX2()}%`} y2="100%" stroke="currentColor" strokeWidth="9" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
          <line x1={`${getBottomRightX1()}%`} y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="9" className={`transition-all duration-75 ease-linear ${getTimerStrokeColor()}`} />
        </svg>
      )}
      {/* Bumped the final red pulse border to 8px to match the thicker timer */}
      {timeLeft <= 0 && <div className={`absolute inset-0 border-[8px] border-red-600 animate-pulse ${isOutdoorMode ? '' : 'shadow-[inset_0_0_40px_rgba(220,38,38,0.8)]'}`} />}
    </div>
  );
}