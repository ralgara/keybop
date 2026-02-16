import type { KeyMapping } from '../types/input';

/** Default QWERTY home-row mapping: A=C4, S=D4, D=E4, F=F4, G=G4, H=A4, J=B4, K=C5 */
export const DEFAULT_KEY_MAP: KeyMapping = {
  bindings: {
    KeyA: 'C4',
    KeyS: 'D4',
    KeyD: 'E4',
    KeyF: 'F4',
    KeyG: 'G4',
    KeyH: 'A4',
    KeyJ: 'B4',
    KeyK: 'C5',
  },
};

const STORAGE_KEY = 'keybop-keymap';

export function loadKeyMap(): KeyMapping {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.bindings && typeof parsed.bindings === 'object') {
        return parsed as KeyMapping;
      }
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_KEY_MAP;
}

export function saveKeyMap(keyMap: KeyMapping): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keyMap));
}
