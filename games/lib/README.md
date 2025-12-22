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

### Logger Utility

Structured logging system with environment detection and game-specific namespaces.

**Features:**
- 🎯 Environment detection (development/production)
- 📝 Structured log levels (log, info, warn, error)
- 🎮 Game-specific namespaces
- 🚫 Auto-disable in production builds

**Usage:**
```javascript
// In your game
const Logger = window.Logger; // Access global Logger
Logger.info('🎮 Game initialized');
Logger.log('Player score:', score);
Logger.warn('Low performance detected');
Logger.error('Failed to load asset:', error);
```

See `games/lib/utils/Logger.js` for implementation.

---

### Background Music Manager

Random looping music player with robust error handling.

**Features:**
- 🎵 Random track selection (no repeats)
- ✅ Graceful error handling (skip failed files)
- 🔁 Auto-loop with seamless transitions
- 🔊 Volume control
- 🚫 Infinite retry prevention

**Quick Start:**
```javascript
import { BackgroundMusicManager } from '../lib/background-music.js';

const bgMusic = new BackgroundMusicManager({
  tracks: [
    'assets/sounds/track1.mp3',
    'assets/sounds/track2.mp3',
    'assets/sounds/track3.mp3'
  ],
  volume: 0.3
});

bgMusic.start();  // Start playing
bgMusic.stop();   // Stop playing
bgMusic.toggle(); // Toggle on/off
```

**Integration Example:**
```javascript
class AudioManager {
  constructor() {
    this.bgMusic = new BackgroundMusicManager({
      tracks: ['assets/sounds/1.mp3', 'assets/sounds/2.mp3'],
      volume: CONFIG.AUDIO.MUSIC_VOLUME
    });
  }

  startBackgroundMusic() {
    this.bgMusic.start();
  }
}
```

See `games/lib/background-music-README.md` for full API documentation.

---

## File Structure

```
games/lib/
├── README.md                       # This file
├── stats.min.js                    # stats.js library (v0.17.0)
├── performance-monitor.js          # Universal performance monitor
├── background-music.js             # Background music manager
├── background-music-README.md      # Background music full docs
└── utils/
    └── Logger.js                   # Universal logging utility
```

## Usage Statistics

| Component | Games Using | Latest Integration |
|-----------|-------------|-------------------|
| PerformanceMonitor | 12 games | Snake Adventure |
| Logger | 12 games | Snake Adventure |
| BackgroundMusic | 1 game | Snake Adventure |
