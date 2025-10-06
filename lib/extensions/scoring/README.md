# ScoreManager - Scoring System Extension

Advanced scoring system for games with combos, stars, and persistent high scores.

## Features

- ✅ Basic score tracking
- ✅ Star rating system (1-3 stars based on thresholds)
- ✅ Combo multipliers with timeout
- ✅ High score persistence (localStorage)
- ✅ Event-based score updates
- ✅ Customizable thresholds and multipliers
- ✅ Works with KAPLAY or standalone

## Installation

```javascript
import { ScoreManager } from '../lib/extensions/scoring/ScoreManager.js';
```

## Quick Start

```javascript
// Initialize with default settings
const score = new ScoreManager();

// Add points
score.addPoints(10);              // +10 points
score.increaseCombo();            // Start combo
score.addPoints(20);              // +40 points (2x multiplier)

// Get current score
console.log(score.getScore());    // 50

// Get star rating
console.log(score.getStars());    // 0-3 stars

// Get high score
console.log(score.getHighScore()); // Loaded from localStorage
```

## Configuration

```javascript
const score = new ScoreManager({
    starThresholds: [100, 250, 500],    // Points for 1, 2, 3 stars
    comboTimeout: 3,                     // Seconds before combo resets
    maxComboMultiplier: 5,               // Maximum multiplier (5x)
    storageKey: 'mygame_highscore'      // localStorage key
});
```

## API Reference

### Constructor

#### `new ScoreManager(options)`
Create new score manager.

**Options:**
- `starThresholds` (number[]) - Score needed for [1★, 2★, 3★] (default: [100, 250, 500])
- `comboTimeout` (number) - Seconds before combo resets (default: 3)
- `maxComboMultiplier` (number) - Max combo multiplier (default: 5)
- `storageKey` (string) - localStorage key (default: 'game_highscore')

### Methods

#### `addPoints(points, applyCombo = true)`
Add points to score.

**Parameters:**
- `points` (number) - Base points to add
- `applyCombo` (boolean) - Apply combo multiplier (default: true)

**Returns:** (number) Actual points added after multiplier

**Example:**
```javascript
score.addPoints(10);           // +10 points
score.addPoints(10, false);    // +10 points (no combo)
```

#### `increaseCombo()`
Increment combo and update multiplier.

**Example:**
```javascript
// Player makes consecutive successful actions
score.increaseCombo();  // combo: 1, multiplier: 1x
score.increaseCombo();  // combo: 2, multiplier: 1x
score.increaseCombo();  // combo: 3, multiplier: 2x
score.increaseCombo();  // combo: 4, multiplier: 2x
score.increaseCombo();  // combo: 5, multiplier: 2x
score.increaseCombo();  // combo: 6, multiplier: 3x
```

#### `resetCombo()`
Reset combo to zero and multiplier to 1x.

#### `getScore()`
Get current score.

**Returns:** (number) Current score

#### `getCombo()`
Get current combo count.

**Returns:** (number) Current combo

#### `getMultiplier()`
Get current combo multiplier.

**Returns:** (number) Current multiplier (1x, 2x, 3x, etc.)

#### `getStars()`
Get star rating based on current score.

**Returns:** (number) Stars (0-3)

#### `getHighScore()`
Get high score from localStorage.

**Returns:** (number) High score

#### `reset()`
Reset current score (not high score).

#### `resetHighScore()`
Reset high score (use with caution).

#### `getStats()`
Get all statistics.

**Returns:** (Object)
```javascript
{
    score: 150,
    combo: 5,
    multiplier: 2,
    stars: 2,
    highScore: 450
}
```

### Events

#### `on(event, callback)`
Register event listener.

**Events:**
- `scoreChange` - `(newScore, pointsAdded) => {}`
- `comboChange` - `(combo, multiplier) => {}`
- `newHighScore` - `(newHighScore) => {}`

**Example:**
```javascript
score.on('scoreChange', (newScore, pointsAdded) => {
    console.log(`Score: ${newScore} (+${pointsAdded})`);
});

score.on('comboChange', (combo, multiplier) => {
    console.log(`Combo: ${combo}x (${multiplier}x multiplier)`);
});

score.on('newHighScore', (newHighScore) => {
    console.log(`🎉 New High Score: ${newHighScore}!`);
});
```

## Usage with KAPLAY

```javascript
import kaplay from 'kaplay';
import { ScoreManager } from '../lib/extensions/scoring/ScoreManager.js';

const k = kaplay();
const score = new ScoreManager({
    starThresholds: [100, 200, 300],
    comboTimeout: 2
});

k.scene('game', () => {
    // Score display
    const scoreText = k.add([
        k.text(`Score: ${score.getScore()}`),
        k.pos(10, 10)
    ]);

    // Combo display
    const comboText = k.add([
        k.text(''),
        k.pos(10, 50),
        k.color(255, 200, 0)
    ]);

    // Update UI on score change
    score.on('scoreChange', (newScore) => {
        scoreText.text = `Score: ${newScore}`;
    });

    // Update combo display
    score.on('comboChange', (combo, multiplier) => {
        if (combo > 0) {
            comboText.text = `Combo: ${combo}x (${multiplier}x multiplier)`;
        } else {
            comboText.text = '';
        }
    });

    // New high score celebration
    score.on('newHighScore', (newHighScore) => {
        k.add([
            k.text('🎉 NEW HIGH SCORE! 🎉'),
            k.pos(k.center()),
            k.anchor('center'),
            k.lifespan(2)
        ]);
    });

    // Collect coin
    player.onCollide('coin', (coin) => {
        k.destroy(coin);
        score.increaseCombo();
        score.addPoints(10);
    });

    // Hit obstacle - reset combo
    player.onCollide('obstacle', () => {
        score.resetCombo();
        k.go('gameover', score.getStats());
    });
});

// Game over scene with stars
k.scene('gameover', (stats) => {
    k.add([
        k.text(`Final Score: ${stats.score}`),
        k.pos(k.center().sub(0, 50)),
        k.anchor('center')
    ]);

    // Display stars
    const stars = '⭐'.repeat(stats.stars) + '☆'.repeat(3 - stats.stars);
    k.add([
        k.text(stars),
        k.pos(k.center()),
        k.anchor('center'),
        k.scale(2)
    ]);

    k.add([
        k.text(`High Score: ${stats.highScore}`),
        k.pos(k.center().add(0, 50)),
        k.anchor('center')
    ]);
});
```

## Combo System

The combo system automatically calculates multipliers:

```
Combo 1-2:  1x multiplier
Combo 3-5:  2x multiplier
Combo 6-8:  3x multiplier
Combo 9-11: 4x multiplier
Combo 12+:  5x multiplier (max)
```

Formula: `multiplier = min(floor(1 + combo/3), maxComboMultiplier)`

Combo resets after 3 seconds of inactivity (configurable).

## Star Rating System

Default thresholds:
- ⭐ (1 star): 100 points
- ⭐⭐ (2 stars): 250 points
- ⭐⭐⭐ (3 stars): 500 points

Customize:
```javascript
score.setStarThresholds([50, 150, 300]);
```

## Local Storage

High scores are automatically saved to `localStorage` with the key `game_highscore` (or custom key).

**Browser Support:** All modern browsers, falls back gracefully if unavailable.

## Best Practices

1. **Call `increaseCombo()` for successful actions**: Matched cards, collected coins, etc.
2. **Call `resetCombo()` on failures**: Hit obstacle, wrong match, etc.
3. **Use events for UI updates**: Don't poll score values
4. **Set appropriate star thresholds**: Test to ensure achievability
5. **Reset score at game start**: `score.reset()` in scene initialization

## Performance

- Lightweight: ~4KB minified
- No dependencies
- Event-driven (no polling)
- Automatic cleanup with `clearTimeout`

## License

MIT
