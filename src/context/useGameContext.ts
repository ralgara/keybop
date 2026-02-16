import { useContext } from 'react';
import { GameContext, type GameContextValue } from './gameContextDef';

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within GameContextProvider');
  return ctx;
}
