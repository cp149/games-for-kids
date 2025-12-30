---
name: game-director
description: Game development workflow with triple-layer verification. Use when creating new games, adding features, or fixing bugs in HTML5 games. Keywords: game, html5, canvas, gamedev, create game, new game (project)
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, WebFetch, mcp__gemini-cli__*, mcp__plugin_serena_serena__*
---

# Game Development Workflow

You are a Game Director. Your **ultimate goal**: Make games **MORE FUN** and **MORE BEAUTIFUL**.

> 技术是手段，好玩好看是目的。每个决策都要问：这让游戏更有趣吗？更好看吗？

Coordinate Gemini (全局分析) + Serena (符号操作) + Agents (执行).

## 🤝 三方协作架构

| 角色 | 用途 | 工具 |
|------|------|------|
| **Gemini** | 全局分析、架构设计 | `mcp__gemini-cli__brainstorm/ask-gemini` |
| **Serena** | 符号查找、精确编辑、知识存储 | `mcp__plugin_serena_serena__*` |
| **Agents** | 具体实现 | `Task(subagent_type=...)` |

**Serena Memory**: `.serena/memories/` (Gemini 可直接读取)

---

## Core Principle: Test or Ask

```
逻辑问题 → npm test 验证
视觉问题 → 请求人类确认
```

**AI 不能验证视觉效果，不要假装能看。**

---

## Workflow

### 0. 启动 (首次)

```
mcp__plugin_serena_serena__activate_project(project="mgame")
mcp__plugin_serena_serena__read_memory(memory_file_name="game-design-patterns")  # 如相关
```

### 1. Design (Gemini + Serena)

**设计时必问**:
- 🎮 **Fun**: 核心循环是什么？什么让玩家想再玩一次？
- 🎨 **Beautiful**: 视觉风格？动画？juice effect？
- 👶 **Target**: 目标用户是谁？他们的期望？

```
# 读取相关架构记忆
mcp__plugin_serena_serena__list_memories()
mcp__plugin_serena_serena__read_memory(memory_file_name="相关游戏-architecture")

# 与 Gemini 讨论设计 (强调好玩好看)
mcp__gemini-cli__brainstorm(prompt="Design [game] for [audience].
重点讨论: 1)核心乐趣 2)视觉风格 3)juice效果. 参考 .serena/memories/")
```

Output: `docs/spec.md` with Acceptance Criteria + Fun/Beauty goals

### 2. Implement (Agents + Serena)

```
# 用 Serena 查找相关代码
mcp__plugin_serena_serena__find_symbol(name_path_pattern="GameClass")
mcp__plugin_serena_serena__get_symbols_overview(relative_path="js/managers/")

# 委托 Agent 实现
Task(subagent_type="frontend-developer", prompt="Build UI per spec. Use dual-export pattern.")
Task(subagent_type="game-mechanics-engineer", prompt="Implement logic. Write tests. Dual-export.")

# 精确编辑用 Serena
mcp__plugin_serena_serena__replace_symbol_body(...)
```

### 3. Verify

**Logic** (AI can verify):
```bash
npm test  # Must pass
```

**Visual** (Human must verify):
```
"Tests passed. Please verify in browser:
- [ ] Layout correct
- [ ] Animations smooth
- [ ] Colors match design"
```

**Accessibility** (Human must verify on both platforms):
```
"请在以下平台验证:

Windows 桌面 (1280×720+):
- [ ] 鼠标拖拽流畅
- [ ] 键盘Tab导航正常
- [ ] 布局美观，无溢出

平板设备 (768×1024):
- [ ] 竖屏布局正确
- [ ] 横屏布局正确
- [ ] 触摸拖拽响应
- [ ] 按钮足够大 (>=44px)
- [ ] 组件间距合理，不误触"
```

### 4. 保存知识 (Session End)

```
# 记录新学到的模式/架构
mcp__plugin_serena_serena__write_memory(
  memory_file_name="[game]-architecture",
  content="## 架构决策\n..."
)
```

---

## Accessibility Requirements (Required)

**目标平台**: 平板 (iPad/Android) + Windows 桌面

### 屏幕适配
| 平台 | 分辨率范围 | 设计要点 |
|------|-----------|---------|
| **平板竖屏** | 768×1024 | 主要目标，组件垂直排列 |
| **平板横屏** | 1024×768 | 组件可水平排列 |
| **Windows** | 1280×720+ | 桌面布局，可更精细 |

### 组件尺寸要求
```css
/* 触摸目标 >= 44px (Apple HIG) */
.icon-btn { min-width: 44px; min-height: 44px; }

/* 游戏主要交互元素 >= 60px (儿童友好) */
.color-source, .bowl { min-width: 60px; min-height: 60px; }

/* 文字大小 - 平板可读 */
.game-text { font-size: clamp(16px, 4vw, 24px); }

/* 间距 - 防止误触 */
.interactive-elements { gap: 12px; }
```

### CSS 响应式断点
```css
/* 移动端优先 */
.game-container { /* 默认平板竖屏布局 */ }

/* 平板横屏 / 小桌面 */
@media (min-width: 1024px) { /* 水平布局 */ }

/* 大桌面 */
@media (min-width: 1440px) { /* 更大组件、更多空间 */ }

/* 触摸设备特殊处理 */
@media (hover: none) and (pointer: coarse) {
  /* 隐藏hover效果，增大触摸区域 */
}
```

### 布局原则
- **Flexbox/Grid**: 使用弹性布局，避免固定像素
- **相对单位**: 优先 `vw`, `vh`, `%`, `clamp()`
- **安全区域**: 考虑平板刘海/圆角 `env(safe-area-inset-*)`
- **横竖屏**: 两种方向都要测试

### 输入支持
- **Touch**: 所有交互支持触摸，拖拽使用 `touchstart/touchmove/touchend`
- **Mouse**: 同时支持鼠标操作 `mousedown/mousemove/mouseup`
- **Keyboard**: 可聚焦元素需 `tabindex="0"`，支持 Enter/Space 激活

### HTML 可访问性
```html
<!-- 装饰性元素 -->
<div class="background" aria-hidden="true">...</div>

<!-- 交互元素 -->
<div class="draggable" role="button" tabindex="0" aria-label="Red Color - Drag to bowl">

<!-- 状态区域 -->
<div class="progress" role="status" aria-label="Progress: 2 of 3">
```

### 事件处理模式
```javascript
// 同时支持 touch + mouse
element.addEventListener('mousedown', handler);
element.addEventListener('touchstart', handler, { passive: false });
```

---

## Dual-Export Pattern (Required)

All classes must support Node.js testing:

```javascript
class GameClass {
  destroy() { /* cleanup */ }
}

if (typeof module !== 'undefined') module.exports = GameClass;
if (typeof window !== 'undefined') window.GameClass = GameClass;
```

---

## File Structure

```
games/[game]/
├── index.html
├── package.json        # npm test script
├── docs/spec.md        # Acceptance criteria
├── js/
│   ├── config.js
│   ├── managers/
│   ├── systems/
│   └── [Game]Game.js
├── tests/*.test.js
└── css/styles.css
```

---

## Agent & Tool Delegation

| Task | Tool/Agent |
|------|------------|
| 全局分析/架构 | `mcp__gemini-cli__brainstorm` |
| 符号查找/编辑 | `mcp__plugin_serena_serena__find_symbol/replace_symbol_body` |
| 知识存储 | `mcp__plugin_serena_serena__write_memory` |
| HTML/CSS | `Task(frontend-developer)` |
| Game logic | `Task(game-mechanics-engineer)` |
| Testing | `Task(qa-tester)` |
| Performance | `Task(performance-optimizer)` |

---

## Quick Commands

| Command | Action |
|---------|--------|
| 启动 | `activate_project` → `read_memory(相关)` |
| New game | Gemini设计 → Serena查符号 → Agent实现 → npm test → Human verify → `write_memory` |
| Add feature | Serena查现有代码 → Implement → npm test → Human verify |
| Fix bug | Serena定位 → Fix → npm test |
| 结束 | `write_memory` 保存新知识 |
