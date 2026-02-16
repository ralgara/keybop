import { useGameState } from '../hooks/useGameState';

/**
 * HUD — score/combo/grade DOM overlay displayed on top of the canvas.
 */
export default function HUD() {
  const { score, status } = useGameState();

  if (status !== 'playing' && status !== 'paused') return null;

  return (
    <div className="hud">
      <div className="hud-left">
        <div className="hud-score">{score.score}</div>
        {score.combo >= 2 && (
          <div className="hud-combo">x{score.combo}</div>
        )}
      </div>
      <div className="hud-right">
        <div className="hud-stats">
          <span className="hud-perfect">{score.perfectCount}</span>
          <span className="hud-good">{score.goodCount}</span>
          <span className="hud-miss">{score.missCount}</span>
        </div>
      </div>
      {status === 'paused' && (
        <div className="hud-pause-overlay">
          <div className="hud-pause-text">PAUSED</div>
          <div className="hud-pause-hint">Press Escape to resume</div>
        </div>
      )}
    </div>
  );
}
