# Memory Match Game - Design Document

## Game Overview

**Title:** Animal Memory Match
**Target Audience:** Children ages 3-8
**Genre:** Memory/Puzzle
**Platform:** Web (HTML5) - Desktop and Mobile
**Play Time:** 2-5 minutes per game

## Core Concept

A delightful memory matching game where children flip cards to find matching pairs of cute animals. The game is designed to be simple, intuitive, and rewarding for young players while helping develop memory and concentration skills.

## Game Mechanics

### Card System
- **Total Cards:** 12 cards (6 pairs)
- **Animals:** Cat, Dog, Rabbit, Panda, Elephant, Lion
- **Card States:**
  - Face down (default state - shows card back design)
  - Flipping (animated transition)
  - Face up (shows animal)
  - Matched (remains face up, slightly dimmed or marked)
  - Disabled (cannot be clicked)

### Core Game Loop

1. **Game Start**
   - All cards shuffled randomly and placed face down
   - Timer starts at 0:00
   - Move counter starts at 0
   - All cards are clickable

2. **Turn System**
   - Player clicks first card → card flips face up
   - Player clicks second card → card flips face up
   - **If cards match:**
     - Both cards stay face up
     - Cards are marked as "matched" (visual feedback)
     - Celebration animation/sound
     - Cards become non-clickable
     - Move counter increases by 1
     - Player can immediately select next pair
   - **If cards don't match:**
     - Both cards remain visible for 1 second (learning time)
     - Cards flip back to face down
     - Move counter increases by 1
     - Player can select next pair

3. **Game End**
   - When all 6 pairs are matched
   - Timer stops
   - Victory celebration screen appears
   - Shows: Total time, Total moves, Encouraging message

### Interaction Rules

**Click/Tap Behavior:**
- Can only flip 2 cards at a time
- Cannot click already matched cards
- Cannot click the same card twice in one turn
- Cannot click a third card while 2 are already face up
- Large touch targets (minimum 80px × 80px per card)

**Timing:**
- Mismatch reveal time: 1.0 second (allows children to remember)
- Flip animation: 0.3 seconds (smooth but fast)
- Match celebration: 0.5 seconds
- Victory screen delay: 0.5 seconds after last match

## Win Condition

**Victory Achieved When:**
- All 6 pairs have been matched
- No time limit (child-friendly, no pressure)

**Victory Screen Shows:**
- Congratulatory message (i18n supported)
- Final statistics:
  - Time taken (MM:SS format)
  - Number of moves
  - Star rating (optional):
    - ⭐⭐⭐ Excellent: < 15 moves
    - ⭐⭐ Good: 15-20 moves
    - ⭐ Nice Try: > 20 moves
- "Play Again" button (large, prominent)

## Scoring System

### Metrics Tracked
1. **Time:**
   - Starts when game begins
   - Stops when last pair matched
   - Format: MM:SS (e.g., 01:23)
   - Display updates every second

2. **Moves:**
   - Increments each time 2 cards are flipped
   - Even if match fails, counts as 1 move
   - Perfect game: 6 moves (extremely rare)
   - Average game: 12-18 moves

3. **Star Rating (Optional Enhancement):**
   - Visual reward system
   - Not prominent (no pressure)
   - Encourages improvement without stress

### No Penalties
- No score deduction for mistakes
- No time pressure
- Focus on completion and improvement
- Positive reinforcement only

## Child-Friendly UX Patterns

### Visual Feedback
1. **Card Interaction:**
   - Hover effect: Slight lift/glow (desktop)
   - Click feedback: Immediate visual response
   - Clear flip animation
   - Matched cards: Subtle celebration (sparkle/glow)

2. **Clear States:**
   - Obvious difference between face down and face up
   - Matched cards clearly distinguished
   - Disabled cards cannot be clicked (cursor change)

3. **Color Coding:**
   - Bright, cheerful colors
   - High contrast for visibility
   - Colorblind-friendly palette

### Audio Feedback (Optional)
- Card flip sound (soft, pleasant)
- Match success sound (cheerful, rewarding)
- Victory fanfare (celebratory)
- Volume control available
- Can be muted

### Touch Targets
- Card minimum size: 80px × 80px
- Gap between cards: 10-15px minimum
- Buttons: Minimum 60px × 60px
- Touch-friendly on tablets and phones

### Error Prevention
- Prevent clicking during animations
- Prevent clicking matched cards
- Prevent clicking more than 2 cards per turn
- Clear visual indication of clickable vs non-clickable

## Accessibility Features

### For Ages 3-8
1. **Simple Language:**
   - Short, clear instructions
   - Simple words
   - Icon-based UI when possible

2. **Visual Clarity:**
   - Large, clear images
   - High contrast
   - No small text

3. **Forgiving Gameplay:**
   - No time pressure
   - No penalties
   - Can take as long as needed
   - Mistakes are learning opportunities

4. **Motor Skills:**
   - Large touch targets
   - No precise clicking needed
   - No drag-and-drop
   - Simple tap/click only

### Multilingual Support
- Language switcher in corner
- Supported languages:
  - English
  - Chinese (Simplified)
  - Japanese
- All UI text through i18n system
- Flag icons for easy language selection

### Responsive Design
- Works on desktop (mouse)
- Works on tablet (touch)
- Works on mobile (touch)
- Layout adapts to screen size:
  - Desktop: 4 columns × 3 rows
  - Tablet: 3 columns × 4 rows
  - Mobile: 2 columns × 6 rows

## Difficulty Balancing

### Current Difficulty: Easy (Appropriate for Ages 3-8)
- Only 6 pairs (12 cards)
- No time limit
- Cards stay visible for 1 second when wrong
- Visual patterns in animal designs help memory

### Future Difficulty Options (Optional)
- **Easy:** Current settings (ages 3-5)
- **Medium:** 8 pairs, 0.75s reveal time (ages 6-8)
- **Hard:** 10 pairs, 0.5s reveal time (ages 8+)

## Game Flow

```
Start Screen
    ↓
[Start Game Button]
    ↓
Game Board (Cards Face Down)
    ↓
Player Flips Card 1
    ↓
Player Flips Card 2
    ↓
  Match?
   ↙   ↘
 Yes    No
  ↓     ↓
Stay   Flip Back
Face   (1 second)
Up      ↓
  ↓     ↓
All Pairs Matched?
   ↙   ↘
  Yes   No → Continue Playing
   ↓
Victory Screen
   ↓
[Play Again] → Restart
```

## UI Components

### Main Game Screen
1. **Header:**
   - Game title (i18n)
   - Language switcher (flags)
   - Sound toggle

2. **Stats Bar:**
   - Timer display (⏱️ MM:SS)
   - Moves counter (👣 X moves)
   - Large, clear text

3. **Game Board:**
   - 12 cards in grid layout
   - Responsive grid
   - Centered on screen

4. **Footer:**
   - "New Game" button
   - Instructions link (optional)

### Victory Screen (Modal Overlay)
1. **Celebration:**
   - Large "Congratulations!" message
   - Confetti animation (subtle)
   - Star rating display

2. **Statistics:**
   - Time: MM:SS
   - Moves: X
   - Encouraging message based on performance

3. **Actions:**
   - Large "Play Again" button
   - "Close" option

## Visual Theme

### Style: Cute & Colorful
- **Card Back:** Cheerful pattern (stars, dots, or simple design)
- **Animal Cards:** Cute, friendly cartoon animals
- **Background:** Soft gradient or solid pastel color
- **Borders:** Rounded corners (child-friendly)
- **Fonts:** Round, friendly typeface (Comic Sans-style or similar)

### Color Palette
- **Primary:** Bright blue (#4A90E2)
- **Secondary:** Warm yellow (#FFD166)
- **Accent:** Cheerful pink (#FF6B9D)
- **Success:** Fresh green (#06D6A0)
- **Background:** Soft lavender (#F0E6FF)
- **Card Back:** Light gray with pattern (#E8E8E8)

## Technical Considerations

### Performance
- Target: 60 FPS animations
- Optimized CSS transforms for flips
- Hardware acceleration for animations
- Minimal DOM manipulation

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- No IE11 requirement

### Code Structure
- Semantic HTML
- CSS custom properties for theming
- Vanilla JavaScript (no framework needed)
- I18n system for all text
- Modular, clean code structure

## Success Metrics

### Player Experience
- ✅ Game is immediately understandable
- ✅ Children can play without adult help
- ✅ Positive, encouraging feedback
- ✅ No frustration or pressure
- ✅ Replayable and fun

### Technical
- ✅ 60 FPS performance
- ✅ Works on mobile and desktop
- ✅ All text properly internationalized
- ✅ No console errors
- ✅ Clean, maintainable code

### Educational Value
- ✅ Improves memory skills
- ✅ Develops pattern recognition
- ✅ Encourages focus and concentration
- ✅ Builds confidence through success

## Future Enhancements (Optional)

1. **More Themes:**
   - Different animal sets
   - Fruits and vegetables
   - Vehicles
   - Colors and shapes

2. **Difficulty Levels:**
   - Easy/Medium/Hard
   - More pairs for older children

3. **Progress Tracking:**
   - Best time record
   - Best move count
   - Total games played

4. **Achievements:**
   - First victory
   - Perfect game (6 moves)
   - Speed master (under 1 minute)

5. **Multiplayer:**
   - Two-player mode
   - Take turns
   - Compete for most pairs

---

**Design Status:** Complete
**Ready for:** UI/UX Design Phase
**Next Step:** Create visual mockups and asset specifications
