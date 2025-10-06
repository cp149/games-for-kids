#!/usr/bin/env python3
"""
Remove blue background and make it transparent
"""
from PIL import Image
import sys

def remove_blue_background(input_path, output_path=None):
    """Remove blue pixels, keep only content"""
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    modified_count = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # Check if pixel is blue - blue is dominant
            is_blue = (
                b > r + 40 and  # Blue higher than red
                b > g + 40 and  # Blue higher than green
                b > 100         # Blue brightness threshold
            )

            if is_blue:
                pixels[x, y] = (r, g, b, 0)  # Make transparent
                modified_count += 1

    if output_path is None:
        output_path = input_path

    img.save(output_path, 'PNG')
    print(f"✅ Removed blue background: {modified_count} pixels made transparent")
    print(f"   Saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_bluescreen.py <input_image> [output_image]")
        sys.exit(1)

    output = sys.argv[2] if len(sys.argv) > 2 else None
    remove_blue_background(sys.argv[1], output)
