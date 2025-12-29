/**
 * I18n - Internationalization utility for Color Mix Lab
 * Handles language detection, switching, and translation
 */

class I18n {
    constructor(messages, defaultLang = 'en') {
        this.messages = messages;
        this.defaultLang = defaultLang;
        this.currentLang = this.detectLanguage();
        this.onLanguageChange = null;
    }

    /**
     * Detect browser language preference
     * @returns {string} Language code
     */
    detectLanguage() {
        // Use pre-detected language if available
        if (typeof window !== 'undefined' && window._initialLang) {
            return window._initialLang;
        }

        // Check localStorage
        if (typeof localStorage !== 'undefined') {
            const savedLang = localStorage.getItem('color-mix-lab-lang');
            if (savedLang && this.messages[savedLang]) {
                return savedLang;
            }
        }

        // Check browser language
        if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language || navigator.userLanguage;
            const langCode = browserLang.split('-')[0];
            if (this.messages[langCode]) {
                return langCode;
            }
        }

        return this.defaultLang;
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Set active language
     * @param {string} lang - Language code
     */
    setLanguage(lang) {
        if (!this.messages[lang]) {
            // Safe logging - don't throw in production
            if (typeof console !== 'undefined' && console.warn) {
                try {
                    console.warn(`[I18n] Language "${lang}" not supported`);
                } catch {
                    // Ignore logging failures
                }
            }
            return;
        }

        this.currentLang = lang;

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('color-mix-lab-lang', lang);
        }

        if (this.onLanguageChange) {
            this.onLanguageChange(lang);
        }
    }

    /**
     * Translate a key with optional parameters
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const messages = this.messages[this.currentLang];
        if (!messages) {
            return key;
        }

        let text = messages[key];
        if (!text) {
            return key;
        }

        // Replace parameters: {0}, {1}, or {name}
        Object.keys(params).forEach(param => {
            const placeholder = `{${param}}`;
            text = text.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), params[param]);
        });

        return text;
    }

    /**
     * Get all available languages
     * @returns {string[]} Language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.messages);
    }

    /**
     * Update all elements with data-i18n attribute
     */
    updateDOM() {
        if (typeof document === 'undefined') return;

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const paramsAttr = element.getAttribute('data-i18n-params');

            if (paramsAttr) {
                try {
                    const params = JSON.parse(paramsAttr);
                    element.textContent = this.t(key, params);
                } catch (e) {
                    element.textContent = this.t(key);
                }
            } else {
                element.textContent = this.t(key);
            }
        });
    }
}

// Global instance
let i18nInstance = null;

/**
 * Initialize i18n system
 * @param {Object} messages - Translation messages
 * @param {string} defaultLang - Default language
 * @returns {I18n} I18n instance
 */
function initI18n(messages, defaultLang = 'en') {
    i18nInstance = new I18n(messages, defaultLang);
    return i18nInstance;
}

/**
 * Get global i18n instance
 * @returns {I18n|null} I18n instance
 */
function getI18n() {
    return i18nInstance;
}

// Browser export
if (typeof window !== 'undefined') {
    window.I18n = I18n;
    window.initI18n = initI18n;
    window.getI18n = getI18n;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, initI18n, getI18n };
}
