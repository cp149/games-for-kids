# 🧩 Puzzle Master

A fun and interactive puzzle game for kids! Load your own images and solve puzzles at different difficulty levels.

## 🎮 Features

### Image Sources
- **📁 File Upload**: Load images from your device
- **📷 Camera**: Take a photo and turn it into a puzzle
- **🎨 Default Image**: Colorful example puzzle to start with

### Difficulty Levels
- **Easy**: 4 pieces (2×2 grid)
- **Medium**: 9 pieces (3×3 grid)
- **Hard**: 16 pieces (4×4 grid)
- **Expert**: 25 pieces (5×5 grid)

### Game Mechanics
- **Drag & Drop**: Intuitive piece movement
- **Smart Snap**: Pieces automatically snap when near correct position
- **Visual Feedback**: Green glow when piece is placed correctly
- **Completion Animation**: Celebration effects when puzzle is complete

### Helper Features
- **👁️ Reference Image**: Toggle to show/hide the original image
- **💡 Hint System**: Highlights next piece and its correct position
- **🔀 Shuffle**: Restart the puzzle with same image
- **⏱️ Timer**: Track how long it takes to complete
- **🔄 Move Counter**: See how many moves you made

### Keyboard Shortcuts
- **H**: Show hint
- **R**: Shuffle/Reset puzzle
- **Space**: Toggle reference image

## 🏗️ Architecture

Built with object-oriented design principles:

### Classes

#### `PuzzlePiece`
- Represents individual draggable puzzle piece
- Handles drag & drop events (mouse + touch)
- Manages piece positioning and snapping
- Provides visual feedback

#### `PuzzleBoard`
- Manages the puzzle grid and all pieces
- Handles image slicing into pieces
- Detects correct piece placement
- Provides hint system
- Triggers completion events

#### `ImageLoader`
- Loads images from multiple sources
- File upload handling
- Camera capture with preview
- URL loading support

#### `PuzzleGame`
- Main game controller
- Manages UI and game state
- Handles difficulty selection
- Tracks statistics (time, moves)
- Coordinates all classes

## 📱 Device Support

- **Desktop**: Full drag & drop support
- **Tablet**: Touch-optimized controls
- **Mobile**: Responsive layout and touch events
- **Camera**: Works on devices with camera access

## 🎨 Integration with Drawing Studio

Perfect companion to Drawing Studio! Kids can:
1. Create artwork in Drawing Studio
2. Export/save their drawing
3. Load it into Puzzle Master
4. Solve their own creation as a puzzle!

## 🔧 Technical Details

- **Pure JavaScript**: No frameworks required
- **ES6 Classes**: Clean object-oriented code
- **Canvas API**: Image manipulation and slicing
- **Responsive CSS**: Works on all screen sizes
- **Touch Events**: Full mobile support

## 🎯 Future Enhancements

- [ ] Save/load puzzle progress
- [ ] Leaderboard for best times
- [ ] Multiple image templates
- [ ] Irregular piece shapes (jigsaw style)
- [ ] Multiplayer mode
- [ ] Sound effects and music
- [ ] More celebration animations
- [ ] Custom difficulty (NxN grid)

## 📊 Statistics

- **Classes**: 4 main classes
- **Lines of Code**: ~800
- **Difficulty Levels**: 4
- **Supported Sources**: 3 (file, camera, default)

---

**Made with ❤️ for kids around the world**

Play now and turn any image into a fun puzzle challenge!
