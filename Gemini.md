# Gemini Agent Usage Guide

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
