import type { GameState } from '../types/game';
import type { KeyMapping } from '../types/input';
import { useGameContext } from '../context/useGameContext';

export function useGameState(): GameState {
  return useGameContext().state;
}

export function useKeyMap(): KeyMapping {
  return useGameContext().state.keyMap;
}
