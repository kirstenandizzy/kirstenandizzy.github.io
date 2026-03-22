import { useState, useRef, useCallback } from 'react';

export default function CharacterLabel({ name, color }) {
  const [showName, setShowName] = useState(false);
  const timerRef = useRef(null);

  const handleTap = useCallback(() => {
    setShowName(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowName(false), 2000);
  }, []);

  return (
    <div
      className="character-label"
      style={{ '--indicator-color': color }}
      onClick={handleTap}
    >
      <span className={`character-label__name${showName ? ' character-label__name--visible' : ''}`}>
        {name}
      </span>
      <div className="character-label__arrow" />
    </div>
  );
}
