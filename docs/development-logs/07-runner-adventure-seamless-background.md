# Building Free & Safe Games for Kids with Claude Code, Gemini, and JenMusic - Series 7

## Creating Seamless Infinite Backgrounds: A Technical Deep Dive

### The Challenge
Infinite runner games need backgrounds that loop forever without visible seams. But AI-generated images have edges that don't match. Here's how we solved it with a four-tool pipeline.

### Step 1: Generate with Google Imagen 4 Ultra

We used **Google Imagen 4 Ultra** to generate a dinosaur prehistoric world landscape. The prompt focused on horizontal composition (1408x736), consistent lighting from the left, lush prehistoric vegetation, and distant mountains with volcanoes.

The result was stunning - but had one fatal flaw: the left edge and right edge were completely different. Tiling this image would create an obvious vertical seam where the background repeats.

### Step 2: The Half-Swap Technique

The solution is mathematically elegant: **split the image vertically down the middle and swap the two halves**.

Using Python's PIL library, we crop the image into left and right halves, then paste them back in reverse order - the right half becomes the left side, and vice versa.

**Why this works**: After swapping, the original left and right edges (which were different) are now in the CENTER of the image. The new left and right edges are what USED to be adjacent pixels in the middle - they match perfectly because they were neighbors in the original!

When you tile this modified image horizontally, the seams occur where the original middle was - naturally smooth and continuous.

### Step 3: Fix the Center Seam with Nano Banana

The half-swap creates a new problem: a visible seam line in the center where the original mismatched edges now meet.

We fed the image to **Nano Banana**, an AI inpainting model. It intelligently blends the discontinuity while preserving the overall artistic style - prehistoric plants, atmospheric haze, consistent lighting. One pass was enough to make the center seam completely invisible.

### Step 4: Remove Watermarks

AI-generated images often include watermarks or logos in corners. We used a **remove tool** to cleanly extract just the background artwork, leaving a pristine image ready for the game engine.

### Step 5: Implementation in KAPLAY

The seamless background now tiles infinitely in our runner game. We create three copies of the image positioned side-by-side, scrolling left continuously. When one copy exits the left edge of the screen, it jumps to the right end.

Critical technical detail: all position calculations use integer math with rounding. Floating-point positions cause subpixel rendering, which creates visible jitter at the seams - exactly what we worked so hard to eliminate!

### The Result

A dinosaur world that scrolls forever - lush forests, distant volcanoes, and prehistoric atmosphere. Kids run through an infinite prehistoric landscape, never seeing where the background repeats. The seam that caused us so much trouble? Completely invisible.

**The complete pipeline**: Imagen 4 Ultra generates the raw artwork → Python PIL performs the half-swap → Nano Banana inpaints the center seam → Remove tool cleans the watermark → KAPLAY renders the infinite scroll.

Four tools working in sequence. One seamless world.

---
**Play it**: https://cp149.github.io/games-for-kids/games/runner-adventure/index.html
