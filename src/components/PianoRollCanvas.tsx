import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CANVAS } from '../engine/constants';

/**
 * PianoRollCanvas — thin <canvas> wrapper that exposes its ref
 * and handles responsive sizing.
 */
const PianoRollCanvas = forwardRef<HTMLCanvasElement>(function PianoRollCanvas(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = Math.max(parent.clientHeight, CANVAS.DEFAULT_HEIGHT);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  );
});

export default PianoRollCanvas;
