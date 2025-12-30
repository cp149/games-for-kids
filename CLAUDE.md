# Claude Development Guidelines

## 🚀 启动时执行

**首次对话必须激活 Serena**:
```
mcp__plugin_serena_serena__activate_project(project="mgame")
```

---

## ⚡ Output Policy - CRITICAL

**所有路径用相对路径，禁止绝对路径**
**BE CONCISE. MINIMIZE TOKEN USAGE.**

- **默认**: 不输出报告，除非明确需要
- **必要时**: 最多200字，使用项目符号
- **通用**: 简短直接，无多余前言/结语

---

## Language Policy 🌍

| 元素 | 语言 | 示例 |
|------|------|------|
| **代码/注释/变量** | 英文 | `class GameManager` |
| **文件名/Git提交** | 英文 | `feat: add scoring` |
| **UI文本** | i18n | `i18n.t('welcome')` |
| **对话** | 中文 | 当前对话 |

**核心**: 代码100%英文，UI用i18n，Git全英文

---

## Project Structure 📁

```
games/
├── game-name/
│   ├── index.html
│   ├── js/
│   │   ├── config.js
│   │   ├── managers/        # UIManager, DragManager
│   │   ├── systems/         # MixingSystem
│   │   └── i18n/
│   ├── css/
│   ├── assets/
│   │   ├── images/
│   │   └── sounds/
│   ├── tests/               # *.test.js
│   ├── docs/                # 正式文档
│   ├── claudedocs/          # 临时文档 (不提交git)
│   └── README.md
```

| 类型 | 位置 |
|------|------|
| 游戏文档 | `games/[game]/docs/` |
| 项目文档 | `docs/` |
| 共享组件 | `games/lib/` |
| 临时文档 | `games/[game]/claudedocs/` |

---

## Code Standards 💻

- **命名**: 英文类/函数/变量
- **UI文本**: 禁止硬编码，用 `i18n.t('key')`
- **模块导出**: 同时支持 CommonJS + Browser (双导出模式)

---

## Path Standards 🔗

- **必须**: 相对路径 `assets/images/cat.png`
- **禁止**: 绝对路径 `/home/...` 或 `/games/...`

---

## Git Policy

**禁止执行任何git命令** - 由用户手动操作

提交格式: `<type>: <description>` (英文)
Types: feat, fix, docs, style, refactor, perf, test, chore

---

## Testing 🧪

- **单元测试**: 80%+覆盖率
- **契约测试**: 所有公共API
- **集成测试**: 关键用户流程

---

## 🤝 Gemini + Serena 协作

| 场景 | 用谁 | 工具 |
|------|------|------|
| 日常开发 | Serena | `find_symbol`, `replace_symbol_body` |
| 全局分析/架构 | Gemini | `mcp__gemini-cli__ask-gemini` |
| 知识持久化 | Serena | `write_memory`, `read_memory` |
| 代码搜索 | Serena 优先 | `search_for_pattern`, `find_symbol` |

**Serena Memory**: `.serena/memories/` (Gemini 可直接读取)

**工作流**:
- 小任务: Claude + Serena 直接干
- 大重构/卡住: 问 Gemini (它会读 `.serena/memories/`)
- 新知识: Claude 调用 `serena.write_memory` 保存

---

## Agent Instructions

**所有agent必须**:
- 代码/注释/文件名 100%英文
- UI文本 100%使用i18n
- 路径 100%相对路径
- **Plan讨论**: 使用 `mcp__gemini-cli__brainstorm` 或 `mcp__gemini-cli__ask-gemini` 多轮讨论

---

## Quick Reference

| 限制 | 值 |
|------|-----|
| JS文件行数 | ≤550行 |
| 报告长度 | ≤200字 |
| Playwright MCP | 禁用 |
| 测试工具 | /chrome |

**核心原则**: 代码英文，交流中文，游戏多语言

---

**This is a critical guideline. All agents must follow these standards.**
