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
  
  const getTextColorClass = () => { 
    if (isOutdoorMode) return timeLeft > 10 ? "text-emerald-500" : "text-orange-500";
    return timeLeft > 10 ? "text-emerald-400" : "text-orange-500";
  };

  // FIX: Stacking multiple drop-shadows to force the peak brightness and saturation
  const getGlowFilter = () => {
    if (isOutdoorMode) {
      if (timeLeft > 10) return "drop-shadow(0 0 10px rgba(16,185,129,1)) drop-shadow(0 0 25px rgba(16,185,129,1))";
      return "drop-shadow(0 0 10px rgba(249,115,22,1)) drop-shadow(0 0 25px rgba(249,115,22,1))";
    }
    // INDOOR: Triple-stacked intense glow replicating the peak red box flash
    if (timeLeft > 10) return "drop-shadow(0 0 20px rgba(52,211,153,1)) drop-shadow(0 0 40px rgba(52,211,153,1)) drop-shadow(0 0 80px rgba(52,211,153,1))";
    return "drop-shadow(0 0 20px rgba(249,115,22,1)) drop-shadow(0 0 40px rgba(249,115,22,1)) drop-shadow(0 0 80px rgba(249,115,22,1))";
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden">
      {timeLeft > 0 && (
        <div className="absolute" style={{ inset: '-2px' }}>
          <svg className="w-full h-full overflow-visible" style={{ filter: getGlowFilter() }}>
            <line x1={`${getTopLeftX1()}%`} y1="0%" x2="50%" y2="0%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTextColorClass()}`} />
            <line x1="50%" y1="0%" x2={`${getTopRightX2()}%`} y2="0%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTextColorClass()}`} />
            <line x1="0%" y1="0%" x2="0%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTextColorClass()}`} />
            <line x1="100%" y1="0%" x2="100%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTextColorClass()}`} />
            <line x1="0%" y1="100%" x2={`${getBottomLeftX2()}%`} y2="100%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTextColorClass()}`} />
            <line x1={`${getBottomRightX1()}%`} y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="4" className={`transition-all duration-75 ease-linear ${getTextColorClass()}`} />
          </svg>
        </div>
      )}
      {timeLeft <= 0 && <div className={`absolute inset-0 border-[2px] border-red-600 animate-pulse ${isOutdoorMode ? 'shadow-[inset_0_0_40px_rgba(220,38,38,0.6)]' : 'shadow-[inset_0_0_80px_rgba(220,38,38,1)]'}`} />}
    </div>
  );
}