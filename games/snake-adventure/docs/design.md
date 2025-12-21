# Snake Adventure - Game Design Document

## Game Concept

A modern, visually stunning Snake game featuring **360-degree smooth movement** instead of traditional 90-degree grid turns. The game takes place on a large canvas with camera following mechanics, creating an immersive experience.

## Core Mechanics

### Movement System
- **360° Smooth Turning**: Snake can rotate in any direction smoothly
- **Continuous Movement**: Constant forward motion
- **Camera Follow**: Viewport pans to keep snake centered
- **Speed Control**: Gradual speed increase as player scores

### Game Loop
1. Snake moves continuously forward
2. Player controls direction (keyboard arrows / touch swipe)
3. Collect food to grow longer
4. Avoid hitting walls or own body
5. Score increases with food collected

## Visual Design

### Theme: Neon Glow

**Color Palette**:
- Background: Deep space blue `#0a0e27`
- Snake gradient: Cyan to magenta `#00ffff` → `#ff00ff`
- Food: Golden glow `#ffd700`
- Boundary: Electric blue circuits `#00d4ff`

### Snake Design (Non-Traditional)

**Body Structure**:
- Smooth circular segments (not blocky)
- Gradient color along body length
- Glowing aura around body
- Pulsing animation (breathing effect)
- Particle trail from tail

**Head Design**:
- Slightly larger circular head
- Two glowing eyes
- Directional indicator (subtle arrow glow)
- Enhanced glow when eating

**Tail Design**:
- Gradual taper to thin end
- Particle effects streaming behind
- Fade out effect at end

### Boundary Design

**Circuit Board Style**:
- Geometric tech patterns at corners
- Glowing lines forming border
- Gradient shadow beyond boundary
- Optional: Starfield particles outside arena

### UI Elements

**HUD (Heads-Up Display)**:
- Semi-transparent glassmorphism panel
- Top-left: Score with flip animation
- Top-right: Length counter
- Subtle glow effects on text

**Controls**:
- Large touch-friendly buttons (mobile)
- Glowing borders on hover/active
- Icon-based (universal language)

**Menus**:
- Blurred game background
- Glassmorphism cards
- Neon accent colors
- Smooth transitions

## Controls

### Keyboard (Desktop)
- Arrow Keys: Change direction
- Space: Pause/Resume
- R: Restart

### Touch (Mobile)
- Swipe: Change direction
- Tap pause button: Pause/Resume
- Virtual joystick option

### Gamepad (Optional)
- Analog stick: Direction control
- A button: Confirm/Pause

## Difficulty Progression

### Speed Levels
1. **Slow** (start): 3 units/sec
2. **Medium** (+10 food): 5 units/sec
3. **Fast** (+25 food): 7 units/sec
4. **Extreme** (+50 food): 9 units/sec

### Arena Size
- Canvas: 2000x2000 pixels
- Viewport: 800x600 pixels (responsive)
- Camera follows with smooth interpolation

## Game States

1. **Menu**: Start screen with options
2. **Playing**: Active gameplay
3. **Paused**: Game frozen, menu overlay
4. **Game Over**: Death animation, score display
5. **Victory**: (Optional) Achievement milestones

## Audio Design

### Music
- Ambient electronic soundtrack
- Tempo increases with speed level
- Volume control in settings

### Sound Effects
- Food collection: Bright "ping"
- Growth: Subtle "whoosh"
- Death: Low "thud" with reverb
- Menu navigation: Soft "click"
- Pause: "Swoosh" transition

## Target Audience

- **Age Range**: 6-12 years
- **Session Time**: 5-15 minutes
- **Skill Level**: Easy to learn, hard to master

## Accessibility

- High contrast colors
- Touch targets ≥48x48px
- Keyboard + touch support
- Optional reduced motion
- Multi-language support (i18n)

## Technical Requirements

### Performance
- 60 FPS on desktop
- 30+ FPS on mobile
- Smooth camera interpolation
- Efficient collision detection

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Canvas API required

### Assets
- Programmatically generated graphics (Canvas)
- Minimal external images
- Compressed audio files

## Success Metrics

- Player can understand controls in <10 seconds
- First death occurs after 30+ seconds (not too hard)
- Average session: 3-5 minutes
- Replay rate: >60%

## AI Image Generation Prompts

### Snake Head Asset
```
A glowing neon snake head, circular design, cyberpunk style, two bright cyan eyes,
subtle directional arrow glow on forehead, gradient from cyan to magenta,
transparent background, top-down view, 512x512px, PNG with alpha channel
```

### Food/Collectible Asset
```
Glowing golden orb, energy sphere, pulsing light effect, particle sparkles around edge,
warm golden color #ffd700, sci-fi style, transparent background, 256x256px,
PNG with alpha channel
```

### Background Pattern (Optional)
```
Dark space background, deep blue #0a0e27, subtle stars and nebula clouds,
circuit board patterns faintly visible, seamless tileable texture, 1024x1024px
```

### UI Icons
```
Pause icon: two glowing vertical bars, neon blue, rounded corners, simple, 64x64px
Play icon: glowing triangle pointing right, neon blue, 64x64px
Restart icon: circular arrow, neon blue, smooth curves, 64x64px
Settings icon: glowing gear/cog, neon blue, 64x64px
All icons: transparent background, consistent glow style
```

### Boundary Corner Decoration
```
Sci-fi tech corner decoration, circuit board pattern, glowing electric blue lines,
geometric shapes, L-shaped corner piece, 256x256px, transparent background
```

## Development Notes

- Use Canvas for all rendering (performance)
- Implement object pooling for particles
- Manager pattern: GameManager, SnakeManager, FoodManager, UIManager
- Config file for all constants (speed, sizes, colors)
- Memory leak prevention: destroy() methods everywhere
- Index.html < 100 lines (initialization only)

## Future Enhancements (Post-MVP)

- Power-ups (speed boost, shield, etc.)
- Different food types with bonuses
- Multiple arena themes
- Leaderboard system
- Achievement system
- Multiplayer mode (stretch goal)
