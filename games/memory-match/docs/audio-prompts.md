# Audio Generation Prompts for Memory Match Game

This document contains detailed prompts for generating all audio assets for the game.

## Recommended AI Music Platforms

1. **Suno AI** - https://suno.ai (Best for music, has free tier)
2. **Udio** - https://udio.com (High quality music)
3. **ElevenLabs Sound Effects** - https://elevenlabs.io/sound-effects (Great for SFX)
4. **Stable Audio** - https://stableaudio.com (Good for both)

---

## 1. Background Music (BGM)

### English Prompt:
```
Cheerful children's game background music, playful and light piano melody with
soft xylophone accents, bright and happy atmosphere, simple repetitive pattern,
non-intrusive, educational game style, 120 BPM, major key (C major or G major),
loopable seamless, gentle percussion, whimsical and friendly, no vocals,
medium tempo, suitable for ages 3-8, memory game soundtrack,
ambient and calm but engaging
```

### 中文提示词：
```
欢快的儿童游戏背景音乐，轻快俏皮的钢琴旋律配以柔和的木琴点缀，
明亮快乐的氛围，简单重复的旋律模式，不打扰专注力，教育游戏风格，
120 BPM，大调（C大调或G大调），可无缝循环，轻柔打击乐，
异想天开且友好，无人声，中等节奏，适合3-8岁儿童，记忆游戏配乐，
平静但引人入胜的氛围音乐
```

**Technical Requirements:**
- **Duration**: 2-3 minutes (for seamless looping)
- **Format**: MP3 or OGG
- **Sample Rate**: 44.1kHz
- **Bitrate**: 128-192 kbps
- **Volume**: -3dB peak (not too loud)

**Save as**: `games/memory-match/assets/sounds/bgm-main.mp3`

---

## 2. Card Flip Sound Effect

### English Prompt:
```
Short card flip sound effect, soft whoosh sound with gentle paper flutter,
playful and light, quick swoosh, kid-friendly, cartoonish but not silly,
0.3 seconds duration, clear and crisp, not harsh, pleasant gentle flip,
game UI sound, satisfying but subtle
```

### 中文提示词：
```
短促的翻牌音效，柔和的呼呼声配以轻柔的纸张翻动声，
轻快俏皮，快速嗖嗖声，儿童友好，卡通风但不夸张，
0.3秒时长，清晰干脆但不刺耳，令人愉悦的轻柔翻转声，
游戏UI音效，令人满意但不突兀
```

**Technical Requirements:**
- **Duration**: 0.2-0.4 seconds
- **Format**: MP3 or OGG
- **Volume**: -6dB peak
- **Clean start and end** (no fade needed)

**Save as**: `games/memory-match/assets/sounds/card-flip.mp3`

---

## 3. Match Success Sound Effect

### English Prompt:
```
Cheerful match success sound, happy celebration chime with sparkle twinkle,
bright bells ringing, positive reinforcement sound, encouraging and rewarding,
magical ding with ascending notes, kid-friendly achievement sound,
not too long (0.8 seconds), joyful and uplifting, small victory fanfare,
clear and bright
```

### 中文提示词：
```
欢快的配对成功音效，快乐庆祝钟声配以闪亮的叮当声，
明亮的铃铛响声，积极的强化音效，鼓励和奖励感，
魔法叮咚声配以上升的音符，儿童友好的成就音效，
不要太长（0.8秒），欢乐振奋，小胜利号角，
清晰明亮
```

**Technical Requirements:**
- **Duration**: 0.6-1.0 seconds
- **Format**: MP3 or OGG
- **Volume**: -3dB peak
- **Bright and clear tone**

**Save as**: `games/memory-match/assets/sounds/match-success.mp3`

---

## 4. Match Fail Sound Effect

### English Prompt:
```
Gentle mismatch sound, soft "oops" tone, not discouraging or negative,
friendly and encouraging, subtle wrong answer sound, light and playful,
brief descending notes, kid-friendly error sound without harsh tones,
0.4 seconds duration, not scary or disappointing, gentle "try again" feel,
soft and supportive
```

### 中文提示词：
```
温和的配对失败音效，柔和的"哎呀"音调，不令人沮丧或消极，
友好鼓励的感觉，微妙的错误提示音，轻快俏皮，
短促的下降音符，儿童友好的错误音效无刺耳音调，
0.4秒时长，不吓人也不令人失望，温和的"再试一次"感觉，
柔和且支持性
```

**Technical Requirements:**
- **Duration**: 0.3-0.5 seconds
- **Format**: MP3 or OGG
- **Volume**: -6dB peak
- **Gentle and non-harsh**

**Save as**: `games/memory-match/assets/sounds/match-fail.mp3`

---

## 5. Victory/Game Complete Sound

### English Prompt:
```
Triumphant victory fanfare for children, joyful celebration music,
cheerful orchestral hit with bells and trumpets, big win celebration,
exciting but not overwhelming, major key uplifting melody,
kids cheering in background (subtle), 3-4 seconds duration,
congratulations feeling, achievement unlocked sound,
bright and energetic but age-appropriate, happy ending music
```

### 中文提示词：
```
儿童胜利号角，欢乐的庆祝音乐，
欢快的管弦乐配以铃铛和小号，大获全胜庆祝，
令人兴奋但不压倒性，大调振奋人心的旋律，
背景有儿童欢呼声（微妙），3-4秒时长，
祝贺的感觉，成就解锁音效，
明亮且充满活力但适合年龄，快乐结局音乐
```

**Technical Requirements:**
- **Duration**: 3-5 seconds
- **Format**: MP3 or OGG
- **Volume**: 0dB peak (can be louder)
- **Celebratory and exciting**

**Save as**: `games/memory-match/assets/sounds/victory.mp3`

---

## 6. Button Click Sound

### English Prompt:
```
Soft friendly button click sound, gentle UI beep, short and crisp,
pleasant tap sound, not harsh, playful click, kid-friendly interface sound,
0.1 seconds duration, clear confirmation sound, bubble pop style,
light and cheerful, simple and clean
```

### 中文提示词：
```
柔和友好的按钮点击音效，温和的UI哔哔声，短促清脆，
令人愉快的轻敲声，不刺耳，俏皮的点击声，儿童友好的界面音效，
0.1秒时长，清晰的确认音，泡泡爆破风格，
轻快欢乐，简单干净
```

**Technical Requirements:**
- **Duration**: 0.05-0.15 seconds
- **Format**: MP3 or OGG
- **Volume**: -9dB peak (quiet)
- **Very short and clear**

**Save as**: `games/memory-match/assets/sounds/button-click.mp3`

---

## 7. Star Rating Sound (Bonus)

### English Prompt:
```
Star appearing sound effect, magical twinkle, bright sparkle chime,
ascending pitch, fairy dust sound, light and magical, 0.4 seconds,
kid-friendly star rating sound, pleasant ding, achievement tone,
each star in sequence (can generate 3 variations with slightly different pitches)
```

### 中文提示词：
```
星星出现音效，魔法闪烁声，明亮的闪光钟声，
上升音调，仙尘音效，轻盈且魔幻，0.4秒，
儿童友好的星级评分音效，令人愉快的叮当声，成就音调，
每颗星星依次出现（可以生成3个音调略有不同的变体）
```

**Technical Requirements:**
- **Duration**: 0.3-0.5 seconds each
- **Format**: MP3 or OGG
- **Volume**: -6dB peak
- **Generate 3 versions**: star1.mp3, star2.mp3, star3.mp3 (different pitches)

**Save as**:
- `games/memory-match/assets/sounds/star-1.mp3`
- `games/memory-match/assets/sounds/star-2.mp3`
- `games/memory-match/assets/sounds/star-3.mp3`

---

## Audio Assets Summary

After generation, you should have these files:

```
games/memory-match/assets/sounds/
├── bgm-main.mp3           # Background music (2-3 min)
├── card-flip.mp3          # Card flip sound (0.3s)
├── match-success.mp3      # Successful match (0.8s)
├── match-fail.mp3         # Failed match (0.4s)
├── victory.mp3            # Game complete (3-4s)
├── button-click.mp3       # UI button click (0.1s)
├── star-1.mp3             # First star (0.4s)
├── star-2.mp3             # Second star (0.4s)
└── star-3.mp3             # Third star (0.4s)
```

**Total**: 9 audio files

---

## Generation Tips

### For Suno/Udio (Music):
1. Use the English prompts
2. For BGM, select "instrumental" mode
3. For SFX, you may need to describe them as "short musical effects"
4. Download as MP3
5. May need to trim silence at start/end

### For ElevenLabs Sound Effects:
1. Works better for short SFX
2. Very good quality
3. Can specify exact duration
4. Download as MP3

### Post-Processing (Optional):
- Use Audacity (free) to:
  - Trim silence from start/end
  - Normalize volume to recommended dB
  - Convert to OGG format (smaller file size)
  - Create seamless loop for BGM

---

## Alternative: Free Sound Libraries

If AI generation doesn't work well, download from:

1. **Freesound.org** - Search for:
   - "kids game music"
   - "card flip"
   - "success chime children"
   - "gentle fail sound"
   - "kids victory"

2. **Pixabay Music** - https://pixabay.com/music
   - Filter: "Children", "Game", "Happy"

3. **OpenGameArt** - https://opengameart.org
   - Browse "Audio" section
   - Filter by license: CC0 (public domain)

---

## Integration Note

After generating/downloading sounds, the game code will need to be updated to:
1. Load audio files
2. Play sounds on game events
3. Add volume controls
4. Add mute toggle

This can be done by updating the `index.html` JavaScript to add sound effects.

---

**Good luck with audio generation! Let me know when you have the files ready for integration.** 🎵
