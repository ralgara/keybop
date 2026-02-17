import { useState, useEffect, useCallback } from 'react';
import type { KeyMapping } from '../types/index.ts';

interface KeyMapEditorProps {
  keyMap: KeyMapping;
  onChange: (keyMap: KeyMapping) => void;
}

export function KeyMapEditor({ keyMap, onChange }: KeyMapEditorProps) {
  const [listeningFor, setListeningFor] = useState<string | null>(null);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!listeningFor) return;
      e.preventDefault();

      const newBindings = { ...keyMap.bindings };
      // Remove any existing binding for this code
      for (const [code, noteId] of Object.entries(newBindings)) {
        if (code === e.code && noteId !== listeningFor) {
          delete newBindings[code];
        }
      }
      // Remove old binding for this note
      for (const [code, noteId] of Object.entries(newBindings)) {
        if (noteId === listeningFor) {
          delete newBindings[code];
        }
      }
      // Set new binding
      newBindings[e.code] = listeningFor;
      onChange({ bindings: newBindings });
      setListeningFor(null);
    },
    [listeningFor, keyMap.bindings, onChange],
  );

  useEffect(() => {
    if (listeningFor) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [listeningFor, handleKeyPress]);

  const entries = Object.entries(keyMap.bindings);

  return (
    <div className="keymap-editor">
      <h3>Key Bindings</h3>
      <div className="keymap-grid">
        {entries.map(([code, noteId]) => {
          const displayKey = code.startsWith('Key') ? code.slice(3) : code;
          const isListening = listeningFor === noteId;
          return (
            <button
              key={noteId}
              className={`keymap-item ${isListening ? 'listening' : ''}`}
              onClick={() => setListeningFor(isListening ? null : noteId)}
            >
              <span className="keymap-note">{noteId}</span>
              <span className="keymap-key">
                {isListening ? 'Press a key...' : displayKey}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
