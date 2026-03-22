import SpriteSheet from '../SpriteSheet';

const JIGGLY_SPRITES = {
  // Row 1: idle — front-facing sprites
  'idle-1'     : { x: 146, y:   2, w:  25, h:  30 },
  'idle-2'     : { x: 175, y:   2, w:  26, h:  30 },
  'idle-3'     : { x: 205, y:   3, w:  24, h:  29 },
  'idle-4'     : { x: 233, y:   4, w:  27, h:  28 },
  // Row 2: walk — side-facing sprites
  'walk-1'     : { x:   2, y:  40, w:  25, h:  26 },
  'walk-2'     : { x:  31, y:  39, w:  24, h:  27 },
  'walk-3'     : { x:  59, y:  39, w:  24, h:  27 },
  'walk-4'     : { x:  87, y:  38, w:  24, h:  28 },
  'walk-5'     : { x: 115, y:  38, w:  26, h:  28 },
  'walk-6'     : { x: 145, y:  38, w:  24, h:  28 },
  'walk-7'     : { x: 173, y:  39, w:  24, h:  27 },
  // Row 4: launch — tiny rolling/ball sprites
  'launch-1'   : { x: 158, y: 125, w:  16, h:  15 },
  'launch-2'   : { x: 178, y: 131, w:  16, h:   9 },
  'launch-3'   : { x: 198, y: 132, w:  20, h:   8 },
  'launch-4'   : { x: 222, y: 131, w:  16, h:   9 },
  'launch-5'   : { x: 242, y: 124, w:  16, h:  16 },
  'launch-6'   : { x: 262, y: 131, w:  16, h:   9 },
  'launch-7'   : { x: 282, y: 132, w:  20, h:   8 },
  // Row 3: fall — larger sprites
  'fall-1'     : { x:   2, y:  78, w:  25, h:  26 },
  'fall-2'     : { x:  31, y:  76, w:  26, h:  28 },
  'fall-3'     : { x:  61, y:  75, w:  24, h:  29 },
  'fall-4'     : { x:  89, y:  75, w:  24, h:  29 },
  // Row 5: landed — includes impact frame
  'landed-1'   : { x:   2, y: 162, w:  25, h:  26 },
  'landed-2'   : { x:  31, y: 163, w:  25, h:  25 },
  'landed-3'   : { x:  60, y: 151, w:  38, h:  37 },
  'landed-4'   : { x: 102, y: 162, w:  27, h:  26 },
  'landed-5'   : { x: 133, y: 163, w:  25, h:  25 },
  'landed-6'   : { x: 162, y: 161, w:  26, h:  27 },
};

export const jigglySheet = new SpriteSheet('/assets/jiggly.png', 497, 190, JIGGLY_SPRITES);

export const JIGGLY_SCALE = 1.5;

export const JIGGLY_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2', 'idle-3', 'idle-4'], fps: 8, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7'], fps: 10, loop: true },
  launch: { frames: ['launch-1', 'launch-2', 'launch-3', 'launch-4', 'launch-5', 'launch-6', 'launch-7'], fps: 10, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3', 'fall-4'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5', 'landed-6'], fps: 8, loop: false },
};
