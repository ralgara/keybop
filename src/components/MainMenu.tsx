import { useState } from 'react';
import SequenceSelector from './SequenceSelector';
import SettingsPanel from './SettingsPanel';
import { useGameContext } from '../context/useGameContext';
import { getSequenceById } from '../data/sequences';

export default function MainMenu() {
  const { state, dispatch } = useGameContext();
  const [showSettings, setShowSettings] = useState(false);

  const selectedId = state.selectedSequence?.metadata.id ?? null;

  const handleSelectSequence = (id: string) => {
    const seq = getSequenceById(id);
    if (seq) {
      dispatch({ type: 'SELECT_SEQUENCE', sequence: seq });
    }
  };

  const handleStart = () => {
    if (!state.selectedSequence) return;
    dispatch({ type: 'SET_STATUS', status: 'playing' });
  };

  const handleKeyMapChange = (keyMap: typeof state.keyMap) => {
    dispatch({ type: 'SET_KEY_MAP', keyMap });
  };

  const handleSpeedChange = (speed: number) => {
    dispatch({ type: 'SET_SPEED', speedMultiplier: speed });
  };

  return (
    <div className="main-menu">
      <h1 className="title">KeyBop</h1>
      <p className="subtitle">Finger Dexterity Trainer</p>

      <SequenceSelector
        sequences={state.availableSequences}
        selectedId={selectedId}
        onSelect={handleSelectSequence}
      />

      <div className="menu-actions">
        <button
          className="btn btn-primary"
          disabled={!state.selectedSequence}
          onClick={handleStart}
        >
          Start
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? 'Hide Settings' : 'Settings'}
        </button>
      </div>

      {showSettings && (
        <SettingsPanel
          keyMap={state.keyMap}
          speedMultiplier={state.config.speedMultiplier}
          onKeyMapChange={handleKeyMapChange}
          onSpeedChange={handleSpeedChange}
        />
      )}
    </div>
  );
}
