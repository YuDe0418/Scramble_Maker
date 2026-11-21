import { useEffect } from 'react';
import { useCubeStore } from '../stores/cubeStore';
import { playTurnSound, unlockTurnSound } from '../utils/turnSound';

export function usePlayback(onComplete: () => void) {
  const playing = useCubeStore((state) => state.playing);

  useEffect(() => {
    if (!playing) return;
    let frame: number;
    let lastTime = performance.now();
    function tick(now: number) {
      const before = useCubeStore.getState();
      if (!before.playing) return;
      before.advance(Math.max(0, Math.min(80, now - lastTime)));
      lastTime = now;
      const after = useCubeStore.getState();
      if (before.sound && before.cursor !== after.cursor) playTurnSound();
      if (after.playing) frame = requestAnimationFrame(tick);
      else if (after.cursor === after.moves.length) onComplete();
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete, playing]);

  useEffect(() => {
    function onGesture() { if (useCubeStore.getState().sound) unlockTurnSound(); }
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, []);
}
