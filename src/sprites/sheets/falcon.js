import SpriteSheet from '../SpriteSheet';

const FALCON_SPRITES = {
  // Row: idle (2 frames)
  'idle-1'            : { x:   2, y:   9, w:  42, h:  57 },
  'idle-2'            : { x:  48, y:   2, w:  31, h:  64 },
  // Row: walk (6 frames)
  'walk-1'            : { x:   0, y:  72, w:  73, h:  55 },
  'walk-2'            : { x:  73, y:  72, w:  74, h:  55 },
  'walk-3'            : { x: 147, y:  72, w:  52, h:  55 },
  'walk-4'            : { x: 198, y:  72, w:  73, h:  55 },
  'walk-5'            : { x: 271, y:  72, w:  74, h:  55 },
  'walk-6'            : { x: 345, y:  72, w:  47, h:  55 },
  // Row: launch (2 frames)
  'launch-1'          : { x:   2, y: 141, w:  39, h:  74 },
  'launch-2'          : { x:  45, y: 132, w:  45, h:  83 },
  // Row: fall (3 frames)
  'fall-1'            : { x:   2, y: 238, w:  54, h:  56 },
  'fall-2'            : { x:  60, y: 229, w:  54, h:  65 },
  'fall-3'            : { x: 118, y: 221, w:  35, h:  73 },
  // Row: landed (9 frames)
  'landed-1'          : { x:   2, y: 301, w:  53, h:  51 },
  'landed-2'          : { x:  59, y: 301, w:  53, h:  51 },
  'landed-3'          : { x: 116, y: 301, w:  53, h:  51 },
  'landed-4'          : { x: 173, y: 301, w:  53, h:  51 },
  'landed-5'          : { x: 230, y: 301, w:  52, h:  51 },
  'landed-6'          : { x: 286, y: 301, w:  54, h:  51 },
  'landed-7'          : { x: 344, y: 300, w:  77, h:  52 },
  'landed-8'          : { x: 425, y: 300, w:  77, h:  52 },
  'landed-9'          : { x: 506, y: 300, w:  77, h:  52 },
};

export const falconSheet = new SpriteSheet('/assets/falcon.png', 585, 354, FALCON_SPRITES);

export const FALCON_SCALE = 1.3;

export const FALCON_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2'], fps: 4, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6'], fps: 10, loop: true },
  launch: { frames: ['launch-1', 'launch-2'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5', 'landed-6', 'landed-7', 'landed-8', 'landed-9'], fps: 8, loop: false },
};
