import { useState, useEffect, useRef, useCallback } from 'react';
import PixelSprite from '../PixelSprite';
import useSpriteAnimation from './useSpriteAnimation';

const PHASES = ['opening', 'extending', 'held', 'retracting'];
const MAX_TONGUE_SEGMENTS = 6;
const EXTEND_INTERVAL = 40; // ms per segment added
const HOLD_DURATION = 150;  // ms to hold at full extension

export default function YoshiTongue({ sheet, animations, scale = 2, onComplete }) {
  const [phase, setPhase] = useState('opening');
  const [segmentCount, setSegmentCount] = useState(0);
  const intervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);

  const tongueConfig = animations.tongue;
  if (!tongueConfig || tongueConfig.type !== 'composite') return null;

  const { phases } = tongueConfig;

  // Phase transitions
  const onOpenComplete = useCallback(() => {
    setPhase('extending');
  }, []);

  // Extending phase: add segments one by one
  useEffect(() => {
    if (phase !== 'extending') return;

    setSegmentCount(0);
    let count = 0;

    intervalRef.current = setInterval(() => {
      count++;
      setSegmentCount(count);
      if (count >= MAX_TONGUE_SEGMENTS) {
        clearInterval(intervalRef.current);
        setPhase('held');
      }
    }, EXTEND_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [phase]);

  // Held phase: pause then retract
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
