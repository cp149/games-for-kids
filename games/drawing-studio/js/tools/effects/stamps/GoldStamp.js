import { StampEffect } from '../StampEffect.js';

/**
 * Gold stamp - Chinese gold ingot (元宝)
 */
export class GoldStamp extends StampEffect {
    constructor() {
        super('gold', 'Gold', '💰', 'Chinese gold ingot', false);

        // Gold colors
        this.goldColors = [
            '#FFD700', // Gold
            '#FFA500', // Orange
            '#FF8C00', // Dark orange
            '#FFE4B5', // Moccasin
            '#F0E68C', // Khaki
            '#DAA520', // Goldenrod
            '#B8860B', // Dark goldenrod
            '#FF6347', // Tomato (reddish gold)
            '#FFA07A', // Light salmon
            '#FFDB58'  // Mustard
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
            console.log('Gold stamp PNG processed and ready');
        };

        img.onerror = (e) => {
            console.error('Failed to load gold.png:', e);
        };

        img.src = 'assets/icons/gold.png';
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;
        const imgSize = scale * 1.6;

        if (this.imageReady && this.baseImageData) {
            // Pick a random color
            const targetColor = this.goldColors[Math.floor(Math.random() * this.goldColors.length)];
            const r = parseInt(targetColor.substr(1, 2), 16);
            const g = parseInt(targetColor.substr(3, 2), 16);
            const b = parseInt(targetColor.substr(5, 2), 16);

            // Create a new canvas for this colored version
            const canvas = document.createElement('canvas');
            canvas.width = this.imageWidth;
            canvas.height = this.imageHeight;
            const tempCtx = canvas.getContext('2d');

            // Clone the base image data
            const imageData = tempCtx.createImageData(this.imageWidth, this.imageHeight);
            imageData.data.set(this.baseImageData.data);

            const pixels = imageData.data;

            // Replace all non-transparent pixels with the target color
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i + 3] > 0) { // If not transparent
                    pixels[i] = r;       // Red
                    pixels[i + 1] = g;   // Green
                    pixels[i + 2] = b;   // Blue
                    // Keep original alpha
                }
            }

            // Put colored data to canvas
            tempCtx.putImageData(imageData, 0, 0);

            // Draw to main canvas
            ctx.drawImage(canvas, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
        } else {
            // Fallback while loading
            ctx.font = `${scale * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('💰', x, y);
        }

        ctx.restore();
    }
}
