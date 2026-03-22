import SpriteSheet from '../SpriteSheet';

// message-horizontal.png — 66×34, 3 columns × 2 rows
const HORIZONTAL_SPRITES = {
  'row1-1': { x:  0, y:  0, w: 18, h: 14 },
  'row1-2': { x: 24, y:  0, w: 18, h: 14 },
  'row1-3': { x: 48, y:  0, w: 18, h: 14 },
  'row2-1': { x:  0, y: 20, w: 18, h: 14 },
  'row2-2': { x: 24, y: 20, w: 18, h: 14 },
  'row2-3': { x: 48, y: 20, w: 18, h: 14 },
};

// message-vertical.png — 64×37, 3 columns × 2 rows
const VERTICAL_SPRITES = {
  'row1-1': { x:  0, y:  0, w: 16, h: 16 },
  'row1-2': { x: 24, y:  0, w: 16, h: 16 },
  'row1-3': { x: 48, y:  0, w: 16, h: 16 },
  'row2-1': { x:  0, y: 21, w: 16, h: 16 },
  'row2-2': { x: 24, y: 21, w: 16, h: 16 },
  'row2-3': { x: 48, y: 21, w: 16, h: 16 },
};

export const messageHorizontalSheet = new SpriteSheet('/assets/message-horizontal.png', 66, 34, HORIZONTAL_SPRITES);
export const messageVerticalSheet = new SpriteSheet('/assets/message-vertical.png', 64, 37, VERTICAL_SPRITES);

export const MESSAGE_ANIMATIONS = {
  row1: { frames: ['row1-1', 'row1-2', 'row1-3'], fps: 6, loop: false },
  row2: { frames: ['row2-1', 'row2-2', 'row2-3'], fps: 6, loop: false },
};

export const MESSAGE_SCALE = 3;
