/**
 * Color Utilities for KAPLAY games
 * Color conversion and manipulation functions
 */

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {number[]} [r, g, b] where each value is 0-255
 */
export function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number[]} [h, s, l] where each value is 0-1
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Interpolate between two colors
 * @param {number[]} color1 - [r, g, b]
 * @param {number[]} color2 - [r, g, b]
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number[]} Interpolated color [r, g, b]
 */
export function interpolateColor(color1, color2, t) {
    return [
        Math.round(color1[0] + (color2[0] - color1[0]) * t),
        Math.round(color1[1] + (color2[1] - color1[1]) * t),
        Math.round(color1[2] + (color2[2] - color1[2]) * t)
    ];
}

/**
 * Generate rainbow color for given angle
 * @param {number} angle - Angle in degrees (0-360)
 * @param {number} saturation - Saturation (0-1), default 1
 * @param {number} lightness - Lightness (0-1), default 0.5
 * @returns {number[]} RGB color [r, g, b]
 */
export function rainbowColor(angle, saturation = 1, lightness = 0.5) {
    return hslToRgb((angle % 360) / 360, saturation, lightness);
}

/**
 * Darken a color
 * @param {number[]} color - [r, g, b]
 * @param {number} amount - Amount to darken (0-1)
 * @returns {number[]} Darkened color
 */
export function darkenColor(color, amount) {
    return color.map(c => Math.round(c * (1 - amount)));
}

/**
 * Lighten a color
 * @param {number[]} color - [r, g, b]
 * @param {number} amount - Amount to lighten (0-1)
 * @returns {number[]} Lightened color
 */
export function lightenColor(color, amount) {
    return color.map(c => Math.round(c + (255 - c) * amount));
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code (e.g., "#FF5733" or "FF5733")
 * @returns {number[]} [r, g, b]
 */
export function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    return [
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16)
    ];
}

/**
 * Convert RGB to hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color code (e.g., "#FF5733")
 */
export function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(c => {
        const hex = Math.round(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join('');
}
