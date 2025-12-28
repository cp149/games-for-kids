/**
 * I18n - Internationalization utility
 * Handles language detection, switching, and translation
 */

class I18n {
  constructor(messages, defaultLang = 'en') {
    this.messages = messages;
    this.defaultLang = defaultLang;
    this.currentLang = this.detectLanguage();

    // Callbacks for language change
    this.onLanguageChange = null;
  }

  /**
   * Detect browser language
   */
  detectLanguage() {
    // Use pre-detected language from inline script if available
    if (window._initialLang) {
      return window._initialLang;
    }

    // Check localStorage first
    const savedLang = localStorage.getItem('chemistry-lab-lang');
    if (savedLang && this.messages[savedLang]) {
      return savedLang;
    }

    // Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // 'en-US' -> 'en'

    // Return if we support this language, otherwise default
    return this.messages[langCode] ? langCode : this.defaultLang;
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    if (!this.messages[lang]) {
      console.warn(`Language "${lang}" not supported, using default`);
      return;
    }

    this.currentLang = lang;
    localStorage.setItem('chemistry-lab-lang', lang);

    // Trigger callback
    if (this.onLanguageChange) {
      this.onLanguageChange(lang);
    }
  }

  /**
   * Translate a key with optional parameters
   * @param {string} key - Translation key
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated text
   */
  t(key, params = {}) {
    const messages = this.messages[this.currentLang];
    if (!messages) {
      console.warn(`Language "${this.currentLang}" not found`);
      return key;
    }

    let text = messages[key];
    if (!text) {
      console.warn(`Translation key "${key}" not found for language "${this.currentLang}"`);
      return key;
    }

    // Replace parameters
    Object.keys(params).forEach(param => {
      const placeholder = `{${param}}`;
      text = text.replace(placeholder, params[param]);
    });

    return text;
  }

  /**
   * Get all available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.messages);
  }

  /**
   * Update all elements with data-i18n attribute
   */
  updateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const params = element.getAttribute('data-i18n-params');

      if (params) {
        try {
          const parsedParams = JSON.parse(params);
          element.textContent = this.t(key, parsedParams);
        } catch (e) {
          console.error('Invalid JSON in data-i18n-params:', params);
          element.textContent = this.t(key);
        }
      } else {
        element.textContent = this.t(key);
      }
    });
  }
}

// Create global instance
let i18n = null;

/**
 * Initialize i18n system
 */
function initI18n(messages, defaultLang = 'en') {
  i18n = new I18n(messages, defaultLang);
  return i18n;
}

/**
 * Get global i18n instance
 */
function getI18n() {
  if (!i18n) {
    console.warn('I18n not initialized');
  }
  return i18n;
}

// Export for browser
if (typeof window !== 'undefined') {
  window.I18n = I18n;
  window.initI18n = initI18n;
  window.getI18n = getI18n;
}

// Export for Node.js (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18n, initI18n, getI18n };
}
