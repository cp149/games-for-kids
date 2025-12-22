# KAPLAY Integration Guide

## Quick Start

KAPLAY is our core game engine. This guide shows how to integrate it into our project.

## Installation

### Option 1: CDN (Recommended)

```html
<!-- In your game HTML -->
<script type="module">
    import kaplay from "https://unpkg.com/kaplay@3001.0.0/dist/kaplay.mjs";

    const k = kaplay();
    // Your game code here
</script>
```

**Pros:**
- Always up-to-date
- No local files to maintain
- Cached by browser

**Cons:**
- Requires internet connection
- CDN dependency

### Option 2: Local Copy

```bash
# Download KAPLAY
cd /lib
curl -O https://unpkg.com/kaplay@3001.0.0/dist/kaplay.mjs
```

```javascript
// In your game
import kaplay from '../lib/kaplay.mjs';
```

**Pros:**
- Works offline
- Full control over version

**Cons:**
- Manual updates
- Larger repository size

## Basic Game Structure

```javascript
import kaplay from "kaplay";

// Initialize KAPLAY
const k = kaplay({
    width: 800,
    height: 600,
    background: [135, 206, 235], // Sky blue
    canvas: document.querySelector('#game-canvas')
});

// Load assets
k.loadSprite("player", "assets/images/player.png");
k.loadSprite("obstacle", "assets/images/obstacle.png");
k.loadSound("jump", "assets/sounds/jump.mp3");

// Create game scene
k.scene("game", () => {
    // Add player
    const player = k.add([
        k.sprite("player"),
        k.pos(100, 100),
        k.area(),
        k.body(),
        "player" // Tag
    ]);

    // Add controls
    k.onKeyPress("space", () => {
        player.jump(500);
        k.play("jump");
    });

    // Add obstacles
    k.loop(2, () => {
        k.add([
            k.sprite("obstacle"),
            k.pos(k.width(), k.rand(100, 300)),
            k.area(),
            k.move(k.LEFT, 200),
            "obstacle"
        ]);
    });

    // Collision detection
    player.onCollide("obstacle", () => {
        k.go("gameover");
    });
});

// Game over scene
k.scene("gameover", () => {
    k.add([
        k.text("Game Over!"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center")
    ]);

    k.onKeyPress("space", () => {
        k.go("game");
    });
});

// Start game
k.go("game");
```

## Core Concepts

### 1. Components

KAPLAY uses a component-based architecture:

```javascript
const obj = k.add([
    k.sprite("player"),      // Component: sprite rendering
    k.pos(100, 100),        // Component: position
    k.area(),               // Component: collision box
    k.body(),               // Component: physics (gravity, jumping)
    k.health(3),            // Component: health system
    "player"                // Tag for identification
]);
```

### 2. Tags

Tags are used to identify and query objects:

```javascript
// Add with tag
const enemy = k.add([
    k.sprite("enemy"),
    "enemy"
]);

// Query by tag
k.get("enemy").forEach(e => {
    e.hurt(1);
});

// Destroy all
k.destroyAll("enemy");
```

### 3. Events

```javascript
// Keyboard
k.onKeyPress("space", () => {});
k.onKeyDown("left", () => {});
k.onKeyRelease("right", () => {});

// Mouse
k.onClick(() => {});
k.onMouseMove((pos) => {});

// Touch
k.onTouchStart(() => {});

// Game loop
k.onUpdate(() => {
    // Called every frame
});

// Custom events
k.on("victory", () => {
    console.log("Player won!");
});

k.trigger("victory");
```

### 4. Scenes

Scenes represent different game states:

```javascript
// Menu scene
k.scene("menu", () => {
    k.add([
        k.text("Press SPACE to start"),
        k.pos(k.center()),
        k.anchor("center")
    ]);

    k.onKeyPress("space", () => {
        k.go("game");
    });
});

// Game scene
k.scene("game", () => {
    // Game logic
});

// Go to scene
k.go("menu");
```

## Integration with Our Extensions

### With SimpleI18n

```javascript
import kaplay from "kaplay";
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';

const k = kaplay();
const i18n = new SimpleI18n('en');

// Load translations
i18n.addTranslations({
    en: { start: "Start Game", victory: "You Win!" },
    zh: { start: "开始游戏", victory: "你赢了！" },
    ja: { start: "ゲーム開始", victory: "勝利！" }
});

// Use in game
k.add([
    k.text(i18n.t('start')),
    k.pos(k.center())
]);

k.on('victory', () => {
    k.add([
        k.text(i18n.t('victory')),
        k.pos(k.center())
    ]);
});
```

### With TextToSpeech

```javascript
import { TextToSpeech } from '../lib/extensions/tts/TextToSpeech.js';

const tts = new TextToSpeech(i18n);

k.on('game-start', () => {
    tts.speakKey('start');
});

k.on('victory', () => {
    tts.speakKey('victory');
});
```

### With ScoreManager

```javascript
import { ScoreManager } from '../lib/extensions/scoring/ScoreManager.js';

const score = new ScoreManager();

// Display score
const scoreText = k.add([
    k.text(`Score: ${score.getScore()}`),
    k.pos(10, 10)
]);

k.onUpdate(() => {
    scoreText.text = `Score: ${score.getScore()}`;
});

// Add points
player.onCollide("coin", (coin) => {
    score.addPoints(10);
    k.destroy(coin);
});
```

## Common Patterns

### Player Movement

```javascript
const SPEED = 200;

k.onUpdate(() => {
    // Keyboard controls
    if (k.isKeyDown("left")) {
        player.move(-SPEED, 0);
    }
    if (k.isKeyDown("right")) {
        player.move(SPEED, 0);
    }
});

// Or use built-in keyboard controls
k.onKeyDown("left", () => {
    player.move(-SPEED, 0);
});
```

### Jumping

```javascript
const player = k.add([
    k.sprite("player"),
    k.pos(100, 100),
    k.area(),
    k.body(), // Adds gravity and jump()
]);

k.onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump(500);
    }
});
```

### Spawning Objects

```javascript
// Spawn every 2 seconds
k.loop(2, () => {
    k.add([
        k.sprite("obstacle"),
        k.pos(k.width(), k.rand(100, 300)),
        k.area(),
        k.move(k.LEFT, 200),
        k.offscreen({ destroy: true }), // Auto-destroy when off-screen
        "obstacle"
    ]);
});
```

### Animations

```javascript
// Load sprite with frames
k.loadSprite("player", "player.png", {
    sliceX: 4, // 4 frames horizontally
    sliceY: 1,
    anims: {
        "idle": { from: 0, to: 1, loop: true },
        "run": { from: 2, to: 3, loop: true, speed: 10 }
    }
});

// Play animation
player.play("run");

// Stop animation
player.stop();
```

### Particle Effects

```javascript
// Simple particle effect
k.add([
    k.pos(player.pos),
    k.rect(5, 5),
    k.color(255, 255, 0),
    k.lifespan(0.5), // Destroy after 0.5s
    k.move(k.rand(0, 360), k.rand(100, 200))
]);
```

## Mobile Support

```javascript
// Touch controls
let touchStartX = 0;

k.onTouchStart((pos) => {
    touchStartX = pos.x;
});

k.onTouchEnd((pos) => {
    const swipeDistance = pos.x - touchStartX;

    if (swipeDistance > 50) {
        // Swipe right
        player.jump();
    } else if (swipeDistance < -50) {
        // Swipe left
        player.crouch();
    }
});
```

## Performance Tips

1. **Use object pooling for frequent spawns**
```javascript
const obstaclePool = [];

function spawnObstacle() {
    let obstacle;
    if (obstaclePool.length > 0) {
        obstacle = obstaclePool.pop();
        obstacle.pos = k.vec2(k.width(), 100);
    } else {
        obstacle = k.add([...]);
    }
    return obstacle;
}
```

2. **Destroy off-screen objects**
```javascript
k.add([
    k.sprite("obstacle"),
    k.offscreen({ destroy: true })
]);
```

3. **Use layers for rendering order**
```javascript
// Background layer
k.add([
    k.sprite("bg"),
    k.layer("bg"),
    k.z(-10)
]);

// Game layer (default)
k.add([
    k.sprite("player"),
    k.z(0)
]);

// UI layer
k.add([
    k.text("Score: 0"),
    k.layer("ui"),
    k.z(10)
]);
```

## Debugging

```javascript
// Enable debug mode
const k = kaplay({
    debug: true
});

// Debug draw (shows collision boxes)
k.debug.inspect = true;

// Log info
k.debug.log("Player position:", player.pos);

// FPS counter
k.add([
    k.text(() => k.debug.fps()),
    k.pos(10, 10)
]);
```

## Complete Example: Simple Runner

See: `/games/runner-adventure/` (to be created)

## Resources

- **Official Docs:** https://kaplayjs.com/
- **Examples:** https://kaplayjs.com/examples/
- **Playground:** https://play.kaplayjs.com/
- **GitHub:** https://github.com/kaplayjs/kaplay

## Next Steps

1. Create runner game with KAPLAY
2. Build custom extensions (scoring, i18n, UI)
3. Integrate advanced features (MediaPipe, TTS)
4. Polish and optimize
