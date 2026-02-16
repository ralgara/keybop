import type { ActiveNote } from '../types/note';
import type { InputEvent } from '../types/input';
import type { TimingGrade, HitResult, ScoreSnapshot, FeedbackEvent } from '../types/scoring';
import { TIMING_WINDOWS, SCORING } from './constants';
import type { NoteManager } from './NoteManager';

let feedbackCounter = 0;

/**
 * ScoringEngine — evaluates input against nearest note, tracks combo,
 * and manages the feedback event queue.
 */
export class ScoringEngine {
  private _score = 0;
  private _combo = 0;
  private _maxCombo = 0;
  private _perfectCount = 0;
  private _goodCount = 0;
  private _missCount = 0;
  private _totalNotes = 0;
  private _feedbackQueue: FeedbackEvent[] = [];
  private noteManager: NoteManager | null = null;

  init(noteManager: NoteManager): void {
    this.noteManager = noteManager;
    this._score = 0;
    this._combo = 0;
    this._maxCombo = 0;
    this._perfectCount = 0;
    this._goodCount = 0;
    this._missCount = 0;
    this._totalNotes = 0;
    this._feedbackQueue = [];
    feedbackCounter = 0;
  }

  /** Evaluate an input event against the nearest falling note */
  evaluateInput(input: InputEvent, currentTime: number): HitResult | null {
    if (!this.noteManager) return null;
    if (input.type !== 'press') return null;

    const note = this.noteManager.findNearestFallingNote(input.laneIndex, currentTime);
    if (!note) return null;

    const timeDelta = Math.abs(note.targetTime - currentTime);
    const grade = this.gradeHit(timeDelta);

    if (grade === 'MISS') return null; // not close enough to any note

    note.state = 'hit';
    return this.recordHit(note, grade, timeDelta);
  }

  /** Process expired notes as misses */
  evaluateExpiredNotes(): void {
    if (!this.noteManager) return;

    const expired = this.noteManager.collectExpiredNotes();
    for (const note of expired) {
      this.recordMiss(note);
    }
  }

  private gradeHit(timeDelta: number): TimingGrade {
    if (timeDelta <= TIMING_WINDOWS.PERFECT) return 'PERFECT';
    if (timeDelta <= TIMING_WINDOWS.GOOD) return 'GOOD';
    return 'MISS';
  }

  private recordHit(note: ActiveNote, grade: TimingGrade, timeDelta: number): HitResult {
    this._combo++;
    if (this._combo > this._maxCombo) {
      this._maxCombo = this._combo;
    }

    const basePoints = grade === 'PERFECT' ? SCORING.PERFECT_POINTS : SCORING.GOOD_POINTS;
    const points = Math.round(basePoints * (1 + this._combo * SCORING.COMBO_MULTIPLIER));
    this._score += points;

    if (grade === 'PERFECT') this._perfectCount++;
    else this._goodCount++;
    this._totalNotes++;

    this.pushFeedback(grade, note.laneIndex, note.y);

    return { noteId: note.noteId, grade, timeDelta, points };
  }

  private recordMiss(note: ActiveNote): void {
    this._combo = 0;
    this._missCount++;
    this._totalNotes++;

    this.pushFeedback('MISS', note.laneIndex, note.y);
  }

  private pushFeedback(grade: TimingGrade, laneIndex: number, y: number): void {
    this._feedbackQueue.push({
      id: `fb_${++feedbackCounter}`,
      grade,
      laneIndex,
      y,
      opacity: 1.0,
      createdAt: performance.now(),
    });
  }

  /** Get and clear feedback events for the renderer */
  get feedbackQueue(): FeedbackEvent[] {
    return this._feedbackQueue;
  }

  /** Remove faded-out feedback events */
  pruneFeedback(now: number, durationMs: number): void {
    this._feedbackQueue = this._feedbackQueue.filter(
      (fb) => now - fb.createdAt < durationMs,
    );
  }

  get snapshot(): ScoreSnapshot {
    return {
      score: this._score,
      combo: this._combo,
      maxCombo: this._maxCombo,
      perfectCount: this._perfectCount,
      goodCount: this._goodCount,
      missCount: this._missCount,
      totalNotes: this._totalNotes,
    };
  }
}
