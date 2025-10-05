# Claude Development Guidelines

This file contains important guidelines for Claude when working on this project.

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

---

**This is a critical guideline. All agents and developers must follow these standards.**
