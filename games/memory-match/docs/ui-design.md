# Memory Match Game - UI/UX Design Document

## Design Philosophy

Create a warm, inviting, and child-friendly interface that delights young players (ages 3-8) while maintaining clarity and usability.

## Visual Design System

### Color Palette

**Primary Colors:**
```css
--primary-blue: #4A90E2;      /* Main interactive elements */
--primary-yellow: #FFD166;    /* Highlights and accents */
--primary-pink: #FF6B9D;      /* Secondary accents */
--success-green: #06D6A0;     /* Match success */
--background: #F0E6FF;        /* Soft lavender background */
```

**Card Colors:**
```css
--card-back: #E8E8E8;         /* Card back base */
--card-border: #FFFFFF;       /* Card borders */
--card-shadow: rgba(0,0,0,0.1); /* Soft shadows */
--card-matched: rgba(6, 214, 160, 0.2); /* Matched highlight */
```

**Text Colors:**
```css
--text-dark: #2C3E50;         /* Primary text */
--text-light: #FFFFFF;        /* Light text on dark backgrounds */
--text-muted: #7F8C8D;        /* Secondary text */
```

### Typography

**Font Family:**
```css
font-family: 'Fredoka One', 'Comic Sans MS', 'Chalkboard SE', cursive;
```
- Fallback to system fonts for compatibility
- Round, friendly, and child-appropriate

**Font Sizes:**
```css
--text-xl: 48px;     /* Game title */
--text-lg: 32px;     /* Victory message */
--text-md: 24px;     /* Stats, buttons */
--text-sm: 18px;     /* Instructions */
```

**Font Weights:**
- Headers: Bold (700)
- Body: Regular (400)
- Stats: Medium (500)

### Spacing & Layout

**Grid System:**
```css
--card-size: 120px;           /* Desktop card size */
--card-gap: 15px;             /* Gap between cards */
--board-padding: 20px;        /* Board container padding */
--section-spacing: 30px;      /* Space between sections */
```

**Border Radius:**
```css
--radius-sm: 8px;             /* Small elements */
--radius-md: 12px;            /* Cards */
--radius-lg: 20px;            /* Modals, containers */
--radius-xl: 30px;            /* Large buttons */
```

**Shadows:**
```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
--shadow-md: 0 4px 12px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.2);
--shadow-card: 0 4px 8px rgba(0,0,0,0.12);
```

## Layout Design

### Desktop Layout (>= 768px)

```
┌─────────────────────────────────────────────┐
│  [🎮 Animal Memory Match]    [🇺🇸 EN ▼] [🔊] │  Header
├─────────────────────────────────────────────┤
│                                             │
│   ⏱️ Time: 01:23    👣 Moves: 12           │  Stats Bar
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐                │
│   │ 🐱 │ │ ? │ │ 🐶 │ │ ? │                │
│   └───┘ └───┘ └───┘ └───┘                │
│                                             │  Game Board
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐                │  (4×3 Grid)
│   │ ? │ │ 🐰 │ │ ? │ │ 🐼 │                │
│   └───┘ └───┘ └───┘ └───┘                │
│                                             │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐                │
│   │ ? │ │ 🐘 │ │ ? │ │ 🦁 │                │
│   └───┘ └───┘ └───┘ └───┘                │
│                                             │
├─────────────────────────────────────────────┤
│          [New Game] [How to Play]           │  Footer
└─────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)

```
┌───────────────────┐
│ [🎮 Memory Match] │
│     [EN ▼] [🔊]   │
├───────────────────┤
│ ⏱️ 01:23 👣 12    │
├───────────────────┤
│                   │
│  ┌────┐ ┌────┐   │
│  │ 🐱  │ │ ?  │   │
│  └────┘ └────┘   │
│                   │
│  ┌────┐ ┌────┐   │
│  │ ?  │ │ 🐶  │   │
│  └────┘ └────┘   │
│                   │  2×6 Grid
│  ┌────┐ ┌────┐   │  (Mobile)
│  │ ?  │ │ 🐰  │   │
│  └────┘ └────┘   │
│                   │
│     [continues]   │
│                   │
├───────────────────┤
│   [New Game]      │
└───────────────────┘
```

## Component Design

### 1. Header Component

**Desktop:**
```
┌─────────────────────────────────────────┐
│ 🎮 Animal Memory Match    [EN ▼] [🔊]   │
└─────────────────────────────────────────┘
```

**Elements:**
- Game title (left): Large, colorful text
- Language selector (right): Flag dropdown
- Sound toggle (right): Icon button

**Specifications:**
- Height: 80px
- Background: Linear gradient (light to slightly darker)
- Text: --text-xl, bold
- Padding: 20px

### 2. Stats Bar Component

**Layout:**
```
┌─────────────────────────────────────────┐
│   ⏱️ Time: 01:23      👣 Moves: 12      │
└─────────────────────────────────────────┘
```

**Elements:**
- Timer (left): Clock icon + MM:SS format
- Moves counter (right): Footprint icon + number

**Specifications:**
- Height: 60px
- Background: White with subtle shadow
- Border-radius: --radius-md
- Font-size: --text-md
- Icons: 28px
- Padding: 15px 30px

### 3. Card Component

**Card Back (Face Down):**
```
┌─────────────────┐
│                 │
│    ✨ 🌟 ✨     │
│  🌟  ?  🌟     │
│    ✨ 🌟 ✨     │
│                 │
└─────────────────┘
```

**Card Front (Face Up):**
```
┌─────────────────┐
│                 │
│                 │
│       🐱        │
│                 │
│                 │
└─────────────────┘
```

**Specifications:**
- Size: 120px × 120px (desktop), 100px × 100px (mobile)
- Border: 3px solid white
- Border-radius: --radius-md
- Background: Linear gradient (light to white)
- Shadow: --shadow-card
- Transition: transform 0.3s ease

**States:**
- **Default:** Subtle hover lift (translateY(-2px))
- **Hover:** Slight scale (1.05), increased shadow
- **Flipping:** 3D rotate animation
- **Matched:** Green glow, reduced opacity (0.7)
- **Disabled:** Cursor not-allowed, no hover

### 4. Victory Modal

**Layout:**
```
┌───────────────────────────────────────┐
│  ╔════════════════════════════════╗  │
│  ║                                ║  │
│  ║      🎉 Congratulations! 🎉    ║  │
│  ║                                ║  │
│  ║      You found all pairs!      ║  │
│  ║                                ║  │
│  ║      ⭐ ⭐ ⭐                   ║  │
│  ║                                ║  │
│  ║    ⏱️ Time: 01:23             ║  │
│  ║    👣 Moves: 12                ║  │
│  ║                                ║  │
│  ║    Great job! Well done!       ║  │
│  ║                                ║  │
│  ║      [🎮 Play Again]           ║  │
│  ║                                ║  │
│  ╚════════════════════════════════╝  │
└───────────────────────────────────────┘
```

**Specifications:**
- Width: 400px (max 90vw)
- Background: White
- Border-radius: --radius-lg
- Padding: 40px
- Shadow: --shadow-lg
- Backdrop: rgba(0,0,0,0.5) blur

**Elements:**
- Title: --text-lg, colorful gradient text
- Stars: 48px, animated entrance
- Stats: --text-md, with icons
- Message: --text-sm, encouraging
- Button: Large (60px height), primary color

### 5. Language Selector

**Closed State:**
```
┌──────────┐
│ 🇺🇸 EN ▼ │
└──────────┘
```

**Open State:**
```
┌──────────┐
│ 🇺🇸 EN ▼ │
├──────────┤
│ 🇺🇸 English │
│ 🇨🇳 中文    │
│ 🇯🇵 日本語   │
└──────────┘
```

**Specifications:**
- Button size: 100px × 40px
- Border-radius: --radius-lg
- Background: White
- Dropdown: Absolute positioned
- Flags: 20px × 20px
- Hover: Slight background color change

### 6. Button Styles

**Primary Button (New Game, Play Again):**
```css
background: linear-gradient(135deg, #4A90E2, #357ABD);
color: white;
padding: 15px 40px;
border-radius: 30px;
font-size: 24px;
box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
transition: all 0.3s ease;

/* Hover */
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(74, 144, 226, 0.4);
```

**Secondary Button (How to Play):**
```css
background: transparent;
color: #4A90E2;
border: 2px solid #4A90E2;
padding: 12px 30px;
border-radius: 25px;
font-size: 18px;

/* Hover */
background: rgba(74, 144, 226, 0.1);
```

**Icon Button (Sound Toggle):**
```css
width: 50px;
height: 50px;
border-radius: 50%;
background: white;
box-shadow: 0 2px 8px rgba(0,0,0,0.1);

/* Icon size */
font-size: 24px;
```

## Animation Design

### Card Flip Animation

```css
@keyframes flipCard {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(180deg);
  }
}

/* Duration: 0.3s */
/* Timing: ease-in-out */
```

### Match Success Animation

```css
@keyframes matchSuccess {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(6, 214, 160, 0.7);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 20px rgba(6, 214, 160, 0);
  }
}

/* Duration: 0.5s */
```

### Victory Confetti (Subtle)

```css
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* Multiple colored particles */
/* Staggered animation delays */
```

### Hover Lift Effect

```css
@keyframes hoverLift {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-4px);
  }
}

/* Duration: 0.2s */
```

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Small phones */
@media (max-width: 360px) {
  --card-size: 80px;
  --card-gap: 8px;
  --text-md: 18px;
}

/* Large phones */
@media (min-width: 361px) and (max-width: 767px) {
  --card-size: 100px;
  --card-gap: 10px;
}

/* Tablets */
@media (min-width: 768px) and (max-width: 1023px) {
  --card-size: 110px;
  --card-gap: 12px;
  /* 3×4 grid layout */
}

/* Desktop */
@media (min-width: 1024px) {
  --card-size: 120px;
  --card-gap: 15px;
  /* 4×3 grid layout */
}

/* Large desktop */
@media (min-width: 1440px) {
  --card-size: 140px;
  --card-gap: 20px;
}
```

## Accessibility Design

### Visual Accessibility
- **High Contrast:** Minimum 4.5:1 text contrast ratio
- **Large Targets:** Minimum 80px × 80px touch targets
- **Clear Focus:** Visible focus indicators (3px blue outline)
- **Color Independence:** Don't rely solely on color for information

### Motor Accessibility
- **No Precision Required:** Large, forgiving click areas
- **No Time Pressure:** No time limits
- **Simple Interactions:** Tap only, no drag/swipe
- **Generous Spacing:** Easy to avoid accidental clicks

### Cognitive Accessibility
- **Clear Labels:** Icons with text labels
- **Simple Language:** Short, clear instructions
- **Consistent Layout:** Predictable element positions
- **Visual Feedback:** Immediate response to all actions

### ARIA Labels
```html
<button aria-label="Flip card to reveal animal">
<div role="timer" aria-live="polite">Time: 01:23</div>
<div role="status" aria-live="polite">Moves: 12</div>
```

## Interactive States

### Card Interactive States

1. **Face Down (Default)**
   - Background: Card back pattern
   - Cursor: pointer
   - Hover: Slight lift + shadow increase

2. **Flipping**
   - Animation: 3D rotate
   - Cursor: not-allowed
   - No interaction during flip

3. **Face Up (Revealed)**
   - Shows animal image
   - Cursor: not-allowed (if part of current pair)
   - Waiting for second card selection

4. **Matched**
   - Green glow effect
   - Opacity: 0.7
   - Cursor: not-allowed
   - Celebration pulse animation

5. **Disabled**
   - Already matched
   - Cursor: not-allowed
   - No hover effects

## Asset Specifications

### Animal Card Images
- **Format:** PNG with transparency
- **Size:** 200px × 200px (will scale down)
- **Style:** Cute cartoon animals, friendly faces
- **Colors:** Bright, vibrant, child-friendly
- **Background:** Transparent
- **Details:** Simple, clear, recognizable

**Animals needed:**
1. 🐱 Cat - Orange tabby, smiling
2. 🐶 Dog - Golden retriever, happy
3. 🐰 Rabbit - White with pink ears, cute
4. 🐼 Panda - Black and white, cheerful
5. 🐘 Elephant - Gray, friendly trunk
6. 🦁 Lion - Yellow mane, gentle face

### Card Back Pattern
- **Format:** PNG or CSS pattern
- **Size:** 200px × 200px
- **Design:** Stars/sparkles pattern
- **Colors:** Light gray background, colorful stars
- **Style:** Cheerful, child-friendly

### Icons Needed
- ⏱️ Timer icon (24px)
- 👣 Moves icon (24px)
- 🔊 Sound on (24px)
- 🔇 Sound off (24px)
- ⭐ Star rating (48px)
- 🎮 Game icon (32px)

## User Flow Design

### First Time Player

1. **Landing:** See game title and colorful board
2. **Instruction:** Optional "How to Play" tooltip
3. **Start:** Click any card to begin
4. **Learn:** First match attempt shows mechanic
5. **Play:** Continue matching pairs
6. **Victory:** Celebration screen with stats
7. **Replay:** Easy "Play Again" button

### Return Player

1. **Immediate Play:** Click "New Game" to start
2. **Quick Flow:** Familiar with mechanics
3. **Focus on Improvement:** Try to beat previous score

## Error States

### No Matches Yet
- Default state, no special handling
- Encouraging UI keeps player motivated

### Taking Long Time
- No penalty, no warnings
- Positive UI regardless of time

### Many Moves
- No negative feedback
- Always encouraging messages

## Multilingual Considerations

### Text Expansion
- **Chinese:** Generally shorter than English
- **Japanese:** May be longer than English
- **Design:** Allow 30% text expansion space

### Font Support
- **English:** Standard web fonts
- **Chinese:** Include CJK font fallback
- **Japanese:** Include CJK font fallback

### RTL Support
- Not needed for current languages
- Layout is symmetrical (works for future RTL)

## Performance Optimizations

### Image Optimization
- Use CSS for card backs when possible
- Lazy load images (not needed for 12 cards)
- Optimize PNG files (under 50KB each)

### Animation Performance
- Use CSS transforms (GPU accelerated)
- Avoid layout thrashing
- Use `will-change` for animated elements

### Code Optimization
- Minimal DOM queries
- Event delegation for card clicks
- Debounce/throttle unnecessary updates

---

**Design Status:** Complete
**Asset Requirements:** Documented
**Next Step:** Generate animal card images using image_helper.py
