# Image Helper Quick Start Guide

Get started with AI image generation in 3 minutes!

## Step 1: Install Dependencies (1 minute)

```bash
pip install google-genai python-dotenv
```

## Step 2: Get API Key (1 minute)

1. Visit: https://aistudio.google.com/apikey
2. Create or sign in to your Google account
3. Click "Create API key"
4. Copy your API key

## Step 3: Configure (30 seconds)

Create a `.env` file in the project root (`/.env`):

```env
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the key you copied.

## Step 4: Test It! (30 seconds)

```bash
python tools/image_helper.py "A cute cartoon chef character"
```

Check the `generated_images/` directory for your image!

## Common Examples

**Game Character:**
```bash
python tools/image_helper.py "A chibi style magic chef, full body, transparent background" --output assets/characters --filename chef
```

**UI Icon:**
```bash
python tools/image_helper.py "A cooking pot icon, flat design, colorful" --output assets/icons --filename pot
```

**Background:**
```bash
python tools/image_helper.py "A magical kitchen scene, cartoon style, warm colors" --output assets/backgrounds --filename kitchen
```

**Multiple Variations:**
```bash
python tools/image_helper.py "A food ingredient icon" --count 3
```

## Need Help?

```bash
python tools/image_helper.py --help
```

See `tools/README.md` for detailed documentation.

## Use with Agents

Ask the UI designer to generate images:
```
@ui-ux-designer Generate a hero character sprite for our game
```

---

**Happy creating! 🎨**
