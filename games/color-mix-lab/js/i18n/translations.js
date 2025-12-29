/**
 * Color Mix Lab - Translations
 * All user-facing strings for internationalization
 */

const TRANSLATIONS = {
    en: {
        // Game title
        game_title: 'Color Mix Lab',

        // Level info
        level: 'Level {0}',

        // UI elements
        goal: 'Goal',
        clear: 'Clear',
        settings: 'Settings',
        sticker_book: 'Sticker Book',

        // Slot labels
        slot_label: 'Slot {0}',

        // Toast messages
        welcome: 'Welcome to Color Mix Lab!',
        level_not_found: 'Level not found',
        settings_coming: 'Settings coming soon!',
        sticker_coming: 'Sticker book coming soon!',
        slot_full: 'Slot is full! Clear first.',
        mud_message: 'Eww! Mud!',
        mixed_color: 'Mixed {0}!',

        // Color names
        color_purple: 'PURPLE',
        color_orange: 'ORANGE',
        color_green: 'GREEN',
        color_burst: 'BURST',
        color_splash: 'SPLASH',
        color_flash: 'FLASH',

        // Accessibility
        color_ball_label: '{0} color ball',
        mixing_slot_label: 'Mixing slot {0}, empty',
        chameleon_label: 'Chameleon',

        // UI elements (additional)
        plus_sign: '+',
        goal_progress: '{0}/{1}',
        level_complete: 'Level Complete!'
    },
    zh: {
        // Game title
        game_title: '调色实验室',

        // Level info
        level: '第 {0} 关',

        // UI elements
        goal: '目标',
        clear: '清除',
        settings: '设置',
        sticker_book: '贴纸册',

        // Slot labels
        slot_label: '槽位 {0}',

        // Toast messages
        welcome: '欢迎来到调色实验室！',
        level_not_found: '关卡未找到',
        settings_coming: '设置功能即将推出！',
        sticker_coming: '贴纸册即将推出！',
        slot_full: '槽位已满！请先清除。',
        mud_message: '呃！变成泥巴了！',
        mixed_color: '混出了{0}！',

        // Color names
        color_purple: '紫色',
        color_orange: '橙色',
        color_green: '绿色',
        color_burst: '爆裂',
        color_splash: '水花',
        color_flash: '闪光',

        // Accessibility
        color_ball_label: '{0}色球',
        mixing_slot_label: '混合槽 {0}，空',
        chameleon_label: '变色龙',

        // UI elements (additional)
        plus_sign: '+',
        goal_progress: '{0}/{1}',
        level_complete: '过关啦！'
    }
};

// Export for Node.js tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TRANSLATIONS;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.TRANSLATIONS = TRANSLATIONS;
}
