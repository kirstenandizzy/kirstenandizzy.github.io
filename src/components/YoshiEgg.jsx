import { useState, useEffect, useRef, useCallback } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import CharacterLabel from './CharacterLabel';
import { EGG_STAGES, EGG_GROW_INTERVAL, EGG_SCALE } from '../sprites/sheets/egg';

const EGG_ROLL_SPEED = 40; // px/s
const FALL_GRAVITY = 600;  // px/s²

export default function YoshiEgg({ sheet, x: initialX, rollDirection = 'left', rolling = false, bounds, showLabel = true, onHatch, onFallOff }) {
  const [stage, setStage] = useState(0);
  const [eggX, setEggX] = useState(initialX);
  const [bottomY, setBottomY] = useState(0);
  // Latch: once rolling starts, it never stops (egg rolls until removed)
  const [rollingLatched, setRollingLatched] = useState(false);
  const growTimerRef = useRef(null);
  const xRef = useRef(initialX);
  const yRef = useRef(0);
  const vyRef = useRef(0);
  const fallingRef = useRef(false);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const removedRef = useRef(false);
  const boundsRef = useRef(bounds);
  const onFallOffRef = useRef(onFallOff);
  boundsRef.current = bounds;
  onFallOffRef.current = onFallOff;

  // Latch rolling on (state-based so effect re-runs exactly once)
  useEffect(() => {
    if (rolling && !rollingLatched) setRollingLatched(true);
  }, [rolling, rollingLatched]);

  // Growth timer: advance stage every EGG_GROW_INTERVAL
  useEffect(() => {
    if (stage >= EGG_STAGES.length - 1) return;

    growTimerRef.current = setTimeout(() => {
      setStage(s => s + 1);
    }, EGG_GROW_INTERVAL);

    return () => clearTimeout(growTimerRef.current);
  }, [stage]);

  // Rolling and falling physics — starts when rollingLatched becomes true, never stops
  useEffect(() => {
    if (!rollingLatched) return;

    const tick = (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Roll horizontally
      const dir = rollDirection === 'right' ? 1 : -1;
      xRef.current += dir * EGG_ROLL_SPEED * dt;
      setEggX(xRef.current);

      // Check bounds → start falling
      const b = boundsRef.current;
      if (b && !fallingRef.current && (xRef.current < b.left || xRef.current > b.right)) {
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
          if (onFallOffRef.current) onFallOffRef.current();
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
  }, [rollingLatched, rollDirection]);

  const handleClick = useCallback(() => {
    if (stage < EGG_STAGES.length - 1) return;
    if (onHatch) onHatch(xRef.current, yRef.current);
  }, [stage, onHatch]);

  const stageName = EGG_STAGES[stage];
  let className = 'yoshi-egg';
  if (stage === 1) className += ' egg-medium';
  if (stage >= 2) className += ' egg-large';

  return (
    <div
      className={className}
      style={{ left: eggX, bottom: bottomY }}
      onClick={handleClick}
    >
      {stage >= 2 && showLabel && (
        <CharacterLabel name="click me" color="#77dd77" bounce repeat repeatInterval={5000} />
      )}
      <PixelSprite sheet={sheet} name={stageName} scale={EGG_SCALE} />
    </div>
  );
}
