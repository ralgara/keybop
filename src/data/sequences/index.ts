import type { Sequence, SequenceMetadata } from '../../types/sequence';
import cMajorScale from './c-major-scale.json';
import hanon01 from './hanon-01.json';
import customExample from './custom-example.json';

const ALL_SEQUENCES: Sequence[] = [
  cMajorScale as Sequence,
  hanon01 as Sequence,
  customExample as Sequence,
];

export function getAvailableSequences(): SequenceMetadata[] {
  return ALL_SEQUENCES.map((s) => s.metadata);
}

export function getSequenceById(id: string): Sequence | undefined {
  return ALL_SEQUENCES.find((s) => s.metadata.id === id);
}

export { ALL_SEQUENCES };
