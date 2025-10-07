/**
 * Unit tests for SimpleI18n
 *
 * Run with: npm test
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { SimpleI18n } from '../../i18n/SimpleI18n.js';

describe('SimpleI18n', () => {
    let i18n;
    const testTranslations = {
        en: {
            welcome: 'Welcome!',
            score: 'Score: {0}',
            greeting: 'Hello, {0}!',
            multiParam: '{0} has {1} items',
            nested: 'Value: {0}, {1}, {2}'
        },
        zh: {
            welcome: '欢迎！',
            score: '得分：{0}',
            greeting: '你好，{0}！',
            multiParam: '{0}有{1}个物品'
        },
        ja: {
            welcome: 'ようこそ！',
            score: 'スコア：{0}',
            greeting: 'こんにちは、{0}！'
        }
    };

    beforeEach(() => {
        i18n = new SimpleI18n('en');
    });

    describe('Constructor', () => {
        test('sets default language', () => {
            expect(i18n.getLanguage()).toBe('en');
        });

        test('initializes empty translations', () => {
            expect(i18n.getAvailableLanguages()).toEqual([]);
        });

        test('accepts custom default language', () => {
            const i18nZh = new SimpleI18n('zh');
            expect(i18nZh.getLanguage()).toBe('zh');
        });

        test('defaults to en if no language provided', () => {
            const i18nDefault = new SimpleI18n();
            expect(i18nDefault.getLanguage()).toBe('en');
        });
    });

    describe('addTranslations', () => {
        test('adds single language translations', () => {
            i18n.addTranslations({ en: { hello: 'Hello' } });
            expect(i18n.t('hello')).toBe('Hello');
        });

        test('adds multiple languages at once', () => {
            i18n.addTranslations(testTranslations);
            expect(i18n.getAvailableLanguages()).toContain('en');
            expect(i18n.getAvailableLanguages()).toContain('zh');
            expect(i18n.getAvailableLanguages()).toContain('ja');
        });

        test('merges with existing translations', () => {
            i18n.addTranslations({ en: { first: 'First' } });
            i18n.addTranslations({ en: { second: 'Second' } });
            expect(i18n.t('first')).toBe('First');
            expect(i18n.t('second')).toBe('Second');
        });

        test('overwrites existing keys', () => {
            i18n.addTranslations({ en: { msg: 'Original' } });
            i18n.addTranslations({ en: { msg: 'Updated' } });
            expect(i18n.t('msg')).toBe('Updated');
        });
    });

    describe('t (translate)', () => {
        beforeEach(() => {
            i18n.addTranslations(testTranslations);
        });

        test('returns simple translation', () => {
            expect(i18n.t('welcome')).toBe('Welcome!');
        });

        test('replaces single placeholder', () => {
            expect(i18n.t('score', 100)).toBe('Score: 100');
        });

        test('replaces multiple placeholders', () => {
            expect(i18n.t('multiParam', 'Alice', 5)).toBe('Alice has 5 items');
        });

        test('replaces all placeholders in order', () => {
            expect(i18n.t('nested', 'A', 'B', 'C')).toBe('Value: A, B, C');
        });

        test('returns key if translation not found', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            expect(i18n.t('nonexistent')).toBe('nonexistent');
            expect(consoleWarnSpy).toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
        });

        test('falls back to default language', () => {
            i18n.setLanguage('zh');
            expect(i18n.t('nested', 'X', 'Y', 'Z')).toBe('Value: X, Y, Z'); // Only in 'en'
        });

        test('logs warning for missing translation', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            i18n.t('missing_key');
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('Translation missing for key: "missing_key"')
            );
            consoleWarnSpy.mockRestore();
        });
    });

    describe('setLanguage', () => {
        beforeEach(() => {
            i18n.addTranslations(testTranslations);
        });

        test('changes current language', () => {
            i18n.setLanguage('zh');
            expect(i18n.getLanguage()).toBe('zh');
            expect(i18n.t('welcome')).toBe('欢迎！');
        });

        test('maintains language after change', () => {
            i18n.setLanguage('ja');
            expect(i18n.t('welcome')).toBe('ようこそ！');
            expect(i18n.getLanguage()).toBe('ja');
        });

        test('warns for unavailable language', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            i18n.setLanguage('fr');
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(i18n.getLanguage()).toBe('en'); // Should stay unchanged
            consoleWarnSpy.mockRestore();
        });

        test('notifies listeners on change', () => {
            const listener = vi.fn();
            i18n.onLanguageChange(listener);
            i18n.setLanguage('zh');
            expect(listener).toHaveBeenCalledWith('zh');
        });
    });

    describe('getLanguage', () => {
        test('returns current language', () => {
            expect(i18n.getLanguage()).toBe('en');
        });

        test('reflects language changes', () => {
            i18n.addTranslations({ zh: { test: 'test' } });
            i18n.setLanguage('zh');
            expect(i18n.getLanguage()).toBe('zh');
        });
    });

    describe('getAvailableLanguages', () => {
        test('returns empty array initially', () => {
            expect(i18n.getAvailableLanguages()).toEqual([]);
        });

        test('returns added languages', () => {
            i18n.addTranslations({ en: {}, zh: {}, ja: {} });
            const languages = i18n.getAvailableLanguages();
            expect(languages).toContain('en');
            expect(languages).toContain('zh');
            expect(languages).toContain('ja');
        });

        test('returns languages in consistent order', () => {
            i18n.addTranslations({ en: {}, zh: {}, ja: {} });
            const lang1 = i18n.getAvailableLanguages();
            const lang2 = i18n.getAvailableLanguages();
            expect(lang1).toEqual(lang2);
        });
    });

    describe('onLanguageChange', () => {
        beforeEach(() => {
            i18n.addTranslations({ en: {}, zh: {} });
        });

        test('registers listener', () => {
            const listener = vi.fn();
            i18n.onLanguageChange(listener);
            i18n.setLanguage('zh');
            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith('zh');
        });

        test('calls multiple listeners', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            i18n.onLanguageChange(listener1);
            i18n.onLanguageChange(listener2);
            i18n.setLanguage('zh');
            expect(listener1).toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();
        });

        test('handles listener errors gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const badListener = vi.fn(() => { throw new Error('Test error'); });
            const goodListener = vi.fn();

            i18n.onLanguageChange(badListener);
            i18n.onLanguageChange(goodListener);

            i18n.setLanguage('zh');

            expect(badListener).toHaveBeenCalled();
            expect(goodListener).toHaveBeenCalled(); // Should still be called
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('offLanguageChange', () => {
        test('removes listener', () => {
            const listener = vi.fn();
            i18n.addTranslations({ en: {}, zh: {} });
            i18n.onLanguageChange(listener);
            i18n.offLanguageChange(listener);
            i18n.setLanguage('zh');
            expect(listener).not.toHaveBeenCalled();
        });

        test('only removes specified listener', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();
            i18n.addTranslations({ en: {}, zh: {} });
            i18n.onLanguageChange(listener1);
            i18n.onLanguageChange(listener2);
            i18n.offLanguageChange(listener1);
            i18n.setLanguage('zh');
            expect(listener1).not.toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();
        });

        test('handles removing non-existent listener', () => {
            const listener = vi.fn();
            expect(() => i18n.offLanguageChange(listener)).not.toThrow();
        });
    });

    describe('hasKey', () => {
        beforeEach(() => {
            i18n.addTranslations(testTranslations);
        });

        test('returns true for existing key in current language', () => {
            expect(i18n.hasKey('welcome')).toBe(true);
        });

        test('returns true for key in default language', () => {
            i18n.setLanguage('zh');
            expect(i18n.hasKey('nested')).toBe(true); // Only in 'en'
        });

        test('returns false for non-existent key', () => {
            expect(i18n.hasKey('nonexistent')).toBe(false);
        });

        test('checks current language first', () => {
            i18n.setLanguage('zh');
            expect(i18n.hasKey('welcome')).toBe(true);
        });
    });

    describe('getAllTranslations', () => {
        beforeEach(() => {
            i18n.addTranslations(testTranslations);
        });

        test('returns all translations for current language', () => {
            const translations = i18n.getAllTranslations();
            expect(translations).toHaveProperty('welcome', 'Welcome!');
            expect(translations).toHaveProperty('score', 'Score: {0}');
        });

        test('returns translations for changed language', () => {
            i18n.setLanguage('zh');
            const translations = i18n.getAllTranslations();
            expect(translations).toHaveProperty('welcome', '欢迎！');
        });

        test('returns empty object for non-existent language', () => {
            i18n.setLanguage('fr'); // Non-existent, should stay 'en'
            const i18nNew = new SimpleI18n('nonexistent');
            const translations = i18nNew.getAllTranslations();
            expect(translations).toEqual({});
        });
    });

    describe('Edge cases', () => {
        test('handles empty translation strings', () => {
            i18n.addTranslations({ en: { empty: '' } });
            expect(i18n.t('empty')).toBe('');
        });

        test('handles special characters in keys', () => {
            i18n.addTranslations({ en: { 'special.key': 'Value' } });
            expect(i18n.t('special.key')).toBe('Value');
        });

        test('handles numbers as placeholder values', () => {
            i18n.addTranslations({ en: { count: 'Count: {0}' } });
            expect(i18n.t('count', 0)).toBe('Count: 0');
            expect(i18n.t('count', 123.45)).toBe('Count: 123.45');
        });

        test('handles boolean as placeholder values', () => {
            i18n.addTranslations({ en: { bool: 'Value: {0}' } });
            expect(i18n.t('bool', true)).toBe('Value: true');
            expect(i18n.t('bool', false)).toBe('Value: false');
        });

        test('handles excess placeholders', () => {
            i18n.addTranslations({ en: { msg: '{0} {1}' } });
            expect(i18n.t('msg', 'A', 'B', 'C', 'D')).toBe('A B');
        });

        test('handles missing placeholder values', () => {
            i18n.addTranslations({ en: { msg: '{0} {1} {2}' } });
            expect(i18n.t('msg', 'A')).toBe('A {1} {2}');
        });
    });

    describe('Integration scenarios', () => {
        test('full workflow: add, translate, switch, translate', () => {
            i18n.addTranslations(testTranslations);
            expect(i18n.t('greeting', 'Alice')).toBe('Hello, Alice!');
            i18n.setLanguage('zh');
            expect(i18n.t('greeting', 'Alice')).toBe('你好，Alice！');
        });

        test('listener updates UI on language change', () => {
            const uiUpdater = vi.fn((lang) => {
                // Simulate UI update
                return i18n.t('welcome');
            });

            i18n.addTranslations(testTranslations);
            i18n.onLanguageChange(uiUpdater);

            i18n.setLanguage('ja');
            expect(uiUpdater).toHaveBeenCalledWith('ja');
        });

        test('multiple instances are independent', () => {
            const i18n1 = new SimpleI18n('en');
            const i18n2 = new SimpleI18n('zh');

            i18n1.addTranslations({ en: { msg: 'English' } });
            i18n2.addTranslations({ zh: { msg: 'Chinese' } });

            expect(i18n1.t('msg')).toBe('English');
            expect(i18n2.t('msg')).toBe('Chinese');
        });
    });
});
