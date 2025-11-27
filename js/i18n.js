/**
 * Kids Game Collection - Internationalization System
 * Supports English, Chinese, and Japanese
 */

const translations = {
    en: {
        main_title: "Kids Game Collection",
        subtitle: "Fun and Educational Games for Children",
        // Game 1: Memory Match
        game1_title: "Animal Memory Match",
        game1_desc: "Match cute animal pairs and train your memory! Perfect for ages 3-8.",
        duration1: "5 min",
        age1: "3-8",
        difficulty1: "Easy",
        // Game 2: Runner Adventure
        game2_title: "Runner Adventure",
        game2_desc: "Jump and run through exciting levels! Control with body movements.",
        duration2: "Endless",
        age2: "5-10",
        difficulty2: "Medium",
        // Game 3: Drawing Studio
        game3_title: "Drawing Studio",
        game3_desc: "Create colorful drawings with magical tools and effects!",
        duration3: "Unlimited",
        age3: "3-12",
        difficulty3: "Easy",
        // Game 4: Puzzle Master
        game4_title: "Puzzle Master",
        game4_desc: "Turn any image into a fun puzzle! Load your drawings and solve them.",
        duration4: "10-20 min",
        age4: "4-12",
        difficulty4: "Variable",
        // Game 5: Match Three
        game5_title: "Match Three",
        game5_desc: "Swap colorful fruits to match 3 or more! Classic puzzle fun for all ages.",
        duration5: "5-10 min",
        age5: "6-10",
        difficulty5: "Medium",
        // Game 6: Music Factory
        game6_title: "Music Factory",
        game6_desc: "Create your own music by arranging sound blocks on a timeline!",
        duration6: "Unlimited",
        age6: "6-12",
        difficulty6: "Easy",
        // Badges
        new_badge: "NEW",
        hot_badge: "HOT",
        // Footer
        footer_text: "Made with love for kids around the world",
        footer_count: "6 games available, more coming soon!",
        footer_credits: "Images by",
        footer_music: "Music by"
    },
    zh: {
        main_title: "儿童游戏合集",
        subtitle: "有趣又有教育意义的儿童游戏",
        // Game 1: Memory Match
        game1_title: "动物记忆配对",
        game1_desc: "配对可爱的动物，训练记忆力！适合3-8岁儿童。",
        duration1: "5分钟",
        age1: "3-8岁",
        difficulty1: "简单",
        // Game 2: Runner Adventure
        game2_title: "跑酷冒险",
        game2_desc: "跳跃奔跑，穿越刺激的关卡！用身体动作控制。",
        duration2: "无限",
        age2: "5-10岁",
        difficulty2: "中等",
        // Game 3: Drawing Studio
        game3_title: "画画工作室",
        game3_desc: "用魔法工具和特效创作彩色画作！",
        duration3: "无限",
        age3: "3-12岁",
        difficulty3: "简单",
        // Game 4: Puzzle Master
        game4_title: "拼图大师",
        game4_desc: "把任何图片变成有趣的拼图！加载你的画作来解谜。",
        duration4: "10-20分钟",
        age4: "4-12岁",
        difficulty4: "可调节",
        // Game 5: Match Three
        game5_title: "三消游戏",
        game5_desc: "交换彩色水果，匹配3个或更多！经典益智游戏，老少皆宜。",
        duration5: "5-10分钟",
        age5: "6-10岁",
        difficulty5: "中等",
        // Game 6: Music Factory
        game6_title: "音乐工厂",
        game6_desc: "在时间轴上排列音乐块，创作属于你自己的音乐！",
        duration6: "无限",
        age6: "6-12岁",
        difficulty6: "简单",
        // Badges
        new_badge: "新",
        hot_badge: "热门",
        // Footer
        footer_text: "用爱为全世界的孩子们制作",
        footer_count: "6个游戏可玩，更多即将推出！",
        footer_credits: "图片来自",
        footer_music: "音乐来自"
    },
    ja: {
        main_title: "子供向けゲームコレクション",
        subtitle: "楽しくて教育的な子供向けゲーム",
        // Game 1: Memory Match
        game1_title: "動物メモリーマッチ",
        game1_desc: "かわいい動物のペアを合わせて記憶力を鍛えよう！3〜8歳に最適。",
        duration1: "5分",
        age1: "3-8歳",
        difficulty1: "簡単",
        // Game 2: Runner Adventure
        game2_title: "ランナーアドベンチャー",
        game2_desc: "ジャンプして走って、エキサイティングなレベルをクリア！体の動きで操作。",
        duration2: "無限",
        age2: "5-10歳",
        difficulty2: "普通",
        // Game 3: Drawing Studio
        game3_title: "お絵かきスタジオ",
        game3_desc: "魔法のツールとエフェクトでカラフルな絵を描こう！",
        duration3: "無限",
        age3: "3-12歳",
        difficulty3: "簡単",
        // Game 4: Puzzle Master
        game4_title: "パズルマスター",
        game4_desc: "どんな画像も楽しいパズルに！自分の絵を読み込んで解こう。",
        duration4: "10-20分",
        age4: "4-12歳",
        difficulty4: "調整可",
        // Game 5: Match Three
        game5_title: "マッチスリー",
        game5_desc: "カラフルなフルーツを交換して3つ以上揃えよう！全年齢向けの定番パズル。",
        duration5: "5-10分",
        age5: "6-10歳",
        difficulty5: "普通",
        // Game 6: Music Factory
        game6_title: "ミュージックファクトリー",
        game6_desc: "タイムライン上にサウンドブロックを配置して、自分だけの音楽を作ろう！",
        duration6: "無限",
        age6: "6-12歳",
        difficulty6: "簡単",
        // Badges
        new_badge: "新作",
        hot_badge: "人気",
        // Footer
        footer_text: "世界中の子供たちのために愛を込めて作りました",
        footer_count: "6ゲームプレイ可能、もっと近日公開！",
        footer_credits: "画像:",
        footer_music: "音楽:"
    }
};

let currentLang = 'en';

/**
 * Initialize language system
 */
function initLanguage() {
    // Try to detect browser language
    const browserLang = navigator.language.substring(0, 2);
    if (translations[browserLang]) {
        currentLang = browserLang;
    } else {
        currentLang = 'en';
    }

    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = currentLang;
    }
    updateLanguage();
}

/**
 * Update all translatable elements
 */
function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
}

/**
 * Set up language selector event listener
 */
function setupLanguageSelector() {
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            updateLanguage();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupLanguageSelector();
    initLanguage();
});
