# Shared Framework Architecture Documentation

**Version:** 1.0.0
**Status:** Design Phase Complete
**Last Updated:** 2025-10-06

---

## Overview

This directory contains the complete architectural design for the shared game framework. All documentation is ready for implementation.

---

## Quick Navigation

### 📋 Core Documents

1. **[SHARED_FRAMEWORK_ARCHITECTURE.md](./SHARED_FRAMEWORK_ARCHITECTURE.md)**
   - Complete framework overview
   - Directory structure and rationale
   - System architecture diagrams
   - Design principles and patterns
   - **Start here for big picture**

2. **[API_REFERENCE.md](./API_REFERENCE.md)**
   - Detailed API documentation
   - All classes with TypeScript-style interfaces
   - Method signatures and examples
   - **Reference while coding**

3. **[CLASS_DIAGRAMS.md](./CLASS_DIAGRAMS.md)**
   - Visual class hierarchies
   - System interaction flows
   - Dependency graphs
   - **Understand relationships**

4. **[FRAMEWORK_DESIGN_SUMMARY.md](./FRAMEWORK_DESIGN_SUMMARY.md)**
   - Executive summary
   - Key design decisions
   - Development roadmap
   - Success metrics
   - **Project status overview**

### 📚 Developer Guides

Located in `/docs/guides/`:

1. **[USING_SHARED_LIBRARY.md](../guides/USING_SHARED_LIBRARY.md)**
   - How to import and use the framework
   - System integration examples
   - Best practices and patterns
   - Performance tips
   - **Essential for developers**

2. **[CREATING_NEW_GAME.md](../guides/CREATING_NEW_GAME.md)**
   - Step-by-step game creation tutorial
   - Complete platformer example
   - Common patterns
   - Deployment guide
   - **Build your first game**

### 🎯 Architecture Decisions

Located in `/docs/architecture/decisions/`:

1. **[001-shared-framework-structure.md](./decisions/001-shared-framework-structure.md)**
   - Why we chose this architecture
   - Alternatives considered
   - Risks and mitigation
   - Success criteria

---

## Framework Systems

### Implemented Systems

None yet - currently in design phase.

### Designed Systems (Ready to Implement)

1. **Core Systems** - Game loop, scenes, entities
2. **Input System** - Keyboard, mouse, touch, gamepad
3. **Audio System** - Music, SFX, Web Audio API
4. **Visual Effects** - Particles, screen effects
5. **Physics & Math** - Vectors, collision detection
6. **UI Components** - Buttons, modals, menus
7. **Scoring System** - Points, combos, star ratings
8. **Storage System** - Save/load, localStorage
9. **I18n System** - Multi-language support
10. **Animation System** - Tweening, easing
11. **Performance Tools** - Object pooling, monitoring
12. **Utilities** - Math, random, colors, time

---

## Directory Structure

```
/home/wxcd/mgame/
│
├── lib/                           # Shared Framework (to be implemented)
│   ├── core/                      # Game loop, scenes, entities
│   ├── input/                     # Input handling
│   ├── audio/                     # Audio management
│   ├── visual/                    # Visual effects
│   ├── physics/                   # Physics and math
│   ├── ui/                        # UI components
│   ├── scoring/                   # Scoring system
│   ├── storage/                   # Save/load
│   ├── i18n/                      # Internationalization
│   ├── animation/                 # Animation helpers
│   ├── performance/               # Performance tools
│   └── utils/                     # Utilities
│
├── games/                         # Individual Games
│   ├── memory-match/             # Existing single-file game
│   └── runner-adventure/         # Planned modular game
│
├── docs/                          # Documentation
│   ├── architecture/             # THIS DIRECTORY
│   │   ├── README.md             # This file
│   │   ├── SHARED_FRAMEWORK_ARCHITECTURE.md
│   │   ├── API_REFERENCE.md
│   │   ├── CLASS_DIAGRAMS.md
│   │   ├── FRAMEWORK_DESIGN_SUMMARY.md
│   │   └── decisions/
│   │       └── 001-shared-framework-structure.md
│   │
│   └── guides/
│       ├── USING_SHARED_LIBRARY.md
│       └── CREATING_NEW_GAME.md
│
└── tools/                         # Development Tools
    └── image_helper.py
```

---

## Getting Started

### For New Developers

1. **Understand the Vision**
   - Read [SHARED_FRAMEWORK_ARCHITECTURE.md](./SHARED_FRAMEWORK_ARCHITECTURE.md)
   - Review [FRAMEWORK_DESIGN_SUMMARY.md](./FRAMEWORK_DESIGN_SUMMARY.md)

2. **Learn the APIs**
   - Study [API_REFERENCE.md](./API_REFERENCE.md)
   - Review [CLASS_DIAGRAMS.md](./CLASS_DIAGRAMS.md)

3. **Build Something**
   - Follow [CREATING_NEW_GAME.md](../guides/CREATING_NEW_GAME.md)
   - Use [USING_SHARED_LIBRARY.md](../guides/USING_SHARED_LIBRARY.md) as reference

### For Framework Developers

1. **Review Design**
   - Read all architecture documents
   - Understand design decisions
   - Check [ADR 001](./decisions/001-shared-framework-structure.md)

2. **Start Implementation**
   - Follow roadmap in [FRAMEWORK_DESIGN_SUMMARY.md](./FRAMEWORK_DESIGN_SUMMARY.md)
   - Implement systems in order (Core → Input → Audio → ...)
   - Write tests as you go

3. **Validate Design**
   - Build example games
   - Get feedback from users
   - Iterate on APIs

---

## Design Principles

### SOLID Principles

- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Interfaces can be swapped
- **Interface Segregation**: No forced dependencies
- **Dependency Injection**: Dependencies passed in, not hard-coded

### Performance First

- Object pooling for frequently created objects
- Fixed timestep for deterministic physics
- Efficient collision detection
- 60 FPS target on all devices

### Developer Experience

- Clear, consistent APIs
- Sensible defaults
- Helpful error messages
- Comprehensive documentation
- Complete examples

### Zero Dependencies

- Pure vanilla JavaScript
- No external libraries
- No build step required
- Native ES6 modules

---

## Development Roadmap

### ✅ Phase 0: Design (COMPLETE)
- Architecture documentation
- API design
- Class diagrams
- Usage guides

### ⏳ Phase 1: Core Systems (Next)
- Game loop
- Scene management
- Entity system
- Physics/math utilities

### 📅 Phase 2: Input & Audio
- Input system (keyboard, mouse, touch)
- Audio manager
- Sound effects

### 📅 Phase 3: Visual Effects
- Particle system
- Screen effects
- Object pooling

### 📅 Phase 4: UI & Scoring
- UI components
- Scoring system
- Star ratings

### 📅 Phase 5: Storage & I18n
- Save/load system
- Multi-language support

### 📅 Phase 6: Polish
- Animation system
- Performance tools
- Complete testing

### 📅 Phase 7: First Game
- Build runner game
- Validate framework
- Refine APIs

---

## Key Design Decisions

### Why ES6 Modules?
- Native browser support
- No build step needed
- Explicit dependencies
- Tree-shakeable

### Why /lib Directory?
- Common convention
- Clear library code
- Short and memorable
- Implies stability

### Why Feature-Based Organization?
- Clear domain boundaries
- Easy to find code
- Better encapsulation
- Scales well

### Why Object Pooling?
- Eliminates GC pauses
- Stable 60 FPS
- Memory efficient
- Industry standard

### Why Fixed Timestep?
- Deterministic physics
- Multiplayer-ready
- No spiral of death
- Industry standard

See [ADR 001](./decisions/001-shared-framework-structure.md) for detailed rationale.

---

## Framework Features

### Core Features ✅ Designed

- Game loop with fixed timestep
- Scene management
- Entity component system
- Event-driven architecture
- Performance monitoring

### Input Features ✅ Designed

- Keyboard input
- Mouse/touch input
- Gesture support
- Action mapping
- Multiple input sources

### Audio Features ✅ Designed

- Background music
- Sound effects
- Web Audio API
- Audio pooling
- Volume control

### Visual Features ✅ Designed

- Particle system
- Screen shake
- Flash effects
- Fade transitions
- Object pooling

### Physics Features ✅ Designed

- 2D vector math
- AABB collision
- Circle collision
- Collision detection
- Basic physics body

### UI Features ✅ Designed

- Button component
- Modal dialogs
- Progress bars
- Menu system
- Event handling

### Scoring Features ✅ Designed

- Score tracking
- Combo system
- Multipliers
- Star ratings
- Achievements

### Storage Features ✅ Designed

- LocalStorage wrapper
- JSON serialization
- Save/load games
- Settings persistence
- Import/export

### I18n Features ✅ Designed

- Multi-language support
- Dynamic translation
- DOM updates
- Language switching
- Fallback support

### Animation Features ✅ Designed

- Tweening engine
- Easing functions
- Chaining
- Events
- Sprite animation

---

## Success Metrics

### Framework Quality
- ✅ Clear interfaces designed
- ✅ Comprehensive documentation
- ✅ Usage examples provided
- ⏳ 60 FPS performance
- ⏳ Mobile compatible
- ⏳ Zero critical bugs

### Developer Experience
- ✅ Easy to understand APIs
- ✅ Complete guides
- ✅ Good examples
- ⏳ Games built in hours
- ⏳ Positive feedback

### Code Quality
- ✅ SOLID principles
- ✅ Design patterns
- ✅ No circular deps
- ⏳ Well-tested
- ⏳ Clean code

---

## Contributing

### Adding New Features

1. Create ADR in `/docs/architecture/decisions/`
2. Update architecture documents
3. Implement the feature
4. Add to API reference
5. Create usage examples
6. Update this README

### Updating Documentation

1. Edit relevant markdown files
2. Update version numbers
3. Add to revision history
4. Update this README if structure changes

---

## FAQ

**Q: Do I need to read all documents?**
A: Start with SHARED_FRAMEWORK_ARCHITECTURE.md, then dive into specific areas as needed.

**Q: Is the framework implemented yet?**
A: No, currently in design phase. Implementation starts with Phase 1 (Core Systems).

**Q: Can I use this for my game now?**
A: Not yet - wait for v1.0 release. Memory match game works independently.

**Q: Will this break existing games?**
A: No - memory match can stay as-is. New games will use the framework.

**Q: What about TypeScript?**
A: Using vanilla JS with JSDoc type hints. TypeScript definitions may come later.

**Q: How do I stay updated?**
A: Check FRAMEWORK_DESIGN_SUMMARY.md for current status and roadmap.

---

## Resources

### Internal Documentation
- [Main README](/home/wxcd/mgame/README.md)
- [Memory Match Game](/home/wxcd/mgame/games/memory-match/README.md)
- [Development Guides](/home/wxcd/mgame/docs/guides/)

### External References
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)
- [JavaScript Modules (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Web Audio API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## Contact & Support

For questions or feedback:
- Review existing documentation first
- Check FAQ section
- Create documentation issue if needed

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-06 | Game Director | Initial design complete |

---

**Status**: ✅ Design phase complete, ready for implementation

**Next Step**: Begin Phase 1 - Core Systems Implementation
