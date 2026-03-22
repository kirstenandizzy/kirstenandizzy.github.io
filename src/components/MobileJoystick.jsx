import { useRef, useCallback } from 'react';
import '../styles/MobileJoystick.scss';

const DEAD_ZONE = 10; // px from center before registering direction
const KNOB_LIMIT = 30; // max px the knob can travel from center

export default function MobileJoystick({ onDirection, onJump, onTongue, onClose }) {
  const stickRef = useRef(null);
  const originRef = useRef(null);
  const activeRef = useRef(false);
  const knobRef = useRef(null);
  const lastDirRef = useRef(null);

  const updateDirection = useCallback((touchX) => {
    if (!originRef.current) return;
    const dx = touchX - originRef.current.x;

    // Clamp knob visual position
    const clampedDx = Math.max(-KNOB_LIMIT, Math.min(KNOB_LIMIT, dx));
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${clampedDx}px, -50%)`;
    }

    let dir = null;
    if (dx < -DEAD_ZONE) dir = 'left';
    else if (dx > DEAD_ZONE) dir = 'right';

    if (dir !== lastDirRef.current) {
      lastDirRef.current = dir;
      onDirection(dir);
    }
  }, [onDirection]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = stickRef.current.getBoundingClientRect();
    originRef.current = { x: rect.left + rect.width / 2 };
    activeRef.current = true;
    updateDirection(touch.clientX);
  }, [updateDirection]);

  const handleTouchMove = useCallback((e) => {
    if (!activeRef.current) return;
    e.preventDefault();
    updateDirection(e.touches[0].clientX);
  }, [updateDirection]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    activeRef.current = false;
    lastDirRef.current = null;
    onDirection(null);
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0, -50%)';
    }
  }, [onDirection]);

  return (
    <div className="mobile-controls">
      {/* Joystick */}
      <div
        className="joystick-base"
        ref={stickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="joystick-knob" ref={knobRef} />
      </div>

      {/* Action buttons */}
      <div className="mobile-buttons">
        <button
          className="mobile-btn mobile-btn--tongue"
          onTouchStart={(e) => { e.preventDefault(); onTongue(); }}
        >
          Action
        </button>
        <button
          className="mobile-btn mobile-btn--close"
          onTouchStart={(e) => { e.preventDefault(); onClose(); }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
