import PixelSprite from '../PixelSprite';
import useSpriteAnimation from './useSpriteAnimation';

export default function AnimatedSprite({ sheet, animations, animation, scale = 3, className, style, onComplete }) {
  const config = animations[animation];
  if (!config || config.type === 'composite') return null;

  const { currentFrame } = useSpriteAnimation({
    frames: config.frames,
    fps: config.fps,
    loop: config.loop,
    playing: true,
    onComplete,
    holdLastFrame: config.holdLastFrame || 0,
  });

  return (
    <PixelSprite
      sheet={sheet}
      name={currentFrame}
      scale={scale}
      className={className}
      style={style}
    />
  );
}
