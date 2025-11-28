/**
 * Level Generator
 * Procedurally generates valid puzzle levels based on difficulty
 */

export class LevelGenerator {
  constructor() {
    this.gateTypes = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR'];
    this.colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff6666', '#66ccff', '#cc66ff', '#ffaa00', '#00ff88'];
  }

  /**
   * Generate a random level
   * @param {number} difficulty - 1 to 5
   * @returns {Object} Level data
   */
  generateLevel(difficulty) {
    const config = this.getDifficultyConfig(difficulty);
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      try {
        const mechanisms = this.generateMechanisms(config);
        const connections = this.generateConnections(mechanisms, config);

        // Verify solvability
        if (this.isSolvable(mechanisms, connections, config)) {
          return {
            mechanisms,
            connections,
            par: this.calculatePar(mechanisms, connections),
            title: this.generateTitle(config),
            description: this.generateDescription(config)
          };
        }
      } catch (e) {
        // Generation failed, retry
      }
      attempts++;
    }

    // Fallback to simple level if generation fails
    return this.generateSimpleLevel();
  }

  /**
   * Get configuration based on difficulty
   */
  getDifficultyConfig(difficulty) {
    const configs = {
      1: { buttons: 1, gates: 0, relays: 0, usedGates: [], multiConnect: false },
      2: { buttons: 2, gates: 0, relays: 1, usedGates: [], multiConnect: false },
      3: { buttons: 3, gates: 1, relays: 1, usedGates: ['AND', 'OR'], multiConnect: false },
      4: { buttons: 3, gates: 2, relays: 1, usedGates: ['AND', 'OR'], multiConnect: true },
      5: { buttons: 4, gates: 2, relays: 2, usedGates: ['AND', 'OR', 'NOT'], multiConnect: true }
    };
    return configs[difficulty] || configs[3];
  }

  /**
   * Generate mechanisms for the level
   */
  generateMechanisms(config) {
    const mechanisms = [];
    const usedPositions = new Set();

    // Helper to get unique position
    const getUniquePosition = (minX, maxX, minY = 0.2, maxY = 0.8) => {
      let attempts = 0;
      while (attempts < 50) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        const key = `${x.toFixed(1)},${y.toFixed(1)}`;

        if (!usedPositions.has(key)) {
          usedPositions.add(key);
          return { x, y };
        }
        attempts++;
      }
      return { x: minX, y: 0.5 };
    };

    // Generate buttons (left side)
    for (let i = 0; i < config.buttons; i++) {
      const pos = getUniquePosition(0.15, 0.25);
      mechanisms.push({
        type: 'button',
        id: String.fromCharCode(65 + i), // A, B, C...
        x: pos.x,
        y: pos.y
      });
    }

    // Generate gates (middle)
    if (config.gates > 0) {
      const availableGates = config.usedGates.length > 0
        ? config.usedGates
        : ['AND', 'OR'];

      for (let i = 0; i < config.gates; i++) {
        const pos = getUniquePosition(0.4, 0.6);
        const gateType = availableGates[Math.floor(Math.random() * availableGates.length)];
        mechanisms.push({
          type: 'logic-gate',
          gateType,
          id: `G${i}`,
          x: pos.x,
          y: pos.y
        });
      }
    }

    // Generate relays (middle-right)
    for (let i = 0; i < config.relays; i++) {
      const pos = getUniquePosition(0.5, 0.65);
      mechanisms.push({
        type: 'relay',
        id: `R${i}`,
        x: pos.x,
        y: pos.y
      });
    }

    // Generate door (right side)
    const doorPos = getUniquePosition(0.75, 0.85);
    mechanisms.push({
      type: 'door',
      x: doorPos.x,
      y: doorPos.y,
      requiredSignals: 1
    });

    return mechanisms;
  }

  /**
   * Generate connections between mechanisms
   */
  generateConnections(mechanisms, config) {
    const connections = [];
    const buttons = mechanisms.filter(m => m.type === 'button');
    const gates = mechanisms.filter(m => m.type === 'logic-gate');
    const relays = mechanisms.filter(m => m.type === 'relay');
    const door = mechanisms.find(m => m.type === 'door');

    if (!door) throw new Error('No door found');

    const doorIndex = mechanisms.indexOf(door);

    // Simple case: no gates or relays
    if (gates.length === 0 && relays.length === 0) {
      buttons.forEach(button => {
        connections.push({
          from: mechanisms.indexOf(button),
          to: doorIndex,
          color: this.randomColor()
        });
      });
      door.requiredSignals = buttons.length;
      return connections;
    }

    // Connect buttons to gates/relays
    if (gates.length > 0) {
      // Ensure each gate gets at least 2 inputs
      const activeGates = [];

      if (buttons.length >= 2) {
        if (gates.length === 1) {
          // Single gate: connect all buttons to it
          buttons.forEach(button => {
            connections.push({
              from: mechanisms.indexOf(button),
              to: mechanisms.indexOf(gates[0]),
              color: this.randomColor()
            });
          });
          activeGates.push(gates[0]);
        } else if (gates.length >= 2) {
          // Multiple gates: distribute buttons
          const half = Math.floor(buttons.length / 2);

          // Connect first half of buttons to gate 0
          for (let i = 0; i < Math.max(half, 2); i++) {
            connections.push({
              from: mechanisms.indexOf(buttons[i]),
              to: mechanisms.indexOf(gates[0]),
              color: this.randomColor()
            });
          }
          activeGates.push(gates[0]);

          // Connect second half to gate 1
          for (let i = half; i < buttons.length; i++) {
            connections.push({
              from: mechanisms.indexOf(buttons[i]),
              to: mechanisms.indexOf(gates[1]),
              color: this.randomColor()
            });
          }

          // If gate 1 only has 1 input, also connect gate 0 output to it
          if (buttons.length - half < 2) {
            connections.push({
              from: mechanisms.indexOf(gates[0]),
              to: mechanisms.indexOf(gates[1]),
              color: this.randomColor()
            });
          }

          activeGates.push(gates[1]);
        }
      }

      // Multi-connect mode: multiple gates to door (harder)
      if (config.multiConnect && activeGates.length > 1) {
        // Connect gates to door (possibly through relays)
        if (relays.length > 0) {
          // Use relays as intermediaries
          activeGates.forEach((gate, i) => {
            const relay = relays[i % relays.length];
            connections.push({
              from: mechanisms.indexOf(gate),
              to: mechanisms.indexOf(relay),
              color: this.randomColor()
            });
          });

          // Connect relays to door
          relays.forEach(relay => {
            connections.push({
              from: mechanisms.indexOf(relay),
              to: doorIndex,
              color: this.randomColor()
            });
          });

          door.requiredSignals = Math.min(relays.length, activeGates.length);
        } else {
          // No relays, connect gates directly to door
          activeGates.forEach(gate => {
            connections.push({
              from: mechanisms.indexOf(gate),
              to: doorIndex,
              color: this.randomColor()
            });
          });
          door.requiredSignals = activeGates.length;
        }
      } else {
        // Single connect mode: main gate to door
        const mainGate = activeGates[activeGates.length - 1];
        const mainGateIndex = mechanisms.indexOf(mainGate);

        // Connect main gate to door (possibly through relay)
        if (relays.length > 0) {
          const relay = relays[0];
          connections.push({
            from: mainGateIndex,
            to: mechanisms.indexOf(relay),
            color: this.randomColor()
          });
          connections.push({
            from: mechanisms.indexOf(relay),
            to: doorIndex,
            color: this.randomColor()
          });
        } else {
          connections.push({
            from: mainGateIndex,
            to: doorIndex,
            color: this.randomColor()
          });
        }
        door.requiredSignals = 1;
      }
    } else if (relays.length > 0) {
      // Only relays, no gates
      buttons.forEach((button, i) => {
        const relay = relays[i % relays.length];
        connections.push({
          from: mechanisms.indexOf(button),
          to: mechanisms.indexOf(relay),
          color: this.randomColor()
        });
      });

      relays.forEach(relay => {
        connections.push({
          from: mechanisms.indexOf(relay),
          to: doorIndex,
          color: this.randomColor()
        });
      });

      door.requiredSignals = Math.min(buttons.length, relays.length);
    }

    return connections;
  }

  /**
   * Check if level is solvable
   */
  isSolvable(mechanisms, connections, config) {
    // Basic validation
    const buttons = mechanisms.filter(m => m.type === 'button');
    const door = mechanisms.find(m => m.type === 'door');

    if (buttons.length === 0 || !door) return false;

    // Check connectivity: door must be reachable from buttons
    const reachable = new Set();
    const buttonIndices = buttons.map(b => mechanisms.indexOf(b));
    buttonIndices.forEach(i => reachable.add(i));

    // BFS to find all reachable mechanisms
    let changed = true;
    while (changed) {
      changed = false;
      connections.forEach(conn => {
        if (reachable.has(conn.from) && !reachable.has(conn.to)) {
          reachable.add(conn.to);
          changed = true;
        }
      });
    }

    return reachable.has(mechanisms.indexOf(door));
  }

  /**
   * Calculate par (optimal moves)
   */
  calculatePar(mechanisms, connections) {
    const buttons = mechanisms.filter(m => m.type === 'button');
    const gates = mechanisms.filter(m => m.type === 'logic-gate');

    // Simple heuristic
    if (gates.length === 0) return buttons.length;

    const andGates = gates.filter(g => g.gateType === 'AND' || g.gateType === 'NAND');
    const notGates = gates.filter(g => g.gateType === 'NOT' || g.gateType === 'NOR');

    if (notGates.length > 0) return 0; // NOT gates want no input
    if (andGates.length > 0) return buttons.length; // AND wants all

    return 1; // OR/XOR can solve with 1
  }

  /**
   * Generate title based on config
   */
  generateTitle(config) {
    if (config.gates === 0 && config.relays === 0) return 'Simple Connection';
    if (config.gates === 0) return 'Relay Challenge';
    if (config.gates === 1) return 'Logic Gate Intro';
    if (config.gates === 2) return 'Gate Combination';
    return 'Master Puzzle';
  }

  /**
   * Generate description
   */
  generateDescription(config) {
    const gates = config.usedGates;
    if (gates.length === 0) return 'Connect to the door';
    if (gates.length === 1) return `Use ${gates[0]} gate`;
    return `Combine ${gates.join(', ')} gates`;
  }

  /**
   * Random color from palette
   */
  randomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  /**
   * Fallback simple level
   */
  generateSimpleLevel() {
    return {
      mechanisms: [
        { type: 'button', id: 'A', x: 0.3, y: 0.5 },
        { type: 'door', x: 0.7, y: 0.5, requiredSignals: 1 }
      ],
      connections: [
        { from: 0, to: 1, color: '#00ffff' }
      ],
      par: 1,
      title: 'Simple Connection',
      description: 'Basic level'
    };
  }
}

export default LevelGenerator;
