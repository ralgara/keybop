import type { ScoreSnapshot } from './scoring.ts';
import type { KeyMapping } from './input.ts';
import type { Sequence, SequenceMetadata } from './sequence.ts';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'finished';

export interface GameConfig {
  speedMultiplier: number;
  leadTimeMs: number;
}

export interface GameState {
  status: GameStatus;
  selectedSequence: Sequence | null;
  config: GameConfig;
  score: ScoreSnapshot;
  keyMap: KeyMapping;
  availableSequences: SequenceMetadata[];
}
