export class TimingSystem {
  private startTime = 0;
  private pauseTime = 0;
  private pausedDuration = 0;
  private lastTimestamp = 0;
  private _deltaTime = 0;
  private _elapsed = 0;
  private _speedMultiplier: number;
  private _paused = false;
  private _started = false;

  constructor(speedMultiplier: number) {
    this._speedMultiplier = speedMultiplier;
  }

  start(timestamp: number): void {
    this.startTime = timestamp;
    this.lastTimestamp = timestamp;
    this.pausedDuration = 0;
    this._deltaTime = 0;
    this._elapsed = 0;
    this._paused = false;
    this._started = true;
  }

  pause(timestamp: number): void {
    if (this._paused || !this._started) return;
    this._paused = true;
    this.pauseTime = timestamp;
  }

  resume(timestamp: number): void {
    if (!this._paused || !this._started) return;
    this.pausedDuration += timestamp - this.pauseTime;
    this.lastTimestamp = timestamp;
    this._paused = false;
  }

  update(timestamp: number): void {
    if (this._paused || !this._started) {
      this._deltaTime = 0;
      return;
    }
    const rawDelta = timestamp - this.lastTimestamp;
    this._deltaTime = rawDelta * this._speedMultiplier;
    this._elapsed = (timestamp - this.startTime - this.pausedDuration) * this._speedMultiplier;
    this.lastTimestamp = timestamp;
  }

  get deltaTime(): number {
    return this._deltaTime;
  }

  get elapsed(): number {
    return this._elapsed;
  }

  get speedMultiplier(): number {
    return this._speedMultiplier;
  }

  set speedMultiplier(value: number) {
    this._speedMultiplier = value;
  }

  get paused(): boolean {
    return this._paused;
  }

  get started(): boolean {
    return this._started;
  }

  /** Get the game-time timestamp for the current frame (used for note targetTime comparison) */
  get currentTime(): number {
    return this._elapsed;
  }
}
