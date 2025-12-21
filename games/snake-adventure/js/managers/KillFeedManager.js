/**
 * Kill Feed Manager - Shows death events (who died, killer info)
 */

class KillFeedManager {
    constructor() {
        this.entries = [];
    }

    /**
     * Add death event to feed
     */
    addDeath(victim, killer = null) {
        const entry = {
            victimType: victim.type,
            victimLength: victim.getLength(),
            killerType: killer ? killer.type : 'boundary',
            timestamp: Date.now(),
            id: Math.random()
        };

        this.entries.unshift(entry);

        // Keep only max entries
        if (this.entries.length > CONFIG.KILL_FEED.MAX_ENTRIES) {
            this.entries.pop();
        }
    }

    /**
     * Update - remove old entries
     */
    update() {
        const now = Date.now();
        this.entries = this.entries.filter(
            entry => now - entry.timestamp < CONFIG.KILL_FEED.ENTRY_DURATION
        );
    }

    /**
     * Render kill feed
     */
    render(ctx) {
        if (this.entries.length === 0) return;

        const x = CONFIG.KILL_FEED.POSITION_X;
        let y = CONFIG.KILL_FEED.POSITION_Y;
        const lineHeight = 28;

        ctx.font = '14px Arial';
        ctx.textAlign = 'left';

        this.entries.forEach((entry, index) => {
            // Fade out old entries
            const age = Date.now() - entry.timestamp;
            const alpha = 1 - (age / CONFIG.KILL_FEED.ENTRY_DURATION);

            // Background
            ctx.fillStyle = `rgba(10, 14, 39, ${alpha * 0.8})`;
            ctx.fillRect(x, y, 250, 24);

            // Icon and text
            const victimIcon = entry.victimType === 'player' ? '💀' : '🤖';
            const killerText = entry.killerType === 'boundary'
                ? '⚡ boundary'
                : (entry.killerType === 'player' ? '👤 Player' : '🤖 AI');

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(
                `${victimIcon} ${entry.victimLength} → ${killerText}`,
                x + 8,
                y + 17
            );

            y += lineHeight;
        });

        ctx.textAlign = 'left';
    }

    /**
     * Reset
     */
    reset() {
        this.entries = [];
    }

    /**
     * Cleanup
     */
    destroy() {
        this.entries = [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KillFeedManager;
}
