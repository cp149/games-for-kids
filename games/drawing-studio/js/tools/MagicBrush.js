/**
 * Magic Brush Tool - Special effects brushes using OO architecture
 */

import { Tool } from '../core/ToolSystem.js';
import { EffectFactory } from './effects/EffectFactory.js';

export class MagicBrush extends Tool {
    constructor() {
        super('Magic Brush', 12); // Default 12px for magic effects
        this.currentEffectId = 'rainbow';
        this.currentEffect = EffectFactory.getEffect(this.currentEffectId);
    }

    /**
     * Switch magic effect
     */
    setEffect(effectId) {
        this.currentEffectId = effectId;
        this.currentEffect = EffectFactory.getEffect(effectId);
        console.log(`Magic effect changed to: ${effectId}`);
    }

    /**
     * Get current effect name
     */
    getEffectName() {
        return `${this.currentEffect.icon} ${this.currentEffect.name}`;
    }

    /**
     * Start drawing with magic effect
     */
    start(ctx, x, y) {
        this.currentEffect.draw(ctx, x, y, this.lineWidth, this.color);
    }

    /**
     * Continue drawing with magic effect
     */
    draw(ctx, fromX, fromY, toX, toY) {
        // Calculate distance between points
        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Get spacing multiplier from effect
        const stepMultiplier = this.currentEffect.getSpacingMultiplier();

        // Interpolate points for smooth line (no gaps when drawing fast)
        const steps = Math.max(1, Math.ceil(distance / (this.lineWidth * stepMultiplier)));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = fromX + dx * t;
            const y = fromY + dy * t;
            this.currentEffect.draw(ctx, x, y, this.lineWidth, this.color);
        }
    }
}
