import { useState, useEffect, useRef, useCallback } from 'react';
import { TOTAL_ANGLES } from '../sprites/sheets/ship';

const LERP_SPEED = 0.005;        // slow drift toward target
const ENTRANCE_LERP = 0.018;    // fast drift for fly-in/fly-out (meandering)
const TARGET_THRESHOLD = 15;     // px — pick new target when this close
const MIN_Y = 150;               // minimum bottom offset (above buttons)
const MAX_Y = 675;               // maximum bottom offset
const MOBILE_MIN_Y = 150;        // mobile: push ship higher
const MOBILE_MAX_Y = 700;        // mobile: push ship higher
const MIN_PAUSE = 1000;          // ms — minimum idle pause at each waypoint
const MAX_PAUSE = 3500;          // ms — maximum idle pause at each waypoint
const MOVING_THRESHOLD = 0.15;   // speed below this = passengers idle
const MAX_TILT_FRAMES = 2;       // max sprite-frame tilt from horizontal
const FRAME_LERP = 0.12;         // how quickly displayed frame eases toward target

// Frame layout: 0=forward, 8=right, 16=backward, 24=left (32 total, clockwise)
// We only allow frames within ±MAX_TILT_FRAMES of horizontal (8 or 24).

export default function useShipMovement({ enabled = false, dismissing = false, bounds = { left: 0, right: 400 }, onExited }) {
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const minY = isMobile ? MOBILE_MIN_Y : MIN_Y;
  const rawMaxY = isMobile ? MOBILE_MAX_Y : MAX_Y;
  // Cap maxY so the top of the ship (including passengers & labels) stays visible
  // Full visual height above bottom edge: ~300px (195px ship + 75px passengers + 29px labels)
  const maxY = typeof window !== 'undefined'
    ? Math.min(rawMaxY, window.innerHeight - 300)
    : rawMaxY;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [angleIndex, setAngleIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [movingRight, setMovingRight] = useState(true);
  const [ready, setReady] = useState(false);

  const posRef = useRef({ x: 0, y: minY + 60 });
  const targetRef = useRef({ x: 0, y: minY + 60 });
  const rafRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const pausedRef = useRef(false);
  const enteringRef = useRef(true);
  const exitingRef = useRef(false);
  const exitCalledRef = useRef(false);
  const targetFrameRef = useRef(0);
  const smoothFrameRef = useRef(0);
  const facingRightRef = useRef(true);
  const boundsRef = useRef(bounds);
  const onExitedRef = useRef(onExited);
  boundsRef.current = bounds;
  onExitedRef.current = onExited;

  const minYRef = useRef(minY);
  const maxYRef = useRef(maxY);
  minYRef.current = minY;
  maxYRef.current = maxY;

  const pickTarget = useCallback(() => {
    const b = boundsRef.current;
    const padX = 60;
    const tx = (b.left + padX) + Math.random() * (b.right - b.left - padX * 2);
    const ty = minYRef.current + Math.random() * (maxYRef.current - minYRef.current);
    targetRef.current = { x: tx, y: ty };
  }, []);

  const startPause = useCallback(() => {
    pausedRef.current = true;
    const delay = MIN_PAUSE + Math.random() * (MAX_PAUSE - MIN_PAUSE);
    pauseTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      pickTarget();
    }, delay);
  }, [pickTarget]);

  // When dismissing flips to true, set exit target off-screen
  useEffect(() => {
    if (!dismissing || exitingRef.current) return;
    exitingRef.current = true;
    exitCalledRef.current = false;
    // Cancel any pause so it starts moving immediately
    pausedRef.current = false;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    // Exit toward whichever side is closer
    const b = boundsRef.current;
    const pos = posRef.current;
    const mid = (b.left + b.right) / 2;
    const exitRight = pos.x > mid;
    const vw = window.innerWidth;
    const exitX = exitRight ? vw + 3000 : -3000;
    const exitY = pos.y; // keep same height for a clean horizontal exit
    targetRef.current = { x: exitX, y: exitY };
    facingRightRef.current = exitRight;
  }, [dismissing]);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      return;
    }

    const b = boundsRef.current;
    // Start outside the actual viewport (clip div is 100vw)
    const vw = window.innerWidth;
    const fromRight = Math.random() > 0.5;
    const startX = fromRight ? vw + 300 : -300;
    const startY = (minYRef.current + maxYRef.current) / 2;
    posRef.current = { x: startX, y: startY };
    enteringRef.current = true;
    exitingRef.current = false;
    exitCalledRef.current = false;
    facingRightRef.current = !fromRight;
    const initFrame = fromRight ? 24 : 8;
    targetFrameRef.current = initFrame;
    smoothFrameRef.current = initFrame;
    setX(startX);
    setY(startY);
    setMovingRight(!fromRight);
    setAngleIndex(initFrame);
    setReady(true);
    // First target = random waypoint within bounds (ship meanders toward it)
    pickTarget();

    const tick = () => {
      const pos = posRef.current;
      const target = targetRef.current;

      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const isExiting = exitingRef.current;
      const speed = (enteringRef.current || isExiting) ? ENTRANCE_LERP : LERP_SPEED;

      if (!pausedRef.current) {
        pos.x += dx * speed;
        pos.y += dy * speed;
        // Clamp so ship never drifts above maxY (too close to viewport top)
        if (!isExiting) {
          pos.y = Math.min(pos.y, maxYRef.current);
        }

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (isExiting) {
          // Check if ship has fully left the viewport
          // The clip div is 100vw wide, so viewport in local coords is 0..innerWidth
          const vw = window.innerWidth;
          if (pos.x < -200 || pos.x > vw + 200) {
            if (!exitCalledRef.current) {
              exitCalledRef.current = true;
              onExitedRef.current?.();
            }
            return; // stop ticking
          }
        } else if (dist < TARGET_THRESHOLD) {
          if (enteringRef.current) {
            // During entrance: skip pause, immediately pick next waypoint.
            // Once the ship is within bounds, transition to normal idle.
            const b = boundsRef.current;
            if (pos.x > b.left + 60 && pos.x < b.right - 60) {
              enteringRef.current = false;
            }
            pickTarget();
          } else {
            startPause();
          }
        }
      }

      // Compute target frame directly from movement direction + slight tilt
      if (Math.abs(dx) > 0.5) {
        facingRightRef.current = dx > 0;
      }
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        const total = Math.abs(dx) + Math.abs(dy) + 0.1;
        const vertRatio = Math.abs(dy) / total;
        const tiltFrames = Math.min(MAX_TILT_FRAMES, Math.round(vertRatio * MAX_TILT_FRAMES));
        const goingUp = dy > 0;

        let offset;
        if (facingRightRef.current) {
          offset = goingUp ? -tiltFrames : tiltFrames;
        } else {
          offset = goingUp ? tiltFrames : -tiltFrames;
        }
        const base = facingRightRef.current ? 8 : 24;
        targetFrameRef.current = ((base + offset) % TOTAL_ANGLES + TOTAL_ANGLES) % TOTAL_ANGLES;
      }

      // Smoothly lerp displayed frame toward target (with wrapping)
      let frameDiff = targetFrameRef.current - smoothFrameRef.current;
      if (frameDiff > TOTAL_ANGLES / 2) frameDiff -= TOTAL_ANGLES;
      if (frameDiff < -TOTAL_ANGLES / 2) frameDiff += TOTAL_ANGLES;
      smoothFrameRef.current += frameDiff * FRAME_LERP;
      smoothFrameRef.current = ((smoothFrameRef.current % TOTAL_ANGLES) + TOTAL_ANGLES) % TOTAL_ANGLES;
      const frameIndex = Math.round(smoothFrameRef.current) % TOTAL_ANGLES;

      const movementSpeed = Math.sqrt(dx * dx + dy * dy) * speed;
      setIsMoving(!pausedRef.current && movementSpeed > MOVING_THRESHOLD);
      if (Math.abs(dx) > 0.5) setMovingRight(dx > 0);

      setX(pos.x);
      setY(pos.y);
      setAngleIndex(frameIndex);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [enabled, pickTarget, startPause]);

  const goTo = useCallback((tx, ty) => {
    // Cancel any pause so the ship starts moving immediately
    pausedRef.current = false;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    const clampedY = Math.max(minYRef.current, Math.min(maxYRef.current, ty));
    targetRef.current = { x: tx, y: clampedY };
  }, []);

  return { x, y, angleIndex, isMoving, movingRight, ready, goTo };
}
