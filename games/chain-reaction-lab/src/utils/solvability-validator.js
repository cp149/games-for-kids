/**
 * Solvability Validator
 * Validates level solvability and calculates par (optimal moves)
 */

export class SolvabilityValidator {
  /**
   * Check if a level is solvable
   * @param {Array} mechanisms - All mechanisms in the level
   * @param {Array} connections - All connections
   * @param {Object} config - Difficulty configuration
   * @returns {boolean} True if level is solvable
   */
  static isSolvable(mechanisms, connections, config) {
    // Basic validation
    const buttons = mechanisms.filter(m => m.type === 'button');
    const door = mechanisms.find(m => m.type === 'door');

    if (buttons.length === 0 || !door) return false;

    // Check connectivity: door must be reachable from buttons using BFS
    const buttonIndices = buttons.map(b => mechanisms.indexOf(b));
    const reachable = new Set(buttonIndices);
    const queue = [...buttonIndices];

    // Optimized BFS: O(E) instead of O(E×V)
    while (queue.length > 0) {
      const current = queue.shift();
      for (const conn of connections) {
        if (conn.from === current && !reachable.has(conn.to)) {
          reachable.add(conn.to);
          queue.push(conn.to);
        }
      }
    }

    const doorReachable = reachable.has(mechanisms.indexOf(door));

    // Anti-brute-force validation: ensure puzzle requires thinking
    if (doorReachable && config) {
      return this.requiresStrategicThinking(mechanisms, connections, config);
    }

    return doorReachable;
  }

  /**
   * Validate that puzzle requires strategic thinking (not brute-forceable)
   * @param {Array} mechanisms - All mechanisms in the level
   * @param {Array} connections - All connections
   * @param {Object} config - Difficulty configuration
   * @returns {boolean} True if puzzle requires thinking
   */
  static requiresStrategicThinking(mechanisms, connections, config) {
    const gates = mechanisms.filter(m => m.type === 'logic-gate');
    const buttons = mechanisms.filter(m => m.type === 'button');

    // Simple levels (difficulty 1-2) can be more straightforward
    if (config.difficulty && config.difficulty <= 2) {
      return true; // Allow easier levels for learning
    }

    // For harder levels, require logic gates to enforce strategic thinking
    if (gates.length === 0 && buttons.length > 2) {
      return false; // No gates = brute-force by trying all button combinations
    }

    // Check for NOT gates (require specific input patterns)
    const notGates = gates.filter(g => g.gateType === 'NOT' || g.gateType === 'NOR');
    if (notGates.length > 0) {
      return true; // NOT gates require understanding "do NOT press" logic
    }

    // Check for AND gates requiring multiple inputs
    const andGates = gates.filter(g => g.gateType === 'AND' || g.gateType === 'NAND');
    if (andGates.length > 0) {
      // Verify AND gates actually require multiple buttons
      const gateInputCounts = this.countGateInputs(mechanisms, connections, andGates);
      const hasMultiInputGate = gateInputCounts.some(count => count >= 2);
      if (hasMultiInputGate) {
        return true; // Requires understanding which buttons activate the gate
      }
    }

    // If only simple OR gates, might be brute-forceable
    // Allow if difficulty is low enough
    return config.difficulty && config.difficulty <= 3;
  }

  /**
   * Count inputs for each gate
   * @param {Array} mechanisms - All mechanisms
   * @param {Array} connections - All connections
   * @param {Array} gates - Gates to analyze
   * @returns {Array} Array of input counts
   */
  static countGateInputs(mechanisms, connections, gates) {
    return gates.map(gate => {
      const gateIndex = mechanisms.indexOf(gate);
      const inputs = connections.filter(conn => conn.to === gateIndex);
      return inputs.length;
    });
  }

  /**
   * Calculate par (optimal number of moves)
   * @param {Array} mechanisms - All mechanisms in the level
   * @param {Array} _connections - All connections (reserved for future use)
   * @returns {number} Optimal move count
   */
  static calculatePar(mechanisms, _connections) {
    const buttons = mechanisms.filter(m => m.type === 'button');
    const gates = mechanisms.filter(m => m.type === 'logic-gate');

    // Simple heuristic based on gate types
    if (gates.length === 0) return buttons.length;

    const andGates = gates.filter(g => g.gateType === 'AND' || g.gateType === 'NAND');
    const notGates = gates.filter(g => g.gateType === 'NOT' || g.gateType === 'NOR');

    if (notGates.length > 0) return 0; // NOT gates want no input
    if (andGates.length > 0) return buttons.length; // AND wants all inputs

    return 1; // OR/XOR can solve with just one button
  }

  /**
   * Generate fallback simple level (guaranteed to be solvable)
   * @returns {Object} Simple level data
   */
  static generateFallbackLevel() {
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
