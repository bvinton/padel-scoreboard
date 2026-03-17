import React from "react";

interface TeamData {
  name: string;
  sets: number;
  games: number;
  points: string | number;
}

interface PlayerPanelProps {
  teamId: "team1" | "team2";
  teamData: TeamData;
  isServing: boolean;
  isOutdoorMode: boolean;
  t: any;
  handleScore: (team: "team1" | "team2") => void;
}

export default function PlayerPanel({ teamId, teamData, isServing, isOutdoorMode, t, handleScore }: PlayerPanelProps) {
  const btnTheme = isOutdoorMode 
    ? (isServing ? "border-emerald-500 bg-emerald-50 z-10 shadow-sm" : "border-gray-300 bg-white")
    : (isServing ? "border-emerald-500/50 bg-emerald-500/20 shadow-[inset_0_0_40px_rgba(16,185,129,0.25)] z-10" : "border-slate-800 bg-slate-900/20");
  const sideColTheme = isOutdoorMode ? "border-gray-200 bg-gray-100" : "border-slate-800/30 bg-black/40";
  const labelTheme = isOutdoorMode ? "text-gray-500" : "text-slate-400";
  const smallNumTheme = isOutdoorMode ? "text-black" : "text-white";
  const nameTheme = isOutdoorMode 
    ? (isServing ? "text-emerald-700 font-extrabold" : "text-gray-500 font-bold")
    : (isServing ? "text-emerald-400 opacity-100" : "text-slate-400 opacity-60");

  const formatPoints = (p: string | number) => typeof p === "number" ? p.toString() : p;

  return (
    <button onClick={() => handleScore(teamId)} className={`flex-1 min-h-0 border-b flex flex-row items-center relative transition-all ${btnTheme}`}>
      <div className="absolute top-1 md:top-3 left-3 md:left-8 z-20">
        <span className={`text-[10px] md:text-2xl italic uppercase ${nameTheme}`}>{teamData.name}</span>
      </div>
      {isServing && (
        <div className="absolute top-1 md:top-3 right-3 md:right-8 z-20">
          <span className={`px-2 md:px-5 py-0.5 rounded-full font-black text-[8px] md:text-sm animate-pulse uppercase ${isOutdoorMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}>{t.serving}</span>
        </div>
      )}
      <div className={`w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-r ${sideColTheme}`}>
        <span className={`text-[10px] md:text-xl font-black uppercase italic ${labelTheme}`}>{t.sets}</span>
        <span className={`text-[20vh] md:text-[25vh] font-black leading-none ${smallNumTheme}`}>{teamData.sets}</span>
      </div>
      <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
        <span className={`text-[35vh] md:text-[50vh] font-black leading-none italic scale-x-[1.48] md:scale-x-[1.68] transform-gpu ${isOutdoorMode ? "text-black" : "text-white [text-shadow:_0_0_40px_rgba(255,255,255,0.3)]"}`}>
          {formatPoints(teamData.points)}
        </span>
      </div>
      <div className={`w-[28%] md:w-[22%] h-full flex flex-col items-center justify-center border-l ${sideColTheme}`}>
        <span className={`text-[10px] md:text-xl font-black uppercase italic ${labelTheme}`}>{t.games}</span>
        <span className={`text-[20vh] md:text-[25vh] font-black leading-none ${smallNumTheme}`}>{teamData.games}</span>
      </div>
    </button>
  );
}