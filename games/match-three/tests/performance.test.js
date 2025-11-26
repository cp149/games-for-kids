/**
 * Performance Benchmarks
 * Tests performance of critical game logic functions
 */

const BoardLogic = require('../js/board-logic.js');

// Performance test helper
function benchmark(name, fn, iterations = 1000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const total = end - start;
    const avg = total / iterations;

    console.log(`${name}:`);
    console.log(`  Total: ${total.toFixed(2)}ms`);
    console.log(`  Average: ${avg.toFixed(4)}ms`);
    console.log(`  Iterations: ${iterations}`);
    console.log();

    return { total, avg, iterations };
}

// Create test grids
function createRandomGrid(size, numTypes) {
    return BoardLogic.generateBoard(size, numTypes);
}

console.log('=== BoardLogic Performance Benchmarks ===\n');

// Benchmark 1: hasAvailableMoves (8x8)
console.log('1. hasAvailableMoves (8x8 grid)');
const grid8x8 = createRandomGrid(8, 6);
const result1 = benchmark(
    'hasAvailableMoves',
    () => BoardLogic.hasAvailableMoves(grid8x8, 8),
    1000
);
console.log(`  ✓ Target: < 5ms, Actual: ${result1.avg.toFixed(4)}ms\n`);

// Benchmark 2: hasAvailableMoves (10x10)
console.log('2. hasAvailableMoves (10x10 grid)');
const grid10x10 = createRandomGrid(10, 6);
const result2 = benchmark(
    'hasAvailableMoves',
    () => BoardLogic.hasAvailableMoves(grid10x10, 10),
    500
);
console.log(`  ✓ Target: < 10ms, Actual: ${result2.avg.toFixed(4)}ms\n`);

// Benchmark 3: hasAvailableMoves (12x12)
console.log('3. hasAvailableMoves (12x12 grid)');
const grid12x12 = createRandomGrid(12, 6);
const result3 = benchmark(
    'hasAvailableMoves',
    () => BoardLogic.hasAvailableMoves(grid12x12, 12),
    200
);
console.log(`  ✓ Target: < 20ms, Actual: ${result3.avg.toFixed(4)}ms\n`);

// Benchmark 4: findMatches (full scan, 8x8)
console.log('4. findMatches - full scan (8x8 grid)');
const result4 = benchmark(
    'findMatches (full)',
    () => BoardLogic.findMatches(grid8x8, 8),
    1000
);
console.log(`  ✓ Target: < 5ms, Actual: ${result4.avg.toFixed(4)}ms\n`);

// Benchmark 5: findMatches (local, 8x8)
console.log('5. findMatches - local check (8x8 grid)');
const positions = [{ row: 3, col: 3 }, { row: 4, col: 4 }];
const result5 = benchmark(
    'findMatches (local)',
    () => BoardLogic.findMatches(grid8x8, 8, positions),
    1000
);
console.log(`  ✓ Target: < 2ms, Actual: ${result5.avg.toFixed(4)}ms\n`);

// Benchmark 6: applyGravity (8x8)
console.log('6. applyGravity (8x8 grid with 50% nulls)');
const sparseGrid = createRandomGrid(8, 6);
// Set 50% of cells to null
for (let row = 0; row < 8; row += 2) {
    for (let col = 0; col < 8; col++) {
        sparseGrid[row][col] = null;
    }
}
const result6 = benchmark(
    'applyGravity',
    () => BoardLogic.applyGravity(sparseGrid, 8),
    1000
);
console.log(`  ✓ Target: < 5ms, Actual: ${result6.avg.toFixed(4)}ms\n`);

// Benchmark 7: wouldCreateMatch (8x8)
console.log('7. wouldCreateMatch (8x8 grid)');
const result7 = benchmark(
    'wouldCreateMatch',
    () => BoardLogic.wouldCreateMatch(grid8x8, 8, 3, 3, 3, 4),
    1000
);
console.log(`  ✓ Target: < 1ms, Actual: ${result7.avg.toFixed(4)}ms\n`);

// Benchmark 8: generateBoard (8x8)
console.log('8. generateBoard (8x8, no initial matches)');
const result8 = benchmark(
    'generateBoard',
    () => BoardLogic.generateBoard(8, 6),
    100
);
console.log(`  ✓ Target: < 10ms, Actual: ${result8.avg.toFixed(4)}ms\n`);

// Summary
console.log('=== Performance Summary ===\n');
console.log('All benchmarks completed successfully!');
console.log();

const results = [
    { name: 'hasAvailableMoves (8x8)', avg: result1.avg, target: 5 },
    { name: 'hasAvailableMoves (10x10)', avg: result2.avg, target: 10 },
    { name: 'hasAvailableMoves (12x12)', avg: result3.avg, target: 20 },
    { name: 'findMatches (full)', avg: result4.avg, target: 5 },
    { name: 'findMatches (local)', avg: result5.avg, target: 2 },
    { name: 'applyGravity', avg: result6.avg, target: 5 },
    { name: 'wouldCreateMatch', avg: result7.avg, target: 1 },
    { name: 'generateBoard', avg: result8.avg, target: 10 }
];

results.forEach(r => {
    const status = r.avg < r.target ? '✓ PASS' : '⚠ SLOW';
    const ratio = ((r.avg / r.target) * 100).toFixed(0);
    console.log(`${status} ${r.name}: ${r.avg.toFixed(4)}ms (${ratio}% of target)`);
});

// Check if any tests failed
const failures = results.filter(r => r.avg >= r.target);
if (failures.length > 0) {
    console.log(`\n⚠ Warning: ${failures.length} benchmark(s) exceeded target\n`);
    process.exit(1);
} else {
    console.log('\n✓ All performance targets met!\n');
    process.exit(0);
}
