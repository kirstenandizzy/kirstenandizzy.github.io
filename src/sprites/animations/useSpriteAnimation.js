import { useState, useEffect, useRef, useCallback } from 'react';

export default function useSpriteAnimation({ frames, fps = 10, loop = true, playing = true, onComplete, holdLastFrame = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const indexRef = useRef(0);
  const playingRef = useRef(playing);
  const holdCountRef = useRef(0);

  playingRef.current = playing;

  const interval = fps > 0 ? 1000 / fps : 0;

  const reset = useCallback(() => {
    setCurrentIndex(0);
    indexRef.current = 0;
    lastTimeRef.current = 0;
  }, []);

  useEffect(() => {
    // Reset index when frames change
    indexRef.current = 0;
    setCurrentIndex(0);
    lastTimeRef.current = 0;
    holdCountRef.current = 0;
  }, [frames]);

  useEffect(() => {
    if (!playing || interval === 0 || frames.length <= 1) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (playing && frames.length <= 1 && !loop && onComplete) {
        const t = setTimeout(onComplete, 500);
        return () => clearTimeout(t);
      }
      return;
    }

    const tick = (timestamp) => {
      if (!playingRef.current) return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;

      if (elapsed >= interval) {
        lastTimeRef.current = timestamp - (elapsed % interval);
        const nextIndex = indexRef.current + 1;

        if (nextIndex >= frames.length) {
          if (loop) {
            indexRef.current = 0;
            setCurrentIndex(0);
          } else if (holdCountRef.current < holdLastFrame) {
            // Hold on last frame for extra ticks before completing
            holdCountRef.current += 1;
          } else {
            if (onComplete) onComplete();
            return;
          }
        } else {
          indexRef.current = nextIndex;
          setCurrentIndex(nextIndex);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frames, interval, loop, playing, onComplete, holdLastFrame]);

  return {
    currentFrame: frames[currentIndex] || frames[0],
    play: useCallback(() => { playingRef.current = true; }, []),
    pause: useCallback(() => { playingRef.current = false; }, []),
    reset,
  };
}
