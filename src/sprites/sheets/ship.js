import SpriteSheet from '../SpriteSheet';

// Ship sprite sheet: 8 columns x 4 rows = 32 rotation angles
// Each cell is 65x66 pixels
// Angles go clockwise: angle-0 = facing forward, angle-8 = facing right, etc.

const COL_W = 65;
const ROW_H = 65;
const COLS = 8;
const ROWS = 4;

const SHIP_SPRITES = {};
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const index = row * COLS + col;
    SHIP_SPRITES[`angle-${index}`] = {
      x: col * COL_W,
      y: row * ROW_H,
      w: COL_W,
      h: ROW_H,
    };
  }
}

export const shipSheet = new SpriteSheet('/assets/ship.png', 520, 261, SHIP_SPRITES);

export const SHIP_SCALE = 3;

export const TOTAL_ANGLES = ROWS * COLS; // 32
