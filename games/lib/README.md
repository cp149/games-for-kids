# KAPLAY Game Extensions

Universal, reusable game system modules for KAPLAY games.

**Shared Library Location:** `/games/lib/` - Available for all games

## 📦 Module List

### 🎮 Core Game Systems

### ⭐ ParticleEffects.js
Particle effects system

```javascript
import { ParticleEffectManager } from '../lib/effects/ParticleEffects.js';

const particles = new ParticleEffectManager(k);

// Coin burst
particles.coinBurst(pos, 8, "coin");

// Color burst
particles.colorBurst(pos, [255, 0, 0], 12);

// Expanding rings
particles.expandingRings(pos, [0, 255, 0], 3);

// Rainbow burst
particles.rainbowBurst(pos, 30, hslToRgb);

// Rainbow flash
particles.rainbowFlash();

// Landing dust
particles.landingDust(playerPos, groundY, 6);

// Generic explosion
particles.explosion(pos, {
    count: 20,
    color: [255, 100, 0],
    size: 8,
    speed: [100, 300],
    lifespan: 0.5,
    shape: "circle" // or "rect"
});
```

### ⭐ ComboSystem.js
Combo tracking system

```javascript
import { ComboSystem } from '../lib/game/ComboSystem.js';

const comboSystem = new ComboSystem(k, {
    timeout: 3, // 3 seconds timeout
    tiers: [
        { min: 0, multiplier: 1 },
        { min: 5, multiplier: 1.5 },
        { min: 10, multiplier: 2 },
        { min: 20, multiplier: 3 }
    ],
    colors: [
        { min: 0, color: [255, 255, 255] },
        { min: 5, color: [255, 255, 0] },
        { min: 10, color: [255, 165, 0] },
        { min: 20, color: [255, 0, 0] }
    ]
});

// Set callbacks
comboSystem.onComboChange = (combo, multiplier) => {
    console.log(`Combo: ${combo}, Multiplier: ${multiplier}`);
};

comboSystem.onLevelUp = (level) => {
    console.log(`Combo level up! Level: ${level}`);
};

// Increment combo
const multiplier = comboSystem.increment();

// Update every frame
k.onUpdate(() => {
    comboSystem.update(k.dt());
});

// Get info
comboSystem.getCombo();        // Current combo count
comboSystem.getMultiplier();   // Current multiplier
comboSystem.getColor();        // Current color
comboSystem.getTimeLeft();     // Time remaining
comboSystem.getProgress();     // Progress (0-1)
```

### ⭐ AudioUtils.js
Audio utilities

```javascript
import {
    playJumpSound,
    playCoinSound,
    playGameOverSound,
    playComboUpSound,
    playSpecialCoinSound,
    playBeep
} from '../lib/audio/AudioUtils.js';

// Jump sound
playJumpSound();

// Coin sound
playCoinSound();

// Game over sound
playGameOverSound();

// Combo level up sound (pitch increases with level)
playComboUpSound(3);

// Special coin sounds
playSpecialCoinSound("star");    // Star
playSpecialCoinSound("diamond"); // Diamond
playSpecialCoinSound("ruby");    // Ruby

// Generic beep
playBeep(440, 0.1, 0.3); // frequency, duration, volume
```

### ⭐ ColorUtils.js
Color utilities

```javascript
import {
    hslToRgb,
    rgbToHsl,
    interpolateColor,
    rainbowColor,
    darkenColor,
    lightenColor,
    hexToRgb,
    rgbToHex
} from '../lib/utils/ColorUtils.js';

// HSL to RGB
const rgb = hslToRgb(0.5, 1, 0.5); // [r, g, b]

// RGB to HSL
const hsl = rgbToHsl(255, 0, 0); // [h, s, l]

// Color interpolation
const mixed = interpolateColor([255, 0, 0], [0, 0, 255], 0.5);

// Rainbow color
const rainbow = rainbowColor(120); // angle 0-360

// Darken/lighten
const darker = darkenColor([255, 100, 50], 0.3);
const lighter = lightenColor([255, 100, 50], 0.3);

// Hex conversion
const rgbFromHex = hexToRgb("#FF5733");
const hexFromRgb = rgbToHex(255, 87, 51); // "#FF5733"
```

### 📊 Score & Progress Systems

### ⭐ ScoreManager.js
Complete score management system

```javascript
import { ScoreManager } from '../lib/game/ScoreManager.js';

const score = new ScoreManager({
    starThresholds: [100, 250, 500],  // 1-3 star thresholds
    comboTimeout: 3,                   // Combo timeout
    maxComboMultiplier: 5,             // Max multiplier
    storageKey: 'my_game_highscore'    // localStorage key
});

// Add points
score.addPoints(10);

// Increase combo
score.increaseCombo();
score.addPoints(20);  // Automatically applies multiplier

// Get status
score.getScore();        // Current score
score.getStars();        // Star rating (0-3)
score.getHighScore();    // High score
score.getStats();        // All statistics

// Event listeners
score.on('scoreChange', (newScore, pointsAdded) => {
    console.log(`Score: ${newScore} (+${pointsAdded})`);
});

score.on('newHighScore', (highScore) => {
    console.log(`New record: ${highScore}!`);
});
```

### 🌍 Internationalization

### ⭐ SimpleI18n.js
Multi-language support

```javascript
import { SimpleI18n } from '../lib/i18n/SimpleI18n.js';

const i18n = new SimpleI18n('en');

// Add translations
i18n.addTranslations({
    en: {
        welcome: "Welcome!",
        score: "Score: {0}",
        greeting: "Hello, {0}!"
    },
    zh: {
        welcome: "欢迎！",
        score: "得分：{0}",
        greeting: "你好，{0}！"
    },
    ja: {
        welcome: "ようこそ！",
        score: "スコア：{0}",
        greeting: "こんにちは、{0}！"
    }
});

// Use translations
i18n.t('welcome');           // "Welcome!"
i18n.t('score', 100);        // "Score: 100"
i18n.t('greeting', 'Alice'); // "Hello, Alice!"

// Switch language
i18n.setLanguage('zh');
i18n.t('welcome');           // "欢迎！"

// Listen to language changes
i18n.onLanguageChange((lang) => {
    console.log(`Language changed to: ${lang}`);
    updateUI();
});
```

### 🎨 UI Component System

### ⭐ UIComponents.js
KAPLAY game UI component library

```javascript
import { UIComponents } from '../lib/ui/UIComponents.js';

const ui = new UIComponents(k, i18n); // i18n optional

// Create button
const btn = ui.createButton(
    k.center(),
    'start',  // Text or i18n key
    () => k.go('game'),
    {
        width: 200,
        height: 60,
        color: [100, 200, 255],
        fontSize: 24
    }
);

// Create modal
const modal = ui.createModal(
    'Game Over',
    'Your score: 100',
    [
        { text: 'Retry', action: () => k.go('game') },
        { text: 'Menu', action: () => k.go('menu') }
    ]
);

// Create progress bar
const progressBar = ui.createProgressBar(
    k.vec2(100, 50),
    200,
    20,
    0.75  // 75%
);

// Display stars
const stars = ui.createStars(k.center(), 3, 40);
```

### 🔊 Text-to-Speech System

### ⭐ TextToSpeech.js
Web Speech API text-to-speech

```javascript
import { TextToSpeech } from '../lib/audio/TextToSpeech.js';

const tts = new TextToSpeech(i18n, {
    rate: 1,      // Speech rate 0.1-10
    pitch: 1,     // Pitch 0-2
    volume: 1     // Volume 0-1
});

// Speak text
tts.speak('Hello World!');

// Speak i18n key
tts.speakKey('welcome');

// Stop speaking
tts.stop();

// Pause/resume
tts.pause();
tts.resume();
```

## 📂 Directory Structure

```
/games/
├── lib/                           # Shared library (cross-game)
│   ├── effects/                   # Visual effects
│   │   └── ParticleEffects.js     - Particle effects system
│   ├── game/                      # Game systems
│   │   ├── ComboSystem.js         - Combo tracking
│   │   └── ScoreManager.js        - Score management
│   ├── audio/                     # Audio systems
│   │   ├── AudioUtils.js          - Sound effects
│   │   └── TextToSpeech.js        - Text-to-speech
│   ├── utils/                     # Utilities
│   │   └── ColorUtils.js          - Color utilities
│   ├── ui/                        # UI components
│   │   └── UIComponents.js        - UI library
│   ├── i18n/                      # Internationalization
│   │   └── SimpleI18n.js          - Multi-language support
│   └── README.md                  - This document
├── runner-adventure/              # Game 1
│   └── index.html
├── memory-match/                  # Game 2
│   └── index.html
└── ...                            # Other games
```

## 🎯 Game-Specific Classes (kept in each game's index.html)

The following classes contain game-specific configurations and are not suitable as generic libraries:

- `GroundDecorator` - Ground decoration generator (game-specific config)
- `ObstacleSpawner` - Obstacle spawner (could be generalized)
- `CoinSpawner` - Coin spawner (game-specific coin types)

## 💡 Usage Guide

### Import in Game HTML (ES6 Modules)

Reference shared library from game directory (using relative path `../lib/category/`):

```html
<script type="module">
    import { ParticleEffectManager } from '../lib/effects/ParticleEffects.js';
    import { ComboSystem } from '../lib/game/ComboSystem.js';
    import { ScoreManager } from '../lib/game/ScoreManager.js';
    import { hslToRgb } from '../lib/utils/ColorUtils.js';
    import { SimpleI18n } from '../lib/i18n/SimpleI18n.js';
    import { UIComponents } from '../lib/ui/UIComponents.js';
    import * as Audio from '../lib/audio/AudioUtils.js';

    // Use these classes...
</script>
```

### Non-Module Usage (requires removing export)

If not using ES6 modules:
1. Remove all `export` keywords
2. Reference directly in `<script>` tags

## 🔧 Future Extension Suggestions

Additional generic modules that could be added:

- `EntitySpawner.js` - Generic entity spawner
- `ScrollingBackground.js` - Scrolling background system
- `CameraEffects.js` - Camera shake, zoom, etc.
- `InputManager.js` - Input management system
- `SaveManager.js` - Game save system
- `AchievementSystem.js` - Achievement system

## 📄 License

These utilities are free to use in any KAPLAY project.
