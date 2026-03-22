import SpriteSheet from '../SpriteSheet';

const WALUIGI_SPRITES = {
  // Row: idle (2 frames)
  'idle-1'            : { x:   2, y:   3, w:  25, h:  40 },
  'idle-2'            : { x:  31, y:   2, w:  28, h:  41 },
  // Row: walk (8 frames)
  'walk-1'            : { x:   2, y:  51, w:  34, h:  39 },
  'walk-2'            : { x:  40, y:  50, w:  33, h:  40 },
  'walk-3'            : { x:  77, y:  49, w:  22, h:  41 },
  'walk-4'            : { x: 103, y:  50, w:  25, h:  40 },
  'walk-5'            : { x: 132, y:  51, w:  34, h:  39 },
  'walk-6'            : { x: 170, y:  50, w:  33, h:  40 },
  'walk-7'            : { x: 207, y:  49, w:  22, h:  41 },
  'walk-8'            : { x: 233, y:  50, w:  25, h:  40 },
  // Row: launch (2 frames)
  'launch-1'          : { x:   2, y:  96, w:  31, h:  41 },
  'launch-2'          : { x:  37, y:  98, w:  45, h:  39 },
  // Row: fall (1 frame)
  'fall'              : { x:   2, y: 143, w:  46, h:  35 },
  // Row: landed (4 frames)
  'landed-1'          : { x:   2, y: 187, w:  35, h:  31 },
  'landed-2'          : { x:  41, y: 184, w:  40, h:  34 },
  'landed-3'          : { x:  85, y: 184, w:  36, h:  34 },
  'landed-4'          : { x: 125, y: 184, w:  49, h:  34 },
  // Row: emote (3 frames)
  'emote-1'           : { x:   2, y: 225, w:  33, h:  41 },
  'emote-2'           : { x:  39, y: 224, w:  35, h:  42 },
  'emote-3'           : { x:  78, y: 226, w:  38, h:  40 },
  // Row 7: minion walk (2 frames)
  'minion-walk-1'     : { x:   2, y: 272, w:  18, h:  22 },
  'minion-walk-2'     : { x:  23, y: 272, w:  17, h:  22 },
};

export const waluigiSheet = new SpriteSheet('/assets/waluigi.png', 260, 296, WALUIGI_SPRITES);

export const WALUIGI_SCALE = 1.9; // matches Yoshi's rendered height

export const WALUIGI_ANIMATIONS = {
  idle: { frames: ['idle-1', 'idle-2'], fps: 6, loop: false },
  walk: { frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7', 'walk-8'], fps: 18, loop: true },
  launch: { frames: ['launch-1', 'launch-2'], fps: 8, loop: true },
  fall: { frames: ['fall'], fps: 8, loop: false },
  landed: { frames: ['landed-1', 'landed-2', 'landed-3', 'landed-4'], fps: 8, loop: false, holdLastFrame: 4 },
  emote: { frames: ['emote-1', 'emote-2', 'emote-3'], fps: 1, loop: false },
  minionWalk: { frames: ['minion-walk-1', 'minion-walk-2'], fps: 8, loop: true },
};
