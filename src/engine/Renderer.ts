import type { ActiveNote } from '../types/note';
import type { FeedbackEvent } from '../types/scoring';
import type { ResolvedMapping } from '../types/input';
import { CANVAS, COLORS, ENGINE } from './constants';

/**
 * Renderer — all canvas drawing for the piano roll.
 * Drawing pipeline (per frame):
 *  1. Clear canvas
 *  2. Draw background
 *  3. Draw lane lines
 *  4. Draw lane labels (key name at bottom)
 *  5. Draw hit zone
 *  6. Draw falling notes
 *  7. Draw hit/miss feedback text
 *  8. Draw combo counter
 *  9. Draw progress bar
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private mappings: ResolvedMapping[] = [];
  private laneWidth = 0;
  private totalLanesWidth = 0;
  private lanesOffsetX = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  init(mappings: ResolvedMapping[]): void {
    this.mappings = mappings;
    const laneCount = mappings.length;
    this.laneWidth = CANVAS.NOTE_WIDTH + CANVAS.LANE_GAP;
    this.totalLanesWidth = laneCount * this.laneWidth;
    this.lanesOffsetX = (this.width - this.totalLanesWidth) / 2;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    // Recalculate centering
    this.lanesOffsetX = (this.width - this.totalLanesWidth) / 2;
  }

  draw(
    activeNotes: readonly ActiveNote[],
    feedbackQueue: FeedbackEvent[],
    combo: number,
    score: number,
    progress: number,
    pressedLanes: Set<number>,
  ): void {
    this.clear();
    this.drawBackground();
    this.drawLaneLines();
    this.drawHitZone(pressedLanes);
    this.drawLaneLabels();
    this.drawNotes(activeNotes);
    this.drawFeedback(feedbackQueue);
    this.drawCombo(combo);
    this.drawScore(score);
    this.drawProgressBar(progress);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private drawBackground(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawLaneLines(): void {
    this.ctx.strokeStyle = COLORS.LANE_LINE;
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.mappings.length; i++) {
      const x = this.lanesOffsetX + i * this.laneWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  private drawLaneLabels(): void {
    this.ctx.fillStyle = COLORS.LANE_LABEL;
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    const labelY = this.height * CANVAS.HIT_ZONE_Y_RATIO + 20;

    for (const mapping of this.mappings) {
      const x = this.getLaneCenterX(mapping.laneIndex);
      // Show the key name (e.g. "A") and note (e.g. "C4")
      const keyLabel = mapping.code.replace('Key', '');
      this.ctx.fillStyle = COLORS.LANE_LABEL;
      this.ctx.fillText(keyLabel, x, labelY);
      this.ctx.fillStyle = COLORS.TEXT;
      this.ctx.font = '10px monospace';
      this.ctx.fillText(mapping.noteId, x, labelY + 16);
      this.ctx.font = '12px monospace';
    }
  }

  private drawHitZone(pressedLanes: Set<number>): void {
    const hitZoneY = this.height * CANVAS.HIT_ZONE_Y_RATIO;
    const bandHeight = 4;

    // Draw full hit zone line
    this.ctx.fillStyle = COLORS.HIT_ZONE;
    this.ctx.globalAlpha = 0.6;
    this.ctx.fillRect(this.lanesOffsetX, hitZoneY - bandHeight / 2, this.totalLanesWidth, bandHeight);
    this.ctx.globalAlpha = 1.0;

    // Highlight pressed lanes
    for (const laneIndex of pressedLanes) {
      const x = this.lanesOffsetX + laneIndex * this.laneWidth;
      this.ctx.fillStyle = COLORS.HIT_ZONE;
      this.ctx.globalAlpha = 0.15;
      this.ctx.fillRect(x, 0, this.laneWidth, this.height);
      this.ctx.globalAlpha = 1.0;
    }
  }

  private drawNotes(activeNotes: readonly ActiveNote[]): void {
    const noteWidth = CANVAS.NOTE_WIDTH;
    const noteHeight = CANVAS.NOTE_HEIGHT;
    const radius = 6;

    for (const note of activeNotes) {
      const cx = this.getLaneCenterX(note.laneIndex);
      const x = cx - noteWidth / 2;
      const y = note.y - noteHeight / 2;

      let fillColor: string;
      switch (note.state) {
        case 'hit':
          fillColor = COLORS.NOTE_PERFECT;
          break;
        case 'missed':
          fillColor = COLORS.NOTE_MISS;
          break;
        default:
          fillColor = COLORS.NOTE_FILL;
      }

      // Draw rounded rectangle
      this.ctx.fillStyle = fillColor;
      this.ctx.beginPath();
      this.roundRect(x, y, noteWidth, noteHeight, radius);
      this.ctx.fill();

      // Draw note label
      if (note.state === 'falling') {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = 'bold 13px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(note.noteId, cx, note.y);
      }
    }
  }

  private drawFeedback(feedbackQueue: FeedbackEvent[]): void {
    const now = performance.now();

    for (const fb of feedbackQueue) {
      const elapsed = now - fb.createdAt;
      const progress = elapsed / ENGINE.FEEDBACK_DURATION_MS;
      if (progress >= 1) continue;

      const opacity = 1 - progress;
      const offsetY = -30 * progress; // float upward

      const cx = this.getLaneCenterX(fb.laneIndex);
      const hitZoneY = this.height * CANVAS.HIT_ZONE_Y_RATIO;

      this.ctx.globalAlpha = opacity;
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      switch (fb.grade) {
        case 'PERFECT':
          this.ctx.fillStyle = COLORS.NOTE_PERFECT;
          break;
        case 'GOOD':
          this.ctx.fillStyle = COLORS.NOTE_GOOD;
          break;
        case 'MISS':
          this.ctx.fillStyle = COLORS.NOTE_MISS;
          break;
      }

      this.ctx.fillText(fb.grade, cx, hitZoneY + offsetY - 20);
      this.ctx.globalAlpha = 1.0;
    }
  }

  private drawCombo(combo: number): void {
    if (combo < 2) return;

    const hitZoneY = this.height * CANVAS.HIT_ZONE_Y_RATIO;
    const x = this.lanesOffsetX + this.totalLanesWidth + 30;

    // Pulse effect based on combo
    const scale = 1 + Math.min(combo * 0.02, 0.4);
    const fontSize = Math.round(20 * scale);

    this.ctx.fillStyle = COLORS.COMBO_TEXT;
    this.ctx.font = `bold ${fontSize}px monospace`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`x${combo}`, x, hitZoneY);
  }

  private drawScore(score: number): void {
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = 'bold 18px monospace';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`${score}`, this.width - 20, 20);
  }

  private drawProgressBar(progress: number): void {
    const barHeight = 3;
    const barY = 0;

    // Background
    this.ctx.fillStyle = COLORS.PROGRESS_BAR;
    this.ctx.fillRect(0, barY, this.width, barHeight);

    // Fill
    this.ctx.fillStyle = COLORS.PROGRESS_FILL;
    this.ctx.fillRect(0, barY, this.width * progress, barHeight);
  }

  private getLaneCenterX(laneIndex: number): number {
    return this.lanesOffsetX + laneIndex * this.laneWidth + this.laneWidth / 2;
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
  }
}
