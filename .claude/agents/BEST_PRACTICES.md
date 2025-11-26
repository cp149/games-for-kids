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

## 5. Resource Sharing (RECOMMENDED)

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

## 8. Quality Checklist

Before considering a game complete:

### Code Quality
- [ ] index.html < 100 lines
- [ ] Main game class < 300 lines
- [ ] All config in config.js
- [ ] Manager pattern used for separation
- [ ] Every class has destroy() method
- [ ] Event listeners tracked and cleaned

### Memory Safety
- [ ] No orphaned event listeners
- [ ] Timers cleared in destroy()
- [ ] Audio stopped and dereferenced
- [ ] DOM elements properly removed
- [ ] No circular references

### Mobile
- [ ] Touch targets ≥ 44px
- [ ] Touch/scroll distinction works
- [ ] iOS Safari compatible
- [ ] GPU-accelerated animations

### Performance
- [ ] 60 FPS on target devices
- [ ] No memory leaks over time
- [ ] Assets properly cached

---

## Reference Implementation

**Puzzle Master** is the reference implementation of these best practices:
- `games/puzzle-master/` - Full example
- `docs/development-logs/08-puzzle-master-engineering-excellence.md` - Documentation

---

*All agents should follow these practices for every new game.*
