# Path Race - Algorithm Unit Tests

Comprehensive unit tests for the Ant Colony Optimization (ACO) algorithm and greedy fallback pathfinding.

## Test Coverage

### 1. Grid Generation Tests
- ✅ Valid grid structure (3x3, 4x4, 5x5, 6x6)
- ✅ Start/End positioning (checkerboard constraint)
- ✅ Hamiltonian path validation
- ✅ Solution correctness

### 2. ACO Algorithm Tests
- ✅ Initialization
- ✅ Pheromone management
- ✅ Path construction
- ✅ Path validation (isValidPath)
- ✅ Heuristic function
- ✅ Iteration convergence

### 3. Greedy Fallback Tests
- ✅ Basic pathfinding (3x3, 4x4, 5x5)
- ✅ Hamiltonian path validation
- ✅ 100% success rate verification

### 4. Stress Tests
- ✅ Multiple grid generations
- ✅ 100 random grids with greedy
- ✅ Edge case handling

## Running Tests

### Option 1: Using the test script
```bash
cd tests
chmod +x run-tests.sh
./run-tests.sh
```

### Option 2: Using npm directly
```bash
cd tests
npm install  # First time only
npm test
```

### Option 3: Watch mode (for development)
```bash
cd tests
npm run test:watch
```

### Option 4: With coverage report
```bash
cd tests
npm run test:coverage
```

## Test Results Interpretation

### Expected Output
```
PASS  tests/aco-algorithm.test.js
  GridGenerator
    ✓ should generate valid 3x3 grid
    ✓ should generate valid 4x4 grid
    ✓ should have start and end in different color groups
    ✓ solution should be valid Hamiltonian path
  AntColony
    ✓ should initialize correctly
    ✓ should initialize pheromones
    ✓ should construct path from start to end
    ✓ isValidPath should validate correctly
    ✓ isValidPath should reject incomplete paths
    ✓ should find valid path within iterations
  AIManager Greedy Fallback
    ✓ greedy should find valid path for 3x3 grid
    ✓ greedy should find valid path for 4x4 grid
    ✓ greedy path should be valid Hamiltonian path
  Stress Tests
    ✓ should handle multiple grid generations
    ✓ greedy should succeed on 100 random grids

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

### What Tests Verify

1. **Grid Generation**: Ensures puzzles are solvable and follow constraints
2. **ACO Correctness**: Validates algorithm logic and path quality
3. **Validation Logic**: Ensures only complete valid paths are accepted
4. **Greedy Reliability**: Confirms fallback always works as last resort
5. **Stress Testing**: Verifies stability across many random scenarios

## Debugging Failed Tests

### If ACO tests fail
- Check `CONFIG.ACO` parameters in `js/config.js`
- Verify heuristic function in `AntColony.js:calculateHeuristic()`
- Increase `MAX_ITERATIONS` if convergence is slow

### If Greedy tests fail
- Check backtracking logic in `AIManager.js:greedyPathFinding()`
- Verify neighbor sorting by distance to end
- Check for infinite recursion or stack overflow

### If Grid Generation tests fail
- Check `GridGenerator.js:validateHamiltonianPath()`
- Verify checkerboard coloring logic
- Check deterministic fallback positions

## Test Maintenance

Update tests when:
- ✅ ACO parameters change
- ✅ Grid generation algorithm updates
- ✅ Path validation logic modifies
- ✅ New edge cases discovered

## Performance Benchmarks

Approximate test execution times:
- Grid Generation: ~100ms
- ACO Algorithm: ~5s (with 50 iteration test)
- Greedy Fallback: ~200ms
- Stress Tests: ~20s (100 grids)

Total: ~25-30 seconds

## Continuous Integration

Tests should be run:
- ✅ Before committing algorithm changes
- ✅ After parameter tuning
- ✅ When adding new features
- ✅ Before production deployment

## Known Limitations

1. ACO is probabilistic - may not find path in 50 iterations
2. Tests run in Node.js - browser environment may differ slightly
3. Random seed not controlled - results vary slightly

## Future Improvements

- [ ] Add performance benchmarks
- [ ] Test pheromone convergence patterns
- [ ] Test difficulty scaling
- [ ] Add visual regression tests
- [ ] Test mobile performance
