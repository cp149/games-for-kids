# Music Factory

Build your own music, one block at a time! 🎵

## What is Music Factory?

Music Factory is a creative music game where kids become music producers. Just like playing with LEGO blocks, you drag and drop colorful musical blocks onto a timeline to create amazing songs!

## How to Play

### Getting Started

1. **Click "Start Creating"** - This loads all the music blocks
2. **Browse the Block Library** - See all available musical pieces
3. **Drag blocks to the timeline** - Build your song layer by layer
4. **Click Play** - Hear your creation come to life!

### The 4 Music Tracks

Each song has 4 layers:

- **🥁 Drums** (Red) - Beat and rhythm patterns
- **🎸 Bass** (Blue) - Deep groovy sounds
- **🎹 Melody** (Yellow) - Main tunes and melodies
- **✨ Effects** (Pink) - Special sounds and sparkles

### Controls

- **▶ Play/Pause** - Start or pause your music
- **⏹ Stop** - Stop and go back to the beginning
- **🗑 Clear** - Remove all blocks (start fresh)
- **💾 Save** - Save your composition
- **📂 Load** - Load a saved composition
- **Loop** - Repeat your song automatically
- **Volume** - Adjust the loudness

### Tips & Tricks

1. **Click a block** in the library to preview its sound
2. **Drag blocks** from the library to any track
3. **Blocks snap to the grid** for perfect timing
4. **Remove blocks** by clicking the × button
5. **Move blocks** by dragging them on the timeline
6. **Experiment!** There's no wrong way to make music

### Creating Great Music

- **Start with drums** - Build a solid beat first
- **Add bass** - Give it some groove
- **Layer melodies** - Add the main tune
- **Sprinkle effects** - Add special touches
- **Try different combos** - Mix and match blocks
- **Use the mood emojis** - Match blocks by mood

### Block Moods

- 😊 Happy - Cheerful and upbeat
- 🎉 Energetic - Fast and exciting
- 😌 Calm - Peaceful and relaxed
- 🎃 Mysterious - Quirky and unusual

## Features

### Current Features

- ✅ 4-track music timeline
- ✅ Drag and drop music blocks
- ✅ Real-time playback
- ✅ Preview blocks before placing
- ✅ Save/load compositions
- ✅ Loop mode
- ✅ Volume control
- ✅ Auto-save (your work is never lost!)

### Coming Soon

- 🔜 More music blocks
- 🔜 Different music styles (pop, rock, classical)
- 🔜 Challenge mode (create specific moods)
- 🔜 Export to audio file
- 🔜 Share with friends
- 🔜 Visual themes

## Technical Details

### Browser Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- Web Audio API support (all modern browsers)

### Audio Format

- Sample rate: 44100 Hz
- Format: MP3 (decoded to Web Audio)
- Block duration: 4 or 8 beats
- Maximum timeline: 32 beats

### Performance

- Runs at smooth 60 FPS
- Low latency audio playback
- Efficient memory usage
- Works on desktop and tablets

## File Structure

```
music-factory/
├── index.html              # Main game page
├── css/
│   └── styles.css         # All visual styles
├── js/
│   ├── main.js            # Application entry point
│   ├── core/
│   │   ├── GameEngine.js  # Main game logic
│   │   ├── Timeline.js    # Timeline management
│   │   └── BlockLibrary.js # Block library
│   ├── audio/
│   │   ├── AudioEngine.js # Web Audio API wrapper
│   │   └── MusicBlock.js  # Music block class
│   └── ui/
│       ├── DragDropHandler.js # Drag and drop
│       ├── TimelineUI.js     # Timeline rendering
│       └── BlockUI.js        # Block library UI
├── assets/
│   └── sounds/
│       ├── drums/         # Drum loop files
│       ├── bass/          # Bass loop files
│       ├── melody/        # Melody files
│       └── fx/            # Effect sounds
└── docs/
    └── design.md          # Game design document
```

## For Parents & Educators

### Educational Benefits

- **Creativity** - Express yourself through music
- **Pattern Recognition** - Learn about musical structure
- **Cause & Effect** - Immediate audio feedback
- **Experimentation** - Safe space to try ideas
- **Fine Motor Skills** - Drag and drop precision
- **Listening Skills** - Develop musical ear

### Safe & Fun

- No ads or in-app purchases
- No internet connection required (after loading)
- Kid-friendly interface
- No account needed
- Privacy-focused (all saves are local)

## Credits

- **Game Design** - Music Factory Team
- **Development** - Built with Web Audio API
- **Music Blocks** - Created from AI-generated music
- **Icons** - Emoji and custom graphics

## License

Part of the Games for Kids collection.

## Support

If you encounter any issues:

1. Try refreshing the page
2. Clear browser cache
3. Check browser console for errors
4. Make sure your browser supports Web Audio API

---

**Have fun creating amazing music! 🎵✨**
