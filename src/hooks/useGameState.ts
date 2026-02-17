import { useContext } from 'react';
import { GameContext } from '../context/gameContextValue.ts';

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameContextProvider');
  return ctx;
}
