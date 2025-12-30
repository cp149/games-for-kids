/**
 * LevelManager Unit Tests
 * TDD: Tests written FIRST before implementation
 * Handles level progression, sticker rewards, and persistence
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { LevelManager } from '../js/managers/LevelManager.js';

// Mock CONFIG
const mockConfig = {
    GAME: {
        TOTAL_LEVELS: 5,
        TOTAL_STICKERS: 6
    },
    LEVELS: {
        1: {
            name: 'make_purple',
            availableColors: ['red', 'blue'],
            goal: { type: 'secondary', color: 'purple', count: 2 },
            slots: 2,
            tutorial: true,
            hint: 'Mix red and blue!'
        },
        2: {
            name: 'make_orange',
            availableColors: ['red', 'yellow'],
            goal: { type: 'secondary', color: 'orange', count: 2 },
            slots: 2,
            tutorial: false,
            hint: 'Mix red and yellow!'
        },
        3: {
            name: 'make_green',
            availableColors: ['blue', 'yellow'],
            goal: { type: 'secondary', color: 'green', count: 2 },
            slots: 2,
            tutorial: false,
            hint: 'Mix blue and yellow!'
        },
        4: {
            name: 'all_colors',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'discover', count: 3 },
            slots: 2,
            tutorial: false,
            hint: 'Make any 3 mixed colors!'
        },
        5: {
            name: 'color_master',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'feed', count: 5 },
            slots: 2,
            tutorial: false,
            hint: 'Feed the chameleon 5 colors!'
        }
    },
    STICKERS: {
        purple: { emoji: '🟣', name: 'purple' },
        orange: { emoji: '🟠', name: 'orange' },
        green: { emoji: '🟢', name: 'green' },
        burst: { emoji: '💥', name: 'burst' },
        splash: { emoji: '💦', name: 'splash' },
        flash: { emoji: '⚡', name: 'flash' }
    },
    STORAGE: {
        PROGRESS: 'colorMixLab_progress',
        STICKERS: 'colorMixLab_stickers',
        SETTINGS: 'colorMixLab_settings'
    }
};

describe('LevelManager', () => {
    let levelManager;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        levelManager = new LevelManager(mockConfig);
    });

    describe('Constructor', () => {
        test('should initialize with config', () => {
            expect(levelManager).toBeDefined();
            expect(levelManager.config).toBe(mockConfig);
        });

        test('should start at level 1', () => {
            expect(levelManager.getCurrentLevel()).toBe(1);
        });

        test('should initialize with zero progress', () => {
            expect(levelManager.getProgress()).toBe(0);
        });

        test('should initialize with empty stickers', () => {
            expect(levelManager.getStickers()).toEqual([]);
        });
    });

    describe('getCurrentLevel', () => {
        test('should return current level number', () => {
            expect(levelManager.getCurrentLevel()).toBe(1);
        });
    });

    describe('getLevelConfig', () => {
        test('should return config for current level', () => {
            const config = levelManager.getLevelConfig();
            expect(config.name).toBe('make_purple');
            expect(config.goal.color).toBe('purple');
        });

        test('should return config for specific level', () => {
            const config = levelManager.getLevelConfig(3);
            expect(config.name).toBe('make_green');
            expect(config.goal.color).toBe('green');
        });

        test('should return null for invalid level', () => {
            expect(levelManager.getLevelConfig(0)).toBeNull();
            expect(levelManager.getLevelConfig(99)).toBeNull();
        });
    });

    describe('getGoal', () => {
        test('should return goal for current level', () => {
            const goal = levelManager.getGoal();
            expect(goal.type).toBe('secondary');
            expect(goal.color).toBe('purple');
            expect(goal.count).toBe(2);
        });
    });

    describe('getAvailableColors', () => {
        test('should return available colors for current level', () => {
            expect(levelManager.getAvailableColors()).toEqual(['red', 'blue']);
        });

        test('should return all colors for level 4', () => {
            levelManager.setLevel(4);
            expect(levelManager.getAvailableColors()).toEqual(['red', 'blue', 'yellow']);
        });
    });

    describe('getHint', () => {
        test('should return hint for current level', () => {
            expect(levelManager.getHint()).toBe('Mix red and blue!');
        });
    });

    describe('isTutorialLevel', () => {
        test('should return true for level 1', () => {
            expect(levelManager.isTutorialLevel()).toBe(true);
        });

        test('should return false for level 2+', () => {
            levelManager.setLevel(2);
            expect(levelManager.isTutorialLevel()).toBe(false);
        });
    });

    describe('getProgress', () => {
        test('should return current progress', () => {
            expect(levelManager.getProgress()).toBe(0);
        });
    });

    describe('addProgress', () => {
        test('should increment progress by 1', () => {
            levelManager.addProgress();
            expect(levelManager.getProgress()).toBe(1);
        });

        test('should increment progress by specified amount', () => {
            levelManager.addProgress(2);
            expect(levelManager.getProgress()).toBe(2);
        });

        test('should accumulate progress', () => {
            levelManager.addProgress();
            levelManager.addProgress();
            expect(levelManager.getProgress()).toBe(2);
        });
    });

    describe('resetProgress', () => {
        test('should reset progress to zero', () => {
            levelManager.addProgress(3);
            levelManager.resetProgress();
            expect(levelManager.getProgress()).toBe(0);
        });
    });

    describe('isLevelComplete', () => {
        test('should return false when progress below goal', () => {
            expect(levelManager.isLevelComplete()).toBe(false);
            levelManager.addProgress();
            expect(levelManager.isLevelComplete()).toBe(false);
        });

        test('should return true when progress meets goal', () => {
            levelManager.addProgress(2);
            expect(levelManager.isLevelComplete()).toBe(true);
        });

        test('should return true when progress exceeds goal', () => {
            levelManager.addProgress(5);
            expect(levelManager.isLevelComplete()).toBe(true);
        });
    });

    describe('nextLevel', () => {
        test('should advance to next level', () => {
            const result = levelManager.nextLevel();
            expect(result.success).toBe(true);
            expect(levelManager.getCurrentLevel()).toBe(2);
        });

        test('should reset progress when advancing', () => {
            levelManager.addProgress(2);
            levelManager.nextLevel();
            expect(levelManager.getProgress()).toBe(0);
        });

        test('should fail when at last level', () => {
            levelManager.setLevel(5);
            const result = levelManager.nextLevel();
            expect(result.success).toBe(false);
            expect(result.reason).toBe('max_level_reached');
            expect(levelManager.getCurrentLevel()).toBe(5);
        });

        test('should return new level info', () => {
            const result = levelManager.nextLevel();
            expect(result.level).toBe(2);
            expect(result.config.name).toBe('make_orange');
        });
    });

    describe('setLevel', () => {
        test('should set level to valid number', () => {
            levelManager.setLevel(3);
            expect(levelManager.getCurrentLevel()).toBe(3);
        });

        test('should reset progress when setting level', () => {
            levelManager.addProgress(2);
            levelManager.setLevel(3);
            expect(levelManager.getProgress()).toBe(0);
        });

        test('should clamp to minimum level 1', () => {
            levelManager.setLevel(0);
            expect(levelManager.getCurrentLevel()).toBe(1);
        });

        test('should clamp to maximum level', () => {
            levelManager.setLevel(99);
            expect(levelManager.getCurrentLevel()).toBe(5);
        });
    });

    describe('getTotalLevels', () => {
        test('should return total number of levels', () => {
            expect(levelManager.getTotalLevels()).toBe(5);
        });
    });

    describe('isLastLevel', () => {
        test('should return false for levels 1-4', () => {
            expect(levelManager.isLastLevel()).toBe(false);
            levelManager.setLevel(4);
            expect(levelManager.isLastLevel()).toBe(false);
        });

        test('should return true for level 5', () => {
            levelManager.setLevel(5);
            expect(levelManager.isLastLevel()).toBe(true);
        });
    });

    describe('Sticker Management', () => {
        describe('getStickers', () => {
            test('should return copy of stickers array', () => {
                levelManager.addSticker('purple');
                const stickers = levelManager.getStickers();
                stickers.push('orange'); // Modify returned array
                expect(levelManager.getStickers()).toEqual(['purple']); // Original unchanged
            });
        });

        describe('addSticker', () => {
            test('should add new sticker', () => {
                const result = levelManager.addSticker('purple');
                expect(result.success).toBe(true);
                expect(result.isNew).toBe(true);
                expect(levelManager.getStickers()).toContain('purple');
            });

            test('should not duplicate stickers', () => {
                levelManager.addSticker('purple');
                const result = levelManager.addSticker('purple');
                expect(result.success).toBe(true);
                expect(result.isNew).toBe(false);
                expect(levelManager.getStickers().filter(s => s === 'purple').length).toBe(1);
            });

            test('should return sticker info', () => {
                const result = levelManager.addSticker('purple');
                expect(result.sticker.emoji).toBe('🟣');
                expect(result.sticker.name).toBe('purple');
            });

            test('should reject invalid sticker', () => {
                const result = levelManager.addSticker('invalid');
                expect(result.success).toBe(false);
                expect(result.reason).toBe('invalid_sticker');
            });
        });

        describe('hasSticker', () => {
            test('should return false for uncollected sticker', () => {
                expect(levelManager.hasSticker('purple')).toBe(false);
            });

            test('should return true for collected sticker', () => {
                levelManager.addSticker('purple');
                expect(levelManager.hasSticker('purple')).toBe(true);
            });
        });

        describe('getStickerCount', () => {
            test('should return 0 initially', () => {
                expect(levelManager.getStickerCount()).toBe(0);
            });

            test('should return correct count', () => {
                levelManager.addSticker('purple');
                levelManager.addSticker('orange');
                expect(levelManager.getStickerCount()).toBe(2);
            });
        });

        describe('getTotalStickers', () => {
            test('should return total available stickers', () => {
                expect(levelManager.getTotalStickers()).toBe(6);
            });
        });

        describe('getAllStickersCollected', () => {
            test('should return false when not all collected', () => {
                levelManager.addSticker('purple');
                expect(levelManager.getAllStickersCollected()).toBe(false);
            });

            test('should return true when all collected', () => {
                ['purple', 'orange', 'green', 'burst', 'splash', 'flash'].forEach(s => {
                    levelManager.addSticker(s);
                });
                expect(levelManager.getAllStickersCollected()).toBe(true);
            });
        });

        describe('getStickerInfo', () => {
            test('should return sticker info', () => {
                const info = levelManager.getStickerInfo('purple');
                expect(info.emoji).toBe('🟣');
                expect(info.name).toBe('purple');
            });

            test('should return null for invalid sticker', () => {
                expect(levelManager.getStickerInfo('invalid')).toBeNull();
            });
        });

        describe('getAllStickerInfos', () => {
            test('should return all sticker definitions', () => {
                const infos = levelManager.getAllStickerInfos();
                expect(Object.keys(infos).length).toBe(6);
                expect(infos.purple.emoji).toBe('🟣');
            });
        });
    });

    describe('Persistence', () => {
        describe('save', () => {
            test('should save current state to localStorage', () => {
                levelManager.setLevel(3);
                levelManager.addProgress(1);
                levelManager.addSticker('purple');
                levelManager.save();

                const savedProgress = localStorage.getItem(mockConfig.STORAGE.PROGRESS);
                expect(savedProgress).not.toBeNull();
            });
        });

        describe('load', () => {
            test('should load saved state from localStorage', () => {
                const savedProgress = { level: 3, progress: 1 };
                const savedStickers = ['purple', 'orange'];

                localStorage.setItem(mockConfig.STORAGE.PROGRESS, JSON.stringify(savedProgress));
                localStorage.setItem(mockConfig.STORAGE.STICKERS, JSON.stringify(savedStickers));

                levelManager.load();

                expect(levelManager.getCurrentLevel()).toBe(3);
                expect(levelManager.getProgress()).toBe(1);
                expect(levelManager.getStickers()).toEqual(['purple', 'orange']);
            });

            test('should handle missing save data gracefully', () => {
                expect(() => levelManager.load()).not.toThrow();
                expect(levelManager.getCurrentLevel()).toBe(1);
            });

            test('should handle corrupted save data gracefully', () => {
                localStorage.setItem(mockConfig.STORAGE.PROGRESS, 'not-valid-json');
                expect(() => levelManager.load()).not.toThrow();
                expect(levelManager.getCurrentLevel()).toBe(1);
            });
        });

        describe('reset', () => {
            test('should reset all progress', () => {
                levelManager.setLevel(3);
                levelManager.addProgress(2);
                levelManager.addSticker('purple');
                levelManager.reset();

                expect(levelManager.getCurrentLevel()).toBe(1);
                expect(levelManager.getProgress()).toBe(0);
                expect(levelManager.getStickers()).toEqual([]);
            });
        });
    });

    describe('Event Callbacks', () => {
        test('should call onLevelChange callback', () => {
            const callback = vi.fn();
            levelManager.onLevelChange(callback);
            levelManager.nextLevel();
            expect(callback).toHaveBeenCalledWith(2, expect.any(Object));
        });

        test('should call onProgressChange callback', () => {
            const callback = vi.fn();
            levelManager.onProgressChange(callback);
            levelManager.addProgress();
            expect(callback).toHaveBeenCalledWith(1, expect.any(Object));
        });

        test('should call onStickerCollected callback', () => {
            const callback = vi.fn();
            levelManager.onStickerCollected(callback);
            levelManager.addSticker('purple');
            expect(callback).toHaveBeenCalledWith('purple', expect.any(Object));
        });

        test('should not call onStickerCollected for duplicate sticker', () => {
            const callback = vi.fn();
            levelManager.addSticker('purple');
            levelManager.onStickerCollected(callback);
            levelManager.addSticker('purple'); // Duplicate
            expect(callback).not.toHaveBeenCalled();
        });

        test('should call onLevelComplete callback when level done', () => {
            const callback = vi.fn();
            levelManager.onLevelComplete(callback);
            levelManager.addProgress(2); // Goal is 2
            expect(callback).toHaveBeenCalledWith(1, expect.any(Object));
        });
    });

    describe('destroy', () => {
        test('should clean up resources', () => {
            const callback = vi.fn();
            levelManager.onLevelChange(callback);
            levelManager.destroy();
            levelManager.nextLevel();
            expect(callback).not.toHaveBeenCalled();
        });
    });
});

describe('LevelManager Edge Cases', () => {
    let levelManager;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        levelManager = new LevelManager(mockConfig);
    });

    test('should handle rapid level changes', () => {
        for (let i = 0; i < 10; i++) {
            levelManager.nextLevel();
        }
        expect(levelManager.getCurrentLevel()).toBe(5); // Max level
    });

    test('should handle negative progress gracefully', () => {
        levelManager.addProgress(-1);
        expect(levelManager.getProgress()).toBe(0); // Should not go negative
    });

    test('should maintain state consistency after save/load cycle', () => {
        levelManager.setLevel(3);
        levelManager.addProgress(1);
        levelManager.addSticker('purple');
        levelManager.addSticker('orange');
        levelManager.save();

        // Create new manager and load
        const newManager = new LevelManager(mockConfig);
        newManager.load();

        expect(newManager.getCurrentLevel()).toBe(3);
        expect(newManager.getProgress()).toBe(1);
        expect(newManager.getStickers()).toEqual(['purple', 'orange']);
    });
});
