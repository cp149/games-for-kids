/**
 * Base class for all magic effects
 */
export class MagicEffect {
    constructor(id, name, icon, description) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
    }

    /**
     * Get effect information for UI
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            description: this.description
        };
    }

    /**
     * Draw the effect at a specific position
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} size - Effect size
     * @param {string} color - Current brush color (optional)
     */
    draw(ctx, x, y, size, color) {
        throw new Error('draw() must be implemented by subclass');
    }

    /**
     * Get spacing multiplier for this effect
     * Used to control density when drawing
     */
    getSpacingMultiplier() {
        return 0.3; // Default for continuous effects
    }

    /**
     * Check if this is a stamp type effect
     */
    isStamp() {
        return false;
    }
}
