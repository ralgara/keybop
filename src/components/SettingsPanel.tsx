import { KeyMapEditor } from './KeyMapEditor.tsx';
import { SPEED_MULTIPLIERS } from '../engine/constants.ts';
import type { KeyMapping } from '../types/index.ts';

interface SettingsPanelProps {
  keyMap: KeyMapping;
  speedMultiplier: number;
  onKeyMapChange: (keyMap: KeyMapping) => void;
  onSpeedChange: (speed: number) => void;
}

export function SettingsPanel({
  keyMap,
  speedMultiplier,
  onKeyMapChange,
  onSpeedChange,
}: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>
      <div className="speed-toggle">
        <label>Speed:</label>
        <div className="speed-buttons">
          <button
            className={speedMultiplier === SPEED_MULTIPLIERS.SLOW ? 'active' : ''}
            onClick={() => onSpeedChange(SPEED_MULTIPLIERS.SLOW)}
          >
            Slow (0.5x)
          </button>
          <button
            className={speedMultiplier === SPEED_MULTIPLIERS.NORMAL ? 'active' : ''}
            onClick={() => onSpeedChange(SPEED_MULTIPLIERS.NORMAL)}
          >
            Normal (1x)
          </button>
        </div>
      </div>
      <KeyMapEditor keyMap={keyMap} onChange={onKeyMapChange} />
    </div>
  );
}
