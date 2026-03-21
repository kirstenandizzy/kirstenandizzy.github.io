# Plan: Mobile Viewport Lock + Scrolling-Labels Slider

## Problem
- `.slider__content` has `height: 80vh` but the nav header adds more height, pushing total past 100vh → scrollbar
- `.app` uses `min-height: 100vh` which allows growth beyond the viewport

## Step 1: Viewport Containment (CSS-only)

| File | Change |
|------|--------|
| `index.html` | Add `viewport-fit=cover` to viewport meta |
| `src/styles/global.scss` | Mobile: `100dvh` on html/body, `overscroll-behavior: none` |
| `src/styles/App.scss` | Mobile: `.app { height: 100dvh; overflow: hidden; }` instead of `min-height: 100vh` |
| `src/styles/Slider.scss` | Mobile: `.slider__content` → `flex: 1; min-height: 0` instead of `height: 80vh` |

## Step 2: Redesign Mobile Slider as "Scrolling Window"

**New interaction model** — like an iOS date picker drum:
- Fixed ~150px tall window with `overflow: hidden` and mask-image fade on top/bottom edges
- A center indicator line marks the selected position
- A strip of all hour labels in a flex column, translated via `transform: translateY(...)` as you drag
- The existing touch+momentum drag logic stays — just drives `translateY` instead of a range thumb
- Remove the native `<input type="range">` on mobile entirely

**DOM structure:**
```
.slider__window          ← fixed 150px, overflow hidden, mask fade
  .slider__indicator     ← fixed center line (position: absolute, top: 50%)
  .slider__strip         ← translateY based on value
    .slider__strip-item  ← one per hour, fixed height
```

**Translation math:**
```js
const offset = -(value / max) * totalStripHeight + windowHeight / 2;
```

Labels near center get full opacity/scale; labels farther away fade and shrink for a wheel effect.

## Step 3: Mobile Events Layout
- Move from absolutely-positioned event markers to a simple vertical list adjacent to the slider window
- Each event remains clickable to jump to that time

## Step 4: Polish
- `will-change: transform` on strip for GPU compositing
- `touch-action: none` + `overscroll-behavior: none` to kill iOS rubber-banding
- Tune `PIXELS_PER_HOUR` / `FRICTION` for the new shorter travel distance
- Test `dvh` behavior with Safari address bar

## Gotchas
- **dvh fallback**: use `height: 100vh; height: 100dvh;` for older browsers
- **iOS rubber-band**: need both `overflow: hidden` and `overscroll-behavior: none`
- **Landscape**: 150px window + header could be tight — may need to reduce window height
- Desktop slider remains completely unchanged (already branched via `isMobile`)
