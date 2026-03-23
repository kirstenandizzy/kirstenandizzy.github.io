import { useState, useEffect, useRef, useCallback } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import { shipSheet, SHIP_SCALE, TOTAL_ANGLES } from '../sprites/sheets/ship';
import { kirbySheet, KIRBY_ANIMATIONS, KIRBY_SCALE } from '../sprites/sheets/kirby';
import { foxSheet, FOX_ANIMATIONS, FOX_SCALE } from '../sprites/sheets/fox';
import ShipPassenger from './ShipPassenger';

const LERP_SPEED = 0.0012;
const ENTRANCE_LERP = 0.006;
const TARGET_THRESHOLD = 15;
const MIN_PAUSE = 3000;
const MAX_PAUSE = 7000;
const MAX_TILT_FRAMES = 2;
const FRAME_LERP = 0.12;
const SHIP_OPACITY = 0.45;

// Pick a target biased towards the sides of the viewport, avoiding the centered form
function pickSideTarget(formCenterX, formHalfWidth, minY, maxY) {
  const vw = window.innerWidth;
  const pad = 80;
  const leftZone = { left: pad, right: Math.max(pad, formCenterX - formHalfWidth - 40) };
  const rightZone = { left: Math.min(vw - pad, formCenterX + formHalfWidth + 40), right: vw - pad };

  // Pick a side randomly
  const leftWidth = leftZone.right - leftZone.left;
  const rightWidth = rightZone.right - rightZone.left;
  const total = leftWidth + rightWidth;
  const pickLeft = Math.random() < (total > 0 ? leftWidth / total : 0.5);
  const zone = pickLeft ? leftZone : rightZone;

  const tx = zone.left + Math.random() * (zone.right - zone.left);
  const ty = minY + Math.random() * (maxY - minY);
  return { x: tx, y: ty };
}

export default function RSVPShip({ isOpen }) {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [angleIndex, setAngleIndex] = useState(0);
  const [movingRight, setMovingRight] = useState(true);
  const [visible, setVisible] = useState(false);

  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const pausedRef = useRef(false);
  const enteringRef = useRef(true);
  const targetFrameRef = useRef(0);
  const smoothFrameRef = useRef(0);
  const facingRightRef = useRef(true);

  const minY = 120;
  const maxY = typeof window !== 'undefined'
    ? Math.min(600, window.innerHeight - 300)
    : 600;

  const pickTarget = useCallback(() => {
    const vw = window.innerWidth;
    const target = pickSideTarget(vw / 2, 280, minY, maxY);
    targetRef.current = target;
  }, [maxY]);

  const startPause = useCallback(() => {
    pausedRef.current = true;
    const delay = MIN_PAUSE + Math.random() * (MAX_PAUSE - MIN_PAUSE);
    pauseTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      pickTarget();
    }, delay);
  }, [pickTarget]);

  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }

    const vw = window.innerWidth;
    const fromRight = Math.random() > 0.5;
    const startX = fromRight ? vw + 300 : -300;
    const startY = (minY + maxY) / 2;
    posRef.current = { x: startX, y: startY };
    enteringRef.current = true;
    facingRightRef.current = !fromRight;
    const initFrame = fromRight ? 24 : 8;
    targetFrameRef.current = initFrame;
    smoothFrameRef.current = initFrame;
    setX(startX);
    setY(startY);
    setMovingRight(!fromRight);
    setAngleIndex(initFrame);
    pickTarget();

    requestAnimationFrame(() => setVisible(true));

    const tick = () => {
      const pos = posRef.current;
      const target = targetRef.current;
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const speed = enteringRef.current ? ENTRANCE_LERP : LERP_SPEED;

      if (!pausedRef.current) {
        pos.x += dx * speed;
        pos.y += dy * speed;
        pos.y = Math.min(pos.y, maxY);

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < TARGET_THRESHOLD) {
          if (enteringRef.current) {
            const vw = window.innerWidth;
            if (pos.x > 80 && pos.x < vw - 80) {
              enteringRef.current = false;
            }
            pickTarget();
          } else {
            startPause();
          }
        }
      }

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

      let frameDiff = targetFrameRef.current - smoothFrameRef.current;
      if (frameDiff > TOTAL_ANGLES / 2) frameDiff -= TOTAL_ANGLES;
      if (frameDiff < -TOTAL_ANGLES / 2) frameDiff += TOTAL_ANGLES;
      smoothFrameRef.current += frameDiff * FRAME_LERP;
      smoothFrameRef.current = ((smoothFrameRef.current % TOTAL_ANGLES) + TOTAL_ANGLES) % TOTAL_ANGLES;
      const frameIndex = Math.round(smoothFrameRef.current) % TOTAL_ANGLES;

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
  }, [isOpen, pickTarget, startPause, maxY]);

  if (!isOpen || !visible) return null;

  const frameName = `angle-${angleIndex}`;

  return (
    <div
      className="rsvp-ship"
      style={{
        position: 'fixed',
        left: x,
        bottom: y,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 999,
        opacity: visible ? SHIP_OPACITY : 0,
        transition: 'opacity 1.5s ease-in',
      }}
    >
      <PixelSprite
        sheet={shipSheet}
        name={frameName}
        scale={SHIP_SCALE}
        style={{ filter: 'grayscale(0.6)' }}
      />
      <ShipPassenger
        sheet={kirbySheet}
        animations={KIRBY_ANIMATIONS}
        scale={KIRBY_SCALE * 1.25}
        facesRight={movingRight}
        idleFacing="right"
        offsetX={-20}
        offsetY={75}
        zIndex={1}
        glowColor="#c89ef2"
        idleEmoteMin={2000}
        idleEmoteMax={5000}
      />
      <ShipPassenger
        sheet={foxSheet}
        animations={FOX_ANIMATIONS}
        scale={FOX_SCALE * 1.15}
        facesRight={movingRight}
        idleFacing="left"
        offsetX={20}
        offsetY={75}
        zIndex={2}
        glowColor="#8fcaca"
      />
    </div>
  );
}
