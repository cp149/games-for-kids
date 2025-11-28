/**
 * I18n System for Chain Reaction Lab
 * Supports English and Chinese
 */

const messages = {
  en: {
    // Game Info
    game_title: "Chain Reaction Lab",
    game_subtitle: "Connect • React • Solve",

    // UI Elements
    level: "Level",
    goal: "Goal",
    moves: "Moves",
    time: "Time",

    // Goals
    unlock_door: "Unlock the door",
    activate_all: "Activate all buttons",
    reach_exit: "Reach the exit",

    // Tutorial
    tutorial_welcome: "Welcome to the Lab!",
    tutorial_1: "Click buttons to activate mechanisms",
    tutorial_2: "Watch the energy flow through connections",
    tutorial_3: "Create chain reactions to solve puzzles",
    tutorial_got_it: "Got it!",
    tutorial_next: "Next",
    tutorial_skip: "Skip Tutorial",

    // Success
    success_title: "PUZZLE SOLVED!",
    success_perfect: "Perfect!",
    success_great: "Great!",
    success_nice: "Nice!",
    next_level: "Next Level",
    replay: "Replay",

    // Controls
    restart: "Restart",
    hint: "Hint",
    settings: "Settings",

    // Settings
    language: "Language",
    sound_effects: "Sound Effects",
    background_music: "Background Music",
    particle_effects: "Particle Effects",

    // Loading
    loading: "Initializing systems...",
    loading_complete: "Ready!",

    // Hints
    hint_button: "Try clicking this button",
    hint_sequence: "Check the order of activation",
    hint_connection: "Follow the energy connections",

    // Errors
    error_no_move: "Can't move there",
    error_locked: "Door is locked"
  },

  zh: {
    // Game Info
    game_title: "连锁反应实验室",
    game_subtitle: "连接 • 反应 • 解谜",

    // UI Elements
    level: "关卡",
    goal: "目标",
    moves: "步数",
    time: "时间",

    // Goals
    unlock_door: "解锁门",
    activate_all: "激活所有按钮",
    reach_exit: "到达出口",

    // Tutorial
    tutorial_welcome: "欢迎来到实验室！",
    tutorial_1: "点击按钮激活机关",
    tutorial_2: "观察能量流动",
    tutorial_3: "创造连锁反应来解谜",
    tutorial_got_it: "明白了！",
    tutorial_next: "下一步",
    tutorial_skip: "跳过教程",

    // Success
    success_title: "解谜成功！",
    success_perfect: "完美！",
    success_great: "很棒！",
    success_nice: "不错！",
    next_level: "下一关",
    replay: "重玩",

    // Controls
    restart: "重新开始",
    hint: "提示",
    settings: "设置",

    // Settings
    language: "语言",
    sound_effects: "音效",
    background_music: "背景音乐",
    particle_effects: "粒子效果",

    // Loading
    loading: "系统初始化中...",
    loading_complete: "准备完毕！",

    // Hints
    hint_button: "试试点击这个按钮",
    hint_sequence: "检查激活顺序",
    hint_connection: "跟随能量连接",

    // Errors
    error_no_move: "无法移动到那里",
    error_locked: "门已锁定"
  }
};

class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.messages = messages;
  }

  detectLanguage() {
    // Check localStorage first
    const saved = localStorage.getItem('chainReactionLab_language');
    if (saved && messages[saved]) {
      return saved;
    }

    // Detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }

    return 'en'; // Default to English
  }

  setLanguage(lang) {
    if (messages[lang]) {
      this.currentLang = lang;
      localStorage.setItem('chainReactionLab_language', lang);
      this.updateUI();
    }
  }

  t(key, params = {}) {
    let text = this.messages[this.currentLang][key] || key;

    // Replace parameters
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  }

  updateUI() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });

    // Update all elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    // Update language selector
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = this.currentLang;
    }
  }

  getCurrentLanguage() {
    return this.currentLang;
  }
}

// Create global instance
const i18n = new I18n();

export default i18n;
