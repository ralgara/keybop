import { useReducer, type ReactNode } from 'react';
import type { GameState } from '../types/index.ts';
import type { GameAction } from './actions.ts';
import { GameContext } from './gameContextValue.ts';
import { loadKeyMap } from '../data/defaultKeyMap.ts';
import { getAvailableSequences } from '../data/sequenceLoader.ts';
import { SPEED_MULTIPLIERS } from '../engine/constants.ts';

const initialScore = {
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
    speedMultiplier: SPEED_MULTIPLIERS.NORMAL,
    leadTimeMs: 2000,
  },
  score: initialScore,
  keyMap: loadKeyMap(),
  availableSequences: getAvailableSequences(),
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_SEQUENCE':
      return { ...state, selectedSequence: action.sequence };
    case 'START_GAME':
      return { ...state, status: 'playing', score: initialScore };
    case 'PAUSE_GAME':
      return { ...state, status: 'paused' };
    case 'RESUME_GAME':
      return { ...state, status: 'playing' };
    case 'FINISH_GAME':
      return { ...state, status: 'finished', score: action.score };
    case 'UPDATE_SCORE':
      return { ...state, score: action.score };
    case 'RETURN_TO_MENU':
      return { ...state, status: 'menu', score: initialScore };
    case 'SET_KEY_MAP':
      return { ...state, keyMap: action.keyMap };
    case 'SET_SPEED':
      return {
        ...state,
        config: { ...state.config, speedMultiplier: action.speed },
      };
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
