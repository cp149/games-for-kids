import { StampEffect } from '../StampEffect.js';

/**
 * Chinese Lantern stamp - using PNG image
 */
export class LanternStamp extends StampEffect {
    constructor() {
        super('lantern', 'Lantern', '🏮', 'Chinese lantern', false);

        // Lantern colors palette - festive colors
        this.lanternColors = [
            '#FF0000', // Red
            '#FF1493', // Deep pink
            '#FF6B6B', // Coral red
            '#FFD700', // Gold
            '#FF8C00', // Dark orange
            '#FF4500', // Orange red
            '#DC143C', // Crimson
            '#FF69B4', // Hot pink
            '#FFA500', // Orange
            '#FF6347'  // Tomato
        ];

        // Load PNG image
        this.baseImageData = null;
        this.imageReady = false;

        const img = new Image();

        img.onload = () => {
            // Process the image to make white transparent and store base image data
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // Make white and near-white pixels transparent
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // If pixel is white or very light (near white)
                if (r > 250 && g > 250 && b > 250) {
                    pixels[i + 3] = 0; // Make transparent
                }
            }

            // Store the processed image data
            this.baseImageData = imageData;
            this.imageWidth = canvas.width;
            this.imageHeight = canvas.height;
            this.imageReady = true;
            console.log('Lantern stamp PNG processed and ready');
        };

        img.onerror = (e) => {
            console.error('Failed to load dl.png:', e);
        };

        img.src = 'assets/icons/dl.png';
    }

    draw(ctx, x, y, size, color) {
        ctx.save();

        const scale = size * 2;
        const imgSize = scale * 1.6;

        if (this.imageReady && this.baseImageData) {
            let r, g, b;

            // If color is provided, use it as base for random variation
            if (color && color !== '#000000') {
                let baseR, baseG, baseB;

                // Parse the selected color
                if (color.startsWith('#')) {
                    baseR = parseInt(color.substr(1, 2), 16);
                    baseG = parseInt(color.substr(3, 2), 16);
                    baseB = parseInt(color.substr(5, 2), 16);
                } else if (color.startsWith('rgb')) {
                    const matches = color.match(/\d+/g);
                    baseR = parseInt(matches[0]);
                    baseG = parseInt(matches[1]);
                    baseB = parseInt(matches[2]);
                } else {
                    baseR = 255;
                    baseG = 0;
                    baseB = 0;
                }

                // Generate random variation around the selected color (±60 variation)
                const variation = 60;
                r = Math.max(0, Math.min(255, baseR + (Math.random() - 0.5) * variation * 2));
                g = Math.max(0, Math.min(255, baseG + (Math.random() - 0.5) * variation * 2));
                b = Math.max(0, Math.min(255, baseB + (Math.random() - 0.5) * variation * 2));
            } else {
                // Default: use random color from palette
                const targetColor = this.lanternColors[Math.floor(Math.random() * this.lanternColors.length)];
                r = parseInt(targetColor.substr(1, 2), 16);
                g = parseInt(targetColor.substr(3, 2), 16);
                b = parseInt(targetColor.substr(5, 2), 16);
            }

            // Create a new canvas for this colored version
            const canvas = document.createElement('canvas');
            canvas.width = this.imageWidth;
            canvas.height = this.imageHeight;
            const tempCtx = canvas.getContext('2d');

            // Enable image smoothing for better quality
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';

            // Clone the base image data
            const imageData = tempCtx.createImageData(this.imageWidth, this.imageHeight);
            imageData.data.set(this.baseImageData.data);

            const pixels = imageData.data;

            // Convert RGB to HSL for better color manipulation
            function rgbToHsl(r, g, b) {
                r /= 255; g /= 255; b /= 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;

                if (max === min) {
                    h = s = 0;
                } else {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                        case g: h = ((b - r) / d + 2) / 6; break;
                        case b: h = ((r - g) / d + 4) / 6; break;
                    }
                }
                return [h * 360, s * 100, l * 100];
            }

            function hslToRgb(h, s, l) {
                h /= 360; s /= 100; l /= 100;
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
                return [r * 255, g * 255, b * 255];
            }

            // Get target HSL for decorations coordination
            const [targetH, targetS, targetL] = rgbToHsl(r, g, b);

            // Replace colors with coordinated variations
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] > 0) { // If not transparent
                    const origR = pixels[i];
                    const origG = pixels[i + 1];
                    const origB = pixels[i + 2];

                    // Check if this is a black/dark pixel (outlines, tassels)
                    const isDark = origR < 50 && origG < 50 && origB < 50;

                    // Check if this is a golden decoration (yellow/gold tones)
                    const isGold = origR > 200 && origG > 180 && origB < 100;

                    if (!isDark && !isGold) {
                        // Get original HSL
                        const [origH, origS, origL] = rgbToHsl(origR, origG, origB);

                        // Check if this is a decoration/pattern (highly saturated different color)
                        const isDecoration = origS > 40 && Math.abs(origH - targetH) > 30;

                        let newR, newG, newB;

                        if (isDecoration) {
                            // Decorations: shift hue to coordinate with main color
                            const hueShift = 40; // Complementary color shift
                            const newH = (targetH + hueShift) % 360;
                            [newR, newG, newB] = hslToRgb(newH, Math.max(origS, 60), origL);
                        } else {
                            // Main lantern body: use target color with original brightness
                            const brightness = (origR + origG + origB) / (3 * 255);
                            newR = Math.min(255, r * brightness * 1.2);
                            newG = Math.min(255, g * brightness * 1.2);
                            newB = Math.min(255, b * brightness * 1.2);
                        }

                        pixels[i] = newR;
                        pixels[i + 1] = newG;
                        pixels[i + 2] = newB;
                    }
                    // Keep dark outlines and gold decorations unchanged
                }
            }

            // Put colored data to canvas
            tempCtx.putImageData(imageData, 0, 0);

            // Enable image smoothing on main context too
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw to main canvas (no flip)
            ctx.drawImage(canvas, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
        } else {
            // Fallback while loading
            ctx.font = `${scale * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FF0000';
            ctx.fillText('🏮', x, y);
        }

        ctx.restore();
    }
}
