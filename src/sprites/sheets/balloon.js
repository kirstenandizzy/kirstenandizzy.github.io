import SpriteSheet from '../SpriteSheet';

// Sprite sheet: /assets/balloon.png (512 x 258)
// 8 rows total. Left half = red/blue, right half = orange/gray.
// Rows 0-3: red + orange, Rows 4-7: blue + gray
// Row 0/4: idle (8 per color), Rows 1-2/5-6: pop/deflate/confetti

const BALLOON_SPRITES = {
  // ── RED idle (row 0, left) — 8 frames ──
  'red-idle-1': { x:   8, y:  1, w: 16, h: 30 },
  'red-idle-2': { x:  39, y:  1, w: 16, h: 30 },
  'red-idle-3': { x:  71, y:  2, w: 16, h: 28 },
  'red-idle-4': { x: 103, y:  3, w: 16, h: 27 },
  'red-idle-5': { x: 136, y:  2, w: 16, h: 29 },
  'red-idle-6': { x: 169, y:  3, w: 16, h: 28 },
  'red-idle-7': { x: 201, y:  2, w: 16, h: 28 },
  'red-idle-8': { x: 232, y:  2, w: 16, h: 28 },
  // ── RED pop (rows 1-2, left) ──
  'red-pop-1': { x:   1, y: 40, w: 34, h: 20 },
  'red-pop-2': { x:  41, y: 40, w: 21, h: 20 },
  'red-pop-3': { x: 100, y: 33, w: 16, h: 29 },
  'red-pop-4': { x: 144, y: 34, w: 16, h: 20 },
  'red-pop-5': { x: 189, y: 33, w: 16, h: 29 },
  'red-pop-6': { x: 221, y: 40, w: 34, h: 20 },
  'red-pop-7': { x:   7, y: 66, w: 19, h: 21 },
  'red-pop-8': { x:  38, y: 65, w: 20, h: 22 },
  'red-pop-9': { x:  69, y: 65, w: 22, h: 23 },

  // ── ORANGE idle (row 0, right) — 8 frames ──
  'orange-idle-1': { x: 264, y:  1, w: 16, h: 30 },
  'orange-idle-2': { x: 295, y:  1, w: 16, h: 30 },
  'orange-idle-3': { x: 327, y:  2, w: 16, h: 28 },
  'orange-idle-4': { x: 359, y:  3, w: 16, h: 27 },
  'orange-idle-5': { x: 392, y:  2, w: 16, h: 29 },
  'orange-idle-6': { x: 425, y:  3, w: 16, h: 28 },
  'orange-idle-7': { x: 457, y:  2, w: 16, h: 28 },
  'orange-idle-8': { x: 488, y:  2, w: 16, h: 28 },
  // ── ORANGE pop (rows 1-2, right) ──
  'orange-pop-1': { x: 257, y: 40, w: 34, h: 20 },
  'orange-pop-2': { x: 297, y: 40, w: 21, h: 20 },
  'orange-pop-3': { x: 356, y: 33, w: 16, h: 29 },
  'orange-pop-4': { x: 400, y: 34, w: 16, h: 20 },
  'orange-pop-5': { x: 445, y: 33, w: 16, h: 29 },
  'orange-pop-6': { x: 477, y: 40, w: 34, h: 20 },
  'orange-pop-7': { x: 263, y: 66, w: 19, h: 21 },
  'orange-pop-8': { x: 294, y: 65, w: 20, h: 22 },
  'orange-pop-9': { x: 325, y: 65, w: 22, h: 23 },

  // ── BLUE idle (row 4, left) — 8 frames ──
  'blue-idle-1': { x:   8, y: 129, w: 16, h: 30 },
  'blue-idle-2': { x:  39, y: 129, w: 16, h: 30 },
  'blue-idle-3': { x:  71, y: 130, w: 16, h: 28 },
  'blue-idle-4': { x: 103, y: 131, w: 16, h: 27 },
  'blue-idle-5': { x: 136, y: 130, w: 16, h: 29 },
  'blue-idle-6': { x: 169, y: 131, w: 16, h: 28 },
  'blue-idle-7': { x: 201, y: 130, w: 16, h: 28 },
  'blue-idle-8': { x: 232, y: 130, w: 16, h: 28 },
  // ── BLUE pop (rows 5-6, left) ──
  'blue-pop-1': { x:   1, y: 168, w: 34, h: 20 },
  'blue-pop-2': { x:  41, y: 168, w: 21, h: 20 },
  'blue-pop-3': { x: 100, y: 161, w: 16, h: 29 },
  'blue-pop-4': { x: 144, y: 162, w: 16, h: 20 },
  'blue-pop-5': { x: 189, y: 161, w: 16, h: 29 },
  'blue-pop-6': { x: 221, y: 168, w: 34, h: 20 },
  'blue-pop-7': { x:   7, y: 194, w: 19, h: 21 },
  'blue-pop-8': { x:  38, y: 193, w: 20, h: 22 },
  'blue-pop-9': { x:  69, y: 193, w: 22, h: 23 },

  // ── GRAY idle (row 4, right) — 8 frames ──
  'gray-idle-1': { x: 264, y: 129, w: 16, h: 30 },
  'gray-idle-2': { x: 295, y: 129, w: 16, h: 30 },
  'gray-idle-3': { x: 327, y: 130, w: 16, h: 28 },
  'gray-idle-4': { x: 359, y: 131, w: 16, h: 27 },
  'gray-idle-5': { x: 392, y: 130, w: 16, h: 29 },
  'gray-idle-6': { x: 425, y: 131, w: 16, h: 28 },
  'gray-idle-7': { x: 457, y: 130, w: 16, h: 28 },
  'gray-idle-8': { x: 488, y: 130, w: 16, h: 28 },
  // ── GRAY pop (rows 5-6, right) ──
  'gray-pop-1': { x: 257, y: 168, w: 34, h: 20 },
  'gray-pop-2': { x: 297, y: 168, w: 21, h: 20 },
  'gray-pop-3': { x: 356, y: 161, w: 16, h: 29 },
  'gray-pop-4': { x: 400, y: 162, w: 16, h: 20 },
  'gray-pop-5': { x: 445, y: 161, w: 16, h: 29 },
  'gray-pop-6': { x: 477, y: 168, w: 34, h: 20 },
  'gray-pop-7': { x: 263, y: 194, w: 19, h: 21 },
  'gray-pop-8': { x: 294, y: 193, w: 20, h: 22 },
  'gray-pop-9': { x: 325, y: 193, w: 22, h: 23 },
};

export const balloonSheet = new SpriteSheet('/assets/balloon.png', 512, 258, BALLOON_SPRITES);

export const BALLOON_SCALE = 2.5;

export const BALLOON_COLORS = ['red', 'orange', 'blue', 'gray'];

export const BALLOON_ANIMATIONS = {
  'red-idle': {
    frames: ['red-idle-1', 'red-idle-2', 'red-idle-3', 'red-idle-4', 'red-idle-5', 'red-idle-6', 'red-idle-7', 'red-idle-8'],
    fps: 6, loop: true,
  },
  'red-pop': {
    frames: ['red-pop-7', 'red-pop-8', 'red-pop-9'],
    fps: 12, loop: false,
  },
  'orange-idle': {
    frames: ['orange-idle-1', 'orange-idle-2', 'orange-idle-3', 'orange-idle-4', 'orange-idle-5', 'orange-idle-6', 'orange-idle-7', 'orange-idle-8'],
    fps: 6, loop: true,
  },
  'orange-pop': {
    frames: ['orange-pop-7', 'orange-pop-8', 'orange-pop-9'],
    fps: 12, loop: false,
  },
  'blue-idle': {
    frames: ['blue-idle-1', 'blue-idle-2', 'blue-idle-3', 'blue-idle-4', 'blue-idle-5', 'blue-idle-6', 'blue-idle-7', 'blue-idle-8'],
    fps: 6, loop: true,
  },
  'blue-pop': {
    frames: ['blue-pop-7', 'blue-pop-8', 'blue-pop-9'],
    fps: 12, loop: false,
  },
  'gray-idle': {
    frames: ['gray-idle-1', 'gray-idle-2', 'gray-idle-3', 'gray-idle-4', 'gray-idle-5', 'gray-idle-6', 'gray-idle-7', 'gray-idle-8'],
    fps: 6, loop: true,
  },
  'gray-pop': {
    frames: ['gray-pop-7', 'gray-pop-8', 'gray-pop-9'],
    fps: 12, loop: false,
  },
};
