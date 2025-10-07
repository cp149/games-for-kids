# Drawing Studio - Feature Specifications

## Table of Contents
1. [Drawing Tools](#drawing-tools)
2. [Color Systems](#color-systems)
3. [Template System](#template-system)
4. [Layer System](#layer-system)
5. [Save/Load System](#saveload-system)
6. [Feedback & Rewards](#feedback--rewards)
7. [UI Components](#ui-components)
8. [Touch & Input Handling](#touch--input-handling)

---

## Drawing Tools

### 1. Brush Tool
**Available in**: Modes 2 & 3

**Specifications**:
- **Algorithm**: Quadratic curve interpolation between points
- **Sizes**: 
  - Small: 5px diameter
  - Medium: 15px diameter  
  - Large: 30px diameter
  - Custom (Mode 3): 1-100px slider
- **Stroke Style**: Round line cap, round line join
- **Smoothing**: Catmull-Rom spline for smoother curves
- **Performance**: Draw in chunks of 10 points, requestAnimationFrame

**Implementation Details**:
```javascript
// Pseudo-code
class BrushTool {
  constructor(size, color, opacity) {
    this.size = size;
    this.color = color;
    this.opacity = opacity;
    this.points = [];
  }
  
  onMouseDown(x, y) {
    this.points = [{x, y}];
    this.drawing = true;
  }
  
  onMouseMove(x, y) {
    if (!this.drawing) return;
    this.points.push({x, y});
    this.drawStroke();
  }
  
  drawStroke() {
    // Quadratic curve between last 3 points
    // ctx.quadraticCurveTo(cp1x, cp1y, x, y)
  }
}
```

**Touch Support**:
- Track touch ID to prevent multi-touch interference
- Prevent default to stop scrolling while drawing
- Optional pressure simulation based on touch area (if supported)

---

### 2. Eraser Tool
**Available in**: Modes 2 & 3

**Specifications**:
- **Type**: Destination-out compositing (true eraser, not white paint)
- **Sizes**: Same as brush (5px, 15px, 30px)
- **Visual**: Show eraser cursor with outline
- **Behavior**: Identical to brush but with `globalCompositeOperation = 'destination-out'`

**Implementation**:
```javascript
class EraserTool extends BrushTool {
  drawStroke() {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    // Draw as normal brush
    super.drawStroke();
    ctx.restore();
  }
}
```

---

### 3. Bucket Fill Tool
**Available in**: Modes 1, 2 & 3

**Specifications**:
- **Algorithm**: Flood fill with stack-based approach
- **Tolerance**: 
  - Mode 1: 0 (exact match, pre-defined areas)
  - Mode 2 & 3: 10 (slight color variation)
- **Performance**: Use ImageData, limit fill area to 100,000 pixels
- **Anti-aliasing**: Edge smoothing for better visual quality

**Implementation Details**:
```javascript
class BucketFillTool {
  fill(x, y, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    
    if (colorsMatch(targetColor, fillColor)) return; // Already filled
    
    const stack = [{x, y}];
    const visited = new Set();
    
    while (stack.length > 0) {
      const {x, y} = stack.pop();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (colorsMatch(getPixelColor(imageData, x, y), targetColor, tolerance)) {
        setPixelColor(imageData, x, y, fillColor);
        stack.push({x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1});
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
}
```

**Optimization**:
- Use typed arrays (Uint32Array) for faster pixel access
- Implement scanline fill for better performance
- Limit maximum fill iterations to prevent hanging

---

### 4. Pencil Tool (Mode 3 Only)
**Specifications**:
- **Style**: Textured, slightly rough edges
- **Implementation**: Draw with smaller size + random offset for texture
- **Opacity**: Slightly transparent (90%) for pencil-like feel
- **Algorithm**: Draw line segments with random perpendicular offset (±1px)

```javascript
class PencilTool {
  drawStroke() {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = this.size * 0.7; // Thinner than brush
    
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      
      // Add slight randomness for texture
      const offset = (Math.random() - 0.5) * 2;
      
      ctx.beginPath();
      ctx.moveTo(p1.x + offset, p1.y + offset);
      ctx.lineTo(p2.x + offset, p2.y + offset);
      ctx.stroke();
    }
    ctx.restore();
  }
}
```

---

### 5. Spray Paint Tool (Mode 3 Only)
**Specifications**:
- **Effect**: Particle spray effect
- **Particles**: 20-50 particles per frame
- **Distribution**: Random within radius (Gaussian distribution)
- **Opacity**: Individual particles with 10-30% opacity

```javascript
class SprayTool {
  spray(x, y) {
    const particleCount = 30;
    const radius = this.size;
    
    ctx.save();
    for (let i = 0; i < particleCount; i++) {
      // Gaussian distribution for natural spray
      const angle = Math.random() * Math.PI * 2;
      const distance = gaussianRandom() * radius;
      
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;
      
      ctx.globalAlpha = Math.random() * 0.3;
      ctx.fillStyle = this.color;
      ctx.fillRect(px, py, 2, 2);
    }
    ctx.restore();
  }
}
```

---

### 6. Shape Tools (Mode 3 Only)

**Available Shapes**: Circle, Square, Line, Star, Triangle

**Specifications**:
- **Drawing Mode**: Click and drag (start point → end point)
- **Preview**: Show shape outline while dragging
- **Fill Options**: Stroke only, fill only, both
- **Constraints**: Hold Shift for perfect proportions (circle, square)

**Implementation**:
```javascript
class ShapeTool {
  onMouseDown(x, y) {
    this.startX = x;
    this.startY = y;
  }
  
  onMouseMove(x, y) {
    this.previewShape(this.startX, this.startY, x, y);
  }
  
  onMouseUp(x, y) {
    this.drawShape(this.startX, this.startY, x, y);
  }
  
  drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    if (this.fill) ctx.fill();
    if (this.stroke) ctx.stroke();
  }
}
```

---

### 7. Text Tool (Mode 3 Only)

**Specifications**:
- **Input**: Click to place cursor, type text
- **Font Options**: 
  - Families: Arial, Comic Sans, Courier, Times
  - Sizes: 12px, 18px, 24px, 36px, 48px
  - Styles: Normal, Bold, Italic
- **Editing**: Click text to edit, drag to move
- **Rendering**: Render text to canvas on confirm (not editable after)

**Implementation**:
```javascript
class TextTool {
  onClick(x, y) {
    this.showTextInput(x, y);
  }
  
  showTextInput(x, y) {
    const input = document.createElement('input');
    input.style.position = 'absolute';
    input.style.left = x + 'px';
    input.style.top = y + 'px';
    input.style.font = this.currentFont;
    
    input.addEventListener('blur', () => {
      this.renderText(x, y, input.value);
      input.remove();
    });
    
    document.body.appendChild(input);
    input.focus();
  }
  
  renderText(x, y, text) {
    ctx.font = this.currentFont;
    ctx.fillStyle = this.color;
    ctx.fillText(text, x, y);
  }
}
```

---

## Color Systems

### Mode 1: Simple Palette (12 Colors)

**Colors**:
```javascript
const MODE1_COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#8B00FF', // Violet
  '#FF00FF', // Magenta
  '#8B4513', // Brown
  '#000000', // Black
  '#FFFFFF', // White
  '#808080'  // Gray
];
```

**UI**: 
- Grid layout: 4 columns × 3 rows
- Large squares: 50x50px each
- Selected color: 4px border + scale 1.1x

---

### Mode 2: Extended Palette (24 Colors)

**Colors**: Mode 1 colors + 12 additional shades
- Light versions of primary colors
- Additional earth tones
- Pastels (pink, lavender, mint)

**Custom Color Picker** (unlockable):
- Simple RGB sliders
- Hex input
- Preview square
- Add to palette (max 6 custom colors)

---

### Mode 3: Professional Color System

**Components**:

1. **Color Picker**:
   - Hue bar (vertical, 0-360°)
   - Saturation/Lightness square (HSL model)
   - RGB sliders (0-255)
   - Hex input (#RRGGBB)
   - Alpha slider (0-100%)

2. **Recent Colors**: Last 10 used colors in a row

3. **Eyedropper Tool**:
   - Click anywhere on canvas to sample color
   - Shows zoomed preview (5x) with crosshair
   - Displays RGB values in real-time

**Implementation**:
```javascript
class ColorPicker {
  constructor() {
    this.hue = 0;
    this.saturation = 100;
    this.lightness = 50;
  }
  
  hslToRgb(h, s, l) {
    // Standard HSL to RGB conversion
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  }
  
  getColor() {
    const [r, g, b] = this.hslToRgb(this.hue, this.saturation, this.lightness);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
```

---

## Template System

### Mode 1: Coloring Templates

**Template Structure**:
```javascript
const template = {
  id: 'cat-001',
  name: 'Cute Cat',
  category: 'animals',
  difficulty: 1, // 1=easy (3-5 areas), 2=medium (6-10), 3=hard (11+)
  thumbnail: 'data:image/svg+xml;base64,...',
  regions: [
    {id: 1, path: new Path2D('M 10,10 L 50,10 ...')}, // SVG path
    {id: 2, path: new Path2D('M 20,30 ...')},
    // ... more regions
  ]
};
```

**Features**:
- **Pre-defined Regions**: Each region is a closed path
- **Boundary Detection**: Fill only within region boundaries
- **Black Outlines**: 3px black stroke around each region
- **Hit Testing**: `ctx.isPointInPath()` to detect clicks

**Template Generation** (for developers):
```javascript
// Convert SVG to template
function svgToTemplate(svgString) {
  // Parse SVG paths
  // Extract each <path> element
  // Convert to Path2D objects
  // Generate template JSON
}
```

**Included Templates** (Launch):
- **Animals** (8): Cat, Dog, Elephant, Lion, Bird, Fish, Butterfly, Rabbit
- **Vehicles** (4): Car, Train, Airplane, Boat
- **Nature** (4): Tree, Flower, Sun, Rainbow
- **Objects** (4): House, Ball, Star, Heart

---

### Mode 2: Drawing Templates (Optional Guides)

**Template Types**:
1. **Blank Canvas**: Pure white, no guides
2. **Grid Guide**: Faint grid (50px squares), 10% opacity
3. **Symmetry Guide**: Vertical/horizontal center lines
4. **Simple Outlines**: Very faint (20% opacity) shapes to trace

**Implementation**:
```javascript
class DrawingTemplate {
  renderGuide(type) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#000000';
    
    if (type === 'grid') {
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      // Horizontal lines...
    }
    
    ctx.restore();
  }
}
```

---

## Layer System (Mode 3 Only)

**Specifications**:
- **Maximum Layers**: 5 (prevent performance issues)
- **Layer Operations**: Add, delete, duplicate, merge, reorder
- **Properties**: 
  - Name (editable)
  - Visibility (show/hide)
  - Opacity (0-100%)
  - Lock (prevent editing)
- **Active Layer**: All drawing operations happen on active layer

**Data Structure**:
```javascript
class Layer {
  constructor(name, width, height) {
    this.id = generateId();
    this.name = name;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.visible = true;
    this.opacity = 1.0;
    this.locked = false;
  }
  
  render(targetCtx) {
    if (!this.visible) return;
    targetCtx.save();
    targetCtx.globalAlpha = this.opacity;
    targetCtx.drawImage(this.canvas, 0, 0);
    targetCtx.restore();
  }
}

class LayerManager {
  constructor() {
    this.layers = [new Layer('Background', 800, 600)];
    this.activeLayerIndex = 0;
  }
  
  renderAll(targetCtx) {
    targetCtx.clearRect(0, 0, targetCtx.canvas.width, targetCtx.canvas.height);
    this.layers.forEach(layer => layer.render(targetCtx));
  }
  
  getActiveLayer() {
    return this.layers[this.activeLayerIndex];
  }
}
```

**UI Components**:
- **Layer Thumbnails**: 80x60px previews
- **Drag to Reorder**: Visual feedback during drag
- **Context Menu**: Right-click for layer options

**Performance**:
- Composite layers only when needed (not every frame)
- Cache merged result when no changes
- Limit layer canvas size to viewport size

---

## Save/Load System

### Save Format

**Metadata** (LocalStorage):
```javascript
const artworkMeta = {
  id: 'artwork-123',
  name: 'My Drawing',
  mode: 2, // 1, 2, or 3
  timestamp: Date.now(),
  thumbnail: 'data:image/png;base64,...', // 200x150px
  canvasWidth: 800,
  canvasHeight: 600,
  stars: 3,
  colorsUsed: ['#FF0000', '#00FF00'],
  strokeCount: 145
};
```

**Canvas Data** (IndexedDB):
```javascript
// For Mode 1 & 2: Single canvas
const artworkData = {
  id: 'artwork-123',
  imageData: canvas.toDataURL('image/png')
};

// For Mode 3: Multiple layers
const artworkData = {
  id: 'artwork-123',
  layers: [
    {name: 'Background', imageData: '...', opacity: 1.0, visible: true},
    {name: 'Sketch', imageData: '...', opacity: 0.8, visible: true}
  ]
};
```

### Auto-Save

**Implementation**:
```javascript
class AutoSave {
  constructor(interval = 30000) { // 30 seconds
    this.interval = interval;
    this.isDirty = false;
    this.lastSaveTime = Date.now();
  }
  
  markDirty() {
    this.isDirty = true;
  }
  
  start() {
    setInterval(() => {
      if (this.isDirty && Date.now() - this.lastSaveTime > this.interval) {
        this.save();
      }
    }, 5000); // Check every 5 seconds
  }
  
  async save() {
    const data = this.captureCanvas();
    await this.saveToIndexedDB(data);
    this.isDirty = false;
    this.lastSaveTime = Date.now();
    this.showNotification('Auto-saved!');
  }
}
```

### Storage Management

**Limits**:
- Max 50 artworks
- Warn at 45 artworks
- Suggest deleting old/unwanted pieces

**Export Options**:
- **PNG Download**: `canvas.toDataURL()` → download link
- **Copy to Clipboard**: Use Clipboard API (if supported)
- **Share**: Web Share API for mobile

```javascript
async function exportAsPNG() {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `artwork-${Date.now()}.png`;
  link.href = dataURL;
  link.click();
}

async function shareArtwork() {
  const blob = await canvasToBlob(canvas);
  const file = new File([blob], 'artwork.png', {type: 'image/png'});
  
  if (navigator.share) {
    await navigator.share({
      files: [file],
      title: 'Check out my artwork!',
      text: 'Created in Magic Art Studio'
    });
  }
}
```

---

## Feedback & Rewards

### Celebration Effects

**Star Burst**:
```javascript
class StarBurst {
  constructor(x, y) {
    this.particles = [];
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0
      });
    }
  }
  
  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5; // Gravity
      p.life -= 0.02;
    });
  }
  
  render(ctx) {
    this.particles.forEach(p => {
      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#FFD700';
        this.drawStar(ctx, p.x, p.y, 5, 10, 5);
        ctx.restore();
      }
    });
  }
}
```

**Confetti**:
- Triggered on unlocks and achievements
- Colorful rectangles falling from top
- Physics: gravity + random rotation
- Duration: 3 seconds

**Color Splash**:
- When using a color for the first time
- Circular wave expanding from click point
- Color matches the selected color
- Duration: 0.5 seconds

### Achievement System

**Achievements**:
```javascript
const achievements = [
  {
    id: 'first_artwork',
    name: 'First Masterpiece',
    description: 'Complete your first artwork',
    icon: '🎨',
    condition: (stats) => stats.artworksCompleted >= 1
  },
  {
    id: 'color_explorer',
    name: 'Color Explorer',
    description: 'Use 10 different colors in one piece',
    icon: '🌈',
    condition: (stats) => stats.uniqueColorsInArtwork >= 10
  },
  {
    id: 'persistent_artist',
    name: 'Persistent Artist',
    description: 'Make 100 brush strokes in one artwork',
    icon: '✨',
    condition: (stats) => stats.strokesInArtwork >= 100
  }
  // ... more achievements
];
```

**Toast Notifications**:
```javascript
function showAchievement(achievement) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-text">
      <strong>${achievement.name}</strong>
      <p>${achievement.description}</p>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
```

---

## UI Components

### Color Palette Component

**HTML Structure**:
```html
<div class="color-palette">
  <div class="color-grid">
    <button class="color-swatch" data-color="#FF0000" style="background: #FF0000"></button>
    <!-- More colors... -->
  </div>
  <div class="selected-color-display">
    <div class="color-preview" style="background: #FF0000"></div>
    <span class="color-label">#FF0000</span>
  </div>
</div>
```

**CSS**:
```css
.color-swatch {
  width: 50px;
  height: 50px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.color-swatch.active {
  border-color: #333;
  transform: scale(1.15);
}
```

---

### Tool Palette Component

**HTML Structure**:
```html
<div class="tool-palette">
  <button class="tool-button active" data-tool="brush" title="Brush (B)">
    <svg><!-- Brush icon --></svg>
  </button>
  <button class="tool-button" data-tool="eraser" title="Eraser (E)">
    <svg><!-- Eraser icon --></svg>
  </button>
  <!-- More tools... -->
  
  <div class="tool-size-slider">
    <label>Size: <span id="size-value">15</span>px</label>
    <input type="range" min="1" max="100" value="15" id="tool-size">
  </div>
</div>
```

---

### Canvas Controls

**HTML Structure**:
```html
<div class="canvas-controls">
  <button id="undo-btn" title="Undo (Ctrl+Z)">↶ Undo</button>
  <button id="redo-btn" title="Redo (Ctrl+Y)">↷ Redo</button>
  <button id="clear-btn" title="Clear Canvas">🗑️ Clear</button>
  <button id="save-btn" class="primary">💾 Save</button>
</div>
```

---

## Touch & Input Handling

### Unified Input System

**Goal**: Handle both mouse and touch with same logic

```javascript
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.isDrawing = false;
    this.lastPoint = null;
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleStart(e.touches[0]);
    }, {passive: false});
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleMove(e.touches[0]);
    }, {passive: false});
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleEnd(e.changedTouches[0]);
    }, {passive: false});
  }
  
  getCanvasCoords(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }
  
  handleStart(event) {
    const coords = this.getCanvasCoords(event);
    this.isDrawing = true;
    this.lastPoint = coords;
    this.currentTool.onStart(coords.x, coords.y);
  }
  
  handleMove(event) {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(event);
    this.currentTool.onMove(coords.x, coords.y);
    this.lastPoint = coords;
  }
  
  handleEnd(event) {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(event);
    this.currentTool.onEnd(coords.x, coords.y);
    this.isDrawing = false;
    this.lastPoint = null;
  }
}
```

### Pressure Sensitivity Simulation

**For Touch Devices**:
```javascript
function simulatePressure(touchEvent) {
  // Use touch area as proxy for pressure
  const touch = touchEvent.touches[0];
  if (touch.radiusX && touch.radiusY) {
    const area = Math.PI * touch.radiusX * touch.radiusY;
    const pressure = Math.min(area / 500, 1.0); // Normalize
    return pressure;
  }
  return 0.5; // Default pressure
}
```

### Palm Rejection

**Basic Implementation**:
```javascript
class PalmRejection {
  constructor() {
    this.activeTouches = new Map();
  }
  
  handleTouchStart(e) {
    // Reject touches that are too large (likely palm)
    for (let touch of e.touches) {
      const area = touch.radiusX * touch.radiusY;
      if (area > 1000) { // Large touch = palm
        return false; // Reject
      }
      this.activeTouches.set(touch.identifier, touch);
    }
    return true; // Allow
  }
  
  // Only allow first touch to draw (ignore subsequent touches)
  isDrawingTouch(touchId) {
    const ids = Array.from(this.activeTouches.keys());
    return touchId === ids[0];
  }
}
```

---

## Undo/Redo System

**Implementation**:
```javascript
class HistoryManager {
  constructor(maxStates = 20) {
    this.states = [];
    this.currentIndex = -1;
    this.maxStates = maxStates;
  }
  
  saveState(canvas) {
    // Remove any states after current index (for redo)
    this.states = this.states.slice(0, this.currentIndex + 1);
    
    // Save current state
    const imageData = canvas.toDataURL();
    this.states.push(imageData);
    
    // Limit history size
    if (this.states.length > this.maxStates) {
      this.states.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  undo(canvas) {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.restoreState(canvas, this.states[this.currentIndex]);
      return true;
    }
    return false;
  }
  
  redo(canvas) {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      this.restoreState(canvas, this.states[this.currentIndex]);
      return true;
    }
    return false;
  }
  
  restoreState(canvas, dataURL) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataURL;
  }
}
```

**Keyboard Shortcuts**:
```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault();
      historyManager.undo(canvas);
    } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      historyManager.redo(canvas);
    }
  }
});
```

---

## Performance Optimization

### Drawing Performance

**Best Practices**:
1. **Batch Operations**: Draw multiple points in one path
2. **Request Animation Frame**: Smooth rendering
3. **Debounce Saves**: Don't save on every stroke
4. **Canvas Pooling**: Reuse off-screen canvases
5. **Limit History**: Cap undo states to prevent memory bloat

**Optimization Example**:
```javascript
class OptimizedBrush {
  constructor() {
    this.points = [];
    this.rafId = null;
  }
  
  addPoint(x, y) {
    this.points.push({x, y});
    
    // Batch draw on next frame
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.drawBatch();
        this.rafId = null;
      });
    }
  }
  
  drawBatch() {
    if (this.points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    
    for (let i = 1; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    }
    
    ctx.stroke();
    this.points = []; // Clear batch
  }
}
```

---

## Conclusion

These detailed feature specifications provide a clear blueprint for implementation. Each feature has been designed with:

- **Performance** in mind (60 FPS target)
- **Accessibility** for children of all abilities
- **Simplicity** for younger users
- **Depth** for advanced users
- **Mobile-first** touch support

**Next Steps**: Proceed to TECHNICAL.md for architecture details, then ROADMAP.md for phased implementation plan.
