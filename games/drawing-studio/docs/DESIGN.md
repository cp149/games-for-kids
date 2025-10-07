# Drawing Studio - Game Design Document

## Game Overview

**Title**: Magic Art Studio  
**Genre**: Creative Drawing/Painting Game  
**Platform**: Web Browser (HTML5 Canvas)  
**Target Audience**: Children aged 3-14+ (multi-age design)  
**Technology**: Native HTML5 Canvas 2D API, Pure JavaScript  

## Core Concept

A progressive drawing and painting game that grows with the player. Three distinct modes cater to different age groups and skill levels, each offering age-appropriate tools and creative freedom.

### Design Philosophy

1. **Progressive Complexity**: Start simple, unlock complexity as skills develop
2. **Instant Gratification**: Immediate visual feedback, no "wrong" way to create
3. **Encouraging Environment**: Celebrate every creation with stars and animations
4. **Low Floor, High Ceiling**: Easy to start, room to master
5. **Mobile-First**: Touch-friendly for tablets and phones

---

## Game Modes

### Mode 1: Coloring Book (Ages 3-6)
**"Paint the Picture"**

**Core Mechanic**: Click/tap to fill outlined areas with color

**Features**:
- **Pre-made Templates**: 20+ outlined drawings (animals, vehicles, nature)
- **Bucket Fill Tool**: Tap any outlined area to fill with selected color
- **Simple Color Palette**: 12 bright, primary colors
- **No Mistakes**: Can re-color areas unlimited times
- **Auto-Save**: Every action saved automatically
- **Celebration**: Sparkles and "Great job!" when coloring areas

**UI Design**:
- **Large Buttons**: 60x60px minimum for tiny fingers
- **Visual Feedback**: Button press animations, sound effects
- **Template Gallery**: Big preview thumbnails (120x120px)
- **Color Selector**: Large color squares (50x50px each)

**Progression**:
- Start with 5 simple templates (3-5 areas each)
- Unlock new templates by completing previous ones
- Earn stars: 1 star for any completion, 3 stars for using 5+ colors
- Gallery shows all completed artwork

**Success Criteria**:
- Child can select template within 5 seconds
- Filling one area feels immediately rewarding
- No frustration from accidental taps

---

### Mode 2: Painting Studio (Ages 7-10)
**"Create Your Art"**

**Core Mechanic**: Draw with brush on blank canvas or simple templates

**Features**:
- **Blank Canvas**: 800x600px white canvas
- **Template Option**: Faint outline guides (optional)
- **Drawing Tools**:
  - Brush (smooth, pressure-simulated)
  - Eraser
  - Bucket fill
- **Color Picker**: 24-color palette + custom color selector
- **Brush Sizes**: 3 sizes (Small 5px, Medium 15px, Large 30px)
- **Undo/Redo**: Last 20 actions
- **Clear Canvas**: Start over button with confirmation

**UI Design**:
- **Tool Palette**: Left sidebar with icon buttons
- **Color Palette**: Bottom bar, scrollable on mobile
- **Canvas**: Centered, responsive sizing
- **Controls**: Undo/Redo buttons top-right
- **Save Button**: Prominent "Save to Gallery"

**Progression**:
- Start with brush + 12 colors
- Complete 3 drawings → unlock eraser
- Complete 5 drawings → unlock bucket fill
- Complete 10 drawings → unlock custom color picker
- Earn achievements: "First Masterpiece", "Color Explorer" (use 10+ colors), "Persistent Artist" (20+ actions in one piece)

**Success Criteria**:
- Drawing feels smooth and responsive (60 FPS)
- Undo/Redo works instantly
- Colors are vibrant and accurate
- Save/load is reliable

---

### Mode 3: Art Studio (Ages 11+)
**"Master Creator"**

**Core Mechanic**: Professional-style drawing with advanced tools

**Features**:
- **Advanced Drawing Tools**:
  - Pencil (textured strokes)
  - Brush (smooth)
  - Spray paint (particle effect)
  - Shapes (circle, square, line, star)
  - Text tool
- **Layer System**: Up to 5 layers with visibility toggle
- **Advanced Controls**:
  - Opacity slider (0-100%)
  - Brush hardness
  - Symmetry mode (mirror drawing)
- **Color System**:
  - Full RGB color picker
  - HSL sliders
  - Recent colors palette
  - Eyedropper tool
- **Canvas Features**:
  - Grid overlay (toggleable)
  - Zoom in/out (50%-200%)
  - Pan canvas when zoomed
- **Export Options**:
  - Save as PNG
  - Save to gallery
  - Print preview

**UI Design**:
- **Professional Layout**: Tool palette left, properties right, canvas center
- **Keyboard Shortcuts**: B=brush, E=eraser, Ctrl+Z=undo, etc.
- **Layer Panel**: Right sidebar with layer thumbnails
- **Contextual Menus**: Right-click for quick options
- **Status Bar**: Current tool, canvas size, zoom level

**Progression**:
- All tools unlocked from start (for older kids)
- Achievements focus on mastery:
  - "Layer Master" (use 3+ layers)
  - "Symmetry Artist" (complete drawing with symmetry)
  - "Detail Expert" (1000+ brush strokes in one piece)
  - "Color Theory" (use complementary colors)
- Weekly challenges: "Draw a portrait", "Pixel art", "Abstract scene"
- Community gallery (if implemented): share and view others' art

**Success Criteria**:
- Tools feel professional and responsive
- Layer system works without bugs
- Export produces high-quality images
- Keyboard shortcuts speed up workflow

---

## Universal Features (All Modes)

### Gallery System
- **View All Artwork**: Scrollable grid of saved pieces
- **Sorting**: By date, by stars, by favorites
- **Actions**: View, edit, delete, share
- **Auto-Thumbnails**: Generate 200x150px previews

### Rewards & Feedback

**Visual Feedback**:
- **Star Bursts**: When completing artwork
- **Confetti**: For unlocking new tools/templates
- **Color Splash**: When using new colors
- **Smooth Animations**: Tool selections, page transitions

**Audio Feedback**:
- **Gentle Sounds**: Soft "pop" for color selection
- **Whoosh**: Brush strokes (optional, can disable)
- **Celebration**: Cheerful chime for achievements
- **Toggle**: Sound on/off in settings

**Encouragement System**:
- **Random Compliments**: "Beautiful colors!", "So creative!", "Amazing work!"
- **Progress Messages**: "5 artworks created! You're an artist!"
- **No Negative Feedback**: Never "wrong" or "bad"

### Settings
- **Sound**: On/Off toggle
- **Hand Mode**: Left-handed / Right-handed (flips UI)
- **Auto-Save**: Frequency control (every 30s, 1min, 5min)
- **Canvas Size**: Small (600x400), Medium (800x600), Large (1200x800)
- **Theme**: Light mode (default), Dark mode (for older kids)

---

## Visual Theme & Art Direction

### Color Palette (UI)

**Primary Colors**:
- Background: `#FFF9E6` (Warm cream)
- Primary Action: `#FF6B9D` (Cheerful pink)
- Secondary Action: `#4ECDC4` (Teal)
- Success: `#95E1D3` (Mint green)
- Warning: `#FFD93D` (Sunny yellow)

**Canvas Colors**:
- Default Canvas: `#FFFFFF` (Pure white)
- Grid Lines: `#E0E0E0` (Light gray)
- Selection: `#FF6B9D` with 50% opacity

### Typography

**Headings**: Fredoka One (playful, rounded, Google Fonts)  
**Body Text**: Nunito (friendly, legible, Google Fonts)  
**Sizes**: 
- H1: 32px
- H2: 24px
- Body: 16px
- Buttons: 18px (bold)

### UI Components

**Buttons**:
- **Rounded Corners**: 12px border-radius
- **Shadow**: Soft drop shadow on hover
- **Active State**: Slight scale up (1.05x) + brighter color
- **Disabled**: 50% opacity, no hover effect

**Icons**:
- **Style**: Outlined icons with 3px stroke
- **Size**: 32x32px for tools, 24x24px for actions
- **Color**: Dark gray (#333) on light backgrounds

**Canvas Frame**:
- **Border**: 4px solid #E0E0E0
- **Shadow**: `0 4px 12px rgba(0,0,0,0.1)`
- **Corner**: Slight rounded (4px)

---

## User Flow

### First Launch
1. **Welcome Screen**: "Welcome to Magic Art Studio!"
2. **Mode Selection**: "Choose your adventure!" (3 big cards)
3. **Quick Tutorial**: 3-step intro for selected mode
   - Mode 1: "Tap a color, tap an area!"
   - Mode 2: "Pick a brush, draw freely!"
   - Mode 3: "Explore tools, create masterpieces!"
4. **Start Creating**: Jump directly into first canvas

### Typical Session (Mode 2 Example)
1. **Launch**: See gallery of previous work
2. **New Artwork**: Tap "New Drawing" button
3. **Choose Template**: Blank or guided outline
4. **Create**: Draw with tools
5. **Save**: Auto-save every 30s, manual save to gallery
6. **Celebrate**: Star animation, "Saved to gallery!"
7. **Continue**: "Draw another?" or "View Gallery"

### Returning User
1. **Gallery**: Show latest artwork + "Create New" button
2. **Continue**: Resume last artwork OR start fresh
3. **Achievements**: Notification if new achievement unlocked

---

## Accessibility

### Motor Accessibility
- **Large Touch Targets**: Minimum 48x48px
- **Adjustable Tool Sizes**: Accommodate different motor skills
- **Undo/Redo**: Forgiving for mistakes
- **Stabilization**: Optional stroke smoothing for shaky hands

### Visual Accessibility
- **High Contrast Mode**: Black outlines, bold colors
- **Colorblind Modes**: Labeled colors (not just visual)
- **Zoom**: Text and UI scale with browser zoom
- **Clear Icons**: Recognizable symbols with tooltips

### Cognitive Accessibility
- **Simple Language**: Short, clear instructions
- **Visual Instructions**: Icons + text
- **Consistent Layout**: Same button positions across modes
- **No Time Pressure**: Create at your own pace

---

## Technical Constraints

### Performance Targets
- **Frame Rate**: 60 FPS during drawing
- **Load Time**: < 2s for app start
- **Save Time**: < 500ms for auto-save
- **Canvas Size**: Max 2000x2000px (prevent memory issues)

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Android 90+
- **Canvas API**: 2D context only (no WebGL required)

### Storage
- **LocalStorage**: Use for settings and artwork metadata
- **IndexedDB**: Store canvas ImageData for larger artworks
- **Limits**: Max 50 saved artworks (prompt to delete old ones)

---

## Monetization (Future Consideration)

### Free Tier
- All three modes available
- 20 templates in Mode 1
- Save up to 10 artworks
- Core tools unlocked through play

### Premium (Optional)
- 100+ templates
- Unlimited saved artworks
- Export high-res PNG/SVG
- Exclusive tools (gradients, filters)
- Weekly template packs
- Ad-free experience

**Note**: Free tier should feel complete and generous. Premium is for power users.

---

## Success Metrics

### Engagement
- **Session Length**: Average 10+ minutes per session
- **Return Rate**: 60% of users return within 7 days
- **Artwork Created**: Average 3+ pieces per user

### Quality
- **Completion Rate**: 80%+ of started artworks are saved
- **Tool Usage**: Users try 70%+ of available tools
- **Mode Progression**: 40% of users try multiple modes

### Technical
- **Performance**: 95%+ of sessions maintain 60 FPS
- **Crash Rate**: < 0.1% of sessions
- **Save Success**: 99.9%+ of saves succeed

---

## Future Enhancements (Post-Launch)

### Phase 2 Features
- **Animation Mode**: Create frame-by-frame animations (5-10 frames)
- **Stickers & Stamps**: Pre-made graphics to add to artwork
- **Filters**: Blur, sharpen, sepia, black & white
- **Patterns**: Fill areas with patterns (stripes, dots, gradients)

### Phase 3 Features
- **Collaboration**: Invite a friend to draw together (real-time)
- **Challenges**: Daily/weekly creative prompts
- **Community**: Share to public gallery, like others' work
- **Tutorials**: Step-by-step guided drawing lessons

### Phase 4 Features
- **AI Assistant**: "Make this into a cartoon" style filters
- **3D Mode**: Simple 3D object painting
- **Print Service**: Order physical prints of artwork
- **Portfolio**: Create shareable link to your gallery

---

## Conclusion

Magic Art Studio is designed to be a **safe, encouraging, and progressively complex** creative space for children of all ages. By separating modes by age group, we ensure appropriate challenges while maintaining a unified, polished experience.

The **POC-first approach** will validate core mechanics (drawing, saving, feedback) before expanding to advanced features. This ensures we build on a solid, tested foundation.

**Next Steps**: Proceed to FEATURES.md for detailed tool specifications, then TECHNICAL.md for implementation architecture.
