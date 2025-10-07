# Drawing Studio - Technical Architecture

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Core Engine](#core-engine)
3. [Canvas Rendering System](#canvas-rendering-system)
4. [Tool System Architecture](#tool-system-architecture)
5. [Data Models](#data-models)
6. [Storage Architecture](#storage-architecture)
7. [Event System](#event-system)
8. [Performance Optimization](#performance-optimization)
9. [File Structure](#file-structure)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Application Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Mode 1  │  │  Mode 2  │  │  Mode 3  │  │ Gallery  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │              │          │
└───────┼─────────────┼─────────────┼──────────────┼──────────┘
        │             │             │              │
┌───────┴─────────────┴─────────────┴──────────────┴──────────┐
│                     Core Engine Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Canvas    │  │    Tool     │  │   History   │         │
│  │  Manager    │  │   System    │  │   Manager   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│  ┌──────┴───────┐  ┌────┴─────┐  ┌───────┴────┐           │
│  │   Renderer   │  │  Input   │  │  Storage   │           │
│  └──────────────┘  └──────────┘  └────────────┘           │
└──────────────────────────────────────────────────────────────┘
        │                    │                   │
┌───────┴────────────────────┴───────────────────┴─────────────┐
│                     Browser APIs Layer                        │
│   Canvas 2D API  │  DOM Events  │  LocalStorage/IndexedDB   │
└───────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Application Layer**:
- Mode-specific UI and logic
- User interaction flows
- Feature-specific functionality

**Core Engine Layer**:
- Canvas rendering and management
- Tool system and state management
- History tracking and undo/redo
- Input event handling
- Data persistence

**Browser APIs Layer**:
- Native Canvas 2D rendering
- DOM event handling
- Storage APIs (LocalStorage, IndexedDB)

---

## Core Engine

### DrawingEngine Class

The central coordinator for all drawing operations.

```javascript
class DrawingEngine {
  constructor(canvasElement, options = {}) {
    // Core components
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { willReadFrequently: false });
    this.mode = options.mode || 2; // Default to Mode 2
    
    // Sub-systems
    this.canvasManager = new CanvasManager(this.canvas, this.ctx);
    this.toolSystem = new ToolSystem(this.ctx);
    this.historyManager = new HistoryManager(20);
    this.inputHandler = new InputHandler(this.canvas, this.toolSystem);
    this.storageManager = new StorageManager();
    this.feedbackSystem = new FeedbackSystem();
    
    // State
    this.currentTool = 'brush';
    this.currentColor = '#000000';
    this.toolSize = 15;
    this.isDrawing = false;
    
    // Initialize
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.bindEvents();
    this.toolSystem.setTool(this.currentTool, {
      size: this.toolSize,
      color: this.currentColor
    });
  }
  
  setupCanvas() {
    this.canvasManager.resize();
    this.canvasManager.clear();
    this.historyManager.saveState(this.canvas);
  }
  
  bindEvents() {
    // Tool changes
    this.toolSystem.on('toolStart', () => {
      this.historyManager.saveState(this.canvas);
    });
    
    this.toolSystem.on('toolEnd', () => {
      this.feedbackSystem.showStrokeComplete();
    });
    
    // Input events
    this.inputHandler.on('drawStart', (coords) => this.handleDrawStart(coords));
    this.inputHandler.on('drawMove', (coords) => this.handleDrawMove(coords));
    this.inputHandler.on('drawEnd', (coords) => this.handleDrawEnd(coords));
  }
  
  // Public API
  setTool(toolName) {
    this.currentTool = toolName;
    this.toolSystem.setTool(toolName, {
      size: this.toolSize,
      color: this.currentColor
    });
  }
  
  setColor(color) {
    this.currentColor = color;
    this.toolSystem.updateToolProperty('color', color);
  }
  
  setSize(size) {
    this.toolSize = size;
    this.toolSystem.updateToolProperty('size', size);
  }
  
  undo() {
    return this.historyManager.undo(this.canvas);
  }
  
  redo() {
    return this.historyManager.redo(this.canvas);
  }
  
  clear() {
    this.canvasManager.clear();
    this.historyManager.saveState(this.canvas);
  }
  
  async save(name) {
    const artwork = {
      id: generateId(),
      name,
      mode: this.mode,
      timestamp: Date.now(),
      canvasWidth: this.canvas.width,
      canvasHeight: this.canvas.height,
      imageData: this.canvas.toDataURL('image/png')
    };
    
    await this.storageManager.saveArtwork(artwork);
    this.feedbackSystem.showSaveSuccess();
  }
  
  // Private handlers
  handleDrawStart(coords) {
    this.isDrawing = true;
    this.toolSystem.currentTool.onStart(coords.x, coords.y);
  }
  
  handleDrawMove(coords) {
    if (!this.isDrawing) return;
    this.toolSystem.currentTool.onMove(coords.x, coords.y);
  }
  
  handleDrawEnd(coords) {
    if (!this.isDrawing) return;
    this.toolSystem.currentTool.onEnd(coords.x, coords.y);
    this.isDrawing = false;
  }
}
```

---

## Canvas Rendering System

### CanvasManager Class

Manages canvas sizing, clearing, and rendering optimizations.

```javascript
class CanvasManager {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    
    // Double buffering for smooth rendering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  }
  
  resize(width, height) {
    // If no dimensions provided, use container size
    if (!width || !height) {
      const container = this.canvas.parentElement;
      width = container.clientWidth;
      height = container.clientHeight;
    }
    
    // Set display size (CSS pixels)
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    // Set actual size (device pixels for sharp rendering)
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    
    // Scale context for HiDPI displays
    this.ctx.scale(this.dpr, this.dpr);
    
    // Match offscreen canvas
    this.offscreenCanvas.width = this.canvas.width;
    this.offscreenCanvas.height = this.canvas.height;
    this.offscreenCtx.scale(this.dpr, this.dpr);
  }
  
  clear(color = '#FFFFFF') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  // Double buffering: draw to offscreen, then copy to main
  beginOffscreenRender() {
    this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    return this.offscreenCtx;
  }
  
  commitOffscreenRender() {
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }
  
  // Get rendering context with performance optimizations
  getOptimizedContext() {
    // Disable anti-aliasing for pixel-perfect rendering (optional)
    // this.ctx.imageSmoothingEnabled = false;
    
    // Set line cap/join for smoother lines
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    return this.ctx;
  }
}
```

### RenderLoop Class

Manages the animation frame loop for smooth effects and animations.

```javascript
class RenderLoop {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.effects = [];
    this.isRunning = false;
    this.rafId = null;
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }
  
  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  
  loop() {
    if (!this.isRunning) return;
    
    // Update and render effects
    this.effects = this.effects.filter(effect => {
      effect.update();
      effect.render(this.canvasManager.ctx);
      return !effect.isComplete();
    });
    
    // Auto-stop if no effects
    if (this.effects.length === 0) {
      this.stop();
    } else {
      this.rafId = requestAnimationFrame(() => this.loop());
    }
  }
  
  addEffect(effect) {
    this.effects.push(effect);
    if (!this.isRunning) {
      this.start();
    }
  }
}
```

---

## Tool System Architecture

### Tool Base Class

Abstract base class for all drawing tools.

```javascript
class Tool {
  constructor(ctx, options = {}) {
    this.ctx = ctx;
    this.size = options.size || 15;
    this.color = options.color || '#000000';
    this.opacity = options.opacity || 1.0;
    this.isActive = false;
  }
  
  // Abstract methods (must be implemented by subclasses)
  onStart(x, y) {
    throw new Error('Tool.onStart() must be implemented');
  }
  
  onMove(x, y) {
    throw new Error('Tool.onMove() must be implemented');
  }
  
  onEnd(x, y) {
    throw new Error('Tool.onEnd() must be implemented');
  }
  
  // Common utilities
  setProperty(key, value) {
    if (this.hasOwnProperty(key)) {
      this[key] = value;
    }
  }
  
  applyStyle() {
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;
    this.ctx.lineWidth = this.size;
    this.ctx.globalAlpha = this.opacity;
  }
}
```

### BrushTool Implementation

```javascript
class BrushTool extends Tool {
  constructor(ctx, options) {
    super(ctx, options);
    this.points = [];
    this.smoothingFactor = 0.5; // Catmull-Rom smoothing
  }
  
  onStart(x, y) {
    this.isActive = true;
    this.points = [{x, y}];
    this.applyStyle();
    
    // Draw initial dot
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  onMove(x, y) {
    if (!this.isActive) return;
    
    this.points.push({x, y});
    
    // Draw stroke with smoothing
    if (this.points.length > 2) {
      this.drawSmoothStroke();
    }
  }
  
  onEnd(x, y) {
    if (!this.isActive) return;
    
    this.points.push({x, y});
    this.drawSmoothStroke();
    
    this.isActive = false;
    this.points = [];
  }
  
  drawSmoothStroke() {
    this.applyStyle();
    
    const len = this.points.length;
    if (len < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    
    // Quadratic curve smoothing
    for (let i = 1; i < len - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const midPoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2
      };
      this.ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    }
    
    // Draw to last point
    const lastPoint = this.points[len - 1];
    this.ctx.lineTo(lastPoint.x, lastPoint.y);
    this.ctx.stroke();
  }
}
```

### ToolSystem Class

Manages tool registration and switching.

```javascript
class ToolSystem {
  constructor(ctx) {
    this.ctx = ctx;
    this.tools = new Map();
    this.currentTool = null;
    this.eventEmitter = new EventEmitter();
    
    // Register default tools
    this.registerDefaultTools();
  }
  
  registerDefaultTools() {
    this.register('brush', BrushTool);
    this.register('eraser', EraserTool);
    this.register('bucket', BucketFillTool);
    this.register('pencil', PencilTool);
    this.register('spray', SprayTool);
  }
  
  register(name, ToolClass) {
    this.tools.set(name, ToolClass);
  }
  
  setTool(name, options = {}) {
    const ToolClass = this.tools.get(name);
    if (!ToolClass) {
      throw new Error(`Tool "${name}" not found`);
    }
    
    this.currentTool = new ToolClass(this.ctx, options);
    this.eventEmitter.emit('toolChanged', name);
  }
  
  updateToolProperty(key, value) {
    if (this.currentTool) {
      this.currentTool.setProperty(key, value);
    }
  }
  
  on(event, handler) {
    this.eventEmitter.on(event, handler);
  }
}
```

---

## Data Models

### Artwork Model

```javascript
class Artwork {
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || 'Untitled';
    this.mode = data.mode || 2;
    this.timestamp = data.timestamp || Date.now();
    this.canvasWidth = data.canvasWidth || 800;
    this.canvasHeight = data.canvasHeight || 600;
    this.thumbnail = data.thumbnail || null;
    this.imageData = data.imageData || null;
    this.layers = data.layers || null; // Only for Mode 3
    this.metadata = {
      stars: data.stars || 0,
      colorsUsed: data.colorsUsed || [],
      strokeCount: data.strokeCount || 0,
      completionTime: data.completionTime || 0
    };
  }
  
  generateThumbnail(canvas) {
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 200;
    thumbCanvas.height = 150;
    const thumbCtx = thumbCanvas.getContext('2d');
    
    // Draw scaled version
    thumbCtx.drawImage(canvas, 0, 0, 200, 150);
    
    this.thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);
    return this.thumbnail;
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      mode: this.mode,
      timestamp: this.timestamp,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      thumbnail: this.thumbnail,
      imageData: this.imageData,
      layers: this.layers,
      metadata: this.metadata
    };
  }
  
  static fromJSON(json) {
    return new Artwork(json);
  }
}
```

### Template Model (Mode 1)

```javascript
class ColoringTemplate {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.category = data.category;
    this.difficulty = data.difficulty;
    this.thumbnail = data.thumbnail;
    this.regions = data.regions.map(r => ({
      id: r.id,
      path: new Path2D(r.pathData)
    }));
  }
  
  render(ctx) {
    // Draw all regions with black outlines
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    
    this.regions.forEach(region => {
      ctx.stroke(region.path);
    });
  }
  
  getRegionAt(x, y, ctx) {
    // Find which region contains the point
    for (const region of this.regions) {
      if (ctx.isPointInPath(region.path, x, y)) {
        return region;
      }
    }
    return null;
  }
  
  fillRegion(regionId, color, ctx) {
    const region = this.regions.find(r => r.id === regionId);
    if (!region) return;
    
    ctx.fillStyle = color;
    ctx.fill(region.path);
    
    // Re-draw outline
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.stroke(region.path);
  }
}
```

### Layer Model (Mode 3)

```javascript
class Layer {
  constructor(name, width, height) {
    this.id = generateId();
    this.name = name;
    this.visible = true;
    this.opacity = 1.0;
    this.locked = false;
    
    // Each layer has its own canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }
  
  render(targetCtx) {
    if (!this.visible) return;
    
    targetCtx.save();
    targetCtx.globalAlpha = this.opacity;
    targetCtx.drawImage(this.canvas, 0, 0);
    targetCtx.restore();
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      visible: this.visible,
      opacity: this.opacity,
      locked: this.locked,
      imageData: this.canvas.toDataURL('image/png')
    };
  }
  
  static fromJSON(json, width, height) {
    const layer = new Layer(json.name, width, height);
    layer.id = json.id;
    layer.visible = json.visible;
    layer.opacity = json.opacity;
    layer.locked = json.locked;
    
    // Load image data
    const img = new Image();
    img.onload = () => {
      layer.ctx.drawImage(img, 0, 0);
    };
    img.src = json.imageData;
    
    return layer;
  }
}
```

---

## Storage Architecture

### StorageManager Class

Handles persistence using LocalStorage (metadata) and IndexedDB (image data).

```javascript
class StorageManager {
  constructor() {
    this.dbName = 'DrawingStudioDB';
    this.dbVersion = 1;
    this.db = null;
    this.init();
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('artworks')) {
          db.createObjectStore('artworks', { keyPath: 'id' });
        }
      };
    });
  }
  
  async saveArtwork(artwork) {
    await this.init(); // Ensure DB is ready
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['artworks'], 'readwrite');
      const store = transaction.objectStore('artworks');
      const request = store.put(artwork.toJSON());
      
      request.onsuccess = () => {
        // Save metadata to LocalStorage for quick access
        this.saveMetadata(artwork);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async loadArtwork(id) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['artworks'], 'readonly');
      const store = transaction.objectStore('artworks');
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(Artwork.fromJSON(request.result));
        } else {
          reject(new Error('Artwork not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async deleteArtwork(id) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['artworks'], 'readwrite');
      const store = transaction.objectStore('artworks');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        this.deleteMetadata(id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async listArtworks() {
    // Load metadata from LocalStorage for quick gallery display
    const metadata = JSON.parse(localStorage.getItem('artworks_metadata') || '[]');
    return metadata;
  }
  
  saveMetadata(artwork) {
    const metadata = this.listArtworks();
    const existing = metadata.findIndex(m => m.id === artwork.id);
    
    const meta = {
      id: artwork.id,
      name: artwork.name,
      mode: artwork.mode,
      timestamp: artwork.timestamp,
      thumbnail: artwork.thumbnail
    };
    
    if (existing >= 0) {
      metadata[existing] = meta;
    } else {
      metadata.push(meta);
    }
    
    localStorage.setItem('artworks_metadata', JSON.stringify(metadata));
  }
  
  deleteMetadata(id) {
    const metadata = this.listArtworks();
    const filtered = metadata.filter(m => m.id !== id);
    localStorage.setItem('artworks_metadata', JSON.stringify(filtered));
  }
}
```

---

## Event System

### EventEmitter Class

Simple event system for decoupled communication.

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }
  
  off(event, handler) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    if (index >= 0) {
      handlers.splice(index, 1);
    }
  }
  
  emit(event, ...args) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    handlers.forEach(handler => handler(...args));
  }
  
  once(event, handler) {
    const onceHandler = (...args) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}
```

### InputHandler Class

Unified mouse and touch event handling.

```javascript
class InputHandler extends EventEmitter {
  constructor(canvas, toolSystem) {
    super();
    this.canvas = canvas;
    this.toolSystem = toolSystem;
    this.isDrawing = false;
    this.lastPoint = null;
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleStart(e.touches[0]);
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.handleMove(e.touches[0]);
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleEnd(e.changedTouches[0]);
    }, { passive: false });
  }
  
  getCanvasCoords(event) {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    return {
      x: (event.clientX - rect.left) * (this.canvas.width / rect.width) / dpr,
      y: (event.clientY - rect.top) * (this.canvas.height / rect.height) / dpr
    };
  }
  
  handleStart(event) {
    const coords = this.getCanvasCoords(event);
    this.isDrawing = true;
    this.lastPoint = coords;
    this.emit('drawStart', coords);
  }
  
  handleMove(event) {
    if (!this.isDrawing) return;
    const coords = this.getCanvasCoords(event);
    this.emit('drawMove', coords);
    this.lastPoint = coords;
  }
  
  handleEnd(event) {
    if (!this.isDrawing) return;
    const coords = this.lastPoint; // Use last known point
    this.emit('drawEnd', coords);
    this.isDrawing = false;
    this.lastPoint = null;
  }
}
```

---

## Performance Optimization

### PerformanceMonitor Class

Tracks FPS and performance metrics.

```javascript
class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.updateInterval = 1000; // Update every second
  }
  
  start() {
    this.measure();
  }
  
  measure() {
    requestAnimationFrame(() => {
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastTime >= this.updateInterval) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
        this.frameCount = 0;
        this.lastTime = now;
        
        // Warn if FPS drops below 30
        if (this.fps < 30) {
          console.warn(`Low FPS: ${this.fps}`);
        }
      }
      
      this.measure();
    });
  }
  
  getFPS() {
    return this.fps;
  }
}
```

### Optimization Strategies

**1. Canvas Optimization**:
```javascript
// Disable context attributes not needed
const ctx = canvas.getContext('2d', {
  alpha: false, // No transparency needed for background
  willReadFrequently: false, // Optimize for drawing, not reading
  desynchronized: true // Reduce latency
});
```

**2. Batch Drawing**:
```javascript
class BatchedDrawing {
  constructor(ctx) {
    this.ctx = ctx;
    this.batchQueue = [];
    this.batchSize = 10;
  }
  
  addPoint(x, y) {
    this.batchQueue.push({x, y});
    
    if (this.batchQueue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  flush() {
    if (this.batchQueue.length === 0) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.batchQueue[0].x, this.batchQueue[0].y);
    
    for (let i = 1; i < this.batchQueue.length; i++) {
      this.ctx.lineTo(this.batchQueue[i].x, this.batchQueue[i].y);
    }
    
    this.ctx.stroke();
    this.batchQueue = [];
  }
}
```

**3. Debounced Auto-Save**:
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSave = debounce(saveArtwork, 30000); // 30 seconds
```

---

## File Structure

```
drawing-studio/
├── index.html                 # Main entry point
├── css/
│   ├── main.css              # Global styles
│   ├── modes.css             # Mode-specific styles
│   ├── components.css        # UI component styles
│   └── animations.css        # Animation definitions
├── js/
│   ├── main.js               # Application entry
│   ├── core/
│   │   ├── DrawingEngine.js  # Main engine
│   │   ├── CanvasManager.js  # Canvas management
│   │   ├── ToolSystem.js     # Tool coordination
│   │   ├── HistoryManager.js # Undo/redo
│   │   ├── StorageManager.js # Persistence
│   │   ├── InputHandler.js   # Event handling
│   │   └── EventEmitter.js   # Event system
│   ├── tools/
│   │   ├── Tool.js           # Base tool class
│   │   ├── BrushTool.js      # Brush implementation
│   │   ├── EraserTool.js     # Eraser implementation
│   │   ├── BucketFillTool.js # Fill implementation
│   │   ├── PencilTool.js     # Pencil (Mode 3)
│   │   ├── SprayTool.js      # Spray (Mode 3)
│   │   └── ShapeTool.js      # Shapes (Mode 3)
│   ├── modes/
│   │   ├── ColoringMode.js   # Mode 1 logic
│   │   ├── PaintingMode.js   # Mode 2 logic
│   │   └── ArtStudioMode.js  # Mode 3 logic
│   ├── ui/
│   │   ├── UIManager.js      # UI coordination
│   │   ├── ColorPalette.js   # Color selector
│   │   ├── ToolPalette.js    # Tool selector
│   │   ├── Gallery.js        # Gallery view
│   │   └── Modal.js          # Modal dialogs
│   ├── models/
│   │   ├── Artwork.js        # Artwork model
│   │   ├── Template.js       # Template model
│   │   └── Layer.js          # Layer model
│   ├── effects/
│   │   ├── FeedbackSystem.js # Visual feedback
│   │   ├── StarBurst.js      # Star effect
│   │   ├── Confetti.js       # Confetti effect
│   │   └── ColorSplash.js    # Color splash
│   └── utils/
│       ├── helpers.js        # Utility functions
│       ├── colorUtils.js     # Color conversions
│       └── performanceMonitor.js
├── assets/
│   ├── templates/            # Coloring templates (JSON)
│   ├── icons/                # Tool icons (SVG)
│   └── sounds/               # Sound effects (optional)
└── docs/
    ├── DESIGN.md
    ├── FEATURES.md
    ├── TECHNICAL.md
    └── ROADMAP.md
```

---

## Module Loading Strategy

### ES6 Modules (Recommended)

```html
<!-- index.html -->
<script type="module" src="js/main.js"></script>
```

```javascript
// main.js
import { DrawingEngine } from './core/DrawingEngine.js';
import { ColoringMode } from './modes/ColoringMode.js';
import { UIManager } from './ui/UIManager.js';

// Initialize application
const canvas = document.getElementById('drawing-canvas');
const engine = new DrawingEngine(canvas, { mode: 2 });
const ui = new UIManager(engine);

// Start the application
ui.init();
engine.setupCanvas();
```

---

## Testing Strategy

### Unit Tests
- Test individual tools (brush, eraser, fill)
- Test canvas transformations
- Test storage operations
- Test coordinate conversions

### Integration Tests
- Test complete drawing workflows
- Test save/load cycles
- Test mode switching
- Test undo/redo chains

### Performance Tests
- Measure FPS during drawing
- Test with large canvases (1920x1080)
- Test with many undo states (50+)
- Test storage limits (50 artworks)

### Manual Testing
- Touch devices (iPad, Android tablets)
- Different browsers (Chrome, Firefox, Safari)
- Different screen sizes (phone, tablet, desktop)
- Accessibility features (keyboard navigation, screen readers)

---

## Browser Compatibility

**Minimum Requirements**:
- Canvas 2D API
- ES6 (Classes, Arrow Functions, Promises)
- IndexedDB
- LocalStorage
- Touch Events API

**Polyfills** (if supporting older browsers):
- Promise polyfill
- Object.assign polyfill
- Array.from polyfill

**Feature Detection**:
```javascript
function checkBrowserSupport() {
  const canvas = document.createElement('canvas');
  const features = {
    canvas2d: !!(canvas.getContext && canvas.getContext('2d')),
    localStorage: typeof Storage !== 'undefined',
    indexedDB: !!window.indexedDB,
    touchEvents: 'ontouchstart' in window
  };
  
  const supported = Object.values(features).every(f => f);
  
  if (!supported) {
    showUnsupportedBrowserMessage();
  }
  
  return supported;
}
```

---

## Security Considerations

1. **XSS Prevention**: Sanitize user input (artwork names)
2. **Storage Limits**: Enforce max artwork count
3. **Data Validation**: Validate loaded data structure
4. **Content Security Policy**: Set appropriate CSP headers

```javascript
// Sanitize user input
function sanitizeInput(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Validate loaded artwork
function validateArtwork(data) {
  return (
    data.id &&
    typeof data.name === 'string' &&
    typeof data.mode === 'number' &&
    data.mode >= 1 && data.mode <= 3 &&
    data.imageData && data.imageData.startsWith('data:image/')
  );
}
```

---

## Conclusion

This technical architecture provides:

- **Modular Design**: Clear separation of concerns
- **Scalability**: Easy to add new tools and features
- **Performance**: Optimized for 60 FPS
- **Maintainability**: Clean code structure
- **Testability**: Decoupled components

**Next Steps**: Proceed to ROADMAP.md for phased implementation plan with POC-first approach.
