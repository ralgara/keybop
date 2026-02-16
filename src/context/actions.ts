import type { Sequence, SequenceMetadata } from '../types/sequence';
import type { KeyMapping } from '../types/input';
import type { ScoreSnapshot } from '../types/scoring';
import type { GameStatus } from '../types/game';

export type GameAction =
  | { type: 'SET_STATUS'; status: GameStatus }
  | { type: 'SELECT_SEQUENCE'; sequence: Sequence }
  | { type: 'SET_AVAILABLE_SEQUENCES'; sequences: SequenceMetadata[] }
  | { type: 'UPDATE_SCORE'; score: ScoreSnapshot }
  | { type: 'SET_KEY_MAP'; keyMap: KeyMapping }
  | { type: 'SET_SPEED'; speedMultiplier: number }
  | { type: 'RESET_SCORE' };
