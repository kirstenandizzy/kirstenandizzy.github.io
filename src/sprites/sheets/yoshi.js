import SpriteSheet from '../SpriteSheet';

const YOSHI_SPRITES = {
  // Row 1: single static frame
  'idle':            { x: 7,   y: 3,   w: 22, h: 33 },

  // Row 2: standing animation (5 frames)
  'stand-1':         { x: 6,   y: 48,  w: 22, h: 33 },
  'stand-2':         { x: 33,  y: 47,  w: 22, h: 34 },
  'stand-3':         { x: 60,  y: 46,  w: 22, h: 35 },
  'stand-4':         { x: 88,  y: 47,  w: 22, h: 34 },
  'stand-5':         { x: 115, y: 46,  w: 22, h: 35 },

  // Row 3: walking animation (8 frames)
  'walk-1':          { x: 3,   y: 93,  w: 22, h: 32 },
  'walk-2':          { x: 31,  y: 92,  w: 21, h: 33 },
  'walk-3':          { x: 59,  y: 91,  w: 21, h: 34 },
  'walk-4':          { x: 85,  y: 92,  w: 22, h: 33 },
  'walk-5':          { x: 111, y: 93,  w: 24, h: 32 },
  'walk-6':          { x: 145, y: 92,  w: 21, h: 33 },
  'walk-7':          { x: 174, y: 91,  w: 21, h: 34 },
  'walk-8':          { x: 202, y: 92,  w: 21, h: 33 },

  // Row 4: tongue body poses
  'tongue-open-1':   { x: 3,   y: 135, w: 22, h: 33 },
  'tongue-open-2':   { x: 28,  y: 137, w: 24, h: 31 },
  'tongue-out':      { x: 58,  y: 141, w: 31, h: 27 },
  'tongue-retract':  { x: 118, y: 137, w: 26, h: 31 },

  // Row 4: tongue segments (for compositing)
  'tongue-end':      { x: 91,  y: 152, w: 7,  h: 3 },
  'tongue-mid':      { x: 99,  y: 152, w: 7,  h: 3 },
  'tongue-tip':      { x: 108, y: 151, w: 5,  h: 5 },
};

export const yoshiSheet = new SpriteSheet('/assets/yoshi.png', 256, 179, YOSHI_SPRITES);

export const YOSHI_ANIMATIONS = {
  idle: {
    frames: ['idle'],
    fps: 0,
    loop: false,
  },
  stand: {
    frames: ['stand-1', 'stand-2', 'stand-3', 'stand-4', 'stand-5'],
    fps: 6,
    loop: true,
  },
  walk: {
    frames: ['walk-1', 'walk-2', 'walk-3', 'walk-4', 'walk-5', 'walk-6', 'walk-7', 'walk-8'],
    fps: 10,
    loop: true,
  },
  tongue: {
    type: 'composite',
    phases: {
      open:    { frames: ['tongue-open-1', 'tongue-open-2'], fps: 8 },
      extend:  { body: 'tongue-out', segments: ['tongue-end', 'tongue-mid', 'tongue-tip'] },
      retract: { frames: ['tongue-retract', 'idle'], fps: 6 },
    },
  },
};
