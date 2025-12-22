# 🏁 Path Race

> Race against AI using Ant Colony Optimization! Plan your path wisely and beat the computer.

## Game Concept

**Path Race** is an educational puzzle-racing game where players compete against an AI opponent to find the optimal path through a grid of connected dots.

### How to Play

1. **Start at Green** 🟢 - Click the green dot to begin
2. **Visit All Dots** ⬜ - Each dot must be visited exactly once
3. **Move Orthogonally** ↕️ - Only up/down/left/right (no diagonals)
4. **Reach Red** 🔴 - End at the red dot to complete
5. **Beat the AI** 🤖 - Finish before the AI to win!

### Educational Value

- **Logical Thinking**: Plan ahead to avoid dead ends
- **Algorithm Awareness**: Watch AI explore using Ant Colony Optimization
- **Problem Solving**: Find efficient paths under time pressure
- **Spatial Reasoning**: Navigate grid-based constraints

### Target Audience

- **Age**: 5-8 years old
- **Session Time**: 2-5 minutes per race
- **Difficulty**: Progressive (3x3 to 6x6 grids)

## Features

✅ **Dual Display** - Watch AI vs Player side-by-side
✅ **AI Opponent** - Ant Colony Optimization algorithm
✅ **Undo System** - Unlimited undo for learning
✅ **Star Ratings** - 1-3 stars based on performance
✅ **15 Levels** - Progressive difficulty
✅ **Multilingual** - English, 中文, 日本語

## Technical Details

### Technology Stack

- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **AI**: Ant Colony Optimization (ACO)
- **Audio**: Web Audio API
- **I18n**: JSON-based translation system

### Project Structure

```
path-race/
├── index.html          # Entry point
├── css/
│   └── styles.css     # All styling
├── js/
│   ├── config.js      # Game configuration
│   ├── i18n.js        # Internationalization
│   ├── classes/       # Game classes
│   ├── managers/      # System managers
│   └── utils/         # Utility functions
├── assets/            # Images and sounds
└── docs/              # Documentation
```

### Performance

- **Target FPS**: 60fps
- **Canvas Rendering**: Optimized 2D rendering
- **Mobile Support**: Responsive design with touch support
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Development

### Running Locally

1. Clone the repository
2. Open `index.html` in a modern browser
3. No build process required!

### Code Standards

- All code in English
- Comments in English
- User-facing text via i18n system
- Follow existing patterns (see `CLAUDE.md`)

## Development Team

Built with **Claude Code** agent orchestration:

- **@game-director** - Project coordination and quality assurance
- **@game-designer** - Game mechanics and level design
- **@ui-ux-designer** - Visual design and child-friendly interface
- **@frontend-developer** - HTML/CSS structure and responsive layout
- **@game-mechanics-engineer** - ACO algorithm, grid generation, game loop
- **@qa-tester** - Quality assurance and code review
- **@project-chronicler** - Documentation and development logs

## Credits

- **Design**: Game Design Document in `docs/design.md`
- **Development**: See `docs/decisions.md` for technical decisions
- **Algorithm**: Ant Colony Optimization (Dorigo & Stützle, 2004)
- **Development Log**: `docs/development-logs/14-path-race-ai-competition.md`

## License

Part of the MGames collection - Educational games for children.

---

**Version**: 1.0.0
**Status**: Production Ready (Audio assets pending)
**Last Updated**: December 22, 2025
**QA Score**: 8.8/10
