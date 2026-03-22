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
        // Fade out based on proximity to top of viewport
        const rect = el.getBoundingClientRect();
        const screenTop = rect.top;
        const vh = window.innerHeight;
        const mobile = vh < 768;
        let opacity;
        const hardZone = vh * (mobile ? 0.1 : 0.15);
        if (screenTop < hardZone) {
          opacity = Math.max(0, screenTop / hardZone) * 0.9;
        } else {
          opacity = 0.9 + 0.1 * Math.min(1, (screenTop - hardZone) / (vh * 0.4));
        }
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
        zIndex: 998,
      }}
    />
  );
}
