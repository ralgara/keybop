import type { ScoreSnapshot } from './scoring';
import type { KeyMapping } from './input';
import type { Sequence, SequenceMetadata } from './sequence';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'finished';

export interface GameConfig {
  speedMultiplier: number;
  leadTimeMs: number;  // how far ahead notes spawn (ms before targetTime)
}

export interface GameState {
  status: GameStatus;
  selectedSequence: Sequence | null;
  config: GameConfig;
  score: ScoreSnapshot;
  keyMap: KeyMapping;
  availableSequences: SequenceMetadata[];
}
