export default function PixelSprite({ sheet, name, scale = 3, frame = 0, className, style }) {
  const rect = sheet.getRect(name, frame);
  if (!rect) return null;

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        ...sheet.getBackgroundStyle(name, scale, frame),
        ...style,
      }}
    />
  );
}
