#!/usr/bin/env python3
"""
Crop sprite sheet by removing top/bottom transparent rows to make cells square
"""

from PIL import Image
import sys

def find_vertical_content_bounds(img):
    """Find top and bottom bounds of content across entire image"""
    pixels = img.load()
    width, height = img.size

    min_y = height
    max_y = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 50:  # Non-transparent pixel
                min_y = min(min_y, y)
                max_y = max(max_y, y)

    if min_y > max_y:
        return None

    return (min_y, max_y + 1)

def crop_sprite_sheet_to_square(input_path, output_path, slice_x=4, slice_y=2, target_cell_size=256):
    """
    Crop sprite sheet by removing top/bottom transparent rows to make each cell square

    Args:
        input_path: Input sprite sheet path
        output_path: Output sprite sheet path
        slice_x: Number of columns
        slice_y: Number of rows
        target_cell_size: Target cell height (width stays same)
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size

    cell_width = width // slice_x
    cell_height = height // slice_y

    print(f"Original image: {width}x{height}")
    print(f"Original cell size: {cell_width}x{cell_height}")
    print(f"Target cell size: {cell_width}x{target_cell_size}")

    # Find vertical content bounds
    bounds = find_vertical_content_bounds(img)
    if not bounds:
        print("❌ No content found")
        return

    content_top, content_bottom = bounds
    content_height = content_bottom - content_top

    print(f"Content vertical bounds: {content_top} to {content_bottom} (height: {content_height})")

    # Calculate how much to crop from top and bottom
    new_height = slice_y * target_cell_size
    crop_total = height - new_height

    # Distribute crop amount, prioritizing top
    crop_from_top = min(content_top, crop_total // 2 + crop_total % 2)
    crop_from_bottom = crop_total - crop_from_top

    print(f"Cropping {crop_from_top}px from top, {crop_from_bottom}px from bottom")

    # Crop image
    new_img = img.crop((0, crop_from_top, width, height - crop_from_bottom))

    new_img.save(output_path, 'PNG')
    print(f"✅ Saved to {output_path}")
    print(f"   New image size: {new_img.size[0]}x{new_img.size[1]}")
    print(f"   New cell size: {new_img.size[0] // slice_x}x{new_img.size[1] // slice_y}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python crop_sprite_sheet.py <input_path> <output_path> [slice_x] [slice_y] [target_size]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    slice_x = int(sys.argv[3]) if len(sys.argv) > 3 else 4
    slice_y = int(sys.argv[4]) if len(sys.argv) > 4 else 2
    target_size = int(sys.argv[5]) if len(sys.argv) > 5 else 256

    crop_sprite_sheet_to_square(input_path, output_path, slice_x, slice_y, target_size)
