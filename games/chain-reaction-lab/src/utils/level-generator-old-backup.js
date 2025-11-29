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
      1: { buttons: 1, gates: 0, relays: 0, usedGates: [], multiConnect: false, minSignals: 1 },
      2: { buttons: 2, gates: 0, relays: 1, usedGates: [], multiConnect: false, minSignals: 1 },
      3: { buttons: 4, gates: 2, relays: 2, usedGates: ['AND', 'OR', 'NOT'], multiConnect: true, minSignals: 2 },
      4: { buttons: 5, gates: 3, relays: 3, usedGates: ['AND', 'OR', 'NOT'], multiConnect: true, minSignals: 3 },
      5: { buttons: 6, gates: 4, relays: 4, usedGates: ['AND', 'OR', 'NOT'], multiConnect: true, minSignals: 4 }
    };
    return configs[difficulty] || configs[3];
  }

  /**
   * Generate mechanisms for the level
   */
  generateMechanisms(config) {
    const mechanisms = [];
    const usedPositions = [];

    // Helper to get unique position with distance-based collision detection
    const getUniquePosition = (minX, maxX, minY = 0.2, maxY = 0.8, minDistance = 0.12) => {
      let attempts = 0;
      const maxAttempts = 200;

      while (attempts < maxAttempts) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);

        // Check distance to all existing positions
        let tooClose = false;
        for (const pos of usedPositions) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < minDistance) {
            tooClose = true;
            break;
          }
        }

        if (!tooClose) {
          usedPositions.push({ x, y });
          return { x, y };
        }
        attempts++;
      }

      // Fallback: try to find any valid position with reduced distance
      const reducedDistance = minDistance * 0.7;
      for (let i = 0; i < 50; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);

        let valid = true;
        for (const pos of usedPositions) {
          const dx = x - pos.x;
          const dy = y - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < reducedDistance) {
            valid = false;
            break;
          }
        }

        if (valid) {
          usedPositions.push({ x, y });
          return { x, y };
        }
      }

      // Last resort: return position anyway (should rarely happen)
      const pos = {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY)
      };
      usedPositions.push(pos);
      return pos;
    };

    // Generate buttons (left side)
    for (let i = 0; i < config.buttons; i++) {
      const pos = getUniquePosition(0.08, 0.26, 0.12, 0.88, 0.12);
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
        const pos = getUniquePosition(0.36, 0.64, 0.12, 0.88, 0.12);

        // For multiConnect mode, smart gate type selection
        let gateType;
        if (config.multiConnect && availableGates.includes('OR')) {
          // Calculate if NOT gate is feasible
          // Key insight: OR gates can share buttons with NOT gates (logically compatible)
          // So we need: NOT buttons (2 per NOT) + at least 1 pure button for OR gates
          // Conservative rule: max 1 NOT gate per level, ensure buttons >= 3
          const currentNOTCount = mechanisms.filter(m => m.type === 'logic-gate' && m.gateType === 'NOT').length;

          const gatesWithoutNOT = availableGates.filter(g => g !== 'NOT');

          // Allow NOT if:
          // 1. At least 3 buttons (2 for NOT, 1 for OR to share)
          // 2. No NOT gate exists yet (max 1 NOT per level)
          const canUseNOT = availableGates.includes('NOT') &&
            config.buttons >= 3 &&
            currentNOTCount === 0;

          const selectableGates = canUseNOT ? availableGates : gatesWithoutNOT;

          // Adjust gate type probabilities for strategic difficulty
          // NOT gate forces OFF state (prevents "press all" strategy)
          // AND gates need both inputs ON (more restrictive than OR)

          // Check if we already have a NOT gate (takes 2 exclusive buttons)
          const hasNOTGate = mechanisms.filter(m => m.type === 'logic-gate' && m.gateType === 'NOT').length > 0;
          const pureButtonsAvailable = hasNOTGate ? config.buttons - 2 : config.buttons;
          const isFirstGate = i === 0;

          // Strategic difficulty: encourage NOT gate for challenge
          // With 4+ buttons, enough space for diverse patterns
          const encourageNOTOnFirst = isFirstGate && Math.random() < 0.65;

          if (canUseNOT && (encourageNOTOnFirst || (!isFirstGate && Math.random() < 0.6))) {
            // NOT gate: 65% for first gate, 60% for subsequent (balance difficulty & variety)
            gateType = 'NOT';
          } else if (hasNOTGate && pureButtonsAvailable < 2) {
            // If NOT gate exists and only 1 pure button left, must use OR
            gateType = 'OR';
          } else {
            // For remaining gates: 30% OR, 70% AND
            // Balanced for strategic combinations
            const nonNOTGates = selectableGates.filter(g => g !== 'NOT');
            gateType = Math.random() < 0.3 ? 'OR' : nonNOTGates[Math.floor(Math.random() * nonNOTGates.length)];
          }
        } else {
          gateType = availableGates[Math.floor(Math.random() * availableGates.length)];
        }

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
      const pos = getUniquePosition(0.5, 0.7, 0.12, 0.88, 0.12);
      mechanisms.push({
        type: 'relay',
        id: `R${i}`,
        x: pos.x,
        y: pos.y
      });
    }

    // Generate door (right side)
    const doorPos = getUniquePosition(0.74, 0.92, 0.12, 0.88, 0.12);
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
        } else if (config.multiConnect && gates.length > 1) {
          // Multi-connect mode: smart button distribution
          // Special handling: NOT gates need exclusive buttons (no sharing)

          if (buttons.length >= 2) {
            const notGates = gates.filter(g => g.gateType === 'NOT');
            const otherGates = gates.filter(g => g.gateType !== 'NOT');

            // Track which buttons are used by NOT gates
            const notGateButtons = new Set();

            // Assign buttons to NOT gates first (exclusive, no sharing)
            let buttonIndex = 0;
            for (const gate of notGates) {
              // Each NOT gate gets 2 unique buttons
              if (buttonIndex + 1 < buttons.length) {
                const btn1 = buttons[buttonIndex];
                const btn2 = buttons[buttonIndex + 1];

                connections.push({
                  from: mechanisms.indexOf(btn1),
                  to: mechanisms.indexOf(gate),
                  color: this.randomColor()
                });

                connections.push({
                  from: mechanisms.indexOf(btn2),
                  to: mechanisms.indexOf(gate),
                  color: this.randomColor()
                });

                notGateButtons.add(buttonIndex);
                notGateButtons.add(buttonIndex + 1);
                buttonIndex += 2;

                activeGates.push(gate);
              }
            }

            // Assign buttons to other gates
            // Key insight: OR gates can share buttons with NOT gates (logically compatible)
            // AND gates cannot share with NOT gates (would create conflicts)
            if (otherGates.length > 0) {
              const pureButtons = buttons.filter((_, idx) => !notGateButtons.has(idx));
              const notButtons = buttons.filter((_, idx) => notGateButtons.has(idx));

              const orGates = otherGates.filter(g => g.gateType === 'OR');
              const andGates = otherGates.filter(g => g.gateType === 'AND');

              // Strategy: All OR gates use NOT+pure combo if NOT exists and OR exists
              // AND gates use pure buttons only (need >= 2 pure buttons)

              if (orGates.length > 0 && pureButtons.length >= 1 && notButtons.length >= 1) {
                // OR gates: Use ALL available buttons to avoid orphaned buttons
                // Each OR gate connects to: NOT buttons + ALL pure buttons
                for (let i = 0; i < orGates.length; i++) {
                  const gate = orGates[i];

                  // Connect to a NOT button (logic compatible)
                  const notBtn = notButtons[i % notButtons.length];
                  connections.push({
                    from: mechanisms.indexOf(notBtn),
                    to: mechanisms.indexOf(gate),
                    color: this.randomColor()
                  });

                  // Connect to ALL pure buttons (ensures no orphaned buttons)
                  for (const pureBtn of pureButtons) {
                    connections.push({
                      from: mechanisms.indexOf(pureBtn),
                      to: mechanisms.indexOf(gate),
                      color: this.randomColor()
                    });
                  }

                  activeGates.push(gate);
                }
              } else if (orGates.length > 0 && pureButtons.length >= 2) {
                // No NOT buttons available, OR gates use pure buttons (sliding window)
                const overlap_step = pureButtons.length > 2 ?
                  (pureButtons.length - 2) / Math.max(1, orGates.length - 1) : 0;

                for (let i = 0; i < orGates.length; i++) {
                  const startIdx = Math.min(
                    Math.floor(i * overlap_step),
                    pureButtons.length - 2
                  );
                  const gate = orGates[i];
                  connections.push({
                    from: mechanisms.indexOf(pureButtons[startIdx]),
                    to: mechanisms.indexOf(gate),
                    color: this.randomColor()
                  });
                  connections.push({
                    from: mechanisms.indexOf(pureButtons[startIdx + 1]),
                    to: mechanisms.indexOf(gate),
                    color: this.randomColor()
                  });
                  activeGates.push(gate);
                }
              }

              // AND gates: Use ALL pure buttons to avoid orphaned buttons
              // AND gates can share buttons with OR gates (both compatible)
              if (andGates.length > 0 && pureButtons.length >= 2) {
                for (let i = 0; i < andGates.length; i++) {
                  const gate = andGates[i];

                  // Connect to ALL pure buttons
                  for (const pureBtn of pureButtons) {
                    connections.push({
                      from: mechanisms.indexOf(pureBtn),
                      to: mechanisms.indexOf(gate),
                      color: this.randomColor()
                    });
                  }

                  activeGates.push(gate);
                }
              }
            }
          }
        } else {
          // Single-connect mode: can have gate chaining
          let buttonIndex = 0;

          for (let g = 0; g < gates.length && buttonIndex < buttons.length; g++) {
            const buttonsForThisGate = Math.min(2, buttons.length - buttonIndex);

            for (let b = 0; b < buttonsForThisGate; b++) {
              if (buttonIndex < buttons.length) {
                connections.push({
                  from: mechanisms.indexOf(buttons[buttonIndex]),
                  to: mechanisms.indexOf(gates[g]),
                  color: this.randomColor()
                });
                buttonIndex++;
              }
            }

            // Gate chaining only in single-connect mode
            if (buttonsForThisGate < 2 && g > 0) {
              connections.push({
                from: mechanisms.indexOf(gates[g - 1]),
                to: mechanisms.indexOf(gates[g]),
                color: this.randomColor()
              });
            }

            activeGates.push(gates[g]);
          }
        }
      }

      // Multi-connect mode: multiple gates to door (harder)
      if (config.multiConnect && activeGates.length > 1) {
        const targetSignals = Math.max(
          Math.min(activeGates.length, config.minSignals || activeGates.length),
          2
        );

        // Connect gates to door (possibly through relays)
        if (relays.length > 0 && relays.length >= targetSignals) {
          // Enough relays: each gate → unique relay → door
          const usedRelays = [];
          for (let i = 0; i < targetSignals; i++) {
            const gate = activeGates[i];
            const relay = relays[i];

            connections.push({
              from: mechanisms.indexOf(gate),
              to: mechanisms.indexOf(relay),
              color: this.randomColor()
            });

            connections.push({
              from: mechanisms.indexOf(relay),
              to: doorIndex,
              color: this.randomColor()
            });

            usedRelays.push(relay);
          }

          door.requiredSignals = targetSignals;
        } else {
          // Not enough relays, connect gates directly to door
          for (let i = 0; i < targetSignals; i++) {
            connections.push({
              from: mechanisms.indexOf(activeGates[i]),
              to: doorIndex,
              color: this.randomColor()
            });
          }
          door.requiredSignals = targetSignals;
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
