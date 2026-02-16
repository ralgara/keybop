import { useRef, useEffect, useCallback } from 'react';
import PianoRollCanvas from './PianoRollCanvas';
import HUD from './HUD';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameContext } from '../context/useGameContext';

/**
 * GameScreen — main game view: canvas + HUD overlay.
 * Handles Escape key for pause/resume.
 */
export default function GameScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { start, pause, resume } = useGameEngine(canvasRef);
  const { state } = useGameContext();

  // Start the game when this component mounts (sequence must be selected)
  const hasStarted = useRef(false);
  useEffect(() => {
    if (!hasStarted.current && state.selectedSequence && state.status === 'playing') {
      // Engine is started by the menu; this is just the display
    }
  }, [state.selectedSequence, state.status]);

  // Expose start function via a ref so MainMenu can trigger it
  const startGame = useCallback(() => {
    if (state.selectedSequence) {
      start(state.selectedSequence, state.keyMap);
      hasStarted.current = true;
    }
  }, [state.selectedSequence, state.keyMap, start]);

  // Handle Escape for pause/resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (state.status === 'playing') {
          pause();
        } else if (state.status === 'paused') {
          resume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, pause, resume]);

  // Auto-start when mounted with a selected sequence
  useEffect(() => {
    if (state.selectedSequence && !hasStarted.current) {
      startGame();
    }
  }, [state.selectedSequence, startGame]);

  return (
    <div className="game-screen">
      <PianoRollCanvas ref={canvasRef} />
      <HUD />
    </div>
  );
}
