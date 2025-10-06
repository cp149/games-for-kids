# SimpleI18n - Internationalization Extension

Lightweight multi-language support system for KAPLAY games.

## Features

- ✅ Multiple language support (EN, CN, JP, etc.)
- ✅ Dynamic language switching
- ✅ Parameter replacement in translations
- ✅ Fallback to default language
- ✅ Event-based language change notifications
- ✅ Zero dependencies
- ✅ Works with KAPLAY or standalone

## Installation

```javascript
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';
```

## Quick Start

```javascript
// Initialize with default language
const i18n = new SimpleI18n('en');

// Add translations
i18n.addTranslations({
    en: {
        welcome: "Welcome!",
        score: "Score: {0}",
        victory: "You Win!"
    },
    zh: {
        welcome: "欢迎！",
        score: "得分：{0}",
        victory: "你赢了！"
    },
    ja: {
        welcome: "ようこそ！",
        score: "スコア：{0}",
        victory: "勝利！"
    }
});

// Use translations
console.log(i18n.t('welcome'));        // "Welcome!"
console.log(i18n.t('score', 100));     // "Score: 100"

// Change language
i18n.setLanguage('zh');
console.log(i18n.t('welcome'));        // "欢迎！"
```

## API Reference

### Constructor

#### `new SimpleI18n(defaultLang)`
Create new i18n instance.

**Parameters:**
- `defaultLang` (string) - Default language code (e.g., 'en', 'zh', 'ja')

### Methods

#### `addTranslations(translations)`
Add translations for multiple languages.

**Parameters:**
- `translations` (Object) - Object with language codes as keys

**Example:**
```javascript
i18n.addTranslations({
    en: { key: "value" },
    zh: { key: "值" },
    ja: { key: "価値" }
});
```

#### `t(key, ...params)`
Get translation for a key with optional parameters.

**Parameters:**
- `key` (string) - Translation key
- `...params` (any) - Values to replace {0}, {1}, etc.

**Returns:** (string) Translated text

**Example:**
```javascript
i18n.t('welcome')                    // "Welcome!"
i18n.t('score', 100)                 // "Score: 100"
i18n.t('message', 'Alice', 5)        // "Alice has 5 items"
```

#### `setLanguage(lang)`
Change current language.

**Parameters:**
- `lang` (string) - Language code

**Example:**
```javascript
i18n.setLanguage('zh');
```

#### `getLanguage()`
Get current language code.

**Returns:** (string) Current language

#### `getAvailableLanguages()`
Get all available language codes.

**Returns:** (string[]) Array of language codes

#### `onLanguageChange(callback)`
Register listener for language changes.

**Parameters:**
- `callback` (Function) - Called when language changes

**Example:**
```javascript
i18n.onLanguageChange((newLang) => {
    console.log('Language changed to:', newLang);
    updateUI();
});
```

#### `hasKey(key)`
Check if translation key exists.

**Parameters:**
- `key` (string) - Key to check

**Returns:** (boolean) True if key exists

## Usage with KAPLAY

```javascript
import kaplay from 'kaplay';
import { SimpleI18n } from '../lib/extensions/i18n/SimpleI18n.js';

const k = kaplay();
const i18n = new SimpleI18n('en');

i18n.addTranslations({
    en: {
        start: "Start Game",
        pause: "Pause",
        resume: "Resume"
    },
    zh: {
        start: "开始游戏",
        pause: "暂停",
        resume: "继续"
    }
});

// Menu scene
k.scene('menu', () => {
    const titleText = k.add([
        k.text(i18n.t('start')),
        k.pos(k.center()),
        k.anchor('center')
    ]);

    // Update text when language changes
    i18n.onLanguageChange(() => {
        titleText.text = i18n.t('start');
    });
});

// Language selector
k.onKeyPress('1', () => i18n.setLanguage('en'));
k.onKeyPress('2', () => i18n.setLanguage('zh'));
k.onKeyPress('3', () => i18n.setLanguage('ja'));
```

## Advanced Features

### Parameter Replacement

```javascript
i18n.addTranslations({
    en: {
        greeting: "Hello, {0}!",
        stats: "{0} scored {1} points in {2} seconds",
        multi: "Player {0} vs Player {1}"
    }
});

i18n.t('greeting', 'Alice');                  // "Hello, Alice!"
i18n.t('stats', 'Bob', 100, 30);              // "Bob scored 100 points in 30 seconds"
i18n.t('multi', 'Alice', 'Bob');              // "Player Alice vs Player Bob"
```

### Fallback Behavior

```javascript
const i18n = new SimpleI18n('en');  // Default: English

i18n.addTranslations({
    en: { welcome: "Welcome!", goodbye: "Goodbye!" },
    zh: { welcome: "欢迎！" }  // Missing 'goodbye'
});

i18n.setLanguage('zh');
console.log(i18n.t('welcome'));   // "欢迎！" (from Chinese)
console.log(i18n.t('goodbye'));   // "Goodbye!" (fallback to English)
```

### Dynamic UI Updates

```javascript
const i18n = new SimpleI18n('en');
const elements = [];

// Register all text elements
function registerElement(key, element) {
    elements.push({ key, element });
}

// Update all elements when language changes
i18n.onLanguageChange(() => {
    elements.forEach(({ key, element }) => {
        element.text = i18n.t(key);
    });
});

// In game
const scoreLabel = k.add([
    k.text(i18n.t('score', 0)),
    k.pos(10, 10)
]);
registerElement('score', scoreLabel);
```

## Best Practices

1. **Use descriptive keys**: `game_over_title` not `text1`
2. **Group related keys**: `menu_start`, `menu_options`, `menu_quit`
3. **Always provide default language**: Usually English
4. **Test all languages**: Make sure all keys exist
5. **Keep translations in separate files**: For large projects

## File Size

- **SimpleI18n.js**: ~3KB
- **Translation data**: Varies (typically 1-5KB per language)

## Browser Support

- ✅ All modern browsers (ES6+)
- ✅ Mobile browsers
- ✅ No polyfills needed

## License

MIT
