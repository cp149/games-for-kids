# Chemistry Lab 🧪

儿童化学反应益智游戏（适合 6-10 岁）

**在线试玩**: [GitHub Pages 链接](#) <!-- TODO: 部署后更新 -->

![游戏截图](assets/images/screenshot-placeholder.png) <!-- TODO: 添加实际截图 -->

---

## 🎮 游戏简介

Chemistry Lab 是一款专为儿童设计的化学反应益智游戏。通过拖拽试剂卡片、混合化学物质，创造五彩缤纷的爆炸效果！

### 核心玩法
1. **拖拽卡片** 到实验台（4 个槽位）
2. **点击混合** 按钮触发反应或合成新元素
3. **收集分数** 从华丽的粒子爆炸中
4. **完成目标** 解锁下一关

### 特色机制
- 🔴🔵🟡 **三原色系统**: 混合产生新颜色
- ⚗️ **元素合成**: 创造蒸汽、泥土、能量等高级元素 (Tier 2/3)
- ⭐ **催化剂**: 可重复使用，得分翻倍
- 🛡️ **稳定剂**: 防止卡片过期
- 🌈 **彩虹反应**: 三色混合的终极挑战

---

## ✨ 游戏特性

### 🎨 视觉设计
- ✅ 纯 emoji 视觉引导（无需阅读文字）
- ✅ 华丽的粒子爆炸效果（20-30 个粒子）
- ✅ 流畅的拖拽动画（60 FPS）
- ✅ 色彩鲜明的反应效果（红/蓝/紫/橙/绿/彩虹）

### 🧩 教育价值
- 🧠 **认知技能**: 模式识别、逻辑思维、策略规划
- 🖱️ **精细运动**: 拖拽操作锻炼手眼协调
- ➕ **数学启蒙**: 加法、乘法（催化剂 ×2）概念
- 🧪 **科学兴趣**: 化学反应、颜色理论

### 🌐 国际化支持
- ✅ 中英双语切换（实时无刷新）
- ✅ 所有 UI 文本外部化（i18n 系统）
- ✅ LocalStorage 持久化语言偏好

### ♿ 无障碍设计
- ✅ 键盘完全可操作（Tab + Enter/Space + 方向键）
- ✅ ARIA 标签和语义化 HTML
- ✅ 屏幕阅读器友好（aria-live 动态更新）
- ✅ 触摸和鼠标双重支持

### 🎵 音频体验
- ✅ 背景音乐循环播放
- ✅ 标签页切换自动暂停
- ✅ 用户偏好持久化（LocalStorage）
- ✅ 反应音效（成功/失败/混合）

### 📱 响应式设计
- ✅ 移动设备触摸优化
- ✅ 自适应布局（800×800 Canvas）
- ✅ 44px 最小触摸目标（符合 WCAG 标准）

---

## 📊 关卡系统

### 🌍 关卡 1-3: 探索实验室
- **L1**: 初次反应（教程，无计时）
- **L2**: 紫色科学（颜色组合）
- **L3**: 速度实验（首次计时器）

### ⭐ 关卡 4-6: 催化剂室
- **L4**: 催化剂介绍（可重复使用卡片）
- **L5**: 增强反应（得分翻倍策略）
- **L6**: 催化剂大师（快速循环挑战）

### 🛡️ 关卡 7-9: 稳定站
- **L7**: 与时间赛跑（试剂过期机制）
- **L8**: 彩虹挑战（三色混合 + 稳定剂）
- **L9**: 终极大师（催化剂 + 稳定剂综合挑战）

**难度曲线**: 3-3-3 渐进式（每 3 关引入新机制）

---

## 🛠️ 技术栈

### 前端技术
- **核心**: Vanilla JavaScript (ES6+)
- **渲染**: HTML5 Canvas + DOM 混合
- **拖拽**: HTML5 Drag & Drop API + 触摸事件
- **动画**: RequestAnimationFrame (60 FPS)
- **I18n**: 自定义轻量系统（<100 行）

### 通用库（games/lib/）
- **ParticleSystem**: 粒子动画引擎
- **PerformanceMonitor**: FPS/MS/MB 监控（Stats.js 集成）
- **BackgroundMusicManager**: 音频管理（标签页感知）

### 代码结构
- **架构模式**: Manager Pattern（单一职责）
- **文件组织**: 9 个 Manager + 4 个 Class
- **代码规范**: 所有文件 <550 行（符合项目标准）
- **事件清理**: Map 存储 + destroy() 模式

### 性能指标
- ✅ **加载时间**: <2 秒（无构建步骤）
- ✅ **帧率**: 稳定 60 FPS（移动设备也流畅）
- ✅ **内存**: <50 MB（长时间游戏无泄漏）
- ✅ **文件大小**: 游戏总计 <200 KB

---

## 🚀 快速开始

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/wxcd/mgame.git
cd mgame/games/chemistry-lab

# 启动本地服务器（Python 3）
python3 -m http.server 8888

# 或使用 Python 2
python -m SimpleHTTPServer 8888

# 或使用 Node.js
npx http-server -p 8888

# 打开浏览器
open http://localhost:8888
```

### 浏览器兼容性

| 浏览器 | 版本 | 状态 |
|--------|------|------|
| Chrome | 90+ | ✅ 完全支持 |
| Firefox | 88+ | ✅ 完全支持 |
| Safari | 14+ | ✅ 完全支持 |
| Edge | 90+ | ✅ 完全支持 |
| Mobile Safari | iOS 14+ | ✅ 触摸优化 |
| Chrome Mobile | Android 9+ | ✅ 触摸优化 |

---

## 📁 项目结构

```
chemistry-lab/
├── index.html                      # 主页面（<100 行）
├── css/
│   └── styles.css                 # 样式表（871 行 - 待拆分）
├── js/
│   ├── main.js                    # 初始化入口（<100 行）
│   ├── config.js                  # 配置和关卡数据
│   ├── classes/                   # 核心类
│   │   ├── ChemistryLabGame.js    # 主游戏控制器（608 行）
│   │   ├── ReagentCard.js         # 试剂卡片（拖拽、过期）
│   │   ├── SpecialCard.js         # 特殊卡片（催化剂/稳定剂）
│   │   └── Reaction.js            # 反应动画
│   ├── managers/                  # 功能管理器
│   │   ├── UIManager.js           # UI 更新和事件
│   │   ├── AudioManager.js        # 音频控制
│   │   ├── LevelManager.js        # 关卡加载和进度
│   │   ├── TimerManager.js        # 计时器逻辑
│   │   ├── CardDropManager.js     # 卡片生成和掉落
│   │   ├── DragManager.js         # 拖拽处理（鼠标+触摸）
│   │   ├── SlotManager.js         # 实验槽管理
│   │   ├── ReactionManager.js     # 反应验证和计分
│   │   ├── SpecialCardManager.js  # 特殊卡片逻辑
│   │   └── InputManager.js        # 键盘输入（无障碍）
│   ├── utils/                     # 工具函数
│   │   ├── ReactionRules.js       # 反应规则查找
│   │   └── CardFactory.js         # 卡片创建
│   └── i18n/                      # 国际化
│       ├── i18n.js                # I18n 系统
│       └── messages.js            # 翻译文本（EN/ZH）
├── assets/
│   ├── images/                    # 图片资源
│   │   └── screenshot-placeholder.png
│   └── sounds/                    # 音频资源
│       ├── background.mp3         # 背景音乐
│       ├── reaction-success.mp3   # 成功音效
│       ├── reaction-fail.mp3      # 失败音效
│       └── README.md              # 音频说明
├── docs/                          # 游戏文档
│   ├── design.md                  # 设计文档（30 关规划）
│   ├── decisions.md               # 技术决策记录
│   ├── user-guide.md              # 用户指南
│   ├── qa-report.md               # QA 测试报告
│   ├── implementation-status.md   # 实现状态
│   ├── audio-requirements.md      # 音频需求
│   ├── audio-implementation.md    # 音频实现
│   └── audio-verification.md      # 音频验证
└── README.md                      # 本文件
```

---

## 🧪 开发指南

### 代码规范

**语言政策**（来自 `CLAUDE.md`）:
- ✅ **代码**: 100% 英文（类/函数/变量/注释）
- ✅ **UI 文本**: 禁止硬编码，必须用 i18n
- ✅ **Git 提交**: 全英文

**文件大小限制**:
- ⚠️ 单个 JS 文件 ≤550 行（`ChemistryLabGame.js` 待重构）
- ⚠️ CSS 文件建议拆分（当前 871 行）

**架构要求**:
- ✅ 所有 Manager 有 `destroy()` 方法
- ✅ 事件监听器通过 Map 存储和清理
- ✅ 使用 RequestAnimationFrame 游戏循环
- ✅ 通用组件提取到 `games/lib/`

### 添加新关卡

编辑 `js/config.js`:

```javascript
const LEVELS = [
  // ... 现有关卡
  {
    level: 10,
    name: 'New Challenge',
    objective: {
      type: 'count',      // 类型: count, specific, score, catalyst_count
      target: 5,
      description: 'Complete 5 reactions'
    },
    timer: 60,            // 秒，null = 无限
    cards: ['RED', 'BLUE', 'YELLOW'],
    dropInterval: 2000,   // 毫秒
    specialCards: [
      { type: 'CATALYST', count: 2 }
    ],
    expirationTime: 10    // 秒，null = 不过期
  }
];
```

### 添加新反应

编辑 `js/config.js`:

```javascript
const REACTIONS = {
  // 现有反应...
  'NEW+COMBO': {
    result: 'CUSTOM_EXPLOSION',
    points: 25,
    color: '#ff00ff',
    emoji: '✨💥'
  }
};
```

### 添加新翻译

编辑 `js/i18n/messages.js`:

```javascript
const messages = {
  en: {
    new_key: "New text in English"
  },
  zh: {
    new_key: "中文新文本"
  }
};
```

使用:
```javascript
i18n.t('new_key'); // 返回当前语言的文本
```

### 测试

```bash
# 单元测试（Jest）
npm test

# 契约测试
npm run test:contract

# 代码规范检查
npm run lint

# 性能测试（手动）
# 1. 打开浏览器开发者工具
# 2. 查看左下角 PerformanceMonitor（FPS/MS/MB）
# 3. 长时间游戏（30 分钟）验证无内存泄漏
```

---

## 📚 文档链接

### 游戏文档
- 📖 [设计文档](docs/design.md) - 完整的 30 关规划
- 📝 [技术决策](docs/decisions.md) - 架构和技术选型
- 📘 [用户指南](docs/user-guide.md) - 玩家操作手册
- 📊 [实现状态](docs/implementation-status.md) - 当前进度

### 技术文档
- 🔊 [音频需求](docs/audio-requirements.md)
- 🎵 [音频实现](docs/audio-implementation.md)
- ✅ [音频验证](docs/audio-verification.md)
- 🐛 [QA 报告](docs/qa-report.md)

### 项目规范
- 📋 [CLAUDE.md](../../CLAUDE.md) - 项目开发规范
- 🏗️ [BEST_PRACTICES.md](../../BEST_PRACTICES.md) - 架构最佳实践

---

## 🐛 已知问题

### 待修复（来自 QA 报告）

1. **ChemistryLabGame.js 文件过大** ⚠️
   - 当前: 608 行
   - 限制: 550 行
   - 计划: 重构为 GameOrchestrator + GameUIController + GameEventHandler

2. **生产环境 console.log** ⚠️
   - 位置: `ChemistryLabGame.js:284, 401, 408`
   - 计划: 移除或替换为事件处理

3. **messages.js 中文注释** ⚠️
   - 位置: `js/i18n/messages.js:103-196`
   - 计划: 改为英文注释

### 未来增强

- [ ] 关卡 10-30 实现（高级机制）
- [ ] 成就系统
- [ ] 每日挑战
- [ ] 无尽模式
- [ ] 关卡编辑器
- [ ] 音效增强（更多反应音效）
- [ ] 更多粒子效果
- [ ] 排行榜（LocalStorage 本地）

---

## 🤝 贡献指南

### 提交代码

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m "feat: add amazing feature"`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

### Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: 新功能
fix: Bug 修复
docs: 文档更新
style: 代码格式（不影响逻辑）
refactor: 重构
perf: 性能优化
test: 测试添加/修改
chore: 构建工具或辅助工具变动
```

### 代码审查标准

- ✅ 所有代码英文
- ✅ 所有文件 <550 行
- ✅ 无 console.log（生产环境）
- ✅ 无硬编码 UI 文本
- ✅ 相对路径（不含 /home/）
- ✅ 事件监听器正确清理
- ✅ 通过 ESLint 检查

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👥 团队

- **Game Designer**: 游戏设计和关卡规划
- **Frontend Developer**: 前端实现和 UI
- **Game Mechanics Engineer**: 核心玩法逻辑
- **QA Tester**: 质量保证和测试
- **UI/UX Designer**: 用户体验设计
- **Project Chronicler**: 文档编写

---

## 🙏 致谢

### 开源库
- [Stats.js](https://github.com/mrdoob/stats.js/) - 性能监控
- HTML5 Canvas API - 渲染引擎
- HTML5 Drag & Drop API - 拖拽系统

### 灵感来源
- 儿童科学教育游戏
- 化学反应视觉化实验

---

## 📞 联系方式

- **Issues**: [GitHub Issues](https://github.com/wxcd/mgame/issues)
- **Discussions**: [GitHub Discussions](https://github.com/wxcd/mgame/discussions)
- **Email**: [你的邮箱] <!-- TODO: 添加联系邮箱 -->

---

## 🎯 路线图

### v1.0（当前版本）
- ✅ 关卡 1-9 完成
- ✅ 催化剂系统
- ✅ 稳定剂系统
- ✅ 中英双语
- ✅ 移动设备支持

### v1.1（计划中）
- [ ] 重构 ChemistryLabGame.js（符合 550 行限制）
- [ ] 移除生产环境 console.log
- [ ] CSS 文件拆分
- [ ] 音效增强

### v2.0（未来）
- [ ] 关卡 10-15（高级试剂）
- [ ] 成就系统
- [ ] 每日挑战
- [ ] 关卡编辑器

### v3.0（愿景）
- [ ] 关卡 16-30（完整版）
- [ ] 无尽模式
- [ ] 多人对战（本地）
- [ ] 自定义实验室主题

---

**祝你游戏愉快！🧪💥🌈**

*Let's make chemistry fun for every child!*
