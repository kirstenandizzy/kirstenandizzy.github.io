import SpriteSheet from '../SpriteSheet';

const LUIGI_SPRITES = {
  // Row: idle (2 frames)
  'idle-1'            : { x:   2, y:   2, w:  15, h:  29 },
  'idle-2'            : { x:  21, y:   2, w:  14, h:  29 },
  // Row: walk (2 frames)
  'walk-1'            : { x:   2, y:  38, w:  16, h:  29 },
  'walk-2'            : { x:  22, y:  37, w:  16, h:  30 },
  // Row: launch (1 frame)
  'launch'            : { x:   2, y:  73, w:  16, h:  29 },
  // Row: fall (7 frames)
  'fall-1'            : { x:   2, y: 108, w:  16, h:  40 },
  'fall-2'            : { x:  22, y: 116, w:  24, h:  32 },
  'fall-3'            : { x:  50, y: 117, w:  24, h:  31 },
  'fall-4'            : { x:  78, y: 122, w:  27, h:  26 },
  'fall-5'            : { x: 109, y: 120, w:  29, h:  28 },
  'fall-6'            : { x: 142, y: 121, w:  28, h:  27 },
  'fall-7'            : { x: 174, y: 121, w:  19, h:  27 },
  // Row: landed (6 frames)
  'landed-1'          : { x:   2, y: 158, w:  16, h:  26 },
  'landed-2'          : { x:  22, y: 157, w:  15, h:  27 },
  'landed-3'          : { x:  41, y: 154, w:  18, h:  30 },
  'landed-4'          : { x:  63, y: 154, w:  16, h:  30 },
  'landed-5'          : { x:  83, y: 154, w:  21, h:  30 },
  'landed-6'          : { x: 108, y: 154, w:  16, h:  30 },
  // Row: emote (6 frames)
  'emote-1'           : { x:   2, y: 191, w:  16, h:  30 },
  'emote-2'           : { x:  22, y: 192, w:  32, h:  29 },
  'emote-3'           : { x:  58, y: 190, w:  18, h:  31 },
  'emote-4'           : { x:  80, y: 191, w:  18, h:  30 },
  'emote-5'           : { x: 102, y: 192, w:  20, h:  29 },
  'emote-6'           : { x: 126, y: 192, w:  18, h:  29 },
};

export const luigiSheet = new SpriteSheet('/assets/luigi.png', 195, 223, LUIGI_SPRITES);

export const LUIGI_SCALE = 2.5; // matches Yoshi's rendered height

export const LUIGI_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2'], fps: 6, loop: true },
  launch: { frames: ['launch'], fps: 8, loop: true },
  fall: { frames: ['fall-1', 'fall-2', 'fall-3', 'fall-4', 'fall-5', 'fall-6', 'fall-7'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4', 'landed-5', 'landed-6'], fps: 8, loop: false },
  emote: { frames: ['emote-1', 'emote-2', 'emote-3', 'emote-4', 'emote-5', 'emote-6'], fps: 1, loop: false },
};
