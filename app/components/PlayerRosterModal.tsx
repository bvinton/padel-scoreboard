import React, { useState } from 'react';
import { useProfileStore } from '../../store/useProfileStore';
import { X, Trash2, UserPlus } from 'lucide-react';

interface PlayerRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOutdoorMode: boolean;
}

export default function PlayerRosterModal({ isOpen, onClose, isOutdoorMode }: PlayerRosterModalProps) {
  const { profiles, addProfile, deleteProfile } = useProfileStore();
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addProfile(newName.trim());
      setNewName('');
    }
  };

  const bgColor = isOutdoorMode ? 'bg-gray-100 text-black' : 'bg-slate-900 text-white';
  const panelColor = isOutdoorMode ? 'bg-white border-gray-300' : 'bg-slate-800 border-slate-700';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className={`${bgColor} border ${isOutdoorMode ? 'border-gray-300' : 'border-slate-700'} rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl`}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-inherit">
          <h2 className="text-2xl font-bold">Player Roster & Analytics</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Add Player Form */}
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
            Add Player
          </button>
        </form>

        {/* Player List & Advanced Stats */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {profiles.length === 0 ? (
            <div className="text-center opacity-50 py-8 text-lg">No players added yet.</div>
          ) : (
            profiles.map(profile => (
              <div key={profile.id} className={`${panelColor} border rounded-xl p-5 relative`}>
                
                {/* Name & Delete Button */}
                <div className="flex justify-between items-start mb-4 border-b border-inherit pb-4">
                  <h3 className="text-2xl font-black uppercase tracking-wide">{profile.name}</h3>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${profile.name} and all their stats?`)) {
                        deleteProfile(profile.id);
                      }
                    }}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>

                {/* Advanced Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  
                  <div className={`p-3 rounded-lg ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Matches / Wins</div>
                    <div className="text-xl font-black">{profile.stats.matchesPlayed} <span className="text-sm opacity-60 font-medium">/ {profile.stats.wins}</span></div>
                    <div className="text-xs text-emerald-500 font-bold mt-1">
                      {profile.stats.matchesPlayed > 0 ? Math.round((profile.stats.wins / profile.stats.matchesPlayed) * 100) : 0}% Win Rate
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Win Streaks</div>
                    <div className="text-xl font-black">{profile.stats.currentWinningStreak} 🔥</div>
                    <div className="text-xs opacity-60 font-bold mt-1">All-Time Best: {profile.stats.longestWinningStreak}</div>
                  </div>

                  <div className={`p-3 rounded-lg ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Sets / Games Won</div>
                    <div className="text-xl font-black">{profile.stats.setsWon} <span className="text-sm opacity-60 font-medium">/ {profile.stats.gamesWon}</span></div>
                  </div>

                  <div className={`p-3 rounded-lg ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Total Points</div>
                    <div className="text-xl font-black">{profile.stats.totalPointsWon}</div>
                    <div className="text-xs text-amber-500 font-bold mt-1">{profile.stats.breakPointsWon} Break Pts Won</div>
                  </div>

                  <div className={`p-3 rounded-lg ${isOutdoorMode ? 'bg-black/5' : 'bg-white/5'}`}>
                    <div className="text-[10px] uppercase opacity-60 font-bold mb-1">Total Court Time</div>
                    <div className="text-xl font-black">{profile.stats.totalMatchTimeMinutes} <span className="text-sm opacity-60 font-medium">mins</span></div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}