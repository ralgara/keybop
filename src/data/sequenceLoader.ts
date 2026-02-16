import type { Sequence, ResolvedSequence } from '../types/sequence';

/** Convert a beat-based sequence to millisecond-based timing */
export function resolveSequence(sequence: Sequence): ResolvedSequence {
  const { bpm } = sequence.metadata;
  const msPerBeat = 60000 / bpm;

  return {
    metadata: sequence.metadata,
    notes: sequence.notes.map((note) => ({
      noteId: note.noteId,
      targetTime: note.beatPosition * msPerBeat,
      duration: note.duration * msPerBeat,
    })),
  };
}

/** Validate a raw JSON object as a Sequence */
export function validateSequence(data: unknown): Sequence | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;

  if (!obj.metadata || typeof obj.metadata !== 'object') return null;
  const meta = obj.metadata as Record<string, unknown>;

  if (
    typeof meta.id !== 'string' ||
    typeof meta.title !== 'string' ||
    typeof meta.bpm !== 'number' ||
    !Array.isArray(meta.timeSignature)
  ) {
    return null;
  }

  if (!Array.isArray(obj.notes)) return null;

  for (const note of obj.notes) {
    if (
      typeof note !== 'object' ||
      !note ||
      typeof (note as Record<string, unknown>).noteId !== 'string' ||
      typeof (note as Record<string, unknown>).beatPosition !== 'number' ||
      typeof (note as Record<string, unknown>).duration !== 'number'
    ) {
      return null;
    }
  }

  return data as Sequence;
}
