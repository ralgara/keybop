import type { ActiveNote } from '../types/index.ts';
import type { TimingGrade, FeedbackEvent, ScoreSnapshot } from '../types/index.ts';
import { TIMING_WINDOWS, SCORING, FEEDBACK_DURATION_MS } from './constants.ts';

export class ScoringEngine {
  private _score = 0;
  private _combo = 0;
  private _maxCombo = 0;
  private _perfectCount = 0;
  private _goodCount = 0;
  private _missCount = 0;
  private _totalNotes = 0;
  private _feedbackQueue: FeedbackEvent[] = [];

  reset(totalNotes: number): void {
    this._score = 0;
    this._combo = 0;
    this._maxCombo = 0;
    this._perfectCount = 0;
    this._goodCount = 0;
    this._missCount = 0;
    this._totalNotes = totalNotes;
    this._feedbackQueue = [];
  }

  evaluateHit(note: ActiveNote, currentTime: number): TimingGrade {
    const timeDelta = Math.abs(note.targetTime - currentTime);
    let grade: TimingGrade;
    let points: number;

    if (timeDelta <= TIMING_WINDOWS.PERFECT) {
      grade = 'PERFECT';
      points = SCORING.PERFECT_POINTS;
      this._perfectCount++;
      this._combo++;
    } else if (timeDelta <= TIMING_WINDOWS.GOOD) {
      grade = 'GOOD';
      points = SCORING.GOOD_POINTS;
      this._goodCount++;
      this._combo++;
    } else {
      grade = 'MISS';
      points = SCORING.MISS_POINTS;
      this._missCount++;
      this._combo = 0;
    }

    if (this._combo > this._maxCombo) {
      this._maxCombo = this._combo;
    }

    // Apply combo bonus
    const bonusMultiplier = 1 + this._combo * SCORING.COMBO_MULTIPLIER;
    this._score += Math.round(points * bonusMultiplier);

    // Mark the note as hit (or missed if grade is MISS)
    note.state = grade === 'MISS' ? 'missed' : 'hit';

    // Push feedback
    this._feedbackQueue.push({
      grade,
      laneIndex: note.laneIndex,
      timestamp: performance.now(),
      y: note.y,
      opacity: 1,
    });

    return grade;
  }

  /** Mark expired notes as missed */
  evaluateExpiredNotes(activeNotes: readonly ActiveNote[]): void {
    for (const note of activeNotes) {
      if (note.state === 'missed') {
        // Check if we already counted this miss (by checking if feedback exists for this note)
        // We use a simple approach: only count if state just changed
        // Actually, NoteManager sets state to 'missed', then we process it here once
        continue; // Already handled by NoteManager marking them
      }
    }
    // Count newly missed notes from NoteManager
    for (const note of activeNotes) {
      if (note.state === 'missed') {
        // Check if there's already feedback for this note at this lane with a recent timestamp
        const alreadyCounted = this._feedbackQueue.some(
          f => f.laneIndex === note.laneIndex &&
               performance.now() - f.timestamp < 200
        );
        if (!alreadyCounted) {
          this._missCount++;
          this._combo = 0;
          this._feedbackQueue.push({
            grade: 'MISS',
            laneIndex: note.laneIndex,
            timestamp: performance.now(),
            y: note.y,
            opacity: 1,
          });
          // Mark as expired so we don't re-count
          note.state = 'expired';
        }
      }
    }
  }

  /** Update feedback opacity for animations */
  updateFeedback(): void {
    const now = performance.now();
    this._feedbackQueue = this._feedbackQueue.filter(f => {
      const age = now - f.timestamp;
      if (age > FEEDBACK_DURATION_MS) return false;
      f.opacity = 1 - (age / FEEDBACK_DURATION_MS);
      f.y -= 0.5; // Float upward
      return true;
    });
  }

  get feedbackQueue(): readonly FeedbackEvent[] {
    return this._feedbackQueue;
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
