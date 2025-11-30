# Game Library - Shared Components

This directory contains reusable components shared across all games.

## Components

### Performance Monitor

Non-intrusive performance monitoring using stats.js.

**Features:**
- 📊 FPS (Frames Per Second)
- ⏱️ MS (Milliseconds per frame)
- 💾 MB (Memory usage)
- 🔧 Auto-enable in development
- 🎨 Customizable position
- 🧹 Clean resource management

**Quick Start:**

1. **Include stats.min.js in HTML:**
```html
<!-- Before your game scripts -->
<script src="../lib/stats.min.js"></script>
```

2. **Import and use in your game:**
```javascript
import { PerformanceMonitor } from '../lib/performance-monitor.js';

class Game {
  constructor() {
    this.perfMonitor = new PerformanceMonitor();
  }

  init() {
    this.perfMonitor.init();
  }

  gameLoop() {
    this.perfMonitor.begin();
    // Your game logic
    this.perfMonitor.end();
    requestAnimationFrame(() => this.gameLoop());
  }

  destroy() {
    this.perfMonitor.destroy();
  }
}
```

**Configuration Options:**

```javascript
new PerformanceMonitor({
  position: 'top-right',  // 'top-left' | 'bottom-right' | 'bottom-left'
  showFPS: true,
  showMS: true,
  showMB: true,
  panelSpacing: 90
});
```

See `games/chain-reaction-lab/src/core/game.js` for complete example.

## File Structure

```
games/lib/
├── README.md                    # This file
├── stats.min.js                 # stats.js library (v0.17.0)
└── performance-monitor.js       # Universal performance monitor
```
