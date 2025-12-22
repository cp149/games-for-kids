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
            // Game info
            game_title: "Path Race",
            player: "Player",
            ai_opponent: "AI Opponent",
            level: "Level {level}",

            // Stats
            moves: "Moves",
            time: "Time",
            status: "Status",
            progress: "Progress",

            // Buttons
            start_race: "Start Race",
            undo: "Undo",
            restart: "Restart",
            retry: "Retry",
            next_level: "Next Level",

            // Results
            you_win: "You Win! 🎉",
            ai_wins: "AI Wins! Try Again! 🤖",
            your_time: "Your Time:",
            your_moves: "Your Moves:",
            undo_used: "Undos Used:",

            // Instructions
            how_to_play: "How to Play",
            rule_start: "Click the green dot to start",
            rule_visit: "Visit every dot exactly once",
            rule_direction: "Only move up/down/left/right",
            rule_end: "Reach the red dot to finish",
            rule_race: "Beat the AI to win!",

            // Status messages
            ready: "Ready",
            thinking: "Thinking...",
            exploring: "Exploring",
            found_solution: "Found Path!",
            racing: "Racing",
            finished: "Finished",

            // Countdown
            countdown_ready: "Ready...",
            countdown_set: "Set...",
            countdown_go: "GO!",

            // Notifications
            invalid_move: "Invalid move! Must move to neighbor.",
            all_dots_visited: "All dots visited! Now reach red dot.",
            path_complete: "Path complete!",
        },

        zh: {
            // 游戏信息
            game_title: "路径竞速",
            player: "玩家",
            ai_opponent: "AI对手",
            level: "关卡 {level}",

            // 统计
            moves: "步数",
            time: "时间",
            status: "状态",
            progress: "进度",

            // 按钮
            start_race: "开始比赛",
            undo: "撤销",
            restart: "重新开始",
            retry: "重试",
            next_level: "下一关",

            // 结果
            you_win: "你赢了！🎉",
            ai_wins: "AI获胜！再试试！🤖",
            your_time: "你的时间:",
            your_moves: "你的步数:",
            undo_used: "撤销次数:",

            // 说明
            how_to_play: "如何游玩",
            rule_start: "点击绿色圆点开始",
            rule_visit: "每个点只能访问一次",
            rule_direction: "只能上下左右移动",
            rule_end: "到达红色圆点完成",
            rule_race: "击败AI获胜！",

            // 状态消息
            ready: "准备",
            thinking: "思考中...",
            exploring: "探索中",
            found_solution: "找到路径！",
            racing: "竞速中",
            finished: "已完成",

            // 倒计时
            countdown_ready: "准备...",
            countdown_set: "预备...",
            countdown_go: "开始！",

            // 通知
            invalid_move: "无效移动！必须移动到相邻点。",
            all_dots_visited: "所有点已访问！现在到达红点。",
            path_complete: "路径完成！",
        },

        ja: {
            // ゲーム情報
            game_title: "パスレース",
            player: "プレイヤー",
            ai_opponent: "AI対戦相手",
            level: "レベル {level}",

            // 統計
            moves: "移動",
            time: "時間",
            status: "ステータス",
            progress: "進捗",

            // ボタン
            start_race: "レース開始",
            undo: "元に戻す",
            restart: "再スタート",
            retry: "リトライ",
            next_level: "次のレベル",

            // 結果
            you_win: "勝利！🎉",
            ai_wins: "AIの勝利！もう一度！🤖",
            your_time: "あなたのタイム:",
            your_moves: "あなたの移動:",
            undo_used: "使用した元に戻す:",

            // 説明
            how_to_play: "遊び方",
            rule_start: "緑の点をクリックして開始",
            rule_visit: "各点を一度だけ訪問",
            rule_direction: "上下左右のみ移動可能",
            rule_end: "赤い点に到達して完了",
            rule_race: "AIを倒して勝利！",

            // ステータスメッセージ
            ready: "準備完了",
            thinking: "思考中...",
            exploring: "探索中",
            found_solution: "パス発見！",
            racing: "レース中",
            finished: "完了",

            // カウントダウン
            countdown_ready: "準備...",
            countdown_set: "用意...",
            countdown_go: "スタート！",

            // 通知
            invalid_move: "無効な移動！隣接点に移動する必要があります。",
            all_dots_visited: "すべての点を訪問しました！赤い点に到達してください。",
            path_complete: "パス完了！",
        }
    },

    /**
     * Initialize i18n system
     * Loads saved language from localStorage
     */
    init() {
        const saved = localStorage.getItem(CONFIG.STORAGE.LANGUAGE);
        if (saved && this.messages[saved]) {
            this.currentLang = saved;
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.messages[browserLang]) {
                this.currentLang = browserLang;
            }
        }

        // Update all data-i18n elements
        this.updateDOM();
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
            localStorage.setItem(CONFIG.STORAGE.LANGUAGE, lang);
            this.updateDOM();
            return true;
        }
        return false;
    },

    /**
     * Update all DOM elements with data-i18n attribute
     */
    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Update page title
        document.title = `🏁 ${this.t('game_title')} - AI vs Player Puzzle Game`;
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
    },

    /**
     * Cycle to next language
     * Useful for language button toggle
     */
    cycleLanguage() {
        const langs = ['en', 'zh', 'ja'];
        const currentIndex = langs.indexOf(this.currentLang);
        const nextIndex = (currentIndex + 1) % langs.length;
        this.setLanguage(langs[nextIndex]);
    }
};

// Initialize on load
I18N.init();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18N;
}
