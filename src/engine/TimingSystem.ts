/**
 * TimingSystem — manages game clock, delta-time, speed multiplier, and pause/resume.
 * Uses performance.now() for high-resolution timing.
 */
export class TimingSystem {
  private startTime = 0;
  private pauseTime = 0;
  private totalPausedDuration = 0;
  private lastFrameTime = 0;
  private _deltaTime = 0;
  private _elapsedTime = 0;
  private _speedMultiplier: number;
  private _running = false;
  private _paused = false;

  constructor(speedMultiplier = 1.0) {
    this._speedMultiplier = speedMultiplier;
  }

  start(): void {
    const now = performance.now();
    this.startTime = now;
    this.lastFrameTime = now;
    this.totalPausedDuration = 0;
    this._deltaTime = 0;
    this._elapsedTime = 0;
    this._running = true;
    this._paused = false;
  }

  pause(): void {
    if (!this._running || this._paused) return;
    this._paused = true;
    this.pauseTime = performance.now();
  }

  resume(): void {
    if (!this._running || !this._paused) return;
    const now = performance.now();
    this.totalPausedDuration += now - this.pauseTime;
    this.lastFrameTime = now;
    this._paused = false;
  }

  update(timestamp: number): void {
    if (!this._running || this._paused) {
      this._deltaTime = 0;
      return;
    }
    this._deltaTime = (timestamp - this.lastFrameTime) * this._speedMultiplier;
    this._elapsedTime = (timestamp - this.startTime - this.totalPausedDuration) * this._speedMultiplier;
    this.lastFrameTime = timestamp;
  }

  /** Current game time in ms (accounts for speed multiplier and pauses) */
  get currentTime(): number {
    return this._elapsedTime;
  }

  /** Time since last frame in ms (scaled by speed multiplier) */
  get deltaTime(): number {
    return this._deltaTime;
  }

  get speedMultiplier(): number {
    return this._speedMultiplier;
  }

  set speedMultiplier(value: number) {
    this._speedMultiplier = value;
  }

  get running(): boolean {
    return this._running;
  }

  get paused(): boolean {
    return this._paused;
  }

  stop(): void {
    this._running = false;
    this._paused = false;
  }
}
