import type { Sequence, SequenceMetadata } from '../types/index.ts';
import cMajorScale from './sequences/c-major-scale.json';
import hanon01 from './sequences/hanon-01.json';
import customExample from './sequences/custom-example.json';

const allSequences: Sequence[] = [
  cMajorScale as Sequence,
  hanon01 as Sequence,
  customExample as Sequence,
];

export function getAvailableSequences(): SequenceMetadata[] {
  return allSequences.map(s => s.metadata);
}

export function getSequenceById(id: string): Sequence | null {
  return allSequences.find(s => s.metadata.id === id) ?? null;
}

export function getAllSequences(): Sequence[] {
  return allSequences;
}
