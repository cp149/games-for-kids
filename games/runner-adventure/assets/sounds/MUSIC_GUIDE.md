# 背景音乐指南

游戏需要3首背景音乐，随机播放以增加趣味性。

## 需要的音乐文件

将以下3个音乐文件放入 `assets/sounds/` 目录：

1. **quirky-music.mp3** - 搞怪风格的音乐
2. **catchy-music.mp3** - 魔性洗脑的音乐
3. **fast-music.mp3** - 快节奏刺激的音乐

## 如何获取音乐

### 方法1：AI音乐生成工具

推荐使用以下AI工具生成：

**Suno AI** (https://suno.ai)
- 搞怪音乐提示词: "funny quirky game background music, comedic 8-bit melody, playful circus instruments, upbeat silly tempo"
- 魔性音乐提示词: "catchy addictive game loop, repetitive hypnotic melody, earworm electronic beat, mesmerizing rhythm"
- 快节奏音乐提示词: "fast tempo electronic game music, energetic beat 160bpm, intense running rhythm, action packed"

**Udio** (https://udio.com)
- 类似的提示词，添加 "game background music, loop" 关键词

### 方法2：免费音乐资源网站

- **Pixabay Music** (https://pixabay.com/music/)
- **FreePD** (https://freepd.com/)
- **Incompetech** (https://incompetech.com/music/royalty-free/)
- **OpenGameArt** (https://opengameart.org/)

搜索关键词：
- quirky game music
- funny game music
- catchy loop
- fast tempo game music

### 方法3：YouTube Audio Library

YouTube Studio 提供免费商用音乐。

## 音乐要求

- **格式**: MP3
- **时长**: 建议1-3分钟（会循环播放）
- **音量**: 适中（代码中已设置 volume: 0.5）
- **品质**: 建议 128kbps 或更高

## 临时方案

如果暂时没有音乐，可以注释掉音乐加载代码：

```javascript
// 在 index.html 中注释这几行：
// k.loadSound("bgMusic1", "assets/sounds/quirky-music.mp3");
// k.loadSound("bgMusic2", "assets/sounds/catchy-music.mp3");
// k.loadSound("bgMusic3", "assets/sounds/fast-music.mp3");

// 并注释游戏场景中的音乐播放代码
```

游戏仍然可以正常运行，只是没有背景音乐。
