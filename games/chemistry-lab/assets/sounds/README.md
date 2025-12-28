# Chemistry Lab - Sound Assets

This directory contains audio files for the Chemistry Lab game.

## Required Audio Files

### Background Music
- Format: MP3
- Max file size: 500KB per track
- Add files as `music1.mp3`, `music2.mp3`, etc.
- Recommended: 2-3 looping background tracks

### Sound Effects

#### Card Interactions
- `card-drop.mp3` - Card placed in experiment slot (short, soft click)

#### Reactions
- `reaction-red.mp3` - Red explosion sound
- `reaction-blue.mp3` - Blue explosion sound
- `reaction-yellow.mp3` - Yellow explosion sound
- `reaction-purple.mp3` - Purple explosion sound (slightly more intense)
- `reaction-orange.mp3` - Orange explosion sound (slightly more intense)
- `reaction-green.mp3` - Green explosion sound (slightly more intense)
- `reaction-rainbow.mp3` - Rainbow explosion sound (most dramatic)

#### Special Cards
- `catalyst.mp3` - Catalyst activation sound (magical/sparkle effect)
- `stabilizer.mp3` - Stabilizer applied sound (shield/protection effect)

#### Game Events
- `level-complete.mp3` - Level completion celebration sound
- `fail.mp3` - Time up / level failed sound

#### Dangerous Card System (Level 8+)
- `beep.mp3` - Accelerating beep sound for lava warning (short, sharp tone ~0.2s)

## Audio Specifications

### Sound Effects
- Duration: 0.5-2 seconds
- Format: MP3 or OGG
- Sample rate: 44.1kHz or 48kHz
- Bit rate: 128kbps (quality vs size balance)
- Volume: Normalized to -6dB to -3dB peak

### Background Music
- Duration: 30-120 seconds (should loop seamlessly)
- Format: MP3 or OGG
- Sample rate: 44.1kHz
- Bit rate: 96-128kbps (compressed for web)
- Volume: Normalized to -12dB to -9dB peak (quieter than effects)

## Implementation Status

The audio system is fully implemented and will work automatically when audio files are added to this directory. The game includes:

- Background music with random track selection
- Sound effect playback with queue management (max 3 concurrent)
- Volume control and normalization
- User preferences persistence (localStorage)
- Toggle controls for music and sound effects
- Automatic tab visibility handling (pause on hide)

## Adding Audio Files

1. Place audio files in this directory with exact filenames listed above
2. Ensure file sizes are optimized (< 500KB each)
3. Test in browser to verify playback
4. If using background music, update `AudioManager.js` tracks array:

```javascript
tracks: [
  'assets/sounds/music1.mp3',
  'assets/sounds/music2.mp3'
]
```

## Free Audio Resources

- [Freesound.org](https://freesound.org) - Community sound library
- [OpenGameArt.org](https://opengameart.org) - Game music and SFX
- [Zapsplat.com](https://www.zapsplat.com) - Free SFX library
- [Incompetech](https://incompetech.com/music/) - Royalty-free music

Remember to check license requirements and attribute appropriately.
