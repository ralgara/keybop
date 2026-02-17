import type { KeyMapping, ResolvedMapping, InputEvent } from '../types/index.ts';

export class InputHandler {
  private mappings: ResolvedMapping[] = [];
  private codeToMapping: Map<string, ResolvedMapping> = new Map();
  private _onInput: ((event: InputEvent) => void) | null = null;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private attached = false;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  configure(keyMap: KeyMapping): ResolvedMapping[] {
    this.mappings = [];
    this.codeToMapping.clear();
    const entries = Object.entries(keyMap.bindings);
    entries.forEach(([code, noteId], index) => {
      const mapping: ResolvedMapping = { code, noteId, laneIndex: index };
      this.mappings.push(mapping);
      this.codeToMapping.set(code, mapping);
    });
    return this.mappings;
  }

  get resolvedMappings(): ResolvedMapping[] {
    return this.mappings;
  }

  set onInput(handler: ((event: InputEvent) => void) | null) {
    this._onInput = handler;
  }

  attach(): void {
    if (this.attached) return;
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.attached = false;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.repeat) return;
    const mapping = this.codeToMapping.get(e.code);
    if (!mapping) return;
    e.preventDefault();
    this._onInput?.({
      noteId: mapping.noteId,
      laneIndex: mapping.laneIndex,
      timestamp: performance.now(),
      type: 'down',
    });
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const mapping = this.codeToMapping.get(e.code);
    if (!mapping) return;
    e.preventDefault();
    this._onInput?.({
      noteId: mapping.noteId,
      laneIndex: mapping.laneIndex,
      timestamp: performance.now(),
      type: 'up',
    });
  }
}
