/**
 * SimpleI18n - Lightweight internationalization system
 *
 * Provides multi-language support for games with:
 * - Dynamic language switching
 * - Translation key lookup
 * - Fallback to default language
 * - Event-based updates
 *
 * @example
 * const i18n = new SimpleI18n('en');
 * i18n.addTranslations({
 *   en: { welcome: "Welcome!", score: "Score: {0}" },
 *   zh: { welcome: "欢迎！", score: "得分：{0}" },
 *   ja: { welcome: "ようこそ！", score: "スコア：{0}" }
 * });
 * console.log(i18n.t('welcome')); // "Welcome!"
 * i18n.setLanguage('zh');
 * console.log(i18n.t('score', 100)); // "得分：100"
 */
export class SimpleI18n {
    /**
     * @param {string} defaultLang - Default language code (e.g., 'en', 'zh', 'ja')
     */
    constructor(defaultLang = 'en') {
        this.currentLang = defaultLang;
        this.defaultLang = defaultLang;
        this.translations = {};
        this.listeners = [];
    }

    /**
     * Add translations for multiple languages
     * @param {Object} translations - Object with language codes as keys
     * @example
     * i18n.addTranslations({
     *   en: { key: "value" },
     *   zh: { key: "值" }
     * });
     */
    addTranslations(translations) {
        Object.keys(translations).forEach(lang => {
            if (!this.translations[lang]) {
                this.translations[lang] = {};
            }
            Object.assign(this.translations[lang], translations[lang]);
        });
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {...any} params - Parameters for placeholder replacement
     * @returns {string} Translated text or key if not found
     * @example
     * i18n.t('welcome')           // "Welcome!"
     * i18n.t('score', 100)        // "Score: 100"
     * i18n.t('msg', 'Alice', 5)   // "Alice has 5 items"
     */
    t(key, ...params) {
        const langData = this.translations[this.currentLang] || this.translations[this.defaultLang] || {};
        let text = langData[key];

        // Fallback to default language if not found
        if (!text && this.currentLang !== this.defaultLang) {
            text = this.translations[this.defaultLang]?.[key];
        }

        // If still not found, return the key itself
        if (!text) {
            console.warn(`Translation missing for key: "${key}" in language: "${this.currentLang}"`);
            return key;
        }

        // Replace placeholders {0}, {1}, etc.
        if (params.length > 0) {
            params.forEach((param, index) => {
                text = text.replace(`{${index}}`, param);
            });
        }

        return text;
    }

    /**
     * Change current language
     * @param {string} lang - Language code
     * @fires languageChanged
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.notifyListeners();
        } else {
            console.warn(`Language "${lang}" not found. Available: ${Object.keys(this.translations).join(', ')}`);
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Get all available languages
     * @returns {string[]} Array of language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    /**
     * Register listener for language changes
     * @param {Function} callback - Function to call when language changes
     * @example
     * i18n.onLanguageChange(() => {
     *   updateUI();
     * });
     */
    onLanguageChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove language change listener
     * @param {Function} callback - Callback to remove
     */
    offLanguageChange(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of language change
     * @private
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentLang);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        });
    }

    /**
     * Check if a translation key exists
     * @param {string} key - Translation key to check
     * @returns {boolean} True if key exists in current or default language
     */
    hasKey(key) {
        return !!(this.translations[this.currentLang]?.[key] ||
                  this.translations[this.defaultLang]?.[key]);
    }

    /**
     * Get all translations for current language
     * @returns {Object} All translations for current language
     */
    getAllTranslations() {
        return this.translations[this.currentLang] || {};
    }
}
