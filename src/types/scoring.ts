export type TimingGrade = 'PERFECT' | 'GOOD' | 'MISS';

export interface HitResult {
  noteId: string;
  grade: TimingGrade;
  timeDelta: number;  // ms, absolute distance from perfect
  points: number;     // after combo multiplier
}

export interface ScoreSnapshot {
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  goodCount: number;
  missCount: number;
  totalNotes: number;
}

export interface FeedbackEvent {
  id: string;
  grade: TimingGrade;
  laneIndex: number;
  y: number;
  opacity: number;      // 1.0 → 0.0 during fade
  createdAt: number;    // timestamp for fade calculation
}
