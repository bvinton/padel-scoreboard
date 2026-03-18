import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlayerStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalPointsWon: number;
  gamesWon: number;
  setsWon: number;
  serviceGamesWon: number; // NEW
  breaksWon: number;       // UPDATED
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

interface MatchRecordData {
  points: number;
  games: number;
  sets: number;
  serviceGames: number;
  breaks: number;
}

interface ProfileState {
  profiles: PlayerProfile[];
  addProfile: (name: string, themeColor?: string) => void;
  updateProfile: (id: string, updates: Partial<PlayerProfile>) => void;
  deleteProfile: (id: string) => void;
  // UPDATED: Now accepts full granular stats
  recordMatchResult: (
    winningTeamKey: 'team1' | 'team2',
    team1Ids: string[], team1Stats: MatchRecordData,
    team2Ids: string[], team2Stats: MatchRecordData,
    matchDurationMinutes: number
  ) => void;
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
            serviceGamesWon: 0,
            breaksWon: 0,
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

      recordMatchResult: (winningTeamKey, team1Ids, team1Stats, team2Ids, team2Stats, matchDurationMinutes) => set((state) => ({
        profiles: state.profiles.map(profile => {
          const inTeam1 = team1Ids.includes(profile.id);
          const inTeam2 = team2Ids.includes(profile.id);

          // If they didn't play, skip them
          if (!inTeam1 && !inTeam2) return profile;

          const isWinner = (inTeam1 && winningTeamKey === 'team1') || (inTeam2 && winningTeamKey === 'team2');
          const isLoser = !isWinner;
          const matchData = inTeam1 ? team1Stats : team2Stats;

          const newStreak = isWinner ? profile.stats.currentWinningStreak + 1 : 0;
          const newLongestStreak = Math.max(profile.stats.longestWinningStreak, newStreak);

          return {
            ...profile,
            stats: {
              ...profile.stats,
              matchesPlayed: profile.stats.matchesPlayed + 1,
              wins: isWinner ? profile.stats.wins + 1 : profile.stats.wins,
              losses: isLoser ? profile.stats.losses + 1 : profile.stats.losses,
              totalPointsWon: profile.stats.totalPointsWon + matchData.points,
              gamesWon: profile.stats.gamesWon + matchData.games,
              setsWon: profile.stats.setsWon + matchData.sets,
              serviceGamesWon: profile.stats.serviceGamesWon + matchData.serviceGames,
              breaksWon: profile.stats.breaksWon + matchData.breaks,
              totalMatchTimeMinutes: profile.stats.totalMatchTimeMinutes + matchDurationMinutes,
              currentWinningStreak: newStreak,
              longestWinningStreak: newLongestStreak
            }
          };
        })
      }))
    }),
    { name: 'padel-player-profiles' }
  )
);