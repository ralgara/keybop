import { useEffect } from 'react';
import { CANVAS } from '../engine/constants.ts';

interface PianoRollCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function PianoRollCanvas({ canvasRef }: PianoRollCanvasProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = Math.min(parent.clientWidth, CANVAS.DEFAULT_WIDTH);
        canvas.height = CANVAS.DEFAULT_HEIGHT;
      }
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS.DEFAULT_WIDTH}
      height={CANVAS.DEFAULT_HEIGHT}
      style={{
        display: 'block',
        margin: '0 auto',
        borderRadius: '8px',
      }}
    />
  );
}
