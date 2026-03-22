import { useState, useEffect, useCallback, useRef } from 'react';
import PixelSprite from '../sprites/PixelSprite';
import { shipSheet, SHIP_SCALE } from '../sprites/sheets/ship';
import { kirbySheet, KIRBY_ANIMATIONS, KIRBY_SCALE } from '../sprites/sheets/kirby';
import { foxSheet, FOX_ANIMATIONS, FOX_SCALE } from '../sprites/sheets/fox';
import ShipPassenger from './ShipPassenger';
import CharacterLabel from './CharacterLabel';
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
  '/assets/us/IMG_5028.png',
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
  '/assets/us/361944397_1074022363567622_5011367401865994938_n.jpg',
  '/assets/us/472556491_1798837570937235_6365342608124478053_n.jpg',
  '/assets/us/472774765_564364133104050_6867948515238976685_n.jpg',
  '/assets/us/573057034_18299144416283415_2933518403748701336_n.jpg',
  '/assets/us/574767440_18299144425283415_3527273988870995111_n.jpg',
  '/assets/us/628030738_18422576404191162_8931907093163855850_n.jpg',
  '/assets/us/649221427_17903334087382774_8487318363958040341_n.jpg',
  '/assets/us/650734638_18076128533625771_1112311911937791959_n.jpg',
  '/assets/us/650792603_18073917134176698_3037898199400638246_n.jpg',
  '/assets/us/652764048_18097745416814919_5222731605218249911_n.jpg',
  '/assets/us/652774933_18080458076071417_5936176016191988606_n.jpg',
  '/assets/us/654114036_18016545287820933_7380745160412997139_n.jpg',
  '/assets/us/655264111_18083534000594800_7318457668992851062_n.jpg',
  '/assets/us/655980007_18083364356522554_979278767968073449_n.jpg',
  '/assets/us/657270336_18100378408751745_1501406462696139114_n.jpg',
  '/assets/us/us.jpg',
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
    const activePhotos = new Set(photos.filter(p => p.photo).map(p => p.photo));
    const available = US_PHOTOS.filter(p => !activePhotos.has(p));
    const pool = available.length > 0 ? available : US_PHOTOS;
    const chosenPhoto = pool[Math.floor(Math.random() * pool.length)];
    const { x: cx, y: cy } = posRef.current;
    const baseY = cy + 195;
    const newId = photoIdRef.current++;

    // Clamp X to keep bubbles + wobble within the viewport.
    // FloatingPhoto wobble amplitude is up to 35px, photo container is 75px wide,
    // small bubbles up to ~30px wide. Use generous margins to prevent overflow.
    const vw = window.innerWidth;
    const leftMargin = 40;            // wobble room on the left
    const rightMarginPhoto = 115;     // 75px element + 35px wobble + 5px buffer
    const rightMarginBubble = 70;     // ~30px element + 35px wobble + 5px buffer
    const clampPhoto = (val) => Math.max(leftMargin, Math.min(vw - rightMarginPhoto, val));
    const clampBubble = (val) => Math.max(leftMargin, Math.min(vw - rightMarginBubble, val));
    // Scale spread to viewport so bubbles don't bunch at edges on mobile
    const photoSpread = Math.min(240, vw * 0.5);
    const bubbleSpread = Math.min(400, vw * 0.8);

    // Spawn the photo bubble
    const newItems = [
      {
        id: newId,
        photo: chosenPhoto,
        spawnX: clampPhoto(cx + (Math.random() - 0.5) * photoSpread),
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
        spawnX: clampBubble(cx + (Math.random() - 0.5) * bubbleSpread),
        spawnY: cy + Math.random() * 250,
      });
    }

    setPhotos(prev => [
      ...prev.filter(p => p.photo !== chosenPhoto),
      ...newItems,
    ]);
  }, [photos]);

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
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 30px)',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
          zIndex: 10,
        }}>
          <CharacterLabel name="click me" color="#f4a9a8" bounce repeat repeatInterval={6000} hideInitial />
        </div>
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
          label={visible ? "kk" : null}
          hoverLabel="kirsten"
          labelColor="#f4a9a8"
          labelFadeDelay={2000}
          glowColor="#c89ef2"
          idleEmoteMin={800}
          idleEmoteMax={2000}
        />
        <ShipPassenger
          sheet={foxSheet}
          animations={FOX_ANIMATIONS}
          scale={FOX_SCALE * 1.15}
          facesRight={movingRight}
          idleFacing="left"
          offsetX={20}
          offsetY={75}
          zIndex={1}
          label={visible ? "kiko" : null}
          hoverLabel="israel"
          labelColor="#8fcaca"
          labelFadeDelay={2000}
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
