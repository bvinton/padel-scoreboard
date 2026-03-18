import React from 'react';

interface TeamPlayerRef {
  id: string;
  name: string;
}

interface TeamData {
  name: string;
  points: string | number;
  games: number;
  sets: number;
  players: [TeamPlayerRef, TeamPlayerRef] | null;
  serverIndex: 0 | 1;
}

interface PlayerPanelProps {
  teamId: 'team1' | 'team2';
  teamData: TeamData;
  isServing: boolean;
  isOutdoorMode: boolean;
  t: any;
  handleScore: (team: 'team1' | 'team2') => void;
}

export default function PlayerPanel({ teamId, teamData, isServing, isOutdoorMode, t, handleScore }: PlayerPanelProps) {
  // Extract names or placeholders
  const player1Name = teamData.players ? teamData.players[0].name : 'PLAYER 1';
  const player2Name = teamData.players ? teamData.players[1].name : 'PLAYER 2';
  
  // Determine specific server within the team
  const isPlayer1Serving = isServing && teamData.serverIndex === 0;
  const isPlayer2Serving = isServing && teamData.serverIndex === 1;

  // DIMMED style for non-serving partner
  const dimmedStyle = isOutdoorMode ? "text-black/50" : "text-white/50";
  
  // FIXED: Separated the text color from the raw CSS filter
  const activeTextColor = isOutdoorMode ? "text-emerald-700" : "text-emerald-400";
  const activeGlowFilter = isOutdoorMode
    ? "drop-shadow(0 0 10px rgba(5,150,105,0.8))"
    : "drop-shadow(0 0 20px rgba(52,211,153,1)) drop-shadow(0 0 40px rgba(52,211,153,1)) drop-shadow(0 0 80px rgba(52,211,153,1))";

  return (
    <div 
      onClick={() => handleScore(teamId)}
      className="relative flex-1 flex items-center justify-center p-6 overflow-hidden cursor-pointer select-none active:scale-[0.99] transition-transform bg-transparent"
    >
      {/* LEFT COLUMN: Player 1 / Sets / Serving Badge */}
      <div className="absolute top-8 left-8 bottom-8 flex flex-col justify-between items-start z-10">
        <div 
          // Color goes in className, glow goes in style
          className={`text-3xl font-black uppercase tracking-wider transition-all duration-300 ${isPlayer1Serving ? activeTextColor : ''}`}
          style={{ filter: isPlayer1Serving ? activeGlowFilter : 'none' }}
        >
          <span className={!isPlayer1Serving ? dimmedStyle : ''}>
            {player1Name}
          </span>
        </div>
        
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm font-bold opacity-70 italic tracking-widest">{t.sets || 'SETS'}</div>
            <div className="text-7xl font-black leading-none">{teamData.sets}</div>
          </div>
          
          {/* Flashing SERVING box */}
          <div className={`px-4 py-1.5 rounded font-black text-sm tracking-widest mt-2 transition-all duration-300 ${isPlayer1Serving ? 'animate-pulse bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'opacity-0'}`}>
            SERVING
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Player 2 / Games / Serving Badge */}
      <div className="absolute top-8 right-8 bottom-8 flex flex-col justify-between items-end z-10">
        <div 
          className={`text-3xl font-black uppercase tracking-wider transition-all duration-300 ${isPlayer2Serving ? activeTextColor : ''}`}
          style={{ filter: isPlayer2Serving ? activeGlowFilter : 'none' }}
        >
          <span className={!isPlayer2Serving ? dimmedStyle : ''}>
            {player2Name}
          </span>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm font-bold opacity-70 italic tracking-widest">{t.games || 'GAMES'}</div>
            <div className="text-7xl font-black leading-none">{teamData.games}</div>
          </div>
          
          {/* Flashing SERVING box */}
          <div className={`px-4 py-1.5 rounded font-black text-sm tracking-widest mt-2 transition-all duration-300 ${isPlayer2Serving ? 'animate-pulse bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'opacity-0'}`}>
            SERVING
          </div>
        </div>
      </div>

      {/* CENTER HERO: Giant Score */}
      <div className="flex-grow flex items-center justify-center relative z-0">
        <span 
          className={`font-extrabold text-[40vh] leading-none tracking-tighter transition-all duration-300 ${isOutdoorMode ? 'text-black' : 'text-white'}`}
          style={{ 
            transform: 'skewX(-10deg)', 
            filter: isServing && !isOutdoorMode ? 'drop-shadow(0 0 80px rgba(52,211,153,0.3))' : 'none'
          }}
        >
          {teamData.points}
        </span>
      </div>
    </div>
  );
}