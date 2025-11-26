/**
 * GameContext - Bundles common dependencies for dependency injection
 * Eliminates "data clump" code smell by consolidating repeated parameters
 *
 * Usage:
 *   const context = new GameContext({ config: customConfig });
 *   const board = new Board(container, { context });
 */

class GameContext {
    /**
     * @param {Object} [options] - Context options
     * @param {Document} [options.doc] - Document object (default: window.document)
     * @param {Object} [options.config] - Configuration object (default: CONFIG)
     * @param {Object} [options.timeController] - Time controller for testing
     */
    constructor(options = {}) {
        this.doc = options.doc || (typeof document !== 'undefined' ? document : null);
        this.config = options.config || (typeof CONFIG !== 'undefined' ? CONFIG : {});
        this.timeController = options.timeController || null;
    }

    /**
     * Create a child context with overridden options
     * Useful for testing specific components with modified settings
     * @param {Object} overrides - Options to override
     * @returns {GameContext} New context with overrides applied
     */
    extend(overrides = {}) {
        return new GameContext({
            doc: overrides.doc ?? this.doc,
            config: overrides.config ?? this.config,
            timeController: overrides.timeController ?? this.timeController
        });
    }

    /**
     * Check if context has a valid document
     * @returns {boolean}
     */
    hasDocument() {
        return this.doc !== null;
    }

    /**
     * Check if context has a time controller (test mode)
     * @returns {boolean}
     */
    isTestMode() {
        return this.timeController !== null;
    }

    /**
     * Get config value with optional default
     * @param {string} path - Dot-separated path (e.g., 'GAME.GRID_SIZE')
     * @param {*} defaultValue - Default if path not found
     * @returns {*}
     */
    getConfig(path, defaultValue = undefined) {
        const parts = path.split('.');
        let value = this.config;

        for (const part of parts) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return defaultValue;
            }
            value = value[part];
        }

        return value !== undefined ? value : defaultValue;
    }
}

// Export for both browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameContext;
}
