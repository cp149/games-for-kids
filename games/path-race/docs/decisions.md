# Path Race - Technical Decisions

This document records key architectural and technical decisions made during development.

## Architecture Decisions

### ADR-001: Manager Pattern Architecture

**Status**: Accepted

**Context**: Need organized, maintainable code structure for complex game systems.

**Decision**: Adopt Manager Pattern with separation of concerns:
- `UIManager` - All DOM manipulation and UI updates
- `AudioManager` - Sound effects and music
- `LevelManager` - Level generation and progression
- `PathManager` - Path validation and player moves
- `AIManager` - AI opponent control

**Consequences**:
- ✅ Clear separation of concerns
- ✅ Easy to test individual systems
- ✅ Better code organization (each manager <200 lines)
- ❌ Slight overhead from manager coordination

**Alternatives Considered**:
- Monolithic game class - Rejected (too complex)
- Entity-Component-System - Rejected (overkill for this game)

---

### ADR-002: Canvas-Based Rendering

**Status**: Accepted

**Context**: Need to render grid, dots, and animated paths efficiently.

**Decision**: Use HTML5 Canvas 2D API for all game rendering.

**Consequences**:
- ✅ High performance (60 FPS easily achievable)
- ✅ Full control over rendering
- ✅ Smooth animations possible
- ❌ More manual work than DOM/SVG
- ❌ Accessibility requires extra effort

**Alternatives Considered**:
- SVG - Rejected (performance concerns for animations)
- DOM elements - Rejected (harder to animate smoothly)
- WebGL - Rejected (overkill, worse browser support)

---

### ADR-003: Ant Colony Optimization for AI

**Status**: Accepted

**Context**: Need an AI opponent that's educational and visually interesting.

**Decision**: Implement Ant Colony Optimization (ACO) algorithm for AI pathfinding.

**Consequences**:
- ✅ Educational value (algorithm visualization)
- ✅ Naturally variable difficulty (tunable parameters)
- ✅ Visually interesting (ants exploring)
- ❌ More complex than simple pathfinding
- ❌ Requires careful performance optimization

**Alternatives Considered**:
- A* pathfinding - Rejected (too perfect, not educational)
- Random pathfinding - Rejected (not competitive)
- Precomputed solutions - Rejected (not interesting to watch)

**Implementation Notes**:
- Use 3 virtual ants per iteration
- Visualize pheromone trails as glowing lines
- Add intentional delays for difficulty balancing

---

### ADR-004: Unlimited Undo for Children

**Status**: Accepted

**Context**: Target audience is 5-8 years old, prone to mistakes.

**Decision**: Allow unlimited undo operations without penalty.

**Consequences**:
- ✅ Reduces frustration for young players
- ✅ Encourages experimentation
- ✅ Supports learning through trial-and-error
- ❌ Could make game too easy
- ❌ Undo count still tracked for star rating

**Alternatives Considered**:
- Limited undo (3-5 times) - Rejected (too restrictive)
- No undo - Rejected (too frustrating)
- Undo with time penalty - Rejected (too complex)

---

### ADR-005: Grid Size Progression

**Status**: Accepted

**Context**: Need difficulty progression suitable for children.

**Decision**: Start with 3x3 grids, progress to 6x6:
- Levels 1-3: 3x3 (tutorial)
- Levels 4-6: 4x4 (easy)
- Levels 7-10: 5x5 (medium)
- Levels 11+: 6x6 (hard)

**Consequences**:
- ✅ Gentle learning curve
- ✅ Clear progression milestones
- ✅ Appropriate for 5-8 age group
- ❌ May need more levels for engagement

**Alternatives Considered**:
- Irregular grids - Rejected (confusing for children)
- Faster progression - Rejected (too steep)
- Larger grids (7x7+) - Rejected (too difficult)

---

### ADR-006: Dual Canvas Display

**Status**: Accepted

**Context**: Need to show AI and player simultaneously.

**Decision**: Use two separate canvas elements side-by-side.

**Consequences**:
- ✅ Clear visual separation
- ✅ Independent rendering (easier)
- ✅ No render state conflicts
- ❌ More DOM elements
- ❌ Duplicate rendering code

**Alternatives Considered**:
- Single canvas with split viewport - Rejected (complex rendering)
- Alternating views - Rejected (can't see both)
- Picture-in-picture - Rejected (too small)

---

### ADR-007: No Framework, Vanilla JavaScript

**Status**: Accepted

**Context**: Need lightweight, fast-loading game.

**Decision**: Build with vanilla JavaScript (ES6+), no frameworks.

**Consequences**:
- ✅ Minimal bundle size (<50KB)
- ✅ Fast loading (important for children's patience)
- ✅ No build step required
- ✅ Easy to understand codebase
- ❌ More manual DOM manipulation
- ❌ No reactive data binding

**Alternatives Considered**:
- React - Rejected (overkill, large bundle)
- Vue - Rejected (unnecessary complexity)
- Phaser.js - Rejected (game framework overkill)

---

### ADR-008: Hamiltonian Path Validation

**Status**: Accepted

**Context**: Need to ensure every generated level is solvable.

**Decision**: Use backtracking algorithm to validate Hamiltonian path exists.

**Consequences**:
- ✅ Guaranteed solvable levels
- ✅ Can find solution for AI reference
- ✅ Can count solutions for difficulty rating
- ❌ Slower level generation
- ❌ May need timeout for complex grids

**Alternatives Considered**:
- Random generation without validation - Rejected (unsolvable levels)
- Predesigned levels only - Rejected (limited variety)
- Heuristic validation - Rejected (not guaranteed)

**Implementation Notes**:
- Cache generated levels for reuse
- Timeout after 1 second, regenerate if needed
- Store at least one valid solution path

---

### ADR-009: I18n with JSON Files

**Status**: Accepted

**Context**: Need to support English, Chinese, and Japanese.

**Decision**: Use simple JSON-based i18n system with key-value pairs.

**Consequences**:
- ✅ Simple implementation
- ✅ Easy to add new languages
- ✅ No external dependencies
- ✅ Parameter interpolation support
- ❌ No pluralization (not needed)
- ❌ Manual language switching only

**Alternatives Considered**:
- i18next library - Rejected (overkill)
- Browser built-in Intl - Rejected (limited support)
- Separate HTML files per language - Rejected (maintenance burden)

---

### ADR-010: Star Rating System

**Status**: Accepted

**Context**: Need achievement system for motivation.

**Decision**: Award 1-3 stars based on completion time vs AI:
- ⭐⭐⭐: Beat AI by 20% or more
- ⭐⭐: Beat AI
- ⭐: Complete within 150% of AI time

**Consequences**:
- ✅ Clear achievement goals
- ✅ Encourages replay for better scores
- ✅ Relative to AI (fair difficulty scaling)
- ❌ May discourage slow players
- ❌ Time-based only (no move count stars)

**Alternatives Considered**:
- Absolute time thresholds - Rejected (unfair across levels)
- Move count rating - Rejected (too complex for children)
- Just win/loss - Rejected (less engaging)

---

## Technology Choices

### Language & Runtime
- **JavaScript**: ES6+ features (classes, arrow functions, destructuring)
- **Browser APIs**: Canvas 2D, Web Audio, LocalStorage
- **No transpilation**: Target modern browsers only

### Performance
- **Target**: 60 FPS on desktop, 30+ FPS on mobile
- **Optimization**: Object pooling for particles, dirty rectangle rendering
- **Memory**: Careful cleanup with `destroy()` methods on all classes

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS 14+, Android 9+

### Code Quality
- **Linting**: Follow Airbnb style guide (informally)
- **Comments**: JSDoc-style documentation
- **File Size**: Each file <550 lines (per CLAUDE.md)

---

## Future Considerations

### Post-MVP Features
- **PWA Support**: Offline play, installable
- **Cloud Sync**: Save progress across devices
- **Level Editor**: Let players create custom puzzles
- **More Algorithms**: Compare ACO with A*, DFS, BFS

### Known Limitations
- No multiplayer (out of scope)
- No social features (privacy for children)
- Limited to orthogonal movement (by design)

---

**Document Version**: 1.0
**Last Updated**: 2025-01-22
**Status**: Living Document (will update during development)
