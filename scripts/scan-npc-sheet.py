#!/usr/bin/env python3
"""
Scan a normalized NPC sprite sheet and output sprite definitions.

All NPC sheets follow the same convention:
  - 5 rows: idle, walk, launch, fall, landed
  - 4px column gaps between frames
  - 6px row gaps between rows
  - Sprites bottom-aligned within each row

Usage:
  python3 scripts/scan-npc-sheet.py public/assets/peach.png peach
  python3 scripts/scan-npc-sheet.py public/assets/toad.png toad

Output: prints a JS sprite definition file to stdout.
"""

import sys
from PIL import Image

ROW_NAMES = ['idle', 'walk', 'launch', 'fall', 'landed']
EXPECTED_ROWS = 5


def find_content_rows(pixels, W, H):
    """Find groups of content rows separated by fully empty rows."""
    rows = []
    in_content = False
    start = 0
    for y in range(H):
        has = any(pixels[x, y][3] > 0 for x in range(W))
        if has and not in_content:
            start = y
            in_content = True
        elif not has and in_content:
            rows.append((start, y - 1))
            in_content = False
    if in_content:
        rows.append((start, H - 1))
    return rows


def try_split_row(pixels, W, y1, y2):
    """Try to split a merged row by finding the point of minimum pixel density."""
    # Calculate density for each row
    densities = []
    for y in range(y1, y2 + 1):
        count = sum(1 for x in range(W) if pixels[x, y][3] > 0)
        densities.append(count)

    # Find the minimum density point (skip edges — need at least 10 rows on each side)
    margin = 10
    if len(densities) < margin * 2 + 1:
        return None

    search = densities[margin:-margin]
    min_val = min(search)
    if min_val > 15:  # too many pixels to be a gap
        return None

    min_idx = margin + search.index(min_val)
    split_y = y1 + min_idx
    return (y1, split_y), (split_y + 1, y2)


def find_frames_in_row(pixels, W, y1, y2):
    """Find individual sprite frames in a row by transparent column gaps."""
    sprites = []
    in_sprite = False
    sx = 0
    for x in range(W):
        has = any(pixels[x, y][3] > 0 for y in range(y1, y2 + 1))
        if has and not in_sprite:
            sx = x
            in_sprite = True
        elif not has and in_sprite:
            sprites.append((sx, x - 1))
            in_sprite = False
    if in_sprite:
        sprites.append((sx, W - 1))

    # Get tight bounds for each frame
    frames = []
    for x1, x2 in sprites:
        top = None
        bottom = None
        for y in range(y1, y2 + 1):
            if any(pixels[xx, y][3] > 0 for xx in range(x1, x2 + 1)):
                if top is None:
                    top = y
                bottom = y
        w = x2 - x1 + 1
        h = (bottom - top + 1) if top is not None else 0
        fy = top if top is not None else y1
        # Filter out tiny artifacts (stray pixels that bridge row gaps)
        if w * h < 20:
            continue
        frames.append({'x': x1, 'y': fy, 'w': w, 'h': h})
    return frames


def main():
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <sprite-sheet.png> <character-name>")
        sys.exit(1)

    path = sys.argv[1]
    name = sys.argv[2]
    upper_name = name.upper()

    img = Image.open(path).convert('RGBA')
    pixels = img.load()
    W, H = img.size

    # Find rows
    content_rows = find_content_rows(pixels, W, H)

    # If we got fewer rows than expected, try splitting the tallest row
    while len(content_rows) < EXPECTED_ROWS:
        # Find the tallest row — most likely to be merged
        heights = [(y2 - y1 + 1, i) for i, (y1, y2) in enumerate(content_rows)]
        heights.sort(reverse=True)

        split_done = False
        for _, idx in heights:
            y1, y2 = content_rows[idx]
            result = try_split_row(pixels, W, y1, y2)
            if result:
                content_rows = content_rows[:idx] + list(result) + content_rows[idx + 1:]
                split_done = True
                break

        if not split_done:
            break

    if len(content_rows) != EXPECTED_ROWS:
        print(f"WARNING: Expected {EXPECTED_ROWS} rows, found {len(content_rows)}", file=sys.stderr)
        print(f"Row boundaries: {content_rows}", file=sys.stderr)

    # Scan each row
    all_rows = {}
    for i, (y1, y2) in enumerate(content_rows):
        row_name = ROW_NAMES[i] if i < len(ROW_NAMES) else f'row{i+1}'
        frames = find_frames_in_row(pixels, W, y1, y2)
        all_rows[row_name] = frames

    # Find max height across idle/walk frames (for scale calculation)
    walk_heights = [f['h'] for f in all_rows.get('idle', []) + all_rows.get('walk', [])]
    ref_height = max(walk_heights) if walk_heights else max(f['h'] for row in all_rows.values() for f in row)

    # Output JS
    print(f"import SpriteSheet from '../SpriteSheet';")
    print()
    print(f"const {upper_name}_SPRITES = {{")
    for row_name, frames in all_rows.items():
        print(f"  // Row: {row_name} ({len(frames)} frame{'s' if len(frames) != 1 else ''})")
        for j, f in enumerate(frames):
            key = f"{row_name}-{j+1}" if len(frames) > 1 else row_name
            pad_key = f"'{key}'".ljust(20)
            print(f"  {pad_key}: {{ x: {f['x']:3d}, y: {f['y']:3d}, w: {f['w']:3d}, h: {f['h']:3d} }},")
    print("};")
    print()
    print(f"export const {name}Sheet = new SpriteSheet('/assets/{name}.png', {W}, {H}, {upper_name}_SPRITES);")
    print()
    print(f"export const {upper_name}_ANIMATIONS = {{")
    for row_name, frames in all_rows.items():
        frame_keys = []
        for j, _ in enumerate(frames):
            key = f"{row_name}-{j+1}" if len(frames) > 1 else row_name
            frame_keys.append(f"'{key}'")
        loop = "true" if row_name in ('idle', 'walk', 'launch') else "false"
        fps = 6 if row_name == 'idle' else 10 if row_name == 'walk' else 8
        frames_str = ", ".join(frame_keys)
        print(f"  {row_name}: {{ frames: [{frames_str}], fps: {fps}, loop: {loop} }},")
    print("};")
    print()
    print(f"// Reference frame height (idle/walk): {ref_height}px")
    print(f"// Yoshi is ~33px at scale 2 = 66px rendered")
    print(f"// For matching height: scale = {66 / ref_height:.2f}")


if __name__ == '__main__':
    main()
