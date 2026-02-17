import { useEffect, useCallback } from 'react';
import { PianoRollCanvas } from './PianoRollCanvas.tsx';
import { HUD } from './HUD.tsx';
import { useGameEngine } from '../hooks/useGameEngine.ts';
import { useGameState } from '../hooks/useGameState.ts';
import type { EngineStateSnapshot } from '../engine/GameEngine.ts';

export function GameScreen() {
  const { state, dispatch } = useGameState();

  const handleStateChange = useCallback(
    (snapshot: EngineStateSnapshot) => {
      if (snapshot.finished) {
        dispatch({ type: 'FINISH_GAME', score: snapshot.score });
      } else {
        dispatch({ type: 'UPDATE_SCORE', score: snapshot.score });
      }
    },
    [dispatch],
  );

  const { canvasRef, start, pause, resume } = useGameEngine(handleStateChange);

  // Start the game when component mounts
  useEffect(() => {
    if (state.selectedSequence && state.status === 'playing') {
      start(state.selectedSequence, state.keyMap, state.config);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Escape key for pause/resume
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (state.status === 'playing') {
          pause();
          dispatch({ type: 'PAUSE_GAME' });
        } else if (state.status === 'paused') {
          resume();
          dispatch({ type: 'RESUME_GAME' });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, pause, resume, dispatch]);

  return (
    <div className="game-screen">
      <HUD score={state.score} />
      <div className="canvas-container">
        <PianoRollCanvas canvasRef={canvasRef} />
        {state.status === 'paused' && (
          <div className="pause-overlay">
            <h2>Paused</h2>
            <p>Press Escape to resume</p>
          </div>
        )}
      </div>
    </div>
  );
}
