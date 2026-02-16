import type { NoteEvent } from './note';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SequenceMetadata {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  bpm: number;
  timeSignature: [number, number];
  tags: string[];
}

/** A full sequence: metadata + note events (beat-based) */
export interface Sequence {
  metadata: SequenceMetadata;
  notes: NoteEvent[];
}

/** A sequence with times converted to milliseconds */
export interface ResolvedSequence {
  metadata: SequenceMetadata;
  notes: Array<{
    noteId: string;
    targetTime: number;  // ms
    duration: number;    // ms
  }>;
}
