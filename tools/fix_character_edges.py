#!/usr/bin/env python3
"""
Fix character edges by detecting character bounds within each frame
"""
from PIL import Image
import sys

def find_character_right_edge(img, frame_start, frame_end):
    """Find the rightmost non-transparent pixel in a frame"""
    width, height = img.size
    pixels = img.load()

    rightmost = frame_start

    for x in range(frame_start, min(frame_end, width)):
        for y in range(height):
            pixel = pixels[x, y]
            if len(pixel) >= 4 and pixel[3] > 50:  # Not transparent
                rightmost = max(rightmost, x)

    return rightmost

def fix_character_edges(input_path, output_path, num_frames, frames_to_fix, edge_width=9):
    """
    Clear pixels from the rightmost character edge in specific frames
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    frame_width = width // num_frames

    print(f"Image size: {width}x{height}")
    print(f"Frame width: {frame_width}")
    print(f"Fixing frames: {frames_to_fix}")

    pixels = img.load()

    for frame_idx in frames_to_fix:
        frame_start = frame_idx * frame_width
        frame_end = (frame_idx + 1) * frame_width

        # Find rightmost character pixel in this frame
        right_edge = find_character_right_edge(img, frame_start, frame_end)

        # Clear edge_width pixels from character's right edge
        clear_start = max(frame_start, right_edge - edge_width + 1)
        clear_end = min(frame_end, right_edge + 1)

        for x in range(clear_start, clear_end):
            for y in range(height):
                r, g, b, a = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)

        print(f"Frame {frame_idx}: character right edge at x={right_edge}, cleared x={clear_start} to {clear_end}")

    img.save(output_path, 'PNG')
    print(f"✅ Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python fix_character_edges.py <input> <output> <frame_indices> [edge_width]")
        sys.exit(1)

    frame_indices = [int(x) for x in sys.argv[3].split(',')]
    edge_width = int(sys.argv[4]) if len(sys.argv) > 4 else 9
    fix_character_edges(sys.argv[1], sys.argv[2], 8, frame_indices, edge_width)
