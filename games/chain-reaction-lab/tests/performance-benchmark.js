/**
 * Performance Benchmark Tests
 * Measures the performance improvements from optimizations
 */

// Mock browser APIs
global.window = {
  ChainReactionLab: {
    settings: { get: () => true },
    renderer: { createEnergyTrail: () => {} }
  }
};

import { Mechanism } from '../src/entities/mechanism.js';

console.log('🔬 Performance Benchmark\n');

// ==================== Benchmark 1: Bezier Calculation ====================
console.log('=== Benchmark 1: Bezier Arrow Position Calculation ===');

class TestMechanism extends Mechanism {
  constructor(x, y) {
    super(x, y, 'test');
  }
}

const mech1 = new TestMechanism(100, 100);
const mech2 = new TestMechanism(500, 300);

// Create connection (triggers pre-calculation)
mech1.connect(mech2, '#00ffff');

const conn = mech1.connections[0];

// Benchmark: Old method (expanded form)
function oldBezierCalc(t, x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
  const mt = 1 - t;
  const arrowX = mt*mt*mt*x1 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x2;
  const arrowY = mt*mt*mt*y1 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y2;
  return { arrowX, arrowY };
}

// Benchmark: New method (coefficients)
function newBezierCalc(t, ax, bx, cx_coef, dx_coef, ay, by, cy_coef, dy_coef) {
  const t2 = t * t;
  const t3 = t2 * t;
  const arrowX = ax*t3 + bx*t2 + cx_coef*t + dx_coef;
  const arrowY = ay*t3 + by*t2 + cy_coef*t + dy_coef;
  return { arrowX, arrowY };
}

const iterations = 1000000;
const t = 0.5;

// Warm up
for (let i = 0; i < 1000; i++) {
  oldBezierCalc(t, mech1.x, mech1.y, conn.cx1, conn.cy1, conn.cx2, conn.cy2, mech2.x, mech2.y);
  newBezierCalc(t, conn.ax, conn.bx, conn.cx_coef, conn.dx_coef, conn.ay, conn.by, conn.cy_coef, conn.dy_coef);
}

// Benchmark old method
console.log(`Running ${iterations} iterations...`);
const oldStart = performance.now();
for (let i = 0; i < iterations; i++) {
  oldBezierCalc(t, mech1.x, mech1.y, conn.cx1, conn.cy1, conn.cx2, conn.cy2, mech2.x, mech2.y);
}
const oldTime = performance.now() - oldStart;

// Benchmark new method
const newStart = performance.now();
for (let i = 0; i < iterations; i++) {
  newBezierCalc(t, conn.ax, conn.bx, conn.cx_coef, conn.dx_coef, conn.ay, conn.by, conn.cy_coef, conn.dy_coef);
}
const newTime = performance.now() - newStart;

const improvement = ((oldTime - newTime) / oldTime * 100).toFixed(1);
const speedup = (oldTime / newTime).toFixed(2);

console.log(`  Old method: ${oldTime.toFixed(2)}ms`);
console.log(`  New method: ${newTime.toFixed(2)}ms`);
console.log(`  Improvement: ${improvement}% faster (${speedup}x speedup)`);

// Calculate per-frame impact (60 FPS, 20 active connections)
const connectionsPerFrame = 20;
const framesPerSecond = 60;
const oldPerFrame = (oldTime / iterations) * connectionsPerFrame * 1000; // Convert to microseconds for better precision
const newPerFrame = (newTime / iterations) * connectionsPerFrame * 1000;
const savedPerFrame = oldPerFrame - newPerFrame;

console.log(`\n  Per-frame impact (20 active connections at 60 FPS):`);
console.log(`    Old: ${oldPerFrame.toFixed(2)}μs/frame`);
console.log(`    New: ${newPerFrame.toFixed(2)}μs/frame`);
console.log(`    Saved: ${savedPerFrame.toFixed(2)}μs/frame (${(savedPerFrame/1000).toFixed(3)}ms/frame)`);
console.log(`    FPS gain: ~${((savedPerFrame / 1000 / 16.67) * 60).toFixed(1)} FPS`);

// Verify correctness
const oldResult = oldBezierCalc(0.5, mech1.x, mech1.y, conn.cx1, conn.cy1, conn.cx2, conn.cy2, mech2.x, mech2.y);
const newResult = newBezierCalc(0.5, conn.ax, conn.bx, conn.cx_coef, conn.dx_coef, conn.ay, conn.by, conn.cy_coef, conn.dy_coef);
const xDiff = Math.abs(oldResult.arrowX - newResult.arrowX);
const yDiff = Math.abs(oldResult.arrowY - newResult.arrowY);

console.log(`\n  ✅ Correctness verification:`);
console.log(`    X difference: ${xDiff.toFixed(6)} (should be ~0)`);
console.log(`    Y difference: ${yDiff.toFixed(6)} (should be ~0)`);

if (xDiff < 0.001 && yDiff < 0.001) {
  console.log(`    ✅ PASS: Results match`);
} else {
  console.log(`    ❌ FAIL: Results differ`);
}

// ==================== Benchmark 2: Loop Overhead ====================
console.log('\n=== Benchmark 2: forEach vs for Loop ===');

const testArray = new Array(20).fill(0).map((_, i) => ({ value: i }));
const loopIterations = 10000000;

// forEach benchmark
const forEachStart = performance.now();
for (let j = 0; j < loopIterations; j++) {
  testArray.forEach(item => {
    const x = item.value * 2;
  });
}
const forEachTime = performance.now() - forEachStart;

// for loop benchmark
const forStart = performance.now();
for (let j = 0; j < loopIterations; j++) {
  for (let i = 0, len = testArray.length; i < len; i++) {
    const x = testArray[i].value * 2;
  }
}
const forTime = performance.now() - forStart;

const loopImprovement = ((forEachTime - forTime) / forEachTime * 100).toFixed(1);
const loopSpeedup = (forEachTime / forTime).toFixed(2);

console.log(`  forEach: ${forEachTime.toFixed(2)}ms`);
console.log(`  for loop: ${forTime.toFixed(2)}ms`);
console.log(`  Improvement: ${loopImprovement}% faster (${loopSpeedup}x speedup)`);

const perFrameForEach = (forEachTime / loopIterations) * 2 * 1000; // 2 loops per frame, convert to μs
const perFrameFor = (forTime / loopIterations) * 2 * 1000;
const loopSavedPerFrame = perFrameForEach - perFrameFor;

console.log(`\n  Per-frame impact (2 render loops at 60 FPS):`);
console.log(`    forEach: ${perFrameForEach.toFixed(2)}μs/frame`);
console.log(`    for loop: ${perFrameFor.toFixed(2)}μs/frame`);
console.log(`    Saved: ${loopSavedPerFrame.toFixed(2)}μs/frame (${(loopSavedPerFrame/1000).toFixed(6)}ms/frame)`);
console.log(`    FPS gain: ~${((loopSavedPerFrame / 1000 / 16.67) * 60).toFixed(2)} FPS`);

// ==================== Total Impact ====================
console.log('\n=== Total Optimization Impact ===');
const totalSavedPerFrame = savedPerFrame + loopSavedPerFrame; // in μs
const totalFPSGain = (totalSavedPerFrame / 1000 / 16.67) * 60;

console.log(`  Total saved per frame: ${totalSavedPerFrame.toFixed(2)}μs (${(totalSavedPerFrame/1000).toFixed(3)}ms)`);
console.log(`  Estimated FPS gain: +${totalFPSGain.toFixed(1)} FPS`);
console.log(`  From 60 FPS baseline: ~${(60 + totalFPSGain).toFixed(0)} FPS`);

console.log('\n✅ Benchmark complete!\n');
