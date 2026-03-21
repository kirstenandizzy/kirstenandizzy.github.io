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
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 3, value: 3 },
  { label: 4, value: 4 },
  { label: 5, value: 5 },
  { label: 6, value: 6 },
  { label: 7, value: 7 },
  { label: 8, value: 8 },
  { label: 9, value: 9 },
  { label: 10, value: 10 },
  { label: 11, value: 11 },
  { label: '12pm', value: 12 },
  { label: 1, value: 13 },
  { label: 2, value: 14 },
  { label: 3, value: 15 },
  { label: 4, value: 16 },
  { label: 5, value: 17 },
  { label: 6, value: 18 },
  { label: 7, value: 19 },
  { label: 8, value: 20 },
  { label: 9, value: 21 },
  { label: 10, value: 22 },
  { label: 11, value: 23 },
  { label: '12am', value: 24 }
];

const EVENTS = [
  { eventLabel: 'Doors Open', timeLabel: '5:00', value: 17 },
  { eventLabel: 'Ceremony', timeLabel: '5:30', value: 17.5 },
  { eventLabel: 'Cocktail Hour', timeLabel: '6:00', value: 18 },
  { eventLabel: 'Dinner', timeLabel: '7:00', value: 19 },
  { eventLabel: 'Reception', timeLabel: '8:00', value: 20 },
  { eventLabel: 'La Fin', timeLabel: '11:00', value: 23 }
];

const formatTimeOfDay = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${meridiem}`;
};

// Height of each label in the drum strip (px)
const STRIP_ITEM_HEIGHT = 40;
// Height of the visible drum window (px)
const WINDOW_HEIGHT = 150;

export default function Slider({ min = 0, max = 100, value, onChange, step = 1 }) {
  const timelineRef = useRef(null);
  const containerRef = useRef(null);
  const windowRef = useRef(null);
  const touchStartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 768px)').matches
  );

  // Refs to avoid re-registering touch listeners on every value change
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const targetValueRef = useRef(value);
  const animFrameRef = useRef(null);
  const velocityRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const lastTouchYRef = useRef(0);

  // Keep refs in sync
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { minRef.current = min; }, [min]);
  useEffect(() => { maxRef.current = max; }, [max]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lerp animation loop
  const startAnimation = () => {
    if (animFrameRef.current) return;

    const animate = () => {
      const current = valueRef.current;
      const target = targetValueRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.01) {
        if (onChangeRef.current) onChangeRef.current(target);
        animFrameRef.current = null;
        return;
      }

      const next = current + diff * 0.08;
      if (onChangeRef.current) onChangeRef.current(next);
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
      touchStartRef.current = e.touches[0].clientY;
      lastTouchYRef.current = e.touches[0].clientY;
      lastTouchTimeRef.current = Date.now();
      velocityRef.current = 0;
      targetValueRef.current = valueRef.current;
    };

    let deadZonePassed = false;
    let accumulatedDelta = 0;

    const handleTouchMove = (e) => {
      if (touchStartRef.current === null) return;
      e.preventDefault(); // prevent iOS Safari from scrolling/rubber-banding

      const currentY = e.touches[0].clientY;
      const now = Date.now();
      const deltaY = currentY - lastTouchYRef.current;

      const dt = now - lastTouchTimeRef.current;
      if (dt > 0) {
        velocityRef.current = deltaY / dt;
      }
      lastTouchYRef.current = currentY;
      lastTouchTimeRef.current = now;

      if (!deadZonePassed) {
        accumulatedDelta += Math.abs(deltaY);
        if (accumulatedDelta < DEAD_ZONE) return;
        deadZonePassed = true;
      }

      const hoursDelta = -deltaY / PIXELS_PER_HOUR;
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

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isMobile]);

  // Smooth wheel scrolling on desktop
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isMobile) return;

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
    if (isMobile) {
      targetValueRef.current = hourValue;
      startAnimation();
    } else if (onChange) {
      onChange(hourValue);
    }
  };

  // --- Mobile drum picker rendering ---
  if (isMobile) {
    const totalStripHeight = HOURS.length * STRIP_ITEM_HEIGHT;
    // value=0 → strip at top (first label centered), value=max → strip scrolled up
    const stripOffset = -(value / max) * totalStripHeight + WINDOW_HEIGHT / 2;

    return (
      <div className='slider slider--mobile' ref={containerRef}>
        <h3>
          <span>Timeline of Events</span>
          <span>Sunday, September 20th, 2026</span>
        </h3>
        <div className='slider__content'>
          <div className='slider__window' ref={windowRef}>
            <div className='slider__indicator' />
            <div
              className='slider__strip'
              style={{ transform: `translateY(${stripOffset}px)` }}
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
            {EVENTS.map((event) => (
              <button
                key={event.eventLabel}
                className='slider__mobile-event'
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
      <h3>
        <span>Timeline of Events</span>
        <span>Sunday, September 20th, 2026</span>
      </h3>
      <div className='slider__content'>
        <div className='slider__timeline' ref={timelineRef}>
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
        <div className='slider__ticks'>
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
          style={{ '--slider-percentage': thumbPosition(value, 24, -30) }}
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
        <div>
          <div className='slider__events'>
            {EVENTS.map((event) => (
              <div
                key={event.eventLabel}
                className='slider__event'
                style={{ left: thumbPosition(event.value, 24) }}
                title={event.eventLabel}
                onClick={() => handleHourClick(event.value)}
                role='button'
                tabIndex={0}
              >
                <div className='slider__event-metadata-container'>
                  <div className='slider__event-dot' />
                  <div className='slider__event-label'>{event.eventLabel}</div>
                  <div className='slider__event-label'>{event.timeLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
