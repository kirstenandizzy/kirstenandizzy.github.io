import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import { balloonSheet, BALLOON_ANIMATIONS, BALLOON_SCALE } from '../sprites/sheets/balloon';

export default function FloatingPhoto({ startX, startY, photo, onDone, autoPopDelay, small, bubbleSize }) {
  const elRef = useRef(null);
  const innerRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const popping = useRef(false);

  const [popAnim, setPopAnim] = useState(null);
  const [photoVisible, setPhotoVisible] = useState(true);
  const [tapped, setTapped] = useState(false);

  const GROW_DURATION = 0.4;

  // Auto-pop after delay (for companion bubbles)
  useEffect(() => {
    if (!autoPopDelay) return;
    const timer = setTimeout(() => {
      if (!popping.current) {
        popping.current = true;
        setPopAnim('gray-pop');
        setPhotoVisible(false);
      }
    }, autoPopDelay);
    return () => clearTimeout(timer);
  }, [autoPopDelay]);

  useEffect(() => {
    const driftSpeed = 12 + Math.random() * 6;
    const wobbleAmp = 15 + Math.random() * 20;
    const wobbleDur = 4 + Math.random() * 3;
    let y = 0;
    let lastTime = 0;
    let startTime = 0;
    let raf;

    const tick = (ts) => {
      if (!lastTime) lastTime = ts;
      if (!startTime) startTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      if (popping.current) {
        raf = requestAnimationFrame(tick);
        return;
      }

      y -= driftSpeed * dt;

      // Despawn when the element has drifted above the viewport
      // bottom: startY, transform moves up by |y|, off-screen when |y| > viewportHeight - startY + buffer
      if (-y > window.innerHeight - startY + 100) {
        onDoneRef.current();
        return;
      }

      const el = elRef.current;
      if (el) {
        const elapsed = (ts - startTime) / 1000;
        const wobbleX = Math.sin((elapsed / wobbleDur) * 2 * Math.PI) * wobbleAmp;
        el.style.transform = `translate(${wobbleX}px, ${y}px)`;
        el.style.opacity = 1;
      }

      const inner = innerRef.current;
      if (inner) {
        const elapsed = (ts - startTime) / 1000;
        const t = Math.min(elapsed / GROW_DURATION, 1);
        const scale = t < 0.7
          ? (t / 0.7) * 1.1
          : 1.1 - 0.1 * ((t - 0.7) / 0.3);
        inner.style.scale = scale;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (popping.current) return;
    const isMobile = !window.matchMedia('(hover: hover)').matches;
    if (isMobile && !tapped) {
      setTapped(true);
      return;
    }
    popping.current = true;
    setPopAnim('gray-pop');
    setPhotoVisible(false);
  }, [tapped]);

  const handlePopComplete = useCallback(() => {
    setTimeout(() => onDoneRef.current(), 400);
  }, []);

  return createPortal(
    <div
      ref={elRef}
      className="balloon"
      style={{
        left: startX,
        bottom: startY,
        top: 'auto',
        transform: 'translate(0px, 0px)',
        opacity: 0,
        zIndex: small ? 998 : 998,
      }}
      onClick={handleClick}
    >
      <div ref={innerRef} className="balloon-inner" style={{ scale: 0 }}>
        <div
          className={`floating-photo-container${tapped ? ' floating-photo-container--tapped' : ''}`}
          style={small ? { width: bubbleSize || 35, height: bubbleSize || 35 } : undefined}
        >
          {popAnim && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <AnimatedSprite
                sheet={balloonSheet}
                animations={BALLOON_ANIMATIONS}
                animation={popAnim}
                scale={small ? BALLOON_SCALE * 0.4 : BALLOON_SCALE * 0.7}
                onComplete={handlePopComplete}
              />
            </div>
          )}
          {photoVisible && (
            <img src="/bubble.png" alt="" className="floating-photo-bubble" />
          )}
          {photo && (
            <div
              className={`floating-photo-img${!photoVisible ? ' floating-photo-img--popping' : ''}`}
            >
              <img src={photo} alt="" />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
