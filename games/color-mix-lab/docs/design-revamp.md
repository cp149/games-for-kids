# Color Mix Lab - Game Design Document v2.0

## Overview

Color Mix Lab is an educational color mixing game for children ages 5-8. A chameleon character wants to change colors, and players help by mixing primary colors.

**Core Mental Model**: A + B = C (two different colors create a new color)

## Level Structure

### Teaching Phase (Levels 1-3)
Single success required. Each level teaches one color combination.

| Level | Goal | Formula | Sticker | Tutorial |
|-------|------|---------|---------|----------|
| 1 | Make Orange | Red + Yellow | 🍊 Orange | Hand-held guidance |
| 2 | Make Green | Yellow + Blue | 🍀 Leaf | Image hint |
| 3 | Make Purple | Blue + Red | 🍇 Grape | Image hint |

### Mastery Phase (Levels 4-5)
Three successes required. Tests learned combinations.

| Level | Goal | Combinations | Sticker | Tutorial |
|-------|------|--------------|---------|----------|
| 4 | Make Orange & Green | R+Y, Y+B | 🌈 Rainbow | None (hint after 2 fails) |
| 5 | Make Green & Purple | Y+B, B+R | 🦎 Golden Chameleon | None (hint after 2 fails) |

### Free Play Mode
Unlimited mixing without goals. Simple mix-clear cycle.

## Color System

### Primary Colors
- **Red**: #FF6B6B
- **Blue**: #448AFF
- **Yellow**: #FFE66D

### Secondary Colors (Mix Results)
- **Orange**: Red + Yellow → #FF8844
- **Green**: Yellow + Blue → #44DD44
- **Purple**: Blue + Red → #9944FF

### Failure State
- **Mud**: Any invalid combination → #8B6914

## Sticker Collection

| Sticker | Earned At | Emoji |
|---------|-----------|-------|
| Orange | Level 1 Complete | 🍊 |
| Leaf | Level 2 Complete | 🍀 |
| Grape | Level 3 Complete | 🍇 |
| Rainbow | Level 4 Complete | 🌈 |
| Golden Chameleon | Level 5 Complete | 🦎 |

## Tutorial System

### Level 1: Hand-held
- Highlight color balls in sequence
- Show drag arrow animation
- Celebrate on first successful mix

### Levels 2-3: Image Hints
- Show target color combination as image
- Example: Two balls (Yellow + Blue) → Result ball (Green)

### Levels 4-5: Self-directed
- No automatic hints
- After 2 consecutive failures, show subtle reminder

## Chameleon Feedback

| Event | Animation |
|-------|-----------|
| Correct Mix | Happy bounce + color change |
| Wrong Mix (Mud) | Sad shake + disgust expression |
| Level Complete | Celebration dance |

## UI Layout

```
┌─────────────────────────────────────────────┐
│  Color Mix Lab          Level 1    ⚙️      │
├─────────────────────────────────────────────┤
│                                             │
│   [Red]  [Blue]  [Yellow]                   │
│                                             │
│        ┌─────┐ + ┌─────┐                    │
│        │     │   │     │    [Clear]         │
│        └─────┘   └─────┘                    │
│                                             │
│              🦎                              │
│         (Chameleon)                         │
│                                             │
│        Goal: Make 🍊                         │
│        Progress: 0/1                        │
│                                             │
│              [📖 Sticker Book]              │
└─────────────────────────────────────────────┘
```

## Technical Notes

### Removed from v1.0
- Levels 6-8: Same-color effects (burst/splash/flash) - breaks A+B=C mental model
- Levels 9-10: Complex multi-color goals
- Corresponding effect stickers

### Config Structure
```javascript
LEVELS: [
  { id: 1, goal: { type: 'secondary', color: 'orange', count: 1 }, tutorial: 'handheld' },
  { id: 2, goal: { type: 'secondary', color: 'green', count: 1 }, tutorial: 'image' },
  { id: 3, goal: { type: 'secondary', color: 'purple', count: 1 }, tutorial: 'image' },
  { id: 4, goal: { type: 'multiple', colors: ['orange', 'green'], count: 3 }, tutorial: 'none' },
  { id: 5, goal: { type: 'multiple', colors: ['green', 'purple'], count: 3 }, tutorial: 'none' },
],
FREE_MODE: { enabled: true, unlockAfter: 5 }
```

## Success Metrics

- Children can correctly mix all 3 secondary colors after completing levels 1-3
- 80%+ completion rate for teaching levels (1-3)
- 60%+ completion rate for mastery levels (4-5)
- Free play engagement: average 3+ minutes per session
