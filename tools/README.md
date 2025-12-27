# Development Tools

This directory contains helpful tools for game development.


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


### Use as Python Module



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


---

## Other Tools

More tools will be added here as the project grows.

**Suggestions for new tools:**
- Audio helper (sound effects generation)
- Asset optimizer (compress images)
- Sprite sheet generator
- Color palette generator

Ask **@project-chronicler** to document new tools as they're added.
