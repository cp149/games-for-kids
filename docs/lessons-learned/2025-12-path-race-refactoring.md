# Path Race Development Lessons

**Date**: December 2025
**Context**: Series 14 - First AI competition game, major OO refactoring, lib component extraction

---

## 🏗️ Architecture & Refactoring

### Callback Pattern > Direct Dependencies

**Problem**: AIManager tightly coupled to game object
```javascript
// ❌ Before: Tight coupling
class AIManager {
    constructor(game) {
        this.game = game;
    }
    updateProgress() {
        this.game.uiManager.updateAIProgress();
        this.game.setNeedsRender();
        this.game.checkWinner();
    }
}
```

**Solution**: Callback-based decoupling
```javascript
// ✅ After: Callback pattern
class AIManager {
    constructor(callbacks = {}) {
        this.callbacks = {
            onProgress: callbacks.onProgress,
            onStatusChange: callbacks.onStatusChange,
            onFinish: callbacks.onFinish
        };
    }
    updateProgress() {
        this.callbacks.onProgress?.(percent);
        this.callbacks.onNeedsRender?.();
    }
}
```

**Benefits**:
- Follows Dependency Inversion Principle (SOLID)
- AIManager independently testable
- Clear responsibility boundaries
- No cross-layer coupling

**When to use**: Any manager/service that needs to notify multiple components without knowing their implementation.

---

### Law of Demeter - Avoid Deep Property Access

**Problem**: Reaching through multiple layers
```javascript
// ❌ Violates Law of Demeter
const key = this.aiManager.antColony.getEdgeKey(from, to);
```

**Solution**: Add encapsulation method
```javascript
// ✅ Encapsulated access
class AIManager {
    getEdgeKey(from, to) {
        return this.antColony ? this.antColony.getEdgeKey(from, to) : null;
    }
}
```

**Rule**: "Don't talk to strangers" - only call methods on direct neighbors, not their properties.

---

### Dependency Injection > Hardcoded Dependencies

**Problem**: Hardcoded container dependency
```javascript
// ❌ Hardcoded
constructor() {
    this.container = document.body;
}
```

**Solution**: Inject with sensible default
```javascript
// ✅ Injected
constructor(container = document.body) {
    this.container = container;
}
```

**Benefits**: Testability, flexibility, no global state coupling.

---

## 📦 Code Reuse & lib Extraction

### Extract After 3× Duplication, Not Before

**Observation**: ParticleSystem duplicated across games
- path-race: particle effects (167 lines)
- match-three: similar effects (227 lines)
- magic-piano-factory: specialized particles (489 lines)

**Action**:
1. Extracted ParticleSystem to `games/lib/particle-system.js`
2. Migrated path-race (delete local copy)
3. Migrated match-three (227 → 156 lines, 31% reduction)
4. Did NOT migrate magic-piano-factory (too specialized)

**Rule**: Wait for 3 instances of similar code before extracting. Avoid premature abstraction.

**Extraction Criteria**:
- ✅ 3+ games need it
- ✅ 100+ lines of code
- ✅ Single, clear responsibility
- ✅ Independent functionality
- ❌ Don't extract if >50% game-specific logic

---

## ⚡ Performance & Optimization

### Measure First, Optimize Later

**Mistake**: Added 50ms timeout to Hamiltonian path validation "for performance"

**Result**: Broke 4×4 grid generation (100% failure rate)

**Root Cause**:
- Assumed validation was performance bottleneck
- Only considered worst case (6×6 grid)
- Ignored common case (3×3, 4×4)
- Validation only runs ONCE per level load

**Lesson**: Don't optimize without measuring. A 5-second level load is acceptable - don't break functionality to save 50ms.

**Fix**: Dynamic timeout based on grid size (3×3: 1s → 6×6: 5s)

---

## 🎮 Game Design & UX

### Tutorial Deletion = Better Game

**What we did**: Deleted 220 lines of tutorial code
- Step-by-step instructions
- Forced walkthrough
- Disabled AI during tutorial

**Why it failed**:
- Rules are self-evident (try once, understand everything)
- Tutorial removed core fun (AI competition)
- Passive reading < active play

**Lesson**: Good tutorials show WHY games are fun, not HOW to play. Best tutorial = well-designed Level 1.

**Better approach**: Make Level 1 AI slow → player wins easily → builds confidence → increases difficulty gradually.

---

### Kids Don't Read Text (Age 5-8)

**Discovery**: Text feedback invisible to target users

**Solution**: Multi-sensory feedback
- ✅ Large emoji (32px 🎉)
- ✅ Bounce animation
- ✅ Sound effects (1100Hz, 0.25s)
- ❌ Text descriptions

**Rule**: For kids games, every feedback must work WITHOUT reading ability.

**Design Principle**: Visual + Audio + Animation > Text

---

## 🧪 Testing & Development

### Trust Your Tests - They Reveal Design Issues

**Case**: PathManager auto-added start dot → tests failed

**Wrong response**: Fix tests to match code
**Right response**: Question the design

**Analysis**:
- Auto-add broke "must click green dot first" rule
- Created special case logic in `getPathLength()` (subtract 1)
- Tests expected manual click (revealed inconsistency)

**Action**: Deleted auto-add logic → simpler code, consistent behavior, all tests pass

**Lesson**: Test failures are design smell detectors, not obstacles to bypass.

---

## 🎯 Key Takeaways

1. **Architecture**: Callback pattern beats tight coupling for manager classes
2. **SOLID Principles**: DIP (callbacks), SRP (single responsibility), LoD (encapsulation)
3. **Code Reuse**: Extract after 3× duplication, not before
4. **Performance**: Measure before optimizing, don't break functionality for micro-optimizations
5. **Game Design**: Less is more - delete features that don't serve core fun
6. **Kids UX**: Visual + audio + animation, text optional
7. **Testing**: Trust test failures, they reveal design problems

---

## 📊 Results

- **Tests**: 128/128 passing
- **Code Quality**: SOLID principles enforced
- **Shared lib**: 827 lines across 5 games
- **Game Rating**: 8.8/10 (Production Ready)
- **Tutorial**: Deleted (better without it)

---

**Next Time**:
- Start with callback pattern for any manager class
- Extract to lib only after 3× duplication
- Design Level 1 as natural tutorial
- Use symbols/sounds for kids, not text
