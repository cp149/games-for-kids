/**
 * I18n Infrastructure Tests
 * Contract tests for internationalization system
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { TRANSLATIONS } from '../js/i18n/translations.js';
import { I18n } from '../js/i18n/index.js';

describe('I18n Infrastructure', () => {
    describe('Translations Completeness', () => {
        const languages = Object.keys(TRANSLATIONS);

        test('should have at least en and zh translations', () => {
            expect(languages).toContain('en');
            expect(languages).toContain('zh');
        });

        test('should have same keys in all languages', () => {
            const enKeys = Object.keys(TRANSLATIONS.en).sort();
            const zhKeys = Object.keys(TRANSLATIONS.zh).sort();
            expect(zhKeys).toEqual(enKeys);
        });

        test('should have required UI keys', () => {
            const requiredKeys = [
                'game_title',
                'level',
                'goal',
                'clear',
                'settings',
                'sticker_book',
                'welcome',
                'mud_message'
            ];

            requiredKeys.forEach(key => {
                expect(TRANSLATIONS.en[key]).toBeDefined();
                expect(TRANSLATIONS.zh[key]).toBeDefined();
            });
        });

        test('should have color name keys', () => {
            const colorKeys = [
                'color_purple',
                'color_orange',
                'color_green'
            ];

            colorKeys.forEach(key => {
                expect(TRANSLATIONS.en[key]).toBeDefined();
                expect(TRANSLATIONS.zh[key]).toBeDefined();
            });
        });

        test('should have accessibility keys', () => {
            const a11yKeys = [
                'color_ball_label',
                'mixing_slot_label',
                'chameleon_label'
            ];

            a11yKeys.forEach(key => {
                expect(TRANSLATIONS.en[key]).toBeDefined();
                expect(TRANSLATIONS.zh[key]).toBeDefined();
            });
        });

        test('should not have empty translations', () => {
            languages.forEach(lang => {
                Object.entries(TRANSLATIONS[lang]).forEach(([key, value]) => {
                    expect(value).toBeTruthy();
                    expect(typeof value).toBe('string');
                    expect(value.trim().length).toBeGreaterThan(0);
                });
            });
        });
    });

    describe('I18n Class Contract', () => {
        let i18n;

        beforeEach(() => {
            i18n = new I18n(TRANSLATIONS, 'en');
        });

        test('should have t() method for translation', () => {
            expect(typeof i18n.t).toBe('function');
        });

        test('should translate simple keys', () => {
            expect(i18n.t('game_title')).toBe('Color Mix Lab');
        });

        test('should support parameter interpolation with {0}', () => {
            // Pattern: {0} for positional params
            expect(i18n.t('level', { '0': 5 })).toBe('Level 5');
        });

        test('should return key if translation missing', () => {
            expect(i18n.t('nonexistent_key')).toBe('nonexistent_key');
        });

        test('should have getCurrentLanguage() method', () => {
            expect(typeof i18n.getCurrentLanguage).toBe('function');
            expect(i18n.getCurrentLanguage()).toBe('en');
        });

        test('should have setLanguage() method', () => {
            expect(typeof i18n.setLanguage).toBe('function');
            i18n.setLanguage('zh');
            expect(i18n.getCurrentLanguage()).toBe('zh');
        });

        test('should translate in current language', () => {
            expect(i18n.t('game_title')).toBe('Color Mix Lab');
            i18n.setLanguage('zh');
            expect(i18n.t('game_title')).toBe('调色实验室');
        });

        test('should have getAvailableLanguages() method', () => {
            expect(typeof i18n.getAvailableLanguages).toBe('function');
            const langs = i18n.getAvailableLanguages();
            expect(langs).toContain('en');
            expect(langs).toContain('zh');
        });
    });

    describe('I18n Module Exports', () => {
        test('should export I18n class', () => {
            expect(I18n).toBeDefined();
            expect(typeof I18n).toBe('function');
        });

        test('I18n should be instantiable', () => {
            const instance = new I18n(TRANSLATIONS, 'en');
            expect(instance).toBeInstanceOf(I18n);
        });
    });
});
