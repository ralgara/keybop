import type { Sequence, ScoreSnapshot, KeyMapping } from '../types/index.ts';

export type GameAction =
  | { type: 'SELECT_SEQUENCE'; sequence: Sequence }
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'FINISH_GAME'; score: ScoreSnapshot }
  | { type: 'UPDATE_SCORE'; score: ScoreSnapshot }
  | { type: 'RETURN_TO_MENU' }
  | { type: 'SET_KEY_MAP'; keyMap: KeyMapping }
  | { type: 'SET_SPEED'; speed: number };
