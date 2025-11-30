/**
 * Unit tests for game mechanisms
 */

// Mock window and browser APIs for Node.js environment
global.window = {
  gameRenderer: {
    createEnergyTrail: () => {}
  },
  gameInstance: null
};

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.Date = Date;

import { Button } from '../src/entities/button.js';
import { Door } from '../src/entities/door.js';
import { Relay } from '../src/entities/relay.js';

/**
 * Simulate frame-based time passing by calling update() on all mechanisms
 * @param {number} ms - Milliseconds to simulate
 * @param {Array} mechanisms - Array of mechanisms to update
 */
async function simulateTime(ms, mechanisms) {
  const frameTime = 16; // 60fps = ~16ms per frame
  const frames = Math.ceil(ms / frameTime);

  for (let i = 0; i < frames; i++) {
    mechanisms.forEach(m => {
      if (m.update) m.update(frameTime);
    });
    await new Promise(resolve => setTimeout(resolve, 0)); // Allow async operations
  }
}

// Test Level 5 logic
async function testLevel5() {
  console.log('Testing Level 5: Cross Circuit');

  // Create mechanisms (matching level 5)
  const buttonA = new Button(100, 100, 'A');
  const buttonB = new Button(100, 200, 'B');
  const relayR1 = new Relay(200, 100, 'R1');
  const relayR2 = new Relay(200, 200, 'R2');
  const door1 = new Door(300, 100);
  const door2 = new Door(300, 200);

  door1.setRequiredSignals(1);
  door2.setRequiredSignals(1);

  // Setup connections (matching level 5)
  buttonA.connect(relayR1, '#00ffff');
  buttonB.connect(relayR2, '#ff00ff');
  relayR1.connect(door1, '#ffaa00');
  relayR2.connect(door2, '#00ff88');

  console.log('Initial state:');
  console.log('  ButtonA active:', buttonA.active);
  console.log('  ButtonB active:', buttonB.active);
  console.log('  RelayR1 active:', relayR1.active);
  console.log('  RelayR2 active:', relayR2.active);
  console.log('  Door1 locked:', door1.locked);
  console.log('  Door2 locked:', door2.locked);

  // Click button A
  console.log('\nClicking Button A...');
  buttonA.toggle();

  console.log('After button A toggle:');
  console.log('  ButtonA active:', buttonA.active);

  // Simulate time for signal propagation (relay 200ms delay)
  const allMechanisms = [buttonA, buttonB, relayR1, relayR2, door1, door2];
  await simulateTime(250, allMechanisms);

  console.log('After 250ms:');
  console.log('  RelayR1 active:', relayR1.active);
  console.log('  RelayR1 connections:', relayR1.connections.length);

  // Simulate more time for door unlock check delay (100ms)
  await simulateTime(150, allMechanisms);

  console.log('After another 150ms:');
  console.log('  Door1 locked:', door1.locked);
  console.log('  Door1 receivedSignals size:', door1.receivedSignals.size);
  console.log('  Door1 receivedSignals:', Array.from(door1.receivedSignals).map(m => ({ type: m.type, active: m.active })));

  // Click button B
  console.log('\nClicking Button B...');
  buttonB.toggle();

  console.log('After button B toggle:');
  console.log('  ButtonB active:', buttonB.active);

  // Simulate time for signal propagation (relay 200ms delay)
  await simulateTime(250, allMechanisms);

  console.log('After 250ms:');
  console.log('  RelayR2 active:', relayR2.active);

  // Simulate more time for door unlock check delay (100ms)
  await simulateTime(150, allMechanisms);

  console.log('After another 300ms:');
  console.log('  Door2 locked:', door2.locked);
  console.log('  Door2 receivedSignals size:', door2.receivedSignals.size);
  console.log('  Door2 receivedSignals:', Array.from(door2.receivedSignals).map(m => ({ type: m.type, active: m.active })));

  // Check final state
  console.log('\nFinal state:');
  console.log('  Door1 locked:', door1.locked, '(should be false)');
  console.log('  Door2 locked:', door2.locked, '(should be false)');

  if (!door1.locked && !door2.locked) {
    console.log('✅ TEST PASSED: Both doors unlocked');
  } else {
    console.log('❌ TEST FAILED: Expected both doors unlocked');
    console.log('   Door1:', door1.locked ? 'LOCKED' : 'unlocked');
    console.log('   Door2:', door2.locked ? 'LOCKED' : 'unlocked');
  }
}

// Test Level 11 logic
async function testLevel11() {
  console.log('\n\nTesting Level 11: Symmetry');

  // Create mechanisms (matching level 11)
  const buttonA = new Button(100, 100, 'A');
  const buttonB = new Button(200, 100, 'B');
  const buttonC = new Button(100, 200, 'C');
  const buttonD = new Button(200, 200, 'D');
  const door = new Door(150, 150);

  door.setRequiredSignals(4);

  // Setup connections (all buttons to door)
  buttonA.connect(door, '#00ffff');
  buttonB.connect(door, '#ff00ff');
  buttonC.connect(door, '#ffaa00');
  buttonD.connect(door, '#00ff88');

  console.log('Initial state:');
  console.log('  All buttons active:', buttonA.active, buttonB.active, buttonC.active, buttonD.active);
  console.log('  Door locked:', door.locked);
  console.log('  Door requires:', door.requiredSignals, 'signals');

  const allMechanisms = [buttonA, buttonB, buttonC, buttonD, door];

  // Click all 4 buttons
  console.log('\nClicking button A...');
  buttonA.toggle();
  await simulateTime(150, allMechanisms);
  console.log('  Door signals:', door.receivedSignals.size);

  console.log('Clicking button B...');
  buttonB.toggle();
  await simulateTime(150, allMechanisms);
  console.log('  Door signals:', door.receivedSignals.size);

  console.log('Clicking button C...');
  buttonC.toggle();
  await simulateTime(150, allMechanisms);
  console.log('  Door signals:', door.receivedSignals.size);

  console.log('Clicking button D...');
  buttonD.toggle();
  await simulateTime(150, allMechanisms);
  console.log('  Door signals:', door.receivedSignals.size);

  console.log('\nFinal state:');
  console.log('  All buttons active:', buttonA.active, buttonB.active, buttonC.active, buttonD.active);
  console.log('  Door locked:', door.locked, '(should be false)');
  console.log('  Door receivedSignals size:', door.receivedSignals.size);
  console.log('  Door receivedSignals:', Array.from(door.receivedSignals).map(m => ({ type: m.type, id: m.id, active: m.active })));

  if (!door.locked) {
    console.log('✅ TEST PASSED: Door unlocked with 4 signals');
  } else {
    console.log('❌ TEST FAILED: Door still locked');
    console.log('   Expected 4 signals, got:', door.receivedSignals.size);
  }
}

// Run tests
testLevel5()
  .then(() => testLevel11())
  .catch(console.error);
