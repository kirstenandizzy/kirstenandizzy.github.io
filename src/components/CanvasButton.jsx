import { useState, useRef, useCallback, useEffect } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import YoshiTongue from '../sprites/animations/YoshiTongue';
import { pipeSheet, ALLOWED_PIPE_COLORS } from '../sprites/sheets/pipes';
import { yoshiSheet, YOSHI_ANIMATIONS } from '../sprites/sheets/yoshi';
import useCharacterController from '../hooks/useCharacterController';

const PIPE_SCALE = 2;
const CHARACTER_SCALE = 2;

function pickRandomColor(exclude) {
  const choices = ALLOWED_PIPE_COLORS.filter(c => c !== exclude);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function CanvasButton({ onClick }) {
  const [pipeState, setPipeState] = useState('hidden');
  const [pipeColor, setPipeColor] = useState('green');
  const [pipeLeft, setPipeLeft] = useState(0);
  const [characterState, setCharacterState] = useState('hidden');
  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);
  const clipRef = useRef(null);

  // Calculate bounds for character movement based on viewport
  const [moveBounds, setMoveBounds] = useState({ left: 0, right: 400 });

  useEffect(() => {
    const updateBounds = () => {
      if (wrapperRef.current && clipRef.current) {
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const clipRect = clipRef.current.getBoundingClientRect();
        // Map wrapper edges into clip-space coordinates
        const left = wrapperRect.left - clipRect.left;
        const right = wrapperRect.right - clipRect.left;
        setMoveBounds({ left, right });
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Pipe dimensions for platform collision
  const pipeWidth = 32 * PIPE_SCALE;
  const pipeHeight = 32 * PIPE_SCALE;
  const pipeLeftRef = useRef(pipeLeft);
  pipeLeftRef.current = pipeLeft;
  const leftPipe = useRef(false);

  // Once character steps off the pipe, pipe is no longer a platform
  const getGroundLevel = useCallback((xPos) => {
    if (!leftPipe.current) {
      const pipeCenterX = pipeLeftRef.current;
      const halfPipe = pipeWidth / 2;
      if (xPos >= pipeCenterX - halfPipe && xPos <= pipeCenterX + halfPipe) {
        return pipeHeight;
      }
      // First time off the pipe — disable it permanently
      leftPipe.current = true;
    }
    return 0;
  }, [pipeWidth, pipeHeight]);

  const { x, y, facing, action, handleTongueEnd } = useCharacterController({
    enabled: characterState === 'active',
    bounds: moveBounds,
    speed: 120,
    initialX: pipeLeft,
    initialY: pipeHeight, // spawn on top of pipe
    getGroundLevel,
  });

  // Two-frame mount: render element at hidden position, then apply spawning class
  useEffect(() => {
    if (characterState !== 'mounting') return;
    let raf;
    // Double rAF ensures browser paints the initial (hidden) position first
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setCharacterState('spawning');
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [characterState]);

  useEffect(() => {
    if (!buttonRef.current || !clipRef.current) return;
    const updatePipeLeft = () => {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const clipRect = clipRef.current.getBoundingClientRect();
      setPipeLeft(btnRect.left - clipRect.left + btnRect.width / 2);
    };
    updatePipeLeft();
    window.addEventListener('resize', updatePipeLeft);
    return () => window.removeEventListener('resize', updatePipeLeft);
  }, []);

  const handleWeddingPartyClick = useCallback((e) => {
    if (onClick) onClick(e);
    if (pipeState === 'rising' || pipeState === 'retracting') return;
    if (characterState === 'spawning' || characterState === 'despawning') return;

    if (pipeState === 'hidden') {
      setPipeColor(pickRandomColor(pipeColor));
      setPipeState('rising');
    } else if (pipeState === 'visible' && (characterState === 'active' || characterState === 'hidden')) {
      // Start despawn sequence: character goes down first, then pipe
      if (characterState === 'active') {
        setCharacterState('despawning');
      } else {
        setPipeState('retracting');
      }
    }
  }, [pipeState, characterState, onClick, pipeColor]);

  const handlePipeTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (pipeState === 'rising') {
      setPipeState('visible');
      // Pipe is up — mount the character element first (no class), then trigger rise
      leftPipe.current = false; // reset for new spawn
      setCharacterState('mounting');
    } else if (pipeState === 'retracting') {
      setPipeState('hidden');
    }
  }, [pipeState]);

  const handleCharacterTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (characterState === 'spawning') {
      setCharacterState('active');
    } else if (characterState === 'despawning') {
      setCharacterState('hidden');
      // Character is hidden, now retract the pipe
      setPipeState('retracting');
    }
  }, [characterState]);

  // Fallback: if transitionend doesn't fire for spawn, promote to active after timeout
  useEffect(() => {
    if (characterState !== 'spawning') return;
    const timeout = setTimeout(() => {
      setCharacterState((s) => s === 'spawning' ? 'active' : s);
    }, 400); // slightly longer than 0.35s transition
    return () => clearTimeout(timeout);
  }, [characterState]);

  const isUp = pipeState === 'rising' || pipeState === 'visible';
  const isActive = pipeState !== 'hidden';

  let slideClass = '';
  if (isActive) slideClass = isUp ? 'pipe-up' : 'pipe-down';

  let characterClass = 'character-sprite';
  if (characterState === 'spawning') characterClass += ' character-spawning';
  else if (characterState === 'despawning') characterClass += ' character-despawning';
  else if (characterState === 'active') characterClass += ' character-active';

  // Determine animation to play
  let animationName = 'stand';
  if (action === 'walk') animationName = 'walk';

  return (
    <div className="canvas-button-wrapper" ref={wrapperRef}>
      <div className="pipe-clip" ref={clipRef} aria-hidden="true">
        {/* Character sprite */}
        {characterState !== 'hidden' && (
          <div
            className={characterClass}
            style={{
              left: characterState === 'active' ? x : pipeLeft,
              bottom: characterState === 'active' ? y : pipeHeight,
            }}
            onTransitionEnd={handleCharacterTransitionEnd}
          >
            {/* Inner wrapper: flex-end aligns feet to ground, scaleX flips for facing */}
            <div style={{ display: 'flex', alignItems: 'flex-end', ...(facing === 'left' ? { transform: 'scaleX(-1)' } : {}) }}>
              {action === 'tongue' ? (
                <YoshiTongue
                  sheet={yoshiSheet}
                  animations={YOSHI_ANIMATIONS}
                  scale={CHARACTER_SCALE}
                  onComplete={handleTongueEnd}
                />
              ) : (
                <AnimatedSprite
                  sheet={yoshiSheet}
                  animations={YOSHI_ANIMATIONS}
                  animation={animationName}
                  scale={CHARACTER_SCALE}
                />
              )}
            </div>
          </div>
        )}

        {/* Pipe */}
        <div
          className={`pipe-slide ${slideClass}`}
          style={{ left: pipeLeft }}
          onTransitionEnd={handlePipeTransitionEnd}
        >
          <PixelSprite sheet={pipeSheet} name={`${pipeColor}-pipe`} scale={PIPE_SCALE} />
        </div>
      </div>

      <div className="canvas-button-container">
        <button onClick={onClick}>
          Bride & Groom
        </button>
        <button onClick={onClick}>
          RSVP
        </button>
        <button ref={buttonRef} onClick={handleWeddingPartyClick}>
          Wedding Party
        </button>
      </div>
    </div>
  );
}
