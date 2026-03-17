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
      // Crisp, solid colors for outdoor mode to prevent sun wash-out
      return timeLeft > 10 ? "text-green-500" : "text-orange-500";
    }
    // Restored the stronger neon glow and vibrant colors for indoor mode
    if (timeLeft > 10) return "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,1)]"; 
    return "text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,1)]"; 
  };

  return (
    // Bumped z-index to 100 to guarantee it renders on top of the opaque outdoor panels
    <div className="absolute inset-0 pointer-events-none z-[100]">
      {timeLeft > 0 && (
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          {/* Reverted strokeWidth back to 12 for that substantial, earlier-iteration feel */}
          <line x1={`${getTopLeftX1()}%`} y1="0%" x2="50%" y2="0%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="50%" y1="0%" x2={`${getTopRightX2()}%`} y2="0%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="0%" y1="0%" x2="0%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="100%" y1="0%" x2="100%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1="0%" y1="100%" x2={`${getBottomLeftX2()}%`} y2="100%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          <line x1={`${getBottomRightX1()}%`} y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="12" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
        </svg>
      )}
      {/* Matched the red pulse border to the new 12px thickness */}
      {timeLeft <= 0 && <div className={`absolute inset-0 border-[12px] border-red-600 animate-pulse ${isOutdoorMode ? '' : 'shadow-[inset_0_0_40px_rgba(220,38,38,0.8)]'}`} />}
    </div>
  );
}