import SpriteSheet from '../SpriteSheet';

const DONKEY_SPRITES = {
  // Row 1: idle (6 frames, normalized to 37x35 — bottom-aligned, center-aligned)
  'idle-1'     : { x:  17, y:  11, w:  37, h:  35 },
  'idle-2'     : { x:  79, y:  11, w:  37, h:  35 },
  'idle-3'     : { x: 141, y:  11, w:  37, h:  35 },
  'idle-4'     : { x: 210, y:  11, w:  37, h:  35 },
  'idle-5'     : { x: 270, y:  11, w:  37, h:  35 },
  'idle-6'     : { x: 331, y:  11, w:  37, h:  35 },
  // Row 2: walk (6 frames)
  'walk-1'     : { x:  21, y:  82, w:  26, h:  28 },
  'walk-2'     : { x:  84, y:  81, w:  28, h:  29 },
  'walk-3'     : { x: 148, y:  80, w:  29, h:  30 },
  'walk-4'     : { x: 216, y:  80, w:  27, h:  30 },
  'walk-5'     : { x: 283, y:  80, w:  25, h:  30 },
  'walk-6'     : { x: 346, y:  82, w:  26, h:  28 },
  // Row 4: launch — curling/rolling frames
  'launch-1'   : { x:  21, y: 209, w:  24, h:  30 },
  'launch-2'   : { x:  86, y: 211, w:  26, h:  21 },
  'launch-3'   : { x: 151, y: 208, w:  25, h:  23 },
  'launch-4'   : { x: 216, y: 206, w:  25, h:  25 },
  'launch-5'   : { x: 283, y: 206, w:  22, h:  23 },
  'launch-6'   : { x: 345, y: 207, w:  25, h:  22 },
  'launch-7'   : { x: 411, y: 211, w:  28, h:  22 },
  'launch-8'   : { x: 477, y: 207, w:  22, h:  30 },
  // Row 3: fall — arms raised (8 frames)
  'fall-1'     : { x:  23, y: 133, w:  32, h:  40 },
  'fall-2'     : { x:  89, y: 133, w:  26, h:  40 },
  'fall-3'     : { x: 154, y: 135, w:  23, h:  38 },
  'fall-4'     : { x: 216, y: 132, w:  30, h:  41 },
  'fall-5'     : { x: 280, y: 133, w:  32, h:  40 },
  'fall-6'     : { x: 346, y: 133, w:  25, h:  40 },
  'fall-7'     : { x: 411, y: 135, w:  22, h:  38 },
  'fall-8'     : { x: 475, y: 132, w:  30, h:  41 },
  // Row 5: landed (9 frames)
  'landed-1'   : { x:  22, y: 271, w:  24, h:  30 },
  'landed-2'   : { x:  86, y: 268, w:  29, h:  33 },
  'landed-3'   : { x: 149, y: 258, w:  34, h:  43 },
  'landed-4'   : { x: 217, y: 260, w:  30, h:  41 },
  'landed-5'   : { x: 282, y: 278, w:  39, h:  23 },
  'landed-6'   : { x: 347, y: 280, w:  33, h:  21 },
  'landed-7'   : { x: 412, y: 276, w:  34, h:  25 },
  'landed-8'   : { x: 477, y: 272, w:  32, h:  29 },
  'landed-9'   : { x: 542, y: 271, w:  28, h:  30 },
};

export const donkeySheet = new SpriteSheet('/assets/donkey.png', 585, 323, DONKEY_SPRITES);

export const DONKEY_SCALE = 3.0;

export const DONKEY_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2'], fps: 3, loop: false },
  emote: { frames: ['idle-3', 'idle-4', 'idle-5'], fps: 4, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6'], fps: 10, loop: true },
  launch: { frames: ['launch-1', 'launch-2', 'launch-3', 'launch-4', 'launch-5', 'launch-6', 'launch-7', 'launch-8'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3', 'fall-4', 'fall-5', 'fall-6', 'fall-7', 'fall-8'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5', 'landed-6', 'landed-7', 'landed-8', 'landed-9'], fps: 8, loop: false },
};
