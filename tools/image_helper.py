#!/usr/bin/env python3
"""
Image Helper - Generate images using Google Gemini AI

This tool allows you to generate images based on text descriptions using
Google's Gemini 2.5 Flash Image model.

Installation:
    pip install google-genai python-dotenv

Setup:
    1. Create a .env file in the project root
    2. Add your Gemini API key: GEMINI_API_KEY=your_key_here
    3. Get API key from: https://aistudio.google.com/apikey

Usage as CLI:
    # Basic usage
    python tools/image_helper.py "A cute magic chef character cooking"

    # Custom output directory
    python tools/image_helper.py "A game icon" --output assets/icons

    # Custom filename
    python tools/image_helper.py "A background" --filename game-bg

    # Multiple images
    python tools/image_helper.py "A character sprite" --count 3

Usage as module:
    from tools.image_helper import generate_image

    generate_image(
        prompt="A cute game character",
        output_dir="assets/characters",
        filename="hero"
    )
"""

import argparse
import base64
import mimetypes
import os
import sys
from pathlib import Path
from typing import Optional, List

try:
    from google import genai
    from google.genai import types
    from dotenv import load_dotenv
except ImportError as e:
    print(f"Error: Missing required package. Please install dependencies:")
    print("  pip install google-genai python-dotenv")
    sys.exit(1)

# Load environment variables
load_dotenv()


def save_binary_file(file_path: str, data: bytes) -> None:
    """Save binary data to a file.

    Args:
        file_path: Path where the file should be saved
        data: Binary data to write
    """
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path) if os.path.dirname(file_path) else ".", exist_ok=True)

        with open(file_path, "wb") as f:
            f.write(data)
        print(f"✅ Image saved to: {file_path}")
    except Exception as e:
        print(f"❌ Error saving file {file_path}: {e}")
        raise


def generate_image(
    prompt: str,
    output_dir: str = "generated_images",
    filename: Optional[str] = None,
    count: int = 1,
    api_key: Optional[str] = None
) -> List[str]:
    """Generate images using Gemini AI.

    Args:
        prompt: Text description of the image to generate
        output_dir: Directory to save generated images (default: "generated_images")
        filename: Base filename (without extension). If None, uses sanitized prompt
        count: Number of images to generate (default: 1)
        api_key: Gemini API key. If None, reads from GEMINI_API_KEY env variable

    Returns:
        List of paths to generated image files

    Raises:
        ValueError: If API key is not provided
        Exception: If image generation fails
    """
    # Get API key
    api_key = api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "Gemini API key not found. Please either:\n"
            "  1. Set GEMINI_API_KEY environment variable\n"
            "  2. Add GEMINI_API_KEY=your_key to .env file\n"
            "  3. Pass api_key parameter\n"
            "Get your API key from: https://aistudio.google.com/apikey"
        )

    # Create client
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        raise Exception(f"Failed to create Gemini client: {e}")

    # Prepare output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Generate base filename if not provided
    if not filename:
        # Sanitize prompt to create filename
        filename = "".join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in prompt)
        filename = filename.replace(' ', '_').lower()[:50]

    print(f"🎨 Generating image(s) with prompt: '{prompt}'")
    print(f"📁 Output directory: {output_dir}")

    # Prepare request
    model = "gemini-2.5-flash-image"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"],
    )

    # Generate images
    generated_files = []
    file_index = 0

    try:
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            # Check if chunk has content
            if (
                chunk.candidates is None
                or chunk.candidates[0].content is None
                or chunk.candidates[0].content.parts is None
            ):
                continue

            # Check for image data
            part = chunk.candidates[0].content.parts[0]
            if part.inline_data and part.inline_data.data:
                inline_data = part.inline_data
                data_buffer = inline_data.data

                # Determine file extension
                file_extension = mimetypes.guess_extension(inline_data.mime_type) or ".png"

                # Create full file path
                if count > 1:
                    file_path = output_path / f"{filename}_{file_index}{file_extension}"
                else:
                    file_path = output_path / f"{filename}{file_extension}"

                # Save file
                save_binary_file(str(file_path), data_buffer)
                generated_files.append(str(file_path))
                file_index += 1

                # Check if we've generated enough images
                if file_index >= count:
                    break
            else:
                # Print any text response
                if hasattr(chunk, 'text') and chunk.text:
                    print(f"ℹ️  {chunk.text}")

    except Exception as e:
        raise Exception(f"Failed to generate image: {e}")

    if not generated_files:
        print("⚠️  No images were generated. The model may have rejected the prompt.")
    else:
        print(f"\n✨ Successfully generated {len(generated_files)} image(s)")

    return generated_files


def main():
    """Command-line interface for image generation."""
    parser = argparse.ArgumentParser(
        description="Generate images using Google Gemini AI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate a single image
  python tools/image_helper.py "A cute magic chef character"

  # Save to specific directory
  python tools/image_helper.py "A game icon" --output assets/icons

  # Custom filename
  python tools/image_helper.py "A forest background" --filename forest-bg

  # Generate multiple variations
  python tools/image_helper.py "A character sprite" --count 3

  # Combine options
  python tools/image_helper.py "A power-up item" --output assets/items --filename powerup --count 2

For UI/game assets, try prompts like:
  - "A flat design icon of a cooking pot, simple, colorful, game asset"
  - "A cartoon style magic chef character, full body, transparent background"
  - "A pixel art food ingredient sprite"
  - "A modern minimalist game button, rounded corners"
        """
    )

    parser.add_argument(
        "prompt",
        type=str,
        help="Text description of the image to generate"
    )

    parser.add_argument(
        "-o", "--output",
        type=str,
        default="generated_images",
        help="Output directory (default: generated_images)"
    )

    parser.add_argument(
        "-f", "--filename",
        type=str,
        default=None,
        help="Base filename without extension (default: sanitized prompt)"
    )

    parser.add_argument(
        "-c", "--count",
        type=int,
        default=1,
        help="Number of images to generate (default: 1)"
    )

    parser.add_argument(
        "--api-key",
        type=str,
        default=None,
        help="Gemini API key (default: reads from GEMINI_API_KEY env variable)"
    )

    args = parser.parse_args()

    try:
        generated_files = generate_image(
            prompt=args.prompt,
            output_dir=args.output,
            filename=args.filename,
            count=args.count,
            api_key=args.api_key
        )

        if generated_files:
            sys.exit(0)
        else:
            sys.exit(1)

    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
