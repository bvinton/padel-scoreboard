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

  const handleSelect = (profile: { id: string, name: string }) => {
    // 1. Get current team data
    const teamData = teamId === 'team1' ? team1 : team2;
    
    // 2. If no players are set yet, create a placeholder array so we don't overwrite the other slot with null
    const currentPlayers = teamData.players || [
      { id: `temp-${teamId}-0`, name: 'PLAYER 1' },
      { id: `temp-${teamId}-1`, name: 'PLAYER 2' }
    ];
    
    // 3. Clone array and inject the chosen profile into the correct slot
    const newPlayers: [TeamPlayerRef, TeamPlayerRef] = [...currentPlayers] as [TeamPlayerRef, TeamPlayerRef];
    newPlayers[playerIndex] = { id: profile.id, name: profile.name };
    
    // 4. Save to match store and close
    setTeamPlayers(teamId, newPlayers);
    onClose();
  };

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-slate-800 border-slate-700 hover:bg-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className={`${bgColor} border ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'} rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl`} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-inherit">
          <h2 className="text-xl font-bold uppercase tracking-widest">Select Player</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Profile List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {profiles.length === 0 ? (
            <div className="text-center opacity-50 py-8 px-4 font-bold">
              No profiles found. Open the "Players" menu at the bottom to build your roster first!
            </div>
          ) : (
            profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className={`w-full flex items-center gap-4 ${panelColor} border rounded-xl p-4 transition-transform active:scale-95 text-left`}
              >
                <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-500">
                  <User size={24} />
                </div>
                <div>
                  <div className="font-black text-xl tracking-wide uppercase">{profile.name}</div>
                  <div className="text-sm opacity-60 font-bold mt-1">
                    Win Rate: {profile.stats.matchesPlayed > 0 ? Math.round((profile.stats.wins / profile.stats.matchesPlayed) * 100) : 0}%
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
}