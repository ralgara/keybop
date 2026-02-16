import type { Sequence } from '../types/sequence';
import type { KeyMapping, InputEvent } from '../types/input';
import type { ScoreSnapshot } from '../types/scoring';
import type { GameStatus } from '../types/game';
import { resolveSequence } from '../data/sequenceLoader';
import { ENGINE } from './constants';
import { TimingSystem } from './TimingSystem';
import { NoteManager } from './NoteManager';
import { ScoringEngine } from './ScoringEngine';
import { InputHandler } from './InputHandler';
import { Renderer } from './Renderer';

export interface EngineStateSnapshot {
  status: GameStatus;
  score: ScoreSnapshot;
  progress: number;  // 0..1
}

export interface GameEngineConfig {
  speedMultiplier: number;
}

/**
 * GameEngine — central orchestrator. Owns the rAF loop.
 * Delegates to subsystems each frame: timing → notes → scoring → rendering.
 * Emits state snapshots to React via callback.
 */
export class GameEngine {
  private canvas: HTMLCanvasElement;
  private timing: TimingSystem;
  private noteManager: NoteManager;
  private scoring: ScoringEngine;
  private inputHandler: InputHandler;
  private renderer: Renderer;

  private onStateChange: (snapshot: EngineStateSnapshot) => void;
  private rafId: number | null = null;
  private lastEmitTime = 0;
  private _status: GameStatus = 'menu';
  private pressedLanes = new Set<number>();

  constructor(
    canvas: HTMLCanvasElement,
    config: GameEngineConfig,
    onStateChange: (snapshot: EngineStateSnapshot) => void,
  ) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;

    this.timing = new TimingSystem(config.speedMultiplier);
    this.noteManager = new NoteManager();
    this.scoring = new ScoringEngine();
    this.inputHandler = new InputHandler();
    this.renderer = new Renderer(canvas);
  }

  /** Load a sequence and key map, then start the game */
  start(sequence: Sequence, keyMap: KeyMapping): void {
    const resolved = resolveSequence(sequence);

    // Scale target times by speed multiplier
    const speed = this.timing.speedMultiplier;
    if (speed !== 1.0) {
      for (const note of resolved.notes) {
        note.targetTime /= speed;
        note.duration /= speed;
      }
    }

    // Initialize input handler (builds lane mappings)
    this.inputHandler.init(keyMap, this.handleInput);
    const mappings = this.inputHandler.resolvedMappings;

    // Initialize subsystems
    this.noteManager.init(
      resolved,
      mappings,
      this.canvas.height,
      ENGINE.LEAD_TIME_MS / speed,
    );
    this.scoring.init(this.noteManager);
    this.renderer.init(mappings);
    this.renderer.resize(this.canvas.width, this.canvas.height);

    this._status = 'playing';
    this.timing.start();
    this.lastEmitTime = 0;
    this.pressedLanes.clear();

    this.scheduleFrame();
  }

  pause(): void {
    if (this._status !== 'playing') return;
    this._status = 'paused';
    this.timing.pause();
    this.cancelFrame();
  }

  resume(): void {
    if (this._status !== 'paused') return;
    this._status = 'playing';
    this.timing.resume();
    this.scheduleFrame();
  }

  stop(): void {
    this._status = 'finished';
    this.timing.stop();
    this.cancelFrame();
    this.inputHandler.destroy();
    this.emitState();
  }

  destroy(): void {
    this.cancelFrame();
    this.inputHandler.destroy();
    this._status = 'menu';
  }

  get status(): GameStatus {
    return this._status;
  }

  private handleInput = (event: InputEvent): void => {
    if (this._status !== 'playing') return;

    if (event.type === 'press') {
      this.pressedLanes.add(event.laneIndex);
      this.scoring.evaluateInput(event, this.timing.currentTime);
    } else {
      this.pressedLanes.delete(event.laneIndex);
    }
  };

  private tick = (timestamp: number): void => {
    if (this._status !== 'playing') return;

    // 1. Update timing
    this.timing.update(timestamp);
    const currentTime = this.timing.currentTime;

    // 2. Update notes
    this.noteManager.update(currentTime);

    // 3. Evaluate expired notes as misses
    this.scoring.evaluateExpiredNotes();

    // 4. Prune old feedback
    this.scoring.pruneFeedback(performance.now(), ENGINE.FEEDBACK_DURATION_MS);

    // 5. Calculate progress
    const totalNotes = this.noteManager.totalNotes;
    const snapshot = this.scoring.snapshot;
    const processedNotes = snapshot.perfectCount + snapshot.goodCount + snapshot.missCount;
    const progress = totalNotes > 0 ? processedNotes / totalNotes : 0;

    // 6. Render
    this.renderer.draw(
      this.noteManager.activeNotes,
      this.scoring.feedbackQueue,
      snapshot.combo,
      snapshot.score,
      progress,
      this.pressedLanes,
    );

    // 7. Emit state snapshot (throttled)
    if (timestamp - this.lastEmitTime >= ENGINE.STATE_EMIT_INTERVAL) {
      this.lastEmitTime = timestamp;
      this.emitState();
    }

    // 8. Check if sequence is done
    if (this.noteManager.allNotesProcessed) {
      this.stop();
      return;
    }

    this.scheduleFrame();
  };

  private emitState(): void {
    const snapshot = this.scoring.snapshot;
    const totalNotes = this.noteManager.totalNotes;
    const processedNotes = snapshot.perfectCount + snapshot.goodCount + snapshot.missCount;

    this.onStateChange({
      status: this._status,
      score: snapshot,
      progress: totalNotes > 0 ? processedNotes / totalNotes : 0,
    });
  }

  private scheduleFrame(): void {
    this.rafId = requestAnimationFrame(this.tick);
  }

  private cancelFrame(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
