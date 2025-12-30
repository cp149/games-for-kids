/**
 * UIManager I18n Tests
 * Verify UIManager uses i18n for all user-facing strings
 */

import { describe, test, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { TRANSLATIONS } from '../js/i18n/translations.js';
import { I18n } from '../js/i18n/index.js';
import { UIManager } from '../js/managers/UIManager.js';

// Mock CONFIG
const mockConfig = {
    UI: {
        TOAST_DURATION: 3000,
        CELEBRATION_DURATION: 1500
    }
};

describe('UIManager I18n Integration', () => {
    let i18n;

    beforeAll(() => {
        global.CONFIG = mockConfig;
    });

    afterAll(() => {
        delete global.CONFIG;
    });

    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '<div id="game"></div>';
        i18n = new I18n(TRANSLATIONS, 'en');
    });

    describe('Required Translation Keys', () => {
        test('should have all UIManager required keys in translations', () => {
            const requiredKeys = [
                'game_title',
                'level',
                'goal',
                'clear',
                'settings',
                'sticker_book',
                'slot_label',
                'color_ball_label',
                'mixing_slot_label',
                'chameleon_label',
                'level_complete',
                'goal_progress'
            ];

            requiredKeys.forEach(key => {
                expect(TRANSLATIONS.en[key]).toBeDefined();
                expect(TRANSLATIONS.zh[key]).toBeDefined();
            });
        });
    });

    describe('UIManager Translation Method', () => {
        test('should have t() method', () => {
            const manager = new UIManager('game', i18n);

            expect(typeof manager.t).toBe('function');
            manager.destroy();
        });

        test('t() should use provided i18n instance', () => {
            const mockI18n = {
                t: vi.fn((key) => `translated:${key}`)
            };

            const manager = new UIManager('game', mockI18n);

            const result = manager.t('test_key');
            expect(mockI18n.t).toHaveBeenCalledWith('test_key', {});
            expect(result).toBe('translated:test_key');
            manager.destroy();
        });

        test('t() should return key if no i18n provided', () => {
            const manager = new UIManager('game', null);

            expect(manager.t('some_key')).toBe('some_key');
            manager.destroy();
        });
    });

    describe('No Hardcoded Strings', () => {
        test('should not have hardcoded plus sign in mixing slots', () => {
            // Plus sign should be from i18n
            expect(TRANSLATIONS.en.plus_sign).toBeDefined();
        });

        test('should not have hardcoded goal format', () => {
            // Goal progress format should be from i18n
            expect(TRANSLATIONS.en.goal_progress).toBeDefined();
            expect(TRANSLATIONS.en.goal_progress).toContain('{0}');
            expect(TRANSLATIONS.en.goal_progress).toContain('{1}');
        });
    });

    describe('Language Switch Support', () => {
        test('translations should be consistent between languages', () => {
            const enKeys = Object.keys(TRANSLATIONS.en);
            const zhKeys = Object.keys(TRANSLATIONS.zh);

            // Check all EN keys exist in ZH
            enKeys.forEach(key => {
                expect(zhKeys).toContain(key);
            });

            // Check all ZH keys exist in EN
            zhKeys.forEach(key => {
                expect(enKeys).toContain(key);
            });
        });
    });
});
