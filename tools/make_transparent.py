#!/usr/bin/env python3
"""
Convert white background to transparent
"""
from PIL import Image
import sys

def make_transparent(input_path, output_path=None, threshold=240):
    """
    Convert white/light backgrounds to transparent

    Args:
        input_path: Path to input image
        output_path: Path to save output (default: overwrite input)
        threshold: RGB values above this become transparent (default: 240)
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
        # Change all white (also shades of whites)
        # to transparent
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            newData.append((255, 255, 255, 0))  # Transparent
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"✅ Converted {input_path} -> transparent background saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_transparent.py <image_path> [threshold]")
        sys.exit(1)

    threshold = int(sys.argv[2]) if len(sys.argv) > 2 else 240
    make_transparent(sys.argv[1], threshold=threshold)
