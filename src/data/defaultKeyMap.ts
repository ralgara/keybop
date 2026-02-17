import type { KeyMapping } from '../types/index.ts';

export const defaultKeyMap: KeyMapping = {
  bindings: {
    'KeyA': 'C4',
    'KeyS': 'D4',
    'KeyD': 'E4',
    'KeyF': 'F4',
    'KeyG': 'G4',
    'KeyH': 'A4',
    'KeyJ': 'B4',
    'KeyK': 'C5',
  },
};

const STORAGE_KEY = 'keybop-keymap';

export function loadKeyMap(): KeyMapping {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as KeyMapping;
      if (parsed.bindings && typeof parsed.bindings === 'object') {
        return parsed;
      }
    }
  } catch {
    // Fall through to default
  }
  return defaultKeyMap;
}

export function saveKeyMap(keyMap: KeyMapping): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keyMap));
}
