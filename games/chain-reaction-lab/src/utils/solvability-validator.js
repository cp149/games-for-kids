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
   * Calculate par (optimal number of moves)
   * @param {Array} mechanisms - All mechanisms in the level
   * @param {Array} connections - All connections
   * @returns {number} Optimal move count
   */
  static calculatePar(mechanisms, connections) {
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
