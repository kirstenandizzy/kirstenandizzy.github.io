import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_WANDER_SPEED = 60;       // px/s
const CLEAR_SPEED = 200;       // px/s — hustle away from landing zone
const DEFAULT_MIN_IDLE_TIME = 3000;    // ms
const DEFAULT_MAX_IDLE_TIME = 8000;    // ms
const DEFAULT_MIN_WALK_DIST = 60;      // px
const DEFAULT_MAX_WALK_DIST = 180;     // px
const OVERLAP_THRESHOLD = 70;  // px — minimum spacing between NPCs when picking targets
const PROXIMITY_STOP = 55;     // px — stop walking if another NPC is this close ahead
const BASE_EDGE_BIAS = 0.15;  // base fraction of distance-to-edge for initial clear walk
const SCALE_EDGE_BONUS = 0.02; // extra fraction per unit of scale (bigger NPCs go further out)

export default function useNPCBehavior({ enabled = false, initialX = 0, bounds, getNPCPositions, scale = 2, npcId, wanderSpeed, minIdleTime, maxIdleTime, minWalkDist, maxWalkDist }) {
  const WANDER_SPEED = wanderSpeed ?? DEFAULT_WANDER_SPEED;
  const MIN_IDLE_TIME = minIdleTime ?? DEFAULT_MIN_IDLE_TIME;
  const MAX_IDLE_TIME = maxIdleTime ?? DEFAULT_MAX_IDLE_TIME;
  const MIN_WALK_DIST = minWalkDist ?? DEFAULT_MIN_WALK_DIST;
  const MAX_WALK_DIST = maxWalkDist ?? DEFAULT_MAX_WALK_DIST;
  const [x, setX] = useState(initialX);
  const [facing, setFacing] = useState('right');
  const [isWalking, setIsWalking] = useState(false);

  const xRef = useRef(initialX);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const lastTimeRef = useRef(0);
  const boundsRef = useRef(bounds);
  const getNPCPositionsRef = useRef(getNPCPositions);

  boundsRef.current = bounds;
  getNPCPositionsRef.current = getNPCPositions;

  // Sync initialX from physics only while behavior is disabled
  useEffect(() => {
    if (!enabled) {
      xRef.current = initialX;
      setX(initialX);
    }
  }, [initialX, enabled]);

  const getOtherPositions = useCallback(() => {
    const positions = getNPCPositionsRef.current ? getNPCPositionsRef.current() : [];
    return positions.filter((pos) => pos.id !== npcId);
  }, [npcId]);

  const findNonOverlappingX = useCallback((targetX, dir) => {
    const others = getOtherPositions();
    let adjustedX = targetX;

    for (let i = 0; i < 8; i++) {
      const overlapping = others.some(
        (pos) => Math.abs(pos.x - adjustedX) < OVERLAP_THRESHOLD
      );
      if (!overlapping) break;
      adjustedX += dir === 'right' ? OVERLAP_THRESHOLD : -OVERLAP_THRESHOLD;
    }

    return adjustedX;
  }, [getOtherPositions]);

  const isNPCAhead = useCallback((currentX, moveDir) => {
    const others = getOtherPositions();
    return others.some((pos) => {
      const diff = pos.x - currentX;
      const ahead = moveDir > 0 ? diff > 0 : diff < 0;
      return ahead && Math.abs(diff) < PROXIMITY_STOP;
    });
  }, [getOtherPositions]);

  const doWalk = useCallback((targetX, dir, onComplete, speed = WANDER_SPEED, skipProximity = false) => {
    const b = boundsRef.current;
    const finalTarget = Math.max(b.left, Math.min(b.right, targetX));

    if (Math.abs(finalTarget - xRef.current) < 1) {
      if (onComplete) onComplete();
      return;
    }

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

      if (!skipProximity && isNPCAhead(xRef.current, moveDir)) {
        setX(xRef.current);
        setIsWalking(false);
        lastTimeRef.current = 0;
        if (onComplete) onComplete();
        return;
      }

      xRef.current += moveDir * speed * dt;

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
  }, [isNPCAhead]);

  const doWalkRef = useRef(doWalk);
  const findNonOverlappingXRef = useRef(findNonOverlappingX);
  doWalkRef.current = doWalk;
  findNonOverlappingXRef.current = findNonOverlappingX;

  // Pick direction and walk — handles edge, stacking, and normal wandering in one flow
  const pickAndWalk = useCallback((onComplete) => {
    const b = boundsRef.current;
    const cur = xRef.current;
    const distToLeft = cur - b.left;
    const distToRight = b.right - cur;
    const edgeMargin = 30;

    let dir;
    let skipProximity = false;

    // Priority 1: escape edge
    if (distToLeft < edgeMargin) {
      dir = 'right';
      skipProximity = true;
    } else if (distToRight < edgeMargin) {
      dir = 'left';
      skipProximity = true;
    } else {
      // Priority 2: escape stack
      const others = getOtherPositions();
      const stacked = others.find((pos) => Math.abs(pos.x - cur) < OVERLAP_THRESHOLD);
      if (stacked) {
        dir = stacked.x < cur ? 'right' : 'left';
        skipProximity = true;
      } else {
        // Normal: edge-biased random direction
        const nearestEdge = distToLeft < distToRight ? 'left' : 'right';
        const edgeChance = Math.min(0.75 + scale * 0.05, 0.95);
        dir = Math.random() < edgeChance ? nearestEdge : (nearestEdge === 'left' ? 'right' : 'left');
      }
    }

    const dist = MIN_WALK_DIST + Math.random() * (MAX_WALK_DIST - MIN_WALK_DIST);
    const rawTarget = dir === 'right' ? cur + dist : cur - dist;
    const adjusted = findNonOverlappingXRef.current(rawTarget, dir);
    doWalkRef.current(adjusted, dir, onComplete, WANDER_SPEED, skipProximity);
  }, [scale, getOtherPositions, WANDER_SPEED, MIN_WALK_DIST, MAX_WALK_DIST]);

  const scheduleWander = useCallback(() => {
    const delay = MIN_IDLE_TIME + Math.random() * (MAX_IDLE_TIME - MIN_IDLE_TIME);
    timerRef.current = setTimeout(() => {
      pickAndWalk(scheduleWander);
    }, delay);
  }, [MIN_IDLE_TIME, MAX_IDLE_TIME, pickAndWalk]);

  // After clear walk: if stacked or at edge, walk immediately; otherwise start idle/wander loop
  const unstackOrWander = useCallback(() => {
    const b = boundsRef.current;
    const cur = xRef.current;
    const distToLeft = cur - b.left;
    const distToRight = b.right - cur;
    const edgeMargin = 30;
    const others = getOtherPositions();
    const stacked = others.find((pos) => Math.abs(pos.x - cur) < OVERLAP_THRESHOLD);

    if (distToLeft < edgeMargin || distToRight < edgeMargin || stacked) {
      pickAndWalk(scheduleWander);
    } else {
      scheduleWander();
    }
  }, [getOtherPositions, pickAndWalk, scheduleWander]);

  const scheduleWanderRef = useRef(scheduleWander);
  const unstackOrWanderRef = useRef(unstackOrWander);
  scheduleWanderRef.current = scheduleWander;
  unstackOrWanderRef.current = unstackOrWander;

  // Main behavior effect — idempotent so StrictMode cleanup+re-fire works
  useEffect(() => {
    if (!enabled) return;

    const b = boundsRef.current;
    const startPos = xRef.current;
    const distToLeft = Math.abs(startPos - b.left);
    const distToRight = Math.abs(startPos - b.right);
    const dir = distToLeft <= distToRight ? 'left' : 'right';

    // Walk 20px * scale toward nearest edge, then continue to full edge target
    const quickDist = 20 * scale;
    const quickTarget = dir === 'right' ? startPos + quickDist : startPos - quickDist;

    doWalkRef.current(quickTarget, dir, () => {
      const minFrac = BASE_EDGE_BIAS + scale * SCALE_EDGE_BONUS;
      const maxFrac = Math.min(minFrac + 0.15, 0.5);
      const distToEdge = dir === 'left' ? Math.abs(xRef.current - b.left) : Math.abs(b.right - xRef.current);
      if (distToEdge < 5) { unstackOrWanderRef.current(); return; }
      const dist = distToEdge * (minFrac + Math.random() * (maxFrac - minFrac));
      const rawTarget = dir === 'right' ? xRef.current + dist : xRef.current - dist;
      const adjusted = findNonOverlappingXRef.current(rawTarget, dir);
      doWalkRef.current(adjusted, dir, unstackOrWanderRef.current, CLEAR_SPEED, true);
    }, CLEAR_SPEED, true);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      setIsWalking(false);
      // Reset position so StrictMode re-fire starts from landing spot
      xRef.current = startPos;
    };
  }, [enabled, scale]);

  return { x, facing, isWalking };
}
