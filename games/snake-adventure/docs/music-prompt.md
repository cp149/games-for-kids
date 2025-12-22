# Snake Adventure - Background Music Prompt

## AI Music Generation Prompt

### For Suno AI / Udio / Other AI Music Platforms

**Primary Prompt:**
```
Ambient electronic space music, synthwave atmosphere, 120 BPM, loopable game soundtrack,
cosmic ambient pads, retro arcade synths, pulsing bassline, minimal melodic elements,
futuristic soundscape, neon cyberpunk vibes, meditative yet energetic, seamless loop
```

**Extended Prompt:**
```
Create a loopable space-themed background music track for a retro arcade game.
Style: Synthwave meets ambient electronica with cosmic atmosphere.
- Tempo: 120 BPM (moderate energy, allows player focus)
- Instruments: Analog synths, space pads, arpeggiators, subtle bass pulse
- Mood: Futuristic, mysterious, slightly tense but not stressful
- Structure: No dramatic drops or peaks, steady hypnotic groove
- Reference: Stranger Things soundtrack + arcade game music + space ambient
- Key features: Shimmering arpeggios, deep space pads, retro 80s synth bass
- Must be seamless loop (intro = outro)
```

**Short Prompt (for platforms with character limits):**
```
Synthwave space ambient, 120BPM, loopable arcade game music,
retro synths, cosmic pads, neon cyberpunk atmosphere
```

## Style Keywords

**Genre Tags:**
- Synthwave
- Space Ambient
- Electronic
- Chiptune (subtle elements)
- Retrowave
- Cosmic Electronica
- Arcade Game Music

**Mood Tags:**
- Futuristic
- Atmospheric
- Hypnotic
- Mysterious
- Energetic but calm
- Neon-lit
- Deep space

**Instrument Tags:**
- Analog synthesizers
- Arpeggiators
- Space pads
- Sub bass
- Vintage drum machine (subtle)
- FM synths
- Reverb-heavy leads

## Technical Requirements

**Audio Specs:**
- **Duration**: 60-120 seconds (loopable)
- **Format**: MP3 or OGG (web-optimized)
- **Bitrate**: 128-192 kbps (balance quality/size)
- **Sample Rate**: 44.1 kHz
- **Loop Points**: Clean loop (fade in/out or perfect match)
- **Volume**: Normalized, no clipping
- **Dynamic Range**: Moderate (not too compressed)

**Game Integration:**
- Should not interfere with sound effects
- Frequencies: Leave room for UI sounds (avoid harsh high frequencies)
- Energy level: Consistent (no sudden volume changes)
- Repetition tolerance: High (players will hear it hundreds of times)

## Reference Tracks (Inspiration)

**Existing Games:**
- Geometry Dash - "Stereo Madness" (energy level)
- Fez - "Adventure" (ambient quality)
- Hotline Miami - Soundtrack (synthwave style)
- Celeste - "Resurrections" (loopable structure)

**Artists:**
- Com Truise (retro-futuristic synthwave)
- Tycho (ambient electronic)
- Kavinsky (dark synthwave)
- C418 (Minecraft ambient - loop quality)

**Specific References:**
- "Turbo Killer" by Carpenter Brut (energy, minus vocals)
- "Resonance" by HOME (atmosphere)
- "A Real Hero" by College (mood)

## Alternative Approaches

### Option 1: Dual-Track System
**Calm Phase** (Early game, low speed):
- Slower tempo (100 BPM)
- More ambient, less intense
- Deeper space atmosphere

**Intense Phase** (Late game, high speed):
- Faster tempo (140 BPM)
- More driving rhythm
- Higher energy synths

### Option 2: Layered System
**Base Layer** (always playing):
- Deep space pads
- Subtle arpeggio

**Speed-Based Layers** (add progressively):
- Layer 2 (+20 food): Add bassline
- Layer 3 (+50 food): Add lead synth
- Layer 4 (+100 food): Add drums/percussion

### Option 3: Multiple Themes
**Track 1: "Nebula Drift"** - Calm exploration
**Track 2: "Plasma Rush"** - Mid-game intensity
**Track 3: "Hyperdrive"** - Late-game excitement

## Color Palette to Sound Mapping

Based on game visual theme:
- **Deep Space Blue (#0a0e27)** → Deep bass, low pads
- **Electric Blue (#00d4ff)** → Bright arpeggio highlights
- **Cyan/Magenta Gradient** → Synth lead melodies
- **Golden Food (#ffd700)** → Bell-like synth accents
- **Neon Colors** → Sharp, piercing synth stabs

## Mood Board

**Scenario**: Player is a glowing neon snake navigating infinite space, collecting golden orbs,
avoiding electric barriers, competing with AI rivals in a cyberpunk universe.

**Sonic Landscape**:
- Vast emptiness (reverb, space)
- Digital precision (clean synths)
- Retro nostalgia (80s synth tones)
- Futuristic technology (modern production)
- Constant motion (arpeggios, pulse)

## Implementation Notes

Once generated, place music file at:
```
games/snake-adventure/assets/sounds/background-music.mp3
```

Update AudioManager.js to play background music:
```javascript
// In AudioManager constructor
this.backgroundMusic = new Audio('assets/sounds/background-music.mp3');
this.backgroundMusic.loop = true;
this.backgroundMusic.volume = CONFIG.AUDIO.MUSIC_VOLUME;
```

## Testing Checklist

- [ ] Music loops seamlessly (no audible gap)
- [ ] Volume balanced with sound effects
- [ ] Doesn't become annoying after 10+ minutes
- [ ] Matches game's visual aesthetic
- [ ] Energy level appropriate for gameplay
- [ ] File size acceptable (<2MB for web)
- [ ] Works across browsers (MP3 + OGG fallback)
- [ ] Maintains player focus (not too distracting)

## Platform Suggestions

**Free AI Music Tools:**
1. **Suno AI** (suno.ai) - Best quality, free tier available
2. **Udio** (udio.com) - High quality, good for specific styles
3. **AIVA** (aiva.ai) - Good for game music, free tier
4. **Soundraw** (soundraw.io) - Simple, customizable

**Paid Options:**
1. **Epidemic Sound** - Royalty-free library
2. **AudioJungle** - One-time purchase tracks
3. **Artlist** - Subscription service

**Free Libraries (Creative Commons):**
1. **FreeMusicArchive** - Search "synthwave space"
2. **Incompetech** - Kevin MacLeod tracks
3. **OpenGameArt** - Game-specific music

## Example Prompts for Different Platforms

### Suno AI
```
[Verse]
Instrumental synthwave space ambient
Looping arcade game soundtrack
Cosmic pads and retro synths
120 BPM hypnotic groove

[Chorus]
Neon lights in deep space
Arpeggio pulses through the void
Endless journey never ends
Future meets the 80s glow

Style: Synthwave, Space Ambient, Arcade
Mood: Futuristic, Mysterious, Energetic
Instruments: Analog synths, arpeggiators, space pads
```

### AIVA
- Select "Electronic" genre
- Choose "Video Game" category
- Set mood: "Futuristic, Mysterious"
- Tempo: 120 BPM
- Duration: 90 seconds
- Enable "Loop Mode"
- Instrumentation: Heavy on synths, light on percussion

### Manual Prompt (for musicians)
```
Please create a 90-second loopable background track with:
- Genre: Synthwave / Space Ambient
- Tempo: 120 BPM, 4/4 time
- Key: D minor (works well for space themes)
- Instruments: Analog synth pads, arpeggiators, sub bass, minimal drums
- Structure: A-A-A (no verse/chorus, continuous texture)
- Mix: Spacious reverb, slight tape saturation, moderate compression
- Reference: Stranger Things meets retro arcade games
- Must loop perfectly (match end to beginning)
```

---

## Quick Start

**Fastest path to get music:**

1. Go to **Suno.ai**
2. Use this prompt:
   ```
   Loopable synthwave space ambient game music, 120 BPM,
   retro arcade synths, cosmic atmosphere, neon cyberpunk vibes,
   instrumental only, seamless loop
   ```
3. Generate 2-3 variations
4. Download best one
5. Trim to perfect loop (use Audacity if needed)
6. Convert to MP3 + OGG
7. Test in game

---

**Good luck creating an immersive sonic space experience!** 🎵🚀✨
