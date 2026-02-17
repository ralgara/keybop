import type { ActiveNote, NoteEvent } from '../types/index.ts';
import type { ResolvedMapping } from '../types/index.ts';
import { CANVAS } from './constants.ts';

export class NoteManager {
  private notes: NoteEvent[] = [];
  private _activeNotes: ActiveNote[] = [];
  private nextNoteIndex = 0;
  private leadTimeMs: number;
  private laneMap: Map<string, number> = new Map();
  private noteCounter = 0;
  private _totalNotes = 0;

  constructor(leadTimeMs: number) {
    this.leadTimeMs = leadTimeMs;
  }

  load(notes: NoteEvent[], mappings: ResolvedMapping[], bpm: number): void {
    this.notes = notes.map(n => ({
      ...n,
      beatPosition: n.beatPosition,
      duration: n.duration,
      noteId: n.noteId,
    }));
    // Sort by beat position
    this.notes.sort((a, b) => a.beatPosition - b.beatPosition);

    // Build lane map from resolved mappings
    this.laneMap.clear();
    for (const m of mappings) {
      this.laneMap.set(m.noteId, m.laneIndex);
    }

    // Convert beat positions to ms target times
    this.notes = this.notes.map(n => ({
      ...n,
      // Store targetTime in beatPosition field temporarily — we'll use it as ms
      beatPosition: (n.beatPosition / bpm) * 60000,
    }));

    this._totalNotes = this.notes.length;
    this.nextNoteIndex = 0;
    this._activeNotes = [];
    this.noteCounter = 0;
  }

  update(currentTime: number, canvasHeight: number): void {
    // Spawn notes that are within lead time
    while (this.nextNoteIndex < this.notes.length) {
      const note = this.notes[this.nextNoteIndex];
      const targetTime = note.beatPosition; // already converted to ms
      if (targetTime - currentTime <= this.leadTimeMs) {
        const laneIndex = this.laneMap.get(note.noteId);
        if (laneIndex !== undefined) {
          this._activeNotes.push({
            id: `note-${this.noteCounter++}`,
            noteId: note.noteId,
            laneIndex,
            targetTime,
            y: 0,
            state: 'falling',
          });
        }
        this.nextNoteIndex++;
      } else {
        break;
      }
    }

    // Update Y positions for falling notes
    const hitZoneY = canvasHeight * CANVAS.HIT_ZONE_Y_RATIO;
    for (const note of this._activeNotes) {
      if (note.state === 'falling') {
        const timeUntilHit = note.targetTime - currentTime;
        const progress = 1 - (timeUntilHit / this.leadTimeMs);
        note.y = progress * hitZoneY;

        // Mark as missed if past the hit zone by the GOOD window
        if (timeUntilHit < -120) {
          note.state = 'missed';
        }
      }
    }
  }

  /** Remove expired notes (hit or missed, and well past the hit zone) */
  cleanup(currentTime: number): void {
    this._activeNotes = this._activeNotes.filter(n => {
      if (n.state === 'hit') return false; // Remove immediately after hit
      if (n.state === 'missed' && currentTime - n.targetTime > 500) return false;
      return true;
    });
  }

  get activeNotes(): readonly ActiveNote[] {
    return this._activeNotes;
  }

  get totalNotes(): number {
    return this._totalNotes;
  }

  get allSpawned(): boolean {
    return this.nextNoteIndex >= this.notes.length;
  }

  get allProcessed(): boolean {
    return this.allSpawned && this._activeNotes.every(n => n.state !== 'falling');
  }

  /** Find the nearest falling note in a given lane */
  findNearestNote(laneIndex: number, currentTime: number): ActiveNote | null {
    let best: ActiveNote | null = null;
    let bestDelta = Infinity;
    for (const note of this._activeNotes) {
      if (note.state !== 'falling' || note.laneIndex !== laneIndex) continue;
      const delta = Math.abs(note.targetTime - currentTime);
      if (delta < bestDelta) {
        bestDelta = delta;
        best = note;
      }
    }
    return best;
  }
}
