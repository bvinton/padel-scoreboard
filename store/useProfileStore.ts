import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. Define exactly what stats we track for every player
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

// 2. Define the Player Profile structure
export interface PlayerProfile {
  id: string;
  name: string;
  themeColor: string; // E.g., 'emerald', 'orange', 'cyan', 'rose'
  stats: PlayerStats;
}

// 3. Define the actions we can take on the database
interface ProfileState {
  profiles: PlayerProfile[];
  addProfile: (name: string, themeColor?: string) => void;
  updateProfile: (id: string, updates: Partial<PlayerProfile>) => void;
  deleteProfile: (id: string) => void;
}

// 4. Create the actual database
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profiles: [],
      
      // Function to create a brand new player from scratch
      addProfile: (name, themeColor = 'emerald') => set((state) => {
        const newProfile: PlayerProfile = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // Generates a unique ID
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

      // Function to edit a player (like changing their name or color)
      updateProfile: (id, updates) => set((state) => ({
        profiles: state.profiles.map(profile => 
          profile.id === id ? { ...profile, ...updates } : profile
        )
      })),

      // Function to permanently delete a player
      deleteProfile: (id) => set((state) => ({
        profiles: state.profiles.filter(profile => profile.id !== id)
      })),
    }),
    {
      // This is the magic part: it automatically saves this database to your tablet's memory
      name: 'padel-player-profiles', 
    }
  )
);