# Chemistry Lab - Game Design Document

## 🎯 Game Concept

**Title**: Chemistry Lab
**Genre**: Educational Puzzle/Card Game
**Target Audience**: Children aged 6-10
**Platform**: Browser (HTML5)
**Core Experience**: Playful experimentation with visual chemistry reactions

### Vision Statement
"Make every child feel like a magical scientist by creating colorful, exciting chemical reactions through intuitive drag-and-drop gameplay."

---

## 🎮 Core Gameplay Loop

### Primary Loop (Per Level)
1. **Observe** → View target reaction/goal (visual only, no text)
2. **Select** → Drag reagent cards from hand to experiment table
3. **Combine** → Press "Mix" button to trigger reaction
4. **React** → Watch animated reaction (success/fail feedback)
5. **Progress** → Earn stars, unlock next level

### Meta Loop (Across Levels)
- Unlock new reagent types
- Discover new reaction combinations
- Earn equipment upgrades (visual lab improvements)
- Collect achievement badges

---

## 🧪 Core Mechanics

### 1. Reagent Card System

**Card Types by Level Range**:

**L1-3: Basic Reagents** (4 types)
- 🔴 Red Reagent (Fire element)
- 🔵 Blue Reagent (Water element)
- 🟡 Yellow Reagent (Energy element)
- 🟢 Green Reagent (Nature element)

**L4-6: Catalysts** (2 types)
- ⚡ Spark Catalyst (reusable, +50% score, glows)
- 🌟 Star Catalyst (reusable, +100% score on perfect matches)

**L7-9: Stabilizers** (2 types)
- ⏱️ Time Stabilizer (prevents card expiration by +10 seconds)
- 🛡️ Shield Stabilizer (protects one failed experiment)

**L10-15: Advanced Reagents** (3 types)
- 🟣 Purple Reagent (Combo element - matches with any 2)
- ⚫ Black Reagent (Mystery element - random effect)
- ⚪ White Reagent (Pure element - doubles next reaction)

**L16-20: Modifier Cards** (3 types)
- 🔄 Reversal Card (swaps reagent positions)
- 2️⃣ Doubler Card (creates copy of any reagent)
- ❌ Neutralizer Card (removes unwanted reagent)

**L21-25: Special Mechanics** (2 types)
- 🎯 Precision Cards (must drag to exact spots)
- 🔗 Chain Cards (must be used in sequence)

**L26-30: Master Level Cards** (2 types)
- 🌈 Rainbow Reagent (creates any reaction)
- 💎 Crystal Catalyst (permanent effect for entire level)

### 2. Experiment Table System

**L1-3: Single Slot Table**
- 1 reagent → 1 result
- Immediate feedback
- Tutorial guidance (visual arrows)

**L4-6: Double Slot Table**
- 2 reagents + optional catalyst → 1 result
- Catalyst stays on table (reusable)
- Combinations matter (Red + Blue ≠ Blue + Red)

**L7-9: Triple Slot Table**
- 3 reagents + optional stabilizer → 1 result
- Time pressure introduced (15 second timer per card)
- Stabilizer extends time

**L10-15: Grid Table (2x2)**
- 4 slots, multiple reaction paths
- Diagonal and adjacent combinations
- Chain reactions possible

**L16-20: Grid Table (3x3)**
- 9 slots, complex patterns
- Spatial puzzle element
- Multiple reactions per mix

**L21-25: Dynamic Table**
- Slots rotate/move
- Timing challenge added
- Pattern recognition required

**L26-30: Master Laboratory**
- 12 slots (3x4 grid)
- Multi-step reactions
- Resource management (limited reagents)

### 3. Reaction System

**Reaction Types**:
- **Perfect Match** (exact target): 3 stars, +100 points, sparkle animation
- **Good Match** (1 off target): 2 stars, +50 points, glow animation
- **Acceptable** (2 off target): 1 star, +25 points, small pop
- **Failed** (wrong): 0 stars, -10 points, smoke cloud

**Visual Feedback** (no text):
- ✨ Sparkles = Perfect
- 💫 Glow = Good
- 💨 Pop = Acceptable
- ☁️ Smoke = Failed

### 4. Progression Mechanics

**Star System**:
- 3 stars: Unlock next level + bonus reagent
- 2 stars: Unlock next level
- 1 star: Retry or continue (choose)
- 0 stars: Must retry

**Unlock Progression**:
- L1-3: Basic reagents unlocked progressively
- L4: Spark Catalyst unlocked
- L5: Star Catalyst unlocked
- L7: Time Stabilizer unlocked
- L8: Shield Stabilizer unlocked
- L10: Purple Reagent unlocked
- ...continues through L30

---

## 📊 Level Design - All 30 Levels

### World 1: Discovery Lab (L1-3)
**Theme**: Tutorial, basic reactions
**Objective**: Learn drag, drop, mix

**L1**: "First Experiment"
- Goal: Mix 1 red reagent
- Cards: 3 red cards provided
- Difficulty: Tutorial (cannot fail)
- Stars: Auto 3-star on completion

**L2**: "Color Matching"
- Goal: Match target color (blue)
- Cards: 2 blue, 2 red mixed in hand
- Difficulty: Easy pattern recognition
- Stars: Based on attempts (1st try = 3 stars)

**L3**: "Double Reaction"
- Goal: Create 2 reactions (red, then blue)
- Cards: 3 red, 3 blue
- Difficulty: Sequence understanding
- Time: No timer

---

### World 2: Catalyst Chamber (L4-6)
**Theme**: Introduction to catalysts
**Objective**: Reusable cards, score boosting

**L4**: "Spark It Up"
- Goal: Use spark catalyst once
- Cards: 1 spark catalyst, 3 red reagents
- Mechanic: Catalyst stays on table
- Stars: 3 = use catalyst all 3 times

**L5**: "Star Power"
- Goal: Perfect match with star catalyst
- Cards: 1 star catalyst, 4 reagents (mixed colors)
- Difficulty: Must find exact match for 2x score
- Stars: 3 = perfect on first try

**L6**: "Catalyst Master"
- Goal: Mix 5 reactions with both catalysts
- Cards: Both catalysts, 8 reagents
- Challenge: Choose correct catalyst per reaction
- Time: 60 seconds total

---

### World 3: Stabilizer Station (L7-9)
**Theme**: Time management
**Objective**: Prevent card expiration

**L7**: "Race Against Time"
- Goal: 3 reactions in 45 seconds
- Cards: 6 reagents (expire after 15s each)
- Mechanic: Time stabilizer introduced
- Stars: 3 = finish with 20+ seconds remaining

**L8**: "Shield Test"
- Goal: Complete 4 reactions, 1 can fail
- Cards: 1 shield stabilizer, 8 reagents
- Challenge: Harder combinations, safety net
- Stars: 3 = no shield used

**L9**: "Time Trial Master"
- Goal: 6 reactions in 90 seconds
- Cards: Both stabilizers, 12 reagents
- Difficulty: Fast-paced, strategic stabilizer use
- Stars: Based on completion time

---

### World 4: Advanced Alchemy (L10-15)
**Theme**: Complex combinations
**Objective**: Multi-reagent mastery

**L10**: "Purple Mystery"
- Goal: Use purple reagent in 3 combos
- Cards: 1 purple, 6 other reagents
- Mechanic: Purple matches any 2 cards
- Challenge: Find optimal combinations

**L11**: "Black Magic"
- Goal: Control chaos with black reagent
- Cards: 2 black (random effect), 6 normal
- Risk/Reward: Black can help or hinder
- Stars: 3 = all black reactions beneficial

**L12**: "Pure Energy"
- Goal: White reagent combo chains
- Cards: 2 white, 8 reagents
- Mechanic: White doubles next reaction
- Strategy: Plan doubling moments

**L13-15**: Progressive difficulty increase
- Grid patterns introduced
- Multiple simultaneous reactions
- Resource scarcity (limited cards)

---

### World 5: Modifier Mayhem (L16-20)
**Theme**: Strategic manipulation
**Objective**: Advanced card control

**L16**: "Reversal Tactics"
- Goal: Fix 3 wrong combinations with reversal
- Cards: Reversal cards, pre-placed wrong reagents
- Puzzle: Spatial reasoning

**L17**: "Double Trouble"
- Goal: Use doubler to create scarce reagent
- Cards: Doubler cards, incomplete reagent sets
- Strategy: Maximize doubler value

**L18**: "Neutralize Chaos"
- Goal: Remove bad reagents to isolate good ones
- Cards: Neutralizer, mixed good/bad reagents
- Challenge: Identify which to keep

**L19-20**: Combination challenges
- All modifiers available
- Complex multi-step solutions
- Timed precision

---

### World 6: Precision Lab (L21-25)
**Theme**: Accuracy and timing
**Objective**: Perfect execution

**L21**: "Bullseye Challenge"
- Goal: Place precision cards in exact spots
- Mechanic: Grid with marked targets
- Difficulty: Pixel-perfect drag required

**L22**: "Chain Lightning"
- Goal: Use chain cards in exact sequence
- Cards: 5 chain cards (numbered visually)
- Fail: Wrong order = restart sequence

**L23-25**: Master precision levels
- Rotating table challenges
- Moving targets
- Combination of all previous mechanics

---

### World 7: Master Laboratory (L26-30)
**Theme**: Ultimate challenge
**Objective**: Mastery of all systems

**L26**: "Rainbow Revolution"
- Goal: Rainbow reagent creates any reaction
- Cards: 1 rainbow, complex targets
- Freedom: Player chooses optimal use

**L27**: "Crystal Power"
- Goal: Crystal catalyst affects entire level
- Cards: 1 crystal, 15 reagents
- Strategy: Long-term planning

**L28**: "The Grand Experiment"
- Goal: 10 perfect reactions
- Cards: All card types available
- Difficulty: Master level complexity

**L29**: "Speed Synthesis"
- Goal: 15 reactions in 120 seconds
- Challenge: Maximum speed + accuracy
- Stars: 3 = sub-90 seconds

**L30**: "Ultimate Chemistry"
- Goal: Custom puzzle (changes daily?)
- Cards: Random from all types
- Reward: Master Chemist badge
- Replayability: Endless mode unlocked

---

## 🎨 Visual Design Requirements

### Color Palette
- **Primary**: Bright, saturated colors (kid-friendly)
- **Reagent Colors**: Pure RGB + secondary colors
- **UI**: White/light gray background, dark text
- **Feedback**: Gold (perfect), silver (good), bronze (ok)

### Card Design
- **Size**: 100x140px (scaled for mobile)
- **Touch Target**: 44x44px minimum
- **Visual Elements**:
  - Large central icon (no text labels)
  - Color-coded borders
  - Glow effects for special cards
  - Drag affordance (subtle shadow)

### Animations
- **Drag**: Card lifts, shadow grows
- **Drop**: Snap to grid, bounce effect
- **Reaction**:
  - Perfect: Explosion of stars (500ms)
  - Good: Radial glow (300ms)
  - Fail: Smoke puff (200ms)
- **Unlock**: Card flip reveal (1s)

### UI Layout
```
┌─────────────────────────────┐
│  [Level] [Stars] [Score]    │ Top bar
├─────────────────────────────┤
│                             │
│    EXPERIMENT TABLE         │ Center (drag target)
│    [Grid/Slots]            │
│                             │
├─────────────────────────────┤
│  [Card] [Card] [Card]...   │ Hand (bottom)
│                             │
└─────────────────────────────┘
```

---

## 🏆 Win/Loss Conditions

### Per-Level Win Conditions
- **L1-10**: Complete target reactions
- **L11-20**: Complete + time/accuracy thresholds
- **L21-30**: Complete + perfect execution requirements

### Star Ratings
- **3 Stars**: Perfect execution (varies by level)
- **2 Stars**: Good execution (minor mistakes)
- **1 Star**: Minimum completion
- **0 Stars**: Failure (retry required)

### Loss Conditions
- Failed all attempts (3 tries per level)
- Time expired (timed levels only)
- Shield broken + failed reaction (L8+)

---

## 🔄 Replayability Mechanics

### Intrinsic Replayability
1. **Star Collection**: Replay for 3-star perfection
2. **Score Chasing**: Beat personal best
3. **Time Trials**: Speedrun mode (L6+)
4. **Achievement Hunting**: 30+ achievement badges

### Extrinsic Replayability
1. **Daily Challenge**: Random L30-style puzzle
2. **Endless Mode**: Unlocked after L30
3. **Card Collection**: Unlock all card variants (cosmetic)
4. **Lab Upgrades**: Visual customization rewards

### Progression Hooks
- Visual lab evolution (equipment appears as you progress)
- Reagent compendium (collection book)
- Star total unlocks (100 stars = special reward)
- Mastery badges (complete all L1-10, etc.)

---

## 📈 Difficulty Curve

### Pacing Strategy
- **L1-3**: Very Easy (100% completion expected)
- **L4-6**: Easy (introduce single mechanic)
- **L7-9**: Medium (combine 2 mechanics)
- **L10-15**: Medium-Hard (all basic mechanics)
- **L16-20**: Hard (strategic thinking required)
- **L21-25**: Very Hard (precision + strategy)
- **L26-30**: Expert (mastery demonstration)

### Tutorialization
- **No text tutorials**: Visual-only guidance
- **Progressive disclosure**: One mechanic per world
- **Forced success**: L1 cannot fail (builds confidence)
- **Scaffolding**: Each level builds on previous

---

## 🎯 Success Metrics

### Core Metrics
- **Completion Rate**: 70%+ reach L10
- **Engagement**: 15+ min average session
- **Retention**: 40%+ return next day
- **Star Collection**: 50%+ earn 2+ stars/level

### Quality Metrics
- **Performance**: Solid 60 FPS
- **Load Time**: <2s initial load
- **Touch Accuracy**: 95%+ successful drags
- **Clarity**: 90%+ understand without text

---

## 🛠️ Technical Requirements

### Architecture (BEST_PRACTICES.md)
- index.html < 100 lines
- Manager pattern: UIManager, AudioManager, GameManager, CardManager
- config.js for all constants
- destroy() methods for all classes
- Event listener cleanup via Map

### File Structure
```
chemistry-lab/
├── index.html          (< 100 lines)
├── js/
│   ├── main.js         (initialization only)
│   ├── config.js       (all constants)
│   ├── classes/
│   │   └── ChemistryGame.js  (< 300 lines)
│   ├── managers/
│   │   ├── UIManager.js
│   │   ├── AudioManager.js
│   │   ├── CardManager.js
│   │   ├── LevelManager.js
│   │   └── ReactionManager.js
│   └── utils/
│       ├── DragDropHandler.js
│       └── AnimationEngine.js
├── css/
│   └── styles.css
├── assets/
│   ├── images/
│   └── sounds/
└── docs/
    └── design.md (this file)
```

### Performance Targets
- 60 FPS sustained
- <50ms input latency
- <100MB memory footprint
- Mobile-optimized (44px touch targets)

---

## 📝 Next Steps

### Immediate (Phase 2)
2. Create visual style guide
3. Design animation specifications

### Implementation (Phase 3)
1. Build core drag-drop system
2. Implement reaction engine
3. Create level progression system
4. Integrate audio/visual feedback

### Polish (Phase 5)
1. Juice all interactions
2. Mobile optimization pass
3. Accessibility audit
4. Performance profiling

---

**Document Version**: 1.0
**Last Updated**: 2025-12-27
**Status**: Ready for visual design phase
