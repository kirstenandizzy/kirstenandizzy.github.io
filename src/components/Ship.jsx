import { useState, useEffect } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import { shipSheet, SHIP_SCALE } from '../sprites/sheets/ship';
import { kirbySheet, KIRBY_ANIMATIONS, KIRBY_SCALE } from '../sprites/sheets/kirby';
import { foxSheet, FOX_ANIMATIONS, FOX_SCALE } from '../sprites/sheets/fox';
import ShipPassenger from './ShipPassenger';
import useShipMovement from '../hooks/useShipMovement';

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

  const frameName = `angle-${angleIndex}`;

  return (
    <div
      className="ship-sprite"
      style={{
        position: 'absolute',
        left: x,
        bottom: y,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-in',
      }}
    >
      <div style={{ position: 'relative' }}>
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
          offsetX={20}
          offsetY={75}
          zIndex={1}
          label="izzy"
          labelColor="#8fcaca"
          glowColor="#8fcaca"
          freezeAfterEmote
        />
      </div>
    </div>
  );
}
