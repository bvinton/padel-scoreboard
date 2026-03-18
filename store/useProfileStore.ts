import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalPointsWon: number;
  gamesWon: number;
  setsWon: number;
  breakPointsWon: number;
  totalMatchTimeMinutes: number;
  currentWinningStreak: number;
  longestWinningStreak: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  themeColor: string; 
  stats: PlayerStats;
}

interface ProfileState {
  profiles: PlayerProfile[];
  addProfile: (name: string, themeColor?: string) => void;
  updateProfile: (id: string, updates: Partial<PlayerProfile>) => void;
  deleteProfile: (id: string) => void;
  // NEW: The function that does all the heavy math when a match ends
  recordMatchResult: (winningPlayerIds: string[], losingPlayerIds: string[]) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      
      addProfile: (name, themeColor = 'emerald') => set((state) => {
        const newProfile: PlayerProfile = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          name,
          themeColor,
          stats: {
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            totalPointsWon: 0,
            gamesWon: 0,
            setsWon: 0,
            breakPointsWon: 0,
            totalMatchTimeMinutes: 0,
            currentWinningStreak: 0,
            longestWinningStreak: 0,
          }
        };
        return { profiles: [...state.profiles, newProfile] };
      }),

      updateProfile: (id, updates) => set((state) => ({
        profiles: state.profiles.map(profile => 
          profile.id === id ? { ...profile, ...updates } : profile
        )
      })),

      deleteProfile: (id) => set((state) => ({
        profiles: state.profiles.filter(profile => profile.id !== id)
      })),

      // NEW: Automatically calculates wins, losses, and streaks!
      recordMatchResult: (winningPlayerIds, losingPlayerIds) => set((state) => ({
        profiles: state.profiles.map(profile => {
          const isWinner = winningPlayerIds.includes(profile.id);
          const isLoser = losingPlayerIds.includes(profile.id);

          // If they didn't play in this match, don't change their stats
          if (!isWinner && !isLoser) return profile;

          const newMatchesPlayed = profile.stats.matchesPlayed + 1;
          const newWins = isWinner ? profile.stats.wins + 1 : profile.stats.wins;
          const newLosses = isLoser ? profile.stats.losses + 1 : profile.stats.losses;
          
          // Streak logic
          const newStreak = isWinner ? profile.stats.currentWinningStreak + 1 : 0;
          const newLongestStreak = Math.max(profile.stats.longestWinningStreak, newStreak);

          return {
            ...profile,
            stats: {
              ...profile.stats,
              matchesPlayed: newMatchesPlayed,
              wins: newWins,
              losses: newLosses,
              currentWinningStreak: newStreak,
              longestWinningStreak: newLongestStreak
            }
          };
        })
      }))
    }),
    {
      name: 'padel-player-profiles', 
    }
  )
);