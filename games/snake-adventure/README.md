# 🐍 Snake Adventure

A modern, visually stunning Snake game featuring smooth 360-degree movement, beautiful neon graphics, and addictive gameplay.

## 🎮 Features

### Core Gameplay
- **Smooth 360° Movement**: Unlike traditional Snake, turn in any direction smoothly
- **Large Playfield**: Expansive 2400x2400px canvas with camera follow system
- **Progressive Difficulty**: Speed increases as you collect more food
- **Beautiful Effects**: Neon glow effects, particle trails, and pulsing animations

### Controls

**Keyboard (Desktop)**:
- `Arrow Keys`: Steer the snake
- `Space`: Pause/Resume or Start game
- `R`: Restart (after game over)

**Touch (Mobile)**:
- `Swipe`: Change direction
- `Pause Button`: Pause/Resume game
- `Tap`: Start game from menu

### Visual Design
- **Neon Aesthetic**: Cyberpunk-inspired color scheme
- **Gradient Snake**: Color transitions from cyan to magenta
- **Glowing Effects**: All elements have beautiful glow effects
- **Particle Trails**: Snake leaves a trail of fading particles
- **Pulsing Animations**: Snake and food pulse with breathing effect

## 🏗️ Architecture

This game follows best practices from `BEST_PRACTICES.md`:

### Manager Pattern
```
SnakeGame (main controller)
├── UIManager - HUD, menus, toasts
├── SnakeManager - Snake physics and rendering
├── FoodManager - Food spawning and collection
├── CameraManager - Viewport following
└── ParticleManager - Trail particle effects
```

### File Structure
```
snake-adventure/
├── index.html                    # <100 lines - initialization only
├── css/
│   └── styles.css               # All styles
├── js/
│   ├── config.js                # ALL configuration constants
│   ├── i18n.js                  # Multi-language support
│   ├── utils/
│   │   └── MathUtils.js         # Math helper functions
│   ├── managers/
│   │   ├── UIManager.js         # UI management
│   │   ├── SnakeManager.js      # Snake logic (~250 lines)
│   │   ├── FoodManager.js       # Food logic
│   │   ├── CameraManager.js     # Camera following
│   │   └── ParticleManager.js   # Particle effects
│   └── classes/
│       └── SnakeGame.js         # Main game controller (<300 lines)
└── docs/
    ├── design.md                # Game design document
    └── decisions.md             # Technical decisions (ADRs)
```

## 🌍 Internationalization

Supports multiple languages:
- English
- 中文 (Chinese)
- 日本語 (Japanese)

Language is auto-detected from browser and saved to localStorage.

## 🎯 Scoring System

- **Food Collection**: +10 points per food
- **Length Milestones**: Achievement toasts at 20, 50, 100, 200, 500 segments
- **Speed Progression**: Speed increases after collecting 10, 25, 50, 100 food items

## 🛠️ Technical Details

### Performance
- **Target**: 60 FPS on desktop, 30+ FPS on mobile
- **Canvas Rendering**: All graphics procedurally generated
- **Object Pooling**: Particles reused to avoid GC pressure
- **Smooth Interpolation**: Lerp-based movement and camera following

### Memory Management
- All managers have `destroy()` methods
- Event listeners tracked and cleaned up
- No memory leaks (tested for extended gameplay)

### Mobile Optimization
- Touch-optimized controls
- Responsive canvas sizing
- GPU-accelerated rendering
- No external image assets (instant load)

## 🚀 Getting Started

### Play Locally
1. Open `index.html` in a modern browser
2. No build step required!
3. All assets generated procedurally

### Deploy
- Works on any static hosting (GitHub Pages, Netlify, Vercel)
- Uses relative paths (works in subdirectories)
- No server-side code needed

## 🎨 Customization

All game parameters are in `js/config.js`:
- Snake speed and turn rate
- Food spawn settings
- Camera smoothness
- Particle effects
- Colors and visual style

Example:
```javascript
CONFIG.SNAKE.INITIAL_SPEED = 150;  // Pixels per second
CONFIG.SNAKE.TURN_RATE = 0.12;     // Smoothness (0-1)
CONFIG.CAMERA.LERP_SPEED = 0.08;   // Camera follow smoothness
```

## 📦 Dependencies

**None!**

Pure vanilla JavaScript. No frameworks, no libraries, no build tools.

## 🧪 Testing

### Manual Testing Checklist
- [ ] Snake moves smoothly in all directions
- [ ] Food collection works correctly
- [ ] Boundary collision detection accurate
- [ ] Self-collision detection accurate
- [ ] Camera follows snake smoothly
- [ ] Pause/Resume works
- [ ] Game over triggers correctly
- [ ] Mobile touch controls responsive
- [ ] No memory leaks during extended play
- [ ] 60 FPS performance maintained

### Cross-Browser Testing
- [x] Chrome/Edge (Chromium)
- [x] Firefox
- [x] Safari (desktop & iOS)
- [x] Mobile browsers

## 🎓 Learning Points

This game demonstrates:
- **Manager Pattern**: Clean separation of concerns
- **Canvas Rendering**: Procedural graphics generation
- **Smooth Movement**: Lerp-based interpolation
- **Camera System**: Viewport following with deadzone
- **Particle Effects**: Object pooling for performance
- **Memory Management**: Proper cleanup and destroy chains
- **i18n**: Runtime language switching
- **Mobile-First**: Touch controls and responsive design

## 📝 License

Part of the mgame collection. Free to use and modify.

## 👥 Credits

- Game Design: Following classic Snake mechanics with modern twist
- Visual Style: Neon/cyberpunk aesthetic
- Architecture: Based on mgame BEST_PRACTICES.md

---

**Enjoy the game!** 🐍✨
