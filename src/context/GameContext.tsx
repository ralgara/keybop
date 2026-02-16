import { useReducer, type ReactNode } from 'react';
import type { GameState } from '../types/game';
import type { ScoreSnapshot } from '../types/scoring';
import type { GameAction } from './actions';
import { GameContext } from './gameContextDef';
import { loadKeyMap } from '../data/defaultKeyMap';
import { getAvailableSequences } from '../data/sequences';

const initialScore: ScoreSnapshot = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  perfectCount: 0,
  goodCount: 0,
  missCount: 0,
  totalNotes: 0,
};

const initialState: GameState = {
  status: 'menu',
  selectedSequence: null,
  config: {
    speedMultiplier: 1.0,
    leadTimeMs: 2000,
  },
  score: initialScore,
  keyMap: loadKeyMap(),
  availableSequences: getAvailableSequences(),
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SELECT_SEQUENCE':
      return { ...state, selectedSequence: action.sequence };
    case 'SET_AVAILABLE_SEQUENCES':
      return { ...state, availableSequences: action.sequences };
    case 'UPDATE_SCORE':
      return { ...state, score: action.score };
    case 'SET_KEY_MAP':
      return { ...state, keyMap: action.keyMap };
    case 'SET_SPEED':
      return { ...state, config: { ...state.config, speedMultiplier: action.speedMultiplier } };
    case 'RESET_SCORE':
      return { ...state, score: initialScore };
    default:
      return state;
  }
}

export function GameContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
