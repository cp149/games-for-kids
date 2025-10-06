#!/usr/bin/env python3
"""
Auto-crop transparent edges from images
"""
from PIL import Image
import sys

def auto_crop(input_path, output_path=None, alpha_threshold=50):
    """Remove transparent edges from image"""
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    # Find bounding box of non-transparent pixels
    min_x, min_y = width, height
    max_x, max_y = 0, 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > alpha_threshold:  # Not transparent
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x >= min_x and max_y >= min_y:
        cropped = img.crop((min_x, min_y, max_x + 1, max_y + 1))

        if output_path is None:
            output_path = input_path

        cropped.save(output_path, 'PNG')
        print(f"✅ Cropped from {img.size} to {cropped.size}")
        print(f"   Saved to {output_path}")
    else:
        print("⚠️  No non-transparent pixels found")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python auto_crop.py <input_image> [output_image]")
        sys.exit(1)

    output = sys.argv[2] if len(sys.argv) > 2 else None
    auto_crop(sys.argv[1], output)
