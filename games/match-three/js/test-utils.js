/**
 * Test Utilities - Testing helpers for match-three game
 * Provides tools for controlling async operations and mocking dependencies
 */

/**
 * FakeTimeController - Controls async timing in tests
 * Allows instant resolution or manual time advancement
 *
 * Usage:
 *   const timeController = new FakeTimeController();
 *   const board = new Board(container, { timeController });
 *
 *   // Instant mode (default) - all waits resolve immediately
 *   await board.processMatches(); // No actual delay
 *
 *   // Manual mode - control time advancement
 *   timeController.setMode('manual');
 *   const promise = board.wait(1000);
 *   timeController.tick(500);  // Advance 500ms
 *   timeController.tick(500);  // Advance another 500ms, promise resolves
 */
class FakeTimeController {
    constructor(mode = 'instant') {
        this.mode = mode; // 'instant' or 'manual'
        this.currentTime = 0;
        this.pendingTimers = [];
        this.nextTimerId = 1;
    }

    /**
     * Set the time controller mode
     * @param {'instant'|'manual'} mode
     */
    setMode(mode) {
        this.mode = mode;
    }

    /**
     * Wait for specified milliseconds
     * In instant mode: resolves immediately
     * In manual mode: resolves when tick() advances past the deadline
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<boolean>} Resolves to true when time elapses
     */
    wait(ms) {
        if (this.mode === 'instant') {
            return Promise.resolve(true);
        }

        // Manual mode - queue the timer
        return new Promise(resolve => {
            const deadline = this.currentTime + ms;
            const timerId = this.nextTimerId++;

            this.pendingTimers.push({
                id: timerId,
                deadline,
                resolve
            });

            // Sort by deadline for efficient processing
            this.pendingTimers.sort((a, b) => a.deadline - b.deadline);
        });
    }

    /**
     * Advance time by specified milliseconds (manual mode only)
     * Resolves all timers whose deadlines have passed
     * @param {number} ms - Milliseconds to advance
     * @returns {number} Number of timers that were resolved
     */
    tick(ms) {
        if (this.mode !== 'manual') {
            console.warn('tick() only works in manual mode');
            return 0;
        }

        this.currentTime += ms;
        let resolvedCount = 0;

        // Process all timers that have passed their deadline
        while (this.pendingTimers.length > 0 &&
               this.pendingTimers[0].deadline <= this.currentTime) {
            const timer = this.pendingTimers.shift();
            timer.resolve(true);
            resolvedCount++;
        }

        return resolvedCount;
    }

    /**
     * Advance to the next pending timer (manual mode only)
     * @returns {number} Time advanced in milliseconds, or 0 if no timers
     */
    tickToNext() {
        if (this.mode !== 'manual' || this.pendingTimers.length === 0) {
            return 0;
        }

        const nextDeadline = this.pendingTimers[0].deadline;
        const advance = nextDeadline - this.currentTime;
        this.tick(advance);
        return advance;
    }

    /**
     * Resolve all pending timers immediately
     * @returns {number} Number of timers resolved
     */
    flush() {
        const count = this.pendingTimers.length;
        while (this.pendingTimers.length > 0) {
            const timer = this.pendingTimers.shift();
            timer.resolve(true);
        }
        return count;
    }

    /**
     * Cancel all pending timers without resolving
     * @returns {number} Number of timers cancelled
     */
    clear() {
        const count = this.pendingTimers.length;
        this.pendingTimers = [];
        return count;
    }

    /**
     * Get current simulated time
     * @returns {number} Current time in milliseconds
     */
    getTime() {
        return this.currentTime;
    }

    /**
     * Reset the time controller to initial state
     */
    reset() {
        this.currentTime = 0;
        this.pendingTimers = [];
        this.nextTimerId = 1;
    }

    /**
     * Get number of pending timers
     * @returns {number}
     */
    getPendingCount() {
        return this.pendingTimers.length;
    }
}

/**
 * FakeDocument - Minimal DOM mock for testing
 * Provides just enough DOM API for game classes to function
 *
 * Usage:
 *   const fakeDoc = new FakeDocument();
 *   const gem = new Gem(0, 0, 0, { doc: fakeDoc, autoInit: true });
 */
class FakeDocument {
    constructor() {
        this.elements = new Map();
        this.eventListeners = new Map();
    }

    /**
     * Create a fake element
     * @param {string} tagName
     * @returns {Object} Fake element
     */
    createElement(tagName) {
        return new FakeElement(tagName);
    }

    /**
     * Get element by ID
     * @param {string} id
     * @returns {Object|null}
     */
    getElementById(id) {
        return this.elements.get(id) || null;
    }

    /**
     * Register an element for getElementById
     * @param {string} id
     * @param {Object} element
     */
    registerElement(id, element) {
        this.elements.set(id, element);
    }

    /**
     * Add event listener
     */
    addEventListener(event, handler) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(handler);
    }

    /**
     * Remove event listener
     */
    removeEventListener(event, handler) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(handler);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
}

/**
 * FakeElement - Minimal element mock
 */
class FakeElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.className = '';
        this.classList = new FakeClassList();
        this.style = {};
        this.dataset = {};
        this.textContent = '';
        this.innerHTML = '';
        this.children = [];
        this.parentNode = null;
        this.eventListeners = new Map();
        this.id = '';
    }

    appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parentNode = null;
        }
        return child;
    }

    remove() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }

    addEventListener(event, handler) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(handler);
    }

    removeEventListener(event, handler) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(handler);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    dispatchEvent(event) {
        const listeners = this.eventListeners.get(event.type) || [];
        listeners.forEach(handler => handler(event));
        return true;
    }

    querySelector(selector) {
        // Simple implementation - just return first child for testing
        return this.children[0] || null;
    }

    querySelectorAll(selector) {
        return this.children;
    }

    getBoundingClientRect() {
        return {
            top: 0, left: 0, right: 100, bottom: 100,
            width: 100, height: 100, x: 0, y: 0
        };
    }

    click() {
        this.dispatchEvent({ type: 'click' });
    }
}

/**
 * FakeClassList - Minimal classList mock
 */
class FakeClassList {
    constructor() {
        this.classes = new Set();
    }

    add(...classNames) {
        classNames.forEach(c => this.classes.add(c));
    }

    remove(...classNames) {
        classNames.forEach(c => this.classes.delete(c));
    }

    toggle(className) {
        if (this.classes.has(className)) {
            this.classes.delete(className);
            return false;
        } else {
            this.classes.add(className);
            return true;
        }
    }

    contains(className) {
        return this.classes.has(className);
    }

    toString() {
        return Array.from(this.classes).join(' ');
    }
}

/**
 * Create a test configuration object
 * @param {Object} overrides - Override specific values
 * @returns {Object} Test configuration
 */
function createTestConfig(overrides = {}) {
    const baseConfig = {
        GAME: {
            GRID_SIZE: 8,
            GEM_TYPES: 6,
            TIMING: {
                SWAP_DURATION: 200,
                MATCH_DURATION: 300,
                FALL_DURATION: 150,
                FALL_DELAY: 50,
                CASCADE_DELAY: 100,
                SHUFFLE_DELAY: 500,
                VICTORY_DELAY: 500
            }
        },
        BOARD: {
            BOARD_MARGIN: 10,
            GEM_PADDING: 4,
            MAX_BOARD_SIZE: 600,
            CELL_SIZE_MOBILE: 40,
            CELL_SIZE_TABLET: 50,
            CELL_SIZE_DESKTOP: 60,
            CELL_SIZE_LARGE: 70,
            FALL_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
            MATCH_EASING: 'ease-out',
            SHUFFLE_ATTEMPTS: 100
        },
        GEM: {
            BORDER_WIDTH: 2,
            BORDER_COLOR: 'rgba(255, 255, 255, 0.3)',
            SHADOW: '0 2px 8px rgba(0, 0, 0, 0.2)',
            GLOW_COLOR: 'rgba(255, 255, 255, 0.6)',
            SELECTED_SCALE: 1.1,
            MATCH_SCALE: 1.2,
            FRUITS: [
                { emoji: '🍎', color: '#ff6b6b' },
                { emoji: '🍊', color: '#ffa94d' },
                { emoji: '🍋', color: '#ffd43b' },
                { emoji: '🍇', color: '#9775fa' },
                { emoji: '🫐', color: '#4dabf7' },
                { emoji: '🥝', color: '#51cf66' }
            ]
        },
        UI: {
            HEADER_HEIGHT: 60,
            SCORE_PANEL_HEIGHT: 80,
            CONTROLS_HEIGHT: 60,
            BREAKPOINTS: {
                MOBILE: 480,
                TABLET: 768,
                LARGE: 1200
            }
        }
    };

    // Deep merge overrides
    return deepMerge(baseConfig, overrides);
}

/**
 * Deep merge two objects
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */
function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FakeTimeController,
        FakeDocument,
        FakeElement,
        FakeClassList,
        createTestConfig,
        deepMerge
    };
}
