export interface NoteEvent {
  noteId: string;
  beatPosition: number;
  duration: number;
}

export interface ActiveNote {
  id: string;
  noteId: string;
  laneIndex: number;
  targetTime: number;
  y: number;
  state: 'falling' | 'hit' | 'missed' | 'expired';
}
