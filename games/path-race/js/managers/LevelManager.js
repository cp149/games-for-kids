/**
 * LevelManager - Level Progression Manager
 * Manages level loading, unlocking, and progress tracking
 */

class LevelManager {
    constructor() {
        this.levelData = [];
        this.progress = this.loadProgress();
    }

    loadProgress() {
        const saved = localStorage.getItem(CONFIG.STORAGE.LEVEL_PROGRESS);
        return saved ? JSON.parse(saved) : { levels: {} };
    }

    saveProgress() {
        localStorage.setItem(CONFIG.STORAGE.LEVEL_PROGRESS, JSON.stringify(this.progress));
    }

    generateLevel(levelNum) {
        return GridGenerator.generateLevel(levelNum);
    }

    unlockLevel(levelNum) {
        if (!this.progress.levels[levelNum]) {
            this.progress.levels[levelNum] = { unlocked: true, stars: 0 };
            this.saveProgress();
        }
    }

    setLevelStars(levelNum, stars) {
        if (!this.progress.levels[levelNum]) {
            this.progress.levels[levelNum] = { unlocked: true, stars: 0 };
        }
        this.progress.levels[levelNum].stars = Math.max(this.progress.levels[levelNum].stars, stars);
        this.saveProgress();
    }

    destroy() {}
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LevelManager;
}
