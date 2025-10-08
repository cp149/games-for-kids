/**
 * Texture Brush - Simulate different painting textures
 */

export class TextureBrush {
    constructor() {
        this.name = 'Texture Brush';
        this.color = '#FF6B6B';
        this.lineWidth = 8;
        this.texture = 'crayon'; // crayon, watercolor, spray, ink
    }

    /**
     * Set brush color
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * Set line width
     */
    setLineWidth(width) {
        this.lineWidth = Math.max(1, Math.min(50, width));
    }

    /**
     * Get line width
     */
    getLineWidth() {
        return this.lineWidth;
    }

    /**
     * Set texture type
     */
    setTexture(texture) {
        this.texture = texture;
        console.log(`Texture set to: ${texture}`);
    }

    /**
     * Start drawing
     */
    start(ctx, x, y) {
        this.drawTexture(ctx, x, y);
    }

    /**
     * Draw with texture
     */
    draw(ctx, fromX, fromY, toX, toY) {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(distance / (this.lineWidth * 0.2)));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = fromX + dx * t;
            const y = fromY + dy * t;
            this.drawTexture(ctx, x, y);
        }
    }

    /**
     * Draw texture effect at position
     */
    drawTexture(ctx, x, y) {
        switch (this.texture) {
            case 'crayon':
                this.drawCrayon(ctx, x, y);
                break;
            case 'watercolor':
                this.drawWatercolor(ctx, x, y);
                break;
            case 'spray':
                this.drawSpray(ctx, x, y);
                break;
            case 'ink':
                this.drawInk(ctx, x, y);
                break;
            default:
                this.drawCrayon(ctx, x, y);
        }
    }

    /**
     * Crayon texture - rough, grainy effect
     */
    drawCrayon(ctx, x, y) {
        ctx.save();

        const particles = 15;
        const spread = this.lineWidth;

        for (let i = 0; i < particles; i++) {
            const offsetX = (Math.random() - 0.5) * spread;
            const offsetY = (Math.random() - 0.5) * spread;
            const size = Math.random() * 2 + 1;
            const alpha = Math.random() * 0.3 + 0.3;

            ctx.fillStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(');

            // Convert hex to rgba if needed
            if (this.color.startsWith('#')) {
                const r = parseInt(this.color.slice(1, 3), 16);
                const g = parseInt(this.color.slice(3, 5), 16);
                const b = parseInt(this.color.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }

            ctx.fillRect(x + offsetX, y + offsetY, size, size);
        }

        ctx.restore();
    }

    /**
     * Watercolor texture - soft, blended effect
     */
    drawWatercolor(ctx, x, y) {
        ctx.save();

        const layers = 3;
        for (let i = 0; i < layers; i++) {
            const radius = this.lineWidth * (1 + i * 0.3);
            const alpha = 0.15 - i * 0.03;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

            // Convert hex to rgba
            let r, g, b;
            if (this.color.startsWith('#')) {
                r = parseInt(this.color.slice(1, 3), 16);
                g = parseInt(this.color.slice(3, 5), 16);
                b = parseInt(this.color.slice(5, 7), 16);
            }

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Spray paint texture - scattered dots
     */
    drawSpray(ctx, x, y) {
        ctx.save();

        const particles = 30;
        const spread = this.lineWidth * 1.5;

        for (let i = 0; i < particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * spread;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const size = Math.random() * 1.5 + 0.5;
            const alpha = Math.random() * 0.4 + 0.2;

            // Convert hex to rgba
            let r, g, b;
            if (this.color.startsWith('#')) {
                r = parseInt(this.color.slice(1, 3), 16);
                g = parseInt(this.color.slice(3, 5), 16);
                b = parseInt(this.color.slice(5, 7), 16);
            }

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Ink brush texture - smooth with varying opacity
     */
    drawInk(ctx, x, y) {
        ctx.save();

        const size = this.lineWidth;

        // Convert hex to rgba
        let r, g, b;
        if (this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }

        // Main stroke
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.5)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add some ink bleeding effect
        const bleeding = 5;
        for (let i = 0; i < bleeding; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 0.5;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            const bleedSize = size * 0.3;
            const alpha = Math.random() * 0.2 + 0.1;

            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, bleedSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * End drawing
     */
    end(ctx) {
        // Nothing to clean up
    }
}
