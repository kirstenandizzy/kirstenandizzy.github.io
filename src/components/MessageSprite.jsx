import { useState, useCallback, useEffect } from 'react';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import {
  messageRightSheet,
  messageLeftSheet,
  messageBottomSheet,
  messageTopSheet,
  MESSAGE_ANIMATIONS,
  MESSAGE_SCALE,
} from '../sprites/sheets/message';

const LOOPING_ANIMATIONS = {
  row1: { ...MESSAGE_ANIMATIONS.row1, loop: true },
  row2: { ...MESSAGE_ANIMATIONS.row2, loop: true },
};

const SPAWN_SCALE = MESSAGE_SCALE / 2;
const LIFETIME = 3500;
const FADE_DURATION = 600;

const SHEETS = {
  right:  messageRightSheet,
  left:   messageLeftSheet,
  bottom: messageBottomSheet,
  top:    messageTopSheet,
};

let nextId = 0;

function randomEdgePosition() {
  const sides = ['top', 'bottom', 'left', 'right'];
  const side = sides[Math.floor(Math.random() * sides.length)];
  const along = Math.random() * 100;
  return { side, along };
}

function buildSpriteStyle(side, along) {
  const offset = 4;
  const base = { position: 'absolute', pointerEvents: 'none' };

  switch (side) {
    case 'right':
      return { ...base, right: 0, top: `${along}%`, transform: `translate(calc(100% + ${offset}px), -50%)` };
    case 'left':
      return { ...base, left: 0, top: `${along}%`, transform: `translate(calc(-100% - ${offset}px), -50%)` };
    case 'bottom':
      return { ...base, bottom: 0, left: `${along}%`, transform: `translate(-50%, calc(100% + ${offset}px))` };
    case 'top':
      return { ...base, top: 0, left: `${along}%`, transform: `translate(-50%, calc(-100% - ${offset}px))` };
    default:
      return base;
  }
}

function SpawnedMessage({ spawn, onDone }) {
  const [opacity, setOpacity] = useState(1);
  const { id, side, along, row } = spawn;
  const sheet = SHEETS[side];
  const style = { ...buildSpriteStyle(side, along), opacity, transition: `opacity ${FADE_DURATION}ms ease-out` };

  useEffect(() => {
    const fadeTimer = setTimeout(() => setOpacity(0), LIFETIME - FADE_DURATION);
    const removeTimer = setTimeout(() => onDone(id), LIFETIME);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onDone]);

  return (
    <div style={style} className="message-sprite" aria-hidden="true">
      <AnimatedSprite
        sheet={sheet}
        animations={LOOPING_ANIMATIONS}
        animation={row}
        scale={SPAWN_SCALE}
      />
    </div>
  );
}

export default function MessageSprite({ children, className, onClick }) {
  const [spawns, setSpawns] = useState([]);
  const pickRow = () => (Math.random() < 0.5 ? 'row1' : 'row2');

  const spawnMessage = useCallback(() => {
    const { side, along } = randomEdgePosition();
    const id = nextId++;
    setSpawns(prev => [...prev, { id, side, along, row: pickRow() }]);
  }, []);

  const removeSpawn = useCallback((id) => {
    setSpawns(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleTap = useCallback((e) => {
    if (e.type === 'touchstart') e.preventDefault();
    spawnMessage();
    if (onClick) onClick();
  }, [spawnMessage, onClick]);

  const handleEnter = useCallback(() => {
    spawnMessage();
  }, [spawnMessage]);

  return (
    <div
      className={`message-sprite-wrapper ${className || ''}`}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
      onClick={handleTap}
      onMouseEnter={handleEnter}
      onTouchStart={handleTap}
    >
      {children}
      {spawns.map(spawn => (
        <SpawnedMessage key={spawn.id} spawn={spawn} onDone={removeSpawn} />
      ))}
    </div>
  );
}
