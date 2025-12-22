/**
 * Dot - Grid Dot Entity
 * Minimal placeholder class
 *
 * Note: Dot objects are created as plain objects by GridGenerator.
 * This class exists for type consistency but actual dots are object literals
 * with properties set directly in GridGenerator.generateGrid().
 */

class Dot {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type; // 'start', 'end', 'normal'
        this.visited = false;
        this.neighbors = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dot;
}
