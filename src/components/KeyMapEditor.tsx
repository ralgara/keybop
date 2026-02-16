import { useState, useEffect, useCallback } from 'react';
import type { KeyMapping } from '../types/input';
import { DEFAULT_KEY_MAP, saveKeyMap } from '../data/defaultKeyMap';

interface Props {
  keyMap: KeyMapping;
  onChange: (keyMap: KeyMapping) => void;
}

export default function KeyMapEditor({ keyMap, onChange }: Props) {
  const [listening, setListening] = useState<string | null>(null); // noteId being reassigned

  const entries = Object.entries(keyMap.bindings)
    .sort((a, b) => a[1].localeCompare(b[1]));

  const handleAssign = useCallback(
    (e: KeyboardEvent) => {
      if (!listening) return;
      e.preventDefault();

      const code = e.code;
      // Don't allow Escape or special keys
      if (code === 'Escape') {
        setListening(null);
        return;
      }

      // Remove any existing binding for this code
      const newBindings = { ...keyMap.bindings };
      for (const [existingCode, noteId] of Object.entries(newBindings)) {
        if (existingCode === code && noteId !== listening) {
          delete newBindings[existingCode];
        }
      }

      // Remove old binding for this note
      for (const [existingCode, noteId] of Object.entries(newBindings)) {
        if (noteId === listening) {
          delete newBindings[existingCode];
        }
      }

      // Set new binding
      newBindings[code] = listening;

      const newKeyMap: KeyMapping = { bindings: newBindings };
      saveKeyMap(newKeyMap);
      onChange(newKeyMap);
      setListening(null);
    },
    [listening, keyMap.bindings, onChange],
  );

  useEffect(() => {
    if (listening) {
      window.addEventListener('keydown', handleAssign);
      return () => window.removeEventListener('keydown', handleAssign);
    }
  }, [listening, handleAssign]);

  const handleReset = () => {
    saveKeyMap(DEFAULT_KEY_MAP);
    onChange(DEFAULT_KEY_MAP);
  };

  return (
    <div className="keymap-editor">
      <h3>Key Bindings</h3>
      <div className="keymap-list">
        {entries.map(([code, noteId]) => (
          <div key={noteId} className="keymap-row">
            <span className="keymap-note">{noteId}</span>
            <button
              className={`keymap-key ${listening === noteId ? 'listening' : ''}`}
              onClick={() => setListening(listening === noteId ? null : noteId)}
            >
              {listening === noteId ? 'Press a key...' : code.replace('Key', '')}
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-small" onClick={handleReset}>
        Reset to Default
      </button>
    </div>
  );
}
