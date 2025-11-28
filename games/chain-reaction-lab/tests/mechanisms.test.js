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

  // Wait for signal propagation (button 200ms + relay 200ms = 400ms total)
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('After 500ms:');
  console.log('  RelayR1 active:', relayR1.active);
  console.log('  RelayR1 connections:', relayR1.connections.length);

  // Wait for relay to door propagation (relay propagates with 200ms delay)
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('After another 300ms:');
  console.log('  Door1 locked:', door1.locked);
  console.log('  Door1 receivedSignals size:', door1.receivedSignals.size);
  console.log('  Door1 receivedSignals:', Array.from(door1.receivedSignals).map(m => ({ type: m.type, active: m.active })));

  // Click button B
  console.log('\nClicking Button B...');
  buttonB.toggle();

  console.log('After button B toggle:');
  console.log('  ButtonB active:', buttonB.active);

  // Wait for signal propagation (button 200ms + relay 200ms = 400ms total)
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('After 500ms:');
  console.log('  RelayR2 active:', relayR2.active);

  // Wait for relay to door propagation
  await new Promise(resolve => setTimeout(resolve, 300));

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

// Run test
testLevel5().catch(console.error);
