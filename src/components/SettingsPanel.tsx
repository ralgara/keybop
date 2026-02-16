import KeyMapEditor from './KeyMapEditor';
import type { KeyMapping } from '../types/input';
import { SPEED_MULTIPLIERS } from '../engine/constants';

interface Props {
  keyMap: KeyMapping;
  speedMultiplier: number;
  onKeyMapChange: (keyMap: KeyMapping) => void;
  onSpeedChange: (speed: number) => void;
}

export default function SettingsPanel({ keyMap, speedMultiplier, onKeyMapChange, onSpeedChange }: Props) {
  return (
    <div className="settings-panel">
      <h3>Settings</h3>

      <div className="settings-group">
        <label className="settings-label">Speed</label>
        <div className="speed-toggle">
          <button
            className={`btn btn-speed ${speedMultiplier === SPEED_MULTIPLIERS.SLOW ? 'active' : ''}`}
            onClick={() => onSpeedChange(SPEED_MULTIPLIERS.SLOW)}
          >
            Slow (0.5x)
          </button>
          <button
            className={`btn btn-speed ${speedMultiplier === SPEED_MULTIPLIERS.NORMAL ? 'active' : ''}`}
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
