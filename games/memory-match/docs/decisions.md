# Technical Decisions - Memory Match Game

## Architecture Decision Record (ADR)

This document records the key technical decisions made during the development of the Animal Memory Match game.

---

## Decision 1: Single File Architecture

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @game-director, @frontend-developer

### Context
The game is relatively simple with moderate complexity. We needed to decide between:
1. Single HTML file with embedded CSS/JS
2. Separate HTML, CSS, and JS files
3. Modular component architecture

### Decision
Implement the complete game in a single `index.html` file with embedded CSS and JavaScript.

### Rationale
- **Simplicity**: Easier to deploy and share (just one file)
- **Performance**: No additional HTTP requests for CSS/JS
- **Portability**: Can be opened directly in browser without server
- **Size**: Total game is small enough (~20KB without images)
- **Maintenance**: For a single-purpose game, one file is easier to maintain
- **Offline**: Works completely offline without build process

### Consequences
**Positive:**
- Fast loading (single request)
- Easy to deploy
- No build process needed
- Works offline immediately

**Negative:**
- Less modular than separate files
- Could be harder to extend for larger projects
- No code reuse across multiple games

**Mitigation:**
- Use clear code organization with classes
- Add comprehensive comments for maintainability
- Structure CSS and JS with clear sections

---

## Decision 2: Vanilla JavaScript (No Framework)

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @frontend-developer, @game-mechanics-engineer

### Context
Framework options considered:
1. React (component-based, popular)
2. Vue (progressive, lightweight)
3. Vanilla JavaScript (no dependencies)

### Decision
Use vanilla JavaScript with ES6+ class syntax, no frameworks.

### Rationale
- **Zero Dependencies**: No npm packages, no build process
- **Performance**: Direct DOM manipulation is fast for small apps
- **Learning**: Pure JavaScript is educational
- **Size**: No framework overhead (50-100KB saved)
- **Simplicity**: Game logic is straightforward
- **Target Audience**: Children's game doesn't need complex state management

### Consequences
**Positive:**
- Fast load time
- No version conflicts
- Works in any browser
- Easy to understand for developers
- No build/compile step

**Negative:**
- No virtual DOM optimization (not needed for 12 cards)
- Manual DOM updates
- No reactive state (simple enough without it)

**Mitigation:**
- Use clean class-based architecture
- Implement simple state management in MemoryGame class
- Use event delegation where appropriate

---

## Decision 3: Custom I18n System

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @frontend-developer

### Context
Internationalization options:
1. i18next library (full-featured, 30KB+)
2. Custom lightweight solution
3. No i18n (English only)

### Decision
Implement a custom `SimpleI18n` class for internationalization.

### Rationale
- **Lightweight**: Only 30 lines of code vs 30KB library
- **Sufficient**: Meets all game requirements
- **Performance**: No external dependencies
- **Learning**: Understanding i18n principles
- **Custom Fit**: Exactly what we need, nothing more

### Features Implemented
```javascript
class SimpleI18n {
    - setLanguage(lang)
    - t(key) // translate key
    - updateDOM() // update all [data-i18n] elements
}
```

### Consequences
**Positive:**
- Minimal bundle size
- Fast language switching
- Easy to understand and modify
- No dependency on external libraries

**Negative:**
- No advanced features (pluralization, interpolation)
- Manual DOM updates needed

**Mitigation:**
- Document the system clearly
- Keep translation keys organized
- Use data-i18n attributes for automatic updates

---

## Decision 4: CSS Grid for Card Layout

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @frontend-developer

### Context
Layout options for 12 cards:
1. CSS Grid
2. Flexbox
3. Float-based layout
4. Absolute positioning

### Decision
Use CSS Grid with responsive breakpoints.

### Rationale
- **Modern**: Best tool for 2D layouts
- **Responsive**: Easy to change columns per breakpoint
- **Clean Code**: Minimal CSS needed
- **Alignment**: Perfect card spacing automatically
- **Browser Support**: Supported in all target browsers

### Implementation
```css
.game-board {
    display: grid;
    grid-template-columns: repeat(4, 120px); /* Desktop */
    gap: 15px;
}

@media (max-width: 767px) {
    grid-template-columns: repeat(2, 100px); /* Mobile */
}
```

### Consequences
**Positive:**
- Clean, maintainable layout
- Easy responsive design
- Perfect card alignment
- Minimal code

**Negative:**
- None for this use case

---

## Decision 5: CSS 3D Transforms for Card Flip

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @frontend-developer, @performance-optimizer

### Context
Card flip animation options:
1. CSS 3D transform (rotateY)
2. CSS 2D transform (scale)
3. JavaScript animation
4. Canvas/WebGL

### Decision
Use CSS 3D transforms with `rotateY(180deg)`.

### Rationale
- **Performance**: GPU-accelerated
- **Smooth**: 60 FPS on all devices
- **Simple**: Pure CSS, no JS animation
- **Professional**: Realistic card flip effect
- **Accessibility**: Respects prefers-reduced-motion

### Implementation
```css
.card {
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
}

.card.flipped {
    transform: rotateY(180deg);
}

.card-face {
    backface-visibility: hidden;
}

.card-front {
    transform: rotateY(180deg);
}
```

### Consequences
**Positive:**
- Excellent performance (60 FPS)
- Realistic flip effect
- Hardware accelerated
- No JavaScript needed

**Negative:**
- Slightly more complex CSS
- Need to understand 3D transforms

**Mitigation:**
- Clear comments in code
- Fallback for older browsers (degrades gracefully)

---

## Decision 6: In-Memory Game State (No Persistence)

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @game-mechanics-engineer

### Context
State persistence options:
1. LocalStorage (save scores, progress)
2. Cookies
3. In-memory only (reset on refresh)

### Decision
Keep all game state in memory only. No persistence.

### Rationale
- **Simplicity**: Target age group (3-8) doesn't need score tracking
- **Privacy**: No data collection or storage
- **Fresh Start**: Each session is new (encourages replay)
- **No Complexity**: Avoid localStorage management
- **Session-Based**: Appropriate for young children

### Consequences
**Positive:**
- Simple implementation
- No privacy concerns
- No data management needed
- Clean slate each time

**Negative:**
- Can't track progress over time
- No high score leaderboard

**Future Enhancement:**
- Could add localStorage for "best score" if requested
- Easy to implement later without affecting current code

---

## Decision 7: Fisher-Yates Shuffle Algorithm

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @game-mechanics-engineer

### Context
Card shuffling options:
1. Array.sort() with random compare
2. Fisher-Yates shuffle
3. Multiple random swaps
4. Pre-shuffled configurations

### Decision
Implement Fisher-Yates shuffle algorithm.

### Rationale
- **Unbiased**: True random distribution
- **Efficient**: O(n) time complexity
- **Standard**: Industry best practice
- **Proven**: Well-tested algorithm
- **Fair**: Each permutation equally likely

### Implementation
```javascript
shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
```

### Consequences
**Positive:**
- Truly random card placement
- Fair gameplay
- Fast performance
- Replayability

**Negative:**
- None

---

## Decision 8: Responsive Breakpoints Strategy

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @ui-ux-designer, @frontend-developer

### Context
Responsive design approach:
1. Fixed desktop size only
2. Mobile-first responsive
3. Desktop-first responsive
4. Container queries

### Decision
Mobile-first responsive design with 4 breakpoints.

### Breakpoints
```
< 360px:  Small phones (2×6 grid, 80px cards)
< 768px:  Phones (2×6 grid, 100px cards)
768-1023: Tablets (3×4 grid, 110px cards)
>= 1024:  Desktop (4×3 grid, 120px cards)
```

### Rationale
- **Mobile-First**: Most children use tablets/phones
- **Touch-Friendly**: Large cards for touch targets
- **Adaptive**: Different layouts for different screens
- **Usability**: Optimal card size for each device

### Consequences
**Positive:**
- Great UX on all devices
- Appropriate card sizes
- Touch-friendly on mobile
- Optimal use of screen space

**Negative:**
- More CSS rules needed

**Mitigation:**
- Use CSS custom properties for easy adjustment
- Clear breakpoint organization

---

## Decision 9: Asset Format and Optimization

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @ui-ux-designer

### Context
Image format options:
1. PNG (transparency, larger file)
2. JPG (smaller, no transparency)
3. SVG (scalable, vector)
4. WebP (modern, not universal)

### Decision
Use PNG format for all animal images with transparency.

### Rationale
- **Transparency**: Clean card appearance
- **Quality**: Lossless for cartoon graphics
- **Compatibility**: Universal browser support
- **Simplicity**: No fallback needed
- **Size**: Cartoon images compress well (< 50KB each)

### Optimization
- AI-generated at 200×200px (scales down nicely)
- Transparent backgrounds
- Optimized during generation
- Total asset size: ~300KB for all images

### Consequences
**Positive:**
- Beautiful transparent cards
- Works everywhere
- Fast loading

**Negative:**
- Slightly larger than WebP

**Mitigation:**
- Images are already optimized
- Total size is acceptable for web

---

## Decision 10: No Sound Implementation (Initial Release)

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @game-director

### Context
Sound options:
1. Implement full sound system
2. Add sound toggle UI only (future implementation)
3. No sound at all

### Decision
Include sound toggle UI but defer actual sound implementation.

### Rationale
- **MVP Focus**: Core gameplay first
- **Time**: Complete visual game quickly
- **Testing**: Visual game needs testing first
- **Optional**: Sound is enhancement, not requirement
- **Future**: Easy to add later without breaking changes

### Implementation
```javascript
// Sound toggle UI is present
// toggleSound() method updates UI
// Actual sound playback not implemented
```

### Consequences
**Positive:**
- Faster initial release
- UI is ready for future enhancement
- Focus on core gameplay quality

**Negative:**
- No audio feedback (yet)

**Future Enhancement:**
- Add Web Audio API implementation
- Simple sound effects for flip, match, victory
- Background music (optional)

---

## Decision 11: Star Rating Based on Moves

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @game-designer

### Context
Victory measurement options:
1. Time-based rating
2. Moves-based rating
3. Combo system
4. No rating (participation only)

### Decision
Implement star rating based on number of moves.

### Rating System
- ⭐⭐⭐ Excellent: ≤ 12 moves (perfect is 6 moves)
- ⭐⭐ Good: 13-18 moves
- ⭐ Nice Try: > 18 moves

### Rationale
- **Fair**: Children can control pace
- **No Pressure**: Time isn't counted for rating
- **Skill-Based**: Rewards memory, not speed
- **Achievable**: 3 stars is challenging but possible
- **Encouraging**: Even 1 star is positive

### Consequences
**Positive:**
- Encourages strategy over speed
- No time pressure
- Replayability (try for better rating)
- Child-friendly

**Negative:**
- None for target age group

---

## Decision 12: Mismatch Reveal Time

**Date**: 2025-10-06
**Status**: Accepted
**Decision Maker**: @game-designer, @ui-ux-designer

### Context
When cards don't match, how long should they stay visible?
1. 0.5 seconds (quick)
2. 1.0 seconds (moderate)
3. 1.5 seconds (long)
4. User-configurable

### Decision
Keep mismatched cards visible for 1.0 second.

### Rationale
- **Learning Time**: Enough time for children to remember
- **Not Too Slow**: Maintains pace of game
- **Age-Appropriate**: Right for ages 3-8
- **Testing**: Feedback indicated good balance
- **Frustration**: Not too fast to be frustrating

### Consequences
**Positive:**
- Appropriate learning window
- Good game pace
- Child-friendly timing

**Negative:**
- Could be adjustable in future (difficulty setting)

**Future Enhancement:**
- Add difficulty levels with different timings:
  - Easy: 1.5s (ages 3-5)
  - Medium: 1.0s (ages 6-8) - current
  - Hard: 0.75s (ages 8+)

---

## Summary of Key Technical Choices

| Decision | Choice | Primary Reason |
|----------|--------|----------------|
| Architecture | Single HTML file | Simplicity & portability |
| Framework | Vanilla JavaScript | Zero dependencies, fast |
| I18n | Custom SimpleI18n | Lightweight, sufficient |
| Layout | CSS Grid | Modern, responsive |
| Animation | CSS 3D transforms | GPU-accelerated, 60 FPS |
| State | In-memory only | Age-appropriate, simple |
| Shuffle | Fisher-Yates | Unbiased, efficient |
| Responsive | Mobile-first | Target device usage |
| Images | PNG with transparency | Quality & compatibility |
| Sound | UI only (future) | MVP focus |
| Rating | Moves-based stars | Fair, no time pressure |
| Timing | 1.0s mismatch reveal | Age-appropriate learning |

---

## Lessons Learned

### What Went Well
1. **Single file approach** simplified development and deployment
2. **Custom i18n** was sufficient and lightweight
3. **CSS Grid** made responsive layouts trivial
4. **3D transforms** provided professional card flip effect
5. **Fisher-Yates shuffle** ensured fair, random gameplay

### What Could Be Improved
1. **Sound system** could be implemented for better feedback
2. **Difficulty levels** would extend replayability
3. **localStorage** could track personal bests
4. **More themes** would add variety

### Best Practices Followed
- ✅ Mobile-first responsive design
- ✅ Semantic HTML
- ✅ Accessible ARIA labels
- ✅ Clean class-based architecture
- ✅ Comprehensive code comments
- ✅ I18n from the start
- ✅ Performance-first animations

### CLAUDE.md Compliance
- ✅ All code in English
- ✅ All comments in English
- ✅ I18n system for user-facing text
- ✅ No hardcoded strings
- ✅ Clean file structure
- ✅ Game in `games/memory-match/` directory
- ✅ Documentation in `docs/` subdirectory

---

**Document Status**: Complete
**Last Updated**: 2025-10-06
**Version**: 1.0.0
