import type { KeyMapping, ResolvedMapping, InputEvent } from '../types/input';

/**
 * InputHandler — listens for keydown/keyup on window, resolves event.code
 * to noteId via configurable KeyMapping, and produces InputEvents.
 * Input-source-agnostic: future MIDI handler produces same InputEvent shape.
 */
export class InputHandler {
  private mappings: ResolvedMapping[] = [];
  private codeToMapping = new Map<string, ResolvedMapping>();
  private pressedKeys = new Set<string>();
  private _onInput: ((event: InputEvent) => void) | null = null;

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Ignore repeats
    if (e.repeat) return;

    const mapping = this.codeToMapping.get(e.code);
    if (!mapping) return;

    e.preventDefault();

    if (this.pressedKeys.has(e.code)) return;
    this.pressedKeys.add(e.code);

    this._onInput?.({
      noteId: mapping.noteId,
      laneIndex: mapping.laneIndex,
      timestamp: performance.now(),
      type: 'press',
    });
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const mapping = this.codeToMapping.get(e.code);
    if (!mapping) return;

    e.preventDefault();
    this.pressedKeys.delete(e.code);

    this._onInput?.({
      noteId: mapping.noteId,
      laneIndex: mapping.laneIndex,
      timestamp: performance.now(),
      type: 'release',
    });
  };

  /** Initialize with a key mapping and build lookup tables */
  init(keyMap: KeyMapping, onInput: (event: InputEvent) => void): void {
    this.destroy(); // clean up any previous listeners

    this._onInput = onInput;
    this.codeToMapping.clear();
    this.pressedKeys.clear();

    // Build resolved mappings sorted by noteId for consistent lane ordering
    const entries = Object.entries(keyMap.bindings);
    // Sort by noteId to get consistent lane indices
    entries.sort((a, b) => a[1].localeCompare(b[1]));

    this.mappings = entries.map(([code, noteId], index) => ({
      code,
      noteId,
      laneIndex: index,
    }));

    for (const m of this.mappings) {
      this.codeToMapping.set(m.code, m);
    }

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  /** Get the resolved mappings (for NoteManager lane setup) */
  get resolvedMappings(): ResolvedMapping[] {
    return this.mappings;
  }

  /** Check if a key is currently pressed */
  isPressed(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  /** Clean up event listeners */
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.pressedKeys.clear();
    this._onInput = null;
  }
}
