import SpriteSheet from '../SpriteSheet';

const BOO_SPRITES = {
  // Row: idle (3 frames)
  'idle-1'            : { x:   2, y:   3, w:  26, h:  28 },
  'idle-2'            : { x:  32, y:   2, w:  26, h:  29 },
  'idle-3'            : { x:  62, y:   3, w:  27, h:  28 },
  // Row: walk (4 frames)
  'walk-1'            : { x:   2, y:  39, w:  27, h:  28 },
  'walk-2'            : { x:  33, y:  39, w:  27, h:  28 },
  'walk-3'            : { x:  64, y:  37, w:  27, h:  30 },
  'walk-4'            : { x:  95, y:  40, w:  27, h:  27 },
  // Row: launch (6 frames)
  'launch-1'          : { x:   2, y:  73, w:  26, h:  28 },
  'launch-2'          : { x:  32, y:  73, w:  27, h:  28 },
  'launch-3'          : { x:  63, y:  73, w:  26, h:  28 },
  'launch-4'          : { x:  93, y:  73, w:  26, h:  28 },
  'launch-5'          : { x: 123, y:  73, w:  26, h:  28 },
  'launch-6'          : { x: 153, y:  73, w:  26, h:  28 },
  // Row: fall (3 frames)
  'fall-1'            : { x:   2, y: 109, w:  28, h:  28 },
  'fall-2'            : { x:  34, y: 108, w:  28, h:  29 },
  'fall-3'            : { x:  66, y: 107, w:  28, h:  30 },
  // Row: landed (3 frames)
  'landed-1'          : { x:   2, y: 144, w:  26, h:  28 },
  'landed-2'          : { x:  32, y: 144, w:  27, h:  28 },
  'landed-3'          : { x:  63, y: 143, w:  27, h:  29 },
  // Row: emote (1 frame)
  'emote-1'           : { x:   2, y: 178, w:  26, h:  28 },
};

export const booSheet = new SpriteSheet('/assets/boo.png', 181, 208, BOO_SPRITES);

export const BOO_SCALE = 3.2; // matches Yoshi's rendered height

export const BOO_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2', 'idle-3'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4'], fps: 10, loop: true },
  launch: { frames: ['launch-1', 'launch-2', 'launch-3', 'launch-4', 'launch-5', 'launch-6'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3'], fps: 8, loop: false },
  emote: { frames: ['emote-1'], fps: 1, loop: false },
};
