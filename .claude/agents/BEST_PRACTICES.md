# Game Development Best Practices

**IMPORTANT**: All agents MUST follow these practices learned from our production games.

---

## 1. Project Structure (MANDATORY)

Every game MUST follow this directory structure:

```
games/[game-name]/
├── index.html              # MAXIMUM 100 lines - only loading and initialization
├── css/
│   └── styles.css          # All styles here, not inline
└── js/
    ├── config.js           # ALL configuration values
    ├── managers/           # Manager classes (separation of concerns)
    │   ├── UIManager.js    # UI creation, toasts, modals
    │   ├── MusicManager.js # Audio playback
    │   └── TimerManager.js # Timer logic
    └── classes/            # Core game classes
        ├── [Entity].js     # Game entities
        └── [Game].js       # Main game controller (<300 lines)
```

### Why This Matters
- **Memory Match**: 1000+ lines in index.html = unmaintainable
- **Puzzle Master**: 80 lines in index.html = clean, modular, testable

---

## 2. Manager Pattern (MANDATORY)

Extract responsibilities into Manager classes:

```javascript
// GOOD: Each manager has ONE responsibility
class UIManager {
    constructor(container) { this.container = container; }
    createUI() { /* ... */ }
    showToast(message) { /* ... */ }
    destroy() { /* cleanup */ }
}

class MusicManager {
    constructor() { this.bgMusic = null; }
    play() { /* ... */ }
    stop() { /* ... */ }
    destroy() { /* cleanup */ }
}

// Main game uses managers
class PuzzleGame {
    constructor() {
        this.uiManager = new UIManager(container);
        this.musicManager = new MusicManager();
        this.timerManager = new TimerManager();
    }
}
```

### Manager Guidelines
- Each manager: ONE responsibility
- Each manager: MUST have destroy() method
- Main game class: <300 lines after extraction

---

## 3. Centralized Configuration (MANDATORY)

ALL magic numbers and settings in `config.js`:

```javascript
// config.js
const CONFIG = {
    GAME: {
        DIFFICULTY_LEVELS: { easy: 2, medium: 3, hard: 4 },
        SNAP_DISTANCE: 30,
        ANIMATION_DURATION: 300,
        MUSIC_VOLUME: 0.3,
        CONFETTI_COUNT: 30
    },
    PIECE: {
        MIN_SIZE: 50,
        DROP_MARGIN: 50
    }
};
```

### Benefits
- Change behavior without editing logic code
- Single source of truth
- Easy to test different values

---

## 4. Memory Leak Prevention (MANDATORY)

### 4.1 Event Listener Tracking

```javascript
class Game {
    constructor() {
        this.domHandlers = new Map();  // Track all listeners
    }

    addDomListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            const boundHandler = handler.bind(this);
            element.addEventListener(event, boundHandler);
            this.domHandlers.set(`${elementId}:${event}`, {
                element, event, handler: boundHandler
            });
        }
    }

    destroy() {
        // Remove ALL tracked listeners
        this.domHandlers.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.domHandlers.clear();
    }
}
```

### 4.2 Every Class MUST Have destroy()

```javascript
class MusicManager {
    destroy() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.removeEventListener('ended', this.handleEnded);
            this.bgMusic = null;  // Clear reference
        }
    }
}

class TimerManager {
    destroy() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
}
```

### 4.3 Cleanup Chain

```javascript
// Main game destroy calls all sub-destroys
destroy() {
    this.timerManager.destroy();
    this.musicManager.destroy();
    this.uiManager.cleanupTemporaryElements();
    this.domHandlers.forEach(/* ... */);
    this.puzzleBoard?.destroy();
}
```

---

## 5. Relative Paths Only (MANDATORY)

**NEVER hardcode absolute paths.** All asset references must use relative paths.

```javascript
// GOOD: Relative paths
bgImage.src = 'assets/images/background.png';
bgImage.src = '../../lib/images/shared-bg.png';

// BAD: Absolute paths - WILL BREAK on deployment
bgImage.src = '/home/user/project/assets/background.png';
bgImage.src = '/assets/background.png';  // Also bad for GitHub Pages
```

### Why This Matters
- Absolute paths break when deployed to GitHub Pages
- Different developers have different local paths
- CI/CD environments have different directory structures

---

## 6. Resource Sharing (RECOMMENDED)

### Shared Assets Location

```
lib/
├── images/           # Shared images (backgrounds, sprites)
│   ├── runner-bg1.png
│   └── runner-bg2.png
└── sounds/           # Shared audio
    └── bgm/
```

### Reference Shared Assets

```javascript
// In config.js
DEFAULT_IMAGES: [
    '../../lib/images/runner-bg1.png',
    '../../lib/images/runner-bg2.png'
]
```

### Benefits
- Reduce project size
- Visual consistency across games
- Single update point

---

## 6. Mobile Optimization (MANDATORY)

### 6.1 Touch Targets

```css
.control-btn {
    min-height: 44px;    /* Apple HIG minimum */
    min-width: 44px;
    touch-action: manipulation;
}
```

### 6.2 Touch Intent Detection

```javascript
// Distinguish drag from scroll
this.dragThreshold = 10;

onTouchStart(e) {
    this.touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    this.dragConfirmed = false;
}

onTouchMove(e) {
    if (!this.dragConfirmed) {
        const dx = Math.abs(e.touches[0].clientX - this.touchStartPos.x);
        const dy = Math.abs(e.touches[0].clientY - this.touchStartPos.y);
        if (dx < this.dragThreshold && dy < this.dragThreshold) {
            return;  // Allow scroll
        }
        this.dragConfirmed = true;
    }
    // Handle drag...
}
```

### 6.3 iOS Safari Compatibility

```javascript
const video = document.createElement('video');
video.playsInline = true;
video.muted = true;
video.setAttribute('playsinline', '');
video.setAttribute('webkit-playsinline', '');
```

### 6.4 GPU-Accelerated Dragging

```javascript
// GOOD: Use transform (GPU accelerated)
element.style.transform = `translate(${x}px, ${y}px)`;

// BAD: Use left/top (causes reflow)
element.style.left = x + 'px';
element.style.top = y + 'px';
```

---

## 7. Index.html Structure (MANDATORY)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Title</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div id="game-container"></div>

    <!-- Load order: config → managers → classes → main -->
    <script src="js/config.js"></script>
    <script src="js/managers/UIManager.js"></script>
    <script src="js/managers/MusicManager.js"></script>
    <script src="js/managers/TimerManager.js"></script>
    <script src="js/classes/Entity.js"></script>
    <script src="js/classes/Game.js"></script>

    <!-- Minimal initialization -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const game = new Game('game-container');
            window.addEventListener('beforeunload', () => game.destroy());
        });
    </script>
</body>
</html>
```

**Target: < 100 lines**

---

## 8. Comprehensive Quality Checklist

Before considering a game complete, perform multi-round QA across these dimensions:

### Performance
- [ ] FPS stability: 60 FPS maintained during gameplay
- [ ] Memory leaks: No growth over 30+ minute sessions
- [ ] Rendering optimization: GPU-accelerated transforms
- [ ] Event listeners: Tracked and properly cleaned up
- [ ] Animation performance: No janky scrolling or transitions
- [ ] Asset loading: Cached and optimized

### Algorithm Quality
- [ ] Time complexity: Optimal algorithms for game logic
- [ ] Space complexity: Efficient memory usage
- [ ] Algorithm selection: Appropriate for problem domain
- [ ] Edge case handling: Boundary conditions properly tested
- [ ] Brute-force prevention: Strategic difficulty (not just solvable)
- [ ] State validation: BFS or similar for puzzle verification

### Code Quality
- [ ] Code duplication: DRY principle applied
- [ ] Function length: Functions < 50 lines, classes < 300 lines
- [ ] Naming conventions: Descriptive, consistent naming
- [ ] Comment completeness: Complex logic explained
- [ ] Manager pattern: Separation of concerns
- [ ] Configuration: All magic numbers in config.js
- [ ] index.html: < 100 lines

### Security
- [ ] XSS protection: User input sanitized
- [ ] Input validation: All inputs validated before use
- [ ] Data sanitization: innerHTML avoided or sanitized
- [ ] Third-party scripts: Only trusted sources
- [ ] Content Security Policy: CSP headers if applicable

### User Experience
- [ ] Teaching curve: Gradual difficulty increase
- [ ] Error feedback: Clear, actionable messages
- [ ] Visual feedback: Immediate response to actions
- [ ] Audio balance: Music/SFX volumes appropriate
- [ ] Tutorial quality: First-time users understand gameplay
- [ ] Child testing: Tested with target age group
- [ ] Attention span: Engagement maintained for session length

### Memory Safety (Critical)
- [ ] Event listener cleanup: All listeners removed in destroy()
- [ ] Timer cleanup: setInterval/setTimeout cleared
- [ ] Audio cleanup: Paused and dereferenced
- [ ] DOM cleanup: Elements properly removed
- [ ] Circular references: None present
- [ ] Destroy chain: Parent destroys all children

---

## 9. Leveraging Project Memory (MANDATORY)

### Serena Memory System

This project uses Serena MCP to store accumulated knowledge in `.serena/memories/`. While sub-agents don't have direct MCP access, you can **read memory files directly** using the Read tool.

### Before Starting Any Task

**ALWAYS check for relevant memories first:**

```bash
# List available memories
ls .serena/memories/

# Common memory files to check:
# - qa-agent-improvements-2025-01.md (QA strategies)
# - testing-strategy.md (Testing best practices)
# - game-development-workflow.md (Development process)
# - code-quality-checklist.md (Code standards)
# - [game-name]-architecture.md (Game-specific patterns)
```

### How to Use Memories

**1. Identify Relevant Memories**
```javascript
// For QA tasks:
Read('.serena/memories/qa-agent-improvements-2025-01.md')
Read('.serena/memories/testing-strategy.md')

// For performance tasks:
Read('.serena/memories/[game-name]-architecture.md')

// For new games:
Read('.serena/memories/game-development-lessons-2025-01.md')
Read('.serena/memories/game-design-patterns.md')
```

**2. Apply Learned Lessons**
- Check for past mistakes and avoid them
- Follow established patterns from successful games
- Use proven testing strategies
- Reference architecture decisions

**3. Examples**

```markdown
## QA Agent Starting Task
1. Read .serena/memories/qa-agent-improvements-2025-01.md
2. Apply multi-round QA strategy learned from Chain Reaction Lab
3. Check .serena/memories/testing-strategy.md for edge cases
4. Execute QA with accumulated knowledge

## Performance Optimizer Starting Task
1. Read .serena/memories/music-factory-timing-bugs-lessons.md
2. Learn from past timing issues and solutions
3. Apply preventive measures from memory
4. Check game-specific architecture for context
```

### Available Memory Categories

**Architecture Memories**:
- `[game-name]-architecture.md` - Game-specific implementation patterns
- `game-design-patterns.md` - Reusable design patterns

**Process Memories**:
- `game-development-workflow.md` - Standard development process
- `agent-coordination-best-practices.md` - Multi-agent collaboration

**Quality Memories**:
- `qa-agent-improvements-2025-01.md` - QA strategies and multi-round approach
- `testing-strategy.md` - Testing methodologies
- `code-quality-checklist.md` - Code standards

**Domain-Specific Lessons**:
- `music-factory-timing-bugs-lessons.md` - Audio timing issues
- `user-feedback-luban-lock.md` - User feedback insights
- `game-development-lessons-2025-01.md` - Monthly lessons learned

### Memory Reading Pattern

```javascript
// Standard workflow for ANY agent starting a task:

// Step 1: Check if relevant memories exist
Bash('ls .serena/memories/ | grep -E "(qa|testing|[game-name])"')

// Step 2: Read relevant memories
Read('.serena/memories/relevant-memory.md')

// Step 3: Apply knowledge to current task
// ... use insights in your work ...

// Step 4: Note new lessons for future memory updates
// (Report to user or game-director for memory updates)
```

### Why This Matters

**Example from Chain Reaction Lab**:
- **Without memory**: Repeat 60%→95%→100% algorithm iterations
- **With memory**: Start with anti-brute-force validation from day 1

**Benefits**:
- ✅ Learn from past mistakes (avoid repeating errors)
- ✅ Apply proven patterns (faster development)
- ✅ Consistent quality (follow established standards)
- ✅ Compound knowledge (each project makes next one better)

### Agent-Specific Memory Recommendations

**@qa-tester**: Always read `qa-agent-improvements-2025-01.md`, `testing-strategy.md`

**@performance-optimizer**: Read `[game-name]-architecture.md`, timing-related memories

**@game-mechanics-engineer**: Read `game-design-patterns.md`, `[similar-game]-architecture.md`

**@frontend-developer**: Read architecture memories for code organization patterns

**@project-chronicler**: Read all relevant memories before creating new documentation

---

## 10. Multi-Agent Quality Workflow (RECOMMENDED)

Use Quality Engineer Agent for multi-round code review:

1. **Round 1**: Code smell analysis (duplication, long functions)
2. **Round 2**: Performance review (DOM queries, event listeners)
3. **Round 3**: Mobile compatibility (touch targets, gestures, PWA)

Each round provides specific file locations and fix suggestions.

---

## 11. Test Suite (RECOMMENDED)

Make tests easy to run with a single command:

```bash
npm run test:all
```

### Test Structure
```
tests/
├── [module].test.js     # Unit tests
└── [module].perf.js     # Performance benchmarks
```

### Key Principles
- Pure function design enables DOM-free testing
- Performance benchmarks with strict thresholds
- Results in seconds, not minutes

---

## Reference Implementation

**Puzzle Master** is the reference implementation of these best practices:
- `games/puzzle-master/` - Full example
- `docs/development-logs/08-puzzle-master-engineering-excellence.md` - Documentation

---

*All agents should follow these practices for every new game.*
