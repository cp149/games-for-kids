# 🏃 Runner Adventure

An endless runner game controlled by **body movements** using pose detection technology.

## 🎮 Core Features

### Control System
- **📸 Pose Detection**: Real-time body tracking with MediaPipe
- **🖐️ Jump Control**: Raise one hand above shoulder to jump
- **✨ Invincibility**: Raise both hands for star power mode
- **📷 Camera Toggle**: Switch between front/rear camera

### Health & Lives
- **❤️ 5 Hearts System**: Start with 5 lives, lose 1 per hit
- **🛡️ Damage Invincibility**: 1.5s flash effect after taking damage
- **💚 Health Potion**: Restores 1 heart (max 5)
- **Game Over**: Happens when all hearts are lost

### Visual Effects
- **Trail Effects**: Colored trails during combo/invincibility
- **Particle Systems**: Explosions, dust, healing effects
- **Dynamic Backgrounds**: Parallax mountains and clouds

## 🎯 Collectibles

### Coins (Auto-spawns every 3s)
- **Regular Coin** 🪙 (70%): 50 points
- **Ruby** 💎 (10%): 200 points - red gem
- **Diamond** 💠 (5%): 500 points - cyan gem
- **Star** ⭐ (15%): 100 points + invincibility mode

### Coin Lines (30% chance)
- **3-5 coins** spawning in vertical/diagonal formation
- Encourages strategic jumping to collect all
- Smaller coins for easier collection

### Coin Rain Event 🌧️
- **Random trigger**: Every 30-60 seconds
- **Duration**: 5 seconds of falling coins
- **Spawn rate**: 1-2 coins every 0.25s
- Large notification with emoji

## 💎 Power-Ups System

### Speed Boost ⚡
- **Duration**: 5 seconds
- **Effect**: 1.5x game speed
- **Color**: Yellow

### Slow Motion 🕐
- **Duration**: 5 seconds
- **Effect**: 0.6x game speed (easier dodging)
- **Color**: Light blue

### Super Jump 🦘
- **Duration**: 8 seconds
- **Effect**: 1.6x jump height
- **Color**: Orange

### Coin Magnet 🧲
- **Duration**: 8 seconds
- **Effect**: Auto-attracts coins within 200px radius
- **Visual**: Coins pulled toward player

### Shield 🛡️
- **Duration**: 15 seconds or until one hit
- **Effect**: Blocks one damage from rock/cactus
- **Visual**: Pulsing blue circle
- **Break Effect**: Blue particle explosion

### Health Potion ❤️
- **Effect**: Instant +1 health (max 5)
- **Visual**: Pink healing particles
- **Notification**: "+1 Health!"

## 🎯 Obstacles

### Cacti 🌵
- **Spawn Interval**: Every 2.5 seconds
- **Damage**: -1 heart
- **Effect**: Green particle explosion
- **Collision**: Tight hitbox (0.3 scale)

### Falling Rocks 🪨
- **Base Interval**: 7 seconds (scales with speed)
- **Warning**: Red "!" indicator 1.5s before impact
- **Spawn Area**: Random X position (50-300px)
- **Damage**: -1 heart
- **Effect**: Gray rock particles

## 📊 Scoring System

### Base Score
- **Passive**: 10 points/second × game speed
- **Coins**: Base value × combo multiplier

### Combo Multipliers
- **0-4 combo**: 1x (no bonus)
- **5-9 combo**: 1.5x (yellow trail)
- **10-19 combo**: 2x (orange trail)
- **20+ combo**: 3x (red trail)
- **Timeout**: 3 seconds without collecting

### Special Events
- **Star Collection**: Rainbow effects + invincibility
- **Diamond/Ruby**: Ring expansion + burst
- **Combo Level Up**: Screen flash + particles + sound

## 🎮 Game Progression

### Dynamic Difficulty
- **Speed Scaling**: +0.1x every 200 points
- **Max Speed**: 3.5x
- **Rock Frequency**: Adjusts with game speed
- **Starting Speed**: 1.0x

### High Score
- Saved to localStorage
- Displayed in menu and game over
- Updates in real-time

## 🖥️ UI Layout

### Top Left Panel
- Score (current)
- Best (high score)
- Speed (multiplier)

### Top Right
- Health: ❤️❤️❤️❤️❤️ (red/black hearts)

### Top Center (when active)
- Combo count and multiplier
- Combo timer progress bar
- Invincibility timer (rainbow text)

## 🎵 Audio System

### Background Music
- **Menu**: Calm background theme
- **Gameplay**: Upbeat running music
- **Invincible**: Special star power theme

### Sound Effects
- Jump, coin collection, special coins
- Combo level up, game over
- Power-up collection

## 🔧 Technical Implementation

### Built with KAPLAY
- **Game Engine**: KAPLAY v3001.0.0
- **Pose Detection**: MediaPipe
- **Single HTML File**: ~2500 lines

### Performance Optimizations
- Manual movement (O(1) vs O(3n))
- Efficient collision detection
- Offscreen auto-destroy
- Tight collision boxes

### Modular Architecture
Ready for future expansion:
- Separated spawner classes
- Game state management
- Easy to add new features
- Clear code organization

## 📝 Version History

- **v1.0**: Basic runner with keyboard controls
- **v1.1**: Added power-up system (speed, slow-mo, super jump)
- **v1.2**: Implemented 5-heart health system
- **v1.3**: Added magnet and shield power-ups
- **v1.4**: Added health potion and coin rain event
- **v1.5**: Implemented coin lines for better flow
- **v1.6**: Balance adjustments (rock/coin rain frequency)

## 🐛 Bug Fixes Applied

1. Fixed power-up crashes (gameSpeed override)
2. Adjusted rock spawning frequency
3. Improved collision detection fairness
4. Added damage invincibility system
5. Performance optimization (movement system)

## 🎯 Balance Adjustments

### Enemy Spawn Rates
- Cacti: 2.5s interval (was 1.5s)
- Rocks: 7s base interval (was 5s)
- Both scale with game speed

### Coin Rain
- Spawn: 1-2 coins per 0.25s (was 2-3 per 0.15s)
- Roughly 50% reduction in density

### Health System
- 5 hearts total
- 1.5s invincibility after damage
- Prevents instant death scenarios

## 🎮 How to Play

1. **Allow camera access** when prompted
2. **Raise one hand** above shoulder to jump
3. **Raise both hands** for invincibility mode
4. **Collect coins** and power-ups
5. **Avoid obstacles** (cacti and falling rocks)
6. **Survive as long as possible!**

## 📱 Device Support

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Tablet**: iPad, Android tablets (excellent experience!)
- **Mobile**: Touch-enabled phones
- **Camera**: Front/rear camera support

## 🌟 Tips for Players

1. **Watch for warnings**: Red "!" means rock incoming
2. **Collect coin lines**: All coins in sequence for big combos
3. **Use magnet wisely**: Activate during coin rain for max profit
4. **Save shield**: Best for high-speed sections
5. **Health potions rare**: Don't waste invincibility on cacti

## 🚀 Future Ideas

- [ ] More power-up types (slow-time bubble, double coins)
- [ ] Different environments (desert, snow, space)
- [ ] Achievements system
- [ ] Daily challenges
- [ ] Multiplayer race mode
- [ ] Character customization

## 📊 Statistics

- **Total Features**: 30+
- **Power-Up Types**: 6
- **Coin Types**: 4
- **Obstacle Types**: 2
- **Lines of Code**: ~2500
- **Development Time**: 2 weeks

---

**Made with ❤️ for kids around the world**

Game Engine: [KAPLAY](https://kaplayjs.com/)
Pose Detection: [MediaPipe](https://mediapipe.dev/)
