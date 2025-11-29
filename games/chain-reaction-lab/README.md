# Chain Reaction Lab | 连锁反应实验室

A beautiful, polished puzzle game with stunning sci-fi laboratory visuals and smooth animations.

## Visual Design

### Color Scheme
- **Background**: Dark blue-black gradient (#0a0a1a → #1a1a2e)
- **Accents**: Neon cyan (#00ffff), magenta (#ff00ff), green (#00ff88)
- **Glass Morphism**: Frosted glass panels with blur effects
- **Glowing Effects**: Dynamic glow on active mechanisms

### UI Components
- **Top Bar**: Glass panel with level info and icon buttons
- **Game Area**: Full canvas with grid background and glowing effects
- **Status Bar**: Real-time stats display (goal, moves, time)
- **Overlays**: Beautiful tutorial and success screens

### Mechanism Designs

**Buttons**:
- Round, gradient design
- Smooth click animation (scale down)
- Pulsing glow when active
- Color transition: dark blue (OFF) → bright green (ON)

**Doors**:
- Sleek frame with animated bars
- Bars slide up when unlocked
- Color coding: red (locked) → green (unlocked)
- Lock/checkmark icon

**Relays**:
- Diamond shape with directional arrow
- Signal pass-through with delay
- Orange glow when active

**Logic Gates** (Standard IEEE symbols):
- **AND Gate**: D-shape with 2 inputs, 1 output (Red)
- **OR Gate**: Curved arrow shape (Blue)
- **XOR Gate**: OR gate + extra curve (Purple)
- **NOT Gate**: Triangle + inversion bubble (Orange)
- **NAND Gate**: AND gate + bubble (Light Red)
- **NOR Gate**: OR gate + bubble (Light Blue)

**Energy Connections**:
- Curved Bezier paths between mechanisms
- Glowing lines when active
- Color-coded circuits
- Particle flow effects on activation

## Features Implemented

✅ **Beautiful UI**
- Modern glass morphism design
- Smooth animations throughout
- Professional color scheme
- Responsive layout

✅ **Core Mechanics**
- Clickable buttons
- Door unlock system
- Relay mechanisms with delay
- Logic gates (AND, OR, XOR, NOT, NAND, NOR)
- Connection visualization
- Signal propagation system
- Win condition detection

✅ **Game System**
- 21 hand-crafted levels (progressive difficulty)
- Random level generator with 5 difficulty levels
- Level progression system
- Move counting
- Time tracking
- Tutorial system
- Settings panel with language/sound/music/particles toggles
- Game completion celebration

✅ **I18n Support**
- English and Chinese
- Easy language switching
- All UI text translated

✅ **Polish**
- Loading screen with animated logo
- Success celebration overlay
- Click animations
- Particle effects system
- Glow effects

## File Structure

```
chain-reaction-lab/
├── index.html                 # Main entry point
├── styles/
│   ├── main.css              # Core styles & layout
│   ├── mechanisms.css        # UI components (tutorial, success, settings)
│   └── animations.css        # All animation keyframes
├── src/
│   ├── core/
│   │   ├── game.js          # Main game loop & state
│   │   ├── level.js         # Level management
│   │   └── renderer.js      # Canvas rendering & particle system
│   ├── entities/
│   │   ├── mechanism.js     # Base mechanism class
│   │   ├── button.js        # Button mechanism
│   │   ├── door.js          # Door mechanism
│   │   ├── relay.js         # Relay mechanism
│   │   ├── logic-gate.js    # Logic gate mechanisms
│   │   └── player.js        # Player avatar
│   ├── managers/
│   │   ├── game-state-manager.js  # State & level loading
│   │   └── ui-manager.js          # UI interactions
│   └── utils/
│       ├── i18n.js          # Internationalization (EN/ZH)
│       ├── animation.js     # Animation utilities
│       ├── level-generator.js     # Random level generator
│       ├── difficulty-config.js   # Difficulty configurations
│       └── settings.js      # Game settings persistence
└── data/
    └── levels.js            # 21 hand-crafted levels
```

## Visual Highlights

### Loading Screen
- Animated rotating ring logo
- Pulsing core
- Gradient text
- Progress bar animation

### Game Canvas
- Dark gradient background
- Subtle grid pattern
- Beautiful button visuals with glow
- Smooth connection lines
- Particle effects

### Animations
- Button click (scale bounce)
- Door open (sliding bars)
- Glow pulse (breathing effect)
- Success celebration (scale + particles)
- Float effect (subtle hover)

### Glass Morphism Effects
- Frosted glass background
- Blur backdrop filter
- Subtle borders
- Soft shadows

## Technical Features

- **ES6 Modules**: Clean code organization
- **Canvas Rendering**: Smooth 60fps graphics
- **Event System**: Proper mechanism signaling
- **Animation System**: Reusable animation manager
- **Particle System**: Dynamic particle effects
- **Responsive Design**: Works on all screen sizes
- **LocalStorage**: Save settings and progress

## Browser Support

- Modern browsers with ES6 module support
- Canvas 2D API required
- Backdrop-filter support for glass effects

## How to Play

1. **Objective**: Activate all mechanisms to unlock the door
2. **Click buttons** to activate them and send signals
3. **Watch signals propagate** through relays and logic gates
4. **Solve puzzles** using logical thinking
5. **Complete 21 levels** or try infinite random levels

### Level Progression
- **Levels 1-10**: Basic mechanics (buttons, relays, AND/OR gates)
- **Levels 11-21**: Advanced logic (XOR, NOT, NAND, NOR gates)
- **Random Mode**: Infinite procedurally generated puzzles

## Future Enhancements

Potential improvements:
- Sound effects and background music
- More mechanism types (timers, counters, etc.)
- Level editor for custom puzzles
- Achievements and statistics
- Mobile touch optimization
- Multiplayer puzzle solving

## Design Philosophy

**"Beautiful by Default"**
- Every element has polish
- Smooth transitions everywhere
- Professional color palette
- Attention to visual detail

**"Sci-Fi Laboratory Aesthetic"**
- Dark, mysterious atmosphere
- Neon accents for energy
- Glowing mechanisms
- Modern, clean UI

---

**Version**: 1.0.0
**Status**: ✅ Ready for Release
**Last Updated**: 2025-01-29
