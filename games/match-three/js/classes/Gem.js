/**
 * Gem - Individual game piece
 * Represents a single gem with type, position, and visual state
 */

class Gem {
    constructor(type, row, col) {
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
        this.config = CONFIG.GEM.FRUITS[type];

        this.createDOMElement();
    }

    /**
     * Create the visual DOM element for this gem
     * Optimized: Uses CSS variables for sizing (no inline width/height/fontSize/borderRadius)
     */
    createDOMElement() {
        const gem = document.createElement('div');
        gem.className = 'gem';
        gem.dataset.type = this.type;
        gem.dataset.row = this.row;
        gem.dataset.col = this.col;

        // Only set gem-specific styles (color varies per type)
        // Size/fontSize/borderRadius are handled by CSS variables
        gem.style.backgroundColor = this.config.color;
        gem.style.border = `${CONFIG.GEM.BORDER_WIDTH}px solid ${CONFIG.GEM.BORDER_COLOR}`;

        // Set glow color CSS variable for animations
        gem.style.setProperty('--gem-glow-color', this.config.color);

        // Add fruit emoji
        gem.textContent = this.config.emoji;

        this.element = gem;
        this.updatePosition();
    }

    /**
     * Update gem's grid position
     */
    updatePosition(animate = false) {
        if (!this.element) return;

        const cellSize = this.getCellSize();
        const padding = CONFIG.BOARD.GEM_PADDING / 2;
        const x = this.col * cellSize + padding;
        const y = this.row * cellSize + padding;

        if (animate) {
            this.element.style.transition = `transform ${CONFIG.GAME.TIMING.FALL_DURATION}ms ${CONFIG.BOARD.FALL_EASING}`;
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
        const padding = CONFIG.BOARD.GEM_PADDING / 2;
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
            this.element.style.transform = `${this.getBaseTransform()} scale(${CONFIG.GEM.SELECTED_SCALE})`;
            this.element.style.boxShadow = `0 0 20px ${CONFIG.GEM.GLOW_COLOR}`;
        } else {
            this.element.classList.remove('selected');
            this.updatePosition(false);
            this.element.style.boxShadow = CONFIG.GEM.SHADOW;
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
        this.element.style.transition = `all ${CONFIG.GAME.TIMING.MATCH_DURATION}ms ${CONFIG.BOARD.MATCH_EASING}`;
        this.element.style.transform = `${this.getBaseTransform()} scale(${CONFIG.GEM.MATCH_SCALE})`;
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
        this.config = null;
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
}
