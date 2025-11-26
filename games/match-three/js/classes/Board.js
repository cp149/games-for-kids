/**
 * Board - Game board logic
 * Handles grid, gem placement, matching, and gravity
 *
 * Supports dependency injection for testability:
 * - doc: Document object (default: window.document)
 * - config: Configuration object (default: CONFIG)
 * - timeController: Time control for async operations
 * - GemClass: Gem constructor (default: Gem)
 * - autoInit: Whether to auto-initialize (default: true)
 */

class Board {
    /**
     * @param {HTMLElement} container - Container element for the board
     * @param {Object} [options] - Optional dependencies for testing
     * @param {Document} [options.doc] - Document object
     * @param {Object} [options.config] - Configuration object
     * @param {Object} [options.timeController] - Time controller with wait() method
     * @param {Function} [options.GemClass] - Gem class constructor
     * @param {boolean} [options.autoInit] - Auto-initialize board (default: true)
     */
    constructor(container, options = {}) {
        // Dependency injection with defaults
        this.doc = options.doc || (typeof document !== 'undefined' ? document : null);
        this.config = options.config || CONFIG;
        this.timeController = options.timeController || null;
        this.GemClass = options.GemClass || Gem;

        this.container = container;
        this.size = this.config.GAME.GRID_SIZE;
        this.grid = []; // 2D array of gems
        this.element = null;
        this.selectedGem = null;
        this.isProcessing = false;

        // Event handlers for cleanup
        this.handlers = new Map();

        // Timer tracking for cleanup
        this.timers = new Set();

        // Auto-initialize unless disabled (for testing)
        if (options.autoInit !== false) {
            this.createBoard();
            this.fillBoard();
        }
    }

    /**
     * Create the board DOM element
     */
    createBoard() {
        const board = this.doc.createElement('div');
        board.className = 'game-board';
        board.id = 'game-board';

        // Set board size
        const cellSize = this.getCellSize();
        const boardSize = cellSize * this.size;
        board.style.width = `${boardSize}px`;
        board.style.height = `${boardSize}px`;
        board.style.position = 'relative';
        board.style.margin = '0 auto';
        board.style.borderRadius = `${this.config.BOARD.BORDER_RADIUS}px`;
        board.style.overflow = 'hidden';

        this.element = board;
        this.container.appendChild(board);

        // Setup click/touch handlers
        this.setupEventListeners();
    }

    /**
     * Setup board event listeners
     */
    setupEventListeners() {
        const clickHandler = this.handleGemClick.bind(this);
        this.element.addEventListener('click', clickHandler);
        this.handlers.set('click', clickHandler);

        // Touch support
        const touchHandler = this.handleTouch.bind(this);
        this.element.addEventListener('touchstart', touchHandler, { passive: true });
        this.handlers.set('touchstart', touchHandler);
    }

    /**
     * Get cell size based on viewport - uses shared utility
     */
    getCellSize() {
        return Utils.getCellSize(this.size);
    }

    /**
     * Initialize 2D grid array
     */
    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < this.size; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    /**
     * Fill board with random gems ensuring no initial matches
     */
    fillBoard() {
        this.initializeGrid();

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const type = this.getRandomGemType(row, col);
                this.createGem(type, row, col);
            }
        }
    }

    /**
     * Get random gem type that won't create initial match
     */
    getRandomGemType(row, col) {
        const forbidden = new Set();

        // Check horizontal matches
        if (col >= 2) {
            const left1 = this.grid[row][col - 1];
            const left2 = this.grid[row][col - 2];
            if (left1 && left2 && left1.type === left2.type) {
                forbidden.add(left1.type);
            }
        }

        // Check vertical matches
        if (row >= 2) {
            const up1 = this.grid[row - 1][col];
            const up2 = this.grid[row - 2][col];
            if (up1 && up2 && up1.type === up2.type) {
                forbidden.add(up1.type);
            }
        }

        // Get available types
        const available = [];
        for (let type = 0; type < this.config.GAME.GEM_TYPES; type++) {
            if (!forbidden.has(type)) {
                available.push(type);
            }
        }

        // Return random available type
        return available[Math.floor(Math.random() * available.length)];
    }

    /**
     * Create a gem at specific position
     * Uses injected GemClass for testability
     */
    createGem(type, row, col) {
        const gem = new this.GemClass(type, row, col, { config: this.config, doc: this.doc });
        this.grid[row][col] = gem;
        this.element.appendChild(gem.getElement());
        return gem;
    }

    /**
     * Handle gem click
     */
    handleGemClick(event) {
        if (this.isProcessing) return;

        const gemElement = event.target.closest('.gem');
        if (!gemElement) return;

        const row = Utils.safeParseInt(gemElement.dataset.row, -1);
        const col = Utils.safeParseInt(gemElement.dataset.col, -1);

        // Validate bounds before grid access
        if (!Utils.isInBounds(row, 0, this.size) || !Utils.isInBounds(col, 0, this.size)) {
            return;
        }

        const gem = this.grid[row][col];
        if (!gem) return;

        if (!this.selectedGem) {
            // Select first gem
            this.selectGem(gem);
        } else {
            // Try to swap with selected gem
            if (gem === this.selectedGem) {
                // Deselect
                this.deselectGem();
            } else if (gem.isAdjacentTo(this.selectedGem)) {
                // Valid swap
                this.swapGems(this.selectedGem, gem);
            } else {
                // Select new gem
                this.deselectGem();
                this.selectGem(gem);
            }
        }
    }

    /**
     * Handle touch events
     */
    handleTouch(event) {
        // Prevent default to avoid double-firing with click
        // Let click handler manage the logic
    }

    /**
     * Select a gem
     */
    selectGem(gem) {
        this.selectedGem = gem;
        gem.setSelected(true);
    }

    /**
     * Deselect current gem
     */
    deselectGem() {
        if (this.selectedGem) {
            this.selectedGem.setSelected(false);
            this.selectedGem = null;
        }
    }

    /**
     * Swap two gems
     */
    async swapGems(gem1, gem2) {
        this.isProcessing = true;
        this.deselectGem();

        // Save ORIGINAL positions BEFORE any swap
        const original1Row = gem1.row;
        const original1Col = gem1.col;
        const original2Row = gem2.row;
        const original2Col = gem2.col;

        try {
            // Swap in grid
            this.grid[original1Row][original1Col] = gem2;
            this.grid[original2Row][original2Col] = gem1;

            // Animate swap
            gem1.moveTo(original2Row, original2Col, true);
            gem2.moveTo(original1Row, original1Col, true);

            // Wait for animation
            await this.wait(this.config.GAME.TIMING.SWAP_DURATION);

            // Check for matches (optimized: only check around swapped positions)
            const matches = this.findMatches([
                { row: original2Row, col: original2Col }, // gem1's new position
                { row: original1Row, col: original1Col }  // gem2's new position
            ]);

            if (matches.length === 0) {
                // Invalid move - swap back to original positions
                this.grid[original1Row][original1Col] = gem1;
                this.grid[original2Row][original2Col] = gem2;

                // Animate back to original positions
                gem1.moveTo(original1Row, original1Col, true);
                gem2.moveTo(original2Row, original2Col, true);

                await this.wait(this.config.GAME.TIMING.SWAP_DURATION);

                // Emit invalid swap event
                this.emitEvent('invalidSwap');
            } else {
                // Valid move - process matches
                await this.processMatches(matches);

                // Emit valid swap event
                this.emitEvent('validSwap', { matches: matches.length });
            }
        } catch (error) {
            console.error('Error during gem swap:', error);
            // Attempt recovery - restore original positions
            try {
                this.grid[original1Row][original1Col] = gem1;
                this.grid[original2Row][original2Col] = gem2;
                gem1.moveTo(original1Row, original1Col, false);
                gem2.moveTo(original2Row, original2Col, false);
            } catch (recoveryError) {
                console.error('Recovery failed:', recoveryError);
            }
            this.emitEvent('error', { type: 'swap', error: error.message });
        } finally {
            // Always reset processing state
            this.isProcessing = false;
        }
    }

    /**
     * Find all matches on the board
     * @param {Array<{row: number, col: number}>} [positions] - Optional: only check around these positions
     */
    findMatches(positions = null) {
        // If positions provided, use optimized local search
        if (positions && positions.length > 0) {
            return this.findMatchesLocal(positions);
        }

        // Full board scan
        const matches = new Set();

        // Check horizontal matches
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size - 2; col++) {
                const gem1 = this.grid[row][col];
                const gem2 = this.grid[row][col + 1];
                const gem3 = this.grid[row][col + 2];

                if (gem1 && gem2 && gem3 &&
                    gem1.type === gem2.type && gem2.type === gem3.type) {
                    matches.add(gem1);
                    matches.add(gem2);
                    matches.add(gem3);

                    // Check for longer matches
                    let checkCol = col + 3;
                    while (checkCol < this.size) {
                        const nextGem = this.grid[row][checkCol];
                        if (nextGem && nextGem.type === gem1.type) {
                            matches.add(nextGem);
                            checkCol++;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        // Check vertical matches
        for (let col = 0; col < this.size; col++) {
            for (let row = 0; row < this.size - 2; row++) {
                const gem1 = this.grid[row][col];
                const gem2 = this.grid[row + 1][col];
                const gem3 = this.grid[row + 2][col];

                if (gem1 && gem2 && gem3 &&
                    gem1.type === gem2.type && gem2.type === gem3.type) {
                    matches.add(gem1);
                    matches.add(gem2);
                    matches.add(gem3);

                    // Check for longer matches
                    let checkRow = row + 3;
                    while (checkRow < this.size) {
                        const nextGem = this.grid[checkRow][col];
                        if (nextGem && nextGem.type === gem1.type) {
                            matches.add(nextGem);
                            checkRow++;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        return Array.from(matches);
    }

    /**
     * Find matches only around specific positions (optimized for post-swap)
     * Complexity: O(k*n) where k is positions count, vs O(n²) for full scan
     * @param {Array<{row: number, col: number}>} positions - Positions to check around
     * @returns {Array<Gem>} Matched gems
     */
    findMatchesLocal(positions) {
        const matches = new Set();

        for (const pos of positions) {
            const { row, col } = pos;
            const gem = this.grid[row]?.[col];
            if (!gem) continue;

            // Check horizontal match through this position
            this.findLineMatches(row, col, 0, 1, matches); // Horizontal
            this.findLineMatches(row, col, 1, 0, matches); // Vertical
        }

        return Array.from(matches);
    }

    /**
     * Find matches along a line passing through a position
     * @param {number} row - Starting row
     * @param {number} col - Starting col
     * @param {number} dRow - Row direction (-1, 0, 1)
     * @param {number} dCol - Col direction (-1, 0, 1)
     * @param {Set<Gem>} matches - Set to add matches to
     */
    findLineMatches(row, col, dRow, dCol, matches) {
        const gem = this.grid[row]?.[col];
        if (!gem) return;

        const type = gem.type;
        const lineGems = [gem];

        // Search in negative direction
        let r = row - dRow;
        let c = col - dCol;
        while (r >= 0 && r < this.size && c >= 0 && c < this.size) {
            const checkGem = this.grid[r][c];
            if (checkGem && checkGem.type === type) {
                lineGems.unshift(checkGem);
                r -= dRow;
                c -= dCol;
            } else {
                break;
            }
        }

        // Search in positive direction
        r = row + dRow;
        c = col + dCol;
        while (r >= 0 && r < this.size && c >= 0 && c < this.size) {
            const checkGem = this.grid[r][c];
            if (checkGem && checkGem.type === type) {
                lineGems.push(checkGem);
                r += dRow;
                c += dCol;
            } else {
                break;
            }
        }

        // Add to matches if 3 or more
        if (lineGems.length >= 3) {
            lineGems.forEach(g => matches.add(g));
        }
    }

    /**
     * Process matched gems and trigger cascade
     * Includes error recovery to prevent game lockup
     */
    async processMatches(matches, depth = 0) {
        // Prevent infinite recursion
        const MAX_CASCADE_DEPTH = 20;
        if (depth > MAX_CASCADE_DEPTH) {
            console.warn('Max cascade depth reached, stopping cascade');
            return 0;
        }

        if (matches.length === 0) return 0;

        try {
            // Mark and remove matches
            matches.forEach(gem => {
                if (gem && typeof gem.markAsMatched === 'function') {
                    gem.markAsMatched();
                }
            });

            // Emit match event with count
            this.emitEvent('gemsMatched', {
                count: matches.length,
                matches: matches
            });

            // Wait for match animation
            await this.wait(this.config.GAME.TIMING.MATCH_DURATION);

            // Remove matched gems from grid
            matches.forEach(gem => {
                if (gem && gem.row !== null && gem.col !== null) {
                    if (this.grid[gem.row]) {
                        this.grid[gem.row][gem.col] = null;
                    }
                    gem.remove();
                }
            });

            // Apply gravity
            await this.applyGravity();

            // Fill empty spaces
            await this.fillEmptySpaces();

            // Check for cascade matches
            await this.wait(this.config.GAME.TIMING.CASCADE_DELAY);
            const cascadeMatches = this.findMatches();

            if (cascadeMatches.length > 0) {
                // Emit cascade event
                this.emitEvent('cascade', { count: cascadeMatches.length });
                return matches.length + await this.processMatches(cascadeMatches, depth + 1);
            }

            return matches.length;
        } catch (error) {
            console.error('Error during match processing:', error);
            this.emitEvent('error', { type: 'processMatches', error: error.message });
            // Return current count to allow game to continue
            return matches.length;
        }
    }

    /**
     * Apply gravity - move gems down
     */
    async applyGravity() {
        let moved = false;

        for (let col = 0; col < this.size; col++) {
            for (let row = this.size - 1; row >= 0; row--) {
                if (this.grid[row][col] === null) {
                    // Find gem above
                    for (let checkRow = row - 1; checkRow >= 0; checkRow--) {
                        if (this.grid[checkRow][col] !== null) {
                            const gem = this.grid[checkRow][col];
                            this.grid[row][col] = gem;
                            this.grid[checkRow][col] = null;
                            gem.moveTo(row, col, true);
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }

        if (moved) {
            await this.wait(this.config.GAME.TIMING.FALL_DURATION);
        }
    }

    /**
     * Fill empty spaces with new gems
     */
    async fillEmptySpaces() {
        const fadeDelay = this.config.BOARD.GEM_FADE_DELAY;
        const fadeDuration = this.config.BOARD.GEM_FADE_DURATION;

        for (let col = 0; col < this.size; col++) {
            for (let row = 0; row < this.size; row++) {
                if (this.grid[row][col] === null) {
                    const type = Math.floor(Math.random() * this.config.GAME.GEM_TYPES);
                    const gem = this.createGem(type, row, col);
                    gem.element.style.opacity = '0';

                    // Fade in with tracked timer
                    const timerId = setTimeout(() => {
                        this.timers.delete(timerId);
                        if (gem.element) {
                            gem.element.style.transition = `opacity ${fadeDuration}ms`;
                            gem.element.style.opacity = '1';
                        }
                    }, fadeDelay);
                    this.timers.add(timerId);
                }
            }
        }

        await this.wait(fadeDuration);
    }

    /**
     * Shuffle board
     */
    async shuffle() {
        this.isProcessing = true;

        // Clear current board
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const gem = this.grid[row][col];
                if (gem) {
                    gem.remove();
                }
            }
        }

        // Refill
        this.fillBoard();

        await this.wait(this.config.BOARD.SHUFFLE_DELAY);
        this.isProcessing = false;

        this.emitEvent('shuffled');
    }

    /**
     * Check if any moves are available
     */
    hasAvailableMoves() {
        // Simple check: try swapping each gem with adjacent gems
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const gem = this.grid[row][col];
                if (!gem) continue;

                // Check right swap
                if (col < this.size - 1) {
                    if (this.wouldCreateMatch(row, col, row, col + 1)) {
                        return true;
                    }
                }

                // Check down swap
                if (row < this.size - 1) {
                    if (this.wouldCreateMatch(row, col, row + 1, col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if swapping two positions would create a match
     * Optimized: Pure function - no state mutation, local match check only
     */
    wouldCreateMatch(row1, col1, row2, col2) {
        const gem1 = this.grid[row1][col1];
        const gem2 = this.grid[row2][col2];
        if (!gem1 || !gem2) return false;

        const type1 = gem1.type;
        const type2 = gem2.type;

        // Check if gem1's type at position2 would create a match
        if (this.wouldMatchAt(row2, col2, type1, row1, col1)) {
            return true;
        }

        // Check if gem2's type at position1 would create a match
        if (this.wouldMatchAt(row1, col1, type2, row2, col2)) {
            return true;
        }

        return false;
    }

    /**
     * Check if placing a gem type at a position would create a match
     * Pure function - reads grid but doesn't modify it
     * @param {number} row - Target row
     * @param {number} col - Target col
     * @param {number} type - Gem type to check
     * @param {number} excludeRow - Row to exclude (original position)
     * @param {number} excludeCol - Col to exclude (original position)
     * @returns {boolean} True if match would occur
     */
    wouldMatchAt(row, col, type, excludeRow, excludeCol) {
        // Helper to get gem type at position (respecting swap)
        const getType = (r, c) => {
            if (r === excludeRow && c === excludeCol) return type; // Swapped gem
            if (r === row && c === col) return -1; // Being replaced
            const gem = this.grid[r]?.[c];
            return gem ? gem.type : -1;
        };

        // Check horizontal match
        let hCount = 1;
        // Count left
        for (let c = col - 1; c >= 0 && getType(row, c) === type; c--) hCount++;
        // Count right
        for (let c = col + 1; c < this.size && getType(row, c) === type; c++) hCount++;
        if (hCount >= 3) return true;

        // Check vertical match
        let vCount = 1;
        // Count up
        for (let r = row - 1; r >= 0 && getType(r, col) === type; r--) vCount++;
        // Count down
        for (let r = row + 1; r < this.size && getType(r, col) === type; r++) vCount++;
        if (vCount >= 3) return true;

        return false;
    }

    /**
     * Emit custom event
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        this.element.dispatchEvent(event);
    }

    /**
     * Wait helper with timer tracking for cleanup
     * Uses timeController if provided (for testing), otherwise real setTimeout
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<boolean>} True if component still exists, false if destroyed
     */
    wait(ms) {
        // Use injected time controller if available (for testing)
        if (this.timeController && typeof this.timeController.wait === 'function') {
            return this.timeController.wait(ms).then(() => this.isActive());
        }

        // Default: real setTimeout with timer tracking
        return new Promise(resolve => {
            const timerId = setTimeout(() => {
                this.timers.delete(timerId);
                resolve(this.isActive());
            }, ms);
            this.timers.add(timerId);
        });
    }

    /**
     * Check if board is still active and not destroyed
     * @returns {boolean} True if board is active
     */
    isActive() {
        return this.element !== null && this.element.parentNode !== null;
    }

    /**
     * Resize board and update all gem sizes
     * Optimized: Uses CSS variables for batch style updates (single reflow)
     */
    resize() {
        const cellSize = this.getCellSize();
        const boardSize = cellSize * this.size;

        // Update board size
        this.element.style.width = `${boardSize}px`;
        this.element.style.height = `${boardSize}px`;

        // Calculate gem dimensions
        const gemSize = cellSize - this.config.BOARD.GEM_PADDING;
        const fontSize = Math.floor(cellSize * this.config.GEM.EMOJI_SIZE_RATIO);
        const borderRadius = Math.floor(cellSize * this.config.GEM.BORDER_RADIUS_RATIO);

        // Batch update via CSS variables (single reflow instead of 64)
        const root = this.doc.documentElement;
        root.style.setProperty('--cell-size', `${cellSize}px`);
        root.style.setProperty('--gem-size', `${gemSize}px`);
        root.style.setProperty('--gem-font-size', `${fontSize}px`);
        root.style.setProperty('--gem-border-radius', `${borderRadius}px`);

        // Only update positions (transforms don't trigger reflow)
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const gem = this.grid[row][col];
                if (gem && gem.element) {
                    gem.updatePosition(false);
                }
            }
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear all pending timers first
        this.timers.forEach(timerId => clearTimeout(timerId));
        this.timers.clear();

        // Clear selected gem before destroying
        if (this.selectedGem) {
            this.selectedGem.setSelected(false);
            this.selectedGem = null;
        }

        // Remove event listeners
        if (this.element) {
            this.handlers.forEach((handler, event) => {
                this.element.removeEventListener(event, handler);
            });
        }
        this.handlers.clear();

        // Destroy all gems
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const gem = this.grid[row][col];
                if (gem) {
                    gem.destroy();
                    this.grid[row][col] = null;
                }
            }
        }

        // Remove element
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }

        // Clear all references
        this.grid = null;
        this.element = null;
        this.container = null;
        this.isProcessing = false;
    }

    // ==================== Test Hooks ====================
    // These methods are for testing purposes only

    /**
     * Get a snapshot of the current board state (for testing assertions)
     * @returns {Object} Board state snapshot
     */
    _getSnapshot() {
        return {
            grid: this.grid ? this.grid.map(row =>
                row.map(gem => gem ? { type: gem.type, row: gem.row, col: gem.col } : null)
            ) : null,
            size: this.size,
            isProcessing: this.isProcessing,
            selectedGem: this.selectedGem ? {
                type: this.selectedGem.type,
                row: this.selectedGem.row,
                col: this.selectedGem.col
            } : null
        };
    }

    /**
     * Get grid as simple type array (for testing)
     * @returns {Array<Array<number|null>>}
     */
    _getGridTypes() {
        if (!this.grid) return null;
        return this.grid.map(row => row.map(gem => gem?.type ?? null));
    }

    /**
     * Set grid state from type array (for testing)
     * @param {Array<Array<number|null>>} typeGrid
     */
    _setGridTypes(typeGrid) {
        // Clear existing gems
        if (this.grid) {
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    const gem = this.grid[row]?.[col];
                    if (gem) gem.destroy();
                }
            }
        }

        // Create new grid
        this.initializeGrid();
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const type = typeGrid[row]?.[col];
                if (type !== null && type !== undefined) {
                    this.createGem(type, row, col);
                }
            }
        }
    }

    /**
     * Simulate a gem click at position (for testing)
     * @param {number} row
     * @param {number} col
     */
    _clickGem(row, col) {
        const gem = this.grid[row]?.[col];
        if (gem) {
            // Simulate the click handler logic
            if (!this.selectedGem) {
                this.selectGem(gem);
            } else if (gem === this.selectedGem) {
                this.deselectGem();
            } else if (gem.isAdjacentTo(this.selectedGem)) {
                return this.swapGems(this.selectedGem, gem);
            } else {
                this.deselectGem();
                this.selectGem(gem);
            }
        }
        return Promise.resolve();
    }
}
