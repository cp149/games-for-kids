/**
 * Gem - Individual game piece
 * Represents a single gem with type, position, and visual state
 *
 * Supports dependency injection for testability:
 * - config: Configuration object (default: CONFIG)
 * - doc: Document object (default: window.document)
 * - autoInit: Whether to auto-create DOM (default: true)
 */

class Gem {
    /**
     * @param {number} type - Gem type (0-5)
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {Object} [options] - Optional dependencies for testing
     * @param {Object} [options.config] - Configuration object
     * @param {Document} [options.doc] - Document object
     * @param {boolean} [options.autoInit] - Auto-create DOM element (default: true)
     */
    constructor(type, row, col, options = {}) {
        // Dependency injection with defaults
        this._config = options.config || CONFIG;
        this._doc = options.doc || (typeof document !== 'undefined' ? document : null);

        this.type = type; // 0-5 for different gem types
        this.row = row;
        this.col = col;
        this.element = null;
        this.isMatched = false;
        this.isSelected = false;
        this.isFalling = false;

        // Transform cache for performance optimization
        this._cachedTransform = null;
        this._cachedRow = null;
        this._cachedCol = null;
        this._cachedCellSize = null;

        // Get fruit configuration
        this.fruitConfig = this._config.GEM.FRUITS[type];

        // Auto-create DOM unless disabled (for testing)
        if (options.autoInit !== false) {
            this.createDOMElement();
        }
    }

    /**
     * Create the visual DOM element for this gem
     * Optimized: Uses CSS variables for sizing (no inline width/height/fontSize/borderRadius)
     */
    createDOMElement() {
        const gem = this._doc.createElement('div');
        gem.className = 'gem';
        gem.dataset.type = this.type;
        gem.dataset.row = this.row;
        gem.dataset.col = this.col;

        // Only set gem-specific styles (color varies per type)
        // Size/fontSize/borderRadius are handled by CSS variables
        gem.style.backgroundColor = this.fruitConfig.color;
        gem.style.border = `${this._config.GEM.BORDER_WIDTH}px solid ${this._config.GEM.BORDER_COLOR}`;

        // Set glow color CSS variable for animations
        gem.style.setProperty('--gem-glow-color', this.fruitConfig.color);

        // Add fruit emoji
        gem.textContent = this.fruitConfig.emoji;

        this.element = gem;
        this.updatePosition();
    }

    /**
     * Update gem's grid position
     */
    updatePosition(animate = false) {
        if (!this.element) return;

        const cellSize = this.getCellSize();
        const padding = this._config.BOARD.GEM_PADDING / 2;
        const x = this.col * cellSize + padding;
        const y = this.row * cellSize + padding;

        if (animate) {
            this.element.style.transition = `transform ${this._config.GAME.TIMING.FALL_DURATION}ms ${this._config.BOARD.FALL_EASING}`;
        } else {
            this.element.style.transition = 'none';
        }

        this.element.style.transform = `translate(${x}px, ${y}px)`;
        this.element.dataset.row = this.row;
        this.element.dataset.col = this.col;
    }

    /**
     * Get cell size based on current viewport - uses shared utility
     */
    getCellSize() {
        return Utils.getCellSize();
    }

    /**
     * Move gem to new position
     */
    moveTo(row, col, animate = true) {
        this.row = row;
        this.col = col;
        this.updatePosition(animate);
    }

    /**
     * Get base transform for current position (cached for performance)
     * Cache is invalidated when row, col, or cellSize changes
     * @returns {string} CSS transform string
     */
    getBaseTransform() {
        const cellSize = this.getCellSize();

        // Check if cache is valid
        if (this._cachedTransform !== null &&
            this._cachedRow === this.row &&
            this._cachedCol === this.col &&
            this._cachedCellSize === cellSize) {
            return this._cachedTransform;
        }

        // Calculate and cache
        const padding = this._config.BOARD.GEM_PADDING / 2;
        const x = this.col * cellSize + padding;
        const y = this.row * cellSize + padding;

        this._cachedTransform = `translate(${x}px, ${y}px)`;
        this._cachedRow = this.row;
        this._cachedCol = this.col;
        this._cachedCellSize = cellSize;

        return this._cachedTransform;
    }

    /**
     * Invalidate transform cache (call after position or size changes)
     */
    invalidateCache() {
        this._cachedTransform = null;
    }

    /**
     * Set selected state with visual feedback
     */
    setSelected(selected) {
        this.isSelected = selected;
        if (!this.element) return;

        if (selected) {
            this.element.classList.add('selected');
            // Build complete transform with scale (don't append)
            this.element.style.transform = `${this.getBaseTransform()} scale(${this._config.GEM.SELECTED_SCALE})`;
            this.element.style.boxShadow = `0 0 20px ${this._config.GEM.GLOW_COLOR}`;
        } else {
            this.element.classList.remove('selected');
            this.updatePosition(false);
            this.element.style.boxShadow = this._config.GEM.SHADOW;
        }
    }

    /**
     * Mark gem as matched with animation
     */
    markAsMatched() {
        this.isMatched = true;
        if (!this.element) return;

        this.element.classList.add('matched');
        // Scale up then fade out - build complete transform (don't append)
        this.element.style.transition = `all ${this._config.GAME.TIMING.MATCH_DURATION}ms ${this._config.BOARD.MATCH_EASING}`;
        this.element.style.transform = `${this.getBaseTransform()} scale(${this._config.GEM.MATCH_SCALE})`;
        this.element.style.opacity = '0';
    }

    /**
     * Remove gem from DOM
     */
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.remove();
        }
        this.element = null;
    }

    /**
     * Get DOM element
     */
    getElement() {
        return this.element;
    }

    /**
     * Check if gem is at specific position
     */
    isAt(row, col) {
        return this.row === row && this.col === col;
    }

    /**
     * Get gem type
     */
    getType() {
        return this.type;
    }

    /**
     * Get position as object
     */
    getPosition() {
        return { row: this.row, col: this.col };
    }

    /**
     * Check if adjacent to another gem
     */
    isAdjacentTo(otherGem) {
        const rowDiff = Math.abs(this.row - otherGem.row);
        const colDiff = Math.abs(this.col - otherGem.col);

        // Adjacent if exactly one cell away in one direction
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Remove from DOM
        this.remove();

        // Clear all references
        this.element = null;
        this.fruitConfig = null;
        this._config = null;
        this._doc = null;
        this.type = null;
        this.row = null;
        this.col = null;
        this.isMatched = false;
        this.isSelected = false;
        this.isFalling = false;

        // Clear cache
        this._cachedTransform = null;
        this._cachedRow = null;
        this._cachedCol = null;
        this._cachedCellSize = null;
    }

    // ==================== Test Hooks ====================

    /**
     * Get gem state snapshot (for testing)
     * @returns {Object}
     */
    _getSnapshot() {
        return {
            type: this.type,
            row: this.row,
            col: this.col,
            isMatched: this.isMatched,
            isSelected: this.isSelected,
            isFalling: this.isFalling
        };
    }

    /**
     * Create a minimal gem for testing (no DOM)
     * @param {number} type
     * @param {number} row
     * @param {number} col
     * @returns {Gem}
     */
    static createForTest(type, row, col) {
        return new Gem(type, row, col, { autoInit: false });
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gem;
}
