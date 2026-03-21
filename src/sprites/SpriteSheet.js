export default class SpriteSheet {
  /**
   * @param {string} src - path to the spritesheet image
   * @param {number} sheetWidth - natural pixel width of the source image
   * @param {number} sheetHeight - natural pixel height of the source image
   * @param {Object} definitions - { name: { x, y, w, h, frames? } } in source pixels
   */
  constructor(src, sheetWidth, sheetHeight, definitions) {
    this.src = src;
    this.sheetWidth = sheetWidth;
    this.sheetHeight = sheetHeight;
    this.definitions = definitions;
  }

  getRect(name, frame = 0) {
    const def = this.definitions[name];
    if (!def) return null;
    const frameOffset = def.frames ? frame * def.w : 0;
    return { x: def.x + frameOffset, y: def.y, w: def.w, h: def.h };
  }

  getBackgroundStyle(name, scale = 1, frame = 0) {
    const rect = this.getRect(name, frame);
    if (!rect) return {};
    return {
      backgroundImage: `url('${this.src}')`,
      backgroundPosition: `-${rect.x * scale}px -${rect.y * scale}px`,
      backgroundSize: `${this.sheetWidth * scale}px ${this.sheetHeight * scale}px`,
      backgroundRepeat: 'no-repeat',
      width: rect.w * scale,
      height: rect.h * scale,
      imageRendering: 'pixelated',
    };
  }
}
