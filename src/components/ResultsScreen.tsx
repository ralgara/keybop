import { useGameState } from '../hooks/useGameState.ts';

export function ResultsScreen() {
  const { state, dispatch } = useGameState();
  const { score } = state;

  const totalHits = score.perfectCount + score.goodCount + score.missCount;
  const accuracy = totalHits > 0
    ? Math.round(((score.perfectCount + score.goodCount) / totalHits) * 100)
    : 0;

  function getGrade(): string {
    if (accuracy >= 95 && score.perfectCount / Math.max(totalHits, 1) > 0.8) return 'S';
    if (accuracy >= 90) return 'A';
    if (accuracy >= 75) return 'B';
    if (accuracy >= 60) return 'C';
    return 'D';
  }

  function handlePlayAgain() {
    dispatch({ type: 'START_GAME' });
  }

  function handleMenu() {
    dispatch({ type: 'RETURN_TO_MENU' });
  }

  return (
    <div className="results-screen">
      <h1>Results</h1>
      <div className="results-grade">{getGrade()}</div>
      <div className="results-title">{state.selectedSequence?.metadata.title}</div>

      <div className="results-stats">
        <div className="stat-row">
          <span className="stat-label">Score</span>
          <span className="stat-value">{score.score.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Accuracy</span>
          <span className="stat-value">{accuracy}%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Max Combo</span>
          <span className="stat-value">{score.maxCombo}</span>
        </div>
        <div className="stat-row perfect">
          <span className="stat-label">Perfect</span>
          <span className="stat-value">{score.perfectCount}</span>
        </div>
        <div className="stat-row good">
          <span className="stat-label">Good</span>
          <span className="stat-value">{score.goodCount}</span>
        </div>
        <div className="stat-row miss">
          <span className="stat-label">Miss</span>
          <span className="stat-value">{score.missCount}</span>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={handlePlayAgain}>
          Play Again
        </button>
        <button className="btn-secondary" onClick={handleMenu}>
          Menu
        </button>
      </div>
    </div>
  );
}
