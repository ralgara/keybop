/** Core note types for the KeyBop game engine */

/** A note event within a sequence (beat-based, pre-conversion) */
export interface NoteEvent {
  noteId: string;         // e.g. "C4"
  beatPosition: number;   // 0-indexed, fractional OK
  duration: number;       // in beats (visual length)
}

/** A live note on the canvas during gameplay */
export interface ActiveNote {
  id: string;             // unique per instance
  noteId: string;         // e.g. "C4"
  laneIndex: number;
  targetTime: number;     // ms when it should cross hit zone
  y: number;              // current canvas Y position
  state: 'falling' | 'hit' | 'missed' | 'expired';
}
