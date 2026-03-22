import SpriteSheet from '../SpriteSheet';

const PEACH_SPRITES = {
  // Row: idle (7 frames)
  'idle-1'            : { x:   2, y:   4, w:  28, h:  38 },
  'idle-2'            : { x:  34, y:   3, w:  28, h:  39 },
  'idle-3'            : { x:  66, y:   2, w:  28, h:  40 },
  'idle-4'            : { x:  98, y:   3, w:  28, h:  39 },
  'idle-5'            : { x: 130, y:   2, w:  28, h:  40 },
  'idle-6'            : { x: 162, y:   3, w:  28, h:  39 },
  'idle-7'            : { x: 194, y:   4, w:  28, h:  38 },
  // Row: walk (7 frames)
  'walk-1'            : { x:   2, y:  49, w:  28, h:  38 },
  'walk-2'            : { x:  34, y:  50, w:  28, h:  37 },
  'walk-3'            : { x:  66, y:  48, w:  28, h:  39 },
  'walk-4'            : { x:  98, y:  49, w:  28, h:  38 },
  'walk-5'            : { x: 130, y:  50, w:  28, h:  37 },
  'walk-6'            : { x: 162, y:  48, w:  28, h:  39 },
  'walk-7'            : { x: 194, y:  49, w:  28, h:  38 },
  // Row: launch (1 frame)
  'launch'            : { x:   2, y:  93, w:  23, h:  44 },
  // Row: fall (6 frames)
  'fall-1'            : { x:   2, y: 143, w:  26, h:  39 },
  'fall-2'            : { x:  34, y: 143, w:  30, h:  39 },
  'fall-3'            : { x:  67, y: 143, w:  30, h:  39 },
  'fall-4'            : { x: 101, y: 144, w:  27, h:  43 },
  'fall-5'            : { x: 131, y: 146, w:  29, h:  41 },
  'fall-6'            : { x: 163, y: 145, w:  29, h:  42 },
  // Row: landed (14 frames)
  'landed-1'          : { x:   2, y: 194, w:  24, h:  42 },
  'landed-2'          : { x:  32, y: 197, w:  24, h:  39 },
  'landed-3'          : { x:  59, y: 196, w:  28, h:  40 },
  'landed-4'          : { x:  91, y: 205, w:  32, h:  31 },
  'landed-5'          : { x: 127, y: 204, w:  24, h:  32 },
  'landed-6'          : { x: 153, y: 204, w:  24, h:  32 },
  'landed-7'          : { x: 179, y: 204, w:  24, h:  32 },
  'landed-8'          : { x: 207, y: 204, w:  24, h:  32 },
  'landed-9'          : { x: 235, y: 197, w:  32, h:  39 },
  'landed-10'         : { x: 271, y: 193, w:  32, h:  43 },
  'landed-11'         : { x: 307, y: 191, w:  32, h:  45 },
  'landed-12'         : { x: 343, y: 188, w:  32, h:  48 },
  'landed-13'         : { x: 379, y: 188, w:  32, h:  48 },
  'landed-14'         : { x: 415, y: 190, w:  26, h:  46 },
};

export const peachSheet = new SpriteSheet('/assets/peach.png', 443, 238, PEACH_SPRITES);

export const PEACH_SCALE = 1.9; // matches Yoshi's rendered height (~66px)

export const PEACH_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2', 'idle-3', 'idle-4', 'idle-5', 'idle-6', 'idle-7'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7'], fps: 10, loop: true },
  launch: { frames: ['launch'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3', 'fall-4', 'fall-5', 'fall-6'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5', 'landed-6', 'landed-7', 'landed-8', 'landed-9', 'landed-10', 'landed-11', 'landed-12', 'landed-13', 'landed-14'], fps: 8, loop: false },
};
