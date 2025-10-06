#!/usr/bin/env python3
"""
Fix specific frame edges by making rightmost pixels transparent
"""
from PIL import Image
import sys

def fix_frame_edges(input_path, output_path, num_frames, frames_to_fix, edge_width=3):
    """
    Make the rightmost pixels of specific frames transparent

    Args:
        input_path: Path to sprite sheet
        output_path: Path to save fixed sprite sheet
        num_frames: Total number of frames
        frames_to_fix: List of frame indices to fix (0-based)
        edge_width: Number of pixels from right edge to make transparent
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size
    frame_width = width // num_frames

    print(f"Image size: {width}x{height}")
    print(f"Frame width: {frame_width}")
    print(f"Fixing frames: {frames_to_fix}")
    print(f"Edge width: {edge_width}px")

    pixels = img.load()

    for frame_idx in frames_to_fix:
        # Calculate frame boundaries
        frame_start = frame_idx * frame_width
        frame_end = (frame_idx + 1) * frame_width

        # Make rightmost pixels transparent
        for x in range(frame_end - edge_width, frame_end):
            for y in range(height):
                r, g, b, a = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)  # Set alpha to 0

        print(f"Frame {frame_idx}: cleared right edge from x={frame_end - edge_width} to {frame_end}")

    img.save(output_path, 'PNG')
    print(f"✅ Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python fix_frame_edges.py <input> <output> <frame_indices>")
        print("Example: python fix_frame_edges.py input.png output.png 1,6,7")
        sys.exit(1)

    frame_indices = [int(x) for x in sys.argv[3].split(',')]
    edge_width = int(sys.argv[4]) if len(sys.argv) > 4 else 3
    fix_frame_edges(sys.argv[1], sys.argv[2], 8, frame_indices, edge_width=edge_width)
