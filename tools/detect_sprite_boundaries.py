#!/usr/bin/env python3
"""
Detect sprite boundaries by finding transparent columns
"""
from PIL import Image
import sys

def find_transparent_columns(img):
    """Find columns that are completely (or mostly) transparent"""
    width, height = img.size
    pixels = img.load()

    transparent_cols = []

    for x in range(width):
        # Count transparent pixels in this column
        transparent_count = 0
        for y in range(height):
            pixel = pixels[x, y]
            if len(pixel) >= 4 and pixel[3] < 50:  # Alpha < 50 = transparent
                transparent_count += 1

        # If column is mostly transparent (>90%)
        if transparent_count > height * 0.9:
            transparent_cols.append(x)

    return transparent_cols

def group_transparent_regions(transparent_cols, min_gap=5, min_width=15):
    """Group consecutive transparent columns into regions"""
    if not transparent_cols:
        return []

    regions = []
    current_start = transparent_cols[0]

    for i in range(1, len(transparent_cols)):
        # If gap is too large, start new region
        if transparent_cols[i] - transparent_cols[i-1] > min_gap:
            # Only add if region is wide enough
            if transparent_cols[i-1] - current_start >= min_width:
                regions.append((current_start, transparent_cols[i-1]))
            current_start = transparent_cols[i]

    # Don't forget last region
    if transparent_cols[-1] - current_start >= min_width:
        regions.append((current_start, transparent_cols[-1]))

    return regions

def crop_sprites_by_transparency(input_path, output_path):
    """Crop sprites by detecting transparent column boundaries"""
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size

    print(f"Image size: {width}x{height}")

    # Find transparent columns
    transparent_cols = find_transparent_columns(img)
    print(f"Found {len(transparent_cols)} transparent columns")

    # Group into regions (min_width=10 to detect narrower gaps)
    regions = group_transparent_regions(transparent_cols, min_width=10)
    print(f"Found {len(regions)} transparent regions (>=10px)")

    # Use center of transparent regions as split points
    # But skip regions too close to edges (first 5% and last 5%)
    edge_margin = width * 0.05
    split_points = []
    for start, end in regions:
        center = (start + end) // 2
        # Skip if too close to left or right edge
        if center > edge_margin and center < width - edge_margin:
            split_points.append(center)

    print(f"Split points (excluding edges): {split_points}")

    # Extract frames between split points
    frames = []
    prev_split = 0

    for split in split_points:
        if split > prev_split + 10:
            frame = img.crop((prev_split, 0, split, height))
            frames.append(frame)
            print(f"Frame {len(frames)}: x={prev_split} to {split}, width={split-prev_split}")
        prev_split = split

    # Last frame
    if prev_split < width - 10:
        frame = img.crop((prev_split, 0, width, height))
        frames.append(frame)
        print(f"Frame {len(frames)}: x={prev_split} to {width}, width={width-prev_split}")

    print(f"\nTotal frames detected: {len(frames)}")

    # Find max dimensions
    max_width = max(f.width for f in frames) if frames else 0
    max_height = max(f.height for f in frames) if frames else 0

    # Round up to make evenly divisible
    frame_width = ((max_width + 15) // 16) * 16
    total_width = frame_width * len(frames)

    print(f"Output sprite sheet: {total_width}x{max_height} ({len(frames)} frames x {frame_width}px)")

    # Create new sprite sheet
    new_img = Image.new('RGBA', (total_width, max_height), (0, 0, 0, 0))

    # Crop bottom 15px from each frame to remove shadow artifacts
    cropped_frames = []
    for frame in frames:
        if frame.height > 20:  # Only crop if frame is tall enough
            cropped = frame.crop((0, 0, frame.width, frame.height - 15))
            cropped_frames.append(cropped)
        else:
            cropped_frames.append(frame)

    max_height = max(f.height for f in cropped_frames)

    for i, frame in enumerate(cropped_frames):
        x = i * frame_width + (frame_width - frame.width) // 2
        y = max_height - frame.height  # Bottom align
        new_img.paste(frame, (x, y), frame)

    new_img.save(output_path, 'PNG')
    print(f"✅ Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python detect_sprite_boundaries.py <input> <output>")
        sys.exit(1)

    crop_sprites_by_transparency(sys.argv[1], sys.argv[2])
