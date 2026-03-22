import { useState, useRef, useCallback, useEffect } from 'react';

export default function CharacterLabel({ name, hoverName, color, bounce, repeat, repeatInterval = 5000, hideInitial }) {
  const [showName, setShowName] = useState(!hideInitial);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  // Auto-show label for a few seconds on mount (unless hideInitial)
  useEffect(() => {
    if (hideInitial) return;
    timerRef.current = setTimeout(() => {
      setShowName(false);
      if (hoverName) setHasShownOnce(true);
    }, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [hideInitial, hoverName]);

  // Repeating cycle: re-show label every repeatInterval ms
  useEffect(() => {
    if (!repeat) return;
    const startDelay = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setShowName(true);
        timerRef.current = setTimeout(() => setShowName(false), 2000);
      }, repeatInterval);
    }, 3500);
    return () => { clearTimeout(startDelay); clearInterval(intervalRef.current); };
  }, [repeat, repeatInterval]);

  const handleTap = useCallback(() => {
    if (hoverName && !hasShownOnce) setHasShownOnce(true);
    setShowName(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowName(false), 2000);
  }, [hoverName, hasShownOnce]);

  return (
    <div
      className={`character-label${!bounce ? ' character-label--npc' : ''}`}
      style={{ '--indicator-color': color }}
      onClick={handleTap}
    >
      <span className={`character-label__name${showName ? ' character-label__name--visible' : ''}${!bounce ? ' character-label__name--npc' : ''}`}>
        {hasShownOnce && hoverName ? hoverName : name}
      </span>
      {bounce && <div className="character-label__arrow character-label__arrow--bounce" />}
    </div>
  );
}
