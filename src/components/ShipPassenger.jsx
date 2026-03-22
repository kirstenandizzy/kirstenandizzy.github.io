import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import CharacterLabel from './CharacterLabel';

const EMOTE_CHANCE = 0.7;
const IDLE_EMOTE_MIN = 1500; // ms — minimum time before emote check on single-frame idle
const IDLE_EMOTE_MAX = 4000; // ms — maximum time

export default function ShipPassenger({ sheet, animations, scale = 1.5, facesRight = true, offsetX = 0, offsetY = 0, zIndex, label, labelColor, glowColor, freezeAfterEmote = false, idleEmoteMin = IDLE_EMOTE_MIN, idleEmoteMax = IDLE_EMOTE_MAX }) {
  const [currentAnim, setCurrentAnim] = useState('idle');
  const [animKey, setAnimKey] = useState(0);
  const currentAnimRef = useRef('idle');
  const idleTimerRef = useRef(null);

  // Stable width based on widest frame across all animations (same as NPC.jsx)
  const stableWidth = useMemo(() => {
    let maxW = 0;
    for (const anim of Object.values(animations)) {
      if (anim.frames) {
        for (const frameName of anim.frames) {
          const rect = sheet.getRect(frameName);
          if (rect && rect.w > maxW) maxW = rect.w;
        }
      }
    }
    return maxW > 0 ? maxW * scale : undefined;
  }, [animations, sheet, scale]);

  const isSingleFrameIdle = animations.idle && animations.idle.frames.length <= 1;

  // Schedule a random emote check after a delay (for single-frame idle)
  const scheduleEmoteCheck = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    const delay = idleEmoteMin + Math.random() * (idleEmoteMax - idleEmoteMin);
    idleTimerRef.current = setTimeout(() => {
      if (currentAnimRef.current !== 'idle') return;
      if (Math.random() < EMOTE_CHANCE) {
        const emote = Math.random() < 0.5 ? 'emote1' : 'emote2';
        if (animations[emote]) {
          currentAnimRef.current = emote;
          setCurrentAnim(emote);
          setAnimKey(k => k + 1);
          return; // handleAnimComplete will call scheduleEmoteCheck when emote finishes
        }
      }
      // Didn't play emote, schedule another check
      scheduleEmoteCheck();
    }, delay);
  }, [animations, idleEmoteMin, idleEmoteMax]);

  // Start the emote timer for single-frame idle on mount
  useEffect(() => {
    if (isSingleFrameIdle) {
      scheduleEmoteCheck();
    }
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isSingleFrameIdle, scheduleEmoteCheck]);

  const handleAnimComplete = useCallback(() => {
    if (currentAnimRef.current === 'emote1' || currentAnimRef.current === 'emote2') {
      currentAnimRef.current = 'idle';
      if (!freezeAfterEmote) {
        // Reset back to idle animation
        setCurrentAnim('idle');
      }
      // Restart timer if idle is single-frame
      if (isSingleFrameIdle) {
        scheduleEmoteCheck();
      }
    } else if (currentAnimRef.current === 'idle' && !isSingleFrameIdle) {
      // Multi-frame idle: use onComplete to trigger emotes
      if (Math.random() < EMOTE_CHANCE) {
        const emote = Math.random() < 0.5 ? 'emote1' : 'emote2';
        if (animations[emote]) {
          currentAnimRef.current = emote;
          setCurrentAnim(emote);
          setAnimKey(k => k + 1);
        }
      }
    }
  }, [animations, isSingleFrameIdle, freezeAfterEmote, scheduleEmoteCheck]);

  return (
    <div style={{
      position: 'absolute',
      bottom: `calc(100% - ${offsetY}px)`,
      left: `calc(50% + ${offsetX}px)`,
      transform: `translateX(-50%)${facesRight ? '' : ' scaleX(-1)'}`,
      pointerEvents: 'none',
      zIndex,
    }}>
      {label && (
        <div style={facesRight ? undefined : { transform: 'scaleX(-1)' }}>
          <CharacterLabel name={label} color={labelColor} />
        </div>
      )}
      <div className={glowColor ? 'passenger-glow' : undefined} style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: stableWidth,
        '--glow-color': glowColor,
      }}>
        <AnimatedSprite
          key={animKey}
          sheet={sheet}
          animations={animations}
          animation={currentAnim}
          scale={scale}
          onComplete={handleAnimComplete}
        />
      </div>
    </div>
  );
}
