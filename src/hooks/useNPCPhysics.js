import { useState, useEffect, useRef, useCallback } from 'react';

const LAUNCH_SPEED = 450; // px/s
const GRAVITY = 600;      // px/s² (floatier than Yoshi's 800)
const LAUNCH_ANGLE = 75;  // degrees from horizontal

export default function useNPCPhysics({ enabled = false, startX, startY, direction = 'left', launchSpeed = LAUNCH_SPEED }) {
  const [x, setX] = useState(startX);
  const [y, setY] = useState(startY);
  const [phase, setPhase] = useState('waiting'); // 'waiting' | 'rising' | 'falling' | 'landed'

  const xRef = useRef(startX);
  const yRef = useRef(startY);
  const vxRef = useRef(0);
  const vyRef = useRef(0);
  const phaseRef = useRef('waiting');
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  const startXRef = useRef(startX);
  const startYRef = useRef(startY);
  const directionRef = useRef(direction);
  const launchSpeedRef = useRef(launchSpeed);

  useEffect(() => {
    if (!enabled || phaseRef.current !== 'waiting') return;

    // Brief launching delay before physics starts
    const launchTimer = setTimeout(() => {
      if (phaseRef.current !== 'waiting') return; // guard against double-fire
      const angleRad = (LAUNCH_ANGLE * Math.PI) / 180;
      const horizontalSign = directionRef.current === 'left' ? -1 : 1;
      const speed = launchSpeedRef.current;
      vxRef.current = Math.cos(angleRad) * speed * horizontalSign;
      vyRef.current = Math.sin(angleRad) * speed;
      xRef.current = startXRef.current;
      yRef.current = startYRef.current;
      phaseRef.current = 'rising';
      setPhase('rising');
      lastTimeRef.current = 0;
    }, 200);

    return () => clearTimeout(launchTimer);
  }, [enabled]);

  useEffect(() => {
    if (phaseRef.current === 'waiting' || phaseRef.current === 'landed') return;

    const tick = (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const prevVy = vyRef.current;

      vyRef.current -= GRAVITY * dt;
      xRef.current += vxRef.current * dt;
      yRef.current += vyRef.current * dt;

      // Transition: rising → falling at peak of arc
      if (phaseRef.current === 'rising' && vyRef.current < 0 && prevVy >= 0) {
        phaseRef.current = 'falling';
        setPhase('falling');
      }

      // Transition: falling → landed at ground level
      if (yRef.current <= 0) {
        yRef.current = 0;
        phaseRef.current = 'landed';
        setPhase('landed');
        setX(xRef.current);
        setY(0);
        return; // stop loop
      }

      setX(xRef.current);
      setY(yRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };

    if (phaseRef.current === 'rising' || phaseRef.current === 'falling') {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = 0;
    };
  }, [phase]); // re-run when phase changes to start/stop the loop

  return { x, y, phase };
}
