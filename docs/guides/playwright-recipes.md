# Playwright Testing Recipes

Code templates for automated browser testing using Playwright MCP.

**Prerequisite**: Local server running at `http://localhost:8000`

---

## 1. Responsive Layout Testing

```javascript
// Navigate to game
mcp__playwright__browser_navigate({ url: "http://localhost:8000/games/[game]/" })

// Tablet Portrait (768×1024)
mcp__playwright__browser_resize({ width: 768, height: 1024 })
mcp__playwright__browser_take_screenshot({ filename: "claudedocs/tablet-portrait.png" })

// Tablet Landscape (1024×768)
mcp__playwright__browser_resize({ width: 1024, height: 768 })
mcp__playwright__browser_take_screenshot({ filename: "claudedocs/tablet-landscape.png" })

// Windows Desktop (1280×720)
mcp__playwright__browser_resize({ width: 1280, height: 720 })
mcp__playwright__browser_take_screenshot({ filename: "claudedocs/windows-desktop.png" })
```

---

## 2. DOM Structure Validation

```javascript
// Get accessibility tree snapshot
mcp__playwright__browser_snapshot()

// Check specific element existence
mcp__playwright__browser_evaluate({ function: `() => {
  return {
    hasGameContainer: !!document.querySelector('.game-container'),
    hasColorBalls: document.querySelectorAll('.color-ball').length,
    hasMixingZone: !!document.querySelector('.mixing-zone')
  };
}` })
```

---

## 3. CSS Property Validation

```javascript
mcp__playwright__browser_evaluate({ function: `() => {
  const el = document.querySelector('.interactive-element');
  const styles = window.getComputedStyle(el);
  return {
    width: parseFloat(styles.width),
    height: parseFloat(styles.height),
    minTouchTarget: parseFloat(styles.width) >= 44,
    fontSize: styles.fontSize,
    backgroundColor: styles.backgroundColor
  };
}` })
```

---

## 4. Console Error Checking

```javascript
// Get all error-level console messages
mcp__playwright__browser_console_messages({ level: "error" })

// Get all messages including warnings
mcp__playwright__browser_console_messages({ level: "warning" })
```

---

## 5. Visual Regression Testing

```javascript
// First run: Save as baseline
mcp__playwright__browser_take_screenshot({
  filename: "claudedocs/baselines/desktop-baseline.png"
})

// Subsequent runs: Save as current
mcp__playwright__browser_take_screenshot({
  filename: "claudedocs/current/desktop-current.png"
})

// Comparison methods:
// - Simple: Manual visual comparison baseline vs current
// - Advanced: Use pixelmatch or similar tools for automated diff
```

**Directory Structure**:
```
claudedocs/
├── baselines/          # Reference screenshots (first run)
│   ├── desktop-baseline.png
│   ├── tablet-portrait-baseline.png
│   └── tablet-landscape-baseline.png
└── current/            # Current screenshots (subsequent runs)
    ├── desktop-current.png
    ├── tablet-portrait-current.png
    └── tablet-landscape-current.png
```

---

## 6. Accessibility Linter (axe-core)

```javascript
mcp__playwright__browser_evaluate({ function: `async () => {
  // Dynamically load axe-core
  if (!window.axe) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.3/axe.min.js';
    document.head.appendChild(script);
    await new Promise(resolve => script.onload = resolve);
  }

  // Run accessibility audit
  const results = await axe.run();
  return {
    violations: results.violations.map(v => ({
      id: v.id,
      impact: v.impact,          // critical, serious, moderate, minor
      description: v.description,
      nodes: v.nodes.length
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length
  };
}` })
```

**Impact Levels**:
| Level | Action Required |
|-------|-----------------|
| critical | Must fix immediately |
| serious | Should fix before release |
| moderate | Nice to fix |
| minor | Low priority |

---

## 7. Interactive Element Testing

```javascript
// Click element
mcp__playwright__browser_click({ element: "button description", ref: "[ref]" })

// Drag and drop
mcp__playwright__browser_drag({
  startElement: "source element",
  startRef: "[start-ref]",
  endElement: "target element",
  endRef: "[end-ref]"
})

// Type text
mcp__playwright__browser_type({
  element: "input field",
  ref: "[ref]",
  text: "test input"
})
```

---

## 8. Complete Verification Flow

```javascript
// Full verification sequence
async function verifyGame(gameName) {
  // 1. Navigate
  mcp__playwright__browser_navigate({
    url: `http://localhost:8000/games/${gameName}/`
  })

  // 2. Responsive screenshots
  const sizes = [
    { width: 768, height: 1024, name: 'tablet-portrait' },
    { width: 1024, height: 768, name: 'tablet-landscape' },
    { width: 1280, height: 720, name: 'desktop' }
  ];

  for (const size of sizes) {
    mcp__playwright__browser_resize({ width: size.width, height: size.height })
    mcp__playwright__browser_take_screenshot({
      filename: `claudedocs/${size.name}.png`
    })
  }

  // 3. DOM validation
  mcp__playwright__browser_snapshot()

  // 4. Console errors
  mcp__playwright__browser_console_messages({ level: "error" })

  // 5. Accessibility
  // (run axe-core evaluate)

  // 6. Close
  mcp__playwright__browser_close()
}
```

---

## What Playwright CAN Verify

- ✅ Responsive layout screenshots (all sizes)
- ✅ DOM structure integrity
- ✅ CSS property values (dimensions, colors, etc.)
- ✅ JavaScript runtime state
- ✅ Console errors
- ✅ Element visibility
- ✅ Visual Regression - baseline vs current comparison
- ✅ Accessibility (axe-core) - WCAG automated checks

## What REQUIRES Human Verification

- ❌ Animation smoothness (subjective feel)
- ❌ Visual aesthetics (aesthetic judgment)
- ❌ Touch responsiveness (physical device)
- ❌ Game "fun" factor (user experience)

---

## Human Verification Checklist

**Visual** (After screenshots generated):
```
Please confirm:
- [ ] Layout is aesthetically pleasing
- [ ] Animations are smooth and natural
- [ ] Overall visual harmony
```

**Device Testing** (On real devices):
```
Windows Desktop:
- [ ] Mouse drag is smooth
- [ ] Keyboard Tab navigation works

Tablet (iPad/Android):
- [ ] Touch drag is responsive
- [ ] No accidental touches
```
