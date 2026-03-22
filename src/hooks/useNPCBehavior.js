import { useState, useEffect, useRef, useCallback } from 'react';

const WANDER_SPEED = 60;       // px/s
const MIN_IDLE_TIME = 3000;    // ms
const MAX_IDLE_TIME = 8000;    // ms
const MIN_WALK_DIST = 30;      // px
const MAX_WALK_DIST = 80;      // px
const OVERLAP_THRESHOLD = 20;  // px — acceptable overlap before adjusting
const MIN_CLEAR_DIST = 50;     // px — minimum distance to walk away from landing zone
const MAX_CLEAR_DIST = 100;    // px — maximum distance to walk away from landing zone

export default function useNPCBehavior({ enabled = false, initialX = 0, bounds, getNPCPositions }) {
  const [x, setX] = useState(initialX);
  const [facing, setFacing] = useState('right');
  const [isWalking, setIsWalking] = useState(false);

  const xRef = useRef(initialX);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const lastTimeRef = useRef(0);
  const hasCleared = useRef(false);
  const boundsRef = useRef(bounds);
  const getNPCPositionsRef = useRef(getNPCPositions);

  boundsRef.current = bounds;
  getNPCPositionsRef.current = getNPCPositions;

  // Sync initialX when it changes (handoff from physics)
  useEffect(() => {
    xRef.current = initialX;
    setX(initialX);
  }, [initialX]);

  const findNonOverlappingX = useCallback((targetX, dir) => {
    const positions = getNPCPositionsRef.current ? getNPCPositionsRef.current() : [];
    let adjustedX = targetX;

    for (let i = 0; i < 5; i++) {
      const overlapping = positions.some(
        (pos) => Math.abs(pos.x - adjustedX) < OVERLAP_THRESHOLD
      );
      if (!overlapping) break;
      adjustedX += dir === 'right' ? OVERLAP_THRESHOLD : -OVERLAP_THRESHOLD;
    }

    return adjustedX;
  }, []);

  const startWalk = useCallback((targetX, dir, onComplete) => {
    const b = boundsRef.current;
    const finalTarget = Math.max(b.left, Math.min(b.right, targetX));
    setFacing(dir === 'right' ? 'right' : 'left');
    setIsWalking(true);
    lastTimeRef.current = 0;

    const walk = (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(walk);
        return;
      }

      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const moveDir = finalTarget > xRef.current ? 1 : -1;
      xRef.current += moveDir * WANDER_SPEED * dt;

      if ((moveDir > 0 && xRef.current >= finalTarget) ||
          (moveDir < 0 && xRef.current <= finalTarget)) {
        xRef.current = finalTarget;
        setX(finalTarget);
        setIsWalking(false);
        lastTimeRef.current = 0;
        if (onComplete) onComplete();
        return;
      }

      setX(xRef.current);
      rafRef.current = requestAnimationFrame(walk);
    };

    rafRef.current = requestAnimationFrame(walk);
  }, []);

  const scheduleWander = useCallback(() => {
    const delay = MIN_IDLE_TIME + Math.random() * (MAX_IDLE_TIME - MIN_IDLE_TIME);
    timerRef.current = setTimeout(() => {
      const dir = Math.random() < 0.5 ? 'left' : 'right';
      const dist = MIN_WALK_DIST + Math.random() * (MAX_WALK_DIST - MIN_WALK_DIST);
      const rawTarget = dir === 'right' ? xRef.current + dist : xRef.current - dist;
      const adjusted = findNonOverlappingX(rawTarget, dir);
      startWalk(adjusted, dir, scheduleWander);
    }, delay);
  }, [findNonOverlappingX, startWalk]);

  useEffect(() => {
    if (!enabled) return;

    if (!hasCleared.current) {
      hasCleared.current = true;
      const dir = Math.random() < 0.5 ? 'left' : 'right';
      const dist = MIN_CLEAR_DIST + Math.random() * (MAX_CLEAR_DIST - MIN_CLEAR_DIST);
      const rawTarget = dir === 'right' ? xRef.current + dist : xRef.current - dist;
      const adjusted = findNonOverlappingX(rawTarget, dir);
      startWalk(adjusted, dir, scheduleWander);
    } else {
      scheduleWander();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      setIsWalking(false);
    };
  }, [enabled, scheduleWander, findNonOverlappingX, startWalk]);

  return { x, facing, isWalking };
}
