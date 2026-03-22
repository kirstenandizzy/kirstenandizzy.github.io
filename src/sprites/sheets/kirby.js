import SpriteSheet from '../SpriteSheet';

const KIRBY_SPRITES = {
  // Row 1: idle (1 frame)
  'idle-1'    : { x:   1, y:   6, w:  27, h:  22 },
  // Row 2: walk (12 frames)
  'walk-1'    : { x:   1, y:  39, w:  27, h:  22 },
  'walk-2'    : { x:  35, y:  39, w:  25, h:  22 },
  'walk-3'    : { x:  67, y:  38, w:  22, h:  23 },
  'walk-4'    : { x:  96, y:  38, w:  21, h:  23 },
  'walk-5'    : { x: 124, y:  38, w:  21, h:  23 },
  'walk-6'    : { x: 152, y:  39, w:  21, h:  22 },
  'walk-7'    : { x: 180, y:  39, w:  24, h:  22 },
  'walk-8'    : { x: 211, y:  39, w:  21, h:  22 },
  'walk-9'    : { x: 239, y:  38, w:  21, h:  23 },
  'walk-10'   : { x: 267, y:  38, w:  21, h:  23 },
  'walk-11'   : { x: 295, y:  38, w:  22, h:  23 },
  'walk-12'   : { x: 324, y:  39, w:  25, h:  22 },
  // Row 3: emote1 (8 frames)
  'emote1-1'  : { x:   4, y:  72, w:  25, h:  26 },
  'emote1-2'  : { x:  36, y:  69, w:  32, h:  32 },
  'emote1-3'  : { x:  75, y:  71, w:  26, h:  25 },
  'emote1-4'  : { x: 108, y:  66, w:  32, h:  32 },
  'emote1-5'  : { x: 147, y:  69, w:  25, h:  26 },
  'emote1-6'  : { x: 179, y:  66, w:  32, h:  32 },
  'emote1-7'  : { x: 218, y:  71, w:  26, h:  25 },
  'emote1-8'  : { x: 251, y:  69, w:  32, h:  32 },
  // Row 4: emote2 (4 frames)
  'emote2-1'  : { x:   4, y: 111, w:  21, h:  28 },
  'emote2-2'  : { x:  32, y: 112, w:  21, h:  27 },
  'emote2-3'  : { x:  60, y: 113, w:  21, h:  26 },
  'emote2-4'  : { x:  88, y: 114, w:  23, h:  25 },
};

export const kirbySheet = new SpriteSheet('/assets/kirby.png', 355, 144, KIRBY_SPRITES);

export const KIRBY_SCALE = 1.5;

export const KIRBY_ANIMATIONS = {
  idle: { frames: ['idle-1'], fps: 6, loop: true },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7', 'walk-8', 'walk-9', 'walk-10', 'walk-11', 'walk-12'], fps: 10, loop: true },
  emote1: { frames: ['emote1-1', 'emote1-2', 'emote1-3', 'emote1-4', 'emote1-5', 'emote1-6', 'emote1-7', 'emote1-8'], fps: 6, loop: false },
  emote2: { frames: ['emote2-1', 'emote2-2', 'emote2-3', 'emote2-4'], fps: 6, loop: false },
};
