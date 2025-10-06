# ADR 001: Shared Framework Structure

**Status**: Accepted
**Date**: 2025-10-06
**Decision Makers**: Game Director

---

## Context

We are building multiple browser-based games (memory match, runner, etc.) and need a shared framework to:

1. Avoid duplicating code across games
2. Ensure consistency in game quality
3. Speed up development of new games
4. Maintain high performance (60 FPS)
5. Support both simple and complex games

**Constraints**:
- No external dependencies (vanilla JS only)
- No build step required (for simplicity)
- Must support both single-file and modular games
- Must work on mobile devices
- Must be easy to learn and use

---

## Decision

We will create a shared framework in `/lib/` directory with the following structure:

### Directory Organization

```
lib/
├── core/        # Game loop, scenes, entities
├── input/       # Keyboard, mouse, touch
├── audio/       # Audio manager, SFX
├── visual/      # Particles, effects
├── physics/     # Math, collision
├── ui/          # UI components
├── scoring/     # Score, combos
├── storage/     # Save/load
├── i18n/        # Translations
├── animation/   # Tweening
├── performance/ # Optimization
└── utils/       # Helpers
```

### Key Architectural Choices

1. **ES6 Modules** - Use native browser modules, no bundler
2. **Feature-Based** - Organize by domain, not by layer
3. **SOLID Principles** - Clear separation of concerns
4. **Object Pooling** - For performance-critical objects
5. **Event-Driven** - Loose coupling via events
6. **Fixed Timestep** - For deterministic physics
7. **Singleton Managers** - For global systems (audio, save)

---

## Alternatives Considered

### Alternative 1: Monolithic Framework File

**Pros**:
- Single import
- Easy to distribute
- No path issues

**Cons**:
- Large file size
- Can't cherry-pick features
- Hard to maintain
- Forces loading unused code

**Verdict**: ❌ Rejected - Too inflexible

### Alternative 2: NPM Package with Build Step

**Pros**:
- Modern tooling
- Bundling/minification
- TypeScript support
- Easy versioning

**Cons**:
- Adds complexity
- Requires build step
- Harder for beginners
- Against "no dependencies" constraint

**Verdict**: ❌ Rejected - Too complex for our use case

### Alternative 3: Per-Game Custom Code

**Pros**:
- Maximum flexibility
- No overhead
- Tailored to each game

**Cons**:
- Code duplication
- Inconsistent quality
- Slower development
- Hard to maintain

**Verdict**: ❌ Rejected - Doesn't solve the problem

### Alternative 4: Chosen Solution (ES6 Modules in /lib)

**Pros**:
- ✅ No build step
- ✅ Tree-shakeable (import only what you need)
- ✅ Clear dependencies
- ✅ Easy to understand
- ✅ Native browser support
- ✅ Modular and maintainable

**Cons**:
- ⚠️ Requires relative paths
- ⚠️ No minification (acceptable for now)
- ⚠️ Multiple HTTP requests (can optimize later)

**Verdict**: ✅ **Accepted** - Best balance of simplicity and flexibility

---

## Rationale

### Why ES6 Modules?

1. **Native Support**: All modern browsers support ES6 modules
2. **Explicit Dependencies**: Clear import/export statements
3. **No Build Step**: Keeps development simple
4. **Code Splitting**: Import only what you need
5. **Learning Opportunity**: Good for understanding module systems

### Why Feature-Based Organization?

1. **Clear Boundaries**: Each directory is a cohesive domain
2. **Easy Navigation**: Find code by feature, not by type
3. **Better Encapsulation**: Related code stays together
4. **Scalable**: Easy to add new features
5. **Maintainable**: Changes localized to one directory

### Why Object Pooling?

1. **Performance**: Eliminates garbage collection pauses
2. **Consistency**: Stable 60 FPS even with many objects
3. **Memory Efficient**: Reuse objects instead of creating new ones
4. **Battle-Tested**: Used in all major game engines

### Why Fixed Timestep?

1. **Determinism**: Physics behaves the same on all devices
2. **Stability**: No spiral of death from slow frames
3. **Multiplayer Ready**: Same simulation on all clients (future)
4. **Industry Standard**: Used by Unity, Unreal, etc.

---

## Implementation Plan

### Phase 1: Core Foundation (Week 1)
- Implement core systems (Game, Scene, Entity)
- Implement physics (Vector2D, collision)
- Implement utilities (Math, Random)
- Create minimal working example

### Phase 2: Input & Output (Week 1-2)
- Implement input system
- Implement audio system
- Test on example game

### Phase 3: Effects & UI (Week 2)
- Implement particle system
- Implement UI components
- Implement scoring system

### Phase 4: Persistence & I18n (Week 2-3)
- Implement save/load
- Implement translations
- Implement animation system

### Phase 5: First Real Game (Week 3-4)
- Build runner game using framework
- Validate all systems work together
- Refine APIs based on real usage

### Phase 6: Polish & Document (Week 4-5)
- Complete documentation
- Add more examples
- Performance optimization
- Testing

---

## Consequences

### Positive

1. ✅ **Faster Development**: New games can reuse all systems
2. ✅ **Consistency**: All games follow same patterns
3. ✅ **Quality**: Shared systems are well-tested
4. ✅ **Maintainability**: Fix bugs once, all games benefit
5. ✅ **Learning**: Clear examples and documentation
6. ✅ **Performance**: Optimizations benefit all games

### Negative

1. ⚠️ **Learning Curve**: Developers must learn framework
2. ⚠️ **Migration Cost**: Existing games need updating (optional)
3. ⚠️ **Breaking Changes**: Updates may require code changes
4. ⚠️ **Abstraction**: Some overhead vs. direct code

### Neutral

1. 📋 **Documentation Burden**: Must keep docs updated
2. 📋 **API Stability**: Need to be careful with changes
3. 📋 **Examples Required**: Need good example games

---

## Risks & Mitigation

### Risk 1: Framework Becomes Too Complex

**Likelihood**: Medium
**Impact**: High

**Mitigation**:
- Start simple, add features only when needed
- YAGNI principle (You Aren't Gonna Need It)
- Regular reviews to remove unused code
- Keep documentation updated

### Risk 2: Performance Issues

**Likelihood**: Low
**Impact**: High

**Mitigation**:
- Design for performance from start (object pooling)
- Performance monitoring built-in
- Regular performance testing
- Optimize hot paths

### Risk 3: Browser Incompatibility

**Likelihood**: Low
**Impact**: Medium

**Mitigation**:
- Use widely supported APIs
- Test on multiple browsers
- Provide polyfills if needed
- Document minimum browser versions

### Risk 4: Breaking Changes

**Likelihood**: Medium
**Impact**: Medium

**Mitigation**:
- Semantic versioning
- Changelog for all changes
- Deprecation warnings before removal
- Maintain backward compatibility when possible

---

## Success Criteria

The framework will be considered successful if:

1. ✅ **Developer Productivity**: New game in < 1 day
2. ✅ **Performance**: 60 FPS with 1000 particles
3. ✅ **Code Reuse**: > 70% of code is shared
4. ✅ **Quality**: Zero critical bugs in production
5. ✅ **Adoption**: All new games use framework
6. ✅ **Documentation**: Complete API docs and examples
7. ✅ **Mobile Support**: Works on iOS and Android

---

## Open Questions

1. **Testing Strategy**: How do we test the framework?
   - **Answer**: Start with manual testing, add automated tests in Phase 6

2. **Version Management**: How do we handle framework updates?
   - **Answer**: Semantic versioning, changelog, deprecation warnings

3. **Backward Compatibility**: Support old games forever?
   - **Answer**: Major versions can break compatibility, minor versions maintain it

4. **Build System**: Add one later?
   - **Answer**: Maybe in future for production builds, but keep dev simple

5. **TypeScript**: Convert to TypeScript?
   - **Answer**: Not now, but TypeScript definitions in future would be valuable

---

## Related Decisions

- [ADR 002: Game Loop Implementation](#) (future)
- [ADR 003: Input System Design](#) (future)
- [ADR 004: Audio System Architecture](#) (future)
- [ADR 005: Particle System Performance](#) (future)

---

## References

- [Game Programming Patterns by Robert Nystrom](https://gameprogrammingpatterns.com/)
- [Fix Your Timestep! by Glenn Fiedler](https://gafferongames.com/post/fix_your_timestep/)
- [MDN: JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Unity Manual: Order of Execution](https://docs.unity3d.com/Manual/ExecutionOrder.html)

---

## Approval

| Role | Name | Date | Status |
|------|------|------|--------|
| Game Director | Claude | 2025-10-06 | ✅ Approved |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-06 | Game Director | Initial decision |
