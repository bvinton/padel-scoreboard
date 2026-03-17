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
  
  const getTimerClass = () => { 
    if (isOutdoorMode) {
      if (timeLeft > 10) return "text-emerald-600 drop-shadow-[0_0_10px_rgba(5,150,105,0.8)]"; 
      return "text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]"; 
    }
    if (timeLeft > 10) return "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,1)]"; 
    return "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,1)]"; 
  };

  return (
    // FIX: Pulled the inset back to 8px. This should sit right on the visible edge.
    <div className="absolute inset-[8px] pointer-events-none z-[9999]">
      {timeLeft > 0 && (
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <line x1={`${getTopLeftX1()}%`} y1="0%" x2="50%" y2="0%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="50%" y1="0%" x2={`${getTopRightX2()}%`} y2="0%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="0%" y1="0%" x2="0%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="100%" y1="0%" x2="100%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="0%" y1="100%" x2={`${getBottomLeftX2()}%`} y2="100%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1={`${getBottomRightX1()}%`} y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
        </svg>
      )}
      {timeLeft <= 0 && <div className={`absolute inset-0 border-[4px] border-red-600 animate-pulse ${isOutdoorMode ? 'shadow-[inset_0_0_40px_rgba(220,38,38,0.5)]' : 'shadow-[inset_0_0_40px_rgba(220,38,38,0.8)]'}`} />}
    </div>
  );
}