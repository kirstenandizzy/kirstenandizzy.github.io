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
  '/assets/us/IMG_1155.JPG',
  '/assets/us/IMG_7203.JPG',
  '/assets/us/IMG_7862.JPG',
  '/assets/us/IMG_8295.JPG',
  '/assets/us/IMG_8386.JPG',
  '/assets/us/IMG_8391.JPG',
  '/assets/us/IMG_8534.JPG',
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

  // Floating photos state
  const [photos, setPhotos] = useState([]);
  const photoIdRef = useRef(0);

  const removePhoto = useCallback((id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleClick = useCallback(() => {
    const idx = Math.floor(Math.random() * US_PHOTOS.length);

    const chosenPhoto = US_PHOTOS[idx];
    const newId = photoIdRef.current++;
    setPhotos(prev => [
      ...prev.filter(p => p.photo !== chosenPhoto),
      {
        id: newId,
        photo: chosenPhoto,
        spawnX: posRef.current.x + (Math.random() - 0.5) * 140,
        spawnY: posRef.current.y + 195,
      },
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
          onDone={() => removePhoto(p.id)}
        />
      ))}
    </div>
  );
}
