import type { NoteEvent } from './note.ts';

export interface SequenceMetadata {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  bpm: number;
  timeSignature: [number, number];
  tags: string[];
}

export interface Sequence {
  metadata: SequenceMetadata;
  notes: NoteEvent[];
}
