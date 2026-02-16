import { useGameContext } from '../context/useGameContext';

export default function ResultsScreen() {
  const { state, dispatch } = useGameContext();
  const { score } = state;

  const totalHits = score.perfectCount + score.goodCount + score.missCount;
  const accuracy = totalHits > 0
    ? Math.round(((score.perfectCount + score.goodCount) / totalHits) * 100)
    : 0;

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_SCORE' });
    dispatch({ type: 'SET_STATUS', status: 'playing' });
  };

  const handleMenu = () => {
    dispatch({ type: 'RESET_SCORE' });
    dispatch({ type: 'SET_STATUS', status: 'menu' });
  };

  return (
    <div className="results-screen">
      <h2 className="results-title">Results</h2>

      <div className="results-score">{score.score}</div>

      <div className="results-breakdown">
        <div className="results-row">
          <span className="results-label">Accuracy</span>
          <span className="results-value">{accuracy}%</span>
        </div>
        <div className="results-row">
          <span className="results-label results-perfect">Perfect</span>
          <span className="results-value">{score.perfectCount}</span>
        </div>
        <div className="results-row">
          <span className="results-label results-good">Good</span>
          <span className="results-value">{score.goodCount}</span>
        </div>
        <div className="results-row">
          <span className="results-label results-miss">Miss</span>
          <span className="results-value">{score.missCount}</span>
        </div>
        <div className="results-row">
          <span className="results-label">Max Combo</span>
          <span className="results-value">{score.maxCombo}</span>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn btn-primary" onClick={handlePlayAgain}>
          Play Again
        </button>
        <button className="btn btn-secondary" onClick={handleMenu}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}
