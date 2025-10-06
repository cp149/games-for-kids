# Runner Adventure - Gemini Image Generation Prompts

生成以下图片，用于跑酷游戏。风格：卡通、儿童友好、明亮色彩。

## 1. Player (玩家角色)

**文件名:** `player.png`

**Prompt:**
```
A cute cartoon character running, side view, bright yellow color, simple design for kids game, friendly smile, white background, PNG transparent, 256x256 pixels, flat art style, no shadows
```

**中文 Prompt:**
```
一个可爱的卡通角色在奔跑，侧面视角，明亮的黄色，儿童游戏的简单设计，友好的微笑，白色背景，PNG透明背景，256x256像素，扁平艺术风格，无阴影
```

---

## 2. Obstacle (障碍物)

**文件名:** `obstacle.png`

**Prompt:**
```
A red cartoon cactus or rock obstacle, simple geometric design for kids game, bright red color, white background, PNG transparent, 128x128 pixels, flat art style, friendly and not scary
```

**中文 Prompt:**
```
一个红色卡通仙人掌或石头障碍物，儿童游戏的简单几何设计，鲜艳的红色，白色背景，PNG透明背景，128x128像素，扁平艺术风格，友好不可怕
```

---

## 3. Coin (金币)

**文件名:** `coin.png`

**Prompt:**
```
A shiny golden coin icon, simple cartoon style for kids game, bright gold color with sparkle effect, white background, PNG transparent, 64x64 pixels, flat art style, circular shape
```

**中文 Prompt:**
```
一个闪亮的金币图标，儿童游戏的简单卡通风格，明亮的金色带闪光效果，白色背景，PNG透明背景，64x64像素，扁平艺术风格，圆形
```

---

## 4. Background (背景)

**文件名:** `background.png`

**Prompt:**
```
A simple sky background for runner game, light blue gradient sky with white fluffy clouds, cartoon style for kids, 800x600 pixels, peaceful and cheerful atmosphere, no ground
```

**中文 Prompt:**
```
跑酷游戏的简单天空背景，浅蓝色渐变天空配白色蓬松云朵，儿童卡通风格，800x600像素，平和欢快的氛围，无地面
```

---

## 5. Ground Pattern (地面纹理) - Optional

**文件名:** `ground.png`

**Prompt:**
```
A simple grass ground pattern, bright green color, cartoon style for kids game, tileable texture, 200x100 pixels, flat art style, simple grass blades
```

**中文 Prompt:**
```
简单的草地地面图案，鲜绿色，儿童游戏卡通风格，可平铺纹理，200x100像素，扁平艺术风格，简单的草叶
```

---

## 生成步骤

1. 访问 Gemini: https://gemini.google/overview/image-generation/
2. 复制上面的 Prompt（英文或中文都可以）
3. 生成图片后下载
4. 重命名为对应的文件名
5. 保存到 `games/runner-adventure/assets/images/` 目录

## 图片规格要求

| 图片 | 尺寸 | 格式 | 背景 |
|------|------|------|------|
| player.png | 256x256 | PNG | 透明 |
| obstacle.png | 128x128 | PNG | 透明 |
| coin.png | 64x64 | PNG | 透明 |
| background.png | 800x600 | PNG/JPG | 有背景 |
| ground.png | 200x100 | PNG | 透明（可选）|

## 注意事项

- 所有图片使用卡通风格，适合儿童
- 颜色明亮、友好
- 避免阴影和复杂细节
- 使用扁平设计风格
- 确保透明背景（除了 background.png）
