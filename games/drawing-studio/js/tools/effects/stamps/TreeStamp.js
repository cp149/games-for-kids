import { StampEffect } from '../StampEffect.js';

/**
 * Tree stamp - cute trees with different styles
 */
export class TreeStamp extends StampEffect {
    constructor() {
        super('tree', 'Tree', '🌳', 'Beautiful trees', false);
    }

    draw(ctx, x, y, size) {
        ctx.save();

        const scale = size * 2;

        // Tree types
        const treeTypes = ['round', 'pine', 'palm'];
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];

        // Trunk color
        const trunkColors = ['#8B4513', '#A0522D', '#6B4423', '#8B7355'];
        const trunkColor = trunkColors[Math.floor(Math.random() * trunkColors.length)];

        // Leaf colors
        const leafColors = [
            '#228B22', // Forest green
            '#32CD32', // Lime green
            '#3CB371', // Medium sea green
            '#90EE90', // Light green
            '#00FF00', // Pure green
            '#7FFF00', // Chartreuse
            '#ADFF2F', // Green yellow
            '#9ACD32', // Yellow green
            '#FF8C00', // Dark orange (autumn)
            '#FFD700', // Gold (autumn)
            '#FF6347', // Tomato (autumn)
        ];
        const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];

        if (treeType === 'round') {
            // Round tree (like emoji 🌳) - simple and cute style

            // Shadow under tree
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(x, y + scale * 0.32, scale * 0.2, scale * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();

            // Simple trunk (longer)
            const trunkGradient = ctx.createLinearGradient(
                x - scale * 0.07, y,
                x + scale * 0.07, y
            );
            trunkGradient.addColorStop(0, trunkColor);
            trunkGradient.addColorStop(1, '#5C4033');

            ctx.fillStyle = trunkGradient;
            ctx.fillRect(x - scale * 0.07, y - scale * 0.25, scale * 0.14, scale * 0.55);

            // Trunk highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x - scale * 0.06, y - scale * 0.25, scale * 0.04, scale * 0.5);

            // Elliptical canopy (elongated downward)
            const canopyWidth = scale * 0.36;  // Narrower
            const canopyHeight = scale * 0.56;  // Even taller for ellipse
            const canopyBaseY = y + scale * 0.32;  // Much lower

            // Shadow (ellipse)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.ellipse(x + scale * 0.02, canopyBaseY - canopyHeight / 2 + scale * 0.02, canopyWidth, canopyHeight, 0, Math.PI, 0, false);
            ctx.closePath();
            ctx.fill();

            // Dark base layer (ellipse)
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.ellipse(x, canopyBaseY - canopyHeight / 2, canopyWidth, canopyHeight, 0, Math.PI, 0, false);
            ctx.closePath();
            ctx.fill();

            // Main canopy with gradient (ellipse)
            const canopyGradient = ctx.createRadialGradient(
                x - canopyWidth * 0.3, canopyBaseY - canopyHeight * 0.7, 0,
                x, canopyBaseY - canopyHeight / 2, canopyWidth
            );
            canopyGradient.addColorStop(0, '#FFFF99');
            canopyGradient.addColorStop(0.35, leafColor);
            canopyGradient.addColorStop(1, '#228B22');

            ctx.fillStyle = canopyGradient;
            ctx.beginPath();
            ctx.ellipse(x, canopyBaseY - canopyHeight / 2, canopyWidth, canopyHeight, 0, Math.PI, 0, false);
            ctx.closePath();
            ctx.fill();

            // Bright highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(x - canopyWidth * 0.3, canopyBaseY - canopyHeight * 0.5, canopyWidth * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Small bright spot
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x - canopyWidth * 0.35, canopyBaseY - canopyHeight * 0.55, canopyWidth * 0.12, 0, Math.PI * 2);
            ctx.fill();

        } else if (treeType === 'pine') {
            // Pine/Christmas tree (triangular)

            // Trunk
            ctx.fillStyle = trunkColor;
            ctx.fillRect(x - scale * 0.06, y - scale * 0.05, scale * 0.12, scale * 0.35);

            // Pine layers (3 triangles)
            const layers = 3;
            for (let i = 0; i < layers; i++) {
                const layerY = y - scale * 0.2 - i * scale * 0.25;
                const layerWidth = scale * (0.8 - i * 0.15);
                const layerHeight = scale * 0.35;

                // Shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.beginPath();
                ctx.moveTo(x + scale * 0.03, layerY + scale * 0.03);
                ctx.lineTo(x - layerWidth / 2 + scale * 0.03, layerY + layerHeight + scale * 0.03);
                ctx.lineTo(x + layerWidth / 2 + scale * 0.03, layerY + layerHeight + scale * 0.03);
                ctx.closePath();
                ctx.fill();

                // Main layer
                const gradient = ctx.createLinearGradient(
                    x - layerWidth / 2, layerY,
                    x + layerWidth / 2, layerY
                );
                gradient.addColorStop(0, '#228B22');
                gradient.addColorStop(0.5, leafColor);
                gradient.addColorStop(1, '#228B22');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(x, layerY);
                ctx.lineTo(x - layerWidth / 2, layerY + layerHeight);
                ctx.lineTo(x + layerWidth / 2, layerY + layerHeight);
                ctx.closePath();
                ctx.fill();
            }

            // Star on top (occasionally)
            if (Math.random() < 0.3) {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                const starY = y - scale * 0.7;
                const starSize = scale * 0.1;
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
                    const radius = i % 2 === 0 ? starSize : starSize * 0.4;
                    const px = x + Math.cos(angle) * radius;
                    const py = starY + Math.sin(angle) * radius;
                    if (i === 0) {
                        ctx.moveTo(px, py);
                    } else {
                        ctx.lineTo(px, py);
                    }
                }
                ctx.closePath();
                ctx.fill();
            }

        } else {
            // Palm tree - improved with better leaves

            // Shadow under tree
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.ellipse(x, y + scale * 0.32, scale * 0.2, scale * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();

            // Trunk segments (stacked)
            const segments = 6;
            for (let i = 0; i < segments; i++) {
                const segY = y + scale * 0.3 - i * scale * 0.12;
                const segWidth = scale * (0.12 - i * 0.008);

                // Segment shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.ellipse(x + scale * 0.02, segY + scale * 0.02, segWidth * 0.6, scale * 0.04, 0, 0, Math.PI * 2);
                ctx.fill();

                // Segment body
                const segGradient = ctx.createRadialGradient(
                    x - segWidth * 0.3, segY - scale * 0.02, 0,
                    x, segY, segWidth
                );
                segGradient.addColorStop(0, '#D2B48C');
                segGradient.addColorStop(0.5, trunkColor);
                segGradient.addColorStop(1, '#5C4033');

                ctx.fillStyle = segGradient;
                ctx.beginPath();
                ctx.ellipse(x, segY, segWidth * 0.6, scale * 0.04, 0, 0, Math.PI * 2);
                ctx.fill();

                // Segment outline
                ctx.strokeStyle = '#5C4033';
                ctx.lineWidth = scale * 0.01;
                ctx.beginPath();
                ctx.ellipse(x, segY, segWidth * 0.6, scale * 0.04, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Top of trunk
            const topY = y - scale * 0.42;
            ctx.fillStyle = trunkColor;
            ctx.beginPath();
            ctx.ellipse(x, topY, scale * 0.08, scale * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();

            // Palm leaves (8 fronds in star pattern)
            const frondCount = 8;
            for (let i = 0; i < frondCount; i++) {
                const angle = (i * Math.PI * 2 / frondCount) - Math.PI / 2;
                const frondLength = scale * 0.35;

                // Draw leaf as filled shape
                ctx.fillStyle = leafColor;
                ctx.strokeStyle = '#228B22';
                ctx.lineWidth = scale * 0.01;

                ctx.beginPath();
                ctx.moveTo(x, topY);

                // Create curved palm frond shape
                const segments = 8;
                const leftPoints = [];
                const rightPoints = [];

                for (let j = 0; j <= segments; j++) {
                    const t = j / segments;
                    const distance = frondLength * t;
                    const width = scale * 0.08 * (1 - t * 0.7); // Tapers to point

                    const baseX = x + Math.cos(angle) * distance;
                    const baseY = topY + Math.sin(angle) * distance;

                    const perpAngle = angle + Math.PI / 2;
                    leftPoints.push({
                        x: baseX + Math.cos(perpAngle) * width,
                        y: baseY + Math.sin(perpAngle) * width
                    });
                    rightPoints.push({
                        x: baseX - Math.cos(perpAngle) * width,
                        y: baseY - Math.sin(perpAngle) * width
                    });
                }

                // Draw left side
                for (const point of leftPoints) {
                    ctx.lineTo(point.x, point.y);
                }

                // Draw right side back
                for (let j = rightPoints.length - 1; j >= 0; j--) {
                    ctx.lineTo(rightPoints[j].x, rightPoints[j].y);
                }

                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Add center vein
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = scale * 0.015;
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(
                    x + Math.cos(angle) * frondLength,
                    topY + Math.sin(angle) * frondLength
                );
                ctx.stroke();
            }

            // Coconuts in center
            if (Math.random() < 0.5) {
                for (let i = 0; i < 3; i++) {
                    const coconutAngle = Math.random() * Math.PI * 2;
                    const coconutDist = Math.random() * scale * 0.06;
                    const coconutX = x + Math.cos(coconutAngle) * coconutDist;
                    const coconutY = topY + Math.sin(coconutAngle) * coconutDist;

                    // Coconut shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.beginPath();
                    ctx.arc(coconutX + scale * 0.01, coconutY + scale * 0.01, scale * 0.05, 0, Math.PI * 2);
                    ctx.fill();

                    // Coconut body
                    const coconutGradient = ctx.createRadialGradient(
                        coconutX - scale * 0.02, coconutY - scale * 0.02, 0,
                        coconutX, coconutY, scale * 0.05
                    );
                    coconutGradient.addColorStop(0, '#D2691E');
                    coconutGradient.addColorStop(0.6, '#8B4513');
                    coconutGradient.addColorStop(1, '#5C3317');

                    ctx.fillStyle = coconutGradient;
                    ctx.beginPath();
                    ctx.arc(coconutX, coconutY, scale * 0.05, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        ctx.restore();
    }
}
