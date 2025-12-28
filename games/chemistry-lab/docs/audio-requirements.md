# Audio Requirements - Chemistry Lab

## Sound Effects Needed

### Card Interactions
- **card-drop.mp3** (0.2-0.3s)
  - Trigger: When card placed in experiment slot
  - Type: Soft click/drop sound
  - Volume: 0.5

### Reaction Explosions
- **reaction-red.mp3** (0.5-0.8s)
  - Trigger: Red explosion reaction
  - Type: Deep boom
  - Volume: 0.8

- **reaction-blue.mp3** (0.5-0.8s)
  - Trigger: Blue explosion reaction
  - Type: Icy crackle explosion
  - Volume: 0.8

- **reaction-yellow.mp3** (0.5-0.8s)
  - Trigger: Yellow explosion reaction
  - Type: Electric zap explosion
  - Volume: 0.8

- **reaction-purple.mp3** (0.5-0.8s)
  - Trigger: Purple explosion reaction
  - Type: Mystical whoosh explosion
  - Volume: 0.8

- **reaction-orange.mp3** (0.5-0.8s)
  - Trigger: Orange explosion reaction
  - Type: Fiery blast
  - Volume: 0.8

- **reaction-green.mp3** (0.5-0.8s)
  - Trigger: Green explosion reaction
  - Type: Bubbling explosion
  - Volume: 0.8

- **reaction-rainbow.mp3** (1.0-1.5s)
  - Trigger: Rainbow explosion reaction
  - Type: Epic multi-layered explosion
  - Volume: 0.8

### Special Cards
- **catalyst.mp3** (0.3-0.5s)
  - Trigger: Catalyst activated
  - Type: Power-up chime
  - Volume: 0.6

- **stabilizer.mp3** (0.3-0.5s)
  - Trigger: Stabilizer used on card
  - Type: Shield/protective sound
  - Volume: 0.6

### Game Events
- **level-complete.mp3** (1.5-2.0s)
  - Trigger: Level objective completed
  - Type: Victory fanfare
  - Volume: 0.8

- **fail.mp3** (1.0-1.5s)
  - Trigger: Time expired or failed
  - Type: Disappointed/fail sound
  - Volume: 0.7

## Background Music

### Music Tracks (optional)
Located in `assets/sounds/` directory:
- `music1.mp3` - Upbeat chemistry lab theme
- `music2.mp3` - Calm experimental atmosphere
- `music3.mp3` - Energetic puzzle solving

**Features:**
- Random track selection
- Seamless looping
- Volume: 0.3 (30%)
- Auto-pause on tab hidden

## Audio System Architecture

### BackgroundMusicManager (Universal Component)
- Location: `games/lib/background-music.js`
- Features:
  - Random track playback
  - Error handling for missing files
  - Tab visibility auto-pause
  - LocalStorage persistence
  - Graceful degradation

### AudioManager (Game-Specific)
- Location: `js/managers/AudioManager.js`
- Features:
  - Sound effect queue management
  - Maximum 3 concurrent sounds
  - Volume control per sound type
  - Error handling (silent fail)
  - LocalStorage preferences

## Implementation Status

### ✅ Completed
- [x] BackgroundMusicManager integration
- [x] AudioManager implementation
- [x] UI controls (music/sound toggles)
- [x] LocalStorage persistence
- [x] Tab visibility handling
- [x] Sound effect placeholders
- [x] Error handling for missing files

### 📝 Pending
- [ ] Actual audio files creation/sourcing
- [ ] Music track selection
- [ ] Audio file optimization

## Usage Example

```javascript
// Music control
audioManager.toggleMusic(); // Returns new state
audioManager.isMusicEnabled(); // Check state

// Sound effects
audioManager.playCardDrop();
audioManager.playReactionSound('RED_EXPLOSION');
audioManager.playCatalystSound();
audioManager.playLevelComplete();

// Volume control (future)
audioManager.setMusicVolume(0.5);
audioManager.setSoundVolume(0.7);
```

## File Locations

```
assets/sounds/
├── card-drop.mp3
├── reaction-red.mp3
├── reaction-blue.mp3
├── reaction-yellow.mp3
├── reaction-purple.mp3
├── reaction-orange.mp3
├── reaction-green.mp3
├── reaction-rainbow.mp3
├── catalyst.mp3
├── stabilizer.mp3
├── level-complete.mp3
├── fail.mp3
└── music/
    ├── music1.mp3
    ├── music2.mp3
    └── music3.mp3
```

## Testing Without Audio Files

The system is designed to work gracefully without audio files:
- Music manager won't start if no tracks configured
- Sound effects fail silently on error
- UI controls work regardless of file availability
- No console errors for missing files

This allows development and testing before audio assets are available.
