import SpriteSheet from '../SpriteSheet';

const EGG_SPRITES = {
  'egg-small':  { x: 17,  y: 96,  w: 51,  h: 63  },
  'egg-medium': { x: 91,  y: 45,  w: 97,  h: 114 },
  'egg-large':  { x: 206, y: 0,   w: 125, h: 159  },
};

export const eggSheet = new SpriteSheet('/assets/egg.png', 346, 159, EGG_SPRITES);

export const EGG_STAGES = ['egg-small', 'egg-medium', 'egg-large'];
export const EGG_GROW_INTERVAL = 3000; // ms between stage transitions
export const EGG_SCALE = 0.4;          // egg-large at 0.4 ≈ 50x64px, roughly Yoshi-sized
