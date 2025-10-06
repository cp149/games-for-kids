#!/usr/bin/env python3
"""
Flip each frame in a sprite sheet individually
"""
from PIL import Image
import sys

def flip_sprite_frames(input_path, output_path, num_frames):
    """
    Split sprite sheet, flip each frame, reassemble
    """
    img = Image.open(input_path)
    width, height = img.size

    frame_width = width // num_frames

    print(f"Original size: {width}x{height}")
    print(f"Frame width: {frame_width}")

    # Create new image with fully transparent background
    new_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))

    # Process each frame
    for i in range(num_frames):
        x = i * frame_width

        # Extract frame
        frame = img.crop((x, 0, x + frame_width, height))

        # Flip horizontally
        flipped = frame.transpose(Image.FLIP_LEFT_RIGHT)

        # Paste with alpha channel to ensure transparency
        new_img.paste(flipped, (x, 0), flipped)

        print(f"Frame {i}: flipped")

    new_img.save(output_path, 'PNG')
    print(f"✅ Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python flip_sprite_frames.py <input> <output> <num_frames>")
        sys.exit(1)

    flip_sprite_frames(sys.argv[1], sys.argv[2], int(sys.argv[3]))
