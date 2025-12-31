# Accessibility & Code Standards

Standards for building accessible, cross-platform HTML5 games.

---

## Target Platforms

- **Tablet (iPad/Android)**: Primary target
- **Windows Desktop**: Secondary target

---

## Screen Adaptation

| Platform | Resolution Range | Design Focus |
|----------|-----------------|--------------|
| **Tablet Portrait** | 768×1024 | Main target, vertical layout |
| **Tablet Landscape** | 1024×768 | Horizontal layout |
| **Windows** | 1280×720+ | Desktop layout, finer details |

---

## Component Size Requirements

```css
/* Touch targets >= 44px (Apple HIG) */
.icon-btn { min-width: 44px; min-height: 44px; }

/* Main game interactive elements >= 60px (child-friendly) */
.color-source, .bowl { min-width: 60px; min-height: 60px; }

/* Text size - tablet readable */
.game-text { font-size: clamp(16px, 4vw, 24px); }

/* Spacing - prevent accidental touches */
.interactive-elements { gap: 12px; }
```

---

## CSS Responsive Breakpoints

```css
/* Mobile-first */
.game-container { /* Default tablet portrait layout */ }

/* Tablet landscape / small desktop */
@media (min-width: 1024px) { /* Horizontal layout */ }

/* Large desktop */
@media (min-width: 1440px) { /* Larger components, more space */ }

/* Touch device special handling */
@media (hover: none) and (pointer: coarse) {
  /* Hide hover effects, enlarge touch areas */
}
```

---

## Layout Principles

- **Flexbox/Grid**: Use flexible layouts, avoid fixed pixels
- **Relative Units**: Prefer `vw`, `vh`, `%`, `clamp()`
- **Safe Areas**: Consider tablet notch/rounded corners `env(safe-area-inset-*)`
- **Orientation**: Test both portrait and landscape

---

## Input Support

| Input Type | Events | Notes |
|------------|--------|-------|
| **Touch** | `touchstart/touchmove/touchend` | All interactions must support touch |
| **Mouse** | `mousedown/mousemove/mouseup` | Simultaneous mouse support |
| **Keyboard** | `keydown/keyup` | Focusable elements need `tabindex="0"` |

**Event Pattern**:
```javascript
// Support both touch + mouse
element.addEventListener('mousedown', handler);
element.addEventListener('touchstart', handler, { passive: false });
```

---

## HTML Accessibility

```html
<!-- Decorative elements -->
<div class="background" aria-hidden="true">...</div>

<!-- Interactive elements -->
<div class="draggable" role="button" tabindex="0" aria-label="Red Color - Drag to bowl">

<!-- Status regions -->
<div class="progress" role="status" aria-label="Progress: 2 of 3">
```

**Required Attributes**:
| Element Type | Required |
|--------------|----------|
| Decorative | `aria-hidden="true"` |
| Interactive | `role`, `tabindex="0"`, `aria-label` |
| Status | `role="status"`, `aria-label` |

---

## Dual-Export Pattern (Required)

All classes must support both browser and Node.js testing:

```javascript
class GameClass {
  constructor() {
    // initialization
  }

  destroy() {
    // cleanup - REQUIRED
  }
}

// Dual export
if (typeof module !== 'undefined') module.exports = GameClass;
if (typeof window !== 'undefined') window.GameClass = GameClass;
```

**Key Points**:
- Every class must have a `destroy()` method for cleanup
- Export to both `module.exports` (Node.js) and `window` (browser)
- Enables unit testing with Jest/Mocha without browser

---

## File Structure

```
games/[game]/
├── index.html
├── package.json        # npm test script
├── docs/spec.md        # Acceptance criteria
├── js/
│   ├── config.js       # All magic numbers here
│   ├── managers/       # UIManager, DragManager, etc.
│   ├── systems/        # MixingSystem, etc.
│   └── [Game]Game.js   # Main game class (<300 lines)
├── tests/*.test.js     # Unit tests
├── css/styles.css
└── assets/
    ├── images/
    └── sounds/
```

**File Limits**:
| File Type | Max Lines |
|-----------|-----------|
| Main game class | 300 |
| Any JS file | 550 |

---

## JIT Asset Generation (Development Flow)

**Core Principle**: Verify mechanics are fun BEFORE investing in art.

```
Stage 1: Color Blocks (Placeholder)
├── All elements use solid color shapes
├── CSS: background-color + border
├── Goal: Verify core mechanics are fun
└── Pass criteria: Playwright test + human confirms "fun"

Stage 2: Basic Assets (Simple)
├── Replace key elements with simple graphics
├── SVG or CSS gradients/shadows
├── Goal: Verify visual style direction
└── Pass criteria: Human confirms "looks right"

Stage 3: Final Assets (Production)
├── Generate full assets only for verified mechanics
├── AI-generated or human-designed
├── Goal: Final visual polish
└── Pass criteria: Visual Regression baseline established
```

**Benefits**:
- 🚀 Fast iteration: Don't wait for art, verify gameplay first
- 💰 Save resources: Only invest art in "fun" mechanics
- 🎯 Focus on core: Forces attention on gameplay
- 🔄 Easy to change: Color block stage has minimal change cost
