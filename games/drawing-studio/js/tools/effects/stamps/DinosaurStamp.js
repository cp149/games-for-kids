import { StampEffect } from '../StampEffect.js';

/**
 * Dinosaur stamp - using PNG image
 */
export class DinosaurStamp extends StampEffect {
    constructor() {
        super('dinosaur', 'Dinosaur', '🦖', 'Cute dinosaur', true);

        // Dinosaur colors palette
        this.dinoColors = [
            '#90EE90', // Light green
            '#98D8C8', // Mint
            '#77DD77', // Pastel green
            '#B2D8B2', // Light moss
            '#87CEEB', // Sky blue
            '#DDA0DD', // Plum
            '#F0E68C', // Khaki
            '#FFB347', // Orange
            '#FF6B6B', // Coral
            '#BA55D3'  // Orchid
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
            console.log('Dinosaur stamp PNG processed and ready');
        };

        img.onerror = (e) => {
            console.error('Failed to load dino.png:', e);
        };

        img.src = 'assets/icons/dino.png';
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
                    baseR = 144;
                    baseG = 238;
                    baseB = 144;
                }

                // Generate random variation around the selected color (±60 variation)
                const variation = 60;
                r = Math.max(0, Math.min(255, baseR + (Math.random() - 0.5) * variation * 2));
                g = Math.max(0, Math.min(255, baseG + (Math.random() - 0.5) * variation * 2));
                b = Math.max(0, Math.min(255, baseB + (Math.random() - 0.5) * variation * 2));
            } else {
                // Default: use random color from palette
                const targetColor = this.dinoColors[Math.floor(Math.random() * this.dinoColors.length)];
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

            // Replace only dinosaur body colors (greenish/colorful parts), preserve black details
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] > 0) { // If not transparent
                    const origR = pixels[i];
                    const origG = pixels[i + 1];
                    const origB = pixels[i + 2];

                    // Check if this is a body color (not black details like eyes, mouth)
                    // Black/dark pixels: keep unchanged for details
                    const isDark = origR < 50 && origG < 50 && origB < 50;

                    if (!isDark) {
                        // Calculate brightness to preserve shading
                        const brightness = (origR + origG + origB) / (3 * 255);

                        // Apply target color with original brightness
                        pixels[i] = Math.min(255, r * brightness * 1.2);
                        pixels[i + 1] = Math.min(255, g * brightness * 1.2);
                        pixels[i + 2] = Math.min(255, b * brightness * 1.2);
                    }
                    // Keep dark pixels (eyes, mouth, outlines) unchanged
                }
            }

            // Put colored data to canvas
            tempCtx.putImageData(imageData, 0, 0);

            // Enable image smoothing on main context too
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Random horizontal flip (50% chance)
            const flipHorizontal = Math.random() > 0.5;

            if (flipHorizontal) {
                ctx.save();
                ctx.translate(x, y);
                ctx.scale(-1, 1);
                ctx.drawImage(canvas, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
                ctx.restore();
            } else {
                // Draw to main canvas normally
                ctx.drawImage(canvas, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
            }
        } else {
            // Fallback while loading
            ctx.font = `${scale * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#90EE90';
            ctx.fillText('🦖', x, y);
        }

        ctx.restore();
    }
}
