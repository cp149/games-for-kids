/**
 * ColorMixEngine - Dynamic RYB Color Mixing System
 * Uses RYB (Red-Yellow-Blue) subtractive color model for realistic paint mixing
 * 
 * This replaces the static lookup table with dynamic color calculation,
 * allowing infinite mixing combinations and chain mixing.
 */

export class ColorMixEngine {
    constructor() {
        // Primary colors in RYB space [R, Y, B] normalized 0-1
        this.PRIMARY_COLORS = {
            red:    { ryb: [1, 0, 0], name: 'red' },
            yellow: { ryb: [0, 1, 0], name: 'yellow' },
            blue:   { ryb: [0, 0, 1], name: 'blue' }
        };

        // Known color names for result identification
        // RYB values match normalized vector addition algorithm
        this.COLOR_NAMES = {
            // Primary
            'red':    { ryb: [1, 0, 0], hex: '#FF6B6B', emoji: '🔴' },
            'yellow': { ryb: [0, 1, 0], hex: '#FFE66D', emoji: '🟡' },
            'blue':   { ryb: [0, 0, 1], hex: '#448AFF', emoji: '🔵' },
            
            // Secondary (balanced 1:1, normalized)
            'orange': { ryb: [1, 1, 0], hex: '#FF8C00', emoji: '🟠' },
            'green':  { ryb: [0, 1, 1], hex: '#22C822', emoji: '🟢' },
            'purple': { ryb: [1, 0, 1], hex: '#A020F0', emoji: '🟣' },
            
            // Tertiary (2:1 ratio, normalized)
            'red-orange':    { ryb: [1, 0.5, 0], hex: '#FF4500', emoji: '🔶' },
            'yellow-orange': { ryb: [0.5, 1, 0], hex: '#FFAE42', emoji: '🔶' },
            'yellow-green':  { ryb: [0, 1, 0.5], hex: '#9ACD32', emoji: '🌿' },
            'blue-green':    { ryb: [0, 0.5, 1], hex: '#008B8B', emoji: '🌊' },
            'blue-purple':   { ryb: [0.5, 0, 1], hex: '#6A5ACD', emoji: '💜' },
            'red-purple':    { ryb: [1, 0, 0.5], hex: '#C71585', emoji: '💗' },
            
            // Mixed (all three primaries = brown/mud)
            'brown':  { ryb: [1, 1, 1], hex: '#8B6914', emoji: '🟤' },
            'mud':    { ryb: [1, 1, 1], hex: '#503C28', emoji: '💩' }
        };
    }

    /**
     * Get RYB values for a color (by name or hex)
     * @param {string|Object} color - Color name, hex, or {ryb: [...]} object
     * @returns {number[]} RYB array [r, y, b] normalized 0-1
     */
    getColorRYB(color) {
        // If already an RYB object
        if (color && color.ryb) {
            return [...color.ryb];
        }

        // If it's a known color name
        if (typeof color === 'string') {
            const known = this.COLOR_NAMES[color.toLowerCase()];
            if (known) {
                return [...known.ryb];
            }
        }

        // Default to neutral (will produce mud when mixed)
        return [0.33, 0.33, 0.33];
    }

    /**
     * Mix multiple colors together using RYB averaging
     * @param {Array} colors - Array of color names or RYB objects
     * @returns {Object} Mixed color result
     */
    mix(colors) {
        if (!colors || colors.length === 0) {
            return null;
        }

        // Single color = no mixing needed
        if (colors.length === 1) {
            const ryb = this.getColorRYB(colors[0]);
            return this.createColorResult(ryb, colors);
        }

        // Algorithm: Normalized Vector Addition
        // 1. Accumulate total pigment amounts
        let r = 0, y = 0, b = 0;
        for (const color of colors) {
            const ryb = this.getColorRYB(color);
            r += ryb[0];
            y += ryb[1];
            b += ryb[2];
        }

        // 2. Normalize by the maximum component
        // This preserves the HUE (ratio between pigments)
        // while keeping the resulting color vibrant (saturation).
        const max = Math.max(r, y, b);
        if (max > 0) {
            r /= max;
            y /= max;
            b /= max;
        }

        // Round to avoid floating point precision issues
        r = Math.round(r * 1000) / 1000;
        y = Math.round(y * 1000) / 1000;
        b = Math.round(b * 1000) / 1000;

        return this.createColorResult([r, y, b], colors);
    }

    /**
     * Create a color result object from RYB values
     * @param {number[]} ryb - RYB values [r, y, b]
     * @param {Array} inputColors - Original input colors
     * @returns {Object} Color result with name, hex, emoji, etc.
     */
    createColorResult(ryb, inputColors) {
        const colorInfo = this.identifyColor(ryb);
        const { name, type, emoji, isDynamic } = colorInfo;
        
        // Always calculate hex from RYB for accuracy
        const hex = this.rybToHex(ryb);

        return {
            result: name,
            type: type,
            resultHex: hex,
            emoji: emoji,
            ryb: ryb,
            inputColors: inputColors,
            isDynamic: isDynamic || false,
            // This result can be used for further mixing
            canMixFurther: true
        };
    }

    /**
     * Identify the closest named color for given RYB values
     * @param {number[]} ryb - RYB values
     * @returns {Object} { name, type, emoji }
     */
    identifyColor(ryb) {
        let closestName = null;
        let closestDistance = Infinity;

        // Check against all known colors
        for (const [name, colorData] of Object.entries(this.COLOR_NAMES)) {
            const distance = this.colorDistance(ryb, colorData.ryb);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestName = name;
            }
        }

        // If distance is too large, generate a dynamic color name
        // Lower threshold = more dynamic colors, higher = more named colors
        // 0.18 allows most secondary/tertiary to match, but rejects loose matches
        const MATCH_THRESHOLD = 0.25;
        if (closestDistance > MATCH_THRESHOLD) {
            // Generate descriptive name based on dominant components
            const name = this.generateDynamicColorName(ryb);
            return { 
                name: name, 
                type: 'mixed',  // New type for dynamic colors
                emoji: '🎨',
                isDynamic: true
            };
        }

        // Determine type based on matched name
        let type;
        if (['red', 'yellow', 'blue'].includes(closestName)) {
            type = 'primary';
        } else if (['orange', 'green', 'purple'].includes(closestName)) {
            type = 'secondary';
        } else if (['brown', 'mud'].includes(closestName)) {
            type = 'mixed';  // Changed from 'mud' to 'mixed'
        } else {
            type = 'tertiary';
        }

        const emoji = this.COLOR_NAMES[closestName]?.emoji || '🎨';

        return { name: closestName, type, emoji, isDynamic: false };
    }

    /**
     * Calculate distance between two RYB colors
     * @param {number[]} ryb1 
     * @param {number[]} ryb2 
     * @returns {number} Euclidean distance
     */
    colorDistance(ryb1, ryb2) {
        const dr = ryb1[0] - ryb2[0];
        const dy = ryb1[1] - ryb2[1];
        const db = ryb1[2] - ryb2[2];
        return Math.sqrt(dr * dr + dy * dy + db * db);
    }

    /**
     * Generate a descriptive name for dynamic/mixed colors
     * @param {number[]} ryb - RYB values [r, y, b]
     * @returns {string} A descriptive color name
     */
    generateDynamicColorName(ryb) {
        const [r, y, b] = ryb;
        const total = r + y + b;
        
        // If all components are similar, it's a neutral/gray tone
        const variance = Math.max(r, y, b) - Math.min(r, y, b);
        if (variance < 0.15) {
            return 'gray-tone';
        }
        
        // Find dominant and secondary components
        const components = [
            { name: 'red', value: r },
            { name: 'yellow', value: y },
            { name: 'blue', value: b }
        ].sort((a, b) => b.value - a.value);
        
        const dominant = components[0];
        const secondary = components[1];
        
        // Generate name based on dominant colors
        if (dominant.value > secondary.value * 1.5) {
            // Single dominant color with modifier
            return `${dominant.name}-tinted`;
        } else {
            // Two-color blend
            return `${dominant.name}-${secondary.name}-blend`;
        }
    }

    /**
     * Convert RYB to RGB hex color
     * Uses a simplified RYB→RGB conversion algorithm
     * @param {number[]} ryb - RYB values [r, y, b] normalized 0-1
     * @returns {string} Hex color string
     */
    rybToHex(ryb) {
        const rgb = this.rybToRgb(ryb);
        return this.rgbToHex(rgb);
    }

    /**
     * Convert RYB to RGB
     * Based on the Gosset and Chen RYB color wheel mapping
     * @param {number[]} ryb - [r, y, b] each 0-1
     * @returns {number[]} [r, g, b] each 0-255
     */
    rybToRgb(ryb) {
        const [r, y, b] = ryb;

        // Trilinear interpolation for RYB to RGB
        // Cube corners represent pure RYB combinations mapped to RGB
        const cubicInterpolate = (t, a, b) => a + t * (b - a);

        // RYB cube corners → RGB values
        // Format: RYB(r,y,b) → RGB(r,g,b)
        // Adjusted for more vibrant, child-friendly colors
        const white   = [255, 255, 255]; // RYB(0,0,0)
        const red     = [255, 50, 50];   // RYB(1,0,0) - vibrant red
        const yellow  = [255, 230, 0];   // RYB(0,1,0) - bright yellow
        const blue    = [50, 100, 255];  // RYB(0,0,1) - vibrant blue
        const orange  = [255, 140, 0];   // RYB(1,1,0) - bright orange
        const purple  = [160, 32, 240];  // RYB(1,0,1) - vibrant purple
        const green   = [34, 200, 34];   // RYB(0,1,1) - vibrant green (#22C822)
        const black   = [80, 60, 40];    // RYB(1,1,1) - brown

        // Interpolate along red axis
        const x0 = this.lerpColor(white, red, r);
        const x1 = this.lerpColor(yellow, orange, r);
        const x2 = this.lerpColor(blue, purple, r);
        const x3 = this.lerpColor(green, black, r);

        // Interpolate along yellow axis
        const y0 = this.lerpColor(x0, x1, y);
        const y1 = this.lerpColor(x2, x3, y);

        // Interpolate along blue axis
        const result = this.lerpColor(y0, y1, b);

        return result.map(v => Math.round(Math.max(0, Math.min(255, v))));
    }

    /**
     * Linear interpolation between two colors
     * @param {number[]} c1 - First color RGB
     * @param {number[]} c2 - Second color RGB
     * @param {number} t - Interpolation factor 0-1
     * @returns {number[]} Interpolated RGB
     */
    lerpColor(c1, c2, t) {
        return [
            c1[0] + t * (c2[0] - c1[0]),
            c1[1] + t * (c2[1] - c1[1]),
            c1[2] + t * (c2[2] - c1[2])
        ];
    }

    /**
     * Convert RGB array to hex string
     * @param {number[]} rgb - [r, g, b] each 0-255
     * @returns {string} Hex color string
     */
    rgbToHex(rgb) {
        const toHex = (n) => {
            const hex = Math.round(n).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`.toUpperCase();
    }

    /**
     * Check if a mixed color matches a target color
     * @param {Object} mixResult - Result from mix()
     * @param {string} targetColor - Target color name
     * @param {number} tolerance - How close is close enough (0-1)
     * @returns {boolean}
     */
    matchesTarget(mixResult, targetColor, tolerance = 0.2) {
        if (!mixResult || !mixResult.ryb) return false;

        const targetRYB = this.getColorRYB(targetColor);
        const distance = this.colorDistance(mixResult.ryb, targetRYB);

        return distance <= tolerance;
    }

    /**
     * Get hex color for a named color
     * @param {string} colorName 
     * @returns {string} Hex color
     */
    getHex(colorName) {
        const color = this.COLOR_NAMES[colorName];
        if (color) {
            return color.hex;
        }
        // Calculate from RYB if it's a known primary
        const primary = this.PRIMARY_COLORS[colorName];
        if (primary) {
            return this.rybToHex(primary.ryb);
        }
        return '#888888';
    }
}

// Dual export pattern
if (typeof window !== 'undefined') {
    window.ColorMixEngine = ColorMixEngine;
}

export default ColorMixEngine;
