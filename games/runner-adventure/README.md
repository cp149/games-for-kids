# Runner Adventure - KAPLAY Prototype

A simple endless runner game built with KAPLAY to demonstrate the framework's capabilities.

## Features ✨

- **Auto-running player** with jump mechanics
- **Procedural obstacle generation** with increasing difficulty
- **Collectible coins** for bonus points
- **Score system** with speed multiplier
- **Animated background** (clouds, grass)
- **Game over and restart** functionality
- **Responsive controls** (keyboard, mouse, touch)

## How to Play 🎮

1. Open `index.html` in a web browser
2. Click "Start Game" or press SPACE
3. Jump over obstacles by:
   - Pressing **SPACE** (keyboard)
   - **Clicking** (mouse)
   - **Tapping** (touch screen)
4. Collect **gold coins** for bonus points
5. Survive as long as possible!

## Technical Details 🔧

### Built with KAPLAY

This prototype demonstrates KAPLAY's core features:

**✅ Components Used:**
- `k.rect()` - Shape rendering
- `k.circle()` - Circle shapes for coins
- `k.pos()` - Position component
- `k.area()` - Collision detection
- `k.body()` - Physics (gravity, jumping)
- `k.move()` - Movement component
- `k.color()` - Coloring
- `k.offscreen()` - Auto-cleanup

**✅ Game Loop:**
- `k.onUpdate()` - Frame updates
- `k.loop()` - Timed events (spawning)

**✅ Input:**
- `k.onKeyPress()` - Keyboard
- `k.onClick()` - Mouse
- `k.onTouchStart()` - Touch

**✅ Scenes:**
- `menu` - Start screen
- `game` - Main gameplay
- `gameover` - End screen

**✅ Effects:**
- Simple particle system (coin collection)
- Lifespan component for temporary objects
- Dynamic speed scaling

## Code Structure 📝

```javascript
// Initialize KAPLAY
const k = kaplay({ ... });

// Define scenes
k.scene("menu", () => { ... });
k.scene("game", () => { ... });
k.scene("gameover", (score) => { ... });

// Start game
k.go("menu");
```

## Game Mechanics 🎯

### Scoring
- **+10 points/second** (base rate)
- **+50 points** per coin collected
- Score multiplied by current speed

### Difficulty Scaling
- Game speed increases every 100 points
- Speed = 1.0x → 1.1x → 1.2x → ...
- Faster obstacles as game progresses

### Physics
- Gravity: 1600 units
- Jump force: 600 units
- Player stays grounded until jump

## Current Limitations ⚠️

This is a **basic prototype** to validate KAPLAY integration:

- ❌ No sprites (using colored rectangles)
- ❌ No animations
- ❌ No sound effects or music
- ❌ No multi-language support (i18n)
- ❌ No persistent high scores
- ❌ No advanced UI components
- ❌ Simple graphics

## Next Steps 🚀

### Phase 2: Enhanced Version
1. **Add sprites** - Character and obstacle graphics
2. **Add animations** - Running, jumping animations
3. **Add audio** - Background music and sound effects
4. **Integrate i18n** - Multi-language support
5. **Better UI** - Styled menus and HUD

### Phase 3: Extensions
6. **Scoring system** - Stars, combos, high scores
7. **Power-ups** - Shield, double jump, speed boost
8. **Multiple themes** - Different visual styles
9. **Level progression** - Different environments

### Phase 4: Advanced Features
10. **MediaPipe** - Hand gesture controls
11. **TTS** - Voice feedback
12. **Mobile optimization** - Better touch controls

## File Size 📊

- **HTML file:** ~12KB
- **KAPLAY (CDN):** ~200KB (cached by browser)
- **Total load:** ~212KB (first visit), ~12KB (cached)

## Performance 🚀

- **60 FPS** on modern browsers
- **Works on mobile** (tested on touch devices)
- **Low memory usage** (auto-cleanup of off-screen objects)

## Lessons Learned 📚

### What Works Well:
- ✅ KAPLAY setup is extremely simple
- ✅ Component-based architecture is intuitive
- ✅ Scene system is perfect for game states
- ✅ Physics "just works" out of the box
- ✅ Collision detection is trivial
- ✅ Mobile support is built-in

### What to Improve:
- Need custom extensions for i18n
- Need custom UI components for polish
- Need sprite management strategy
- Need audio asset organization

### Time Spent:
- Setup and learning: **~1 hour**
- Building prototype: **~2 hours**
- **Total: ~3 hours** 🎉

Compare to custom engine: Would take **3-4 weeks**!

## Comparison with Memory Match

| Feature | Memory Match | Runner Prototype |
|---------|-------------|------------------|
| Framework | Vanilla JS | KAPLAY |
| Lines of Code | ~1,450 | ~350 |
| Development Time | 2-3 days | 3 hours |
| File Size | 35KB | 12KB |
| Physics | Manual | Built-in |
| Collision | Manual | Built-in |
| Mobile Support | Custom | Built-in |

**Result:** KAPLAY is **10x faster** for development! 🚀

## Try It 👉

Open `games/runner-adventure/index.html` in your browser or visit:
`https://cp149.github.io/games-for-kids/games/runner-adventure/`

## Credits

- **Game Engine:** KAPLAY (https://kaplayjs.com/)
- **Framework:** KAPLAY v3001.0.0
- **License:** MIT
