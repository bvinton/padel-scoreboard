// Required Zustand Store Structure
interface PadelState {
  // Game Settings
  useGoldenPoint: boolean;
  
  // Current Score State
  server: 'team1' | 'team2';
  isTiebreak: boolean;
  team1: {
    name: string;
    points: string | number; // e.g., "0", "15", "30", "40", "Ad", or int for tiebreak
    games: number;
    sets: number;
  };
  team2: {
    name: string;
    points: string | number;
    games: number;
    sets: number;
  };
  
  // History for Undo Functionality
  // Push a deep clone of the state to this array before applying any point changes
  history: Omit<PadelState, 'history' | 'undo' | 'scorePoint'>[];
  
  // Actions
  scorePoint: (team: 'team1' | 'team2') => void;
  undo: () => void;
  toggleGoldenPoint: () => void;
  resetMatch: () => void;
}