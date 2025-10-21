# Runner Adventure - Module Structure

This document describes the modular architecture of Runner Adventure game.

## Directory Structure

```
/js/
├── core/
│   ├── config.js         # Game configuration and constants
│   └── GameState.js      # Game state management (score, speed, power-ups)
├── spawners/
│   ├── GroundDecorator.js    # Ground decoration spawner
│   ├── ObstacleSpawner.js    # Obstacle (cactus) spawner
│   ├── CoinSpawner.js        # Coin spawner (with different types)
│   └── PowerUpSpawner.js     # Power-up spawner
├── pose/
│   ├── PoseDetector.js   # MediaPipe pose detection logic
│   └── CameraManager.js  # Camera control and management
└── README.md            # This file
```

## Module Descriptions

### Core Modules

#### `core/config.js`
**Purpose:** Centralized configuration and constants

**Exports:**
- `GAME_CONFIG` - Game physics, timing, and balance settings
- `COLORS` - Color palette for UI
- `COIN_TYPES` - Coin type configurations (star, diamond, ruby, coin)
- `POWERUP_TYPES` - Power-up configurations (speed-boost, slow-motion, super-jump)
- `DECO_CONFIGS` - Ground decoration configurations
- `POSE_TYPES` - Available pose types
- `MUSIC_TRACKS` - Background music track names

**Usage:**
```javascript
import { GAME_CONFIG, COIN_TYPES } from './core/config.js';
```

#### `core/GameState.js`
**Purpose:** Manages all game state including score, speed, combos, and power-ups

**Key Methods:**
- `updateSpeed()` - Auto-increase speed based on score
- `activatePowerUp(type, duration)` - Activate power-up effect
- `incrementCombo()` - Increment combo counter
- `addScore(baseScore)` - Add score with combo multiplier
- `updateHighScore()` - Update high score in localStorage

**Usage:**
```javascript
import { GameState } from './core/GameState.js';
const gameState = new GameState();
gameState.activatePowerUp('speed-boost', 5);
```

### Spawner Modules

All spawners follow the same pattern:
- Constructor takes `(k, groundY, speed, getGameSpeed)`
- `spawn()` - Creates one instance
- `startSpawning(interval)` - Starts continuous spawning

#### `spawners/GroundDecorator.js`
Spawns decorative elements (grass, bushes, pebbles, mushrooms) on the ground.

#### `spawners/ObstacleSpawner.js`
Spawns cactus obstacles that player must jump over.

#### `spawners/CoinSpawner.js`
Spawns collectible coins with different types:
- Regular coin (70%)
- Star (15%) - with sparkle effects
- Ruby (10%)
- Diamond (5%)

#### `spawners/PowerUpSpawner.js`
Spawns power-ups with floating and glow effects:
- Speed Boost ⚡ (1.5x speed, 5s)
- Slow Motion 🕐 (0.6x speed, 5s)
- Super Jump 🦘 (1.6x jump, 8s)

### Pose Detection Modules

#### `pose/PoseDetector.js`
**Purpose:** Handle MediaPipe pose detection

**Key Methods:**
- `init(onResultsCallback)` - Initialize MediaPipe Pose
- `detectOneHandUp(landmarks)` - Detect one hand raised
- `detectArmsSpread(landmarks)` - Detect T-pose
- `detectOneLegRaised(landmarks)` - Detect one leg raised
- `detectHandsOnHead(landmarks)` - Detect hands on head
- `setPoseType(type)` - Set active pose type
- `canJump()` - Check if can jump (with cooldown)

**Usage:**
```javascript
import { PoseDetector } from './pose/PoseDetector.js';
const poseDetector = new PoseDetector();
poseDetector.init((detected) => {
    console.log('Pose detected:', detected);
});
poseDetector.setPoseType('one-hand');
```

#### `pose/CameraManager.js`
**Purpose:** Manage camera for pose detection

**Key Methods:**
- `start()` - Start camera with optimized settings
- `stop()` - Stop camera
- `toggle()` - Toggle camera on/off
- `isActive()` - Check if camera is running

**Usage:**
```javascript
import { CameraManager } from './pose/CameraManager.js';
const cameraManager = new CameraManager(videoElement, poseDetector);
await cameraManager.start();
```

## Integration Pattern

### Basic Integration

```javascript
// Import modules
import { GAME_CONFIG } from './js/core/config.js';
import { GameState } from './js/core/GameState.js';
import { ObstacleSpawner } from './js/spawners/ObstacleSpawner.js';
import { PoseDetector } from './js/pose/PoseDetector.js';
import { CameraManager } from './js/pose/CameraManager.js';

// Initialize game state
const gameState = new GameState();

// Create spawners with gameSpeed getter
const obstacleSpawner = new ObstacleSpawner(
    k,
    groundY,
    GAME_CONFIG.OBSTACLE_SPEED,
    () => gameState.gameSpeed
);

// Start spawning
obstacleSpawner.startSpawning();

// Update loop
k.onUpdate(() => {
    gameState.updateSpeed();
    gameState.updatePowerUp(k.dt());
    gameState.updateCombo(k.dt());
});
```

## Benefits of Modularization

1. **Separation of Concerns** - Each module has a single responsibility
2. **Reusability** - Spawners can be reused in different contexts
3. **Maintainability** - Easy to find and fix bugs
4. **Testability** - Each module can be tested independently
5. **Scalability** - Easy to add new features (new spawners, power-ups, etc.)
6. **Configuration** - All game balance in one place (`config.js`)

## Adding New Features

### Adding a New Coin Type

Edit `js/core/config.js`:
```javascript
export const COIN_TYPES = [
    // ... existing types
    {
        name: "emerald",
        probability: 5,
        color: [0, 255, 0],
        scale: 0.06,
        value: 300,
        rotate: false,
        special: true
    }
];
```

### Adding a New Power-Up

1. Add to `config.js`:
```javascript
export const POWERUP_TYPES = [
    // ... existing types
    {
        name: "shield",
        emoji: "🛡️",
        color: [200, 200, 255],
        duration: 10,
        description: "Shield!",
        invincible: true
    }
];
```

2. Handle in game logic:
```javascript
if (type === "shield") {
    gameState.invincible = true;
}
```

### Adding a New Spawner

1. Create `/js/spawners/NewSpawner.js`
2. Follow existing spawner pattern
3. Import and use in game scene

## Future Improvements

- [ ] Extract scene management (menu, game, gameover)
- [ ] Create AudioManager module for music/sound effects
- [ ] Create ParticleSystem module for visual effects
- [ ] Add unit tests for each module
- [ ] Create a build system (webpack/vite) for production
