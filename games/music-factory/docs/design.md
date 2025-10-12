# Music Factory - Game Design Document

## Game Overview

**Music Factory** is a music creation game where kids become music producers by dragging and dropping musical building blocks to create their own songs. Think of it as musical LEGO blocks that snap together to make awesome tunes.

## Core Concept

### Tagline
"Build Your Own Music, One Block at a Time!"

### Target Audience
Kids aged 6-12 who love music and creative play

### Core Loop
1. Browse colorful music blocks in library
2. Drag blocks onto timeline tracks
3. Hear blocks play together instantly
4. Rearrange and experiment
5. Share or save creation

## Game Mechanics

### Timeline System

**4 Track Layers:**
- **🥁 Drums Track** (Red/Orange) - Rhythm and beat patterns
- **🎸 Bass Track** (Blue/Purple) - Low-end grooves
- **🎹 Melody Track** (Yellow/Green) - Main tunes
- **✨ FX Track** (Pink/Cyan) - Special sounds and effects

**Timeline Features:**
- Grid-based snap system (4-beat increments)
- Visual beat markers (1, 2, 3, 4, 5...)
- Maximum 16-32 beats per composition
- Looping playback option
- Visual playhead shows current position

### Music Blocks

**Block Properties:**
- **Duration:** 4 beats (1 bar) or 8 beats (2 bars)
- **Category:** Drums, Bass, Melody, FX
- **Mood:** Happy 😊, Energetic 🎉, Calm 😌, Mysterious 🎃
- **Visual:** Colored rectangle with waveform preview
- **Audio:** Pre-sliced audio loop from source music

**Block Interactions:**
- Click to preview (solo)
- Drag from library to timeline
- Drag on timeline to rearrange
- Click X button to remove
- Hover shows glow effect

### Audio Source Strategy

**Phase 1:** Use existing game music files
- Slice into 4-beat and 8-beat loops
- Categorize by instrument/mood
- 15-20 blocks initially

**Source Files:**
- `/games/runner-adventure/assets/sounds/*.mp3`
- `/games/drawing-studio/assets/sound/back*.mp3`

**Audio Processing:**
- Manual slicing at logical points
- Create clean loops (fade in/out if needed)
- Normalize volume levels
- Tag with metadata

### Playback System

**Controls:**
- **Play/Pause Button:** Start/stop playback
- **Stop Button:** Stop and reset to beginning
- **Loop Toggle:** Repeat composition
- **Master Volume:** Overall volume control

**Playback Behavior:**
- All active blocks play simultaneously
- Synchronized to master tempo
- Visual feedback (blocks light up when playing)
- Smooth transitions

## User Interface Design

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  🎵 Music Factory      [Save] [Load] [Clear]   [Play ▶]  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌────────────────────────────────────┐│
│  │ BLOCKS      │  │        TIMELINE                    ││
│  │             │  │                                    ││
│  │ 🥁 Drums    │  │  🥁 [blk][blk]    [blk][blk]     ││
│  │ [blk][blk]  │  │  🎸       [blk][blk]              ││
│  │ [blk][blk]  │  │  🎹 [blk]    [blk][blk]           ││
│  │             │  │  ✨          [blk]                ││
│  │ 🎸 Bass     │  │                                    ││
│  │ [blk][blk]  │  │  ├──┬──┬──┬──┬──┬──┬──┬──┐       ││
│  │             │  │  1  2  3  4  5  6  7  8         ││
│  │ 🎹 Melody   │  │                                    ││
│  │ [blk][blk]  │  │  [Loop] [Vol ▓▓▓▓░░░░]           ││
│  │ [blk][blk]  │  │                                    ││
│  │             │  └────────────────────────────────────┘│
│  │ ✨ FX       │                                         │
│  │ [blk][blk]  │                                         │
│  └─────────────┘                                         │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Visual Style

**Color Scheme:**
- **Drums:** `#FF6B6B` (Bright Red/Coral)
- **Bass:** `#4ECDC4` (Turquoise Blue)
- **Melody:** `#FFE66D` (Sunny Yellow)
- **FX:** `#FF6BCB` (Vibrant Pink)
- **Background:** `#2D3436` (Dark Gray)
- **UI Elements:** `#FFFFFF` (White)

**Visual Effects:**
- Gradient backgrounds on blocks
- Subtle shadow/glow effects
- Smooth animations (200-300ms)
- Pulsing playhead indicator
- Success sparkles on good combos

**Typography:**
- Headers: Bold, rounded font
- Labels: Clear, readable sans-serif
- Icons: Emoji + custom SVG icons

### Animations

**Drag & Drop:**
- Block lifts with scale(1.05) on grab
- Ghost preview shows drop location
- Snap animation when placed
- Bounce effect on successful drop

**Playback:**
- Playhead scrolls smoothly left to right
- Active blocks glow/pulse
- Waveform visualizer in background
- Track meters bounce with audio

**Feedback:**
- Button press animations
- Tooltip on hover
- Success checkmarks
- Error shake animations

## Game Progression

### Phase 1 (MVP)
- Basic 4-track timeline
- 15-20 pre-made blocks
- Drag and drop functionality
- Play/pause/stop controls
- Clear all function

### Phase 2 (Enhancement)
- Save to localStorage (5 slots)
- Load saved compositions
- Block search/filter
- Per-track volume control
- Tempo adjustment slider

### Phase 3 (Advanced)
- Block unlocking system
- Challenge mode (create specific moods)
- Export to audio file (optional)
- Visual themes (factory, space, underwater)
- Achievement badges

## Technical Requirements

### Performance
- 60 FPS UI rendering
- <50ms audio latency
- Smooth drag and drop
- Efficient Web Audio API usage

### Browser Compatibility
- Chrome/Edge (primary)
- Firefox (secondary)
- Safari (if possible)
- Mobile touch support (bonus)

### Audio Specifications
- Sample rate: 44100 Hz
- Format: MP3 (decoded to AudioBuffer)
- Block duration: Exactly 4 or 8 beats
- Volume normalization: -3dB headroom

## User Experience Goals

### Accessibility
- Large touch targets (min 44px)
- High contrast colors
- Clear visual feedback
- Keyboard navigation support
- Screen reader friendly (ARIA labels)

### Learning Curve
- Intuitive drag-and-drop
- Instant audio feedback
- Visual cues everywhere
- No complex controls
- Forgiving (easy undo/clear)

### Fun Factor
- Satisfying sound combinations
- Visual rewards (animations, sparkles)
- Experimentation encouraged
- Quick iteration cycle
- Shareable creations

## Success Metrics

### Engagement
- Average session length: >5 minutes
- Blocks placed per session: >10
- Compositions created: >3
- Return rate: >50%

### Quality
- No audio glitches
- Smooth 60 FPS
- Intuitive first-time use
- Positive user feedback

## Future Ideas

- **Record Mode:** Record live playing
- **Instruments:** Play blocks like piano keys
- **Effects:** Reverb, echo, filters
- **Collaboration:** Multi-user jamming
- **Gallery:** Share and remix others' music
- **Export:** Download as MP3/WAV
- **MIDI Support:** Connect real instruments

## Design Principles

1. **Simple First:** Basic features work perfectly
2. **Visual Feedback:** Every action has reaction
3. **Instant Gratification:** Hear results immediately
4. **Forgiving:** Easy to experiment and undo
5. **Colorful & Fun:** Appealing visual design
6. **Educational:** Learn music concepts naturally

---

**Next Steps:**
1. Create block library from source audio
2. Build timeline UI
3. Implement drag-and-drop
4. Integrate Web Audio API
5. Add playback controls
6. Polish and test
