/**
 * Color Mix Lab - Translations
 * Multi-language support for UI text
 */

const TRANSLATIONS = {
  en: {
    // Header
    'level': 'Level',
    'freePlay': 'Free Play',
    'free': 'Free',
    
    // Buttons
    'home': 'Home',
    'freePlayBtn': 'Free Play',
    'recipeBook': 'Recipe Book',
    'resetProgress': 'Reset Progress',
    'clear': 'Clear',
    'close': 'Close',
    
    // Recipe Book
    'recipeBookTitle': 'Recipe Book',
    
    // Feedback
    'comboBreak': 'Combo Break!',
    'newRecipe': 'New Recipe!',
    
    // Achievements
    'achievementFirstMix': 'First Mix',
    'achievementRecipeHunter': 'Recipe Hunter',
    'achievementColorMaster': 'Color Master',
    'achievementHighScorer': 'High Scorer',
    
    // Language
    'language': 'Language',
    'langEn': 'English',
    'langZh': '中文',
    
    // Story narratives (kept for accessibility/screen readers - visual-only design uses color circles)
    'story_tiger_orange': 'I want orange stripes!',
    'story_frog_green': 'Make me a lily pad color!',
    'story_unicorn_purple': 'I need a magical purple!',
    'story_fox_orange': 'Help me look like autumn!',
    'story_turtle_green': 'My shell needs fresh green!',
    'story_butterfly_purple': 'Paint my wings purple!',
    'story_squirrel_orange': 'I want to match my acorns!',
    'story_parrot_green': 'Make me jungle green!',
    'story_octopus_purple': 'I want deep sea purple!',
    'story_bear_brown': 'Color me like chocolate!',
    'story_lion_redorange': 'Make my mane glow!',
    'story_caterpillar_lime': 'I want to be a leaf!',
    'story_dolphin_teal': 'Ocean color please!',
    'story_flamingo_magenta': 'Pink is too boring!',
    'story_peacock_indigo': 'Make me royal!'
  },
  
  zh: {
    // Header
    'level': '关卡',
    'freePlay': '自由模式',
    'free': '自由',
    
    // Buttons
    'home': '主页',
    'freePlayBtn': '自由模式',
    'recipeBook': '配方书',
    'resetProgress': '重置进度',
    'clear': '清空',
    'close': '关闭',
    
    // Recipe Book
    'recipeBookTitle': '配方书',
    
    // Feedback
    'comboBreak': '连击中断！',
    'newRecipe': '新配方！',
    
    // Achievements
    'achievementFirstMix': '初次调色',
    'achievementRecipeHunter': '配方猎人',
    'achievementColorMaster': '调色大师',
    'achievementHighScorer': '高分达人',
    
    // Language
    'language': '语言',
    'langEn': 'English',
    'langZh': '中文',
    
    // Story narratives (保留用于无障碍/屏幕阅读器 - 视觉设计使用颜色圆圈)
    'story_tiger_orange': '我想要橘色条纹！',
    'story_frog_green': '帮我调荷叶色！',
    'story_unicorn_purple': '我要魔法紫色！',
    'story_fox_orange': '让我像秋天一样！',
    'story_turtle_green': '我的壳需要新鲜绿色！',
    'story_butterfly_purple': '给我的翅膀涂紫色！',
    'story_squirrel_orange': '我想和橡果一个颜色！',
    'story_parrot_green': '给我丛林绿！',
    'story_octopus_purple': '我想要深海紫色！',
    'story_bear_brown': '把我变成巧克力色！',
    'story_lion_redorange': '让我的鬃毛发光！',
    'story_caterpillar_lime': '我想变成树叶！',
    'story_dolphin_teal': '给我海洋色！',
    'story_flamingo_magenta': '粉色太无聊了！',
    'story_peacock_indigo': '让我变得高贵！'
  }
};

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS };
}
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
}
