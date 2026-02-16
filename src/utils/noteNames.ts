const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/** Convert a note name like "C4" to a MIDI number (C4 = 60) */
export function noteToMidiNumber(noteId: string): number {
  const match = noteId.match(/^([A-G]#?)(\d+)$/);
  if (!match) return -1;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitone = NOTE_NAMES.indexOf(name as typeof NOTE_NAMES[number]);
  if (semitone === -1) return -1;
  return (octave + 1) * 12 + semitone;
}

/** Convert a MIDI number to a note name (60 = "C4") */
export function midiNumberToNote(midi: number): string {
  const semitone = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[semitone]}${octave}`;
}
