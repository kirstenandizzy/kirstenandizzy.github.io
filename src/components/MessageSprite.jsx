import { useState, useCallback, useRef } from 'react';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import {
  messageHorizontalSheet,
  messageVerticalSheet,
  MESSAGE_ANIMATIONS,
  MESSAGE_SCALE,
} from '../sprites/sheets/message';

const LOOPING_ANIMATIONS = {
  row1: { ...MESSAGE_ANIMATIONS.row1, loop: true },
  row2: { ...MESSAGE_ANIMATIONS.row2, loop: true },
};

export default function MessageSprite({ children, variant = 'horizontal', className }) {
  const [animation, setAnimation] = useState(null);
  const side = 'right';
  const tapTimerRef = useRef(null);
  const hoveringRef = useRef(false);

  const pickRow = () => (Math.random() < 0.5 ? 'row1' : 'row2');

  const hoverIntervalRef = useRef(null);

  const handleEnter = useCallback(() => {
    hoveringRef.current = true;
    setAnimation(pickRow());
    hoverIntervalRef.current = setInterval(() => {
      setAnimation(pickRow());
    }, 750);
  }, []);

  const handleLeave = useCallback(() => {
    hoveringRef.current = false;
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current);
      hoverIntervalRef.current = null;
    }
    if (!tapTimerRef.current) {
      setAnimation(null);
    }
  }, []);

  const handleTap = useCallback(() => {
    setAnimation(pickRow());
    // Clear any existing tap timer
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapTimerRef.current = null;
      if (!hoveringRef.current) {
        setAnimation(null);
      }
    }, 2000);
  }, []);

  const sheet = variant === 'horizontal' ? messageHorizontalSheet : messageVerticalSheet;
  const isHorizontal = variant === 'horizontal';

  const spriteStyle = isHorizontal
    ? { position: 'absolute', right: 0, top: '50%', transform: 'translate(110%, -50%)' }
    : {
        position: 'absolute',
        bottom: 0,
        transform: 'translateY(110%)',
        ...(side === 'right' ? { right: 0 } : { left: 0 }),
      };

  return (
    <div
      className={`message-sprite-wrapper ${className || ''}`}
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={handleTap}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchStart={handleTap}
    >
      {children}
      {animation && (
        <div style={spriteStyle} className="message-sprite" aria-hidden="true">
          <AnimatedSprite
            sheet={sheet}
            animations={LOOPING_ANIMATIONS}
            animation={animation}
            scale={MESSAGE_SCALE}
          />
        </div>
      )}
    </div>
  );
}
