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
      // Tighter 20px glow for outdoor mode so it doesn't wash out against the white background
      if (timeLeft > 10) return "text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.9)]"; 
      return "text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.9)]"; 
    }
    // INDOOR: Massive 35px glow to mimic the red warning box, but slightly less aggressive
    if (timeLeft > 10) return "text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.8)]"; 
    return "text-orange-500 drop-shadow-[0_0_35px_rgba(249,115,22,0.8)]"; 
  };

  return (
    // The outer container perfectly matches the screen. 'overflow-hidden' prevents scrollbars on PC.
    <div className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden">
      {timeLeft > 0 && (
        // We push the SVG exactly 12px outside the screen. 
        // Because it uses raw pixels instead of percentages, it scales perfectly on any device.
        <div className="absolute" style={{ inset: '-12px' }}>
          <svg className="w-full h-full overflow-visible">
            <line x1={`${getTopLeftX1()}%`} y1="0%" x2="50%" y2="0%" stroke="currentColor" strokeWidth="10" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
            <line x1="50%" y1="0%" x2={`${getTopRightX2()}%`} y2="0%" stroke="currentColor" strokeWidth="10" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
            <line x1="0%" y1="0%" x2="0%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="10" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
            <line x1="100%" y1="0%" x2="100%" y2={`${getSideY2()}%`} stroke="currentColor" strokeWidth="10" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
            <line x1="0%" y1="100%" x2={`${getBottomLeftX2()}%`} y2="100%" stroke="currentColor" strokeWidth="10" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
            <line x1={`${getBottomRightX1()}%`} y1="100%" x2="100%" y2="100%" stroke="currentColor" strokeWidth="10" className={`transition-all duration-75 ease-linear ${getTimerClass()}`} />
          </svg>
        </div>
      )}
      {/* The final red pulse that you loved, left entirely untouched so it stays perfect */}
      {timeLeft <= 0 && <div className={`absolute inset-0 border-[2px] border-red-600 animate-pulse ${isOutdoorMode ? 'shadow-[inset_0_0_40px_rgba(220,38,38,0.4)]' : 'shadow-[inset_0_0_60px_rgba(220,38,38,0.8)]'}`} />}
    </div>
  );
}