/**
 * Connection Builder
 * Handles complex connection generation logic between mechanisms
 */

export class ConnectionBuilder {
  constructor() {
    this.colors = [
      '#00ffff', '#ff00ff', '#ffff00', '#ff6666',
      '#66ccff', '#cc66ff', '#ffaa00', '#00ff88'
    ];
  }

  /**
   * Generate connections between mechanisms
   * @param {Array} mechanisms - All mechanisms in the level
   * @param {Object} config - Difficulty configuration
   * @returns {Array} Array of connection objects
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
      return this.connectButtonsDirectlyToDoor(buttons, doorIndex, door, connections, mechanisms);
    }

    // Connect buttons to gates/relays
    if (gates.length > 0) {
      const activeGates = this.connectButtonsToGates(
        buttons, gates, config, connections, mechanisms
      );

      this.connectGatesToDoor(
        activeGates, relays, door, doorIndex, config, connections, mechanisms
      );
    } else if (relays.length > 0) {
      this.connectButtonsViaRelays(
        buttons, relays, door, doorIndex, connections, mechanisms
      );
    }

    return connections;
  }

  /**
   * Connect buttons directly to door (no gates/relays)
   */
  connectButtonsDirectlyToDoor(buttons, doorIndex, door, connections, mechanisms) {
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

  /**
   * Connect buttons to gates based on gate types and mode
   */
  connectButtonsToGates(buttons, gates, config, connections, mechanisms) {
    const activeGates = [];

    if (buttons.length < 2) return activeGates;

    if (gates.length === 1) {
      // Single gate: connect all buttons
      this.connectAllButtonsToGate(buttons, gates[0], connections, mechanisms);
      activeGates.push(gates[0]);
    } else if (config.multiConnect && gates.length > 1) {
      // Multi-connect mode: smart button distribution
      this.handleMultiConnectMode(buttons, gates, activeGates, connections, mechanisms);
    } else {
      // Single-connect mode: can have gate chaining
      this.handleSingleConnectMode(buttons, gates, activeGates, connections, mechanisms);
    }

    return activeGates;
  }

  /**
   * Connect all buttons to a single gate
   */
  connectAllButtonsToGate(buttons, gate, connections, mechanisms) {
    buttons.forEach(button => {
      connections.push({
        from: mechanisms.indexOf(button),
        to: mechanisms.indexOf(gate),
        color: this.randomColor()
      });
    });
  }

  /**
   * Handle multi-connect mode (complex logic compatibility)
   */
  handleMultiConnectMode(buttons, gates, activeGates, connections, mechanisms) {
    const notGates = gates.filter(g => g.gateType === 'NOT');
    const otherGates = gates.filter(g => g.gateType !== 'NOT');

    // Track buttons used by NOT gates
    const notGateButtons = new Set();

    // Calculate how many buttons each NOT gate gets
    const buttonsPerNOTGate = Math.floor(buttons.length / Math.max(1, notGates.length + otherGates.length));
    const minButtonsPerNOT = Math.max(2, buttonsPerNOTGate);

    // Assign buttons to NOT gates first (exclusive, no sharing)
    let buttonIndex = 0;
    for (const gate of notGates) {
      const buttonCount = Math.min(minButtonsPerNOT, buttons.length - buttonIndex);
      if (buttonCount >= 2) {
        // Each NOT gate gets at least 2 buttons
        for (let i = 0; i < buttonCount; i++) {
          connections.push({
            from: mechanisms.indexOf(buttons[buttonIndex]),
            to: mechanisms.indexOf(gate),
            color: this.randomColor()
          });
          notGateButtons.add(buttonIndex);
          buttonIndex++;
        }
        activeGates.push(gate);
      }
    }

    // Handle OR and AND gates
    this.connectORAndANDGates(
      buttons, otherGates, notGateButtons, activeGates, connections, mechanisms
    );
  }

  /**
   * Connect OR and AND gates (logic compatibility strategy)
   */
  connectORAndANDGates(buttons, otherGates, notGateButtons, activeGates, connections, mechanisms) {
    const pureButtons = buttons.filter((_, idx) => !notGateButtons.has(idx));
    const notButtons = buttons.filter((_, idx) => notGateButtons.has(idx));

    const orGates = otherGates.filter(g => g.gateType === 'OR');
    const andGates = otherGates.filter(g => g.gateType === 'AND');

    // OR gates: Use ALL buttons (NOT + pure) to avoid orphaned buttons
    if (orGates.length > 0 && pureButtons.length >= 1 && notButtons.length >= 1) {
      for (let i = 0; i < orGates.length; i++) {
        const gate = orGates[i];

        // Connect to NOT button
        connections.push({
          from: mechanisms.indexOf(notButtons[i % notButtons.length]),
          to: mechanisms.indexOf(gate),
          color: this.randomColor()
        });

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
    } else if (orGates.length > 0 && pureButtons.length >= 2) {
      // No NOT buttons, use sliding window
      this.connectGatesWithSlidingWindow(
        orGates, pureButtons, activeGates, connections, mechanisms
      );
    }

    // AND gates: Use ALL pure buttons
    if (andGates.length > 0 && pureButtons.length >= 2) {
      for (const gate of andGates) {
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

  /**
   * Connect gates using sliding window strategy
   */
  connectGatesWithSlidingWindow(gates, buttons, activeGates, connections, mechanisms) {
    const overlap_step = buttons.length > 2 ?
      (buttons.length - 2) / Math.max(1, gates.length - 1) : 0;

    for (let i = 0; i < gates.length; i++) {
      const startIdx = Math.min(
        Math.floor(i * overlap_step),
        buttons.length - 2
      );
      const gate = gates[i];

      connections.push({
        from: mechanisms.indexOf(buttons[startIdx]),
        to: mechanisms.indexOf(gate),
        color: this.randomColor()
      });
      connections.push({
        from: mechanisms.indexOf(buttons[startIdx + 1]),
        to: mechanisms.indexOf(gate),
        color: this.randomColor()
      });

      activeGates.push(gate);
    }
  }

  /**
   * Handle single-connect mode (allows gate chaining)
   */
  handleSingleConnectMode(buttons, gates, activeGates, connections, mechanisms) {
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

      // Gate chaining
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

  /**
   * Connect gates to door (possibly through relays)
   */
  connectGatesToDoor(activeGates, relays, door, doorIndex, config, connections, mechanisms) {
    if (config.multiConnect && activeGates.length > 1) {
      const targetSignals = Math.max(
        Math.min(activeGates.length, config.minSignals || activeGates.length),
        2
      );

      if (relays.length > 0 && relays.length >= targetSignals) {
        // Through relays
        for (let i = 0; i < targetSignals; i++) {
          connections.push({
            from: mechanisms.indexOf(activeGates[i]),
            to: mechanisms.indexOf(relays[i]),
            color: this.randomColor()
          });
          connections.push({
            from: mechanisms.indexOf(relays[i]),
            to: doorIndex,
            color: this.randomColor()
          });
        }
      } else {
        // Direct connection
        for (let i = 0; i < targetSignals; i++) {
          connections.push({
            from: mechanisms.indexOf(activeGates[i]),
            to: doorIndex,
            color: this.randomColor()
          });
        }
      }

      door.requiredSignals = targetSignals;
    } else {
      // Single connect mode
      const mainGate = activeGates[activeGates.length - 1];

      if (relays.length > 0) {
        connections.push({
          from: mechanisms.indexOf(mainGate),
          to: mechanisms.indexOf(relays[0]),
          color: this.randomColor()
        });
        connections.push({
          from: mechanisms.indexOf(relays[0]),
          to: doorIndex,
          color: this.randomColor()
        });
      } else {
        connections.push({
          from: mechanisms.indexOf(mainGate),
          to: doorIndex,
          color: this.randomColor()
        });
      }

      door.requiredSignals = 1;
    }
  }

  /**
   * Connect buttons via relays (no gates)
   */
  connectButtonsViaRelays(buttons, relays, door, doorIndex, connections, mechanisms) {
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

  /**
   * Get a random color from the palette
   */
  randomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }
}
