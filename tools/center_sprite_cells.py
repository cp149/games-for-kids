#!/usr/bin/env python3
"""
Center align content in each cell of a sprite sheet
"""

from PIL import Image
import sys

def get_content_bounds(img):
    """Get bounding box of non-transparent content"""
    pixels = img.load()
    width, height = img.size

    min_x, min_y = width, height
    max_x, max_y = 0, 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 50:  # Non-transparent pixel
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if min_x > max_x:  # No content found
        return None

    return (min_x, min_y, max_x + 1, max_y + 1)

def center_sprite_cells(input_path, output_path, slice_x=8, slice_y=1):
    """
    Center align content in each cell of sprite sheet

    Args:
        input_path: Input sprite sheet path
        output_path: Output sprite sheet path
        slice_x: Number of columns
        slice_y: Number of rows
    """
    img = Image.open(input_path).convert('RGBA')
    width, height = img.size

    cell_width = width // slice_x
    cell_height = height // slice_y

    print(f"Image size: {width}x{height}")
    print(f"Cell size: {cell_width}x{cell_height}")
    print(f"Grid: {slice_x}x{slice_y}")

    # Create new image
    new_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))

    # Process each cell
    for row in range(slice_y):
        for col in range(slice_x):
            # Extract cell
            x = col * cell_width
            y = row * cell_height
            cell = img.crop((x, y, x + cell_width, y + cell_height))

            # Get content bounds
            bounds = get_content_bounds(cell)
            if bounds:
                content = cell.crop(bounds)
                content_width, content_height = content.size

                # Center content in cell
                new_x = x + (cell_width - content_width) // 2
                new_y = y + (cell_height - content_height) // 2

                new_img.paste(content, (new_x, new_y), content)
                print(f"  Cell ({col},{row}): content {content_width}x{content_height} → centered at ({new_x-x},{new_y-y})")
            else:
                print(f"  Cell ({col},{row}): empty")

    new_img.save(output_path, 'PNG')
    print(f"✅ Saved to {output_path}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python center_sprite_cells.py <input_path> <output_path> [slice_x] [slice_y]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    slice_x = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    slice_y = int(sys.argv[4]) if len(sys.argv) > 4 else 1

    center_sprite_cells(input_path, output_path, slice_x, slice_y)
