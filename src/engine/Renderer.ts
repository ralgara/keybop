import type { ActiveNote, FeedbackEvent, ResolvedMapping } from '../types/index.ts';
import { CANVAS, COLORS } from './constants.ts';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private laneCount = 0;
  private laneWidth = 0;
  private laneLabels: string[] = [];
  private keyLabels: string[] = [];
  private hitZoneY = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2d context');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  configure(mappings: ResolvedMapping[]): void {
    this.laneCount = mappings.length;
    this.laneWidth = this.laneCount > 0
      ? (this.width - CANVAS.LANE_GAP * (this.laneCount + 1)) / this.laneCount
      : CANVAS.NOTE_WIDTH;
    this.laneLabels = mappings.map(m => m.noteId);
    this.keyLabels = mappings.map(m => {
      // Convert event.code to readable label
      const code = m.code;
      if (code.startsWith('Key')) return code.slice(3);
      return code;
    });
    this.hitZoneY = this.height * CANVAS.HIT_ZONE_Y_RATIO;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.hitZoneY = this.height * CANVAS.HIT_ZONE_Y_RATIO;
    if (this.laneCount > 0) {
      this.laneWidth = (this.width - CANVAS.LANE_GAP * (this.laneCount + 1)) / this.laneCount;
    }
  }

  draw(
    activeNotes: readonly ActiveNote[],
    feedbackQueue: readonly FeedbackEvent[],
    combo: number,
    progress: number,
  ): void {
    this.clear();
    this.drawBackground();
    this.drawLanes();
    this.drawHitZone();
    this.drawNotes(activeNotes);
    this.drawFeedback(feedbackQueue);
    this.drawCombo(combo);
    this.drawProgressBar(progress);
    this.drawLaneLabels();
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private drawBackground(): void {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawLanes(): void {
    this.ctx.strokeStyle = COLORS.LANE_LINE;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.laneCount; i++) {
      const x = CANVAS.LANE_GAP + i * (this.laneWidth + CANVAS.LANE_GAP);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  private drawHitZone(): void {
    this.ctx.fillStyle = COLORS.HIT_ZONE;
    this.ctx.globalAlpha = 0.15;
    this.ctx.fillRect(0, this.hitZoneY - 15, this.width, 30);
    this.ctx.globalAlpha = 1;

    this.ctx.strokeStyle = COLORS.HIT_ZONE;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.hitZoneY);
    this.ctx.lineTo(this.width, this.hitZoneY);
    this.ctx.stroke();
  }

  private drawNotes(activeNotes: readonly ActiveNote[]): void {
    for (const note of activeNotes) {
      if (note.state === 'expired') continue;

      const x = this.getLaneX(note.laneIndex);
      const noteW = Math.min(this.laneWidth - 4, CANVAS.NOTE_WIDTH);
      const noteX = x + (this.laneWidth - noteW) / 2;
      const noteY = note.y - CANVAS.NOTE_HEIGHT / 2;

      // Color based on state
      if (note.state === 'hit') {
        this.ctx.fillStyle = COLORS.NOTE_PERFECT;
        this.ctx.globalAlpha = 0.5;
      } else if (note.state === 'missed') {
        this.ctx.fillStyle = COLORS.NOTE_MISS;
        this.ctx.globalAlpha = 0.5;
      } else {
        this.ctx.fillStyle = COLORS.NOTE_FILL;
        this.ctx.globalAlpha = 1;
      }

      // Rounded rect
      this.roundRect(noteX, noteY, noteW, CANVAS.NOTE_HEIGHT, 6);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;

      // Note label
      if (note.state === 'falling') {
        this.ctx.fillStyle = COLORS.TEXT;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(note.noteId, noteX + noteW / 2, noteY + CANVAS.NOTE_HEIGHT / 2);
      }
    }
  }

  private drawFeedback(feedbackQueue: readonly FeedbackEvent[]): void {
    for (const fb of feedbackQueue) {
      const x = this.getLaneCenterX(fb.laneIndex);
      this.ctx.globalAlpha = fb.opacity;

      if (fb.grade === 'PERFECT') {
        this.ctx.fillStyle = COLORS.NOTE_PERFECT;
      } else if (fb.grade === 'GOOD') {
        this.ctx.fillStyle = COLORS.NOTE_GOOD;
      } else {
        this.ctx.fillStyle = COLORS.NOTE_MISS;
      }

      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(fb.grade, x, fb.y);
    }
    this.ctx.globalAlpha = 1;
  }

  private drawCombo(combo: number): void {
    if (combo < 2) return;
    this.ctx.fillStyle = COLORS.TEXT;
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Pulse effect based on combo
    const scale = 1 + Math.sin(performance.now() / 200) * 0.05;
    this.ctx.save();
    this.ctx.translate(this.width / 2, this.hitZoneY + 40);
    this.ctx.scale(scale, scale);
    this.ctx.fillText(`x${combo}`, 0, 0);
    this.ctx.restore();
  }

  private drawProgressBar(progress: number): void {
    const barHeight = 3;
    this.ctx.fillStyle = COLORS.LANE_LINE;
    this.ctx.fillRect(0, 0, this.width, barHeight);
    this.ctx.fillStyle = COLORS.HIT_ZONE;
    this.ctx.fillRect(0, 0, this.width * progress, barHeight);
  }

  private drawLaneLabels(): void {
    this.ctx.font = '11px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    for (let i = 0; i < this.laneCount; i++) {
      const x = this.getLaneCenterX(i);
      // Key label
      this.ctx.fillStyle = COLORS.TEXT;
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillText(this.keyLabels[i], x, this.hitZoneY + 20);
      // Note label
      this.ctx.globalAlpha = 0.4;
      this.ctx.fillText(this.laneLabels[i], x, this.hitZoneY + 34);
    }
    this.ctx.globalAlpha = 1;
  }

  private getLaneX(laneIndex: number): number {
    return CANVAS.LANE_GAP + laneIndex * (this.laneWidth + CANVAS.LANE_GAP);
  }

  private getLaneCenterX(laneIndex: number): number {
    return this.getLaneX(laneIndex) + this.laneWidth / 2;
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }
}
