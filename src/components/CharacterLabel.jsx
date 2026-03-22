import { useState, useRef, useCallback, useEffect } from 'react';

export default function CharacterLabel({ name, color, bounce }) {
  const [showName, setShowName] = useState(true);
  const timerRef = useRef(null);

  // Auto-show label for a few seconds on mount (e.g. when character lands)
  useEffect(() => {
    timerRef.current = setTimeout(() => setShowName(false), 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleTap = useCallback(() => {
    setShowName(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowName(false), 2000);
  }, []);

  return (
    <div
      className={`character-label${!bounce ? ' character-label--npc' : ''}`}
      style={{ '--indicator-color': color }}
      onClick={handleTap}
    >
      <span className={`character-label__name${showName ? ' character-label__name--visible' : ''}${!bounce ? ' character-label__name--npc' : ''}`}>
        {name}
      </span>
      {bounce && <div className="character-label__arrow character-label__arrow--bounce" />}
    </div>
  );
}
