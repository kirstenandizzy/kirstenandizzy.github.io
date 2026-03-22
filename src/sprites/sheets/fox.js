import SpriteSheet from '../SpriteSheet';

const FOX_SPRITES = {
  // Row 1: idle (1 frame) + unused poses
  'idle-1'   : { x:  63, y:   0, w:  25, h:  47 },
  // Row 2: walk (8 frames) — frame 2+3 merged (x=47-134, ~44px each)
  'walk-1'   : { x:   2, y:  57, w:  41, h:  43 },
  'walk-2'   : { x:  47, y:  53, w:  44, h:  47 },
  'walk-3'   : { x:  91, y:  53, w:  44, h:  47 },
  'walk-4'   : { x: 139, y:  55, w:  42, h:  45 },
  'walk-5'   : { x: 185, y:  57, w:  39, h:  43 },
  'walk-6'   : { x: 228, y:  58, w:  46, h:  42 },
  'walk-7'   : { x: 278, y:  57, w:  40, h:  43 },
  'walk-8'   : { x: 322, y:  57, w:  43, h:  43 },
  // Row 3: emote1 (9 frames)
  'emote1-1' : { x:   2, y: 118, w:  38, h:  38 },
  'emote1-2' : { x:  44, y: 118, w:  44, h:  38 },
  'emote1-3' : { x:  92, y: 111, w:  37, h:  45 },
  'emote1-4' : { x: 133, y: 106, w:  41, h:  50 },
  'emote1-5' : { x: 178, y: 120, w:  55, h:  36 },
  'emote1-6' : { x: 237, y: 114, w:  51, h:  42 },
  'emote1-7' : { x: 292, y: 115, w:  46, h:  41 },
  'emote1-8' : { x: 342, y: 119, w:  42, h:  37 },
  'emote1-9' : { x: 388, y: 118, w:  32, h:  38 },
  // Row 4: emote2 (8 frames)
  'emote2-1' : { x:   2, y: 165, w:  40, h:  49 },
  'emote2-2' : { x:  46, y: 165, w:  32, h:  49 },
  'emote2-3' : { x:  82, y: 164, w:  28, h:  50 },
  'emote2-4' : { x: 114, y: 163, w:  24, h:  51 },
  'emote2-5' : { x: 142, y: 163, w:  21, h:  51 },
  'emote2-6' : { x: 167, y: 163, w:  21, h:  51 },
  'emote2-7' : { x: 192, y: 163, w:  21, h:  51 },
  'emote2-8' : { x: 217, y: 163, w:  23, h:  51 },
};

export const foxSheet = new SpriteSheet('/assets/fox.png', 422, 216, FOX_SPRITES);

export const FOX_SCALE = 1.5;

export const FOX_ANIMATIONS = {
  idle: { frames: ['idle-1'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7', 'walk-8'], fps: 10, loop: true },
  emote1: { frames: ['emote1-1', 'emote1-2', 'emote1-3', 'emote1-4', 'emote1-5', 'emote1-6', 'emote1-7', 'emote1-8', 'emote1-9'], fps: 10, loop: false },
  emote2: { frames: ['emote2-1', 'emote2-2', 'emote2-3', 'emote2-4', 'emote2-5', 'emote2-6', 'emote2-7', 'emote2-8'], fps: 6, loop: false },
};
