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
    hint: "Hint",
    hint_button: "Try clicking this button",
    hint_sequence: "Check the order of activation",
    hint_connection: "Follow the energy connections",

    // Difficulty
    random: "Random",
    random_level: "Random Level",
    choose_difficulty: "Choose difficulty level:",
    diff_easy: "Easy",
    diff_basic: "Basic",
    diff_medium: "Medium",
    diff_hard: "Hard",
    diff_expert: "Expert",
    diff_challenging: "Challenging",
    diff_veryhard: "Very Hard",
    diff_extreme: "Extreme",
    diff_nightmare: "Nightmare",
    diff_master: "Master",
    diff_easy_desc: "1 button, simple",
    diff_basic_desc: "2 buttons + relay",
    diff_medium_desc: "Logic gates",
    diff_hard_desc: "Multiple gates",
    diff_expert_desc: "6 gates, 3 layers",
    diff_challenging_desc: "8 gates, 5 relays",
    diff_veryhard_desc: "10 gates, 6 relays",
    diff_extreme_desc: "12 gates, 7 relays",
    diff_nightmare_desc: "14 gates, 8 relays",
    diff_master_desc: "16 gates, 9 relays",

    // Game Complete
    game_complete: "Congratulations!",
    complete_all_levels: "You completed all levels!",
    complete_hint: "Try the infinite random levels for more challenges!",
    restart_game: "Restart from Level 1",
    play_random: "🎲 Play Random Levels",

    // Errors
    error_no_move: "Can't move there",
    error_locked: "Door is locked",

    // Level Titles
    level_title_0: "First Connection",
    level_title_1: "Double Trigger",
    level_title_2: "Chain Link",
    level_title_3: "Power Grid",
    level_title_4: "Synchronized",
    level_title_5: "Network Flow",
    level_title_6: "Circuit Board",
    level_title_7: "Energy Web",
    level_title_8: "Master Link",
    level_title_9: "Final Test",

    // Level Descriptions
    level_desc_0: "Learn the basics - click a button to activate the door",
    level_desc_1: "Both buttons must be activated",
    level_desc_2: "One button triggers a relay",
    level_desc_3: "All buttons must be active",
    level_desc_4: "Chain through multiple relays",
    level_desc_5: "Crossing paths - watch the connections",
    level_desc_6: "Four corners, one goal",
    level_desc_7: "One source, two paths",
    level_desc_8: "Both buttons needed",
    level_desc_9: "Any button works",
    level_desc_10: "Logic gate with delay",
    level_desc_11: "Exactly one button",
    level_desc_12: "Compare two gates",
    level_desc_13: "XOR challenge",
    level_desc_14: "AND + OR + XOR",
    level_desc_15: "Combine everything",
    level_desc_16: "Leave buttons OFF",
    level_desc_17: "Reverse then combine",
    level_desc_18: "NOT both buttons",
    level_desc_19: "NOT any button",
    level_desc_20: "All gates combined",

    // Random Level Titles
    random_title_simple: "Simple Circuit",
    random_title_0: "Logic Gate Challenge",
    random_title_1: "Circuit Puzzle",
    random_title_2: "Gate Network",
    random_title_3: "Complex Circuit",
    random_title_4: "Master Circuit",
    random_title_default: "Random Level",

    // Random Level Descriptions
    random_desc_multi: "Activate {count} logic gates to unlock the door",
    random_desc_default: "Press buttons to unlock the door"
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
    hint: "提示",
    hint_button: "试试点击这个按钮",
    hint_sequence: "检查激活顺序",
    hint_connection: "跟随能量连接",

    // Difficulty
    random: "随机",
    random_level: "随机关卡",
    choose_difficulty: "选择难度等级：",
    diff_easy: "简单",
    diff_basic: "基础",
    diff_medium: "中等",
    diff_hard: "困难",
    diff_expert: "专家",
    diff_challenging: "挑战",
    diff_veryhard: "非常困难",
    diff_extreme: "极限",
    diff_nightmare: "噩梦",
    diff_master: "大师",
    diff_easy_desc: "1个按钮，简单",
    diff_basic_desc: "2个按钮+中继",
    diff_medium_desc: "逻辑门",
    diff_hard_desc: "多个门",
    diff_expert_desc: "6个门，3层",
    diff_challenging_desc: "8个门，5个中继",
    diff_veryhard_desc: "10个门，6个中继",
    diff_extreme_desc: "12个门，7个中继",
    diff_nightmare_desc: "14个门，8个中继",
    diff_master_desc: "16个门，9个中继",

    // Game Complete
    game_complete: "恭喜！",
    complete_all_levels: "你已完成所有关卡！",
    complete_hint: "试试无限随机关卡，获得更多挑战！",
    restart_game: "从第1关重新开始",
    play_random: "🎲 玩随机关卡",

    // Errors
    error_no_move: "无法移动到那里",
    error_locked: "门已锁定",

    // Level Titles
    level_title_0: "初次连接",
    level_title_1: "双重触发",
    level_title_2: "链式连接",
    level_title_3: "电力网格",
    level_title_4: "同步运行",
    level_title_5: "网络流动",
    level_title_6: "电路板",
    level_title_7: "能量之网",
    level_title_8: "主链接",
    level_title_9: "最终测试",

    // Level Descriptions
    level_desc_0: "学习基础 - 点击按钮激活门",
    level_desc_1: "两个按钮都必须激活",
    level_desc_2: "一个按钮触发中继",
    level_desc_3: "所有按钮都必须激活",
    level_desc_4: "通过多个中继链接",
    level_desc_5: "交叉路径 - 观察连接",
    level_desc_6: "四个角落，一个目标",
    level_desc_7: "一个源，两条路径",
    level_desc_8: "需要两个按钮",
    level_desc_9: "任意按钮都可以",
    level_desc_10: "带延迟的逻辑门",
    level_desc_11: "恰好一个按钮",
    level_desc_12: "比较两个门",
    level_desc_13: "异或挑战",
    level_desc_14: "与门 + 或门 + 异或门",
    level_desc_15: "组合所有",
    level_desc_16: "保持按钮关闭",
    level_desc_17: "反转后组合",
    level_desc_18: "非两个按钮",
    level_desc_19: "非任意按钮",
    level_desc_20: "所有门组合",

    // Random Level Titles
    random_title_simple: "简单电路",
    random_title_0: "逻辑门挑战",
    random_title_1: "电路谜题",
    random_title_2: "门网络",
    random_title_3: "复杂电路",
    random_title_4: "大师电路",
    random_title_default: "随机关卡",

    // Random Level Descriptions
    random_desc_multi: "激活{count}个逻辑门来解锁门",
    random_desc_default: "按下按钮来解锁门"
  }
};

class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.messages = messages;
  }

  detectLanguage() {
    // Check localStorage first (safe for Node.js environment)
    const saved = (typeof localStorage !== 'undefined')
      ? localStorage.getItem('chainReactionLab_language')
      : null;
    if (saved && messages[saved]) {
      return saved;
    }

    // Detect from browser (safe for Node.js environment)
    const browserLang = (typeof navigator !== 'undefined')
      ? (navigator.language || navigator.userLanguage)
      : 'en';
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }

    return 'en'; // Default to English
  }

  setLanguage(lang) {
    if (messages[lang]) {
      this.currentLang = lang;
      // Save to localStorage if available (browser environment)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('chainReactionLab_language', lang);
      }
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

    // Update all elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // Update all elements with data-i18n-aria attribute
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      element.setAttribute('aria-label', this.t(key));
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
