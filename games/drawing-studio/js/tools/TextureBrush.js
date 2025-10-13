/**
 * Texture Brush - Simulate different painting textures
 */

export class TextureBrush {
    constructor() {
        this.name = 'Texture Brush';
        this.color = '#FF6B6B';
        this.lineWidth = 8;
        this.texture = 'crayon'; // crayon, watercolor, spray, ink, brush, oil, colorSpray, waterSpray
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
            case 'brush':
                this.drawBrush(ctx, x, y);
                break;
            case 'oil':
                this.drawOil(ctx, x, y);
                break;
            case 'colorSpray':
                this.drawColorSpray(ctx, x, y);
                break;
            case 'waterSpray':
                this.drawWaterSpray(ctx, x, y);
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
     * Chinese brush texture - flowing, elegant strokes with varying pressure
     */
    drawBrush(ctx, x, y) {
        ctx.save();

        // Convert hex to rgba
        let r, g, b;
        if (this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }

        const size = this.lineWidth;
        
        // Create dramatic brush stroke pattern
        const strokes = 12;
        for (let i = 0; i < strokes; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 0.8;
            const strokeX = x + Math.cos(angle) * distance * 0.2;
            const strokeY = y + Math.sin(angle) * distance * 0.2;
            
            // Varying stroke lengths for natural look
            const strokeLength = size * (0.8 + Math.random() * 1.2);
            const endX = strokeX + Math.cos(angle) * strokeLength;
            const endY = strokeY + Math.sin(angle) * strokeLength;
            
            // Pressure simulation - thicker to thinner
            const startWidth = Math.random() * 2 + 1;
            const endWidth = Math.random() * 0.5 + 0.3;
            
            // Create brush stroke with gradient
            const gradient = ctx.createLinearGradient(strokeX, strokeY, endX, endY);
            const baseAlpha = 0.4 + Math.random() * 0.4;
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseAlpha})`);
            gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${baseAlpha * 0.6})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.1)`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = startWidth;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(strokeX, strokeY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Add taper effect
            ctx.lineWidth = endWidth;
            ctx.beginPath();
            ctx.moveTo(strokeX + (endX - strokeX) * 0.5, strokeY + (endY - strokeY) * 0.5);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }

        // Dense center for solid coverage
        const centerGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
        centerGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        centerGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.6)`);
        centerGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.2)`);

        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Add ink bleeding for wet effect
        const bleeds = 3;
        for (let i = 0; i < bleeds; i++) {
            const bleedAngle = Math.random() * Math.PI * 2;
            const bleedDistance = Math.random() * size * 1.0;
            const bleedX = x + Math.cos(bleedAngle) * bleedDistance;
            const bleedY = y + Math.sin(bleedAngle) * bleedDistance;
            const bleedSize = size * (0.15 + Math.random() * 0.2);
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.arc(bleedX, bleedY, bleedSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Oil paint texture - thick, textured strokes with color mixing
     */
    drawOil(ctx, x, y) {
        ctx.save();

        // Convert hex to rgba
        let r, g, b;
        if (this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }

        const size = this.lineWidth;
        
        // Create thick impasto base layer
        const baseGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
        baseGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        baseGradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.7)`);
        baseGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.3)`);

        ctx.fillStyle = baseGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // Create dramatic palette knife strokes
        const knifeStrokes = 15;
        for (let i = 0; i < knifeStrokes; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 1.0;
            const strokeX = x + Math.cos(angle) * distance * 0.5;
            const strokeY = y + Math.sin(angle) * distance * 0.5;
            
            // Dramatic color variation for paint mixing
            const colorVar = 30;
            const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * colorVar));
            const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * colorVar));
            const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * colorVar));
            
            // Thick, directional strokes
            const strokeWidth = Math.random() * 3 + 2;
            const strokeLength = size * (0.6 + Math.random() * 0.8);
            const strokeAngle = angle + (Math.random() - 0.5) * Math.PI / 3;
            const alpha = 0.7 + Math.random() * 0.3;
            
            const endX = strokeX + Math.cos(strokeAngle) * strokeLength;
            const endY = strokeY + Math.sin(strokeAngle) * strokeLength;
            
            // Create textured stroke with varying opacity
            ctx.strokeStyle = `rgba(${newR}, ${newG}, ${newB}, ${alpha})`;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(strokeX, strokeY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Add thick paint buildup
            ctx.fillStyle = `rgba(${newR}, ${newG}, ${newB}, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(strokeX, strokeY, strokeWidth * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add dramatic highlights and shadows
        const lightEffects = 6;
        for (let i = 0; i < lightEffects; i++) {
            const effectAngle = Math.random() * Math.PI * 2;
            const effectDistance = Math.random() * size * 0.7;
            const effectX = x + Math.cos(effectAngle) * effectDistance;
            const effectY = y + Math.sin(effectAngle) * effectDistance;
            const effectSize = size * (0.2 + Math.random() * 0.3);
            
            if (i < 4) {
                // Highlights
                const lightR = Math.min(255, r + 60 + Math.random() * 40);
                const lightG = Math.min(255, g + 60 + Math.random() * 40);
                const lightB = Math.min(255, b + 60 + Math.random() * 40);
                
                ctx.fillStyle = `rgba(${lightR}, ${lightG}, ${lightB}, 0.6)`;
                ctx.beginPath();
                ctx.arc(effectX, effectY, effectSize, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Shadows/dark areas
                const darkR = Math.max(0, r - 40 - Math.random() * 30);
                const darkG = Math.max(0, g - 40 - Math.random() * 30);
                const darkB = Math.max(0, b - 40 - Math.random() * 30);
                
                ctx.fillStyle = `rgba(${darkR}, ${darkG}, ${darkB}, 0.5)`;
                ctx.beginPath();
                ctx.arc(effectX, effectY, effectSize * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Add textural details
        const details = 10;
        for (let i = 0; i < details; i++) {
            const detailX = x + (Math.random() - 0.5) * size * 1.5;
            const detailY = y + (Math.random() - 0.5) * size * 1.5;
            const detailSize = Math.random() * 2 + 0.5;
            
            const detailR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * 60));
            const detailG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * 60));
            const detailB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * 60));
            
            ctx.fillStyle = `rgba(${detailR}, ${detailG}, ${detailB}, 0.8)`;
            ctx.beginPath();
            ctx.arc(detailX, detailY, detailSize, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Color Spray - Dense color spray effect like spray paint can
     */
    drawColorSpray(ctx, x, y) {
        ctx.save();

        // Convert hex to rgba
        let r, g, b;
        if (this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }

        const particles = 80; // More particles for denser spray
        const spread = this.lineWidth * 2; // Wider spread

        for (let i = 0; i < particles; i++) {
            // Gaussian distribution for realistic spray pattern
            const angle = Math.random() * Math.PI * 2;
            const gaussian = Math.abs(this.randomGaussian());
            const distance = gaussian * spread * 0.8;

            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            // Particle size varies - more small particles
            const size = Math.random() < 0.7 ?
                Math.random() * 1 + 0.5 :
                Math.random() * 2 + 1;

            // Color variation for realistic spray
            const colorVar = 15;
            const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * colorVar));
            const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * colorVar));
            const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * colorVar));

            // Alpha decreases with distance
            const alpha = (1 - distance / spread) * (0.3 + Math.random() * 0.4);

            ctx.fillStyle = `rgba(${newR}, ${newG}, ${newB}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Water Spray - Creates water droplet effect that blurs/smears existing colors with downward drip
     */
    drawWaterSpray(ctx, x, y) {
        ctx.save();

        // Convert hex to rgba
        let r, g, b;
        if (this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }

        const canvas = ctx.canvas;
        const spread = this.lineWidth * 3;
        const dripHeight = this.lineWidth * 4; // Drip distance downward

        // Get current image data to check for existing colors
        const readX = Math.max(0, x - spread);
        const readY = Math.max(0, y - spread);
        const readWidth = Math.min(canvas.width - readX, spread * 2);
        const readHeight = Math.min(canvas.height - readY, spread + dripHeight);

        const imageData = ctx.getImageData(readX, readY, readWidth, readHeight);
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        let hasExistingColor = false;

        // Check if there are existing colors nearby
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] > 20) {
                hasExistingColor = true;
                break;
            }
        }

        if (hasExistingColor) {
            // Drip/smear existing colors downward
            const drips = 15;

            for (let i = 0; i < drips; i++) {
                // Random position around spray center
                const startAngle = Math.random() * Math.PI * 2;
                const startDist = Math.random() * spread * 0.8;
                const startX = Math.floor(startDist * Math.cos(startAngle) + spread);
                const startY = Math.floor(startDist * Math.sin(startAngle) + spread);

                if (startX >= 0 && startX < width && startY >= 0 && startY < height) {
                    const pixelIndex = (startY * width + startX) * 4;
                    const sampleR = pixels[pixelIndex];
                    const sampleG = pixels[pixelIndex + 1];
                    const sampleB = pixels[pixelIndex + 2];
                    const sampleA = pixels[pixelIndex + 3];

                    // Only drip if there's color
                    if (sampleA > 20) {
                        // Create vertical drip
                        const dripLength = Math.random() * dripHeight * 0.8 + dripHeight * 0.2;
                        const dripWidth = Math.random() * 3 + 2;

                        // Draw drip line downward
                        for (let d = 0; d < dripLength; d += 0.5) {
                            const dripY = startY + d;
                            const fadeOut = 1 - (d / dripLength);
                            const wobble = Math.sin(d * 0.3) * (dripWidth * 0.3); // Slight wobble

                            // Draw drip pixels
                            for (let w = -dripWidth; w <= dripWidth; w++) {
                                const dripX = startX + w + wobble;

                                if (dripX >= 0 && dripX < width && dripY >= 0 && dripY < height) {
                                    const targetIndex = (Math.floor(dripY) * width + Math.floor(dripX)) * 4;

                                    // Calculate blend based on distance from center and fade
                                    const distFromCenter = Math.abs(w) / dripWidth;
                                    const blendFactor = (1 - distFromCenter) * fadeOut * 0.5;

                                    if (blendFactor > 0) {
                                        pixels[targetIndex] = pixels[targetIndex] * (1 - blendFactor) + sampleR * blendFactor;
                                        pixels[targetIndex + 1] = pixels[targetIndex + 1] * (1 - blendFactor) + sampleG * blendFactor;
                                        pixels[targetIndex + 2] = pixels[targetIndex + 2] * (1 - blendFactor) + sampleB * blendFactor;
                                        pixels[targetIndex + 3] = Math.max(pixels[targetIndex + 3], sampleA * blendFactor);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Put the modified image data back
            ctx.putImageData(imageData, readX, readY);

            // Add water droplet highlights
            for (let i = 0; i < 8; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * spread * 0.6;
                const dropX = Math.cos(angle) * distance;
                const dropY = Math.sin(angle) * distance + Math.random() * dripHeight * 0.5;

                ctx.fillStyle = `rgba(220, 240, 255, ${0.1 + Math.random() * 0.15})`;
                ctx.beginPath();
                ctx.arc(x + dropX, y + dropY, Math.random() * 4 + 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // No existing color - draw water drops that drip down
            const drops = 12;

            for (let i = 0; i < drops; i++) {
                // Starting position
                const startAngle = Math.random() * Math.PI * 2;
                const startDist = Math.random() * spread * 0.5;
                const startX = x + Math.cos(startAngle) * startDist;
                const startY = y + Math.sin(startAngle) * startDist;

                // Drip parameters
                const dripLength = Math.random() * dripHeight * 0.7 + dripHeight * 0.3;
                const dropSize = Math.random() * 3 + 2;

                // Color variation
                const colorVar = 20;
                const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * colorVar));
                const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * colorVar));
                const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * colorVar));

                // Draw elongated drip shape
                const gradient = ctx.createLinearGradient(
                    startX, startY,
                    startX, startY + dripLength
                );

                gradient.addColorStop(0, `rgba(${newR}, ${newG}, ${newB}, 0.3)`);
                gradient.addColorStop(0.3, `rgba(${newR}, ${newG}, ${newB}, 0.2)`);
                gradient.addColorStop(0.7, `rgba(${newR}, ${newG}, ${newB}, 0.15)`);
                gradient.addColorStop(1, `rgba(${newR}, ${newG}, ${newB}, 0.05)`);

                ctx.fillStyle = gradient;

                // Draw teardrop shape
                ctx.beginPath();
                ctx.ellipse(startX, startY + dripLength * 0.5, dropSize * 0.6, dripLength * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Draw droplet at top
                ctx.fillStyle = `rgba(${newR}, ${newG}, ${newB}, 0.35)`;
                ctx.beginPath();
                ctx.arc(startX, startY, dropSize, 0, Math.PI * 2);
                ctx.fill();

                // Add highlight on droplet
                ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.15})`;
                ctx.beginPath();
                ctx.arc(startX - dropSize * 0.3, startY - dropSize * 0.3, dropSize * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    /**
     * Helper function for Gaussian random distribution
     */
    randomGaussian() {
        // Box-Muller transform
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    /**
     * End drawing
     */
    end(ctx) {
        // Nothing to clean up
    }
}
