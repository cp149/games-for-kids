# Match Three Game

A colorful match-3 puzzle game designed for children aged 6-10 years old.

## Features

### Gameplay
- **8x8 grid** of colorful gems
- **Simple mechanics**: Swap adjacent gems to match 3 or more
- **Cascading matches**: Chain reactions for bonus points
- **Progressive difficulty**: Easy, Medium, and Hard modes
- **Score targets**: Reach the goal to complete each level

### Design
- **Bright, vibrant colors**: Engaging for young players
- **Large touch targets**: Easy to tap on mobile devices
- **Smooth animations**: Polished visual feedback
- **Color blind mode**: Patterns for accessibility
- **Responsive**: Works on phones, tablets, and desktops

### Audio
- **Background music**: Cheerful, upbeat tunes
- **Sound effects**: Satisfying feedback for actions
- **Toggle controls**: Mute music or sound effects

## How to Play

1. **Tap or click** a gem to select it
2. **Tap an adjacent gem** to swap positions
3. **Match 3 or more** of the same color
4. **Create cascades** for combo bonuses
5. **Reach the target score** to complete the level

## Architecture

This game follows the **BEST_PRACTICES.md** from puzzle-master:

### Directory Structure
```
match-three/
├── index.html          # < 100 lines - loading only
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── config.js       # All configuration constants
│   ├── managers/       # Separated concerns
│   │   ├── UIManager.js
│   │   ├── MusicManager.js
│   │   └── ScoreManager.js
│   └── classes/        # Game entities
│       ├── Gem.js
│       ├── Board.js
│       └── MatchThreeGame.js  # < 300 lines
├── assets/
│   ├── sounds/
│   └── images/
└── docs/
    ├── design.md
    └── ui-design.md
```

### Key Principles
- **Separation of concerns**: UI, music, scoring in separate managers
- **Clean resources**: All classes have `destroy()` methods
- **Event tracking**: Map-based listener cleanup
- **Config-driven**: No magic numbers in code
- **Mobile-first**: Touch-friendly design

## Code Quality

### Standards Met
- ✅ **index.html < 100 lines**: Just script loading
- ✅ **Main game class < 300 lines**: Logic delegated to managers
- ✅ **destroy() methods**: Proper resource cleanup
- ✅ **Event tracking**: Map for listener management
- ✅ **config.js**: All constants centralized
- ✅ **Mobile-optimized**: 44px+ touch targets

### Performance
- **60 FPS**: Smooth animations
- **Fast response**: < 100ms swap detection
- **Efficient rendering**: CSS transforms for animation
- **Memory management**: Proper cleanup on destroy

## Configuration

Edit `js/config.js` to customize:

- **Grid size**: Default 8x8
- **Gem types**: Default 6 colors
- **Scoring**: Points for different match sizes
- **Difficulty**: Target scores per level
- **Timing**: Animation durations
- **Audio**: Volume levels and file paths

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari 12+, Chrome Android 80+
- **Features**: ES6, CSS Grid, Flexbox, Custom Properties

## Development

### Prerequisites
- Modern web browser
- Local web server (optional but recommended)

### Running Locally
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js http-server
npx http-server

# Then open: http://localhost:8000/games/match-three/
```

### Adding Sound Effects
Place MP3 files in `assets/sounds/`:
- swap.mp3
- match.mp3
- cascade.mp3
- victory.mp3
- invalid.mp3

### Customizing Visuals
Edit `css/styles.css` to change:
- Colors and gradients
- Animation timings
- Layout and spacing
- Font sizes and families

## Credits

- **Design**: Based on classic match-3 puzzle games
- **Architecture**: Follows puzzle-master best practices
- **Target Audience**: Children aged 6-10 years old

## License

Educational and personal use.

## Future Enhancements

Potential additions:
- [ ] Power-ups (stripe gems, bomb gems, rainbow gems)
- [ ] Timed mode for challenge
- [ ] Level progression with increasing difficulty
- [ ] Sound effect library integration
- [ ] Particle effects for matches
- [ ] Achievement system
- [ ] Local high scores
- [ ] More gem types and colors
