# Claude Development Guidelines

## ⚡ Output Policy - CRITICAL

**所有路径都用相对路径，不许出现/home的字眼**
**BE CONCISE. MINIMIZE TOKEN USAGE.**

### 报告长度限制
- **默认**: 不输出报告，除非明确需要
- **必要时**: 最多200字（~100个汉字），使用项目符号
- **例外**: 仅在用户明确要求详细信息时超出限制

### 通用规则
- 简短直接，无多余前言/结语/重复总结
- 仅在明确请求时提供细节
- 优先使用项目符号而非段落

---

## Language Policy 🌍

| 元素 | 语言 | 示例 |
|------|------|------|
| **代码** | 英文 | `class GameManager` |
| **注释** | 英文 | `// Update player score` |
| **变量/函数** | 英文 | `playerScore`, `calculateScore()` |
| **文件名** | 英文 | `game-manager.js` |
| **Git提交** | 英文 | `feat: add scoring system` |
| **用户界面** | 多语言(i18n) | `i18n.t('welcome_message')` |
| **对话/文档** | 中文 | (当前对话) |

**关键规则**:
- **代码**: 100%英文（类/函数/变量/注释/文件名）
- **UI文本**: 禁止硬编码，必须用i18n系统
- **Git**: 全英文提交信息

---

## Project Structure 📁

### 游戏目录结构

```
games/
├── game-name/                    # 每个游戏独立目录
│   ├── index.html               # 主游戏文件
│   ├── js/                      # 游戏逻辑
│   ├── css/                     # 游戏样式
│   ├── assets/                  # 游戏资源
│   │   ├── images/
│   │   └── sounds/
│   ├── docs/                    # 游戏专属文档
│   │   ├── design.md
│   │   ├── decisions.md
│   │   └── user-guide.md
│   └── README.md
```

### 文档规则

| 类型 | 位置 | 内容 |
|------|------|------|
| **游戏文档** | `games/[game-name]/docs/` | 设计/决策/用户指南 |
| **项目文档** | `docs/` | 开发日志/经验教训/最佳实践 |
| **通用组件** | `games/lib/` | 共享代码/工具库 |

**错误位置** ❌:
```
❌ docs/memory-match-design.md         # 游戏文档放项目docs
❌ games/memory-match.html             # 游戏文件直接在games/
❌ .claude/docs/game-design.md         # 游戏文档放agent目录
```

**正确位置** ✅:
```
✅ games/memory-match/index.html       # 游戏在其目录
✅ games/memory-match/docs/design.md   # 游戏文档跟游戏
✅ docs/lessons-learned/2025-01-05.md  # 项目级文档
```

---

## Code Standards 💻

### 代码示例

```javascript
// ✅ 正确
class GameManager {
  constructor() {
    this.score = 0;
  }

  // Update score based on achievements
  updateScore(points) {
    this.score += points;
    // Use i18n for UI text
    element.textContent = i18n.t('score', { score: this.score });
  }
}

// ❌ 错误
class 游戏管理器 {           // 中文类名
  constructor() {
    this.分数 = 0;          // 中文变量
  }
  更新分数(点数) {          // 中文函数
    element.textContent = "分数：" + this.分数;  // 硬编码文本
  }
}
```

### I18n 结构

```javascript
const messages = {
  en: { game_title: "Magic Chef", score: "Score: {score}" },
  zh: { game_title: "魔法厨师", score: "分数: {score}" }
};

// 使用
title.textContent = i18n.t('game_title');
scoreDisplay.textContent = i18n.t('score', { score: 100 });
```

---

## Path Standards 🔗

**关键**: 永远使用相对路径，绝不使用绝对路径

### 正确路径 ✅

```html
<!-- 游戏内资源 -->
<img src="assets/images/cat.png">
<script src="js/game.js"></script>

<!-- 跨游戏导航 -->
<a href="../other-game/index.html">Other Game</a>
<a href="../../index.html">Home</a>
```

```javascript
// ES6 模块
import { Player } from './entities/player.js';
import { Engine } from '../core/engine.js';

// 资源加载
bgImage.src = 'assets/images/bg.png';
```

### 错误路径 ❌

```html
<!-- 不许出现这些 -->
<img src="/home/wxcd/mgame/games/...">          ❌
<img src="/games/memory-match/assets/...">      ❌
<script src="C:\Projects\mgame\js\...">         ❌
```

**原因**: 部署到GitHub Pages后会失效

---

## Git Commit Format

```
<type>: <description>

Types: feat, fix, docs, style, refactor, perf, test, chore
```

```bash
# ✅ 正确
git commit -m "feat: add level progression system"
git commit -m "fix: collision detection in maze game"

# ❌ 错误
git commit -m "添加关卡系统"
git commit -m "修复碰撞检测"
```

---

## Universal Components 🔧

### 共享代码位置: `games/lib/`

**提取标准**:
- 3+游戏重复使用
- 100+行可复用代码
- 清晰单一职责
- 独立功能

**模块兼容模式**:
```javascript
class ComponentName {
  // Implementation
}

// 支持CommonJS (Node.js测试)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ComponentName };
}

// 支持浏览器全局
if (typeof window !== 'undefined') {
  window.ComponentName = ComponentName;
}
```

**已有组件**:
1. `PerformanceMonitor` - FPS/MS/MB监控
2. `Logger` - 结构化日志
3. `BackgroundMusicManager` - 背景音乐管理

---

## Testing Standards 🧪

### 测试要求
- **单元测试**: 80%+覆盖率
- **契约测试**: 所有公共API
- **集成测试**: 关键用户流程

### 契约测试模式
```javascript
// tests/api-contract.test.js
describe('AudioManager - Methods called by Game', () => {
  test('should have play method', () => {
    expect(typeof manager.play).toBe('function');
  });

  test('should have toggleMusic method', () => {
    expect(typeof manager.toggleMusic).toBe('function');
  });
});
```

**价值**: 捕获重构后的集成错误

---

## User Experience Patterns 🎮

### Tab可见性自动暂停

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (this.audioManager.isEnabled()) {
      this.audioManager.pause();
      this.musicWasPausedByTab = true;
    }
  } else {
    if (this.musicWasPausedByTab && this.audioManager.isEnabled()) {
      this.audioManager.resume();
      this.musicWasPausedByTab = false;
    }
  }
});
```

### 响应式控制

```javascript
const isMobile = 'ontouchstart' in window;
const controls = isMobile ? 'Tap and swipe' : 'Arrow keys';
```

---

## Code Quality Checklist

**提交前检查**:
- [ ] 所有代码英文
- [ ] 所有注释英文
- [ ] 无硬编码文本(用i18n)
- [ ] 所有文本有翻译
- [ ] 无console.log
- [ ] Git提交信息英文
- [ ] 文件名英文
- [ ] 相对路径

---

## Agent Instructions

**所有agent必须**:
- 代码100%英文
- UI文本100%使用i18n
- Git提交100%英文
- 文件名100%英文
- 路径100%相对路径

**专项要求**:
- `@frontend-developer`: 语义化HTML，i18n文本
- `@game-mechanics-engineer`: 算法注释英文，i18n消息
- `@ui-ux-designer`: 多语言设计，文本扩展空间
- `@qa-tester`: 多语言测试，i18n覆盖检查

---

## Quick Reference

**核心原则**: 代码英文，交流中文，游戏多语言

**关键限制**:
- 单个JS文件 ≤550行
- 报告长度 ≤200字
- 不执行git命令
- 用Write而不是cat

---

**This is a critical guideline. All agents and developers must follow these standards.**
