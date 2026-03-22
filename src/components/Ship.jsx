import { useState, useEffect, useCallback, useRef } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import { shipSheet, SHIP_SCALE } from '../sprites/sheets/ship';
import { kirbySheet, KIRBY_ANIMATIONS, KIRBY_SCALE } from '../sprites/sheets/kirby';
import { foxSheet, FOX_ANIMATIONS, FOX_SCALE } from '../sprites/sheets/fox';
import ShipPassenger from './ShipPassenger';
import FloatingPhoto from './FloatingPhoto';
import useShipMovement from '../hooks/useShipMovement';

const US_PHOTOS = [
  '/assets/us/IMG_0069.JPG',
  '/assets/us/IMG_0128.JPG',
  '/assets/us/IMG_0136.JPG',
  '/assets/us/IMG_0559.JPG',
  '/assets/us/IMG_1155.JPG',
  '/assets/us/IMG_1446.JPG',
  '/assets/us/IMG_1677.JPG',
  '/assets/us/IMG_2720.JPG',
  '/assets/us/IMG_4817.JPG',
  '/assets/us/IMG_7203.JPG',
  '/assets/us/IMG_7621.JPG',
  '/assets/us/IMG_7862.JPG',
  '/assets/us/IMG_8295.JPG',
  '/assets/us/IMG_8386.JPG',
  '/assets/us/IMG_8391.JPG',
  '/assets/us/IMG_8534.JPG',
  '/assets/us/IMG_8551.JPG',
  '/assets/us/IMG_8557.JPG',
  '/assets/us/IMG_8602.JPG',
  '/assets/us/IMG_9681.JPG',
  '/assets/us/IMG_9793.JPG',
  '/assets/us/IMG_9795.JPG',
];

export default function Ship({ moveBounds, dismissing, onExited }) {
  const { x, y, angleIndex, isMoving, movingRight, ready } = useShipMovement({
    enabled: true,
    dismissing,
    bounds: moveBounds,
    onExited,
  });

  // Fade in after positioned off-screen
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (ready) requestAnimationFrame(() => setVisible(true));
  }, [ready]);

  // Track latest position for click handler
  const posRef = useRef({ x: 0, y: 0 });
  posRef.current = { x, y };

  // Floating photos + companion bubbles state
  const [photos, setPhotos] = useState([]);
  const photoIdRef = useRef(0);

  const removePhoto = useCallback((id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleClick = useCallback(() => {
    const idx = Math.floor(Math.random() * US_PHOTOS.length);

    const chosenPhoto = US_PHOTOS[idx];
    const { x: cx, y: cy } = posRef.current;
    const baseY = cy + 195;
    const newId = photoIdRef.current++;

    // Spawn the photo bubble
    const newItems = [
      {
        id: newId,
        photo: chosenPhoto,
        spawnX: cx + (Math.random() - 0.5) * 240,
        spawnY: baseY,
      },
    ];

    // Spawn 2-3 small companion bubbles spread widely, can spawn below the ship
    const bubbleCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < bubbleCount; i++) {
      newItems.push({
        id: photoIdRef.current++,
        photo: null,
        small: true,
        bubbleSize: 10 + Math.random() * 20,
        autoPopDelay: 2000 + Math.random() * 8000,
        spawnX: cx + (Math.random() - 0.5) * 400,
        spawnY: cy + Math.random() * 250,
      });
    }

    setPhotos(prev => [
      ...prev.filter(p => p.photo !== chosenPhoto),
      ...newItems,
    ]);
  }, []);

  const frameName = `angle-${angleIndex}`;

  return (
    <div
      className="ship-sprite"
      style={{
        position: 'fixed',
        left: x,
        bottom: y,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 998,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-in',
      }}
    >
      <div className="ship-clickable" onClick={handleClick}>
        <PixelSprite
          sheet={shipSheet}
          name={frameName}
          scale={SHIP_SCALE}
          style={{ filter: 'grayscale(0.6)' }}
        />
        <ShipPassenger
          sheet={kirbySheet}
          animations={KIRBY_ANIMATIONS}
          scale={KIRBY_SCALE * 1.25}
          facesRight={movingRight}
          idleFacing="right"
          offsetX={-20}
          offsetY={75}
          zIndex={2}
          label="kirsten"
          labelColor="#f4a9a8"
          glowColor="#c89ef2"
          idleEmoteMin={800}
          idleEmoteMax={2000}
        />
        <ShipPassenger
          sheet={foxSheet}
          animations={FOX_ANIMATIONS}
          scale={FOX_SCALE * 1.1}
          facesRight={movingRight}
          idleFacing="left"
          offsetX={20}
          offsetY={75}
          zIndex={1}
          label="izzy"
          labelColor="#8fcaca"
          glowColor="#8fcaca"
          freezeAfterEmote
        />
      </div>
      {photos.map(p => (
        <FloatingPhoto
          key={p.id}
          startX={p.spawnX}
          startY={p.spawnY}
          photo={p.photo}
          small={p.small}
          bubbleSize={p.bubbleSize}
          autoPopDelay={p.autoPopDelay}
          onDone={() => removePhoto(p.id)}
        />
      ))}
    </div>
  );
}
