/**
 * Level Class
 * Encapsulates a complete level with its own mechanisms and lifecycle
 */

import { Button } from '../entities/button.js';
import { Door } from '../entities/door.js';
import { Relay } from '../entities/relay.js';
import { LogicGate } from '../entities/logic-gate.js';

export class Level {
  constructor(levelData, canvas) {
    this.data = levelData;
    this.canvas = canvas;
    this.mechanisms = [];
    this.isActive = false;

    // Create mechanisms from level data
    this.createMechanisms();
  }

  createMechanisms() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Create mechanisms
    this.data.mechanisms.forEach((mechData, index) => {
      const x = mechData.x * w;
      const y = mechData.y * h;

      let mechanism;
      if (mechData.type === 'button') {
        mechanism = new Button(x, y, mechData.id || index);
      } else if (mechData.type === 'door') {
        mechanism = new Door(x, y);
        const requiredSignals = mechData.requiredSignals || 1;
        mechanism.setRequiredSignals(requiredSignals);
      } else if (mechData.type === 'relay') {
        mechanism = new Relay(x, y, mechData.id || index);
      } else if (mechData.type === 'logic-gate') {
        mechanism = new LogicGate(x, y, mechData.gateType, mechData.id || index);
      }

      if (mechanism) {
        this.mechanisms.push(mechanism);
      }
    });

    // Create connections
    this.data.connections.forEach(conn => {
      const fromMech = this.mechanisms[conn.from];
      const toMech = this.mechanisms[conn.to];

      if (fromMech && toMech) {
        fromMech.connect(toMech, conn.color || '#00ffff');

        // Initialize logic gates with their input sources
        if (toMech.type === 'logic-gate' && toMech.receivedSignals) {
          toMech.receivedSignals.add(fromMech);
        }
      }
    });

    // After all connections are created, initialize logic gate states
    this.mechanisms.forEach(mech => {
      if (mech.type === 'logic-gate' && mech.evaluateLogic) {
        mech.evaluateLogic();
      }
    });
  }

  /**
   * Activate this level (allow player interaction)
   */
  activate() {
    this.isActive = true;
  }

  /**
   * Deactivate this level (prevent interaction)
   */
  deactivate() {
    this.isActive = false;
  }

  /**
   * Check if all win conditions are met
   */
  checkWinCondition() {
    if (!this.isActive) return false;

    const doors = this.mechanisms.filter(m => m.type === 'door');
    return doors.length > 0 && doors.every(d => !d.locked);
  }

  /**
   * Handle click on canvas
   */
  handleClick(x, y) {
    if (!this.isActive) return null;

    // Find clicked button
    for (const mechanism of this.mechanisms) {
      if (mechanism.type === 'button' && mechanism.containsPoint(x, y)) {
        return mechanism;
      }
    }
    return null;
  }

  /**
   * Update all mechanisms
   */
  update(deltaTime, timestamp = 0) {
    if (!this.isActive) return;

    // Use for loop for better performance
    for (let i = 0, len = this.mechanisms.length; i < len; i++) {
      this.mechanisms[i].update(deltaTime, timestamp);
    }
  }

  /**
   * Render all mechanisms
   */
  render(ctx, timestamp = 0) {
    const len = this.mechanisms.length;

    // Render connections first
    for (let i = 0; i < len; i++) {
      const m = this.mechanisms[i];
      if (m.renderConnections) {
        m.renderConnections(ctx, timestamp);
      }
    }

    // Render mechanisms on top
    for (let i = 0; i < len; i++) {
      this.mechanisms[i].render(ctx, timestamp);
    }
  }

  /**
   * Destroy this level (cleanup)
   */
  destroy() {
    this.isActive = false;

    // Clear all connections
    this.mechanisms.forEach(m => {
      m.connections = [];
      m.active = false;
      if (m.receivedSignals) {
        m.receivedSignals.clear();
      }
    });

    this.mechanisms = [];
  }
}

export default Level;
