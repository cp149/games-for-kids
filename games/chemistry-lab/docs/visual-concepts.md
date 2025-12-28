# Chemistry Lab - Visual Concepts

## Card Designs

### Basic Reagent Cards (L1-3)

**Red Fire Reagent**
- Background: Bright red (#FF3333)
- Icon: Stylized flame (large, centered)
- Border: Glowing orange (#FF6600)
- Size: 100x140px
- Style: Rounded corners (10px), subtle inner shadow
- Animation: Flicker effect on hover

**Blue Water Reagent**
- Background: Bright blue (#3366FF)
- Icon: Water droplet with ripples
- Border: Glowing cyan (#00CCFF)
- Style: Same card template as red
- Animation: Gentle wave motion on hover

**Yellow Energy Reagent**
- Background: Bright yellow (#FFCC00)
- Icon: Lightning bolt with sparkles
- Border: Glowing white (#FFFF99)
- Style: Same card template
- Animation: Electric pulse on hover

**Green Nature Reagent**
- Background: Bright green (#33CC33)
- Icon: Leaf/sprout
- Border: Glowing lime (#99FF99)
- Style: Same card template
- Animation: Grow/shrink on hover

### Special Cards (L4+)

**Gold Catalyst Card**
- Background: Metallic gold gradient
- Icon: Star with radiating sparkles
- Border: Bright gold glow (#FFD700)
- Badge: "Reusable" icon (small corner)
- Animation: Constant gentle glow

**Purple Combo Reagent**
- Background: Purple gradient (#9933FF to #CC66FF)
- Icon: Swirl/question mark
- Border: Mysterious purple glow
- Animation: Rotating subtle effect

**Time Stabilizer**
- Background: Silver/chrome
- Icon: Hourglass
- Border: Blue glow
- Animation: Sand falling effect

**Shield Stabilizer**
- Background: Silver/chrome
- Icon: Shield
- Border: Green glow
- Animation: Shimmer effect

## Experiment Table Designs

### Basic Table (L1-3)
```
┌───────────────────┐
│                   │
│   [Single Slot]   │
│                   │
└───────────────────┘
```
- White lab surface
- Single card slot (120x160px to fit card with spacing)
- Dashed border when empty
- Glowing border when filled

### Advanced Table (L10+)
```
┌─────────────────────────┐
│  [Slot] [Slot] [Slot]   │
│  [Slot] [Slot] [Slot]   │
│  [Slot] [Slot] [Slot]   │
└─────────────────────────┘
```
- 3x3 grid layout
- Each slot: 120x160px with 10px spacing
- Visual connections showing valid combinations
- Highlighted slots for current action

## UI Elements

### Mix Button
- Shape: Large circle (100px diameter)
- Color: Bright green (#33CC33)
- Icon: Bubbling flask
- Text: "MIX!" (large, white)
- States:
  - Default: Green with subtle pulse
  - Hover: Brighter green, larger pulse
  - Active: Pressed inward (scale 0.95)
  - Disabled: Gray, no pulse
- Position: Center bottom, above card hand

### Progress Bar
- Style: Horizontal bar, rounded ends
- Fill: Gradient (green to gold)
- Background: Light gray
- Height: 20px
- Shows: Star collection progress per world

### Star Display
- Icons: Gold star (3D effect)
- Layout: 3 stars, left-to-right fill
- States:
  - Earned: Full gold, sparkle animation
  - Unearned: Gray outline
  - Current: Pulsing

### Level Indicator
- Style: Circular badge
- Content: "L[number]"
- Color: Changes per world (theme color)
- Position: Top-left corner

## Reaction Animations

### Perfect Match (3 stars)
- Duration: 1000ms
- Effect: Explosion of gold stars from center
- Particles: 20-30 stars radiating outward
- Sound: Triumphant chime
- Screen: Brief flash of white

### Good Match (2 stars)
- Duration: 500ms
- Effect: Radial glow expanding
- Color: Silver/white
- Sound: Positive bell
- Screen: Gentle pulse

### Acceptable Match (1 star)
- Duration: 300ms
- Effect: Small pop with sparkles
- Color: Bronze
- Sound: Soft pop
- Screen: No change

### Failed Match (0 stars)
- Duration: 400ms
- Effect: Smoke cloud rising
- Color: Dark gray
- Sound: Fizzle/pop
- Screen: Slight shake

## Drag & Drop Visual Feedback

### Card States
**Idle**: Resting in hand, subtle bounce
**Hover**: Lift effect (translateY: -5px), shadow grows
**Dragging**: Follow cursor, 80% opacity, enlarged (scale: 1.1)
**Valid Drop**: Slot glows green, card snaps to center
**Invalid Drop**: Card returns to hand (elastic animation)

### Drop Zones
**Empty Slot**: Dashed border, faint inner glow
**Hovered (Valid)**: Solid green border, bright glow
**Hovered (Invalid)**: Red border, shake animation
**Filled Slot**: Card seated, glow fades

## Color Palette

### Primary Colors (Reagents)
- Red: #FF3333
- Blue: #3366FF
- Yellow: #FFCC00
- Green: #33CC33
- Purple: #9933FF

### Special Colors
- Gold: #FFD700 (catalysts)
- Silver: #C0C0C0 (stabilizers)
- White: #FFFFFF (backgrounds)
- Black: #1A1A1A (text)

### Feedback Colors
- Success: #00FF00 (bright green)
- Warning: #FFAA00 (orange)
- Error: #FF0000 (red)
- Info: #00CCFF (cyan)

## Typography

### Font Choices (Web-safe)
- Primary: "Comic Sans MS", "Chalkboard", cursive (kid-friendly)
- Secondary: "Arial Rounded MT Bold", sans-serif
- Fallback: system-ui, sans-serif

### Font Sizes
- Title: 48px (level start screen)
- Score: 32px (top bar)
- Button: 24px (mix button)
- Level: 20px (level indicator)

### Text Colors
- Primary: #1A1A1A (dark gray, readable)
- Accent: #FFCC00 (yellow, highlights)
- Success: #33CC33 (green)
- Error: #FF3333 (red)

## Layout Specifications

### Mobile (320px - 768px)
```
┌─────────────────┐
│ [L] [★★★] [Pts] │ 60px header
├─────────────────┤
│                 │
│  Experiment     │ 40% height
│  Table          │
│                 │
├─────────────────┤
│   [Mix Btn]     │ 80px
├─────────────────┤
│ [C][C][C][C]    │ 180px
│ Card Hand       │ (scrollable)
└─────────────────┘
```

### Desktop (769px+)
```
┌───────────────────────────┐
│ [Level] [★★★] [Score]     │ 80px header
├───────────────────────────┤
│                           │
│    Experiment Table       │ 50% height
│    (centered, larger)     │
│                           │
├───────────────────────────┤
│       [Mix Button]        │ 100px
├───────────────────────────┤
│  [Card] [Card] [Card]...  │ 200px
│       (centered row)       │
└───────────────────────────┘
```

## Animation Specifications

### Timing Functions
- Ease-out: Default for most animations
- Ease-in-out: Drag and drop
- Spring: Card bounces, button presses
- Linear: Loading spinners

### Durations
- Micro: 100ms (hover states)
- Short: 300ms (transitions)
- Medium: 500ms (reactions)
- Long: 1000ms (celebrations)

### Key Animations
1. **Card Flip** (unlock new card): 600ms, rotateY 0→180
2. **Level Complete**: 2000ms, multi-stage celebration
3. **Star Earn**: 400ms per star, sequential delay
4. **Particle Burst**: 800ms, opacity 1→0, translateY -100px

## Accessibility Considerations

### Visual
- High contrast mode support
- Colorblind-friendly icons (not just color-coded)
- Large touch targets (min 44x44px)
- Clear visual hierarchy

### Audio
- Visual-only mode (mute option)
- Haptic feedback on mobile
- Screen reader compatible (ARIA labels)

### Interaction
- Keyboard navigation support
- Drag alternative (click-to-select, click-to-place)
- Undo button for mistakes
- Adjustable speed settings

---

**Status**: Ready for asset creation
**Next**: Generate actual assets based on these specs
