import { useRef, useCallback, useEffect } from 'react';
import { GameEngine } from '../engine/GameEngine.ts';
import type { EngineStateSnapshot } from '../engine/GameEngine.ts';
import type { Sequence, KeyMapping, GameConfig } from '../types/index.ts';

interface UseGameEngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  start: (sequence: Sequence, keyMap: KeyMapping, config: GameConfig) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useGameEngine(
  onStateChange: (snapshot: EngineStateSnapshot) => void,
): UseGameEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  const start = useCallback((sequence: Sequence, keyMap: KeyMapping, config: GameConfig) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy previous engine
    engineRef.current?.destroy();

    const engine = new GameEngine(canvas, config, (snapshot) => {
      onStateChangeRef.current(snapshot);
    });
    engine.configure(sequence, keyMap);
    engineRef.current = engine;
    engine.start();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  return { canvasRef, start, pause, resume, stop };
}
