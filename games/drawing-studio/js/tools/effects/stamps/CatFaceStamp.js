import { StampEffect } from '../StampEffect.js';

/**
 * Cat face stamp - using SVG image
 */
export class CatFaceStamp extends StampEffect {
    constructor() {
        super('catFace', 'Cat Face', '🐱', 'Super cute cat face', true);

        // Cat colors palette
        this.catColors = [
            '#FFB6C1', // Light pink
            '#FFD700', // Gold
            '#FFA07A', // Light salmon
            '#98D8C8', // Mint
            '#DDA0DD', // Plum
            '#F0E68C', // Khaki
            '#FFB347', // Orange
            '#87CEEB', // Sky blue
            '#FF69B4', // Hot pink
            '#FFE4B5'  // Moccasin
        ];

        // Load SVG image
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

            // Make white pixels transparent, keep black/dark pixels for coloring
            for (let i = 0; i < pixels.length; i += 4) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];

                // If pixel is white or very light (near white)
                if (r > 250 && g > 250 && b > 250) {
                    pixels[i + 3] = 0; // Make transparent
                }
                // Black/dark pixels will be kept and colorized later
            }

            // Store the processed image data
            this.baseImageData = imageData;
            this.imageWidth = canvas.width;
            this.imageHeight = canvas.height;
            this.imageReady = true;
            console.log('Cat stamp SVG processed and ready');
        };

        img.onerror = (e) => {
            console.error('Failed to load cat.svg:', e);
        };

        img.src = 'assets/icons/cat.svg';
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
                    baseG = 182;
                    baseB = 193;
                }

                // Generate random variation around the selected color (±60 variation)
                const variation = 60;
                r = Math.max(0, Math.min(255, baseR + (Math.random() - 0.5) * variation * 2));
                g = Math.max(0, Math.min(255, baseG + (Math.random() - 0.5) * variation * 2));
                b = Math.max(0, Math.min(255, baseB + (Math.random() - 0.5) * variation * 2));
            } else {
                // Default: use random color from palette
                const targetColor = this.catColors[Math.floor(Math.random() * this.catColors.length)];
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

            // Replace all non-transparent pixels with the target color (direct replacement, no brightness)
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] > 0) { // If not transparent
                    // Direct color replacement (SVG is all black outlines)
                    pixels[i] = r;       // Red
                    pixels[i + 1] = g;   // Green
                    pixels[i + 2] = b;   // Blue
                    // Keep original alpha
                }
            }

            // Put colored data to canvas
            tempCtx.putImageData(imageData, 0, 0);

            // Enable image smoothing on main context too
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw to main canvas
            ctx.drawImage(canvas, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
        } else {
            // Fallback while loading
            ctx.font = `${scale * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFB6C1';
            ctx.fillText('🐱', x, y);
        }

        ctx.restore();
    }
}
