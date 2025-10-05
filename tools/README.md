# Development Tools

This directory contains helpful tools for game development.

## Image Helper - AI Image Generation

**File**: `image_helper.py`

Generate game assets and UI elements using Google Gemini AI.

### Quick Start

1. **Install dependencies:**
   ```bash
   pip install google-genai python-dotenv
   ```

2. **Setup API key:**

   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   Get your API key from: https://aistudio.google.com/apikey

3. **Generate your first image:**
   ```bash
   python tools/image_helper.py "A cute cartoon chef character"
   ```

### Usage Examples

**Basic usage:**
```bash
python tools/image_helper.py "A magic cooking pot icon, flat design"
```

**Specify output directory:**
```bash
python tools/image_helper.py "A game background" --output assets/backgrounds
```

**Custom filename:**
```bash
python tools/image_helper.py "A power-up star" --filename star-powerup
```

**Generate multiple variations:**
```bash
python tools/image_helper.py "A character sprite" --count 3
```

**Complete example:**
```bash
python tools/image_helper.py "A colorful ingredient icon, flat design, transparent background" \
  --output assets/icons \
  --filename tomato-icon \
  --count 2
```

### Command Line Options

```
python tools/image_helper.py [OPTIONS] "prompt"

Arguments:
  prompt              Text description of the image to generate

Options:
  -o, --output DIR    Output directory (default: generated_images)
  -f, --filename NAME Base filename without extension
  -c, --count N       Number of images to generate (default: 1)
  --api-key KEY       Gemini API key (overrides environment variable)
  -h, --help          Show help message
```

### Prompting Tips

**For best results, be specific:**

✅ **Good prompts:**
- "A flat design cooking pot icon, red color, simple lines, white background"
- "A cartoon style chef character, full body, white uniform, transparent background, game sprite"
- "A magical kitchen background, warm colors, top-down view, game scene"

❌ **Vague prompts:**
- "A pot"
- "A character"
- "A background"

**Include these details:**

1. **Style**: cartoon, pixel art, flat design, realistic, minimalist
2. **Subject**: what you want to see
3. **Colors**: specific color preferences
4. **Background**: transparent, white, solid color, or scene
5. **Purpose**: game asset, sprite, icon, UI element
6. **View**: full body, close-up, top-down, side view

### Common Use Cases

**Game Characters:**
```bash
python tools/image_helper.py "A chibi style chef character, full body, transparent background, game sprite" --output assets/characters --filename hero
```

**UI Icons:**
```bash
python tools/image_helper.py "A pause button icon, circular, modern design" --output assets/ui --filename pause
```

**Backgrounds:**
```bash
python tools/image_helper.py "A cartoon kitchen scene, bright colors, game background" --output assets/backgrounds --filename kitchen
```

**Game Items:**
```bash
python tools/image_helper.py "A glowing magic star, transparent background, power-up item" --output assets/items --filename star-powerup
```

**Multiple variations:**
```bash
python tools/image_helper.py "Food ingredient icons, colorful, flat design" --output assets/icons --count 5
```

### Use as Python Module

You can also import and use in Python code:

```python
from tools.image_helper import generate_image

# Generate single image
files = generate_image(
    prompt="A cute game character",
    output_dir="assets/characters",
    filename="hero"
)

# Generate multiple images
files = generate_image(
    prompt="A game icon",
    output_dir="assets/icons",
    filename="icon",
    count=3
)

print(f"Generated: {files}")
```

### Troubleshooting

**Error: "Missing required package"**
```bash
pip install google-genai python-dotenv
```

**Error: "Gemini API key not found"**
- Make sure `.env` file exists in project root
- Check that `GEMINI_API_KEY` is set in `.env`
- Or pass `--api-key` parameter

**No images generated:**
- Check your prompt isn't rejected by content policy
- Try a simpler, more descriptive prompt
- Make sure you have internet connection

**Quality issues:**
- Be more specific in your prompt
- Add style keywords (flat design, cartoon, etc.)
- Specify background type
- Try generating multiple variations with `--count`

### Best Practices

1. **Organize output**: Use `--output` to save to appropriate asset directories
2. **Name files clearly**: Use `--filename` for meaningful names
3. **Iterate**: Generate multiple versions with `--count` and choose the best
4. **Be specific**: Detailed prompts produce better results
5. **Match game style**: Include style keywords that match your game's aesthetic

### Integration with Agents

The **@ui-ux-designer** agent is configured to use this tool. You can ask the agent to generate images:

```
@ui-ux-designer Generate a character sprite for a chef
@ui-ux-designer Create UI icons for the game menu
@ui-ux-designer Design a background for the kitchen level
```

### Examples by Category

**Flat Design Icons:**
```bash
python tools/image_helper.py "A cooking pot icon, flat design, red, simple" --output assets/icons
python tools/image_helper.py "A chef hat icon, flat design, white, minimal" --output assets/icons
python tools/image_helper.py "A star rating icon, flat design, golden" --output assets/icons
```

**Cartoon Characters:**
```bash
python tools/image_helper.py "A cartoon chef, chibi style, happy expression, full body" --output assets/characters
python tools/image_helper.py "A cute vegetable character, cartoon style, smiling" --output assets/characters
```

**Pixel Art:**
```bash
python tools/image_helper.py "A food ingredient, pixel art style, 32x32" --output assets/sprites
python tools/image_helper.py "A cooking tool, 16-bit pixel art" --output assets/sprites
```

**UI Elements:**
```bash
python tools/image_helper.py "A game button, rounded, gradient blue" --output assets/ui
python tools/image_helper.py "A health bar design, modern UI" --output assets/ui
```

**Backgrounds:**
```bash
python tools/image_helper.py "A kitchen interior, cartoon style, warm lighting" --output assets/backgrounds
python tools/image_helper.py "A restaurant scene, top-down view, game background" --output assets/backgrounds
```

---

## Other Tools

More tools will be added here as the project grows.

**Suggestions for new tools:**
- Audio helper (sound effects generation)
- Asset optimizer (compress images)
- Sprite sheet generator
- Color palette generator

Ask **@project-chronicler** to document new tools as they're added.
