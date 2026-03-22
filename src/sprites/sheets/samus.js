import SpriteSheet from '../SpriteSheet';

const SAMUS_SPRITES = {
  // Row: idle (8 frames)
  'idle-1'            : { x:  12, y:  20, w:  35, h:  50 },
  'idle-2'            : { x:  54, y:  19, w:  35, h:  51 },
  'idle-3'            : { x:  93, y:  19, w:  36, h:  51 },
  'idle-4'            : { x: 134, y:  19, w:  37, h:  51 },
  'idle-5'            : { x: 177, y:  19, w:  36, h:  51 },
  'idle-6'            : { x: 219, y:  21, w:  35, h:  49 },
  'idle-7'            : { x: 264, y:  21, w:  35, h:  49 },
  'idle-8'            : { x: 309, y:  21, w:  35, h:  49 },
  // Row: walk (8 frames)
  'walk-1'            : { x:  10, y:  96, w:  36, h:  48 },
  'walk-2'            : { x:  59, y:  95, w:  35, h:  49 },
  'walk-3'            : { x: 109, y:  95, w:  28, h:  50 },
  'walk-4'            : { x: 150, y:  94, w:  30, h:  52 },
  'walk-5'            : { x: 197, y:  93, w:  34, h:  53 },
  'walk-6'            : { x: 245, y:  94, w:  30, h:  51 },
  'walk-7'            : { x: 287, y:  95, w:  30, h:  50 },
  'walk-8'            : { x: 326, y:  95, w:  35, h:  49 },
  // Row: launch (10 frames)
  'launch-1'          : { x:  10, y: 159, w:  30, h:  33 },
  'launch-2'          : { x:  57, y: 162, w:  26, h:  26 },
  'launch-3'          : { x:  97, y: 164, w:  22, h:  22 },
  'launch-4'          : { x: 137, y: 164, w:  23, h:  23 },
  'launch-5'          : { x: 175, y: 165, w:  23, h:  22 },
  'launch-6'          : { x: 213, y: 164, w:  23, h:  23 },
  'launch-7'          : { x: 256, y: 164, w:  22, h:  22 },
  'launch-8'          : { x: 301, y: 165, w:  23, h:  22 },
  'launch-9'          : { x: 346, y: 164, w:  23, h:  22 },
  'launch-10'         : { x: 388, y: 164, w:  23, h:  23 },
  // Row: fall (14 frames)
  'fall-1'            : { x:  10, y: 211, w:  43, h:  51 },
  'fall-2'            : { x:  67, y: 208, w:  53, h:  47 },
  'fall-3'            : { x: 137, y: 206, w:  61, h:  35 },
  'fall-4'            : { x: 206, y: 204, w:  59, h:  38 },
  'fall-5'            : { x: 281, y: 202, w:  41, h:  51 },
  'fall-6'            : { x: 335, y: 201, w:  31, h:  60 },
  'fall-7'            : { x: 380, y: 216, w:  44, h:  48 },
  'fall-8'            : { x: 436, y: 232, w:  49, h:  31 },
  'fall-9'            : { x: 494, y: 230, w:  57, h:  33 },
  'fall-10'           : { x: 566, y: 224, w:  41, h:  40 },
  'fall-11'           : { x: 622, y: 221, w:  41, h:  43 },
  'fall-12'           : { x: 683, y: 221, w:  40, h:  43 },
  'fall-13'           : { x: 740, y: 221, w:  40, h:  43 },
  'fall-14'           : { x: 792, y: 209, w:  31, h:  54 },
  // Row: landed (17 frames)
  'landed-1'          : { x:   8, y: 276, w:  41, h:  48 },
  'landed-2'          : { x:  66, y: 274, w:  41, h:  50 },
  'landed-3'          : { x: 127, y: 275, w:  38, h:  49 },
  'landed-4'          : { x: 182, y: 275, w:  36, h:  49 },
  'landed-5'          : { x: 237, y: 277, w:  42, h:  47 },
  'landed-6'          : { x: 299, y: 283, w:  37, h:  41 },
  'landed-7'          : { x: 356, y: 282, w:  37, h:  42 },
  'landed-8'          : { x: 416, y: 283, w:  36, h:  41 },
  'landed-9'          : { x: 472, y: 282, w:  37, h:  42 },
  'landed-10'         : { x: 527, y: 283, w:  38, h:  41 },
  'landed-11'         : { x: 584, y: 282, w:  38, h:  42 },
  'landed-12'         : { x: 641, y: 282, w:  36, h:  42 },
  'landed-13'         : { x: 700, y: 282, w:  35, h:  42 },
  'landed-14'         : { x: 751, y: 281, w:  39, h:  43 },
  'landed-15'         : { x: 809, y: 282, w:  39, h:  42 },
  'landed-16'         : { x: 867, y: 283, w:  44, h:  41 },
  'landed-17'         : { x: 926, y: 282, w:  43, h:  42 },
};

export const samusSheet = new SpriteSheet('/assets/samus.png', 984, 345, SAMUS_SPRITES);

export const SAMUS_SCALE = 1.5;

export const SAMUS_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2', 'idle-3', 'idle-4', 'idle-5', 'idle-6', 'idle-7', 'idle-8'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7', 'walk-8'], fps: 10, loop: true },
  launch: { frames: ['launch-1', 'launch-2', 'launch-3', 'launch-4', 'launch-5', 'launch-6', 'launch-7', 'launch-8', 'launch-9', 'launch-10'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3', 'fall-4', 'fall-5', 'fall-6', 'fall-7', 'fall-8', 'fall-9', 'fall-10', 'fall-11', 'fall-12', 'fall-13', 'fall-14'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5', 'landed-6', 'landed-7', 'landed-8', 'landed-9', 'landed-10', 'landed-11', 'landed-12', 'landed-13', 'landed-14', 'landed-15', 'landed-16', 'landed-17'], fps: 8, loop: false },
};
