import SpriteSheet from '../SpriteSheet';

const TOADETTE_SPRITES = {
  // Row: idle (1 frame)
  'idle'              : { x:   2, y:   2, w:  17, h:  27 },
  // Row: walk (3 frames)
  'walk-1'            : { x:   2, y:  35, w:  21, h:  27 },
  'walk-2'            : { x:  28, y:  36, w:  22, h:  26 },
  'walk-3'            : { x:  58, y:  35, w:  20, h:  27 },
  // Row: launch (5 frames)
  'launch-1'          : { x:   2, y:  65, w:  21, h:  26 },
  'launch-2'          : { x:  27, y:  68, w:  24, h:  23 },
  'launch-3'          : { x:  55, y:  71, w:  25, h:  16 },
  'launch-4'          : { x:  84, y:  63, w:  18, h:  28 },
  'launch-5'          : { x: 106, y:  63, w:  18, h:  28 },
  // Row: fall (5 frames)
  'fall-1'            : { x:   2, y:  99, w:  20, h:  26 },
  'fall-2'            : { x:  26, y: 102, w:  24, h:  23 },
  'fall-3'            : { x:  54, y: 105, w:  25, h:  16 },
  'fall-4'            : { x:  83, y:  97, w:  18, h:  28 },
  'fall-5'            : { x: 105, y:  97, w:  18, h:  28 },
  // Row: landed (5 frames)
  'landed-1'          : { x:   2, y: 141, w:  16, h:  17 },
  'landed-2'          : { x:  22, y: 131, w:  17, h:  27 },
  'landed-3'          : { x:  43, y: 131, w:  17, h:  27 },
  'landed-4'          : { x:  64, y: 131, w:  17, h:  27 },
  'landed-5'          : { x:  85, y: 131, w:  17, h:  27 },
};

export const toadetteSheet = new SpriteSheet('/assets/toadette.png', 126, 160, TOADETTE_SPRITES);

export const TOADETTE_SCALE = 2.1; // idle/walk ~27px tall, matches Yoshi's rendered height

export const TOADETTE_ANIMATIONS = {
  idle: { frames: ['idle'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3'], fps: 10, loop: true },
  launch: { frames: ['launch-1', 'launch-2', 'launch-3', 'launch-4', 'launch-5'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3', 'fall-4', 'fall-5'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5'], fps: 8, loop: false, holdLastFrame: 3 },
};
