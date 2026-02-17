const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export function noteToMidiNumber(noteId: string): number {
  const match = noteId.match(/^([A-G]#?)(\d+)$/);
  if (!match) return -1;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTE_NAMES.indexOf(name as typeof NOTE_NAMES[number]);
  if (noteIndex === -1) return -1;
  return (octave + 1) * 12 + noteIndex;
}

export function midiNumberToNote(midi: number): string {
  const noteIndex = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}
