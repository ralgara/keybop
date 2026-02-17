import { useState } from 'react';
import { SequenceSelector } from './SequenceSelector.tsx';
import { SettingsPanel } from './SettingsPanel.tsx';
import { useGameState } from '../hooks/useGameState.ts';
import { getSequenceById } from '../data/sequenceLoader.ts';
import { saveKeyMap } from '../data/defaultKeyMap.ts';
import type { KeyMapping } from '../types/index.ts';

export function MainMenu() {
  const { state, dispatch } = useGameState();
  const [showSettings, setShowSettings] = useState(false);

  const selectedId = state.selectedSequence?.metadata.id ?? null;

  function handleSelectSequence(id: string) {
    const seq = getSequenceById(id);
    if (seq) {
      dispatch({ type: 'SELECT_SEQUENCE', sequence: seq });
    }
  }

  function handleStart() {
    if (!state.selectedSequence) return;
    dispatch({ type: 'START_GAME' });
  }

  function handleKeyMapChange(keyMap: KeyMapping) {
    saveKeyMap(keyMap);
    dispatch({ type: 'SET_KEY_MAP', keyMap });
  }

  function handleSpeedChange(speed: number) {
    dispatch({ type: 'SET_SPEED', speed });
  }

  return (
    <div className="main-menu">
      <h1 className="title">KeyBop</h1>
      <p className="subtitle">Finger Dexterity Trainer</p>

      {showSettings ? (
        <>
          <SettingsPanel
            keyMap={state.keyMap}
            speedMultiplier={state.config.speedMultiplier}
            onKeyMapChange={handleKeyMapChange}
            onSpeedChange={handleSpeedChange}
          />
          <button className="btn-secondary" onClick={() => setShowSettings(false)}>
            Back
          </button>
        </>
      ) : (
        <>
          <SequenceSelector
            sequences={state.availableSequences}
            selectedId={selectedId}
            onSelect={handleSelectSequence}
          />
          <div className="menu-actions">
            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={!state.selectedSequence}
            >
              Start
            </button>
            <button className="btn-secondary" onClick={() => setShowSettings(true)}>
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}
