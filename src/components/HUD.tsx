import type { ScoreSnapshot } from '../types/index.ts';

interface HUDProps {
  score: ScoreSnapshot;
}

export function HUD({ score }: HUDProps) {
  return (
    <div className="hud">
      <div className="hud-score">
        <span className="hud-label">Score</span>
        <span className="hud-value">{score.score.toLocaleString()}</span>
      </div>
      <div className="hud-combo">
        <span className="hud-label">Combo</span>
        <span className="hud-value">{score.combo}</span>
      </div>
      <div className="hud-accuracy">
        <span className="hud-label">Accuracy</span>
        <span className="hud-value">
          {score.perfectCount + score.goodCount + score.missCount > 0
            ? Math.round(
                ((score.perfectCount + score.goodCount) /
                  (score.perfectCount + score.goodCount + score.missCount)) *
                  100,
              )
            : 100}
          %
        </span>
      </div>
    </div>
  );
}
