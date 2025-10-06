# External Integration Analysis: MediaPipe & TTS

## Overview

Comparing framework integration capabilities for:
- **MediaPipe** - Hand tracking, pose detection, gesture recognition
- **TTS** - Text-to-Speech for kids games

## Framework Integration Comparison

### 1. Custom Library (DIY) ⭐ BEST FOR INTEGRATION

**Ease of Integration:** ⭐⭐⭐⭐⭐ (5/5)

**Pros:**
- ✅ **Complete control** - Can integrate anything
- ✅ **No framework conflicts** - Full access to DOM/Canvas
- ✅ **Direct API access** - Call MediaPipe/TTS directly
- ✅ **Zero restrictions** - No framework limitations
- ✅ **Custom event system** - Perfect for external inputs

**Cons:**
- ❌ **Time to build** - 3-4 weeks for base engine
- ❌ **More code to maintain** - Everything is our responsibility

**Integration Example:**
```javascript
// MediaPipe Hand Tracking
import { Hands } from '@mediapipe/hands';

class InputManager {
    constructor() {
        this.keyboard = new KeyboardInput();
        this.mouse = new MouseInput();
        this.hands = new HandsInput(); // Custom integration
        this.voice = new VoiceInput();  // Custom integration
    }
}

// TTS
const tts = new TextToSpeech();
tts.speak('欢迎来玩游戏！', 'zh-CN');
```

**Integration Time:** 2-3 days per feature

---

### 2. KAPLAY ⭐ GOOD FOR INTEGRATION

**Ease of Integration:** ⭐⭐⭐⭐ (4/5)

**Pros:**
- ✅ **Flexible plugin system** - Can extend with custom code
- ✅ **Event-driven** - Good for external inputs
- ✅ **Access to game loop** - Can inject MediaPipe updates
- ✅ **Lightweight** - Doesn't block external libraries
- ✅ **Canvas accessible** - Can overlay MediaPipe debug view

**Cons:**
- ⚠️ Need to work within KAPLAY's game loop
- ⚠️ May need to map external events to KAPLAY events

**Integration Example:**
```javascript
import kaplay from "kaplay";
import { Hands } from '@mediapipe/hands';

const k = kaplay();

// Custom input plugin
k.plug({
    mediaPipe: null,

    initMediaPipe() {
        this.mediaPipe = new Hands({
            onResults: (results) => {
                // Convert hand landmarks to game events
                const gesture = detectGesture(results.landmarks);
                k.trigger('gesture', gesture);
            }
        });
    }
});

// Use in game
k.on('gesture', (gesture) => {
    if (gesture === 'swipe-left') {
        player.move(-10, 0);
    }
});

// TTS integration
function speak(text, lang = 'en-US') {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
}

k.on('victory', () => {
    speak('恭喜你！', 'zh-CN');
});
```

**Integration Time:** 3-4 days per feature

---

### 3. LittleJS ⭐⭐⭐ MODERATE

**Ease of Integration:** ⭐⭐⭐ (3/5)

**Pros:**
- ✅ **Modular architecture** - Can extend easily
- ✅ **No dependencies** - Won't conflict with external libs
- ✅ **Performance focused** - Good for real-time MediaPipe

**Cons:**
- ⚠️ More complex integration than KAPLAY
- ⚠️ Need to understand engine internals better
- ⚠️ Less documented for custom extensions

**Integration Example:**
```javascript
import { engineInit } from 'littlejs';
import { Hands } from '@mediapipe/hands';

// Custom input class
class MediaPipeInput {
    constructor() {
        this.hands = new Hands({...});
    }

    update() {
        // Process MediaPipe results
        // Convert to game inputs
    }
}

const mediaPipe = new MediaPipeInput();

engineInit(() => {
    mediaPipe.init();
}, () => {
    mediaPipe.update(); // Call in game loop
}, () => {
    // render
});
```

**Integration Time:** 4-5 days per feature

---

### 4. Phaser (Heavy Framework) ⚠️ DIFFICULT

**Ease of Integration:** ⭐⭐ (2/5)

**Pros:**
- ✅ Large community - May find existing plugins

**Cons:**
- ❌ **Heavy framework** - Complex integration
- ❌ **Plugin system overhead** - Must follow strict patterns
- ❌ **Scene lifecycle** - Harder to inject external events
- ❌ **Performance impact** - Heavy framework + MediaPipe = slow

**Integration Time:** 7-10 days per feature

---

## MediaPipe Integration Details

### Architecture Options

#### Option A: Separate Video Layer (Recommended)
```html
<div id="game-container">
    <video id="mediapipe-input" style="display:none"></video>
    <canvas id="mediapipe-debug"></canvas>  <!-- Optional debug -->
    <canvas id="game-canvas"></canvas>       <!-- Game -->
</div>
```

**Works with ALL frameworks** - Runs independently, sends events to game

#### Option B: Integrated Canvas
```javascript
// MediaPipe draws on same canvas as game
// More complex, framework-dependent
```

### Input Mapping Example

```javascript
// MediaPipe gestures → Game actions
const GestureMapping = {
    'thumb-up': 'jump',
    'swipe-left': 'move-left',
    'swipe-right': 'move-right',
    'wave': 'restart',
    'peace-sign': 'pause'
};

// Works with any framework
mediaPipe.on('gesture', (gesture) => {
    const action = GestureMapping[gesture];
    game.handleAction(action);
});
```

---

## TTS Integration Details

### Web Speech API (Built-in Browser)

**Easiest Option - Works with ALL frameworks**

```javascript
// Simple TTS wrapper
class TextToSpeech {
    speak(text, lang = 'en-US', options = {}) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // Events
        utterance.onstart = () => console.log('Speaking...');
        utterance.onend = () => console.log('Done.');

        speechSynthesis.speak(utterance);
    }

    stop() {
        speechSynthesis.cancel();
    }

    getVoices(lang = 'zh-CN') {
        return speechSynthesis.getVoices()
            .filter(v => v.lang.startsWith(lang));
    }
}

// Usage with any framework
const tts = new TextToSpeech();

// Chinese
tts.speak('欢迎来到游戏！', 'zh-CN');

// English
tts.speak('Welcome to the game!', 'en-US');

// Japanese
tts.speak('ゲームへようこそ！', 'ja-JP');
```

### Integration with Game Events

**KAPLAY Example:**
```javascript
k.on('game-start', () => {
    tts.speak(k.getText('game_start_message'));
});

k.on('victory', () => {
    tts.speak(k.getText('victory_message'));
});

k.on('match-found', () => {
    tts.speak(k.getText('correct_message'));
});
```

**Custom Library Example:**
```javascript
game.on('victory', () => {
    const message = i18n.t('victory_message');
    tts.speak(message, i18n.currentLanguage);
});
```

---

## Comparison Matrix

| Feature | Custom | KAPLAY | LittleJS | Phaser |
|---------|--------|--------|----------|--------|
| **MediaPipe Integration** |
| Ease of Integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Development Time | 2-3 days | 3-4 days | 4-5 days | 7-10 days |
| Flexibility | Full | High | Medium | Low |
| Performance | Best | Good | Good | Medium |
| **TTS Integration** |
| Ease of Integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Development Time | 1 day | 1 day | 1 day | 2 days |
| Language Support | Full | Full | Full | Full |
| **Overall** |
| Total Integration Time | 3-4 days | 4-5 days | 5-6 days | 9-12 days |
| Maintenance Burden | High | Low | Medium | Medium |
| Future Extensibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

---

## Recommendation

### Best Approach: **KAPLAY + Custom Extensions** ⭐

**Hybrid Strategy:**

```
lib/
├── kaplay/           # Core game engine (KAPLAY)
└── extensions/
    ├── mediapipe/    # MediaPipe wrapper
    │   ├── HandTracking.js
    │   ├── PoseDetection.js
    │   └── GestureMapper.js
    ├── tts/          # Text-to-Speech
    │   └── TextToSpeech.js
    ├── scoring/      # Game-specific
    └── i18n/         # Translations
```

**Why this works best:**

1. **KAPLAY for game logic** (80%)
   - Fast development
   - Proven game engine
   - Good event system

2. **Custom extensions for advanced features** (20%)
   - MediaPipe integration
   - TTS wrapper
   - Complete control over external APIs

3. **Best of both worlds**
   - Fast game development
   - Full flexibility for ML/TTS
   - Maintainable architecture

---

## Implementation Plan

### Phase 1: Core Game (KAPLAY)
- Build runner game with KAPLAY
- Standard controls (keyboard, mouse, touch)
- Complete game mechanics
- **Time: 1 week**

### Phase 2: TTS Integration
```javascript
// lib/extensions/tts/TextToSpeech.js
export class TextToSpeech {
    constructor(i18n) {
        this.i18n = i18n;
    }

    speakKey(key, options = {}) {
        const text = this.i18n.t(key);
        const lang = this.i18n.currentLanguage;
        this.speak(text, lang, options);
    }
}

// Integration
const tts = new TextToSpeech(i18n);
k.on('victory', () => tts.speakKey('victory_message'));
```
**Time: 1 day**

### Phase 3: MediaPipe Gestures
```javascript
// lib/extensions/mediapipe/HandGestures.js
export class HandGestures {
    constructor(kaplayInstance) {
        this.k = kaplayInstance;
        this.hands = new Hands({
            onResults: this.onResults.bind(this)
        });
    }

    onResults(results) {
        const gesture = this.detectGesture(results);
        this.k.trigger('gesture', gesture);
    }
}

// Integration
const gestures = new HandGestures(k);
k.on('gesture', (g) => {
    if (g === 'swipe-left') player.moveLeft();
});
```
**Time: 3-4 days**

---

## Code Size Comparison

### With KAPLAY + Extensions:
```
KAPLAY:           200 KB
MediaPipe:        ~500 KB (loaded on demand)
Custom TTS:       ~2 KB
Custom Extensions: ~10 KB
---------------------------
Total:            ~212 KB base + 500 KB optional
```

### Custom Library + Extensions:
```
Custom Engine:    ~100 KB
MediaPipe:        ~500 KB
Custom Extensions: ~15 KB
---------------------------
Total:            ~115 KB base + 500 KB optional
```

**Difference: ~100KB** - Acceptable for web games

---

## Final Recommendation

### Use **KAPLAY + Custom Extension Architecture**

**Reasons:**
1. ✅ **Easy MediaPipe integration** - Plugin system + event-driven
2. ✅ **Easy TTS integration** - Works with any framework
3. ✅ **Fast development** - 7 days vs 30 days
4. ✅ **Good separation** - Game logic in KAPLAY, ML/TTS in extensions
5. ✅ **Maintainable** - Clear boundaries
6. ✅ **Future-proof** - Can add voice recognition, eye tracking, etc.

**Time Savings:**
- Total development: ~2 weeks (vs 5-6 weeks custom)
- MediaPipe integration: 3-4 days (vs 2-3 days custom) - Only 1 day difference!
- TTS integration: 1 day (same for all)

**The 1-day difference for MediaPipe is worth it for 3-4 weeks saved on game engine.**

---

## Conclusion

For a project that will integrate MediaPipe and TTS:
- **Don't build custom engine** - Too much time for marginal integration benefit
- **Use KAPLAY** - Best balance of speed + flexibility
- **Build focused extensions** - MediaPipe, TTS, i18n, scoring
- **Keep architecture clean** - Separate concerns

**Integration difficulty is almost the same across frameworks** because MediaPipe and TTS run independently and communicate via events/callbacks.

**The real question is:** Do we want to spend 3-4 weeks building an engine, or 3-4 days integrating MediaPipe into a proven framework?

**Answer: Use KAPLAY.** 🎯
