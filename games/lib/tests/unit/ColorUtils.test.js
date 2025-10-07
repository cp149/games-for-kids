/**
 * Unit tests for ColorUtils
 *
 * Run with: npm test
 */

import { describe, test, expect } from 'vitest';
import {
    hslToRgb,
    rgbToHsl,
    interpolateColor,
    rainbowColor,
    darkenColor,
    lightenColor,
    hexToRgb,
    rgbToHex
} from '../../utils/ColorUtils.js';

describe('ColorUtils', () => {
    describe('hslToRgb', () => {
        test('converts red correctly', () => {
            const [r, g, b] = hslToRgb(0, 1, 0.5);
            expect(r).toBe(255);
            expect(g).toBe(0);
            expect(b).toBe(0);
        });

        test('converts green correctly', () => {
            const [r, g, b] = hslToRgb(1/3, 1, 0.5);
            expect(r).toBe(0);
            expect(g).toBe(255);
            expect(b).toBe(0);
        });

        test('converts blue correctly', () => {
            const [r, g, b] = hslToRgb(2/3, 1, 0.5);
            expect(r).toBe(0);
            expect(g).toBe(0);
            expect(b).toBe(255);
        });

        test('handles grayscale (s=0)', () => {
            const [r, g, b] = hslToRgb(0, 0, 0.5);
            expect(r).toBe(128);
            expect(g).toBe(128);
            expect(b).toBe(128);
        });
    });

    describe('rgbToHsl', () => {
        test('converts red correctly', () => {
            const [h, s, l] = rgbToHsl(255, 0, 0);
            expect(h).toBeCloseTo(0, 1);
            expect(s).toBe(1);
            expect(l).toBe(0.5);
        });

        test('converts grayscale correctly', () => {
            const [h, s, l] = rgbToHsl(128, 128, 128);
            expect(s).toBe(0);
            expect(l).toBeCloseTo(0.5, 1);
        });
    });

    describe('interpolateColor', () => {
        test('returns first color at t=0', () => {
            const result = interpolateColor([255, 0, 0], [0, 0, 255], 0);
            expect(result).toEqual([255, 0, 0]);
        });

        test('returns second color at t=1', () => {
            const result = interpolateColor([255, 0, 0], [0, 0, 255], 1);
            expect(result).toEqual([0, 0, 255]);
        });

        test('returns midpoint at t=0.5', () => {
            const result = interpolateColor([255, 0, 0], [0, 0, 255], 0.5);
            expect(result).toEqual([128, 0, 128]);
        });
    });

    describe('rainbowColor', () => {
        test('generates different colors for different angles', () => {
            const color1 = rainbowColor(0);
            const color2 = rainbowColor(120);
            const color3 = rainbowColor(240);

            expect(color1).not.toEqual(color2);
            expect(color2).not.toEqual(color3);
            expect(color3).not.toEqual(color1);
        });

        test('wraps angles > 360', () => {
            const color1 = rainbowColor(0);
            const color2 = rainbowColor(360);
            expect(color1).toEqual(color2);
        });

        test('accepts custom saturation and lightness', () => {
            const color = rainbowColor(0, 0.5, 0.3);
            expect(color).toBeDefined();
            expect(Array.isArray(color)).toBe(true);
            expect(color.length).toBe(3);
        });
    });

    describe('darkenColor', () => {
        test('darkens color by specified amount', () => {
            const original = [255, 100, 50];
            const darkened = darkenColor(original, 0.5);

            expect(darkened[0]).toBeLessThan(original[0]);
            expect(darkened[1]).toBeLessThan(original[1]);
            expect(darkened[2]).toBeLessThan(original[2]);
        });

        test('amount=0 returns same color', () => {
            const original = [255, 100, 50];
            const result = darkenColor(original, 0);
            expect(result).toEqual(original);
        });

        test('amount=1 returns black', () => {
            const original = [255, 100, 50];
            const result = darkenColor(original, 1);
            expect(result).toEqual([0, 0, 0]);
        });
    });

    describe('lightenColor', () => {
        test('lightens color by specified amount', () => {
            const original = [100, 50, 25];
            const lightened = lightenColor(original, 0.5);

            expect(lightened[0]).toBeGreaterThan(original[0]);
            expect(lightened[1]).toBeGreaterThan(original[1]);
            expect(lightened[2]).toBeGreaterThan(original[2]);
        });

        test('amount=0 returns same color', () => {
            const original = [100, 50, 25];
            const result = lightenColor(original, 0);
            expect(result).toEqual(original);
        });

        test('amount=1 returns white', () => {
            const original = [100, 50, 25];
            const result = lightenColor(original, 1);
            expect(result).toEqual([255, 255, 255]);
        });
    });

    describe('hexToRgb', () => {
        test('converts hex with # prefix', () => {
            const result = hexToRgb('#FF5733');
            expect(result).toEqual([255, 87, 51]);
        });

        test('converts hex without # prefix', () => {
            const result = hexToRgb('FF5733');
            expect(result).toEqual([255, 87, 51]);
        });

        test('handles lowercase hex', () => {
            const result = hexToRgb('#ff5733');
            expect(result).toEqual([255, 87, 51]);
        });
    });

    describe('rgbToHex', () => {
        test('converts RGB to hex correctly', () => {
            const result = rgbToHex(255, 87, 51);
            expect(result).toBe('#ff5733');
        });

        test('pads single digit values', () => {
            const result = rgbToHex(15, 5, 0);
            expect(result).toBe('#0f0500');
        });

        test('handles max values', () => {
            const result = rgbToHex(255, 255, 255);
            expect(result).toBe('#ffffff');
        });

        test('handles min values', () => {
            const result = rgbToHex(0, 0, 0);
            expect(result).toBe('#000000');
        });
    });

    describe('Round-trip conversions', () => {
        test('RGB -> Hex -> RGB', () => {
            const original = [255, 87, 51];
            const hex = rgbToHex(...original);
            const result = hexToRgb(hex);
            expect(result).toEqual(original);
        });

        test('HSL -> RGB -> HSL', () => {
            const [h, s, l] = [0.5, 1, 0.5];
            const rgb = hslToRgb(h, s, l);
            const [h2, s2, l2] = rgbToHsl(...rgb);

            expect(h2).toBeCloseTo(h, 1);
            expect(s2).toBeCloseTo(s, 1);
            expect(l2).toBeCloseTo(l, 1);
        });
    });
});
