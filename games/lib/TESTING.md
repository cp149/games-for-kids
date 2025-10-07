# Testing Strategy for KAPLAY Game Extensions

## Overview

This document describes the testing approach for the shared library modules in `/games/lib/`.

**Testing Framework:** [Vitest](https://vitest.dev/) (same as KAPLAY itself uses)

## Module Testability Analysis

### ✅ Highly Testable (Pure Logic)

These modules have minimal external dependencies and can be easily unit tested:

#### 1. **ColorUtils.js** (`utils/`)
- **Testability:** ⭐⭐⭐⭐⭐ (100%)
- **Dependencies:** None
- **Test Coverage:** All functions are pure
- **Example Tests:**
  ```javascript
  import { hslToRgb, rgbToHex, interpolateColor } from '../utils/ColorUtils.js';

  describe('ColorUtils', () => {
    test('hslToRgb converts correctly', () => {
      expect(hslToRgb(0, 1, 0.5)).toEqual([255, 0, 0]); // Red
    });

    test('rgbToHex formats correctly', () => {
      expect(rgbToHex(255, 87, 51)).toBe('#FF5733');
    });
  });
  ```

#### 2. **SimpleI18n.js** (`i18n/`)
- **Testability:** ⭐⭐⭐⭐⭐ (100%)
- **Dependencies:** None
- **Test Coverage:** All methods testable
- **Example Tests:**
  ```javascript
  import { SimpleI18n } from '../i18n/SimpleI18n.js';

  describe('SimpleI18n', () => {
    test('translates with placeholders', () => {
      const i18n = new SimpleI18n('en');
      i18n.addTranslations({
        en: { greeting: 'Hello, {0}!' }
      });
      expect(i18n.t('greeting', 'Alice')).toBe('Hello, Alice!');
    });

    test('switches language', () => {
      const i18n = new SimpleI18n('en');
      i18n.addTranslations({
        en: { hello: 'Hello' },
        zh: { hello: '你好' }
      });
      i18n.setLanguage('zh');
      expect(i18n.t('hello')).toBe('你好');
    });
  });
  ```

#### 3. **ScoreManager.js** (`game/`)
- **Testability:** ⭐⭐⭐⭐⭐ (100%)
- **Dependencies:** localStorage (can be mocked)
- **Test Coverage:** All methods testable
- **Example Tests:**
  ```javascript
  import { ScoreManager } from '../game/ScoreManager.js';

  describe('ScoreManager', () => {
    beforeEach(() => {
      // Mock localStorage
      global.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn()
      };
    });

    test('adds points correctly', () => {
      const score = new ScoreManager();
      score.addPoints(100);
      expect(score.getScore()).toBe(100);
    });

    test('calculates stars correctly', () => {
      const score = new ScoreManager({
        starThresholds: [100, 250, 500]
      });
      score.addPoints(300);
      expect(score.getStars()).toBe(2);
    });

    test('combo multiplier increases', () => {
      const score = new ScoreManager();
      score.increaseCombo();
      score.increaseCombo();
      score.increaseCombo();
      expect(score.getMultiplier()).toBeGreaterThan(1);
    });
  });
  ```

#### 4. **ComboSystem.js** (`game/`)
- **Testability:** ⭐⭐⭐⭐☆ (90%)
- **Dependencies:** Timer (setTimeout - can be mocked)
- **Test Coverage:** Logic testable, timer needs mocking
- **Example Tests:**
  ```javascript
  import { ComboSystem } from '../game/ComboSystem.js';

  describe('ComboSystem', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('increments combo', () => {
      const combo = new ComboSystem({ k: mockK });
      combo.increment();
      expect(combo.getCombo()).toBe(1);
    });

    test('resets after timeout', () => {
      const combo = new ComboSystem({ k: mockK, timeout: 3 });
      combo.increment();
      vi.advanceTimersByTime(3000);
      expect(combo.getCombo()).toBe(0);
    });
  });
  ```

### ⚠️ Moderately Testable (Browser APIs)

These modules depend on browser APIs but can be tested with mocks:

#### 5. **AudioUtils.js** (`audio/`)
- **Testability:** ⭐⭐⭐☆☆ (60%)
- **Dependencies:** Web Audio API
- **Test Strategy:** Mock AudioContext
- **Example Tests:**
  ```javascript
  import { playJumpSound, playCoinSound } from '../audio/AudioUtils.js';

  describe('AudioUtils', () => {
    beforeEach(() => {
      // Mock Web Audio API
      global.AudioContext = vi.fn().mockImplementation(() => ({
        createOscillator: vi.fn(() => ({
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
          frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
          }
        })),
        createGain: vi.fn(() => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
          }
        })),
        destination: {},
        currentTime: 0
      }));
    });

    test('playJumpSound creates oscillator', () => {
      playJumpSound();
      // Verify AudioContext was called
      expect(AudioContext).toHaveBeenCalled();
    });
  });
  ```

#### 6. **TextToSpeech.js** (`audio/`)
- **Testability:** ⭐⭐⭐☆☆ (60%)
- **Dependencies:** Web Speech API
- **Test Strategy:** Mock speechSynthesis
- **Example Tests:**
  ```javascript
  import { TextToSpeech } from '../audio/TextToSpeech.js';

  describe('TextToSpeech', () => {
    beforeEach(() => {
      global.window.speechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
        getVoices: vi.fn(() => [])
      };
    });

    test('speaks text', () => {
      const tts = new TextToSpeech();
      tts.speak('Hello');
      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });
  });
  ```

### 🔴 Difficult to Test (KAPLAY Dependent)

These modules tightly couple with KAPLAY and are better tested via integration/visual tests:

#### 7. **ParticleEffects.js** (`effects/`)
- **Testability:** ⭐⭐☆☆☆ (30%)
- **Dependencies:** KAPLAY instance (k)
- **Test Strategy:** Mock KAPLAY or integration test
- **Recommendation:** Use visual regression testing

#### 8. **UIComponents.js** (`ui/`)
- **Testability:** ⭐⭐☆☆☆ (30%)
- **Dependencies:** KAPLAY instance (k)
- **Test Strategy:** Mock KAPLAY or integration test
- **Recommendation:** Use visual regression testing

## Recommended Testing Approach

### Phase 1: Unit Tests (Pure Logic) ✅

**Priority: HIGH**

Test these modules first with Vitest:
- `ColorUtils.js` - All functions
- `SimpleI18n.js` - All methods
- `ScoreManager.js` - Core logic
- `ComboSystem.js` - Logic without timer tests

**Setup:**
```bash
npm install -D vitest
```

**vitest.config.js:**
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // For browser APIs
    globals: true
  }
});
```

**package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Phase 2: Browser API Mocking ⚠️

**Priority: MEDIUM**

Test with mocked browser APIs:
- `AudioUtils.js` - Mock Web Audio API
- `TextToSpeech.js` - Mock Speech Synthesis API

### Phase 3: Integration Tests 🔴

**Priority: LOW**

For KAPLAY-dependent modules:
- Create test HTML files with minimal KAPLAY setup
- Manual/automated visual testing
- Playwright or Cypress for E2E tests

**Example Integration Test:**
```html
<!-- tests/integration/particle-effects.html -->
<script type="module">
  import kaplay from 'https://unpkg.com/kaplay@3001.0.0/dist/kaplay.mjs';
  import { ParticleEffectManager } from '../../effects/ParticleEffects.js';

  const k = kaplay();
  const particles = new ParticleEffectManager(k);

  // Visual test - verify particles render correctly
  particles.coinBurst(k.center(), 10);
</script>
```

## Test Directory Structure

```
/games/lib/
├── tests/
│   ├── unit/                  # Pure logic tests
│   │   ├── ColorUtils.test.js
│   │   ├── SimpleI18n.test.js
│   │   ├── ScoreManager.test.js
│   │   └── ComboSystem.test.js
│   ├── mocked/                # Browser API tests
│   │   ├── AudioUtils.test.js
│   │   └── TextToSpeech.test.js
│   └── integration/           # KAPLAY integration
│       ├── particle-effects.html
│       └── ui-components.html
├── vitest.config.js
└── package.json
```

## Quick Start

### 1. Install Vitest
```bash
cd /games/lib
npm init -y
npm install -D vitest @vitest/ui
```

### 2. Create First Test
```javascript
// tests/unit/ColorUtils.test.js
import { describe, test, expect } from 'vitest';
import { hslToRgb, rgbToHex } from '../../utils/ColorUtils.js';

describe('ColorUtils', () => {
  test('hslToRgb converts red correctly', () => {
    expect(hslToRgb(0, 1, 0.5)).toEqual([255, 0, 0]);
  });
});
```

### 3. Run Tests
```bash
npm test
```

## Coverage Goals

- **ColorUtils:** 100%
- **SimpleI18n:** 100%
- **ScoreManager:** 90%+
- **ComboSystem:** 80%+
- **AudioUtils:** 50%+ (mock only)
- **TextToSpeech:** 50%+ (mock only)
- **ParticleEffects:** Integration test only
- **UIComponents:** Integration test only

## CI/CD Integration

Add to GitHub Actions:
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd games/lib && npm install
      - run: cd games/lib && npm test
```

## Summary

**Best Testing Strategy:**
1. ✅ Start with **unit tests** for pure logic modules (ColorUtils, SimpleI18n, ScoreManager)
2. ⚠️ Add **mocked tests** for browser API modules (AudioUtils, TextToSpeech)
3. 🔴 Use **manual/visual tests** for KAPLAY-dependent modules (ParticleEffects, UIComponents)

**Recommended Tools:**
- **Vitest** - Unit testing (same as KAPLAY)
- **jsdom** - Browser environment simulation
- **Playwright/Cypress** - E2E testing (optional)

This phased approach ensures maximum code coverage while being pragmatic about what can be effectively automated.
