import React from 'react';
import { useMatchStore } from '../../store/useMatchStore';

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
  onPlayerClick: (teamId: 'team1' | 'team2', playerIndex: 0 | 1) => void; 
}

export default function PlayerPanel({ teamId, teamData, isServing, isOutdoorMode, t, handleScore, onPlayerClick }: PlayerPanelProps) {
  const { matchType } = useMatchStore();
  const isSingles = matchType === 'singles';
  const isTeam1 = teamId === 'team1';

  const player1Name = teamData.players ? teamData.players[0].name : 'PLAYER 1';
  const player2Name = teamData.players ? teamData.players[1].name : 'PLAYER 2';
  
  const isPlayer1Serving = isServing && teamData.serverIndex === 0;
  const isPlayer2Serving = isServing && teamData.serverIndex === 1;

  const dimmedStyle = isOutdoorMode ? "text-black/50" : "text-white/50";
  const activeTextColor = isOutdoorMode ? "text-emerald-700" : "text-emerald-400";
  const activeGlowFilter = isOutdoorMode
    ? "drop-shadow(0 0 10px rgba(5,150,105,0.8))"
    : "drop-shadow(0 0 20px rgba(52,211,153,1)) drop-shadow(0 0 40px rgba(52,211,153,1)) drop-shadow(0 0 80px rgba(52,211,153,1))";

  // --- SINGLES LAYOUT (Diagonal Layout) ---
  if (isSingles) {
    return (
      <div 
        onClick={() => handleScore(teamId)}
        className="relative flex-1 flex items-center justify-center p-4 overflow-hidden cursor-pointer select-none active:scale-[0.99] transition-transform bg-transparent"
      >
        {/* LEFT COLUMN: Team 1 Player & Sets */}
        <div className="absolute top-6 left-6 bottom-6 flex flex-col justify-between items-start z-10">
          {isTeam1 ? (
            <div 
              onClick={(e) => { e.stopPropagation(); onPlayerClick(teamId, 0); }}
              className={`text-4xl font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${isServing ? activeTextColor : dimmedStyle}`}
              style={{ filter: isServing ? activeGlowFilter : 'none' }}
            >
              {player1Name}
            </div>
          ) : <div />}

          <div className="flex flex-col items-start gap-1 pointer-events-none">
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="text-sm font-bold opacity-70 italic tracking-widest">{t.sets || 'SETS'}</div>
              {/* FIXED: Scaled up to 12vh */}
              <div className="text-[12vh] font-black leading-none">{teamData.sets}</div>
            </div>
            
            <div className={`px-4 py-1.5 rounded font-black text-sm tracking-widest mt-1 transition-all duration-300 ${(isServing && isTeam1) ? 'animate-pulse bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'opacity-0'}`}>
              SERVING
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Team 2 Player & Games */}
        <div className="absolute top-6 right-6 bottom-6 flex flex-col justify-between items-end z-10">
          {!isTeam1 ? (
            <div 
              onClick={(e) => { e.stopPropagation(); onPlayerClick(teamId, 0); }}
              className={`text-4xl font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${isServing ? activeTextColor : dimmedStyle}`}
              style={{ filter: isServing ? activeGlowFilter : 'none' }}
            >
              {player1Name}
            </div>
          ) : <div />}

          <div className="flex flex-col items-end gap-1 pointer-events-none">
            <div className="flex flex-col items-center min-w-[80px]">
              <div className="text-sm font-bold opacity-70 italic tracking-widest">{t.games || 'GAMES'}</div>
              {/* FIXED: Scaled up to 12vh */}
              <div className="text-[12vh] font-black leading-none">{teamData.games}</div>
            </div>
            
            <div className={`px-4 py-1.5 rounded font-black text-sm tracking-widest mt-1 transition-all duration-300 ${(isServing && !isTeam1) ? 'animate-pulse bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'opacity-0'}`}>
              SERVING
            </div>
          </div>
        </div>

        {/* CENTER HERO: Giant Score */}
        <div className="flex-grow flex items-center justify-center relative z-0 pointer-events-none mt-0">
          <span 
            // FIXED: Scaled up to 50vh, meaning the two scores combined take up 100% of screen height
            className={`font-extrabold text-[50vh] leading-none tracking-tighter transition-all duration-300 ${isOutdoorMode ? 'text-black' : 'text-white'}`}
            style={{ 
              transform: 'skewX(-10deg)', 
              filter: isServing && !isOutdoorMode ? 'drop-shadow(0 0 40px rgba(52,211,153,0.5)) drop-shadow(0 0 80px rgba(52,211,153,0.3))' : 'none' 
            }}
          >
            {teamData.points}
          </span>
        </div>
      </div>
    );
  }

  // --- DOUBLES LAYOUT ---
  return (
    <div 
      onClick={() => handleScore(teamId)}
      className="relative flex-1 flex items-center justify-center p-4 overflow-hidden cursor-pointer select-none active:scale-[0.99] transition-transform bg-transparent"
    >
      <div className="absolute top-6 left-6 bottom-6 flex flex-col justify-between items-start z-10">
        <div 
          onClick={(e) => { e.stopPropagation(); onPlayerClick(teamId, 0); }}
          className={`text-4xl font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${isPlayer1Serving ? activeTextColor : ''}`}
          style={{ filter: isPlayer1Serving ? activeGlowFilter : 'none' }}
        >
          <span className={!isPlayer1Serving ? dimmedStyle : ''}>{player1Name}</span>
        </div>
        <div className="flex flex-col items-start gap-1 pointer-events-none">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm font-bold opacity-70 italic tracking-widest">{t.sets || 'SETS'}</div>
            <div className="text-[12vh] font-black leading-none">{teamData.sets}</div>
          </div>
          <div className={`px-4 py-1.5 rounded font-black text-sm tracking-widest mt-1 transition-all duration-300 ${isPlayer1Serving ? 'animate-pulse bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'opacity-0'}`}>
            SERVING
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 bottom-6 flex flex-col justify-between items-end z-10">
        <div 
          onClick={(e) => { e.stopPropagation(); onPlayerClick(teamId, 1); }}
          className={`text-4xl font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 ${isPlayer2Serving ? activeTextColor : ''}`}
          style={{ filter: isPlayer2Serving ? activeGlowFilter : 'none' }}
        >
          <span className={!isPlayer2Serving ? dimmedStyle : ''}>{player2Name}</span>
        </div>
        <div className="flex flex-col items-end gap-1 pointer-events-none">
          <div className="flex flex-col items-center min-w-[80px]">
            <div className="text-sm font-bold opacity-70 italic tracking-widest">{t.games || 'GAMES'}</div>
            <div className="text-[12vh] font-black leading-none">{teamData.games}</div>
          </div>
          <div className={`px-4 py-1.5 rounded font-black text-sm tracking-widest mt-1 transition-all duration-300 ${isPlayer2Serving ? 'animate-pulse bg-emerald-500 text-black shadow-[0_0_20px_rgba(52,211,153,0.8)]' : 'opacity-0'}`}>
            SERVING
          </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center relative z-0 pointer-events-none">
        <span 
          className={`font-extrabold text-[50vh] leading-none tracking-tighter transition-all duration-300 ${isOutdoorMode ? 'text-black' : 'text-white'}`}
          style={{ 
            transform: 'skewX(-10deg)', 
            filter: isServing && !isOutdoorMode ? 'drop-shadow(0 0 40px rgba(52,211,153,0.5)) drop-shadow(0 0 80px rgba(52,211,153,0.3))' : 'none' 
          }}
        >
          {teamData.points}
        </span>
      </div>
    </div>
  );
}