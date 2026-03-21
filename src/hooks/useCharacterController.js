import { useState, useEffect, useRef, useCallback } from 'react';

const MOVE_KEYS = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  a: 'left',
  d: 'right',
  A: 'left',
  D: 'right',
};

const JUMP_KEYS = new Set(['ArrowUp', 'w', 'W']);

const GRAVITY = 800;    // px/s²
const JUMP_VELOCITY = 300; // px/s

export default function useCharacterController({ enabled = false, bounds = { left: 0, right: 400 }, speed = 120, initialX, initialY = 0, getGroundLevel, onTongueComplete }) {
  const [x, setX] = useState(() => initialX ?? (bounds.left + bounds.right) / 2);
  const [y, setY] = useState(initialY);
  const [facing, setFacing] = useState('right');
  const [action, setAction] = useState('idle');
  const [grounded, setGrounded] = useState(true);

  const keysDown = useRef(new Set());
  const xRef = useRef(x);
  const yRef = useRef(y);
  const vyRef = useRef(0); // vertical velocity
  const groundedRef = useRef(true);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const attackingRef = useRef(false);
  const enabledRef = useRef(enabled);
  const getGroundLevelRef = useRef(getGroundLevel);

  enabledRef.current = enabled;
  xRef.current = x;
  yRef.current = y;
  getGroundLevelRef.current = getGroundLevel;

  // Snap to initial position when character becomes enabled (spawns)
  const prevEnabled = useRef(false);
  useEffect(() => {
    if (enabled && !prevEnabled.current) {
      if (initialX != null) {
        setX(initialX);
        xRef.current = initialX;
      }
      const ground = getGroundLevelRef.current ? getGroundLevelRef.current(initialX ?? xRef.current) : 0;
      setY(ground);
      yRef.current = ground;
      vyRef.current = 0;
      groundedRef.current = true;
      setGrounded(true);
    }
    prevEnabled.current = enabled;
  }, [enabled, initialX]);

  const handleTongueEnd = useCallback(() => {
    attackingRef.current = false;
    const hasMove = keysDown.current.has('left') || keysDown.current.has('right');
    setAction(hasMove ? 'walk' : 'idle');
    if (onTongueComplete) onTongueComplete();
  }, [onTongueComplete]);

  // Keyboard listeners
  useEffect(() => {
    if (!enabled) {
      keysDown.current.clear();
      return;
    }

    const onKeyDown = (e) => {
      if (!enabledRef.current) return;

      // Tongue attack
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!attackingRef.current) {
          attackingRef.current = true;
          setAction('tongue');
        }
        return;
      }

      // Jump
      if (JUMP_KEYS.has(e.key)) {
        e.preventDefault();
        if (groundedRef.current) {
          vyRef.current = JUMP_VELOCITY;
          groundedRef.current = false;
          setGrounded(false);
        }
        return;
      }

      // Horizontal movement
      const dir = MOVE_KEYS[e.key];
      if (!dir) return;
      e.preventDefault();

      if (keysDown.current.has(dir)) return;
      keysDown.current.add(dir);
      setFacing(dir === 'left' ? 'left' : 'right');

      if (!attackingRef.current && groundedRef.current) {
        setAction('walk');
      }
    };

    const onKeyUp = (e) => {
      const dir = MOVE_KEYS[e.key];
      if (!dir) return;

      keysDown.current.delete(dir);

      if (keysDown.current.has('left')) setFacing('left');
      else if (keysDown.current.has('right')) setFacing('right');

      const hasMove = keysDown.current.has('left') || keysDown.current.has('right');
      if (!hasMove && !attackingRef.current && groundedRef.current) {
        setAction('idle');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled]);

  // Movement + physics loop
  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const tick = (timestamp) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      let curX = xRef.current;
      let curY = yRef.current;
      let vy = vyRef.current;

      // Horizontal movement (allowed while airborne too)
      if (!attackingRef.current) {
        let dx = 0;
        if (keysDown.current.has('left')) dx -= speed * delta;
        if (keysDown.current.has('right')) dx += speed * delta;

        if (dx !== 0) {
          curX = Math.max(bounds.left, Math.min(bounds.right, curX + dx));
          xRef.current = curX;
          setX(curX);
        }
      }

      // Vertical physics
      vy -= GRAVITY * delta;
      curY += vy * delta;

      // Get ground level at current x
      const groundLevel = getGroundLevelRef.current ? getGroundLevelRef.current(curX) : 0;

      if (curY <= groundLevel) {
        curY = groundLevel;
        vy = 0;

        if (!groundedRef.current) {
          groundedRef.current = true;
          setGrounded(true);
          // Landed — set action based on current keys
          if (!attackingRef.current) {
            const hasMove = keysDown.current.has('left') || keysDown.current.has('right');
            setAction(hasMove ? 'walk' : 'idle');
          }
        }
      } else {
        if (groundedRef.current) {
          groundedRef.current = false;
          setGrounded(false);
        }
      }

      vyRef.current = vy;
      yRef.current = curY;
      setY(curY);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [enabled, speed, bounds.left, bounds.right]);

  return { x, y, facing, action, grounded, isAttacking: action === 'tongue', handleTongueEnd };
}
