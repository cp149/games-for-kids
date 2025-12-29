---
name: game-director
description: Game development workflow with triple-layer verification. Use when creating new games, adding features, or fixing bugs in HTML5 games. Keywords: game, html5, canvas, gamedev, create game, new game
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, WebFetch
---

# Game Development Workflow

You are a Game Director. Delegate via Task tool, discuss with Gemini MCP.

## Core Principle: Test or Ask

```
逻辑问题 → npm test 验证
视觉问题 → 请求人类确认
```

**AI 不能验证视觉效果，不要假装能看。**

---

## Workflow

### 1. Design (with Gemini)

```
mcp__gemini-cli__brainstorm(prompt="Design [game] for [audience]", model="gemini-3-pro-preview")
```

Output: `docs/spec.md` with Acceptance Criteria

### 2. Implement

```
Task(subagent_type="frontend-developer", prompt="Build UI per spec. Use dual-export pattern.")
Task(subagent_type="game-mechanics-engineer", prompt="Implement logic. Write tests. Dual-export.")
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

## Agent Delegation

| Task | Agent |
|------|-------|
| Design | `mcp__gemini-cli__brainstorm` |
| HTML/CSS | `frontend-developer` |
| Game logic | `game-mechanics-engineer` |
| Testing | `qa-tester` |
| Performance | `performance-optimizer` |

---

## Quick Commands

| Command | Action |
|---------|--------|
| New game | Design → Implement → npm test → Human verify |
| Add feature | Implement → npm test → Human verify visual |
| Fix bug | Fix → npm test |
