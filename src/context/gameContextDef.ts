import { createContext } from 'react';
import type { GameState } from '../types/game';
import type { GameAction } from './actions';

export interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);
