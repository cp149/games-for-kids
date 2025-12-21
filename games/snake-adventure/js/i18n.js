/**
 * Internationalization System
 * Supports: English, 中文, 日本語
 */

const I18N = {
    // Current language
    currentLang: 'en',

    // Translation strings
    messages: {
        en: {
            game_title: "Snake Adventure",
            score: "Score: {score}",
            length: "Length: {length}",
            pause: "Pause",
            resume: "Resume",
            restart: "Restart",
            game_over: "Game Over!",
            your_score: "Your Score: {score}",
            press_space: "Press SPACE to start",
            tap_to_start: "Tap to start",
            controls_info: "Arrow keys or swipe to control",
            speed_up: "Speed Up!",
            achievement: "Achievement: {length} segments!",
            settings: "Settings",
            music: "Music",
            sfx: "Sound Effects",
            language: "Language"
        },

        zh: {
            game_title: "贪吃蛇冒险",
            score: "分数: {score}",
            length: "长度: {length}",
            pause: "暂停",
            resume: "继续",
            restart: "重新开始",
            game_over: "游戏结束！",
            your_score: "你的分数: {score}",
            press_space: "按空格键开始",
            tap_to_start: "点击开始",
            controls_info: "方向键或滑动控制",
            speed_up: "加速了！",
            achievement: "成就: {length} 节蛇身！",
            settings: "设置",
            music: "音乐",
            sfx: "音效",
            language: "语言"
        },

        ja: {
            game_title: "スネークアドベンチャー",
            score: "スコア: {score}",
            length: "長さ: {length}",
            pause: "一時停止",
            resume: "再開",
            restart: "リスタート",
            game_over: "ゲームオーバー！",
            your_score: "あなたのスコア: {score}",
            press_space: "スペースキーでスタート",
            tap_to_start: "タップしてスタート",
            controls_info: "矢印キーかスワイプで操作",
            speed_up: "スピードアップ！",
            achievement: "実績: {length} セグメント！",
            settings: "設定",
            music: "音楽",
            sfx: "効果音",
            language: "言語"
        }
    },

    /**
     * Initialize i18n system
     * Loads saved language from localStorage
     */
    init() {
        const saved = localStorage.getItem('snake_lang');
        if (saved && this.messages[saved]) {
            this.currentLang = saved;
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.messages[browserLang]) {
                this.currentLang = browserLang;
            }
        }
    },

    /**
     * Get translated text
     * @param {string} key - Translation key
     * @param {Object} params - Parameters for interpolation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        let text = this.messages[this.currentLang][key] || key;

        // Replace parameters {param} with values
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });

        return text;
    },

    /**
     * Change language
     * @param {string} lang - Language code (en, zh, ja)
     */
    setLanguage(lang) {
        if (this.messages[lang]) {
            this.currentLang = lang;
            localStorage.setItem('snake_lang', lang);
            return true;
        }
        return false;
    },

    /**
     * Get available languages
     * @returns {Array} Array of {code, name} objects
     */
    getLanguages() {
        return [
            { code: 'en', name: 'English' },
            { code: 'zh', name: '中文' },
            { code: 'ja', name: '日本語' }
        ];
    }
};

// Initialize on load
I18N.init();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18N;
}
