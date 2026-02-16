export const TIMING_WINDOWS = {
  PERFECT: 50,  // ms
  GOOD: 120,    // ms
} as const;

export const SCORING = {
  PERFECT_POINTS: 300,
  GOOD_POINTS: 100,
  MISS_POINTS: 0,
  COMBO_MULTIPLIER: 0.1,
} as const;

export const CANVAS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  HIT_ZONE_Y_RATIO: 0.85,
  NOTE_HEIGHT: 30,
  NOTE_WIDTH: 60,
  LANE_GAP: 10,
} as const;

export const COLORS = {
  BACKGROUND: '#1a1a2e',
  LANE_LINE: '#16213e',
  HIT_ZONE: '#e94560',
  NOTE_FILL: '#0f3460',
  NOTE_PERFECT: '#00ff88',
  NOTE_GOOD: '#ffcc00',
  NOTE_MISS: '#ff4444',
  TEXT: '#eaeaea',
  COMBO_TEXT: '#ffcc00',
  PROGRESS_BAR: '#0f3460',
  PROGRESS_FILL: '#e94560',
  LANE_LABEL: '#8888aa',
} as const;

export const SPEED_MULTIPLIERS = {
  SLOW: 0.5,
  NORMAL: 1.0,
} as const;

export const ENGINE = {
  LEAD_TIME_MS: 2000,           // how far ahead notes spawn before targetTime
  STATE_EMIT_INTERVAL: 67,      // ~15fps state snapshot throttle (ms)
  FEEDBACK_DURATION_MS: 600,    // how long hit/miss text shows
  NOTE_EXPIRE_GRACE_MS: 200,    // extra time past hit zone before marking expired
} as const;
