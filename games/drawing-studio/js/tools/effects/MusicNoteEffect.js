/**
 * Music Note Effect - Draws random music notes
 */

import { MagicEffect } from './MagicEffect.js';

export class MusicNoteEffect extends MagicEffect {
    constructor() {
        super('musicnote', 'Music Note', '🎵', 'Musical notes');

        // Different types of notes to draw randomly
        this.noteTypes = [
            'eighth',      // Single eighth note ♪
            'beamed',      // Beamed eighth notes ♫
            'quarter',     // Quarter note ♩
            'whole'        // Whole note (hollow)
        ];
    }

    /**
     * Draw a random music note
     */
    draw(ctx, x, y, size, color) {
        ctx.save();

        // Convert color to rgba
        let r = 0, g = 0, b = 0;
        if (color && color.startsWith('#')) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        }

        const noteSize = size * 1.8;

        // Random rotation for variety
        const rotation = (Math.random() - 0.5) * 0.3;
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Randomly choose note type
        const noteType = this.noteTypes[Math.floor(Math.random() * this.noteTypes.length)];

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;

        switch (noteType) {
            case 'eighth':
                this.drawEighthNote(ctx, 0, 0, noteSize);
                break;
            case 'beamed':
                this.drawBeamedNotes(ctx, 0, 0, noteSize);
                break;
            case 'quarter':
                this.drawQuarterNote(ctx, 0, 0, noteSize);
                break;
            case 'whole':
                this.drawWholeNote(ctx, 0, 0, noteSize);
                break;
        }

        ctx.restore();
    }

    /**
     * Draw single eighth note ♪
     */
    drawEighthNote(ctx, x, y, size) {
        // Note head (filled ellipse)
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.25, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.lineWidth = size * 0.06;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y);
        ctx.lineTo(x + size * 0.2, y - size * 0.8);
        ctx.stroke();

        // Flag
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y - size * 0.8);
        ctx.bezierCurveTo(
            x + size * 0.5, y - size * 0.7,
            x + size * 0.5, y - size * 0.5,
            x + size * 0.2, y - size * 0.4
        );
        ctx.fill();
    }

    /**
     * Draw beamed eighth notes ♫
     */
    drawBeamedNotes(ctx, x, y, size) {
        // First note head
        ctx.beginPath();
        ctx.ellipse(x - size * 0.15, y, size * 0.25, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Second note head
        ctx.beginPath();
        ctx.ellipse(x + size * 0.25, y, size * 0.25, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stems
        ctx.lineWidth = size * 0.06;
        ctx.lineCap = 'round';

        // First stem
        ctx.beginPath();
        ctx.moveTo(x - size * 0.15 + size * 0.2, y);
        ctx.lineTo(x - size * 0.15 + size * 0.2, y - size * 0.8);
        ctx.stroke();

        // Second stem
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25 + size * 0.2, y);
        ctx.lineTo(x + size * 0.25 + size * 0.2, y - size * 0.6);
        ctx.stroke();

        // Beam connecting stems
        ctx.lineWidth = size * 0.1;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.15 + size * 0.2, y - size * 0.8);
        ctx.lineTo(x + size * 0.25 + size * 0.2, y - size * 0.6);
        ctx.stroke();
    }

    /**
     * Draw quarter note ♩
     */
    drawQuarterNote(ctx, x, y, size) {
        // Note head (filled ellipse)
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.25, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stem (longer than eighth note)
        ctx.lineWidth = size * 0.06;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.2, y);
        ctx.lineTo(x + size * 0.2, y - size);
        ctx.stroke();
    }

    /**
     * Draw whole note (hollow)
     */
    drawWholeNote(ctx, x, y, size) {
        // Hollow note head (ellipse outline)
        ctx.lineWidth = size * 0.08;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.3, size * 0.22, -0.3, 0, Math.PI * 2);
        ctx.stroke();

        // Fill with lighter color for depth
        const currentFill = ctx.fillStyle;
        const match = currentFill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
            ctx.beginPath();
            ctx.ellipse(x, y, size * 0.3, size * 0.22, -0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Music notes need moderate spacing
     */
    getSpacingMultiplier() {
        return 1.5; // Moderate spacing for musical flow
    }
}
