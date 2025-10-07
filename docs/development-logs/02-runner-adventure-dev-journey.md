# Dev Log 02: POC First + Framework Selection Through Dialogue

**Game**: Runner Adventure - A cartoon-style runner game for kids

**Links**:
- Play: https://cp149.github.io/games-for-kids/games/runner-adventure/index.html
- Source: https://github.com/cp149/games-for-kids/tree/gh-pages

## Choosing KAPLAY: Finding Answers Through Conversation

**Context**: Wanted to build a runner game, but wasn't sure which framework to use.

**Dialogue Process**:
- Me (User): "Want to build a runner game"
- AI: "You could use Phaser, PixiJS, or native Canvas"
- Me: "I heard about KAPLAY, what do you think?"
- AI: "KAPLAY (formerly Kaboom.js) is great for rapid prototyping, simple API"
- Me: "Let's use KAPLAY"

**Result**: First version running in 45 minutes (block player + obstacles + jump).

**Key Finding**: Not about choosing "the best framework", but "the fastest to get started". Through conversation with AI, quickly understand framework positioning and make decisions.

## POC First: Get It Running First

### Version 1 (45 minutes)
- Blocks instead of sprites
- No sound effects
- No particle effects
- Fixed speed
- Playable, but boring

**Goal**: Validate core runner gameplay is feasible.

### Version 2 (Adding combo system)
- Still blocks
- Added combo counter
- Validate "continuous success feels good"

**Goal**: Confirm combo is core gameplay.

### Version 3 (Visual upgrade)
- Add sprites (cartoon style for kids)
- Add particle effects
- Add sound effects

**Goal**: Make game "playable" into "fun".

**Design Choice**: Cartoon graphics and kid-friendly visuals - bright colors, cute characters, no scary elements.

## Refactoring Later: When to Reuse Code

After game was running, found ComboSystem and ScoreManager could be reused.

**Decision Timeline**:
- First extract to `lib/` root (completed in 5 minutes)
- Run game, confirm everything works
- Then refactor directory structure (categorize into subdirectories)
- Finally add tests (ensure refactoring didn't break anything)

**Key**: Not "design perfect structure from start", but "get it running → extract → refactor → test".

## Performance Optimization: Optimize When Problems Appear

**Initial**: Didn't consider performance, added particle effects freely.

**Problem Discovered**: After playing 2 minutes, FPS dropped from 60 to 45.

**Investigation**:
- AI suggested using `console.log("Objects:", k.get("*").length)`
- Found 1200+ objects weren't destroyed

**Fix**:
- Add `lifespan()` for auto-destroy
- Add `offscreen({ destroy: true })` for off-screen destroy
- Destroy coin glows when coins are destroyed

**Lesson**: Don't optimize prematurely. Wait until problem appears (FPS drop), then optimize - you know where the problem is.

## Asset Generation: The Biggest Challenge

### Image Generation Issues

AI image generation tools don't produce ready-to-use images:
- Background image wrong size
- Sprites need background removal
- Multi-frame animations need slicing
- Colors need adjustment

**Solution**: Have AI generate temporary image processing scripts.

**Examples**:
- "This image needs background removal" → AI generates Python script using Pillow
- "Need to arrange 8 animation frames horizontally" → AI generates script to auto-stitch
- "Adjust this image's color tone" → AI generates Canvas code for online preview

**Key**: No need to learn Photoshop, just describe requirements and AI generates one-off scripts to solve it.

### Music Generation: Surprisingly Smooth

Used Jen music to generate background music, 2 minutes generated in one go, quality and looping directly usable.

**Process**:
- Me: "Generate upbeat runner game background music"
- Jen music: 2-minute looping music
- Me: Add directly to game, perfect

**Comparison**: Images need post-processing, music basically ready out of the box.

## Unexpected Harvest: Reusable Code Library

Not only got a game, but also extracted reusable modules:

**Game Systems**:
- `ComboSystem` - Combo counting and multipliers
- `ScoreManager` - Score management and local storage

**Effect Systems**:
- `ParticleEffects` - Particle effects
- `ColorUtils` - Color conversion (HSL/RGB)

**Utility Systems**:
- `SimpleI18n` - Multi-language support
- `AudioUtils` - Sound effect management

**Value**: Next game, just import and use.

## Summary

1. **Framework Selection**: Quickly understand options through dialogue, choose "good enough", not "best"
2. **POC First**: Blocks validate gameplay → add visuals → extract for reuse
3. **Refactoring Timing**: Refactor after features stabilize, not design from start
4. **Performance Optimization**: Optimize when bottleneck found, not preventive optimization
5. **Asset Processing**: Images via AI scripts for post-processing, music mostly ready to use

**Biggest Harvest**:
- A playable game
- A reusable code library (8 modules)
- A collection of image processing scripts (solving various generated image issues)

Key to AI collaboration: **Rapid iteration** - get it running first, ask AI when problems arise, AI provides solutions, verify, continue. Not "plan perfectly from the start".
