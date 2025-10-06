# TextToSpeech - Text-to-Speech Extension

Browser-native text-to-speech system with multi-language support for accessibility and kid-friendly features.

## Features

- ✅ Browser-native Web Speech API
- ✅ Multi-language support (works with SimpleI18n)
- ✅ Voice customization (rate, pitch, volume)
- ✅ Speech queue management
- ✅ Auto language detection
- ✅ Enable/disable toggle
- ✅ Zero dependencies (uses browser API)

## Browser Support

- ✅ Chrome/Edge (excellent support)
- ✅ Safari (good support)
- ✅ Firefox (basic support)
- ⚠️ Mobile browsers (varies by OS)

## Installation

```javascript
import { TextToSpeech } from '../lib/extensions/tts/TextToSpeech.js';
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';
```

## Quick Start

### Standalone Usage

```javascript
const tts = new TextToSpeech();

// Speak text
tts.speak('Hello World!');

// Speak in specific language
tts.speak('你好世界！', 'zh');
tts.speak('こんにちは世界！', 'ja');
```

### With SimpleI18n

```javascript
const i18n = new SimpleI18n('en');
i18n.addTranslations({
    en: { welcome: "Welcome to the game!", victory: "You win!" },
    zh: { welcome: "欢迎来到游戏！", victory: "你赢了！" },
    ja: { welcome: "ゲームへようこそ！", victory: "勝利！" }
});

const tts = new TextToSpeech(i18n);

// Speak translation keys
tts.speakKey('welcome');           // "Welcome to the game!"

i18n.setLanguage('zh');
tts.speakKey('welcome');           // "欢迎来到游戏！" (in Chinese voice)
```

## API Reference

### Constructor

#### `new TextToSpeech(i18n, options)`
Create new TTS instance.

**Parameters:**
- `i18n` (SimpleI18n) - i18n instance (optional)
- `options` (Object) - Configuration options

**Options:**
- `rate` (number) - Speech rate 0.1-10 (default: 1)
- `pitch` (number) - Speech pitch 0-2 (default: 1)
- `volume` (number) - Volume 0-1 (default: 1)
- `voiceURI` (string) - Specific voice URI (optional)

**Example:**
```javascript
const tts = new TextToSpeech(i18n, {
    rate: 0.9,      // Slightly slower
    pitch: 1.2,     // Higher pitch (kid-friendly)
    volume: 0.8     // 80% volume
});
```

### Methods

#### `speak(text, lang)`
Speak text directly.

**Parameters:**
- `text` (string) - Text to speak
- `lang` (string) - Language code (optional, auto-detected from i18n)

**Returns:** Promise (resolves when finished)

**Example:**
```javascript
await tts.speak('Hello!');
await tts.speak('Bonjour!', 'fr');
```

#### `speakKey(key, ...params)`
Speak translation key using i18n.

**Parameters:**
- `key` (string) - Translation key
- `...params` (any) - Parameters for translation

**Example:**
```javascript
i18n.addTranslations({
    en: {
        score: "Your score is {0}",
        combo: "Amazing {0}x combo!"
    }
});

tts.speakKey('score', 100);      // "Your score is 100"
tts.speakKey('combo', 5);        // "Amazing 5x combo!"
```

#### `enqueue(text, lang)`
Add speech to queue (doesn't interrupt current speech).

**Example:**
```javascript
tts.enqueue('First message');
tts.enqueue('Second message');
tts.enqueue('Third message');
// All will play in sequence
```

#### `enqueueKey(key, ...params)`
Add translation key to queue.

#### `stop()`
Stop current speech immediately.

#### `clear()`
Clear queue and stop speech.

#### `pause()`
Pause current speech.

#### `resume()`
Resume paused speech.

#### `enable()` / `disable()`
Enable or disable TTS.

#### `toggle()`
Toggle TTS on/off.

**Returns:** (boolean) New enabled state

**Example:**
```javascript
const isEnabled = tts.toggle();
console.log(isEnabled ? 'TTS On' : 'TTS Off');
```

#### `isEnabled()`
Check if TTS is enabled.

**Returns:** (boolean) True if enabled

### Voice Configuration

#### `setRate(rate)`
Set speech rate (0.1-10, 1 = normal).

```javascript
tts.setRate(0.8);  // Slower
tts.setRate(1.5);  // Faster
```

#### `setPitch(pitch)`
Set speech pitch (0-2, 1 = normal).

```javascript
tts.setPitch(1.2);  // Higher (kid-friendly)
tts.setPitch(0.8);  // Lower
```

#### `setVolume(volume)`
Set volume (0-1, 1 = max).

```javascript
tts.setVolume(0.5);  // 50% volume
```

#### `getVoices()`
Get all available voices.

**Returns:** (SpeechSynthesisVoice[])

**Example:**
```javascript
const voices = tts.getVoices();
voices.forEach(voice => {
    console.log(`${voice.name} (${voice.lang})`);
});
```

#### `getVoicesForLanguage(lang)`
Get voices for specific language.

**Example:**
```javascript
const englishVoices = tts.getVoicesForLanguage('en');
const chineseVoices = tts.getVoicesForLanguage('zh');
```

#### `setVoice(voiceURI)`
Set specific voice.

**Example:**
```javascript
const voices = tts.getVoices();
const preferredVoice = voices.find(v => v.name.includes('Google'));
if (preferredVoice) {
    tts.setVoice(preferredVoice.voiceURI);
}
```

## Usage with KAPLAY

```javascript
import kaplay from 'kaplay';
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';
import { TextToSpeech } from '../lib/extensions/tts/TextToSpeech.js';

const k = kaplay();
const i18n = new SimpleI18n('en');
const tts = new TextToSpeech(i18n, {
    rate: 0.9,
    pitch: 1.1,
    volume: 0.8
});

i18n.addTranslations({
    en: {
        welcome: "Welcome to the game!",
        jump: "Jump!",
        collect_coin: "You collected a coin!",
        game_over: "Game over. Press space to restart."
    },
    zh: {
        welcome: "欢迎来到游戏！",
        jump: "跳跃！",
        collect_coin: "你收集了一枚金币！",
        game_over: "游戏结束。按空格键重新开始。"
    }
});

k.scene('menu', () => {
    // Speak welcome message
    tts.speakKey('welcome');

    k.add([
        k.text(i18n.t('welcome')),
        k.pos(k.center()),
        k.anchor('center')
    ]);
});

k.scene('game', () => {
    const player = k.add([
        k.sprite('player'),
        k.pos(100, 100),
        k.area(),
        k.body()
    ]);

    // Speak on jump
    k.onKeyPress('space', () => {
        if (player.isGrounded()) {
            player.jump();
            tts.speakKey('jump');
        }
    });

    // Speak when collecting coin
    player.onCollide('coin', (coin) => {
        k.destroy(coin);
        tts.speakKey('collect_coin');
    });

    // Game over
    player.onCollide('obstacle', () => {
        tts.speakKey('game_over');
        k.go('gameover');
    });
});

// Toggle TTS with 'T' key
k.onKeyPress('t', () => {
    const enabled = tts.toggle();
    console.log('TTS:', enabled ? 'ON' : 'OFF');
});
```

## Advanced Features

### Queue Management

```javascript
// Queue multiple messages
tts.enqueueKey('level_start');
tts.enqueueKey('instruction_1');
tts.enqueueKey('instruction_2');
// Plays in sequence without interruption
```

### Language-Specific Voices

```javascript
// Automatically uses correct voice for language
i18n.setLanguage('en');
tts.speakKey('welcome');  // Uses English voice

i18n.setLanguage('zh');
tts.speakKey('welcome');  // Uses Chinese voice

i18n.setLanguage('ja');
tts.speakKey('welcome');  // Uses Japanese voice
```

### Dynamic Voice Settings

```javascript
// Kids mode - higher pitch, slower rate
function setKidsMode() {
    tts.setRate(0.9);
    tts.setPitch(1.2);
}

// Adult mode - normal
function setAdultMode() {
    tts.setRate(1.0);
    tts.setPitch(1.0);
}
```

## Best Practices

1. **Don't overuse**: Only speak important events (victories, instructions, errors)
2. **Provide toggle**: Let users disable TTS with a button or key
3. **Use queues carefully**: Too many queued messages can be annoying
4. **Test across browsers**: Chrome has best voice quality
5. **Provide visual feedback**: Show TTS on/off state
6. **Use with i18n**: Always provide translations for proper pronunciation

## Accessibility Benefits

- 👁️ **Visual impairment**: Helps users who can't see the screen clearly
- 📖 **Reading difficulty**: Helps young children or non-readers
- 🎮 **Multitasking**: Players can focus on gameplay while hearing feedback
- 🌍 **Language learning**: Hear correct pronunciation in different languages

## Performance

- Lightweight: ~3KB
- Browser-native (no external libraries)
- Asynchronous (non-blocking)
- Works offline (once voices loaded)

## Language Support

Depends on browser and OS:

**Chrome (best support):**
- English (US, UK, AU, IN)
- Chinese (CN, HK, TW)
- Japanese
- Spanish, French, German, Italian, Portuguese, Russian, Korean, and more

**Safari:**
- Good support for major languages
- Uses Siri voices on macOS/iOS

**Firefox:**
- Basic support
- Uses OS voices

## Troubleshooting

### Voices not loading
```javascript
// Wait for voices to load
setTimeout(() => {
    const voices = tts.getVoices();
    console.log(`${voices.length} voices available`);
}, 100);
```

### Wrong language voice
```javascript
// Manually set voice for language
const chineseVoices = tts.getVoicesForLanguage('zh');
if (chineseVoices.length > 0) {
    tts.setVoice(chineseVoices[0].voiceURI);
}
```

### Speech interrupted
```javascript
// Use queue instead of direct speak
tts.enqueueKey('message1');
tts.enqueueKey('message2');
```

## License

MIT
