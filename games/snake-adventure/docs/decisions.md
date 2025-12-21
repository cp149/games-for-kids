# Technical Decisions - Snake Adventure

## Architecture Decisions

### ADR-001: Canvas-Based Rendering
**Decision**: Use HTML5 Canvas for all game rendering
**Rationale**: 
- Need smooth 360° movement (DOM too slow)
- Particle effects require pixel manipulation
- Performance: 60 FPS target with many moving objects
- Camera panning easier with canvas transforms

**Alternatives Considered**:
- DOM + CSS transforms: Too slow for smooth movement
- WebGL: Overkill for 2D, adds complexity

### ADR-002: Manager Pattern Architecture
**Decision**: Separate concerns into manager classes
**Structure**:
```
GameManager (orchestrator)
├── SnakeManager (snake physics & growth)
├── FoodManager (spawning & collection)
├── CameraManager (viewport following)
├── CollisionManager (boundary & self-collision)
├── UIManager (HUD, menus, toasts)
└── MusicManager (audio playback)
```

**Rationale**:
- Follows BEST_PRACTICES.md requirement
- Each manager < 300 lines
- Easy to test individual systems
- Clear separation of concerns

### ADR-003: 360° Movement Implementation
**Decision**: Use angle-based movement with lerp interpolation
**Implementation**:
```javascript
class SnakeManager {
  update(deltaTime) {
    // Smooth angle interpolation
    this.currentAngle = lerp(this.currentAngle, this.targetAngle, 0.1);
    
    // Convert to velocity
    this.velocity.x = Math.cos(this.currentAngle) * this.speed;
    this.velocity.y = Math.sin(this.currentAngle) * this.speed;
    
    // Update head position
    this.head.x += this.velocity.x * deltaTime;
    this.head.y += this.velocity.y * deltaTime;
  }
}
```

**Rationale**:
- Smooth turning feels natural
- Easy to control speed
- Compatible with both keyboard and touch

**Alternatives Considered**:
- Grid-based: Traditional but not as visually interesting
- Physics-based: Too complex, harder to control

### ADR-004: Camera Follow System
**Decision**: Lerp-based camera with deadzone
**Implementation**:
```javascript
class CameraManager {
  follow(target, deltaTime) {
    const deadzone = 100; // pixels
    const distance = Math.hypot(target.x - this.x, target.y - this.y);
    
    if (distance > deadzone) {
      this.x = lerp(this.x, target.x, 0.05);
      this.y = lerp(this.y, target.y, 0.05);
    }
  }
}
```

**Rationale**:
- Smooth camera movement (no jitter)
- Deadzone prevents over-following
- Lightweight computation

### ADR-005: Collision Detection
**Decision**: Circle-based collision with spatial partitioning
**Implementation**:
- Snake segments: Circle colliders
- Boundary: Rectangle AABB check
- Food: Circle-circle distance check
- Spatial hash grid for self-collision optimization

**Rationale**:
- Fast circle-circle checks (distance < radius1 + radius2)
- Spatial partitioning reduces O(n²) to ~O(n)
- Accurate for smooth circular segments

### ADR-006: Particle System
**Decision**: Object pool pattern for tail particles
**Rationale**:
- Avoid GC spikes from create/destroy
- Reuse particle objects
- Better performance (critical for 60 FPS)

**Implementation**:
```javascript
class ParticlePool {
  constructor(size) {
    this.particles = Array(size).fill(null).map(() => new Particle());
    this.activeIndex = 0;
  }
  
  spawn(x, y, color) {
    const particle = this.particles[this.activeIndex];
    particle.reset(x, y, color);
    this.activeIndex = (this.activeIndex + 1) % this.particles.length;
    return particle;
  }
}
```

### ADR-007: Asset Generation Strategy
**Decision**: Procedurally generate all graphics with Canvas
**Rationale**:
- No external image files to load
- Instant startup (no loading screen)
- Easy to customize colors/sizes
- Smaller bundle size

**Generated Assets**:
- Snake segments (circular gradients)
- Food orbs (radial gradients with glow)
- Particles (small circles)
- Boundary lines (stroke paths)

### ADR-008: Mobile Controls
**Decision**: Virtual joystick + swipe gestures
**Rationale**:
- Joystick: Precise 360° control
- Swipe: Quick direction changes
- Both methods feel natural on touch
- Large touch target (≥48px)

**Implementation**:
- Joystick base: 120px diameter
- Joystick stick: 60px diameter
- Swipe threshold: 30px
- Touch area: Full screen (except UI)

### ADR-009: Configuration Management
**Decision**: Single config.js file for all constants
**Location**: `js/config.js`

**Structure**:
```javascript
const CONFIG = {
  GAME: {
    CANVAS_SIZE: 2000,
    VIEWPORT_WIDTH: 800,
    VIEWPORT_HEIGHT: 600,
    TARGET_FPS: 60
  },
  SNAKE: {
    INITIAL_LENGTH: 10,
    SEGMENT_RADIUS: 12,
    INITIAL_SPEED: 150,
    MAX_SPEED: 400,
    TURN_RATE: 0.1
  },
  CAMERA: {
    LERP_SPEED: 0.05,
    DEADZONE_RADIUS: 100
  },
  // ... more configs
};
```

**Rationale**:
- Follows BEST_PRACTICES.md mandate
- Easy to tune gameplay
- No magic numbers in code
- Single source of truth

### ADR-010: Memory Leak Prevention
**Decision**: Comprehensive destroy() chain
**Implementation**:
- Every manager has destroy() method
- Game class orchestrates cleanup
- Track all event listeners in Map
- Clear all intervals/timers
- Dereference DOM elements

**Checklist**:
```javascript
class GameManager {
  destroy() {
    this.snakeManager.destroy();
    this.foodManager.destroy();
    this.cameraManager.destroy();
    this.uiManager.destroy();
    this.musicManager.destroy();
    
    // Clear listeners
    this.eventListeners.forEach(({el, ev, fn}) => {
      el.removeEventListener(ev, fn);
    });
    
    // Clear timers
    if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
    
    // Dereference
    this.canvas = null;
    this.ctx = null;
  }
}
```

### ADR-011: I18n Implementation
**Decision**: Runtime language switching with localStorage
**Supported Languages**: English, 中文, 日本語

**Structure**:
```javascript
const i18n = {
  en: {
    game_title: "Snake Adventure",
    score: "Score: {score}",
    length: "Length: {length}",
    game_over: "Game Over!",
    // ...
  },
  zh: {
    game_title: "贪吃蛇冒险",
    score: "分数: {score}",
    // ...
  }
};
```

**Rationale**:
- Follows CLAUDE.md mandate
- No hardcoded text
- Easy to add languages
- Persists user preference

### ADR-012: Performance Budget
**Target Metrics**:
- Desktop: 60 FPS steady
- Mobile: 30+ FPS minimum
- Startup: <1 second (no assets to load)
- Memory: <50MB

**Optimization Strategies**:
- Object pooling (particles, food)
- Spatial partitioning (collision)
- RequestAnimationFrame loop
- Minimize DOM manipulation
- Canvas layer caching (future)

## Trade-offs Accepted

### 1. No Multiplayer (MVP)
**Reason**: Adds significant complexity (networking, sync, lag compensation)
**Future**: Can add local multiplayer first, then online

### 2. Procedural Graphics Only
**Reason**: Faster startup, smaller bundle
**Trade-off**: Less artistic detail than hand-drawn sprites
**Mitigation**: Use gradients, glows, and effects for visual appeal

### 3. Limited Browser Support
**Target**: Modern browsers only (ES6+ support)
**Reason**: Cleaner code, better performance
**Coverage**: >95% of target audience

## Future Considerations

### Performance Enhancements
- OffscreenCanvas for background rendering
- Web Workers for collision detection
- WASM for physics (if needed)

### Feature Additions
- Power-up system (manager pattern extension)
- Different game modes (time attack, survival)
- Procedural arena generation
- Replay system

### Technical Debt to Monitor
- Particle pool size (may need dynamic sizing)
- Spatial hash grid cell size tuning
- Camera smoothing parameters
- Collision detection accuracy vs performance
