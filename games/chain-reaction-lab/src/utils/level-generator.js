/**
 * Level Generator (Refactored)
 * Procedurally generates valid puzzle levels based on difficulty
 * Delegatescomplex logic to specialized classes for maintainability
 */

import { DifficultyConfig } from './difficulty-config.js';
import { PositionManager } from './position-manager.js';
import { ConnectionBuilder } from './connection-builder.js';
import { SolvabilityValidator } from './solvability-validator.js';

export class LevelGenerator {
  constructor() {
    this.gateTypes = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR'];
    this.positionManager = new PositionManager();
    this.connectionBuilder = new ConnectionBuilder();
  }

  /**
   * Generate a random level
   * @param {number} difficulty - 1 to 5
   * @returns {Object} Level data
   */
  generateLevel(difficulty) {
    const config = DifficultyConfig.getConfig(difficulty);
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      try {
        this.positionManager.reset();
        const mechanisms = this.generateMechanisms(config);
        const connections = this.connectionBuilder.generateConnections(mechanisms, config);

        // Verify solvability
        if (SolvabilityValidator.isSolvable(mechanisms, connections, config)) {
          return {
            mechanisms,
            connections,
            par: SolvabilityValidator.calculatePar(mechanisms, connections),
            title: DifficultyConfig.generateTitle(config),
            description: DifficultyConfig.generateDescription(config)
          };
        }
      } catch (e) {
        // Generation failed, try next attempt
      }
      attempts++;
    }

    // Fallback to simple level if all attempts fail
    return SolvabilityValidator.generateFallbackLevel();
  }

  /**
   * Generate mechanisms for the level
   * @param {Object} config - Difficulty configuration
   * @returns {Array} Array of mechanism objects
   */
  generateMechanisms(config) {
    const mechanisms = [];

    // Generate buttons (left side)
    for (let i = 0; i < config.buttons; i++) {
      const pos = this.positionManager.getUniquePosition(0.08, 0.28, 0.12, 0.88, 0.12);
      mechanisms.push({
        type: 'button',
        id: String.fromCharCode(65 + i), // A, B, C, ...
        x: pos.x,
        y: pos.y
      });
    }

    // Generate logic gates (distributed across layers)
    if (config.gates > 0 && config.usedGates.length > 0) {
      const gateTypes = this.selectGateTypes(config);
      const layers = this.distributeGatesAcrossLayers(config.gates, config.maxLayers);

      let gateIdx = 0;
      for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
        const gatesInLayer = layers[layerIdx];
        const xStart = 0.28 + (layerIdx * 0.12);
        const xEnd = xStart + 0.10;

        for (let i = 0; i < gatesInLayer; i++) {
          const pos = this.positionManager.getUniquePosition(
            xStart, xEnd, 0.12, 0.88, 0.12
          );

          mechanisms.push({
            type: 'logic-gate',
            gateType: gateTypes[gateIdx],
            id: `G${gateIdx}`,
            x: pos.x,
            y: pos.y
          });
          gateIdx++;
        }
      }
    }

    // Generate relays (right of gates)
    const relayXStart = 0.28 + ((config.maxLayers + 1) * 0.12);
    const relayXEnd = relayXStart + 0.15;

    for (let i = 0; i < config.relays; i++) {
      const pos = this.positionManager.getUniquePosition(
        relayXStart, relayXEnd, 0.12, 0.88, 0.12
      );
      mechanisms.push({
        type: 'relay',
        id: `R${i}`,
        x: pos.x,
        y: pos.y
      });
    }

    // Generate door (right side)
    const doorPos = this.positionManager.getUniquePosition(0.74, 0.92, 0.12, 0.88, 0.12);
    mechanisms.push({
      type: 'door',
      x: doorPos.x,
      y: doorPos.y,
      requiredSignals: 1
    });

    return mechanisms;
  }

  /**
   * Distribute gates across layers for position allocation (pyramid: wide → narrow, min 2 in final)
   * @param {number} totalGates - Total number of gates
   * @param {number} maxLayers - Maximum layers allowed
   * @returns {Array} Array of gate counts per layer
   */
  distributeGatesAcrossLayers(totalGates, maxLayers) {
    if (maxLayers === 0 || totalGates <= 2) {
      return [totalGates]; // Single layer
    }

    const actualLayers = Math.min(maxLayers, Math.ceil(totalGates / 2));
    const minFinalLayerGates = 2;
    const layers = [];
    let remaining = totalGates;

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
        layers.push(gatesInLayer);
        remaining -= gatesInLayer;
      }
    }

    return layers;
  }

  /**
   * Select gate types for all gates (ensures proper distribution)
   * @param {Object} config - Difficulty configuration
   * @returns {Array} Array of gate type strings
   */
  selectGateTypes(config) {
    const gateTypes = [];
    const selectableGates = config.usedGates;

    if (!selectableGates || selectableGates.length === 0) {
      return Array(config.gates).fill('AND');
    }

    const hasNOTAvailable = selectableGates.includes('NOT');
    const nonNOTGates = selectableGates.filter(g => g !== 'NOT');

    // Strategy: Ensure enough buttons for all gates
    // Each NOT gate needs 2 buttons (exclusive)
    // Each AND/OR gate needs ≥2 buttons (can share)

    // Calculate max NOT gates that leave enough buttons for other gates
    const otherGatesCount = config.gates;
    let maxNOTGates = 0;

    // Try different NOT gate counts and check if remaining buttons are sufficient
    for (let n = 0; n <= Math.min(config.gates, Math.floor(config.buttons / 2)); n++) {
      const buttonsUsedByNOT = n * 2;
      const buttonsRemaining = config.buttons - buttonsUsedByNOT;
      const otherGatesNeeded = config.gates - n;

      // Other gates need at least 2 buttons total (they can all share)
      if (buttonsRemaining >= Math.min(2, otherGatesNeeded * 2)) {
        maxNOTGates = n;
      }
    }

    // Generate NOT gates: 80% probability, up to maxNOTGates
    let notCount = 0;
    if (hasNOTAvailable && maxNOTGates > 0) {
      for (let i = 0; i < config.gates && notCount < maxNOTGates; i++) {
        if (Math.random() < 0.80) {
          gateTypes.push('NOT');
          notCount++;
        }
      }
    }

    // Fill remaining gates with AND (80%) / OR (20%)
    while (gateTypes.length < config.gates) {
      if (nonNOTGates.length > 0) {
        const gateType = Math.random() < 0.2 ? 'OR' : 'AND';
        gateTypes.push(nonNOTGates.includes(gateType) ? gateType : nonNOTGates[0]);
      } else {
        gateTypes.push('AND');
      }
    }

    return gateTypes;
  }
}

export default LevelGenerator;
