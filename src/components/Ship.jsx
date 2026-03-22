import PixelSprite from '../sprites/PixelSprite';
import { shipSheet, SHIP_SCALE } from '../sprites/sheets/ship';
import { kirbySheet, KIRBY_ANIMATIONS, KIRBY_SCALE } from '../sprites/sheets/kirby';
import { foxSheet, FOX_ANIMATIONS, FOX_SCALE } from '../sprites/sheets/fox';
import ShipPassenger from './ShipPassenger';
import useShipMovement from '../hooks/useShipMovement';

export default function Ship({ moveBounds, dismissing, onExited }) {
  const { x, y, angleIndex, isMoving, movingRight } = useShipMovement({
    enabled: true,
    dismissing,
    bounds: moveBounds,
    onExited,
  });

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
      }}
    >
      <div style={{ position: 'relative' }}>
        <PixelSprite
          sheet={shipSheet}
          name={frameName}
          scale={SHIP_SCALE}
        />
        <ShipPassenger
          sheet={kirbySheet}
          animations={KIRBY_ANIMATIONS}
          scale={KIRBY_SCALE}
          facesRight={movingRight}
          offsetX={-20}
          offsetY={75}
          label="kirsten"
          labelColor="#f4a9a8"
        />
        <ShipPassenger
          sheet={foxSheet}
          animations={FOX_ANIMATIONS}
          scale={FOX_SCALE}
          facesRight={movingRight}
          offsetX={20}
          offsetY={75}
          label="izzy"
          labelColor="#8fcaca"
        />
      </div>
    </div>
  );
}
