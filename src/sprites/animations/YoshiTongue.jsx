import { useState, useEffect, useRef, useCallback } from 'react';
import PixelSprite from '../PixelSprite';
import useSpriteAnimation from './useSpriteAnimation';

const MAX_TONGUE_SEGMENTS = 15;
const EXTEND_INTERVAL = 40; // ms per segment added
const HOLD_DURATION = 150;  // ms to hold at full extension
const SEGMENT_PX = 7;       // px per segment (before scale)
const BASE_OFFSET_PX = 51;  // approximate px from Yoshi x to tongue start + end piece (at scale 2)

const TONGUE_Y_TOLERANCE = 30; // max vertical distance (in bottom-coords) for a tongue hit

export default function YoshiTongue({ sheet, animations, scale = 2, onComplete, getNPCPositions, yoshiX, yoshiY, facing, onHit }) {
  const [phase, setPhase] = useState('opening');
  const [segmentCount, setSegmentCount] = useState(0);
  const [caughtNPC, setCaughtNPC] = useState(null);
  const intervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const hitRef = useRef(null);

  const tongueConfig = animations.tongue;
  if (!tongueConfig || tongueConfig.type !== 'composite') return null;

  const { phases } = tongueConfig;

  // Phase transitions
  const onOpenComplete = useCallback(() => {
    setPhase('extending');
  }, []);

  // Calculate tongue tip reach in px from yoshiX for a given segment count
  const getTongueReach = useCallback((count) => {
    return BASE_OFFSET_PX + SEGMENT_PX * scale * count;
  }, [scale]);

  // Check if tongue has reached any NPC
  const checkHit = useCallback((count) => {
    if (!getNPCPositions) return null;
    const positions = getNPCPositions();
    const reach = getTongueReach(count);

    return positions.find(npc => {
      const dist = facing === 'right' ? npc.x - yoshiX : yoshiX - npc.x;
      const vertDist = Math.abs((npc.y ?? 0) - (yoshiY ?? 0));
      return dist > 0 && dist <= reach && vertDist <= TONGUE_Y_TOLERANCE;
    }) || null;
  }, [getNPCPositions, yoshiX, yoshiY, facing, getTongueReach]);

  // Extending phase: add segments one by one, stop on NPC hit
  useEffect(() => {
    if (phase !== 'extending') return;

    setSegmentCount(0);
    let count = 0;

    intervalRef.current = setInterval(() => {
      count++;
      setSegmentCount(count);

      const hit = checkHit(count);
      if (hit) {
        clearInterval(intervalRef.current);
        hitRef.current = hit;
        setCaughtNPC(hit.id);
        if (onHit) onHit(hit.id);
        setPhase('retracting');
        return;
      }

      if (count >= MAX_TONGUE_SEGMENTS) {
        clearInterval(intervalRef.current);
        setPhase('held');
      }
    }, EXTEND_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [phase, checkHit, onHit]);

  // Held phase: pause then retract (only on miss)
  useEffect(() => {
    if (phase !== 'held') return;

    holdTimeoutRef.current = setTimeout(() => {
      setPhase('retracting');
    }, HOLD_DURATION);

    return () => clearTimeout(holdTimeoutRef.current);
  }, [phase]);

  // Retracting phase: remove segments one by one, then complete
  useEffect(() => {
    if (phase !== 'retracting') return;

    let count = segmentCount;

    intervalRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(intervalRef.current);
        setSegmentCount(0);
        setCaughtNPC(null);
        hitRef.current = null;
        if (onComplete) onComplete();
        return;
      }
      setSegmentCount(count);
    }, EXTEND_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [phase]);

  // Opening phase: animate mouth opening frames
  const { currentFrame: openFrame } = useSpriteAnimation({
    frames: phases.open.frames,
    fps: phases.open.fps,
    loop: false,
    playing: phase === 'opening',
    onComplete: onOpenComplete,
  });

  // Determine which body sprite to show
  let bodySprite;
  if (phase === 'opening') {
    bodySprite = openFrame;
  } else if (phase === 'extending' || phase === 'held') {
    bodySprite = phases.extend.body;
  } else {
    bodySprite = phases.retract.frames[0];
  }

  const showTongue = (phase === 'extending' || phase === 'held' || phase === 'retracting') && segmentCount > 0;

  // Tongue segment names
  const { segments } = phases.extend;
  const [tongueEnd, tongueMid, tongueTip] = segments;

  // Calculate tongue positioning
  // Body sprite rect for positioning the tongue relative to the mouth
  const bodyRect = sheet.getRect(bodySprite);
  const tongueEndRect = sheet.getRect(tongueMid);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <PixelSprite sheet={sheet} name={bodySprite} scale={scale} />

      {showTongue && (
        <div
          style={{
            position: 'absolute',
            // Anchor tongue to Yoshi's mouth — extends right from the body
            left: bodyRect ? bodyRect.w * scale - (4 * scale) - 13 : '100%',
            top: bodyRect ? (bodyRect.h * scale * 0.45) - 5 : '50%',
            display: 'flex',
            flexDirection: 'row',
            imageRendering: 'pixelated',
          }}
        >
          <PixelSprite sheet={sheet} name={tongueEnd} scale={scale} />
          {Array.from({ length: Math.max(0, segmentCount - 1) }, (_, i) => (
            <PixelSprite key={i} sheet={sheet} name={tongueMid} scale={scale} />
          ))}
          <PixelSprite sheet={sheet} name={tongueTip} scale={scale} />
        </div>
      )}
    </div>
  );
}
