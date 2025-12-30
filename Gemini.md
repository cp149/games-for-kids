# Gemini Agent Guide

## 🔗 Serena Memory 位置

**项目知识库**: `.serena/memories/`

```
.serena/memories/
├── game-development-lessons-2025-01.md   # 开发经验
├── game-design-patterns.md               # 设计模式
├── testing-strategy.md                   # 测试策略
├── code-quality-checklist.md             # 质量检查
├── *-architecture.md                     # 各游戏架构
└── ...
```

**读取方式**: 直接 `read_file(".serena/memories/xxx.md")`

---

## 🤝 与 Claude/Serena 协作

| 角色 | 职责 |
|------|------|
| **Gemini (你)** | 全局分析、架构决策、长 context 任务 |
| **Claude** | 代码执行、日常开发、工具调用 |
| **Serena** | 符号操作、精确编辑、知识持久化 |

**工作流**:
1. Claude 遇到需要全局理解的问题 → 调用你
2. 你读取 `.serena/memories/` 获取项目上下文
3. 你分析后返回建议
4. 如有新知识需要记录 → 告诉 Claude → Claude 调用 `serena.write_memory`

---

## 📚 Sub-Agent 调用指南

This document records the workflows for invoking specialized sub-agents within the Gemini CLI environment using the underlying `claude` tool.

## Invoking Sub-Agents via CLI

You can dynamically define and invoke specialized agents using the `claude` command-line interface with the `--agents` parameter. This allows for temporary, task-specific agent personas with defined capabilities.

### Command Syntax

```bash
claude -p --tools="default"  --dangerously-skip-permissions --agents '{
  "agent-name": {
    "description": "Short description of the agent",
    "prompt": "Detailed system prompt defining persona, constraints, and workflow",
    "tools": ["Tool1", "Tool2", ...],
    "model": "sonnet",
    "resume": "agent-name-123"
  }
}' "@agent-name Your instruction here"
```

### Example: Code Reviewer

Here is a working example of creating a `code-reviewer` agent to analyze the project:

```bash
claude --print --tools="default"  --dangerously-skip-permissions --agents '{
  "code-reviewer": {
    "description": "Expert code reviewer.",
    "prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices. Always check for memory leaks and architectural violations.",
    "tools": ["Read", "Grep", "Glob", "Bash"],
    "model": "sonnet",
    "resume": "code-reviewer-123"
  }
}' "@code-reviewer Review games/memory-match/ for memory leaks and architectural issues."
```

### Example: Frontend Developer (Refactoring)

To invoke a developer agent that strictly follows TDD and project constraints (as defined in `.claude/agents/frontend-developer.md`):

```bash
claude --print --tools="default"  --dangerously-skip-permissions --agents '{
  "frontend-developer": {
    "description": "Expert frontend developer.",
    "prompt": "You are an expert frontend developer. CRITICAL: You MUST follow strict TDD. 1. Write test FIRST. 2. Max 50 lines/cycle. 3. Use TodoWrite. 4. Verify immediately. [Include full prompt content here...]",
    "tools": ["Read", "Write", "Replace", "RunShell", "Glob", "Grep"],
    "model": "sonnet",
     "resume": "frontend-developer-123"
  }
}' "@frontend-developer Refactor games/memory-match/index.html to use separate classes."
```

## Agent Configuration Fields

*   **`description`**: A brief summary of the agent's purpose.
*   **`prompt`**: The full system instruction. You can copy this from the `.claude/agents/*.md` files in the repository to ensure consistency with project standards.
*   **`tools`**: List of allowed tools (e.g., `Read`, `Write`, `RunShell`, `Grep`, `Glob`).
*   **`model`**: The model to use (e.g., `sonnet`, `opus`).

## Alternative: Simulating Agents

If the CLI tool is unavailable or if you prefer manual control, you can simulate an agent by:
1.  Reading the agent's definition file (e.g., `read_file .claude/agents/game-designer.md`).
2.  Adopting the "persona" and "constraints" defined in that file for your subsequent actions.
3.  Manually ensuring you follow the workflows (like TDD or specific documentation formats).

## Multi-Agent Collaboration Workflow (Example)

This workflow demonstrates how to use specialized agents to identify, fix, and verify issues in a project.

### Phase 1: Audit (QA Tester)
Identify issues by invoking the `qa-tester` with its full system prompt.
```bash
claude -p --tools="default" --dangerously-skip-permissions --agents '{"qa-tester": {...}}' "@qa-tester Audit games/target-game/ for compliance and bugs."
```

### Phase 2: Planning (Frontend Developer)
Ask the developer agent to analyze the audit results and create a TDD plan.
```bash
claude -p --tools="default" --dangerously-skip-permissions --agents '{"frontend-developer": {...}}' "@frontend-developer Create a TodoWrite plan to fix the issues reported by QA."
```

### Phase 3: Iterative Implementation (Frontend Developer)
Execute the plan in small steps (max 50 lines), writing tests first.
```bash
claude -p --tools="default" --dangerously-skip-permissions --agents '{"frontend-developer": {...}}' "@frontend-developer Execute Task 1: Implement i18n infrastructure. Write tests first!"
```

### Phase 4: Final Verification (QA Tester)
Re-run the audit to ensure all issues are resolved and no regressions were introduced.
```bash
claude -p --tools="default" --dangerously-skip-permissions --agents '{"qa-tester": {...}}' "@qa-tester Re-audit games/target-game/ and verify all fixes."
```
