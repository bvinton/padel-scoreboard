import React, { useState } from 'react';
import { useProfileStore } from '../../store/useProfileStore';
import { X, Trash2, UserPlus, ChevronLeft } from 'lucide-react';

interface PlayerRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOutdoorMode: boolean;
}

export default function PlayerRosterModal({ isOpen, onClose, isOutdoorMode }: PlayerRosterModalProps) {
  const { profiles, addProfile, deleteProfile } = useProfileStore();
  const [newName, setNewName] = useState('');
  
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  if (!isOpen) {
    if (selectedProfileId) setSelectedProfileId(null);
    return null;
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addProfile(newName.trim());
      setNewName('');
    }
  };

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700';

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className={`${bgColor} border ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'} rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden`}>
        
        <div className="flex justify-between items-center p-6 border-b border-inherit bg-black/5 dark:bg-white/5">
          {selectedProfile ? (
            <button 
              onClick={() => setSelectedProfileId(null)}
              className="flex items-center gap-2 font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <ChevronLeft size={24} /> Back to Roster
            </button>
          ) : (
            <h2 className="text-2xl font-bold">Player Roster</h2>
          )}
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={28} />
          </button>
        </div>

        {!selectedProfile && (
          <>
            <form onSubmit={handleAdd} className="p-6 border-b border-inherit flex gap-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new player name..."
                className={`flex-grow px-4 py-3 rounded-xl border ${isOutdoorMode ? 'bg-white border-gray-300 text-black' : 'bg-slate-950 border-slate-700 text-white'} focus:outline-none focus:border-emerald-500 text-lg`}
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                <UserPlus size={24} />
                Add
              </button>
            </form>

            <div className="flex-grow overflow-y-auto p-6 space-y-3">
              {profiles.length === 0 ? (
                <div className="text-center opacity-50 py-8 text-lg">No players added yet.</div>
              ) : (
                profiles.map(profile => (
                  <div 
                    key={profile.id} 
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`${panelColor} border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-emerald-500/50 transition-all active:scale-[0.98]`}
                  >
                    <div>
                      <h3 className="text-xl font-bold mb-1">{profile.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 opacity-70 text-sm font-medium">
                        <span>Matches: {profile.stats.matchesPlayed}</span>
                        <span>Wins: {profile.stats.wins}</span>
                        <span>Win Rate: {profile.stats.matchesPlayed > 0 ? Math.round((profile.stats.wins / profile.stats.matchesPlayed) * 100) : 0}%</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${profile.name} and all their stats?`)) {
                          deleteProfile(profile.id);
                        }
                      }}
                      className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {selectedProfile && (
          <div className="flex-grow overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6 border-b border-inherit pb-4">
              <h3 className="text-3xl font-black uppercase tracking-wide">{selectedProfile.name}</h3>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedProfile.name} and all their stats?`)) {
                    deleteProfile(selectedProfile.id);
                    setSelectedProfileId(null);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
              >
                <Trash2 size={20} /> Delete Player
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <div className="text-xs uppercase opacity-60 font-bold mb-1">Matches / Wins</div>
                <div className="text-2xl font-black">{selectedProfile.stats.matchesPlayed} <span className="text-lg opacity-60 font-medium">/ {selectedProfile.stats.wins}</span></div>
                <div className="text-sm text-emerald-500 font-bold mt-2">
                  {selectedProfile.stats.matchesPlayed > 0 ? Math.round((selectedProfile.stats.wins / selectedProfile.stats.matchesPlayed) * 100) : 0}% Win Rate
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <div className="text-xs uppercase opacity-60 font-bold mb-1">Win Streaks</div>
                <div className="text-2xl font-black">{selectedProfile.stats.currentWinningStreak} 🔥</div>
                <div className="text-sm opacity-60 font-bold mt-2">All-Time Best: {selectedProfile.stats.longestWinningStreak}</div>
              </div>

              <div className={`p-4 rounded-xl ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <div className="text-xs uppercase opacity-60 font-bold mb-1">Sets / Games</div>
                <div className="text-2xl font-black">{selectedProfile.stats.setsWon} <span className="text-lg opacity-60 font-medium">/ {selectedProfile.stats.gamesWon}</span></div>
              </div>

              <div className={`p-4 rounded-xl ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <div className="text-xs uppercase opacity-60 font-bold mb-1">Total Points</div>
                <div className="text-2xl font-black">{selectedProfile.stats.totalPointsWon}</div>
              </div>

              {/* NEW: Displays the Service Holds and Breaks! */}
              <div className={`p-4 rounded-xl ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <div className="text-xs uppercase opacity-60 font-bold mb-1">Holds / Breaks</div>
                <div className="text-2xl font-black">{selectedProfile.stats.serviceGamesWon} <span className="text-lg opacity-60 font-medium">/ {selectedProfile.stats.breaksWon}</span></div>
              </div>

              <div className={`p-4 rounded-xl ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                <div className="text-xs uppercase opacity-60 font-bold mb-1">Court Time</div>
                <div className="text-2xl font-black">{selectedProfile.stats.totalMatchTimeMinutes} <span className="text-lg opacity-60 font-medium">mins</span></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}