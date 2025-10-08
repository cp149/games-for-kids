/**
 * Symmetry Manager - Handle symmetrical drawing modes
 */

export class SymmetryManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.enabled = false;
        this.mode = 'none'; // none, horizontal, vertical
        this.showGuides = true;
    }

    /**
     * Enable symmetry mode
     */
    enable(mode = 'horizontal') {
        this.enabled = true;
        this.mode = mode;
    }

    /**
     * Disable symmetry
     */
    disable() {
        this.enabled = false;
        this.mode = 'none';
        console.log('Symmetry disabled');
    }

    /**
     * Toggle symmetry mode
     */
    toggle(mode) {
        if (this.enabled && this.mode === mode) {
            this.disable();
        } else {
            this.enable(mode);
        }
    }

    /**
     * Get symmetrical points based on current mode
     */
    getSymmetricalPoints(x, y) {
        if (!this.enabled) {
            return [{ x, y }];
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const points = [{ x, y }];

        switch (this.mode) {
            case 'horizontal':
                // Left-right mirror
                points.push({
                    x: centerX * 2 - x,
                    y: y
                });
                break;

            case 'vertical':
                // Top-bottom mirror
                points.push({
                    x: x,
                    y: centerY * 2 - y
                });
                break;
        }

        return points;
    }

    /**
     * Draw symmetry guide lines on overlay canvas
     */
    drawGuides(ctx) {
        if (!this.enabled || !this.showGuides) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        switch (this.mode) {
            case 'horizontal':
                // Vertical center line (for left-right mirror)
                ctx.beginPath();
                ctx.moveTo(centerX, 0);
                ctx.lineTo(centerX, this.canvas.height);
                ctx.stroke();
                break;

            case 'vertical':
                // Horizontal center line (for top-bottom mirror)
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                ctx.lineTo(this.canvas.width, centerY);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    /**
     * Get mode display name
     */
    getModeName() {
        const names = {
            'none': 'Off',
            'horizontal': 'Left-Right',
            'vertical': 'Top-Bottom'
        };
        return names[this.mode] || 'Off';
    }

    /**
     * Draw with symmetry applied
     */
    drawSymmetrical(drawFunction, x, y, ...args) {
        const points = this.getSymmetricalPoints(x, y);

        for (const point of points) {
            drawFunction(point.x, point.y, ...args);
        }
    }
}
