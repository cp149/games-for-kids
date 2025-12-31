# Autonomous Quality Agents

Four background agents that automatically improve code quality with minimal human intervention.

---

## 🧹 Refactoring Janitor (重构清洁工)

**Trigger**: Session end / User idle / Explicit call

**Workflow**:
```javascript
// 1. Scan code smells
mcp__plugin_serena_serena__search_for_pattern({
  substring_pattern: "(console\\.log|TODO|FIXME|debugger)",
  restrict_search_to_code_files: true
})

// 2. Check file length (>550 lines)
// Check each JS file line count

// 3. Check duplicate code
mcp__plugin_serena_serena__search_for_pattern({
  substring_pattern: "similar code pattern",
  context_lines_before: 3,
  context_lines_after: 3
})

// 4. Generate cleanup task
Task(subagent_type="refactoring-expert", prompt=`
  Found code smells:
  - [smell list]

  Execute:
  1. Remove debug code (console.log, debugger)
  2. Resolve TODO/FIXME or convert to issue
  3. Split oversized files
  4. Extract duplicate code to shared modules

  Requirement: Run npm test after each modification
`)

// 5. Verify and commit
Bash("npm test")  // Must pass
// Commit after human confirmation
```

**Code Smell Checklist**:
| Smell | Detection | Action |
|-------|-----------|--------|
| `console.log` | grep | Remove or replace with logger |
| `TODO/FIXME` | grep | Resolve or convert to issue |
| `debugger` | grep | Remove |
| File >550 lines | wc -l | Split module |
| Duplicate code | Serena search | Extract to lib/ |
| Magic numbers | grep hardcoded | Move to config.js |

---

## 🎯 Code-Coverage Bounty Hunter (覆盖率赏金猎人)

**Trigger**: After npm test / Verify phase

**Workflow**:
```javascript
// 1. Run tests with coverage report
Bash("npm test -- --coverage --json > coverage.json")

// 2. Analyze uncovered code
// Parse coverage.json to find uncovered lines

// 3. Create "bounty" list
mcp__plugin_serena_serena__write_memory(
  memory_file_name="coverage-bounties",
  content=`## 🎯 Uncovered Code Bounties

### High Priority (Core Logic)
- [ ] ColorMixGame.js:45-60 - Color mixing branches
- [ ] DragManager.js:120-135 - Boundary detection

### Medium Priority (Error Handling)
- [ ] UIManager.js:200-210 - Exception paths

### Low Priority (UI Helpers)
- [ ] MusicManager.js:80-90 - Volume fade
`
)

// 4. Agent competes to write tests
Task(subagent_type="qa-tester", prompt=`
  Bounty target: ColorMixGame.js:45-60 (color mixing)

  Task:
  1. Read target code to understand logic
  2. Write minimal test cases to cover these lines
  3. Run npm test to verify coverage improvement
  4. Submit test code

  Reward: For each 1% coverage increase, record in coverage-bounties completion list
`)

// 5. Update bounty status
mcp__plugin_serena_serena__edit_memory(
  memory_file_name="coverage-bounties",
  needle="- [ ] ColorMixGame.js:45-60",
  repl="- [x] ColorMixGame.js:45-60 ✅ covered by test_color_mixing.js"
)
```

**Coverage Targets**:
| Type | Minimum | Target | Description |
|------|---------|--------|-------------|
| Core Logic | 80% | 95% | Game mechanics, state management |
| Error Handling | 60% | 80% | Exception paths, boundary conditions |
| UI Helpers | 40% | 60% | Animations, sound effects |

**Auto-trigger Flow**:
```
npm test complete → coverage <80% → Auto-start Bounty Hunter
                     ↓
                  Generate bounty list → Agent writes tests → Coverage up
                                          ↓
                                     Update coverage-bounties memory
```

---

## 👹 Glitch Gremlin (破坏精灵)

**Goal**: Adversarial QA agent that specifically tries to break the game, finding edge case bugs.

**Trigger**: Verify phase / After new feature / Explicit call

**Attack Strategies**:
```javascript
// 1. Rapid click attack
mcp__playwright__browser_navigate({ url: "http://localhost:8000/games/[game]/" })

// Rapid consecutive clicks on same element
for (let i = 0; i < 20; i++) {
  mcp__playwright__browser_click({ element: "color ball", ref: "[ref]" })
}

// 2. Window size attack
const sizes = [
  { width: 320, height: 480 },   // Very small
  { width: 2560, height: 1440 }, // Very large
  { width: 100, height: 100 },   // Abnormally small
];
for (const size of sizes) {
  mcp__playwright__browser_resize(size)
  mcp__playwright__browser_take_screenshot({ filename: `claudedocs/gremlin-${size.width}x${size.height}.png` })
  mcp__playwright__browser_console_messages({ level: "error" })
}

// 3. Rapid drag attack
// Drag multiple elements simultaneously, drag off-screen, release mid-drag

// 4. State pollution attack
mcp__playwright__browser_evaluate({ function: `() => {
  // Clear localStorage
  localStorage.clear();
  // Inject corrupted data
  localStorage.setItem('gameState', 'corrupted_data');
  // Refresh page
  location.reload();
}` })

// 5. Network interruption simulation
// Operate in offline state

// 6. Check for crashes and errors
mcp__playwright__browser_console_messages({ level: "error" })
```

**Attack Checklist**:
| Attack Type | Action | Expected Result |
|-------------|--------|-----------------|
| Rapid clicks | 20 consecutive clicks | No crash, no duplicate triggers |
| Window extremes | 100x100 to 2560x1440 | Layout doesn't break |
| Boundary drag | Drag off-screen | Element bounces back or is constrained |
| State pollution | Inject corrupted localStorage | Graceful degradation or reset |
| Rapid toggle | Toggle features repeatedly | State consistency |
| Mid-action abandon | Refresh during drag | State recovers normally |

**Output Format**:
```markdown
## 👹 Gremlin Attack Report

### 🔴 Issues Found (Must Fix)
1. **Rapid clicks**: Color ball disappears after 15th click
   - Repro steps: Rapidly click red ball 15+ times
   - Console error: "Cannot read property 'x' of undefined"
   - File location: DragManager.js:45

### 🟡 Potential Risks (Suggested Fix)
1. **Tiny window**: Buttons overlap at 100x100

### 🟢 Tests Passed
- Window size switching: ✅
- State pollution recovery: ✅
```

---

## 🔬 Cross-Project Pattern Mining (跨项目模式挖掘)

**Goal**: Scan all game projects, extract best practices to shared library, **for new games to use, without modifying original code**.

**Principles**:
- ✅ Extract only, don't modify original games
- ✅ New games can choose to use shared library
- ✅ Original games continue running independently

**Trigger**: After new game completion / Monthly maintenance / Explicit call

**Workflow**:
```javascript
// 1. Scan all game project code
const games = ["puzzle-master", "color-mix-lab", "memory-match", ...];

for (const game of games) {
  mcp__plugin_serena_serena__get_symbols_overview({
    relative_path: `games/${game}/js/`
  })
}

// 2. Identify similar code patterns
mcp__plugin_serena_serena__search_for_pattern({
  substring_pattern: "class.*Manager",
  restrict_search_to_code_files: true
})

// 3. Comparative analysis (with Gemini)
mcp__gemini-cli__ask-gemini({
  prompt: `Analyze these games' code structure, find:
    1. Completely duplicate code blocks
    2. Similar but slightly different patterns
    3. Functions that can be abstracted into common library

    Game list: ${games.join(", ")}
    Code samples: [attach Manager classes from each game]

    Output format:
    - Extractable component name
    - Reference source (best implementation)
    - Generalization approach
    - Estimated reuse value (high/medium/low)`
})

// 4. Generate shared library (don't modify original games!)
Task(subagent_type="refactoring-expert", prompt=`
  Based on analysis results, create shared library component:

  Target: games/lib/DragManager.js
  Reference: color-mix-lab implementation (most complete)

  Requirements:
  1. Create new file in games/lib/
  2. Abstract into configurable generic class
  3. Write usage documentation and examples
  4. ⚠️ Do not modify any existing game code
`)

// 5. Update component registry
mcp__plugin_serena_serena__edit_memory({
  memory_file_name: "component-registry",
  needle: "## 📦 Shared Library Components",
  repl: `## 📦 Shared Library Components

### DragManager (v1.0)
- Path: games/lib/DragManager.js
- Reference source: color-mix-lab (best implementation)
- Features: Touch+mouse support, boundary detection, snap functionality
- Usage: import { DragManager } from '../../lib/DragManager.js'
`
})
```

**Mining Targets**:
| Code Pattern | Detection Method | Extract To |
|--------------|------------------|------------|
| DragManager variants | Class name match | lib/DragManager.js |
| MusicManager variants | Class name match | lib/MusicManager.js |
| Collision detection | Function signature | lib/CollisionUtils.js |
| Animation easing | Code similarity | lib/AnimationUtils.js |
| localStorage wrapper | Pattern match | lib/StorageManager.js |
| Event bus | Pattern match | lib/EventBus.js |

**Evolution Path**:
```
Existing games A, B, C (unchanged)
        ↓ Analyze best practices
Extract to lib/DragManager.js (v1.0)
        ↓
New game D uses shared library
        ↓ Feedback improvements
lib/DragManager.js (v2.0)
        ↓ Continuous accumulation
Form personal game engine → @mgame/core
```

**Output**: Update `component-registry` memory with:
- New shared components
- Reference source (which game has best implementation)
- Usage examples and code
- API documentation
