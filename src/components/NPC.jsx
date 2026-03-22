import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import CharacterLabel from './CharacterLabel';
import useNPCPhysics from '../hooks/useNPCPhysics';
import useNPCBehavior from '../hooks/useNPCBehavior';

const RETURN_SPEED = 120; // px/s — faster than wander

export default function NPC({
  sheet,
  animations,
  scale = 2,
  startX,
  startY,
  launchDirection = 'left',
  moveBounds,
  getNPCPositions,
  onLanded,
  onPositionUpdate,
  npcId,
  facesRight = true,
  launchSpeed,
  label,
  labelColor,
  recalling = false,
  recallTarget,
  onReturned,
  wanderSpeed,
  minIdleTime,
  maxIdleTime,
  minWalkDist,
  maxWalkDist,
  glowColor,
  zIndex,
}) {
  const [currentAnim, setCurrentAnim] = useState('launch');
  const [behaviorEnabled, setBehaviorEnabled] = useState(false);
  const landedCalledRef = useRef(false);
  const currentAnimRef = useRef('launch');
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;

  // Return state
  const [returning, setReturning] = useState(false);
  const [returnX, setReturnX] = useState(0);
  const [sinking, setSinking] = useState(false);
  const [onPipe, setOnPipe] = useState(false);
  const returnXRef = useRef(0);
  const returnRafRef = useRef(null);
  const lastReturnTimeRef = useRef(0);
  const returnStartedRef = useRef(false);
  const recallingRef = useRef(recalling);
  const recallTargetRef = useRef(recallTarget);
  const onReturnedRef = useRef(onReturned);
  recallingRef.current = recalling;
  recallTargetRef.current = recallTarget;
  onReturnedRef.current = onReturned;

  // Phase 1: Physics-driven launch arc
  const { x: physicsX, y: physicsY, phase } = useNPCPhysics({
    enabled: true,
    startX,
    startY,
    direction: launchDirection,
    ...(launchSpeed != null ? { launchSpeed } : {}),
  });

  const physicsXRef = useRef(physicsX);
  physicsXRef.current = physicsX;

  // Phase 2: Wander AI after landing
  const { x: wanderX, facing, isWalking } = useNPCBehavior({
    enabled: behaviorEnabled,
    initialX: physicsX,
    bounds: moveBounds,
    getNPCPositions,
    scale,
    npcId,
    wanderSpeed,
    minIdleTime,
    maxIdleTime,
    minWalkDist,
    maxWalkDist,
  });

  // Start the return walk toward the pipe
  const startReturn = useCallback((fromX) => {
    if (returnStartedRef.current) return;
    returnStartedRef.current = true;

    setBehaviorEnabled(false);
    setReturning(true);
    returnXRef.current = fromX;
    setReturnX(fromX);
    setCurrentAnim('walk');
    currentAnimRef.current = 'walk';

    lastReturnTimeRef.current = 0;

    const tick = (timestamp) => {
      if (lastReturnTimeRef.current === 0) {
        lastReturnTimeRef.current = timestamp;
        returnRafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = (timestamp - lastReturnTimeRef.current) / 1000;
      lastReturnTimeRef.current = timestamp;

      // Walking toward the pipe
      const target = recallTargetRef.current;
      const moveDir = target > returnXRef.current ? 1 : -1;
      returnXRef.current += moveDir * RETURN_SPEED * dt;

      if ((moveDir > 0 && returnXRef.current >= target) ||
          (moveDir < 0 && returnXRef.current <= target)) {
        returnXRef.current = target;
        setReturnX(target);
        // At pipe — hop on top, then despawn
        currentAnimRef.current = 'idle';
        setCurrentAnim('idle');
        setOnPipe(true);
        setTimeout(() => {
          onReturnedRef.current?.();
        }, 300);
        return;
      }

      setReturnX(returnXRef.current);
      returnRafRef.current = requestAnimationFrame(tick);
    };

    returnRafRef.current = requestAnimationFrame(tick);
  }, []);

  // Trigger return when recalling + NPC is wandering
  useEffect(() => {
    if (!recalling || returnStartedRef.current) return;

    if (behaviorEnabled) {
      startReturn(wanderX);
    }
  }, [recalling, behaviorEnabled, wanderX, startReturn]);

  // Cleanup return RAF on unmount
  useEffect(() => {
    return () => {
      if (returnRafRef.current) cancelAnimationFrame(returnRafRef.current);
    };
  }, []);

  // React to physics phase transitions
  useEffect(() => {
    if (phase === 'rising') {
      currentAnimRef.current = 'launch';
      setCurrentAnim('launch');
    } else if (phase === 'falling') {
      currentAnimRef.current = 'fall';
      setCurrentAnim('fall');
    } else if (phase === 'landed') {
      currentAnimRef.current = 'landed';
      setCurrentAnim('landed');
      if (!landedCalledRef.current) {
        landedCalledRef.current = true;
        if (onLandedRef.current) onLandedRef.current(physicsX);
      }
    }
  }, [phase]);

  // React to wander state
  useEffect(() => {
    if (!behaviorEnabled) return;
    currentAnimRef.current = isWalking ? 'walk' : 'idle';
    setCurrentAnim(isWalking ? 'walk' : 'idle');
  }, [isWalking, behaviorEnabled]);

  // Use animations directly — emote plays the full sequence as defined
  const displayAnimations = animations;

  // When landed/idle/emote animation completes, transition to next state
  const handleAnimComplete = useCallback(() => {
    if (currentAnimRef.current === 'landed') {
      if (recallingRef.current) {
        // Skip wander, start returning immediately
        startReturn(physicsXRef.current);
      } else {
        currentAnimRef.current = 'idle';
        setCurrentAnim('idle');
        setBehaviorEnabled(true);
      }
    } else if (currentAnimRef.current === 'idle' && animations.emote) {
      if (Math.random() < 0.4) {
        currentAnimRef.current = 'emote';
        setCurrentAnim('emote');
      }
    } else if (currentAnimRef.current === 'emote') {
      currentAnimRef.current = 'idle';
      setCurrentAnim('idle');
    }
  }, [animations, startReturn]);

  // Report current position to parent for hit detection
  const displayX = returning ? returnX : (behaviorEnabled ? wanderX : physicsX);
  const displayYForHit = sinking ? startY : (phase === 'landed' || behaviorEnabled ? 0 : physicsY);
  useEffect(() => {
    if (onPositionUpdate && npcId && phase !== 'waiting') {
      onPositionUpdate(npcId, displayX, displayYForHit);
    }
  }, [displayX, displayYForHit, onPositionUpdate, npcId, phase]);

  // Stable width based on widest frame across all animations
  const stableWidth = useMemo(() => {
    let maxW = 0;
    for (const anim of Object.values(displayAnimations)) {
      if (anim.frames) {
        for (const frameName of anim.frames) {
          const rect = sheet.getRect(frameName);
          if (rect && rect.w > maxW) maxW = rect.w;
        }
      }
    }
    return maxW > 0 ? maxW * scale : undefined;
  }, [displayAnimations, sheet, scale]);

  // Handle sink transition end
  const handleSinkTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (sinking && onReturnedRef.current) {
      onReturnedRef.current();
    }
  }, [sinking]);

  // Not visible during waiting phase
  if (phase === 'waiting') return null;
  // When sinking, position at pipe top so it slides down into pipe
  const displayY = sinking ? startY : (phase === 'landed' ? 0 : physicsY);

  // Determine facing direction
  let displayFacing;
  if (returning) {
    displayFacing = recallTarget > returnX ? 'right' : 'left';
  } else if (behaviorEnabled) {
    displayFacing = facing;
  } else {
    displayFacing = launchDirection === 'left' ? 'left' : 'right';
  }

  return (
    <div
      className={`npc-sprite${phase === 'landed' || behaviorEnabled ? ' npc-landed' : ''}${sinking ? ' npc-sinking' : ''}`}
      style={{
        left: displayX,
        bottom: displayY,
        ...(zIndex != null ? { zIndex } : {}),
      }}
      onTransitionEnd={handleSinkTransitionEnd}
    >
      {(phase === 'landed' || behaviorEnabled) && !returning && label && (
        <CharacterLabel name={label} color={labelColor} />
      )}
      <div className={glowColor ? 'passenger-glow' : undefined} style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: stableWidth,
        '--glow-color': glowColor,
        ...((displayFacing === 'right') !== facesRight ? { transform: 'scaleX(-1)' } : {}),
      }}>
        <AnimatedSprite
          sheet={sheet}
          animations={displayAnimations}
          animation={currentAnim}
          scale={scale}
          onComplete={handleAnimComplete}
        />
      </div>
    </div>
  );
}
