import SpriteSheet from '../SpriteSheet';

const PIPE_SPRITES = {
  'green-pipe': { x: 0,   y: 0,  w: 32, h: 32 },
  'white-pipe': { x: 96,  y: 0,  w: 32, h: 32 },
  'blue-pipe':  { x: 128, y: 0,  w: 32, h: 32 },
  'pink-pipe':  { x: 128, y: 32, w: 32, h: 32 },
};

export const pipeSheet = new SpriteSheet('/assets/pipes.png', 160, 64, PIPE_SPRITES);
export const ALLOWED_PIPE_COLORS = ['green', 'pink', 'blue', 'white'];
