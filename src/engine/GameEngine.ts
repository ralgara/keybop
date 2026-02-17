import type { Sequence, GameConfig, ScoreSnapshot, KeyMapping, InputEvent } from '../types/index.ts';
import { TimingSystem } from './TimingSystem.ts';
import { NoteManager } from './NoteManager.ts';
import { ScoringEngine } from './ScoringEngine.ts';
import { InputHandler } from './InputHandler.ts';
import { Renderer } from './Renderer.ts';
import { STATE_EMIT_INTERVAL_MS, DEFAULT_LEAD_TIME_MS } from './constants.ts';

export interface EngineStateSnapshot {
  score: ScoreSnapshot;
  finished: boolean;
  paused: boolean;
}

export type StateChangeCallback = (snapshot: EngineStateSnapshot) => void;

export class GameEngine {
  private timing: TimingSystem;
  private noteManager: NoteManager;
  private scoring: ScoringEngine;
  private input: InputHandler;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private onStateChange: StateChangeCallback;

  private rafId: number | null = null;
  private lastEmitTime = 0;
  private sequence: Sequence | null = null;
  private _finished = false;

  constructor(
    canvas: HTMLCanvasElement,
    config: GameConfig,
    onStateChange: StateChangeCallback,
  ) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;

    const leadTime = config.leadTimeMs || DEFAULT_LEAD_TIME_MS;
    this.timing = new TimingSystem(config.speedMultiplier);
    this.noteManager = new NoteManager(leadTime);
    this.scoring = new ScoringEngine();
    this.input = new InputHandler();
    this.renderer = new Renderer(canvas);
  }

  configure(sequence: Sequence, keyMap: KeyMapping): void {
    this.sequence = sequence;
    const mappings = this.input.configure(keyMap);
    this.renderer.configure(mappings);
    this.noteManager.load(sequence.notes, mappings, sequence.metadata.bpm);
    this.scoring.reset(this.noteManager.totalNotes);
  }

  start(): void {
    if (!this.sequence) return;
    this._finished = false;

    this.input.onInput = (event: InputEvent) => this.handleInput(event);
    this.input.attach();

    const now = performance.now();
    this.timing.start(now);
    this.lastEmitTime = now;

    this.tick(now);
  }

  pause(): void {
    this.timing.pause(performance.now());
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emitState();
  }

  resume(): void {
    this.timing.resume(performance.now());
    this.tick(performance.now());
  }

  stop(): void {
    this._finished = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.input.detach();
    this.emitState();
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.input.onInput = null;
    this.input.detach();
  }

  private tick = (timestamp: number): void => {
    this.timing.update(timestamp);

    const currentTime = this.timing.currentTime;

    // Update notes
    this.noteManager.update(currentTime, this.canvas.height);

    // Evaluate missed notes
    this.scoring.evaluateExpiredNotes(this.noteManager.activeNotes);

    // Cleanup old notes
    this.noteManager.cleanup(currentTime);

    // Update feedback animations
    this.scoring.updateFeedback();

    // Calculate progress
    const snapshot = this.scoring.snapshot;
    const processed = snapshot.perfectCount + snapshot.goodCount + snapshot.missCount;
    const progress = snapshot.totalNotes > 0 ? processed / snapshot.totalNotes : 0;

    // Draw
    this.renderer.draw(
      this.noteManager.activeNotes,
      this.scoring.feedbackQueue,
      snapshot.combo,
      progress,
    );

    // Emit state to React at throttled rate
    if (timestamp - this.lastEmitTime >= STATE_EMIT_INTERVAL_MS) {
      this.emitState();
      this.lastEmitTime = timestamp;
    }

    // Check if exercise is complete
    if (this.noteManager.allProcessed && processed >= snapshot.totalNotes) {
      this.stop();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private handleInput(event: InputEvent): void {
    if (event.type !== 'down') return;
    if (this._finished || this.timing.paused) return;

    const currentTime = this.timing.currentTime;
    const note = this.noteManager.findNearestNote(event.laneIndex, currentTime);
    if (note) {
      this.scoring.evaluateHit(note, currentTime);
    }
  }

  private emitState(): void {
    this.onStateChange({
      score: this.scoring.snapshot,
      finished: this._finished,
      paused: this.timing.paused,
    });
  }
}
