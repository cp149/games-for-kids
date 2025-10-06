# Shared Library for Games

This directory contains reusable components that extend KAPLAY's functionality.

## Architecture

We use **KAPLAY** as our core game engine (80% of functionality):
- Game loop and scene management
- Sprite rendering and animation
- Physics and collision detection
- Input handling (keyboard, mouse, touch)
- Audio system
- Asset loading

We build **custom extensions** (20% of functionality) on top:
- Game-specific features KAPLAY doesn't provide
- Advanced integrations (MediaPipe, TTS)
- Custom UI components for kids games

## Directory Structure

```
lib/
├── extensions/              # Custom extensions for KAPLAY
│   ├── mediapipe/          # MediaPipe integration (hand tracking, gestures)
│   ├── tts/                # Text-to-Speech wrapper
│   ├── i18n/               # Multi-language support
│   ├── scoring/            # Scoring system (stars, combos)
│   └── ui/                 # Custom UI components (menus, modals)
└── kaplay.mjs              # KAPLAY library (from CDN or local)
```

## Extension Guidelines

All extensions should follow these principles:

### 1. Independence
- Each extension is self-contained
- Minimal dependencies between extensions
- Can be used independently

### 2. KAPLAY Integration
- Use KAPLAY's plugin system when possible
- Emit events that KAPLAY can listen to
- Don't fight the framework

### 3. Code Standards
- All code in English
- Follow OO principles (SOLID)
- Use ES6 modules
- Relative paths only
- No external dependencies (except MediaPipe/TTS SDKs)

### 4. Documentation
- Each extension has README.md
- JSDoc comments for all public APIs
- Usage examples

## Usage Example

```javascript
import kaplay from 'https://unpkg.com/kaplay@3001.0.0/dist/kaplay.mjs';
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';
import { ScoreManager } from '../lib/extensions/scoring/ScoreManager.js';
import { TextToSpeech } from '../lib/extensions/tts/TextToSpeech.js';
import { UIComponents } from '../lib/extensions/ui/UIComponents.js';

// Initialize KAPLAY
const k = kaplay({
    width: 800,
    height: 600,
    canvas: document.querySelector('#game')
});

// Initialize extensions
const i18n = new SimpleI18n('en');
const score = new ScoreManager();
const tts = new TextToSpeech(i18n);
const ui = new UIComponents(k, i18n);

// Add translations
i18n.addTranslations({
    en: { welcome: "Welcome!", victory: "You win!" },
    zh: { welcome: "欢迎！", victory: "你赢了！" },
    ja: { welcome: "ようこそ！", victory: "勝利！" }
});

// Create UI
const startBtn = ui.createButton(
    k.center(),
    'welcome',
    () => k.go('game')
);

// Use in game
k.on('victory', () => {
    score.addPoints(100);
    tts.speakKey('victory');
    ui.showToast('victory', { duration: 3 });
});
```

See `lib/extensions/EXAMPLE.html` for a complete working demo of all extensions.

## Extension Status

| Extension | Status | Description |
|-----------|--------|-------------|
| `i18n/` | ✅ Complete | Multi-language support with i18n keys and parameter replacement |
| `scoring/` | ✅ Complete | Scoring system with combos, stars, and persistent high scores |
| `tts/` | ✅ Complete | Text-to-Speech with Web Speech API and multi-language support |
| `ui/` | ✅ Complete | Kid-friendly UI components (buttons, modals, progress bars, stars) |
| `mediapipe/` | 🚧 Planned | Hand tracking and gesture recognition (Phase 3) |

## Development Plan

### ✅ Phase 1: Runner Game with KAPLAY Core (COMPLETE)
- ✅ Use KAPLAY for all game logic
- ✅ Standard keyboard/mouse controls
- ✅ Simple UI with KAPLAY built-ins
- **Result:** Working game in 3 hours

### ✅ Phase 2: Add Custom Extensions (COMPLETE)
- ✅ Port SimpleI18n to extension
- ✅ Build ScoreManager with combos and stars
- ✅ Create TextToSpeech wrapper
- ✅ Build UIComponents (buttons, modals, menus, etc.)
- **Result:** 4 production-ready extensions

### 🚧 Phase 3: Advanced Features (NEXT)
- Integrate MediaPipe for gestures
- Enhance runner game with sprites and animations
- Add visual polish and sound effects
- **Goal:** Advanced interactions in 3-4 days

## Resources

- **KAPLAY Docs:** https://kaplayjs.com/
- **MediaPipe:** https://mediapipe.dev/
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## Notes

- KAPLAY is loaded from CDN for faster updates
- Can switch to local copy if needed for offline development
- All extensions are optional - games can use only what they need
- Extensions can be shared across multiple games
