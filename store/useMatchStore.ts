import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type TeamKey = 'team1' | 'team2';
type Server = TeamKey;
type StandardPoint = '0' | '15' | '30' | '40' | 'Ad';
export type Language = 'en' | 'es';

interface TeamState {
  name: string;
  points: string | number;
  games: number;
  sets: number;
}

export interface SetScore {
  team1: number;
  team2: number;
}

export interface PadelState {
  useGoldenPoint: boolean;
  matchFormat: 3 | 5; 
  umpireEnabled: boolean;
  isOutdoorMode: boolean; 

  // Global Language State
  language: Language;
  hasSelectedLanguage: boolean;

  server: Server;
  isTiebreak: boolean;
  matchWinner: TeamKey | null; 
  matchWinnerDismissed: boolean;
  
  team1: TeamState;
  team2: TeamState;

  setScores: SetScore[];
  history: PadelStateSnapshot[];

  scorePoint: (team: TeamKey) => void;
  undo: () => void;
  toggleGoldenPoint: () => void;
  toggleServer: () => void;
  setMatchFormat: (format: 3 | 5) => void; 
  toggleUmpire: () => void;
  toggleOutdoorMode: () => void;
  
  // Language Action
  setLanguage: (lang: Language) => void;
  
  setTeamName: (team: TeamKey, name: string) => void;
  resetMatch: () => void;
}

export type PadelStateSnapshot = Omit<
  PadelState,
  'history' | 'undo' | 'scorePoint' | 'toggleGoldenPoint' | 'toggleServer' | 'setMatchFormat' | 'resetMatch' | 'toggleUmpire' | 'setLanguage' | 'setTeamName' | 'toggleOutdoorMode'
>;

const STANDARD_POINTS: StandardPoint[] = ['0', '15', '30', '40', 'Ad'];

const getOppositeTeam = (team: TeamKey): TeamKey => team === 'team1' ? 'team2' : 'team1';

const createInitialTeamState = (name: string): TeamState => ({
  name,
  points: '0',
  games: 0,
  sets: 0,
});

const createInitialState = (): Omit<PadelState, 'history' | 'undo' | 'scorePoint' | 'toggleGoldenPoint' | 'toggleServer' | 'setMatchFormat' | 'resetMatch' | 'toggleUmpire' | 'setLanguage' | 'setTeamName' | 'toggleOutdoorMode'> => ({
  useGoldenPoint: true,
  matchFormat: 3,
  umpireEnabled: false,
  isOutdoorMode: false, 
  language: 'en', // Default fallback
  hasSelectedLanguage: false, // Forces the initial popup
  server: 'team1',
  isTiebreak: false,
  matchWinner: null,
  matchWinnerDismissed: false,
  team1: createInitialTeamState('Team 1'),
  team2: createInitialTeamState('Team 2'),
  setScores: [], 
});

const cloneSnapshot = (state: PadelState): PadelStateSnapshot => {
  const { history, scorePoint, undo, toggleGoldenPoint, toggleServer, setMatchFormat, resetMatch, toggleUmpire, setLanguage, setTeamName, toggleOutdoorMode, ...rest } = state;
  return JSON.parse(JSON.stringify(rest)) as PadelStateSnapshot;
};

const applyGameWin = (state: PadelState, winner: TeamKey): void => {
  const loser = getOppositeTeam(winner);
  const winnerTeam = state[winner];
  const loserTeam = state[loser];

  winnerTeam.games += 1;
  winnerTeam.points = '0';
  loserTeam.points = '0';
  state.server = getOppositeTeam(state.server);

  const gamesDiff = winnerTeam.games - loserTeam.games;
  let wonSet = false;

  if (!state.isTiebreak && winnerTeam.games >= 6 && gamesDiff >= 2) {
    winnerTeam.sets += 1;
    wonSet = true;
  }

  if (!state.isTiebreak && state.team1.games === 6 && state.team2.games === 6) {
    state.isTiebreak = true;
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
      const setsNeeded = state.matchFormat === 3 ? 2 : 3;
      if (winnerTeam.sets >= setsNeeded) {
        state.matchWinner = winner;
        state.matchWinnerDismissed = false;
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
  const totalPointsBefore = scoringPoints + otherPoints;
  const newScoringPoints = scoringPoints + 1;
  const totalPointsAfter = totalPointsBefore + 1;

  scoringTeam.points = newScoringPoints;

  if (totalPointsAfter === 1 || (totalPointsAfter > 1 && totalPointsAfter % 2 === 1)) {
    state.server = getOppositeTeam(state.server);
  }

  const pointsDiff = newScoringPoints - otherPoints;
  if (newScoringPoints >= 7 && pointsDiff >= 2) {
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
        scorePoint: (team: TeamKey) => {
          const currentState = get();
          if (currentState.matchWinner && !currentState.matchWinnerDismissed) {
            set({ matchWinnerDismissed: true });
            return; 
          }
          const snapshot = cloneSnapshot(currentState);
          set((state) => {
            const nextState = JSON.parse(JSON.stringify(state)) as PadelState;
            nextState.history = [...state.history, snapshot];
            if (nextState.isTiebreak) handleTiebreakPoint(nextState, team);
            else handleStandardPoint(nextState, team);
            return nextState;
          });
        },
        toggleServer: () => set((state) => ({ server: state.server === 'team1' ? 'team2' : 'team1' })),
        setMatchFormat: (format: 3 | 5) => set({ matchFormat: format }),
        toggleUmpire: () => set((state) => ({ umpireEnabled: !state.umpireEnabled })),
        setLanguage: (lang: Language) => set({ language: lang, hasSelectedLanguage: true }), 
        toggleOutdoorMode: () => set((state) => ({ isOutdoorMode: !state.isOutdoorMode })),
        setTeamName: (team: TeamKey, name: string) => set((state) => ({ [team]: { ...state[team], name } })),
        undo: () => {
          const { history } = get();
          if (history.length === 0) return;
          const previous = history[history.length - 1];
          set((state) => ({
            ...(JSON.parse(JSON.stringify(previous)) as PadelStateSnapshot),
            history: state.history.slice(0, -1),
          }));
        },
        toggleGoldenPoint: () => set((state) => ({ useGoldenPoint: !state.useGoldenPoint })),
        resetMatch: () => {
          const { useGoldenPoint, matchFormat, umpireEnabled, language, hasSelectedLanguage, isOutdoorMode, team1, team2 } = get();
          const base = createInitialState();
          set({
            ...base,
            history: [], 
            useGoldenPoint,
            matchFormat, 
            umpireEnabled,
            language, 
            hasSelectedLanguage, 
            isOutdoorMode, 
            team1: { ...base.team1, name: team1.name },
            team2: { ...base.team2, name: team2.name },
          });
        },
      };
    },
    { name: 'padel-match-storage' }
  )
);