/**
 * Board - Game board logic
 * Handles grid, gem placement, matching, and gravity
 *
 * Supports dependency injection for testability:
 * - context: GameContext instance (recommended)
 * - Or individual options: doc, config, timeController
 * - GemClass: Gem constructor (default: Gem)
 * - autoInit: Whether to auto-initialize (default: true)
 */

class Board {
    /**
     * @param {HTMLElement} container - Container element for the board
     * @param {Object} [options] - Optional dependencies for testing
     * @param {GameContext} [options.context] - GameContext instance (preferred)
     * @param {Document} [options.doc] - Document object (legacy, use context)
     * @param {Object} [options.config] - Configuration object (legacy, use context)
     * @param {Object} [options.timeController] - Time controller (legacy, use context)
     * @param {Function} [options.GemClass] - Gem class constructor
     * @param {boolean} [options.autoInit] - Auto-initialize board (default: true)
     */
    constructor(container, options = {}) {
        // Support both GameContext and individual options (backward compatible)
        const ctx = options.context || null;
        this.doc = ctx?.doc || options.doc || (typeof document !== 'undefined' ? document : null);
        this.config = ctx?.config || options.config || CONFIG;
        this.timeController = ctx?.timeController || options.timeController || null;
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
     * Supports both click (desktop) and swipe gestures (mobile)
     */
    setupEventListeners() {
        // Touch state for swipe gestures
        this.touchState = { startGem: null, startX: 0, startY: 0 };
        this.touchHandled = false; // Prevent click after touch

        // Click handler for desktop (mouse only)
        const clickHandler = this.handleGemClick.bind(this);
        this.element.addEventListener('click', clickHandler);
        this.handlers.set('click', clickHandler);

        // Touch handlers for mobile
        const touchStartHandler = this.handleTouchStart.bind(this);
        const touchEndHandler = this.handleTouchEnd.bind(this);
        const touchMoveHandler = this.handleTouchMove.bind(this);

        // Use passive for touchstart for better scroll performance
        this.element.addEventListener('touchstart', touchStartHandler, { passive: true });
        this.element.addEventListener('touchend', touchEndHandler, { passive: false });
        this.element.addEventListener('touchmove', touchMoveHandler, { passive: false });

        this.handlers.set('touchstart', touchStartHandler);
        this.handlers.set('touchend', touchEndHandler);
        this.handlers.set('touchmove', touchMoveHandler);
    }

    /**
     * Get gem from touch/mouse coordinates
     * @param {number} clientX - Client X coordinate
     * @param {number} clientY - Client Y coordinate
     * @returns {Gem|null}
     */
    getGemFromPoint(clientX, clientY) {
        const rect = this.element.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const cellSize = this.getCellSize();

        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);

        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
            return this.grid[row]?.[col] || null;
        }
        return null;
    }

    /**
     * Handle touch start - record starting position
     */
    handleTouchStart(event) {
        if (this.isProcessing || !event.touches.length) return;

        const touch = event.touches[0];
        const gem = this.getGemFromPoint(touch.clientX, touch.clientY);

        this.touchState = {
            startGem: gem,
            startX: touch.clientX,
            startY: touch.clientY
        };
    }

    /**
     * Handle touch move - prevent scrolling during swipe
     */
    handleTouchMove(event) {
        if (!this.touchState.startGem) return;

        // Prevent page scroll while swiping on board
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchState.startX);
        const deltaY = Math.abs(touch.clientY - this.touchState.startY);

        // If user is clearly swiping (moved more than threshold), prevent scroll
        if (deltaX > 10 || deltaY > 10) {
            event.preventDefault();
        }
    }

    /**
     * Handle touch end - detect swipe or tap gestures
     * Handles both swipe (drag) and tap (click) for touch devices
     */
    handleTouchEnd(event) {
        if (this.isProcessing || !this.touchState.startGem) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchState.startX;
        const deltaY = touch.clientY - this.touchState.startY;

        const minSwipeDistance = 20; // Minimum distance for swipe detection
        const startGem = this.touchState.startGem;

        // Reset touch state
        this.touchState = { startGem: null, startX: 0, startY: 0 };

        // Prevent click event from double-processing
        this.touchHandled = true;

        // Check if this is a SWIPE gesture (moved enough distance)
        const isSwipe = Math.abs(deltaX) >= minSwipeDistance || Math.abs(deltaY) >= minSwipeDistance;

        if (isSwipe) {
            // Handle SWIPE - determine direction and swap
            let targetRow = startGem.row;
            let targetCol = startGem.col;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                targetCol += deltaX > 0 ? 1 : -1;
            } else {
                targetRow += deltaY > 0 ? 1 : -1;
            }

            if (targetRow >= 0 && targetRow < this.size &&
                targetCol >= 0 && targetCol < this.size) {
                const targetGem = this.grid[targetRow]?.[targetCol];
                if (targetGem) {
                    this.swapGems(startGem, targetGem);
                }
            }
        } else {
            // Handle TAP - select or swap gem
            if (!this.selectedGem) {
                this.selectGem(startGem);
            } else if (startGem === this.selectedGem) {
                this.deselectGem();
            } else if (startGem.isAdjacentTo(this.selectedGem)) {
                this.swapGems(this.selectedGem, startGem);
            } else {
                this.deselectGem();
                this.selectGem(startGem);
            }
        }
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
     * Handle gem click (desktop/mouse only)
     * Skipped when touch events are used to prevent double-handling
     */
    handleGemClick(event) {
        // Skip if touch event already handled this interaction
        if (this.touchHandled) {
            this.touchHandled = false;
            return;
        }

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
     * Orchestrates the swap process using focused helper methods
     */
    async swapGems(gem1, gem2) {
        this.isProcessing = true;
        this.deselectGem();

        const state = this.createSwapState(gem1, gem2);

        try {
            await this.performSwap(state);
            const matches = this.findMatchesAfterSwap(state);

            if (matches.length === 0) {
                await this.revertSwap(state);
                this.emitEvent('invalidSwap');
            } else {
                await this.processMatches(matches);
                this.emitEvent('validSwap', { matches: matches.length });
            }
        } catch (error) {
            console.error('Error during gem swap:', error);
            this.handleSwapError(state);
            this.emitEvent('error', { type: 'swap', error: error.message });
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Create swap state object to track original positions
     * @param {Gem} gem1 - First gem
     * @param {Gem} gem2 - Second gem
     * @returns {Object} Swap state with gems and original positions
     */
    createSwapState(gem1, gem2) {
        return {
            gem1,
            gem2,
            pos1: { row: gem1.row, col: gem1.col },
            pos2: { row: gem2.row, col: gem2.col }
        };
    }

    /**
     * Execute the swap in grid and animate
     * @param {Object} state - Swap state from createSwapState
     */
    async performSwap(state) {
        const { gem1, gem2, pos1, pos2 } = state;

        // Swap in grid
        this.grid[pos1.row][pos1.col] = gem2;
        this.grid[pos2.row][pos2.col] = gem1;

        // Animate swap
        gem1.moveTo(pos2.row, pos2.col, true);
        gem2.moveTo(pos1.row, pos1.col, true);

        await this.wait(this.config.GAME.TIMING.SWAP_DURATION);
    }

    /**
     * Find matches around swapped positions
     * @param {Object} state - Swap state from createSwapState
     * @returns {Array<Gem>} Matched gems
     */
    findMatchesAfterSwap(state) {
        return this.findMatches([state.pos1, state.pos2]);
    }

    /**
     * Revert an invalid swap back to original positions
     * @param {Object} state - Swap state from createSwapState
     */
    async revertSwap(state) {
        const { gem1, gem2, pos1, pos2 } = state;

        // Restore grid
        this.grid[pos1.row][pos1.col] = gem1;
        this.grid[pos2.row][pos2.col] = gem2;

        // Animate back
        gem1.moveTo(pos1.row, pos1.col, true);
        gem2.moveTo(pos2.row, pos2.col, true);

        await this.wait(this.config.GAME.TIMING.SWAP_DURATION);
    }

    /**
     * Handle swap error by restoring original state
     * @param {Object} state - Swap state from createSwapState
     */
    handleSwapError(state) {
        const { gem1, gem2, pos1, pos2 } = state;

        try {
            this.grid[pos1.row][pos1.col] = gem1;
            this.grid[pos2.row][pos2.col] = gem2;
            gem1.moveTo(pos1.row, pos1.col, false);
            gem2.moveTo(pos2.row, pos2.col, false);
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
        }
    }

    /**
     * Find all matches on the board
     * Delegates to BoardLogic pure functions for testability and code reuse
     * @param {Array<{row: number, col: number}>} [positions] - Optional: only check around these positions
     * @returns {Array<Gem>} Matched gems
     */
    findMatches(positions = null) {
        // Convert gem grid to type grid for pure function
        const typeGrid = BoardLogic.gridToSnapshot(this.grid);

        // Use BoardLogic's pure function for match detection
        const matchPositions = BoardLogic.findMatches(typeGrid, this.size, positions);

        // Convert positions back to Gem objects
        return matchPositions
            .map(pos => this.grid[pos.row]?.[pos.col])
            .filter(gem => gem !== null && gem !== undefined);
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
     * Delegates to BoardLogic pure function for testability and code reuse
     * @returns {boolean} True if at least one valid move exists
     */
    hasAvailableMoves() {
        const typeGrid = BoardLogic.gridToSnapshot(this.grid);
        return BoardLogic.hasAvailableMoves(typeGrid, this.size);
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
     * Uses requestAnimationFrame to prevent layout thrashing
     */
    resize() {
        // Use rAF to batch DOM updates and prevent layout thrashing
        requestAnimationFrame(() => {
            // Guard against destroyed board
            if (!this.element || !this.grid) return;

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
                    const gem = this.grid[row]?.[col];
                    if (gem?.element) {
                        gem.updatePosition(false);
                    }
                }
            }
        });
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
