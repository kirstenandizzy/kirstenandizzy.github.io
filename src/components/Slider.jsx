import { useRef, useState, useEffect } from 'react';
import '../styles/Slider.scss';

// CONSTANTS: Slider thumb positioning
// ⚠️ MUST MATCH .slider__input::-webkit-slider-thumb width in Slider.scss (line 215)
const THUMB_WIDTH = 12; // px
const THUMB_RADIUS = THUMB_WIDTH / 2;

/**
 * Calculate CSS position for slider-related elements accounting for thumb width.
 * Native range input thumb center is constrained to [thumbRadius, 100% - thumbRadius],
 * not the full [0%, 100%]. This helper corrects positioning to match thumb center.
 *
 * @param {number} value - Current slider value (0 to max)
 * @param {number} max - Maximum slider value (typically 24 for hours)
 * @param {number} adjustment - Optional CSS offset in pixels (default: 0)
 *                              Use negative for left, positive for right
 *                              (e.g., -30 to center a 60px label)
 * @returns {string} CSS calc() expression safe for use in inline styles
 */
const thumbPosition = (value, max, adjustment = 0) => {
  if (value < 0 || value > max) {
    console.warn(`thumbPosition: value ${value} outside range [0, ${max}]`);
  }
  const fraction = value / max;
  const adjustStr = adjustment !== 0
    ? ` ${adjustment > 0 ? '+' : '-'} ${Math.abs(adjustment)}px`
    : '';
  return `calc(${fraction} * (100% - ${THUMB_WIDTH}px) + ${THUMB_RADIUS}px${adjustStr})`;
};


const HOURS = [
  { label: '12am', value: 0 },
  { label: '1am', value: 1 },
  { label: '2am', value: 2 },
  { label: '3am', value: 3 },
  { label: '4am', value: 4 },
  { label: '5am', value: 5 },
  { label: '6am', value: 6 },
  { label: '7am', value: 7 },
  { label: '8am', value: 8 },
  { label: '9am', value: 9 },
  { label: '10am', value: 10 },
  { label: '11am', value: 11 },
  { label: '12pm', value: 12 },
  { label: '1pm', value: 13 },
  { label: '2pm', value: 14 },
  { label: '3pm', value: 15 },
  { label: '4pm', value: 16 },
  { label: '5pm', value: 17 },
  { label: '6pm', value: 18 },
  { label: '7pm', value: 19 },
  { label: '8pm', value: 20 },
  { label: '9pm', value: 21 },
  { label: '10pm', value: 22 },
  { label: '11pm', value: 23 },
  { label: '12am', value: 24 }
];

const EVENTS = [
  { eventLabel: 'Doors Open', timeLabel: '5:00', value: 17 },
  { eventLabel: 'Ceremony', timeLabel: '5:30', value: 17.5 },
  { eventLabel: 'Cocktail Hour', timeLabel: '6:00', value: 18 },
  { eventLabel: 'Dinner', timeLabel: '7:00', value: 19 },
  { eventLabel: 'Reception', timeLabel: '8:00', value: 20 },
  { eventLabel: 'Fin', timeLabel: '11:00', value: 23 }
];

const formatTimeOfDay = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${meridiem}`;
};

// Width of each label in the horizontal drum strip (px)
const STRIP_ITEM_WIDTH = 55;
// Width of the visible horizontal drum window (px)
const WINDOW_WIDTH = 280;

export default function Slider({ min = 0, max = 100, value, onChange, step = 1 }) {
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const windowRef = useRef(null);
  const touchStartRef = useRef(null);
  const [isMobile] = useState(true);

  // Refs to avoid re-registering touch listeners on every value change
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const targetValueRef = useRef(value);
  const lastOnChangeRef = useRef(0);
  const animFrameRef = useRef(null);
  const velocityRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const lastTouchYRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { minRef.current = min; }, [min]);
  useEffect(() => { maxRef.current = max; }, [max]);


  // Lerp animation loop
  const startAnimation = (force) => {
    if (animFrameRef.current && !force) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const animate = () => {
      const current = valueRef.current;
      const target = targetValueRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.01) {
        if (onChangeRef.current) onChangeRef.current(target);
        animFrameRef.current = null;
        lastOnChangeRef.current = 0;
        return;
      }

      const lerpFactor = 0.08;
      const next = current + diff * lerpFactor;
      // Throttle onChange to ~30fps to avoid hammering the 3D scene
      const now = performance.now();
      if (now - lastOnChangeRef.current > 30) {
        lastOnChangeRef.current = now;
        if (onChangeRef.current) onChangeRef.current(next);
      } else {
        // Update local ref so drum strip stays smooth, but skip scene re-render
        valueRef.current = next;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle touch scrolling on mobile — attaches to the entire mobile container
  useEffect(() => {
    const target = isMobile ? containerRef.current : null;
    if (!target) return;

    const PIXELS_PER_HOUR = 30;
    const DEAD_ZONE = 3;

    const handleTouchStart = (e) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      touchStartRef.current = e.touches[0].clientX;
      lastTouchYRef.current = e.touches[0].clientX;
      lastTouchTimeRef.current = Date.now();
      velocityRef.current = 0;
      targetValueRef.current = valueRef.current;
    };

    let deadZonePassed = false;
    let accumulatedDelta = 0;

    const handleTouchMove = (e) => {
      if (touchStartRef.current === null) return;
      e.preventDefault(); // prevent iOS Safari from scrolling/rubber-banding

      const currentX = e.touches[0].clientX;
      const now = Date.now();
      const deltaX = currentX - lastTouchYRef.current;

      const dt = now - lastTouchTimeRef.current;
      if (dt > 0) {
        velocityRef.current = deltaX / dt;
      }
      lastTouchYRef.current = currentX;
      lastTouchTimeRef.current = now;

      if (!deadZonePassed) {
        accumulatedDelta += Math.abs(deltaX);
        if (accumulatedDelta < DEAD_ZONE) return;
        deadZonePassed = true;
      }

      const hoursDelta = -deltaX / PIXELS_PER_HOUR;
      const newTarget = Math.max(
        minRef.current,
        Math.min(maxRef.current, targetValueRef.current + hoursDelta)
      );
      targetValueRef.current = newTarget;
      startAnimation();
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
      deadZonePassed = false;
      accumulatedDelta = 0;

      const velocity = velocityRef.current;
      if (Math.abs(velocity) > 0.05) {
        let v = velocity;
        const FRICTION = 0.94;

        const momentumAnimate = () => {
          v *= FRICTION;
          if (Math.abs(v) < 0.001) {
            animFrameRef.current = null;
            return;
          }
          const hoursDelta = -(v * 16) / PIXELS_PER_HOUR;
          const newTarget = Math.max(
            minRef.current,
            Math.min(maxRef.current, targetValueRef.current + hoursDelta)
          );
          targetValueRef.current = newTarget;

          const current = valueRef.current;
          const diff = targetValueRef.current - current;
          const next = current + diff * 0.18;
          if (onChangeRef.current) onChangeRef.current(next);

          animFrameRef.current = requestAnimationFrame(momentumAnimate);
        };

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(momentumAnimate);
      }
    };

    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });
    target.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse drag support for desktop
    let mouseDeadZonePassed = false;
    let mouseAccumulatedDelta = 0;

    const handleMouseDown = (e) => {
      e.preventDefault(); // prevent text selection
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      touchStartRef.current = e.clientX;
      lastTouchYRef.current = e.clientX;
      lastTouchTimeRef.current = Date.now();
      velocityRef.current = 0;
      targetValueRef.current = valueRef.current;
      mouseDeadZonePassed = false;
      mouseAccumulatedDelta = 0;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (touchStartRef.current === null) return;

      const currentX = e.clientX;
      const now = Date.now();
      const deltaX = currentX - lastTouchYRef.current;

      const dt = now - lastTouchTimeRef.current;
      if (dt > 0) {
        velocityRef.current = deltaX / dt;
      }
      lastTouchYRef.current = currentX;
      lastTouchTimeRef.current = now;

      if (!mouseDeadZonePassed) {
        mouseAccumulatedDelta += Math.abs(deltaX);
        if (mouseAccumulatedDelta < DEAD_ZONE) return;
        mouseDeadZonePassed = true;
      }

      const hoursDelta = -deltaX / PIXELS_PER_HOUR;
      const newTarget = Math.max(
        minRef.current,
        Math.min(maxRef.current, targetValueRef.current + hoursDelta)
      );
      targetValueRef.current = newTarget;
      startAnimation();
    };

    const handleMouseUp = () => {
      touchStartRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const velocity = velocityRef.current;
      if (Math.abs(velocity) > 0.05) {
        let v = velocity;
        const FRICTION = 0.94;

        const momentumAnimate = () => {
          v *= FRICTION;
          if (Math.abs(v) < 0.001) {
            animFrameRef.current = null;
            return;
          }
          const hoursDelta = -(v * 16) / PIXELS_PER_HOUR;
          const newTarget = Math.max(
            minRef.current,
            Math.min(maxRef.current, targetValueRef.current + hoursDelta)
          );
          targetValueRef.current = newTarget;

          const current = valueRef.current;
          const diff = targetValueRef.current - current;
          const next = current + diff * 0.18;
          if (onChangeRef.current) onChangeRef.current(next);

          animFrameRef.current = requestAnimationFrame(momentumAnimate);
        };

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(momentumAnimate);
      }
    };

    target.addEventListener('mousedown', handleMouseDown);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      target.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isMobile]);

  // Smooth wheel scrolling on desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const PIXELS_PER_HOUR = 200;

    const handleWheel = (e) => {
      e.preventDefault();
      // Sync target to current value if no animation is running
      if (!animFrameRef.current) {
        targetValueRef.current = valueRef.current;
      }
      const delta = e.deltaY / PIXELS_PER_HOUR;
      const newTarget = Math.max(
        minRef.current,
        Math.min(maxRef.current, targetValueRef.current + delta)
      );
      targetValueRef.current = newTarget;
      startAnimation();
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isMobile]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (onChange) onChange(newValue);
  };

  const handleHourClick = (hourValue) => {
    targetValueRef.current = hourValue;
    startAnimation(true);
  };

  // --- Mobile drum picker rendering ---
  if (isMobile) {
    const totalStripWidth = HOURS.length * STRIP_ITEM_WIDTH;
    // value=0 → strip at left (first label centered), value=max → strip scrolled left
    const stripOffset = -(value / max) * totalStripWidth + WINDOW_WIDTH / 2;

    return (
      <div className='slider slider--mobile' ref={containerRef}>
        <h3 style={{ '--i': 0 }}>
          <span>Schedule of Events</span>
          <span>Sunday, September 20th, 2026</span>
          <span className='alex-brush-regular'>
            <a className='location-link' href='https://www.google.com/maps?daddr=931+Ocean+Ave,+Sea+Bright,+NJ+07760' target='_blank' rel='noopener noreferrer'>
              <span className='location-icon' aria-hidden='true'>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' width='1em' height='1em'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg>
              </span>
              Sea Bright, New Jersey
            </a>
          </span>
        </h3>
        <div className='slider__content' style={{ '--i': 1 }}>
          <div className='slider__window slider__window--horizontal' ref={windowRef}>
            <div className='slider__indicator' />
            <div
              className='slider__strip slider__strip--horizontal'
              style={{ transform: `translateX(${stripOffset}px)` }}
            >
              {HOURS.map((hour) => {
                const distance = Math.abs(hour.value - value);
                const opacity = Math.max(0.2, 1 - distance * 0.15);
                const scale = Math.max(0.7, 1 - distance * 0.04);
                return (
                  <div
                    key={hour.value}
                    className='slider__strip-item'
                    style={{ opacity, transform: `scale(${scale})` }}
                    onClick={() => handleHourClick(hour.value)}
                  >
                    {hour.label}
                  </div>
                );
              })}
            </div>
          </div>
          <div className='slider__mobile-events'>
            {EVENTS.map((event, i) => (
              <button
                key={event.eventLabel}
                className='slider__mobile-event'
                style={{ '--i': i + 2 }}
                onClick={() => handleHourClick(event.value)}
              >
                <span className='slider__mobile-event-time'>{event.timeLabel}</span>
                <span className='slider__mobile-event-label'>{event.eventLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Desktop rendering (unchanged) ---
  return (
    <div className='slider' ref={containerRef}>
      <h3 style={{ '--i': 0 }}>
        <span>Schedule of Events</span>
        <span>Sunday, September 20th, 2026</span>
        <span className='alex-brush-regular'>
          <a className='location-link' href='https://www.google.com/maps?daddr=931+Ocean+Ave,+Sea+Bright,+NJ+07760' target='_blank' rel='noopener noreferrer'>
            <span className='location-icon' aria-hidden='true'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' width='1em' height='1em'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z'/></svg>
            </span>
            Sea Bright, New Jersey
          </a>
        </span>
      </h3>
      <div className='slider__content'>
        <div className='slider__timeline' style={{ '--i': 1 }} ref={timelineRef}>
          {HOURS.map((hour) => (
            <button
              key={hour.value}
              className={`slider__label ${Math.round(value) === hour.value ? 'slider__label--active' : ''}`}
              onClick={() => handleHourClick(hour.value)}
              style={{ left: thumbPosition(hour.value, 24) }}
            >
              {hour.label}
            </button>
          ))}
        </div>
        <div className='slider__ticks' style={{ '--i': 2 }}>
          {Array.from({ length: 49 }, (_, i) => {
            const tickValue = i * 0.5;
            const isHour = i % 2 === 0;
            return (
              <div
                key={i}
                className={`slider__tick ${isHour ? 'slider__tick--hour' : 'slider__tick--half'}`}
                style={{ left: thumbPosition(tickValue, 24) }}
              />
            );
          })}
        </div>
        <div
          className='slider__input-container'
          style={{ '--i': 3, '--slider-percentage': thumbPosition(value, 24, -30) }}
        >
          <div className='slider__time-label'>
            {formatTimeOfDay(value)}
          </div>
          <input
            className='slider__input'
            type='range'
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            aria-label='Timeline slider'
          />
        </div>
        <div style={{ '--i': 4 }}>
          <div className='slider__events'>
            {EVENTS.map((event, idx) => (
              <button
                key={event.eventLabel}
                className='slider__event'
                style={{ left: thumbPosition(event.value, 24), '--i': idx }}
                title={event.eventLabel}
                onClick={() => handleHourClick(event.value)}
              >
                <div className='slider__event-metadata-container'>
                  <div className='slider__event-dot' />
                  <div className='slider__event-label'>{event.eventLabel}</div>
                  <div className='slider__event-label'>{event.timeLabel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
