import { useCallback, useRef } from 'react';
import { playHoverSound } from '../utils/sounds';

const COOLDOWN_MS = 80;

export function useDirectionSound() {
  const lastPos = useRef({ x: 0, y: 0 });
  const lastDir = useRef({ dx: 0, dy: 0 });
  const lastTime = useRef(0);

  const onMouseMove = useCallback((e) => {
    const now = performance.now();
    const x = e.clientX;
    const y = e.clientY;
    const dx = x - lastPos.current.x;
    const dy = y - lastPos.current.y;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag < 4) {
      lastPos.current = { x, y };
      return;
    }

    const dot = dx * lastDir.current.dx + dy * lastDir.current.dy;
    const dirChanged = dot < 0;

    if (dirChanged && now - lastTime.current > COOLDOWN_MS) {
      playHoverSound();
      lastTime.current = now;
    }

    lastDir.current = { dx, dy };
    lastPos.current = { x, y };
  }, []);

  const onMouseEnter = useCallback((e) => {
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastDir.current = { dx: 0, dy: 0 };
    playHoverSound();
  }, []);

  return { onMouseMove, onMouseEnter };
}
