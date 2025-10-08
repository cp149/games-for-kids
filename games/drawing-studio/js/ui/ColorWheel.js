/**
 * Color Wheel - Interactive HSL color picker
 */

export class ColorWheel {
    constructor(size = 150) {
        this.size = size;
        this.canvas = null;
        this.ctx = null;
        this.selectedColor = '#FF6B6B';
        this.onColorChange = null;
        this.isDragging = false;
    }

    /**
     * Create color wheel element
     */
    create() {
        const container = document.createElement('div');
        container.className = 'color-wheel-container';

        // Create canvas for color wheel
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.className = 'color-wheel-canvas';

        this.ctx = this.canvas.getContext('2d');

        // Draw the wheel
        this.drawWheel();

        // Add event listeners
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleEnd());
        this.canvas.addEventListener('mouseleave', () => this.handleEnd());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.handleEnd());

        container.appendChild(this.canvas);

        return container;
    }

    /**
     * Create grayscale slider
     */
    createGrayscaleSlider() {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'grayscale-slider-container';

        const sliderLabel = document.createElement('div');
        sliderLabel.className = 'grayscale-label';
        sliderLabel.textContent = 'Grayscale';

        this.grayscaleSlider = document.createElement('input');
        this.grayscaleSlider.type = 'range';
        this.grayscaleSlider.min = '0';
        this.grayscaleSlider.max = '100';
        this.grayscaleSlider.value = '50';
        this.grayscaleSlider.className = 'grayscale-slider';

        this.grayscaleSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            // Convert to grayscale: 0 = black, 50 = gray, 100 = white
            const gray = Math.round(value * 2.55);
            const color = `#${this.componentToHex(gray)}${this.componentToHex(gray)}${this.componentToHex(gray)}`;
            this.selectedColor = color;
            if (this.onColorChange) {
                this.onColorChange(color);
            }
        });

        sliderContainer.appendChild(sliderLabel);
        sliderContainer.appendChild(this.grayscaleSlider);

        return sliderContainer;
    }

    /**
     * Draw the color wheel
     */
    drawWheel() {
        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const radius = this.size / 2 - 5;

        // Draw color wheel using HSL
        for (let angle = 0; angle < 360; angle += 1) {
            const startAngle = (angle - 90) * Math.PI / 180;
            const endAngle = (angle + 1 - 90) * Math.PI / 180;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();

            // Create gradient from center (white) to edge (saturated color)
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, radius
            );

            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.7, `hsl(${angle}, 100%, 50%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, 40%)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // Draw center white circle for lighter colors
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
    }

    /**
     * Handle interaction start
     */
    handleStart(e) {
        this.isDragging = true;
        this.pickColor(e);
    }

    /**
     * Handle interaction move
     */
    handleMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.pickColor(e);
    }

    /**
     * Handle interaction end
     */
    handleEnd() {
        this.isDragging = false;
    }

    /**
     * Pick color from wheel
     */
    pickColor(e) {
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        let x, y;

        if (e.type.startsWith('touch')) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        // Scale to canvas coordinates
        x = x * this.canvas.width / rect.width;
        y = y * this.canvas.height / rect.height;

        const centerX = this.size / 2;
        const centerY = this.size / 2;
        const radius = this.size / 2 - 5;

        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only pick if within wheel
        if (distance > radius) return;

        // Calculate angle (hue)
        let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        if (angle < 0) angle += 360;

        // Calculate saturation and lightness based on distance from center
        const saturation = Math.min(100, (distance / radius) * 100);
        const lightness = 50 + (1 - distance / radius) * 30; // Lighter near center

        // Convert HSL to hex
        const color = this.hslToHex(angle, saturation, lightness);

        this.selectedColor = color;

        if (this.onColorChange) {
            this.onColorChange(color);
        }
    }

    /**
     * Convert HSL to Hex
     */
    hslToHex(h, s, l) {
        s = s / 100;
        l = l / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;

        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) {
            r = c; g = x; b = 0;
        } else if (h >= 60 && h < 120) {
            r = x; g = c; b = 0;
        } else if (h >= 120 && h < 180) {
            r = 0; g = c; b = x;
        } else if (h >= 180 && h < 240) {
            r = 0; g = x; b = c;
        } else if (h >= 240 && h < 300) {
            r = x; g = 0; b = c;
        } else if (h >= 300 && h < 360) {
            r = c; g = 0; b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    /**
     * Convert RGB component to hex
     */
    componentToHex(c) {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    /**
     * Set color change callback
     */
    onChange(callback) {
        this.onColorChange = callback;
    }

    /**
     * Generate random color
     */
    getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
        const lightness = 45 + Math.floor(Math.random() * 20);  // 45-65%

        return this.hslToHex(hue, saturation, lightness);
    }

    /**
     * Clean up resources and event listeners
     */
    destroy() {
        if (this.canvas) {
            // Remove event listeners
            this.canvas.removeEventListener('mousedown', this.handleStart);
            this.canvas.removeEventListener('mousemove', this.handleMove);
            this.canvas.removeEventListener('mouseup', this.handleEnd);
            this.canvas.removeEventListener('mouseleave', this.handleEnd);
            this.canvas.removeEventListener('touchstart', this.handleStart);
            this.canvas.removeEventListener('touchmove', this.handleMove);
            this.canvas.removeEventListener('touchend', this.handleEnd);
        }

        // Clear references
        this.canvas = null;
        this.ctx = null;
        this.onColorChange = null;
        
        console.log('ColorWheel destroyed and cleaned up');
    }
}
