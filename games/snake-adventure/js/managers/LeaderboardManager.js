/**
 * Leaderboard Manager - Tracks and displays snake rankings
 */

class LeaderboardManager {
    constructor() {
        this.rankings = [];
        this.updateInterval = 60; // Update every 60 frames (1 second at 60 FPS)
        this.frameCounter = 0;
    }

    /**
     * Update rankings from game state
     */
    update(snakes, playerSnake) {
        this.frameCounter++;

        // Only update every N frames for performance
        if (this.frameCounter < this.updateInterval) return;
        this.frameCounter = 0;

        this.rankings = [];

        // Add all alive snakes to rankings
        for (const snake of snakes.values()) {
            if (!snake.isAlive) continue;

            this.rankings.push({
                id: snake.id,
                type: snake.type,
                length: snake.getLength(),
                color: snake.color,
                isPlayer: snake.id === playerSnake?.id
            });
        }

        // Sort by length (descending)
        this.rankings.sort((a, b) => b.length - a.length);
    }

    /**
     * Get player rank
     */
    getPlayerRank() {
        return this.rankings.findIndex(r => r.isPlayer) + 1;
    }

    /**
     * Get top N rankings
     */
    getTopRankings(n = 3) {
        return this.rankings.slice(0, n);
    }

    /**
     * Render leaderboard on canvas
     */
    render(ctx, canvas) {
        if (this.rankings.length === 0) return;

        const x = canvas.width - 200;
        const y = 80;
        const lineHeight = 30;
        const padding = 15;

        // Background
        ctx.fillStyle = 'rgba(10, 14, 39, 0.85)';
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        const bgHeight = (this.rankings.length * lineHeight) + (padding * 2) + 20;
        ctx.fillRect(x, y, 180, bgHeight);
        ctx.strokeRect(x, y, 180, bgHeight);

        // Title
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🏆 Leaderboard', x + padding, y + padding + 14);

        // Rankings
        ctx.font = '14px Arial';
        this.rankings.forEach((ranking, index) => {
            const rankY = y + padding + 30 + (index * lineHeight);

            // Rank number
            ctx.fillStyle = index === 0 ? '#ffd700' : (index === 1 ? '#c0c0c0' : (index === 2 ? '#cd7f32' : '#ffffff'));
            ctx.fillText(`${index + 1}.`, x + padding, rankY);

            // Snake type indicator
            const indicator = ranking.isPlayer ? '👤' : '🤖';
            ctx.fillText(indicator, x + padding + 25, rankY);

            // Length
            ctx.fillStyle = ranking.isPlayer ? '#00ff88' : '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(`${ranking.length}`, x + 180 - padding, rankY);

            // Highlight player
            if (ranking.isPlayer) {
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 5, rankY - 16, 170, 22);
            }
        });

        ctx.textAlign = 'left';
    }

    /**
     * Get ranking info text
     */
    getRankingText() {
        const rank = this.getPlayerRank();
        const total = this.rankings.length;

        if (rank === 0) return '';
        if (rank === 1) return '🥇 #1 Leader!';
        if (rank === 2) return '🥈 #2 Close!';
        if (rank === 3) return '🥉 #3 Keep going!';
        return `#${rank}/${total}`;
    }

    /**
     * Reset rankings
     */
    reset() {
        this.rankings = [];
        this.frameCounter = 0;
    }

    /**
     * Cleanup
     */
    destroy() {
        this.rankings = [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeaderboardManager };
}
