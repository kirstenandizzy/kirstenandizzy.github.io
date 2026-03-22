import { useState, useEffect, useRef } from 'react';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import { waluigiSheet, WALUIGI_ANIMATIONS, WALUIGI_SCALE } from '../sprites/sheets/waluigi';

const MINION_SPEED = 80; // px/s
const FALL_GRAVITY = 600; // px/s²

export default function WaluigiMinion({ startX, direction, bounds, onRemove }) {
  const [x, setX] = useState(startX);
  const [bottomY, setBottomY] = useState(0);
  const xRef = useRef(startX);
  const yRef = useRef(0);
  const vyRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const removedRef = useRef(false);
  const fallingRef = useRef(false);
  const onRemoveRef = useRef(onRemove);
  const boundsRef = useRef(bounds);
  onRemoveRef.current = onRemove;
  boundsRef.current = bounds;

  useEffect(() => {
    const tick = (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Horizontal movement (always)
      const dir = direction === 'right' ? 1 : -1;
      xRef.current += dir * MINION_SPEED * dt;
      setX(xRef.current);

      // Check if past bounds → start falling
      const b = boundsRef.current;
      if (!fallingRef.current && (xRef.current < b.left || xRef.current > b.right)) {
        fallingRef.current = true;
      }

      // Apply gravity when falling
      if (fallingRef.current) {
        vyRef.current -= FALL_GRAVITY * dt;
        yRef.current += vyRef.current * dt;
        setBottomY(yRef.current);
      }

      // Remove when well below screen
      if (yRef.current < -200) {
        if (!removedRef.current) {
          removedRef.current = true;
          onRemoveRef.current();
        }
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [direction]);

  return (
    <div
      className="npc-sprite"
      style={{
        left: x,
        bottom: bottomY,
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        ...(direction === 'left' ? { transform: 'scaleX(-1)' } : {}),
      }}>
        <AnimatedSprite
          sheet={waluigiSheet}
          animations={WALUIGI_ANIMATIONS}
          animation="minionWalk"
          scale={WALUIGI_SCALE}
        />
      </div>
    </div>
  );
}
