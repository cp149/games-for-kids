# Background Music Manager - Universal Component

Random looping music player with robust error handling for HTML5 games.

## Features

✅ **Random track selection** - Avoids repeating the same track
✅ **Error handling** - Gracefully skips failed files, never crashes
✅ **Autoplay policy handling** - Distinguishes browser blocks from file errors
✅ **Loop prevention** - Prevents infinite retry loops
✅ **Volume control** - Adjustable volume (0.0 to 1.0)
✅ **Zero dependencies** - Pure vanilla JavaScript

## Installation

**HTML (Global Usage)**:
```html
<script src="../lib/background-music.js"></script>
```

**ES6 Module**:
```javascript
import { BackgroundMusicManager } from '../lib/background-music.js';
```

## Basic Usage

```javascript
// Create manager with music tracks
const bgMusic = new BackgroundMusicManager({
  tracks: [
    'assets/sounds/track1.mp3',
    'assets/sounds/track2.mp3',
    'assets/sounds/track3.mp3'
  ],
  volume: 0.3,
  autoStart: false  // Don't start immediately
});

// Start playing
bgMusic.start();

// Stop playing
bgMusic.stop();

// Toggle on/off
const isPlaying = bgMusic.toggle();

// Change volume
bgMusic.setVolume(0.5);

// Cleanup on game end
bgMusic.destroy();
```

## Integration with AudioManager

```javascript
class AudioManager {
  constructor() {
    // Existing SFX code...

    // Add background music
    this.bgMusic = new BackgroundMusicManager({
      tracks: [
        'assets/sounds/1.mp3',
        'assets/sounds/2.mp3',
        'assets/sounds/3.mp3'
      ],
      volume: CONFIG.AUDIO.MUSIC_VOLUME || 0.3,
      logger: window.Logger || console
    });
  }

  startBackgroundMusic() {
    this.bgMusic.start();
  }

  stopBackgroundMusic() {
    this.bgMusic.stop();
  }

  toggleMusic() {
    return this.bgMusic.toggle();
  }

  setMusicVolume(volume) {
    this.bgMusic.setVolume(volume);
  }

  destroy() {
    this.bgMusic.destroy();
    // ... other cleanup
  }
}
```

## API Reference

### Constructor Options

```javascript
{
  tracks: string[],      // Array of music file paths
  volume: number,        // Volume 0.0 to 1.0 (default: 0.3)
  autoStart: boolean,    // Auto-start on creation (default: false)
  logger: object         // Logger instance (default: console)
}
```

### Methods

- `start()` - Start playing background music
- `stop()` - Stop background music
- `toggle()` - Toggle music on/off, returns new state
- `setVolume(volume)` - Set volume (0.0 to 1.0)
- `isEnabled()` - Get current enabled state
- `getCurrentTrack()` - Get info about current track
- `destroy()` - Cleanup all resources

### Error Handling

The component automatically handles:
- **Missing files** - Skips and tries next track
- **All files failed** - Disables music system gracefully
- **Infinite retries** - Stops after `tracks.length * 2` attempts
- **Autoplay blocked** - Logs warning but doesn't disable (browser policy)

## Example: Snake Adventure Integration

```javascript
// Before (in AudioManager.js)
this.backgroundMusicFiles = [...];
this.backgroundMusic = null;
this.currentTrackIndex = -1;
this.failedTracks = new Set();
// ... 100+ lines of music logic

// After
this.bgMusic = new BackgroundMusicManager({
  tracks: [
    'assets/sounds/1.mp3',
    'assets/sounds/2.mp3',
    'assets/sounds/3.mp3',
    'assets/sounds/4.mp3',
    'assets/sounds/5.mp3'
  ],
  volume: CONFIG.AUDIO.MUSIC_VOLUME
});

startBackgroundMusic() {
  this.bgMusic.start();
}
```

**Result**: 100+ lines → 5 lines, with better error handling.

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS/Android)

**Note**: Autoplay policies vary by browser. First user interaction may be required.

## License

MIT - Free for all games in this repository.
