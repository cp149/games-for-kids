# UIComponents - Kid-Friendly UI Components

Reusable UI components for KAPLAY games with kid-friendly design and animations.

## Features

- ✅ Interactive buttons with hover effects
- ✅ Modal dialogs
- ✅ Progress bars
- ✅ Star rating displays
- ✅ Menus
- ✅ Toast notifications
- ✅ Countdown timers
- ✅ Customizable themes
- ✅ i18n support (multi-language)
- ✅ Touch and mouse friendly

## Installation

```javascript
import { UIComponents } from '../lib/extensions/ui/UIComponents.js';
```

## Quick Start

```javascript
import kaplay from 'kaplay';
import { UIComponents } from '../lib/extensions/ui/UIComponents.js';
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';

const k = kaplay();
const i18n = new SimpleI18n('en');
const ui = new UIComponents(k, i18n);

// Create a button
const startBtn = ui.createButton(
    k.center(),
    'start_game',      // i18n key
    () => k.go('game') // onClick handler
);

// Create a modal
ui.createModal(
    'game_over',       // title (i18n key)
    'final_score',     // message (i18n key)
    [
        { text: 'retry', onClick: () => k.go('game') },
        { text: 'menu', onClick: () => k.go('menu') }
    ]
);

// Show a toast notification
ui.showToast('level_complete', { duration: 3 });
```

## API Reference

### Constructor

#### `new UIComponents(k, i18n)`
Create new UI components instance.

**Parameters:**
- `k` (Object) - KAPLAY instance
- `i18n` (SimpleI18n) - i18n instance (optional)

### Methods

#### `createButton(pos, text, onClick, options)`
Create an interactive button.

**Parameters:**
- `pos` (Object) - Position {x, y}
- `text` (string) - Button text or i18n key
- `onClick` (Function) - Click handler
- `options` (Object) - Button options

**Options:**
- `width` (number) - Button width (default: 200)
- `height` (number) - Button height (default: 60)
- `color` (Array) - RGB color (default: theme.primary)
- `hoverColor` (Array) - RGB hover color (default: theme.secondary)
- `textColor` (Array) - Text RGB color (default: theme.text)
- `fontSize` (number) - Font size (default: 24)
- `radius` (number) - Border radius (default: 8)
- `useI18n` (boolean) - Use i18n for text (default: true)

**Returns:** Button game object with `label` property

**Example:**
```javascript
const playBtn = ui.createButton(
    { x: 400, y: 300 },
    'play',
    () => console.log('Play clicked!'),
    {
        width: 250,
        height: 70,
        fontSize: 28,
        color: [100, 200, 100],
        hoverColor: [120, 220, 120]
    }
);
```

#### `createModal(title, message, buttons, options)`
Create a modal dialog.

**Parameters:**
- `title` (string) - Modal title or i18n key
- `message` (string) - Modal message or i18n key
- `buttons` (Array) - Array of `{text, onClick}` objects
- `options` (Object) - Modal options

**Options:**
- `width` (number) - Modal width (default: 400)
- `height` (number) - Modal height (default: 300)
- `useI18n` (boolean) - Use i18n (default: true)

**Returns:** Object with `objects` array and `close()` method

**Example:**
```javascript
const modal = ui.createModal(
    'confirm_quit',
    'are_you_sure',
    [
        { text: 'yes', onClick: () => k.quit() },
        { text: 'no', onClick: () => modal.close() }
    ],
    { width: 500, height: 350 }
);
```

#### `createProgressBar(pos, options)`
Create a progress bar.

**Parameters:**
- `pos` (Object) - Position {x, y}
- `options` (Object) - Progress bar options

**Options:**
- `width` (number) - Bar width (default: 200)
- `height` (number) - Bar height (default: 20)
- `maxValue` (number) - Maximum value (default: 100)
- `currentValue` (number) - Starting value (default: 0)
- `color` (Array) - Fill RGB color (default: theme.success)
- `backgroundColor` (Array) - Background RGB (default: [80,80,80])
- `showText` (boolean) - Show value text (default: true)

**Returns:** Object with `update(newValue)` method

**Example:**
```javascript
const healthBar = ui.createProgressBar(
    { x: 100, y: 50 },
    { maxValue: 100, currentValue: 75, color: [220, 80, 80] }
);

// Update progress
player.onUpdate(() => {
    healthBar.update(player.health);
});
```

#### `createStars(pos, stars, options)`
Create a star rating display.

**Parameters:**
- `pos` (Object) - Position {x, y}
- `stars` (number) - Number of filled stars (0-3)
- `options` (Object) - Star options

**Options:**
- `maxStars` (number) - Total stars (default: 3)
- `size` (number) - Star size (default: 50)
- `spacing` (number) - Space between stars (default: 60)
- `filledColor` (Array) - Filled star RGB (default: [255,215,0])
- `emptyColor` (Array) - Empty star RGB (default: [150,150,150])

**Returns:** Object with `update(newStars)` method

**Example:**
```javascript
// Game over scene
const starDisplay = ui.createStars(k.center(), score.getStars());

// Update stars based on score
score.on('scoreChange', () => {
    starDisplay.update(score.getStars());
});
```

#### `createMenu(items, options)`
Create a simple menu.

**Parameters:**
- `items` (Array) - Array of `{text, onClick}` menu items
- `options` (Object) - Menu options

**Options:**
- `startY` (number) - Starting Y position
- `spacing` (number) - Space between items (default: 80)
- `useI18n` (boolean) - Use i18n (default: true)

**Returns:** Object with `objects` array and `destroy()` method

**Example:**
```javascript
const menu = ui.createMenu([
    { text: 'new_game', onClick: () => k.go('game') },
    { text: 'options', onClick: () => k.go('options') },
    { text: 'credits', onClick: () => k.go('credits') },
    { text: 'quit', onClick: () => k.quit() }
]);
```

#### `showToast(message, options)`
Show a temporary notification.

**Parameters:**
- `message` (string) - Message or i18n key
- `options` (Object) - Toast options

**Options:**
- `duration` (number) - Seconds to show (default: 2)
- `position` (string) - 'top', 'center', 'bottom' (default: 'top')
- `color` (Array) - Background RGB (default: theme.success)
- `useI18n` (boolean) - Use i18n (default: true)

**Example:**
```javascript
// Success message
ui.showToast('level_complete', { duration: 3, color: [100, 220, 100] });

// Warning message
ui.showToast('low_health', { position: 'center', color: [255, 200, 50] });

// Error message
ui.showToast('game_over', { position: 'bottom', color: [220, 80, 80] });
```

#### `createTimer(pos, seconds, onFinish, options)`
Create a countdown timer.

**Parameters:**
- `pos` (Object) - Position {x, y}
- `seconds` (number) - Starting seconds
- `onFinish` (Function) - Callback when timer reaches 0
- `options` (Object) - Timer options

**Options:**
- `fontSize` (number) - Font size (default: 48)
- `color` (Array) - Normal RGB color (default: theme.text)
- `warningColor` (Array) - Warning RGB (default: theme.warning)
- `dangerColor` (Array) - Danger RGB (default: theme.danger)
- `warningThreshold` (number) - Warning at N seconds (default: 10)
- `dangerThreshold` (number) - Danger at N seconds (default: 5)

**Returns:** Object with `pause()`, `resume()`, `getTimeLeft()`, `addTime()` methods

**Example:**
```javascript
const timer = ui.createTimer(
    { x: k.width() - 100, y: 50 },
    60,
    () => {
        console.log('Time up!');
        k.go('gameover');
    }
);

// Pause/resume
k.onKeyPress('p', () => timer.pause());
k.onKeyPress('r', () => timer.resume());

// Add bonus time
player.onCollide('timebonus', () => {
    timer.addTime(10);
});
```

#### `setTheme(themeColors)`
Customize UI theme colors.

**Parameters:**
- `themeColors` (Object) - Color definitions

**Example:**
```javascript
ui.setTheme({
    primary: [255, 100, 150],      // Pink
    secondary: [100, 150, 255],    // Light blue
    success: [150, 255, 100],      // Lime green
    danger: [255, 100, 100],       // Light red
    text: [255, 255, 255]          // White
});
```

## Complete Example

```javascript
import kaplay from 'kaplay';
import { UIComponents } from '../lib/extensions/ui/UIComponents.js';
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';
import { ScoreManager } from '../lib/extensions/scoring/ScoreManager.js';

const k = kaplay();
const i18n = new SimpleI18n('en');
const ui = new UIComponents(k, i18n);
const score = new ScoreManager();

// Add translations
i18n.addTranslations({
    en: {
        menu_title: "Kids Game",
        play: "Play",
        options: "Options",
        quit: "Quit",
        score: "Score",
        time: "Time",
        game_over: "Game Over",
        final_score: "Your Score: {0}",
        retry: "Try Again",
        menu: "Main Menu"
    },
    zh: {
        menu_title: "儿童游戏",
        play: "开始游戏",
        options: "选项",
        quit: "退出",
        score: "得分",
        time: "时间",
        game_over: "游戏结束",
        final_score: "你的得分：{0}",
        retry: "再试一次",
        menu: "主菜单"
    }
});

// Menu scene
k.scene('menu', () => {
    k.add([
        k.text(i18n.t('menu_title'), { size: 64 }),
        k.pos(k.center().sub(0, 150)),
        k.anchor('center'),
        k.color(255, 255, 255)
    ]);

    ui.createMenu([
        { text: 'play', onClick: () => k.go('game') },
        { text: 'options', onClick: () => k.go('options') },
        { text: 'quit', onClick: () => k.quit() }
    ]);
});

// Game scene
k.scene('game', () => {
    score.reset();

    // Score display
    const scoreText = k.add([
        k.text(`${i18n.t('score')}: ${score.getScore()}`, { size: 24 }),
        k.pos(20, 20)
    ]);

    score.on('scoreChange', () => {
        scoreText.text = `${i18n.t('score')}: ${score.getScore()}`;
    });

    // Timer
    const timer = ui.createTimer(
        { x: k.width() - 100, y: 50 },
        60,
        () => k.go('gameover', score.getStats())
    );

    // Progress bar for health
    const healthBar = ui.createProgressBar(
        { x: k.width() / 2, y: 30 },
        { maxValue: 100, currentValue: 100 }
    );

    // Game logic...
    const player = k.add([
        k.rect(40, 40),
        k.pos(k.center()),
        k.area(),
        k.body(),
        { health: 100 }
    ]);

    player.onUpdate(() => {
        healthBar.update(player.health);
    });

    player.onCollide('coin', (coin) => {
        k.destroy(coin);
        score.addPoints(10);
        ui.showToast('coin_collected', { duration: 1 });
    });
});

// Game over scene
k.scene('gameover', (stats) => {
    k.add([
        k.text(i18n.t('game_over'), { size: 56 }),
        k.pos(k.center().sub(0, 150)),
        k.anchor('center')
    ]);

    k.add([
        k.text(i18n.t('final_score', stats.score), { size: 32 }),
        k.pos(k.center().sub(0, 80)),
        k.anchor('center')
    ]);

    // Star rating
    ui.createStars(
        k.center().sub(0, 20),
        stats.stars,
        { size: 60, spacing: 80 }
    );

    ui.createMenu([
        { text: 'retry', onClick: () => k.go('game') },
        { text: 'menu', onClick: () => k.go('menu') }
    ], { startY: k.center().y + 100, spacing: 70 });
});

k.go('menu');
```

## Default Theme

```javascript
{
    primary: [100, 200, 255],       // Light blue
    secondary: [255, 200, 100],     // Orange
    success: [100, 220, 100],       // Green
    danger: [220, 80, 80],          // Red
    warning: [255, 200, 50],        // Yellow
    text: [255, 255, 255],          // White
    textDark: [50, 50, 50],         // Dark gray
    background: [50, 50, 80],       // Dark blue
    overlay: [0, 0, 0, 0.7]         // Semi-transparent black
}
```

## Best Practices

1. **Always use i18n keys**: Makes games multi-language by default
2. **Consistent spacing**: Use multiples of 10 or 20 for positions
3. **Destroy modals properly**: Store modal reference and call `close()` when done
4. **Update UI on events**: Use score/game events to update UI elements
5. **Test on mobile**: Ensure buttons are large enough for touch (min 60px)
6. **Use themes**: Customize theme colors for consistent look
7. **Provide feedback**: Use toasts for quick feedback, modals for important messages

## Performance

- Lightweight components using KAPLAY primitives
- No heavy dependencies
- GPU-accelerated rendering
- Efficient event handling

## License

MIT
