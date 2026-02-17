export interface KeyMapping {
  bindings: Record<string, string>;
}

export interface ResolvedMapping {
  code: string;
  noteId: string;
  laneIndex: number;
}

export interface InputEvent {
  noteId: string;
  laneIndex: number;
  timestamp: number;
  type: 'down' | 'up';
}
