# Building Free & Safe Games for Kids with Claude Code, Gemini, and JenMusic - Series 10

# Music Factory: Web Audio API in Practice and Timing Programming Lessons

**Date:** 2025-01-27
**Game:** Music Factory
**URL:** https://cp149.github.io/games-for-kids/games/music-factory/index.html
**Core Technologies:** Web Audio API, Timing Programming, TDD

## Game Design: Building-Block Style Music Creation

Music Factory turns kids into music producers. Drag music blocks onto a timeline, freely combine four tracks (drums, bass, melody, effects) with real-time visual feedback. The most interesting feature is intelligent randomization—it doesn't just place blocks randomly, but prioritizes earlier positions, avoids collisions, and aligns to beat grids. Each click generates harmonious music full of surprises.

## Audio Processing: From AI Generation to Game Assets

After JenMusic generates 30-second music clips, they undergo a complete post-processing pipeline: AI audio separation to split into four tracks, beat-aligned segment cutting, fade in/out for seamless loops, normalization for volume balance, and compression for file size control. This is a typical "AI creativity + human refinement" workflow, transforming prototypes into usable resources.

## Technical Challenge: Mastering Web Audio API

Music applications demand extreme timing precision—a few milliseconds of delay can make music sound "off". The core challenge comes from Web Audio API's asynchronous nature. High-precision clocks provide accurate time references, but all audio operations must be scheduled to future time points. This seemingly simple mechanism hides complexity.

## Critical Timing Traps

During development, we encountered three severe timing bugs with striking similarities. The first was premature safety timeout triggers—when audio was scheduled 5 seconds in the future but timeout was set to only 3 seconds, the audio got cleaned up before it even started playing. The issue was considering only playback duration while ignoring the delay until playback begins.

The second and third bugs appeared in loop and stop timing. When resuming playback from the middle of the timeline (e.g., from beat 8), the system incorrectly used total duration instead of remaining duration to calculate timeouts. Music that should play for 32 beats stopped at 8 seconds.

These three bugs revealed the same fundamental issue: **In asynchronous timing systems, you must distinguish between "elapsed time" and "future time"**. This is a seemingly simple but error-prone concept.

## Testing Insights

The deeper lesson from these bugs was test coverage. All existing tests used current time as the schedule time, meaning "immediate playback". This gave us a false sense of security—code passed 106 tests but failed in real scenarios.

The quality review agent's feedback was eye-opening: "Why didn't tests catch this bug?" Because our tests lacked critical scenarios: future scheduling (5 seconds later), mid-resume (from beat 8), long playback (over 1 minute). This prompted us to immediately add edge case tests, increasing coverage to 113 tests.

## TDD Value and Limitations

Music Factory adopted a complete TDD approach. Dependency injection made all components independently testable, Mock Clock made time controllable, and tests became deterministic. These tests provided a safety net for refactoring, allowing confident code modifications.

But TDD isn't a silver bullet. It requires tests to cover real usage scenarios, not just code paths. Our mistake was testing "code runs" without testing "runs correctly under real conditions". Test quality matters more than quantity.

## Architectural Principle Realization

Fixing timing bugs revealed an architectural principle: **In time-handling systems, all time calculations should be relative to explicit time origins**.

We introduced clear time origins: playback start time, accumulated pause time, current playback position. All time calculations are based on relative calculations from these origins. This makes timing logic clear and verifiable, avoiding confusion between "absolute time" and "relative time".

## Profound Lessons

Music Factory development was a profound engineering practice course. It taught us:

1. **Asynchronous timing systems require extremely careful time calculations**. "Now" and "future" must be clearly distinguished.
2. **Tests must cover real scenarios**. 100% code coverage ≠ 100% scenario coverage.
3. **Code review reveals systematic issues**. Three similar bugs exposed blind spots in thinking patterns.
4. **Clear time origins are reliability foundations**. Chaotic time calculations breed bugs.
5. **User feedback is the best test**. When users said "playback stopped at 8 seconds", we realized test blind spots.

When the user said "it works now, so testing is indeed important", we deeply understood the dual meaning: testing matters, but test quality matters more.
