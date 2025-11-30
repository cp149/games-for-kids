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
   * Add a connection between two components
   * @param {Object} source - Source component
   * @param {Object} target - Target component
   * @param {Array} connections - Connections array
   * @param {Array} mechanisms - All mechanisms
   */
  addConnection(source, target, connections, mechanisms) {
    connections.push({
      from: mechanisms.indexOf(source),
      to: mechanisms.indexOf(target),
      color: this.randomColor()
    });
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
      const activeGates = config.maxLayers > 0
        ? this.buildLayeredCircuit(buttons, gates, config, connections, mechanisms)
        : this.connectButtonsToGates(buttons, gates, config, connections, mechanisms);

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
    const doorObj = mechanisms[doorIndex];
    buttons.forEach(button => {
      this.addConnection(button, doorObj, connections, mechanisms);
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
      this.addConnection(button, gate, connections, mechanisms);
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
          this.addConnection(buttons[buttonIndex], gate, connections, mechanisms);
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
        this.addConnection(notButtons[i % notButtons.length], gate, connections, mechanisms);

        // Connect to ALL pure buttons
        for (const pureBtn of pureButtons) {
          this.addConnection(pureBtn, gate, connections, mechanisms);
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
          this.addConnection(pureBtn, gate, connections, mechanisms);
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

      this.addConnection(buttons[startIdx], gate, connections, mechanisms);
      this.addConnection(buttons[startIdx + 1], gate, connections, mechanisms);

      activeGates.push(gate);
    }
  }

  /**
   * Build layered circuit with serial and parallel connections
   * @returns {Array} Final layer gates (outputs)
   */
  buildLayeredCircuit(buttons, gates, config, connections, mechanisms) {
    // Keep final layer size at 2-3 gates, use relays to multiply signals
    const minFinalLayerGates = Math.min(3, Math.max(2, Math.floor(gates.length / 3)));
    const layers = this.distributeGatesToLayers(gates, config.maxLayers, minFinalLayerGates);

    // Layer 0: Use multi-connect strategy to prevent brute-force
    if (config.multiConnect) {
      const activeGates = [];
      this.handleMultiConnectMode(buttons, layers[0], activeGates, connections, mechanisms);
      // Ensure all layer 0 gates connect to layer 1 (even if not button-connected)
    } else {
      this.connectButtonsToFirstLayer(buttons, layers[0], connections, mechanisms);
    }

    // Connect subsequent layers serially (use actual layer arrays, not activeGates)
    for (let i = 1; i < layers.length; i++) {
      this.connectToLayer(layers[i - 1], layers[i], connections, mechanisms);
    }

    // Return final layer as active gates
    return layers[layers.length - 1];
  }

  /**
   * Distribute gates across layers (pyramid: wide → narrow)
   */
  distributeGatesToLayers(gates, maxLayers, minFinalLayerGates = 2) {
    if (maxLayers === 0 || gates.length <= 2) {
      return [gates]; // Single layer
    }

    const totalGates = gates.length;
    const actualLayers = Math.min(maxLayers, Math.ceil(totalGates / 2));

    const layers = [];
    let remaining = totalGates;
    let startIdx = 0;

    for (let i = 0; i < actualLayers; i++) {
      let gatesInLayer;

      if (i === actualLayers - 1) {
        // Final layer: all remaining
        gatesInLayer = remaining;
      } else if (i === 0) {
        // First layer: leave enough for middle + final layers
        const middleLayers = actualLayers - 2;
        const reserveForOthers = minFinalLayerGates + middleLayers;
        const maxFirstLayer = Math.max(1, totalGates - reserveForOthers);
        gatesInLayer = Math.min(Math.ceil(totalGates * 0.5), maxFirstLayer);
      } else {
        // Middle layers: leave enough for final layer
        const layersLeft = actualLayers - i;
        const maxForThisLayer = remaining - minFinalLayerGates;
        gatesInLayer = Math.min(
          Math.ceil((remaining - minFinalLayerGates) / (layersLeft - 1)),
          maxForThisLayer
        );
      }

      gatesInLayer = Math.max(1, Math.min(gatesInLayer, remaining));

      if (gatesInLayer > 0) {
        layers.push(gates.slice(startIdx, startIdx + gatesInLayer));
        startIdx += gatesInLayer;
        remaining -= gatesInLayer;
      }
    }

    return layers;
  }

  /**
   * Connect ALL buttons to first layer (no orphans)
   */
  connectButtonsToFirstLayer(buttons, firstLayer, connections, mechanisms) {
    if (buttons.length === 0 || firstLayer.length === 0) return;

    // Track which buttons have been connected
    const usedButtons = new Set();

    // Step 1: Give each gate its minimum required inputs
    for (const gate of firstLayer) {
      const inputsNeeded = gate.gateType === 'NOT' ? 1 : 2;
      const available = buttons.filter((_, idx) => !usedButtons.has(idx));

      const selected = available.slice(0, Math.min(inputsNeeded, available.length));

      for (const btn of selected) {
        const btnIdx = buttons.indexOf(btn);
        usedButtons.add(btnIdx);
        this.addConnection(btn, gate, connections, mechanisms);
      }
    }

    // Step 2: Connect remaining unused buttons
    buttons.forEach((btn, idx) => {
      if (!usedButtons.has(idx)) {
        // Connect to a random gate (prefer non-NOT gates)
        const nonNOTGates = firstLayer.filter(g => g.gateType !== 'NOT');
        const targetGates = nonNOTGates.length > 0 ? nonNOTGates : firstLayer;
        const target = targetGates[Math.floor(Math.random() * targetGates.length)];
        this.addConnection(btn, target, connections, mechanisms);
      }
    });
  }

  /**
   * Connect sources to layer (ensure all sources have outputs)
   */
  connectToLayer(sources, targetLayer, connections, mechanisms) {
    if (sources.length === 0 || targetLayer.length === 0) return;

    const usedSources = new Set();

    // Step 1: Each target gets minimum required inputs
    for (const target of targetLayer) {
      const inputsNeeded = target.gateType === 'NOT' ? 1 : 2;
      const available = sources.filter(s => !usedSources.has(sources.indexOf(s)));
      const selectedSources = this.selectSourcesForGate(
        available.length > 0 ? available : sources,
        target,
        inputsNeeded
      );

      for (const source of selectedSources) {
        usedSources.add(sources.indexOf(source));
        this.addConnection(source, target, connections, mechanisms);
      }
    }

    // Step 2: Connect remaining unused sources to random targets
    sources.forEach((source, idx) => {
      if (!usedSources.has(idx)) {
        const target = targetLayer[Math.floor(Math.random() * targetLayer.length)];
        this.addConnection(source, target, connections, mechanisms);
      }
    });
  }

  /**
   * Select appropriate sources for a gate
   */
  selectSourcesForGate(sources, gate, count) {
    if (sources.length <= count) {
      return sources; // Use all available
    }

    // Random selection to create variety
    const selected = [];
    const available = [...sources];

    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      selected.push(available[idx]);
      available.splice(idx, 1);
    }

    return selected;
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
          this.addConnection(buttons[buttonIndex], gates[g], connections, mechanisms);
          buttonIndex++;
        }
      }

      // Gate chaining
      if (buttonsForThisGate < 2 && g > 0) {
        this.addConnection(gates[g - 1], gates[g], connections, mechanisms);
      }

      activeGates.push(gates[g]);
    }
  }

  /**
   * Connect gates to door (possibly through relays)
   */
  connectGatesToDoor(activeGates, relays, door, doorIndex, config, connections, mechanisms) {
    const doorObj = mechanisms[doorIndex];

    if (config.multiConnect && activeGates.length > 1) {
      if (relays.length > 0) {
        // Use ALL relays by distributing them across gates
        for (let i = 0; i < relays.length; i++) {
          const gateIdx = i % activeGates.length; // Cycle through gates
          this.addConnection(activeGates[gateIdx], relays[i], connections, mechanisms);
          this.addConnection(relays[i], doorObj, connections, mechanisms);
        }

        door.requiredSignals = Math.min(relays.length, config.minSignals || relays.length);
      } else {
        // Direct connection
        const targetSignals = Math.max(
          Math.min(activeGates.length, config.minSignals || activeGates.length),
          2
        );

        for (let i = 0; i < targetSignals; i++) {
          this.addConnection(activeGates[i], doorObj, connections, mechanisms);
        }

        door.requiredSignals = targetSignals;
      }
    } else {
      // Single connect mode
      const mainGate = activeGates[activeGates.length - 1];

      if (relays.length > 0) {
        this.addConnection(mainGate, relays[0], connections, mechanisms);
        this.addConnection(relays[0], doorObj, connections, mechanisms);
      } else {
        this.addConnection(mainGate, doorObj, connections, mechanisms);
      }

      door.requiredSignals = 1;
    }
  }

  /**
   * Connect buttons via relays (no gates)
   */
  connectButtonsViaRelays(buttons, relays, door, doorIndex, connections, mechanisms) {
    const doorObj = mechanisms[doorIndex];

    buttons.forEach((button, i) => {
      const relay = relays[i % relays.length];
      this.addConnection(button, relay, connections, mechanisms);
    });

    relays.forEach(relay => {
      this.addConnection(relay, doorObj, connections, mechanisms);
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
