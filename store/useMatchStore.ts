import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TeamKey = 'team1' | 'team2';
type Server = TeamKey;
type StandardPoint = '0' | '15' | '30' | '40' | 'Ad';
export type Language = 'en' | 'es';
export type MatchFormat = 'bestOf3' | 'bestOf5' | 'proSet' | 'superTiebreak';

export interface TeamPlayerRef {
  id: string;
  name: string;
}

interface TeamState {
  name: string;
  points: string | number;
  games: number;
  sets: number;
  players: [TeamPlayerRef, TeamPlayerRef] | null;
  serverIndex: 0 | 1; 
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface MatchStatsTracker {
  startTime: number | null;
  team1: { totalPoints: number; serviceGamesWon: number; breaksWon: number };
  team2: { totalPoints: number; serviceGamesWon: number; breaksWon: number };
}

export interface PadelState {
  useGoldenPoint: boolean;
  matchFormat: MatchFormat; 
  matchType: 'singles' | 'doubles';
  umpireEnabled: boolean;
  isOutdoorMode: boolean; 

  language: Language;
  hasSelectedLanguage: boolean;

  isSetupComplete: boolean;
  initialServerDecided: boolean;
  
  server: Server;
  isTiebreak: boolean;
  
  matchAnnouncement: { title: string; subtitle: string } | null;
  
  matchWinner: { key: TeamKey; name: string } | null; 
  matchWinnerDismissed: boolean;
  
  team1: TeamState;
  team2: TeamState;
  
  matchStats: MatchStatsTracker;

  setScores: SetScore[];
  history: PadelStateSnapshot[];

  scorePoint: (team: TeamKey) => void;
  undo: () => void;
  toggleGoldenPoint: () => void;
  toggleServer: () => void;
  setInitialServer: (team: TeamKey) => void; 
  completeSetup: () => void; 
  forceNewMatchState: () => void; 
  clearAnnouncement: () => void; 
  setMatchFormat: (format: MatchFormat) => void; 
  toggleMatchType: () => void;
  toggleUmpire: () => void;
  toggleOutdoorMode: () => void;
  setLanguage: (lang: Language) => void;
  setTeamName: (team: TeamKey, name: string) => void;
  setTeamPlayers: (team: TeamKey, players: [TeamPlayerRef, TeamPlayerRef] | null) => void;
  clearAllPlayers: () => void; 
  resetMatch: () => void;
}

export type PadelStateSnapshot = Omit<
  PadelState,
  'history' | 'undo' | 'scorePoint' | 'toggleGoldenPoint' | 'toggleServer' | 'setMatchFormat' | 'resetMatch' | 'toggleUmpire' | 'setLanguage' | 'setTeamName' | 'toggleOutdoorMode' | 'setTeamPlayers' | 'toggleMatchType' | 'clearAllPlayers' | 'setInitialServer' | 'completeSetup' | 'forceNewMatchState' | 'clearAnnouncement'
>;

const STANDARD_POINTS: StandardPoint[] = ['0', '15', '30', '40', 'Ad'];
const getOppositeTeam = (team: TeamKey): TeamKey => team === 'team1' ? 'team2' : 'team1';

const createInitialTeamState = (name: string): TeamState => ({ 
  name, points: '0', games: 0, sets: 0, players: null, serverIndex: 0 
});

const createInitialState = (): Omit<PadelState, 'history' | 'undo' | 'scorePoint' | 'toggleGoldenPoint' | 'toggleServer' | 'setMatchFormat' | 'resetMatch' | 'toggleUmpire' | 'setLanguage' | 'setTeamName' | 'toggleOutdoorMode' | 'setTeamPlayers' | 'toggleMatchType' | 'clearAllPlayers' | 'setInitialServer' | 'completeSetup' | 'forceNewMatchState' | 'clearAnnouncement'> => ({
  useGoldenPoint: true,
  matchFormat: 'bestOf3', 
  matchType: 'doubles',
  umpireEnabled: false,
  isOutdoorMode: false, 
  language: 'en', 
  hasSelectedLanguage: false, 
  isSetupComplete: false, 
  initialServerDecided: false, 
  server: 'team1',
  isTiebreak: false,
  matchAnnouncement: null, 
  matchWinner: null,
  matchWinnerDismissed: false,
  team1: createInitialTeamState('Team 1'),
  team2: createInitialTeamState('Team 2'),
  setScores: [], 
  matchStats: {
    startTime: null,
    team1: { totalPoints: 0, serviceGamesWon: 0, breaksWon: 0 },
    team2: { totalPoints: 0, serviceGamesWon: 0, breaksWon: 0 }
  }
});

const cloneSnapshot = (state: PadelState): PadelStateSnapshot => {
  const { history, scorePoint, undo, toggleGoldenPoint, toggleServer, setMatchFormat, resetMatch, toggleUmpire, setLanguage, setTeamName, toggleOutdoorMode, setTeamPlayers, toggleMatchType, clearAllPlayers, setInitialServer, completeSetup, forceNewMatchState, clearAnnouncement, ...rest } = state;
  return JSON.parse(JSON.stringify(rest)) as PadelStateSnapshot;
};

const applyGameWin = (state: PadelState, winner: TeamKey): void => {
  const loser = getOppositeTeam(winner);
  const winnerTeam = state[winner];
  const loserTeam = state[loser];

  if (state.server === winner) {
    state.matchStats[winner].serviceGamesWon += 1;
  } else {
    state.matchStats[winner].breaksWon += 1;
  }

  winnerTeam.games += 1;
  winnerTeam.points = '0';
  loserTeam.points = '0';
  
  const oldServer = state.server;
  state.server = getOppositeTeam(state.server);
  state[oldServer].serverIndex = state[oldServer].serverIndex === 0 ? 1 : 0;

  const gamesDiff = winnerTeam.games - loserTeam.games;
  let wonSet = false;
  
  const targetGames = state.matchFormat === 'proSet' ? 8 : 6;

  if (!state.isTiebreak && winnerTeam.games >= targetGames && gamesDiff >= 2) {
    winnerTeam.sets += 1;
    wonSet = true;
  }

  if (!state.isTiebreak && state.team1.games === targetGames && state.team2.games === targetGames) {
    state.isTiebreak = true;
    const isEs = state.language === 'es';
    
    // FIXED: Corrected Tiebreak text to First to 7 instead of Swap Sides!
    state.matchAnnouncement = {
      title: "Tiebreak",
      subtitle: isEs ? "A 7 puntos" : "First to 7"
    };

    state.team1.points = 0;
    state.team2.points = 0;
    return;
  }

  if (state.isTiebreak) {
    winnerTeam.sets += 1;
    wonSet = true;
  }

  if (wonSet) {
    state.setScores.push({ team1: state.team1.games, team2: state.team2.games });
    state.isTiebreak = false;
    state.team1.games = 0;
    state.team2.games = 0;
    state.team1.points = '0';
    state.team2.points = '0';

    if (!state.matchWinner) {
      let setsNeeded = 2; 
      if (state.matchFormat === 'bestOf5') setsNeeded = 3;
      if (state.matchFormat === 'proSet') setsNeeded = 1;

      const isEs = state.language === 'es';
      let winName = winnerTeam.name;
      if (winnerTeam.players) {
         winName = state.matchType === 'singles' 
           ? winnerTeam.players[0].name 
           : `${winnerTeam.players[0].name} ${isEs ? 'y' : 'and'} ${winnerTeam.players[1].name}`;
      }

      if (winnerTeam.sets >= setsNeeded) {
        state.matchWinner = { key: winner, name: winName };
        state.matchWinnerDismissed = false;
      } else {
        const setNum = state.team1.sets + state.team2.sets;
        state.matchAnnouncement = {
          title: isEs ? `Set ${setNum} para\n${winName}` : `Set ${setNum} Winner\n${winName}`,
          subtitle: isEs ? "Cambio de lado" : "Swap Sides"
        };

        if (state.matchFormat === 'superTiebreak' && state.team1.sets === 1 && state.team2.sets === 1) {
          state.isTiebreak = true;
          state.matchAnnouncement = {
            title: "Super Tiebreak",
            subtitle: isEs ? "¡A 10 puntos!" : "First to 10"
          };
        }
      }
    }
  }
};

const handleStandardPoint = (state: PadelState, scoringTeamKey: TeamKey): void => {
  const otherTeamKey = getOppositeTeam(scoringTeamKey);
  const scoringTeam = state[scoringTeamKey];
  const otherTeam = state[otherTeamKey];
  const scoringPoints = scoringTeam.points as StandardPoint;
  const otherPoints = otherTeam.points as StandardPoint;
  const isDeuce = scoringPoints === '40' && otherPoints === '40';

  if (state.useGoldenPoint && isDeuce) { applyGameWin(state, scoringTeamKey); return; }

  if (!state.useGoldenPoint) {
    if (isDeuce) { scoringTeam.points = 'Ad'; otherTeam.points = '40'; return; }
    if (scoringPoints === 'Ad') { applyGameWin(state, scoringTeamKey); return; }
    if (otherPoints === 'Ad') { scoringTeam.points = '40'; otherTeam.points = '40'; return; }
  }

  const currentIndex = STANDARD_POINTS.indexOf(scoringPoints);
  if (currentIndex === -1) { scoringTeam.points = '0'; return; }

  if (scoringPoints === '40' && (otherPoints === '0' || otherPoints === '15' || otherPoints === '30')) {
    applyGameWin(state, scoringTeamKey);
    return;
  }

  const nextIndex = Math.min(currentIndex + 1, STANDARD_POINTS.length - 1);
  scoringTeam.points = STANDARD_POINTS[nextIndex];
};

const handleTiebreakPoint = (state: PadelState, scoringTeamKey: TeamKey): void => {
  const otherTeamKey = getOppositeTeam(scoringTeamKey);
  const scoringTeam = state[scoringTeamKey];
  const otherTeam = state[otherTeamKey];
  const scoringPoints = Number(scoringTeam.points || 0);
  const otherPoints = Number(otherTeam.points || 0);
  
  scoringTeam.points = scoringPoints + 1;
  const totalPointsAfter = (scoringPoints + 1) + otherPoints;

  if (totalPointsAfter === 1 || (totalPointsAfter > 1 && totalPointsAfter % 2 === 1)) {
    const oldServer = state.server;
    state.server = getOppositeTeam(state.server);
    state[oldServer].serverIndex = state[oldServer].serverIndex === 0 ? 1 : 0;
  }

  const targetPoints = (state.matchFormat === 'superTiebreak' && state.team1.sets === 1 && state.team2.sets === 1) ? 10 : 7;
  const pointsDiff = (scoringPoints + 1) - otherPoints;

  if ((scoringPoints + 1) >= targetPoints && pointsDiff >= 2) {
    applyGameWin(state, scoringTeamKey);
  }
};

export const useMatchStore = create<PadelState>()(
  persist(
    (set, get) => {
      const initialState = createInitialState();

      return {
        ...initialState,
        history: [], 
        completeSetup: () => set({ isSetupComplete: true }),
        forceNewMatchState: () => set({ isSetupComplete: false, initialServerDecided: false }), 
        clearAnnouncement: () => set({ matchAnnouncement: null }), 
        setInitialServer: (team: TeamKey) => set({
          server: team,
          initialServerDecided: true
        }),
        scorePoint: (team: TeamKey) => {
          const currentState = get();
          
          if (currentState.matchAnnouncement) {
            set({ matchAnnouncement: null });
          }

          if (currentState.matchWinner && !currentState.matchWinnerDismissed) {
            set({ matchWinnerDismissed: true });
            return; 
          }
          
          const snapshot = cloneSnapshot(currentState);
          set((state) => {
            const nextState = JSON.parse(JSON.stringify(state)) as PadelState;
            nextState.history = [...state.history, snapshot];
            nextState.matchStats[team].totalPoints += 1;
            if (nextState.matchStats.startTime === null) nextState.matchStats.startTime = Date.now();
            if (nextState.isTiebreak) handleTiebreakPoint(nextState, team);
            else handleStandardPoint(nextState, team);
            return nextState;
          });
        },
        toggleServer: () => set((state) => ({ server: state.server === 'team1' ? 'team2' : 'team1' })),
        setMatchFormat: (format: MatchFormat) => set({ matchFormat: format }),
        toggleMatchType: () => set((state) => ({ matchType: state.matchType === 'doubles' ? 'singles' : 'doubles' })),
        toggleUmpire: () => set((state) => ({ umpireEnabled: !state.umpireEnabled })),
        setLanguage: (lang: Language) => set({ language: lang, hasSelectedLanguage: true }), 
        toggleOutdoorMode: () => set((state) => ({ isOutdoorMode: !state.isOutdoorMode })),
        setTeamName: (team: TeamKey, name: string) => set((state) => ({ [team]: { ...state[team], name } })),
        setTeamPlayers: (team: TeamKey, players) => set((state) => ({ [team]: { ...state[team], players } })),
        clearAllPlayers: () => set((state) => ({ team1: { ...state.team1, players: null }, team2: { ...state.team2, players: null } })),
        undo: () => {
          const { history, initialServerDecided, team1, team2, matchAnnouncement } = get();
          
          if (matchAnnouncement) {
            set({ matchAnnouncement: null });
          }

          if (history.length === 0) {
            if (initialServerDecided && team1.points === '0' && team2.points === '0' && team1.games === 0 && team2.games === 0 && team1.sets === 0 && team2.sets === 0) {
              set({ initialServerDecided: false });
            }
            return;
          }
          const previous = history[history.length - 1];
          set((state) => ({ ...(JSON.parse(JSON.stringify(previous)) as PadelStateSnapshot), history: state.history.slice(0, -1) }));
        },
        toggleGoldenPoint: () => set((state) => ({ useGoldenPoint: !state.useGoldenPoint })),
        resetMatch: () => {
          const { useGoldenPoint, umpireEnabled, language, hasSelectedLanguage, isOutdoorMode, team1, team2, matchType } = get();
          const base = createInitialState();
          set({
            ...base,
            history: [], useGoldenPoint, umpireEnabled, language, hasSelectedLanguage, isOutdoorMode, matchType,
            team1: { ...base.team1, name: team1.name, players: team1.players },
            team2: { ...base.team2, name: team2.name, players: team2.players },
          });
        },
      };
    },
    { name: 'padel-match-storage' }
  )
);