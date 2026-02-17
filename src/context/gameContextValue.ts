import { createContext } from 'react';
import type { GameState } from '../types/index.ts';
import type { GameAction } from './actions.ts';

export const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);
