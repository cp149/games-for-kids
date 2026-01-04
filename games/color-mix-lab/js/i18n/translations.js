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
    'langZh': '中文'
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
    'langZh': '中文'
  }
};

// Dual export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRANSLATIONS };
}
if (typeof window !== 'undefined') {
  window.TRANSLATIONS = TRANSLATIONS;
}
