import { useEffect, useRef } from 'react';

export default function FloatingBubble({ startX, startY, size, onDone }) {
  const elRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const driftSpeed = 30 + Math.random() * 20;
    const wobbleAmp = 10 + Math.random() * 25;
    const wobbleDur = 3 + Math.random() * 3;
    let y = 0;
    let lastTime = 0;
    let startTime = 0;
    let raf;

    const GROW_DURATION = 0.3;

    const tick = (ts) => {
      if (!lastTime) lastTime = ts;
      if (!startTime) startTime = ts;
      const dt = (ts - lastTime) / 1000;
      lastTime = ts;

      y -= driftSpeed * dt;

      if (y < -(startY + 120)) {
        onDoneRef.current();
        return;
      }

      const el = elRef.current;
      if (el) {
        const elapsed = (ts - startTime) / 1000;
        const wobbleX = Math.sin((elapsed / wobbleDur) * 2 * Math.PI) * wobbleAmp;
        const t = Math.min(elapsed / GROW_DURATION, 1);
        const scale = t < 0.7 ? (t / 0.7) * 1.1 : 1.1 - 0.1 * ((t - 0.7) / 0.3);
        // Fade out near the top
        const fadeStart = -(startY + 120) * 0.6;
        const opacity = y < fadeStart ? Math.max(0, 1 - (y - fadeStart) / (-(startY + 120) - fadeStart)) : 1;
        el.style.transform = `translate(${wobbleX}px, ${y}px) scale(${scale})`;
        el.style.opacity = opacity;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [startY]);

  return (
    <img
      ref={elRef}
      src="/bubble.png"
      alt=""
      className="floating-bubble"
      style={{
        position: 'fixed',
        left: startX,
        bottom: startY,
        width: size,
        height: size,
        transform: 'scale(0)',
        opacity: 0,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
        zIndex: 997,
      }}
    />
  );
}
