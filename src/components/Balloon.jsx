import { useState, useEffect, useRef, useCallback } from 'react';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';

export default function Balloon({ sheet, animations, scale, startX, startY, color, photo, onPop }) {
  const [animation, setAnimation] = useState(`${color}-idle`);
  const [falling, setFalling] = useState(false);
  const [photoStyle, setPhotoStyle] = useState({ opacity: 1, y: 0 });
  const [photoExpanded, setPhotoExpanded] = useState(false);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const popping = useRef(false);
  const onPopRef = useRef(onPop);
  onPopRef.current = onPop;
  const balloonRef = useRef(null);
  const yRef = useRef(startY);
  const startTimeRef = useRef(0);

  // Random float parameters per balloon
  const paramsRef = useRef({
    driftSpeed: 12 + Math.random() * 6,
    wobbleAmplitude: 15 + Math.random() * 20,
    wobbleDuration: 4 + Math.random() * 3,
  });

  useEffect(() => {
    const params = paramsRef.current;

    const tick = (timestamp) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      if (startTimeRef.current === 0) startTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (popping.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      yRef.current -= params.driftSpeed * dt;

      // Despawn when fully above the viewport
      if (yRef.current < -80) {
        onPopRef.current();
        return;
      }

      if (balloonRef.current) {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const wobbleX = Math.sin((elapsed / params.wobbleDuration) * 2 * Math.PI) * params.wobbleAmplitude;
        balloonRef.current.style.transform = `translate(${wobbleX}px, ${yRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [startX]);

  const handleClick = useCallback(() => {
    if (popping.current) return;
    popping.current = true;
    setAnimation(`${color}-pop`);
    setFalling(true);
  }, [color]);

  const handlePopComplete = useCallback(() => {
    // Pop animation done — photo keeps falling via CSS transition, then remove
    setTimeout(() => onPopRef.current(), 800);
  }, []);

  // When falling starts, animate the photo downward + fade
  useEffect(() => {
    if (!falling) return;
    // Trigger on next frame so the CSS transition kicks in
    requestAnimationFrame(() => {
      setPhotoStyle({ opacity: 0, y: 0 });
    });
  }, [falling]);

  return (
    <div
      ref={balloonRef}
      className="balloon"
      style={{
        left: startX,
        transform: `translate(0px, ${startY}px)`,
      }}
      onClick={handleClick}
    >
      <div className="balloon-sprite">
        <AnimatedSprite
          sheet={sheet}
          animations={animations}
          animation={animation}
          scale={scale}
          onComplete={animation.endsWith('-pop') ? handlePopComplete : undefined}
        />
      </div>
      {photo && (
        <div
          className={`balloon-photo${falling ? ' balloon-photo--falling' : ''}${photoExpanded ? ' balloon-photo--expanded' : ''}`}
          style={{
            opacity: photoStyle.opacity,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setPhotoExpanded(v => !v);
          }}
        >
          <img src={photo} alt="" />
        </div>
      )}
    </div>
  );
}
