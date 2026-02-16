import { useRef, useCallback, useEffect } from 'react';
import { GameEngine, type EngineStateSnapshot } from '../engine/GameEngine';
import type { Sequence } from '../types/sequence';
import type { KeyMapping } from '../types/input';
import { useGameContext } from '../context/useGameContext';

/**
 * useGameEngine — bridges the canvas ref to the game engine.
 * Exposes start/pause/resume/stop methods for React components.
 */
export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<GameEngine | null>(null);
  const { state, dispatch } = useGameContext();

  const handleStateChange = useCallback(
    (snapshot: EngineStateSnapshot) => {
      dispatch({ type: 'UPDATE_SCORE', score: snapshot.score });
      if (snapshot.status === 'finished') {
        dispatch({ type: 'SET_STATUS', status: 'finished' });
      }
    },
    [dispatch],
  );

  const start = useCallback(
    (sequence: Sequence, keyMap: KeyMapping) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Destroy previous engine if any
      engineRef.current?.destroy();

      const engine = new GameEngine(
        canvas,
        { speedMultiplier: state.config.speedMultiplier },
        handleStateChange,
      );
      engineRef.current = engine;

      dispatch({ type: 'RESET_SCORE' });
      dispatch({ type: 'SET_STATUS', status: 'playing' });
      engine.start(sequence, keyMap);
    },
    [canvasRef, state.config.speedMultiplier, handleStateChange, dispatch],
  );

  const pause = useCallback(() => {
    engineRef.current?.pause();
    dispatch({ type: 'SET_STATUS', status: 'paused' });
  }, [dispatch]);

  const resume = useCallback(() => {
    engineRef.current?.resume();
    dispatch({ type: 'SET_STATUS', status: 'playing' });
  }, [dispatch]);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  return { start, pause, resume, stop };
}
