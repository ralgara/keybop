import type { ActiveNote } from '../types/note';
import type { ResolvedSequence } from '../types/sequence';
import type { ResolvedMapping } from '../types/input';
import { CANVAS, ENGINE } from './constants';

let noteCounter = 0;
function generateNoteId(): string {
  return `note_${++noteCounter}`;
}

/**
 * NoteManager — spawns notes from sequence data, advances Y positions,
 * and expires notes that pass the hit zone.
 */
export class NoteManager {
  private sequence: ResolvedSequence | null = null;
  private mappings: ResolvedMapping[] = [];
  private _activeNotes: ActiveNote[] = [];
  private nextNoteIndex = 0;
  private canvasHeight: number = CANVAS.DEFAULT_HEIGHT;
  private leadTimeMs: number = ENGINE.LEAD_TIME_MS;

  /** Map from noteId to laneIndex for quick lookup */
  private noteToLane = new Map<string, number>();

  init(
    sequence: ResolvedSequence,
    mappings: ResolvedMapping[],
    canvasHeight: number,
    leadTimeMs: number,
  ): void {
    this.sequence = sequence;
    this.mappings = mappings;
    this.canvasHeight = canvasHeight;
    this.leadTimeMs = leadTimeMs;
    this._activeNotes = [];
    this.nextNoteIndex = 0;
    noteCounter = 0;

    this.noteToLane.clear();
    for (const m of mappings) {
      this.noteToLane.set(m.noteId, m.laneIndex);
    }
  }

  /** Spawn and advance notes based on current game time */
  update(currentTime: number): void {
    if (!this.sequence) return;

    // Spawn notes that are within lead time
    const notes = this.sequence.notes;
    while (this.nextNoteIndex < notes.length) {
      const note = notes[this.nextNoteIndex];
      if (note.targetTime - currentTime > this.leadTimeMs) break;

      const laneIndex = this.noteToLane.get(note.noteId);
      if (laneIndex !== undefined) {
        this._activeNotes.push({
          id: generateNoteId(),
          noteId: note.noteId,
          laneIndex,
          targetTime: note.targetTime,
          y: 0,
          state: 'falling',
        });
      }
      this.nextNoteIndex++;
    }

    // Update Y positions based on time until target
    const hitZoneY = this.canvasHeight * CANVAS.HIT_ZONE_Y_RATIO;
    for (const note of this._activeNotes) {
      if (note.state === 'hit') continue;

      const timeUntilTarget = note.targetTime - currentTime;
      // At leadTimeMs before target → y=0 (top), at target → y=hitZoneY
      const progress = 1 - timeUntilTarget / this.leadTimeMs;
      note.y = progress * hitZoneY;

      // Mark as expired if past hit zone + grace period
      if (note.state === 'falling' && currentTime > note.targetTime + ENGINE.NOTE_EXPIRE_GRACE_MS) {
        note.state = 'expired';
      }
    }

    // Remove notes that are well past the screen
    this._activeNotes = this._activeNotes.filter(
      (n) => n.state !== 'hit' || n.y < this.canvasHeight + 50,
    );
  }

  /** Get all active notes */
  get activeNotes(): readonly ActiveNote[] {
    return this._activeNotes;
  }

  /** Find the nearest falling note in a given lane (for scoring) */
  findNearestFallingNote(laneIndex: number, currentTime: number): ActiveNote | null {
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

  /** Collect expired notes (not yet scored as MISS) and mark them as missed */
  collectExpiredNotes(): ActiveNote[] {
    const expired: ActiveNote[] = [];
    for (const note of this._activeNotes) {
      if (note.state === 'expired') {
        note.state = 'missed';
        expired.push(note);
      }
    }
    return expired;
  }

  /** Check if all notes have been spawned and processed */
  get allNotesProcessed(): boolean {
    if (!this.sequence) return true;
    return (
      this.nextNoteIndex >= this.sequence.notes.length &&
      this._activeNotes.every((n) => n.state === 'hit' || n.state === 'missed')
    );
  }

  get totalNotes(): number {
    return this.sequence?.notes.length ?? 0;
  }

  get laneCount(): number {
    return this.mappings.length;
  }
}
