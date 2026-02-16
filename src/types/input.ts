/** Maps physical key codes to note IDs */
export interface KeyMapping {
  bindings: Record<string, string>;  // event.code → noteId, e.g. { "KeyA": "C4" }
}

/** A resolved mapping entry with lane index */
export interface ResolvedMapping {
  code: string;       // event.code
  noteId: string;
  laneIndex: number;
}

/** Input event produced by InputHandler (input-source-agnostic) */
export interface InputEvent {
  noteId: string;
  laneIndex: number;
  timestamp: number;   // performance.now()
  type: 'press' | 'release';
}
