# Architecture Decision Records (ADR)

## ADR-001: Use Web Audio API for Music Playback

**Status:** Accepted

**Context:**
Need a robust way to play multiple audio tracks simultaneously with precise timing.

**Decision:**
Use Web Audio API instead of HTML5 Audio elements.

**Rationale:**
- Precise timing control
- Multiple simultaneous audio sources
- Low latency
- Fine-grained volume control per track
- Scheduling capabilities
- Better performance

**Consequences:**
- ✅ Perfect synchronization between tracks
- ✅ No audio glitches or delays
- ✅ Can schedule playback precisely
- ❌ Requires user interaction to initialize
- ❌ More complex API than HTML5 Audio

---

## ADR-002: Pre-sliced Audio Blocks vs Real-time Slicing

**Status:** Accepted

**Context:**
Need to provide music blocks from existing music files. Two options:
1. Pre-slice audio files manually
2. Slice programmatically at runtime

**Decision:**
Use AudioBuffer slicing at runtime with configurable start/end times.

**Rationale:**
- Flexible - can adjust slicing without file changes
- Fewer files to manage
- Can experiment with different slice points
- Memory efficient (share source buffers)

**Consequences:**
- ✅ Easy to adjust block boundaries
- ✅ Fewer asset files
- ✅ Can create variations from same source
- ❌ Slight computation at load time
- ❌ Requires accurate timing metadata

---

## ADR-003: Grid-based Timeline vs Free Placement

**Status:** Accepted

**Context:**
Blocks can be placed freely or snapped to a grid.

**Decision:**
Snap to 4-beat grid.

**Rationale:**
- Musical timing (4 beats = 1 bar)
- Easier for kids to align blocks
- Prevents timing issues
- Looks cleaner visually
- Reduces placement errors

**Consequences:**
- ✅ Perfect musical alignment
- ✅ Easier to use
- ✅ Cleaner interface
- ❌ Less flexibility (can't fine-tune placement)
- ❌ All blocks must fit grid

---

## ADR-004: Module System - ES6 Modules

**Status:** Accepted

**Context:**
Need to organize code into reusable components.

**Decision:**
Use ES6 modules with `import`/`export`.

**Rationale:**
- Native browser support
- Clean dependency management
- Better code organization
- No build step required
- Explicit dependencies

**Consequences:**
- ✅ Clean code structure
- ✅ Easy to understand dependencies
- ✅ No bundler needed
- ❌ Requires `type="module"` in script tag
- ❌ Slightly different loading behavior

---

## ADR-005: Drag and Drop API

**Status:** Accepted

**Context:**
Need intuitive way to place blocks on timeline.

**Decision:**
Use native HTML5 Drag and Drop API.

**Rationale:**
- Native browser support
- Familiar user interaction
- Good accessibility
- Works with keyboard
- Standard behavior

**Consequences:**
- ✅ Intuitive UX
- ✅ No external library needed
- ✅ Accessible
- ❌ API can be quirky
- ❌ Mobile support requires touch polyfill

---

## ADR-006: Local Storage for Saves

**Status:** Accepted

**Context:**
Need to save user compositions.

**Decision:**
Use localStorage for client-side persistence.

**Rationale:**
- No server needed
- Instant save/load
- Privacy-friendly
- Simple API
- Always available

**Consequences:**
- ✅ Works offline
- ✅ No server costs
- ✅ User privacy
- ❌ Limited to ~5MB
- ❌ Can't sync across devices
- ❌ Lost if browser data cleared

---

## ADR-007: Block Clone Pattern

**Status:** Accepted

**Context:**
Same block can be placed multiple times on timeline.

**Decision:**
Clone blocks when placing (share AudioBuffer, unique instance).

**Rationale:**
- Memory efficient (share audio data)
- Independent placement
- Can remove individually
- Clear ownership model

**Consequences:**
- ✅ Efficient memory usage
- ✅ Independent instances
- ✅ Easy to remove/move
- ❌ Need careful cloning logic
- ❌ Must track original vs placed

---

## ADR-008: Tempo Fixed at 120 BPM (Phase 1)

**Status:** Accepted (Temporary)

**Context:**
Need consistent timing. Variable tempo adds complexity.

**Decision:**
Fix tempo at 120 BPM for MVP. Add tempo control later.

**Rationale:**
- Simplifies initial implementation
- All blocks work together
- Can add tempo later
- 120 BPM is common tempo

**Consequences:**
- ✅ Simpler implementation
- ✅ All blocks compatible
- ❌ Less flexibility
- ⚠️ Will need refactor for tempo control

---

## ADR-009: 4-Track System

**Status:** Accepted

**Context:**
How many simultaneous tracks to support?

**Decision:**
4 tracks: Drums, Bass, Melody, FX

**Rationale:**
- Enough for rich compositions
- Matches common music structure
- Easy to understand categories
- Fits UI comfortably
- Not overwhelming for kids

**Consequences:**
- ✅ Good balance of simplicity/power
- ✅ Clear categorization
- ✅ Fits on screen
- ❌ Limits complexity
- ❌ Can't have multiple melodies

---

## ADR-010: Maximum Timeline Length (32 Beats)

**Status:** Accepted

**Context:**
Need to limit timeline to prevent performance issues.

**Decision:**
32 beats maximum (~16 seconds at 120 BPM)

**Rationale:**
- Good length for short compositions
- Prevents overwhelming UI
- Performance stays smooth
- Encourages focused creativity
- Can loop for longer playback

**Consequences:**
- ✅ UI remains manageable
- ✅ Good performance
- ✅ Forces concise compositions
- ❌ Can't create long songs
- ❌ May feel limiting for advanced users

---

## Future Considerations

### Potential Future Changes

1. **Tempo Control** - Allow BPM adjustment (80-160 BPM)
2. **More Tracks** - Add optional 5th/6th tracks
3. **Longer Timeline** - Extend to 64 beats
4. **Effects** - Add reverb, delay, filters
5. **MIDI Export** - Export as MIDI file
6. **Waveform Visualization** - Show audio waveforms
7. **Touch Optimization** - Better mobile support
8. **Real-time Recording** - Record live playing

### Technical Debt

- Mobile drag-and-drop needs improvement
- Error handling could be more robust
- Unit tests needed
- Performance profiling for many blocks
- Accessibility improvements (ARIA labels)

---

**Last Updated:** 2025-10-10
