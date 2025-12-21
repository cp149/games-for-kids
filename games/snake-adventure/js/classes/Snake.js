/**
 * Snake - Individual snake entity (player or AI)
 */

class Snake {
    constructor(options = {}) {
        // Identity
        this.id = options.id || MathUtils.generateId();
        this.type = options.type || 'player'; // 'player' or 'ai'
        this.color = options.color || {
            start: CONFIG.SNAKE.GRADIENT_START,
            end: CONFIG.SNAKE.GRADIENT_END,
            glow: CONFIG.SNAKE.HEAD_GLOW_COLOR
        };

        // Physics
        this.segments = [];
        this.angle = options.angle || 0;
        this.targetAngle = options.targetAngle || 0;
        this.speed = options.speed || CONFIG.SNAKE.INITIAL_SPEED;
        this.distanceSinceLastSegment = 0;

        // State
        this.isAlive = true;
        this.isGrowing = false;
        this.pulsePhase = 0;

        // Starting position
        this.startX = options.x || CONFIG.GAME.CANVAS_SIZE / 2;
        this.startY = options.y || CONFIG.GAME.CANVAS_SIZE / 2;

        this.init();
    }

    /**
     * Initialize snake segments
     */
    init() {
        this.segments = [];

        // Create initial segments
        for (let i = 0; i < CONFIG.SNAKE.INITIAL_LENGTH; i++) {
            this.segments.push({
                x: this.startX - i * (CONFIG.SNAKE.SEGMENT_RADIUS * 2 + CONFIG.SNAKE.SEGMENT_SPACING),
                y: this.startY,
                radius: CONFIG.SNAKE.SEGMENT_RADIUS
            });
        }

        this.angle = this.targetAngle || 0;
    }

    /**
     * Update snake position and movement
     */
    update(deltaTime) {
        if (!this.isAlive) return;

        // Smooth angle interpolation
        const angleDiff = MathUtils.angleDifference(this.angle, this.targetAngle);
        this.angle += angleDiff * CONFIG.SNAKE.TURN_RATE;
        this.angle = MathUtils.normalizeAngle(this.angle);

        // Calculate movement distance
        const moveDistance = this.speed * deltaTime;
        this.distanceSinceLastSegment += moveDistance;

        // Segment spacing
        const segmentSpacing = CONFIG.SNAKE.SEGMENT_RADIUS * 2 + CONFIG.SNAKE.SEGMENT_SPACING;

        // Update head position smoothly
        const head = this.segments[0];
        head.x += Math.cos(this.angle) * moveDistance;
        head.y += Math.sin(this.angle) * moveDistance;

        // Add new segment if moved enough distance
        if (this.distanceSinceLastSegment >= segmentSpacing) {
            this.segments.unshift({
                x: head.x,
                y: head.y,
                radius: CONFIG.SNAKE.SEGMENT_RADIUS
            });

            // Remove tail segment (unless growing)
            if (!this.isGrowing) {
                this.segments.pop();
            } else {
                this.isGrowing = false;
            }

            this.distanceSinceLastSegment = 0;
        }

        // Update pulse animation
        this.pulsePhase += deltaTime * CONFIG.SNAKE.PULSE_SPEED;
    }

    /**
     * Render snake with enhanced visuals
     */
    render(ctx, camera) {
        if (this.segments.length === 0 || !this.isAlive) return;

        const pulse = 1 + Math.sin(this.pulsePhase) * CONFIG.SNAKE.PULSE_AMOUNT;

        // Draw trail connections between segments for smoother appearance with gradient
        ctx.lineWidth = CONFIG.SNAKE.SEGMENT_RADIUS * 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create gradient along snake body
        if (this.segments.length >= 2) {
            const headScreen = {
                x: this.segments[0].x - camera.getX(),
                y: this.segments[0].y - camera.getY()
            };
            const tailScreen = {
                x: this.segments[this.segments.length - 1].x - camera.getX(),
                y: this.segments[this.segments.length - 1].y - camera.getY()
            };

            const trailGradient = ctx.createLinearGradient(
                headScreen.x, headScreen.y,
                tailScreen.x, tailScreen.y
            );
            trailGradient.addColorStop(0, this.color.start);
            trailGradient.addColorStop(1, this.addAlpha(this.color.end, 0.6));

            ctx.strokeStyle = trailGradient;

            ctx.beginPath();
            for (let i = 0; i < this.segments.length; i++) {
                const seg = this.segments[i];
                const screenX = seg.x - camera.getX();
                const screenY = seg.y - camera.getY();

                if (i === 0) {
                    ctx.moveTo(screenX, screenY);
                } else {
                    ctx.lineTo(screenX, screenY);
                }
            }
            ctx.stroke();
        }

        // Render body segments with enhanced glow
        for (let i = 1; i < this.segments.length; i++) {
            const seg = this.segments[i];
            const screenX = seg.x - camera.getX();
            const screenY = seg.y - camera.getY();

            // Gradient from start to end color
            const t = i / this.segments.length;
            const segmentColor = this.interpolateColor(this.color.start, this.color.end, t);

            // Outer glow
            const outerGlow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, seg.radius * pulse * 2);
            outerGlow.addColorStop(0, segmentColor);
            outerGlow.addColorStop(0.5, this.addAlpha(segmentColor, 0.3));
            outerGlow.addColorStop(1, 'transparent');

            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(screenX, screenY, seg.radius * pulse * 2, 0, Math.PI * 2);
            ctx.fill();

            // Core segment
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, seg.radius * pulse);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, segmentColor);
            gradient.addColorStop(1, this.addAlpha(segmentColor, 0.8));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, seg.radius * pulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render head with enhanced effects
        const head = this.segments[0];
        const headX = head.x - camera.getX();
        const headY = head.y - camera.getY();
        const headRadius = CONFIG.SNAKE.SEGMENT_RADIUS * CONFIG.SNAKE.HEAD_RADIUS_MULTIPLIER * pulse;

        // Head outer glow (larger)
        const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headRadius * 2.5);
        headGlow.addColorStop(0, this.color.start);
        headGlow.addColorStop(0.4, this.addAlpha(this.color.start, 0.5));
        headGlow.addColorStop(1, 'transparent');

        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Head middle glow
        const midGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, headRadius * 1.5);
        midGlow.addColorStop(0, '#ffffff');
        midGlow.addColorStop(0.5, this.color.start);
        midGlow.addColorStop(1, 'transparent');

        ctx.fillStyle = midGlow;
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Head body with shine
        const headGrad = ctx.createRadialGradient(
            headX - headRadius * 0.3,
            headY - headRadius * 0.3,
            0,
            headX,
            headY,
            headRadius
        );
        headGrad.addColorStop(0, '#ffffff');
        headGrad.addColorStop(0.2, this.color.start);
        headGrad.addColorStop(1, this.addAlpha(this.color.start, 0.9));

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eyes with whites
        const eyeOffset = CONFIG.SNAKE.EYE_OFFSET;
        const eye1X = headX + Math.cos(this.angle + Math.PI / 4) * eyeOffset;
        const eye1Y = headY + Math.sin(this.angle + Math.PI / 4) * eyeOffset;
        const eye2X = headX + Math.cos(this.angle - Math.PI / 4) * eyeOffset;
        const eye2Y = headY + Math.sin(this.angle - Math.PI / 4) * eyeOffset;

        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, CONFIG.SNAKE.EYE_SIZE * 1.5, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, CONFIG.SNAKE.EYE_SIZE * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, CONFIG.SNAKE.EYE_SIZE, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, CONFIG.SNAKE.EYE_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Add alpha channel to hex color
     */
    addAlpha(hexColor, alpha) {
        const c = parseInt(hexColor.slice(1), 16);
        const r = (c >> 16) & 255;
        const g = (c >> 8) & 255;
        const b = c & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, t) {
        const c1 = parseInt(color1.slice(1), 16);
        const c2 = parseInt(color2.slice(1), 16);

        const r1 = (c1 >> 16) & 255;
        const g1 = (c1 >> 8) & 255;
        const b1 = c1 & 255;

        const r2 = (c2 >> 16) & 255;
        const g2 = (c2 >> 8) & 255;
        const b2 = c2 & 255;

        const r = Math.floor(r1 + (r2 - r1) * t);
        const g = Math.floor(g1 + (g2 - g1) * t);
        const b = Math.floor(b1 + (b2 - b1) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Set target direction
     */
    setTargetAngle(angle) {
        this.targetAngle = angle;
    }

    /**
     * Grow snake by one segment
     */
    grow() {
        this.isGrowing = true;
    }

    /**
     * Increase snake speed
     */
    increaseSpeed() {
        this.speed = Math.min(this.speed + CONFIG.SNAKE.SPEED_INCREMENT, CONFIG.SNAKE.MAX_SPEED);
    }

    /**
     * Get head segment
     */
    getHead() {
        return this.segments[0];
    }

    /**
     * Get snake length
     */
    getLength() {
        return this.segments.length;
    }

    /**
     * Kill snake
     */
    die() {
        this.isAlive = false;
    }

    /**
     * Reset snake to initial state
     */
    reset() {
        this.segments = [];
        this.speed = CONFIG.SNAKE.INITIAL_SPEED;
        this.isAlive = true;
        this.isGrowing = false;
        this.distanceSinceLastSegment = 0;
        this.init();
    }

    /**
     * Check if point collides with snake body
     */
    checkBodyCollision(x, y, skipSegments = 0) {
        for (let i = skipSegments; i < this.segments.length; i++) {
            const seg = this.segments[i];
            if (MathUtils.distance(x, y, seg.x, seg.y) < CONFIG.SNAKE.SEGMENT_RADIUS * 2) {
                return true;
            }
        }
        return false;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.segments = [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Snake;
}
