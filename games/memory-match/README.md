# Animal Memory Match 🎮

A delightful memory matching card game designed for children ages 3-8. Match cute animal pairs to win!

![Game Preview](docs/preview-placeholder.md)

## 🎯 Game Description

Animal Memory Match is a fun and educational memory game where children flip cards to find matching pairs of cute animals. The game helps develop memory skills, concentration, and pattern recognition in a friendly, pressure-free environment.

### Features

- 🐱 **6 Cute Animal Pairs**: Cat, Dog, Rabbit, Panda, Elephant, and Lion
- 🌍 **Multi-language Support**: English, Chinese (Simplified), and Japanese
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile
- 🎨 **Child-Friendly Design**: Bright colors, large touch targets, and simple interactions
- ⏱️ **Performance Tracking**: Track time and number of moves
- ⭐ **Star Rating System**: Encourages improvement without pressure
- 🔊 **Sound Toggle**: Optional audio feedback (coming soon)
- ♿ **Accessible**: Designed for young children with motor skill considerations

## 🚀 How to Play

1. **Start the Game**: Open `index.html` in your web browser
2. **Flip Cards**: Click or tap any card to reveal the animal
3. **Find Matches**: Click another card to find its matching pair
4. **Remember**: If cards don't match, they flip back - remember where they are!
5. **Win**: Match all 6 pairs to complete the game
6. **Try Again**: Click "Play Again" to improve your score

## 🎮 Controls

- **Click/Tap**: Flip a card
- **New Game Button**: Start a fresh game
- **Language Selector**: Switch between English, Chinese, and Japanese
- **Sound Toggle**: Enable or disable sound effects

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation needed - just open `index.html`
- Works offline (all assets included)

## 🏗️ Project Structure

```
memory-match/
├── index.html              # Main game file (complete game in one file)
├── README.md               # This file
├── assets/
│   └── images/
│       ├── cat.png         # Cat card image
│       ├── dog.png         # Dog card image
│       ├── rabbit.png      # Rabbit card image
│       ├── panda.png       # Panda card image
│       ├── elephant.png    # Elephant card image
│       ├── lion.png        # Lion card image
│       └── card-back.png   # Card back pattern
└── docs/
    ├── design.md           # Game design document
    ├── ui-design.md        # UI/UX design specifications
    ├── decisions.md        # Technical decisions
    └── user-guide.md       # Detailed how-to-play guide
```

## 🎨 Design Highlights

### For Children Ages 3-8
- **Large Touch Targets**: Minimum 80px × 80px cards for easy clicking
- **Simple Mechanics**: Just click to flip - no complex interactions
- **No Time Pressure**: Play at your own pace
- **Positive Feedback**: Encouraging messages regardless of performance
- **Clear Visual States**: Easy to understand what's clickable

### Technical Excellence
- **Pure HTML/CSS/JS**: No dependencies, fast loading
- **60 FPS Animations**: Smooth card flips using CSS transforms
- **Mobile-First Design**: Responsive layout adapts to any screen
- **I18n System**: Complete internationalization support
- **Semantic HTML**: Accessible and SEO-friendly markup

## 🌍 Supported Languages

- **English** 🇺🇸
- **中文 (Chinese Simplified)** 🇨🇳
- **日本語 (Japanese)** 🇯🇵

Switch languages using the dropdown in the header.

## 📊 Scoring System

### Moves Counter
- Each pair of card flips counts as 1 move
- Perfect game: 6 moves (very rare!)
- Average game: 12-18 moves

### Star Rating
- ⭐⭐⭐ **Excellent**: Less than 15 moves
- ⭐⭐ **Good**: 15-20 moves
- ⭐ **Nice Try**: More than 20 moves

### Time Tracker
- Timer starts when the game loads
- Stops when all pairs are matched
- Challenge yourself to improve your time!

## 🎯 Educational Benefits

- **Memory Development**: Strengthens short-term memory
- **Concentration**: Improves focus and attention span
- **Pattern Recognition**: Develops visual matching skills
- **Confidence Building**: Success-oriented gameplay
- **Multilingual Exposure**: Learn animal names in different languages

## 🔧 Technical Details

### Technologies Used
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Custom i18n system

### Performance
- Target: 60 FPS animations
- GPU-accelerated CSS transforms
- Optimized image assets (< 50KB each)
- Zero dependencies

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

### Desktop (>= 1024px)
- 4 columns × 3 rows grid
- 120px cards with 15px gaps

### Tablet (768px - 1023px)
- 3 columns × 4 rows grid
- 110px cards with 12px gaps

### Mobile (< 768px)
- 2 columns × 6 rows grid
- 100px cards with 10px gaps

### Small Mobile (< 360px)
- 2 columns × 6 rows grid
- 80px cards with 8px gaps

## 🎓 For Developers

### Code Quality
- ✅ All code in English
- ✅ Comprehensive comments
- ✅ Semantic HTML
- ✅ Clean CSS architecture
- ✅ Modular JavaScript class structure
- ✅ No console.log in production

### Following Standards
- CLAUDE.md language policy compliance
- I18n best practices
- Accessibility guidelines (WCAG 2.1 AA)
- Mobile-first responsive design
- Performance optimization

### Extending the Game

**Add More Animals:**
```javascript
this.animals = [
    // ... existing animals
    { name: 'monkey', image: 'assets/images/monkey.png' }
];
```

**Add More Languages:**
```javascript
const messages = {
    // ... existing languages
    es: {
        game_title: "Memoria Animal",
        // ... more translations
    }
};
```

**Adjust Difficulty:**
```javascript
// Change number of pairs (currently 6)
// Add more animals or create difficulty levels
```

## 🐛 Known Issues

None currently! The game has been tested and optimized.

## 🔮 Future Enhancements

- 🔊 Sound effects (flip, match, victory)
- 🎵 Background music
- 🏆 High score tracking (localStorage)
- 🎚️ Difficulty levels (Easy/Medium/Hard)
- 🎨 Multiple themes (different animal sets)
- 👥 Two-player mode
- 🏅 Achievement system

## 📄 License

This game is part of the mgame project. See project root for license information.

## 🙏 Credits

- **Game Design**: @game-designer
- **UI/UX Design**: @ui-ux-designer
- **Development**: @frontend-developer, @game-mechanics-engineer
- **Testing**: @qa-tester
- **Documentation**: @project-chronicler

## 📞 Support

For issues or questions about this game:
1. Check the [User Guide](docs/user-guide.md)
2. Review [Design Decisions](docs/decisions.md)
3. Refer to the main project documentation

---

**Version**: 1.0.0
**Last Updated**: 2025-10-06
**Tested**: Chrome, Firefox, Safari, iOS Safari, Chrome Mobile

**Enjoy the game! Have fun matching animals! 🎉**
