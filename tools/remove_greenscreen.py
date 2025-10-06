#!/usr/bin/env python3
"""
Remove green screen background (chroma key)
"""
from PIL import Image
import sys
import math

def color_distance(c1, c2):
    """Calculate color distance between two RGB tuples"""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

def remove_greenscreen(input_path, output_path=None, green_color=(0, 255, 0), tolerance=100):
    """
    Remove green screen background using chroma key

    Args:
        input_path: Path to input image
        output_path: Path to save output (default: overwrite input)
        green_color: RGB tuple of green to remove (default: bright green)
        tolerance: Color distance tolerance (default: 100)
    """
    if output_path is None:
        output_path = input_path

    # Open image
    img = Image.open(input_path)
    img = img.convert("RGBA")

    # Get pixel data
    datas = img.getdata()

    newData = []
    for item in datas:
        r, g, b, a = item

        # Green screen detection: green channel is dominant
        # More sensitive to catch edge pixels
        is_green = (
            g > r + 20 and  # Green higher than red (reduced threshold)
            g > b + 20 and  # Green higher than blue (reduced threshold)
            g > 130         # Green is bright enough (lower threshold)
        )

        if is_green:
            newData.append((0, 0, 0, 0))  # Fully transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"✅ Removed green screen from {input_path} -> saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_greenscreen.py <image_path> [tolerance]")
        print("  tolerance: Color distance from green (default: 100)")
        sys.exit(1)

    tolerance = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    remove_greenscreen(sys.argv[1], tolerance=tolerance)
