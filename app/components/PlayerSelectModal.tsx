import React from 'react';
import { useProfileStore } from '../../store/useProfileStore';
import { useMatchStore, TeamPlayerRef } from '../../store/useMatchStore';
import { X, User } from 'lucide-react';

interface PlayerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: 'team1' | 'team2' | null;
  playerIndex: 0 | 1 | null;
  isOutdoorMode: boolean;
}

export default function PlayerSelectModal({ isOpen, onClose, teamId, playerIndex, isOutdoorMode }: PlayerSelectModalProps) {
  const { profiles } = useProfileStore();
  const { team1, team2, setTeamPlayers } = useMatchStore();

  if (!isOpen || !teamId || playerIndex === null) return null;

  // NEW: Scrape the IDs of everyone currently assigned to the court
  const getSelectedIds = () => {
    const ids: string[] = [];
    if (team1.players) { ids.push(team1.players[0].id, team1.players[1].id); }
    if (team2.players) { ids.push(team2.players[0].id, team2.players[1].id); }
    return ids;
  };
  const currentlyOnCourtIds = getSelectedIds();

  const handleSelect = (profile: { id: string, name: string }) => {
    const teamData = teamId === 'team1' ? team1 : team2;
    
    const currentPlayers = teamData.players || [
      { id: `temp-${teamId}-0`, name: 'PLAYER 1' },
      { id: `temp-${teamId}-1`, name: 'PLAYER 2' }
    ];
    
    const newPlayers: [TeamPlayerRef, TeamPlayerRef] = [...currentPlayers] as [TeamPlayerRef, TeamPlayerRef];
    newPlayers[playerIndex] = { id: profile.id, name: profile.name };
    
    setTeamPlayers(teamId, newPlayers);
    onClose();
  };

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className={`${bgColor} border ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'} rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-6 border-b border-inherit">
          <h2 className="text-xl font-bold uppercase tracking-widest">Select Player</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {profiles.length === 0 ? (
            <div className="text-center opacity-50 py-8 px-4 font-bold">
              No profiles found. Open the "Players" menu at the bottom to build your roster first!
            </div>
          ) : (
            profiles.map(profile => {
              // NEW: Check if this specific profile is already on the court
              const isAlreadySelected = currentlyOnCourtIds.includes(profile.id);

              return (
                <button
                  key={profile.id}
                  onClick={() => !isAlreadySelected && handleSelect(profile)}
                  disabled={isAlreadySelected}
                  className={`w-full flex items-center justify-between gap-4 ${panelColor} border rounded-xl p-4 transition-transform text-left ${isAlreadySelected ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isAlreadySelected ? 'bg-slate-500/20 text-slate-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                      <User size={24} />
                    </div>
                    <div>
                      <div className="font-black text-xl tracking-wide uppercase">{profile.name}</div>
                      <div className="text-sm opacity-60 font-bold mt-1">
                        Win Rate: {profile.stats.matchesPlayed > 0 ? Math.round((profile.stats.wins / profile.stats.matchesPlayed) * 100) : 0}%
                      </div>
                    </div>
                  </div>

                  {/* NEW: Sleek badge showing they are already taken */}
                  {isAlreadySelected && (
                    <div className="flex flex-col items-center justify-center bg-slate-800 text-slate-400 px-3 py-1 rounded-lg border border-slate-700">
                      <span className="text-[10px] font-black tracking-widest uppercase">On Court</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}