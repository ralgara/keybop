export type TimingGrade = 'PERFECT' | 'GOOD' | 'MISS';

export interface HitResult {
  noteId: string;
  grade: TimingGrade;
  timeDelta: number;
  points: number;
}

export interface FeedbackEvent {
  grade: TimingGrade;
  laneIndex: number;
  timestamp: number;
  y: number;
  opacity: number;
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
