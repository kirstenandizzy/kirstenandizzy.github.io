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

// Pick a target outside the modal area
// x = pixels from left, y = pixels from bottom (matches CSS bottom positioning)
function pickSideTarget(_formCenterX, _formHalfWidth, minY, maxY) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = 60;

  // Modal card rect (centered, ~420px wide, ~85vh tall max)
  const cardW = Math.min(420, vw * 0.9);
  const cardH = Math.min(vh * 0.85, vh - 100);
  const modalLeft = (vw - cardW) / 2;
  const modalRight = (vw + cardW) / 2;
  // Convert modal top/bottom from top-origin to bottom-origin
  const modalTopFromTop = (vh - cardH) / 2;
  const modalBottomFromBottom = modalTopFromTop;         // bottom edge in bottom-coords
  const margin = 40; // extra clearance around modal

  // Zones outside the modal (all in left/bottom coordinate space)
  const zones = [];

  // Bottom center — below the modal, spanning full width (strongly preferred)
  const belowTop = Math.max(minY, modalBottomFromBottom - margin);
  if (belowTop > minY + 20) {
    zones.push({ x: [vw * 0.2, vw * 0.8], y: [minY, belowTop], weight: 8 });
  }

  // Left of modal
  const leftEdge = modalLeft - margin;
  if (leftEdge > pad + 30) {
    zones.push({ x: [pad, leftEdge], y: [minY, maxY], weight: 1 });
  }

  // Right of modal
  const rightEdge = modalRight + margin;
  if (vw - pad > rightEdge + 30) {
    zones.push({ x: [rightEdge, vw - pad], y: [minY, maxY], weight: 1 });
  }

  // Fallback: if no zones (very small screen), use bottom corners
  if (zones.length === 0) {
    zones.push({ x: [pad, vw - pad], y: [minY, minY + 60], weight: 1 });
  }

  // Weighted random pick
  const totalWeight = zones.reduce((s, z) => s + z.weight, 0);
  let r = Math.random() * totalWeight;
  let zone = zones[0];
  for (const z of zones) {
    r -= z.weight;
    if (r <= 0) { zone = z; break; }
  }

  const tx = zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]);
  const ty = zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]);
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

  const minY = 30;
  const maxY = typeof window !== 'undefined'
    ? Math.min(600, window.innerHeight - 200)
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
        zIndex: 1000,
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
