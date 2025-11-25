# Claude Development Guidelines

This file contains important guidelines for Claude when working on this project.

## ⚡ Output Policy - CRITICAL

**BE CONCISE. MINIMIZE TOKEN USAGE.**

- Keep responses short and direct
- No unnecessary preamble or postamble
- No lengthy explanations unless asked
- No repetitive summaries
- Answer questions directly without elaboration
- Only provide details when specifically requested
- Use bullet points instead of paragraphs when possible
- Skip obvious statements

## Language Policy 🌍

### Communication: Chinese (中文)
- All conversations with users are in Chinese
- Team discussions are in Chinese
- Design documents can be in Chinese

### Code: English
- **ALL code must be written in English**
- **ALL comments must be in English**
- **ALL identifiers (variables, functions, classes) must be in English**
- **ALL commit messages must be in English**
- **ALL file names must be in English**

### User-Facing Content: Multilingual (I18n)
- Games must support multiple languages (至少支持中英文)
- **Never hardcode text strings** - always use i18n system
- All UI text must go through internationalization
- Provide language switching functionality

## Project Structure 📁

### Game Directory Structure

**IMPORTANT: Each game MUST have its own directory under `games/`**

```
games/
├── game-name/                    # Each game has its own directory
│   ├── index.html               # Main game file
│   ├── styles.css               # Game styles (optional, can be inline)
│   ├── script.js                # Game logic (optional, can be inline)
│   ├── README.md                # Game-specific README
│   ├── assets/                  # Game assets
│   │   ├── images/             # Images for this game
│   │   └── sounds/             # Sounds for this game
│   └── docs/                    # Game-specific documentation
│       ├── design.md           # Game design document
│       ├── decisions.md        # Architecture decisions for this game
│       └── user-guide.md       # How to play (multi-language)
```

### Documentation Rules

**Project-level docs:** `/docs/` (shared knowledge, lessons learned, best practices)
```
docs/
├── development-logs/           # Overall project progress
├── lessons-learned/            # Project-wide lessons
├── architecture/               # Shared architecture decisions
├── best-practices/             # Team-wide best practices
└── knowledge-base/             # Shared knowledge
```

**Game-specific docs:** `games/[game-name]/docs/` (only for that specific game)
```
games/memory-match/docs/
├── design.md                   # This game's design
├── decisions.md                # This game's technical decisions
└── user-guide.md               # How to play this game
```

### File Location Rules

When creating a new game:

1. **Create game directory:** `games/[game-name]/`
2. **All game files go in that directory:** HTML, CSS, JS, assets
3. **Game documentation goes in:** `games/[game-name]/docs/`
4. **NOT in:** `.claude/`, `/docs/`, or project root

### Example: Memory Match Game

```
games/memory-match/
├── index.html                          # The game
├── README.md                           # What this game is
├── assets/
│   ├── images/
│   │   ├── cat.png                    # Animal card images
│   │   ├── dog.png
│   │   └── ...
│   └── sounds/
│       ├── flip.mp3                   # Game sounds
│       └── match.mp3
└── docs/
    ├── design.md                      # Game design for memory match
    ├── decisions.md                   # Why we chose certain approaches
    └── user-guide.md                  # How to play memory match
```

### Wrong Locations ❌

```
❌ .claude/docs/game-design.md         # Wrong: game docs in agent directory
❌ docs/memory-match-design.md         # Wrong: game docs in project docs
❌ memory-match.html                   # Wrong: game in project root
❌ games/memory-match.html             # Wrong: game file directly in games/
```

### Correct Locations ✅

```
✅ games/memory-match/index.html       # Correct: game in its directory
✅ games/memory-match/docs/design.md   # Correct: game docs with game
✅ games/memory-match/assets/cat.png   # Correct: assets with game
✅ docs/lessons-learned/2025-01-05.md  # Correct: project-wide lessons
```

## Code Examples

### ✅ CORRECT

```javascript
// Good: English code and comments
class GameManager {
  constructor() {
    this.score = 0;
    this.level = 1;
  }

  // Update the player's score based on achievements
  updateScore(points) {
    this.score += points;
  }
}

// Use i18n for user-facing text
const message = i18n.t('welcome');  // ✅
```

### ❌ WRONG

```javascript
// Bad: Chinese in code
class 游戏管理器 {  // ❌ Chinese class name
  constructor() {
    this.分数 = 0;  // ❌ Chinese variable
  }

  // 更新分数  // ❌ Chinese comment
  更新分数(点数) {  // ❌ Chinese function name
    this.分数 += 点数;
  }
}

// Bad: Hardcoded Chinese text
element.textContent = "欢迎！";  // ❌ No i18n
```

## Internationalization (I18n) Requirements

### Always Use I18n System

```javascript
// Structure for i18n
const messages = {
  en: {
    game_title: "Magic Chef Academy",
    start_game: "Start Game",
    score: "Score: {score}"
  },
  zh: {
    game_title: "魔法厨师学院",
    start_game: "开始游戏",
    score: "分数: {score}"
  },
  ja: {
    game_title: "マジックシェフアカデミー",
    start_game: "ゲーム開始",
    score: "スコア: {score}"
  }
};

// Usage
title.textContent = i18n.t('game_title');
button.textContent = i18n.t('start_game');
scoreDisplay.textContent = i18n.t('score', { score: playerScore });
```

### I18n Best Practices

1. **Use descriptive keys in English**
   ```javascript
   i18n.t('player_lives_remaining')  // ✅ Good
   i18n.t('msg1')  // ❌ Bad
   ```

2. **Support parameters**
   ```javascript
   i18n.t('score_message', { score: 100, level: 5 })
   ```

3. **Organize keys by feature**
   ```javascript
   {
     menu: {
       start: "Start",
       options: "Options"
     },
     game: {
       pause: "Pause",
       resume: "Resume"
     }
   }
   ```

## Git Commit Standards

### Use English for ALL commits

```bash
# ✅ CORRECT
git commit -m "Add level progression system"
git commit -m "Fix collision detection in maze game"
git commit -m "Optimize rendering for mobile devices"

# ❌ WRONG
git commit -m "添加关卡系统"
git commit -m "修复碰撞检测"
```

### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## File Naming Conventions

### ✅ CORRECT (English)
```
game-manager.js
player-controller.js
level-config.json
magic-chef-sprite.png
main-menu.html
game-styles.css
```

### ❌ WRONG (Chinese)
```
游戏管理器.js
玩家控制器.js
关卡配置.json
魔法厨师.png
```

## Path Usage Standards 🔗

### CRITICAL: Always Use Relative Paths

**NEVER use absolute paths in code** - they will break when deployed to GitHub Pages or other hosting platforms.

### ✅ CORRECT (Relative Paths)

```html
<!-- In games/memory-match/index.html -->
<img src="assets/images/cat.png">
<script src="js/game.js"></script>
<link rel="stylesheet" href="styles/main.css">
<audio src="assets/sounds/bgm.mp3"></audio>

<!-- Linking to another game from homepage -->
<a href="games/memory-match/index.html">Play Memory Match</a>

<!-- In games/runner-adventure/index.html -->
<img src="assets/images/character.png">
<script src="src/core/engine.js" type="module"></script>
```

```javascript
// In JavaScript - relative paths
const bgImage = new Image();
bgImage.src = 'assets/images/background.png';  // ✅ Relative

// Loading modules
import { GameEngine } from './core/engine.js';  // ✅ Relative
import { Player } from '../entities/player.js';  // ✅ Relative

// Loading JSON data
fetch('data/levels.json')  // ✅ Relative
  .then(response => response.json());
```

```css
/* In CSS files */
.background {
  background-image: url('../images/bg.png');  /* ✅ Relative */
}

@font-face {
  src: url('../fonts/game-font.woff2');  /* ✅ Relative */
}
```

### ❌ WRONG (Absolute Paths)

```html
<!-- These will BREAK when published -->
<img src="/home/wxcd/mgame/games/memory-match/assets/images/cat.png">  ❌
<script src="/Users/dev/projects/mgame/js/game.js"></script>  ❌
<link href="C:\Projects\mgame\styles\main.css">  ❌

<!-- Wrong: absolute path from server root -->
<a href="/games/memory-match/index.html">  ❌ Breaks on GitHub Pages
```

```javascript
// WRONG - absolute paths
const bgImage = new Image();
bgImage.src = '/home/wxcd/mgame/assets/bg.png';  // ❌ Will break

// WRONG - absolute from root
fetch('/data/levels.json')  // ❌ May break on subpath deployments
```

### Path Examples by Location

**From `games/memory-match/index.html`:**
```html
<!-- Assets in same game -->
<img src="assets/images/cat.png">              <!-- ✅ Same game assets -->
<audio src="assets/sounds/flip.mp3">           <!-- ✅ Same game sounds -->

<!-- Back to homepage -->
<a href="../../index.html">Home</a>            <!-- ✅ Navigate up -->

<!-- Other game -->
<a href="../runner-adventure/index.html">      <!-- ✅ Sibling game -->
```

**From `games/runner-adventure/src/entities/player.js`:**
```javascript
// Importing from other modules
import { GameEngine } from '../core/engine.js';     // ✅ Up one, then core
import { Vector2D } from '../../utils/math.js';      // ✅ Up two, then utils
import { CONSTANTS } from '../config/constants.js';  // ✅ Sibling directory

// Loading assets
const sprite = new Image();
sprite.src = '../../assets/images/player.png';       // ✅ Up to game root
```

**From `index.html` (homepage):**
```html
<!-- Linking to games -->
<a href="games/memory-match/index.html">       <!-- ✅ Down into games -->
<a href="games/runner-adventure/index.html">   <!-- ✅ Down into games -->

<!-- Assets in root -->
<link rel="stylesheet" href="styles/main.css"> <!-- ✅ Root level assets -->
```

### GitHub Pages Deployment

When deployed to GitHub Pages at `https://username.github.io/games-for-kids/`:

**✅ Relative paths work perfectly:**
```html
<!-- In games/memory-match/index.html -->
<img src="assets/images/cat.png">
<!-- Resolves to: https://username.github.io/games-for-kids/games/memory-match/assets/images/cat.png -->
```

**❌ Absolute paths break:**
```html
<img src="/assets/images/cat.png">
<!-- Tries: https://username.github.io/assets/images/cat.png -->
<!-- WRONG! Missing /games-for-kids/ prefix -->
```

### Module Imports (ES6)

```javascript
// ✅ CORRECT - Always use relative paths with ./ or ../
import { Player } from './entities/player.js';
import { GameEngine } from '../core/engine.js';
import { utils } from '../../utils/helpers.js';

// ❌ WRONG - Absolute or bare imports
import { Player } from '/src/entities/player.js';  // ❌
import { GameEngine } from 'core/engine.js';       // ❌ (needs ./ prefix)
```

### Path Best Practices

1. **Always start with `./` or `../`** for relative paths
2. **Test paths work from file's actual location**
3. **Use consistent depth** - don't mix `../../` with absolute
4. **Avoid going up too many levels** - restructure if needed
5. **No hardcoded domain names** - use relative for portability

### Path Testing Checklist

Before committing, verify:
- [ ] No absolute file system paths (`/home/`, `C:\`, etc.)
- [ ] No absolute web paths starting with `/` (unless intentional)
- [ ] All asset references use relative paths
- [ ] All module imports use `./` or `../` prefix
- [ ] Paths work when opened locally (file://)
- [ ] Paths will work on GitHub Pages (https://)

## Documentation Standards

### Code Documentation (JSDoc) - English

```javascript
/**
 * Calculates the player's final score
 * @param {number} baseScore - The base score earned
 * @param {number} timeBonus - Bonus points for completion time
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @returns {number} The final calculated score
 */
function calculateFinalScore(baseScore, timeBonus, accuracy) {
  return Math.floor(baseScore + timeBonus * (accuracy / 100));
}
```

### Project Documentation
- Technical docs: English (for sharing globally)
- Team communication docs: Chinese is acceptable
- README.md: Can have both Chinese and English sections

## Console Logging

### Development
```javascript
// Acceptable during development
console.log('Game initialized');
console.error('Failed to load asset:', assetPath);

// Temporary debug (must be removed before production)
console.log('临时调试:', value);  // OK for quick debug, remove later
```

### Production
- **Remove ALL console.log statements**
- Use proper error handling and logging systems
- Production logs should be minimal and in English

## Code Quality Standards

### Always Follow
1. Use English for all code elements
2. Use i18n for all user-facing text
3. Write meaningful comments in English
4. Use descriptive variable/function names
5. Follow consistent code style
6. Remove debug logs before committing

### Code Review Checklist
- [ ] All code in English
- [ ] All comments in English
- [ ] All identifiers in English
- [ ] No hardcoded text (using i18n)
- [ ] All text has translations
- [ ] No console.logs in production code
- [ ] Commit message in English
- [ ] File names in English

## Agent Instructions

When agents work on this project, they must:

1. **@frontend-developer**
   - Write all HTML/CSS/JS in English
   - Use semantic, descriptive class names
   - Implement i18n for all text content

2. **@game-mechanics-engineer**
   - Write game logic in English
   - Comment complex algorithms
   - Use i18n for any user messages

3. **@ui-ux-designer**
   - Design with multilingual support in mind
   - Ensure text areas can expand for longer translations
   - Use i18n keys in mockups

4. **@qa-tester**
   - Test with multiple languages
   - Verify i18n coverage
   - Check for hardcoded text

5. **@project-chronicler**
   - Documentation can be in Chinese or English
   - Code examples must be in English
   - Ensure consistency across docs

6. **@game-director**
   - Enforce language standards across all phases
   - Ensure i18n implementation in planning
   - Verify standards in code reviews

## Quick Reference

| Element | Language | Example |
|---------|----------|---------|
| Code | English | `class GameManager` |
| Comments | English | `// Update player score` |
| Variables | English | `playerScore`, `currentLevel` |
| Functions | English | `calculateScore()`, `updateUI()` |
| Classes | English | `GameEngine`, `PlayerController` |
| File names | English | `game-manager.js` |
| Commit messages | English | `feat: add scoring system` |
| User-facing text | I18n | `i18n.t('welcome_message')` |
| Conversations | Chinese | (当前对话) |
| Team docs | Chinese/English | (flexible) |

## Why These Standards?

### English Code
- Universal understanding
- Better tool support
- Industry best practice
- Easier debugging
- Open source friendly

### I18n for Content
- Reach wider audience
- Better user experience
- Market expansion
- Professional quality
- Accessibility

### Chinese Communication
- Natural for team
- Faster discussion
- Clear understanding
- Comfortable workflow

---

## Summary

**Write code in English, communicate in Chinese, serve users in multiple languages!**

**代码用英文，交流用中文，游戏支持多语言！**
**对代码进行优秀的管理，单个js文件不超过350行**
---

**This is a critical guideline. All agents and developers must follow these standards.**
