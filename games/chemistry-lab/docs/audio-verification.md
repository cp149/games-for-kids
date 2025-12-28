# Audio System Verification Checklist

## Pre-Flight Check

### File Structure ✅
- [x] `index.html` includes `../lib/background-music.js`
- [x] `index.html` includes `js/managers/AudioManager.js`
- [x] Audio control buttons in HTML
- [x] Audio button styles in CSS
- [x] i18n translations for audio controls

### Code Integration ✅
- [x] AudioManager instantiated in ChemistryLabGame
- [x] BackgroundMusicManager initialized in AudioManager
- [x] Audio controls setup in setupAudioControls()
- [x] Tab visibility handling configured
- [x] LocalStorage persistence implemented

## Manual Testing Steps

### 1. UI Controls Test
1. **Load game** → Audio buttons visible in top-right
2. **Click music button** → Icon toggles 🔊 ↔ 🔇
3. **Click sound button** → Icon toggles 🔊 ↔ 🔇
4. **Hover buttons** → Smooth hover effect
5. **Keyboard tab** → Focus outline visible
6. **Press Enter on button** → Toggles state

### 2. State Persistence Test
1. **Disable music** → Reload page → Music stays disabled
2. **Enable music** → Reload page → Music stays enabled
3. **Disable sound** → Reload page → Sound stays disabled
4. **Enable sound** → Reload page → Sound stays enabled

### 3. Tab Visibility Test
1. **Start game with music enabled**
2. **Switch to another tab** → Music pauses
3. **Return to tab** → Music resumes
4. **Disable music manually** → Switch tabs → No change
5. **Switch back** → Music stays disabled (not auto-resumed)

### 4. Game Integration Test
1. **Drag card to slot** → playCardDrop() called
2. **Mix reaction** → playReactionSound() called
3. **Use catalyst** → playCatalystSound() called
4. **Use stabilizer** → playStabilizerSound() called
5. **Complete level** → playLevelComplete() called
6. **Time expires** → playFail() called

### 5. Error Handling Test
1. **No audio files present** → No console errors
2. **Invalid file path** → Silent fail
3. **Empty music tracks** → Music doesn't start
4. **Toggle controls** → Still functional

### 6. Mobile Responsive Test
1. **Resize to mobile** → Buttons resize to 40x40px
2. **Touch buttons** → State toggles correctly
3. **Buttons don't overlap** → Layout intact
4. **Icons readable** → Size appropriate

### 7. Accessibility Test
1. **Tab navigation** → Can reach audio buttons
2. **Screen reader** → ARIA labels announced
3. **Keyboard control** → Enter/Space toggles
4. **Focus indicators** → Clearly visible

### 8. Language Switch Test
1. **Start in English** → Tooltips in English
2. **Switch to Chinese** → Tooltips update to Chinese
3. **Toggle music** → Chinese label updates
4. **Switch back to English** → Labels update correctly

## Browser Console Checks

### Expected Behavior (No Audio Files)
```
No errors
No warnings about audio files
BackgroundMusicManager doesn't start music
Sound effects fail silently
```

### Expected Behavior (With Audio Files)
```
Music starts on game start
Sound effects play on events
No console errors
Clean resource cleanup on destroy
```

## LocalStorage Inspection

### Check Values
```javascript
// In browser console
localStorage.getItem('chemistry-lab-music-enabled');  // "true" or "false"
localStorage.getItem('chemistry-lab-sound-enabled');  // "true" or "false"
```

### Clear Values (Reset Test)
```javascript
localStorage.removeItem('chemistry-lab-music-enabled');
localStorage.removeItem('chemistry-lab-sound-enabled');
// Reload → Should default to enabled (true)
```

## Performance Checks

### Memory Leaks
1. **Open DevTools → Memory tab**
2. **Take heap snapshot**
3. **Toggle audio controls 10 times**
4. **Take another snapshot**
5. **Compare** → No significant growth

### Event Listeners
1. **Open DevTools → Elements**
2. **Select audio button**
3. **Event Listeners panel** → Should see click listener
4. **Destroy game**
5. **Check again** → Listeners removed

### Concurrent Sounds
1. **Trigger multiple sounds quickly**
2. **Verify** → Maximum 3 playing simultaneously
3. **No audio overload**

## Code Quality Checks

### AudioManager.js
- [x] All methods have JSDoc comments
- [x] Proper error handling
- [x] Resource cleanup in destroy()
- [x] No console.log (except silent errors)
- [x] English comments only

### ChemistryLabGame.js
- [x] Audio manager initialized
- [x] Controls setup called
- [x] Sound effects triggered at right events
- [x] Proper cleanup in destroy()

### UIManager.js
- [x] Music toggle update method
- [x] Sound toggle update method
- [x] i18n integration for labels

## Integration Verification

### BackgroundMusicManager Integration
```javascript
// Check in browser console
window.BackgroundMusicManager !== undefined  // true
game.audioMgr.bgMusicMgr !== null           // true
game.audioMgr.bgMusicMgr.isEnabled()        // boolean
```

### Audio Controls Integration
```javascript
// Check in browser console
document.getElementById('music-toggle') !== null  // true
document.getElementById('sound-toggle') !== null  // true
game.audioMgr.isMusicEnabled()                   // boolean
game.audioMgr.isSoundEnabled()                   // boolean
```

## Known Limitations

### Current State
- ✅ System fully functional
- ✅ UI controls working
- ✅ Preferences persisted
- ⚠️ No actual audio files (placeholders)
- ⚠️ Music tracks array empty

### Expected Behavior Without Audio
- Music won't start (no tracks configured)
- Sound effects fail silently
- No console errors
- Controls still functional

## Success Criteria

All these should be ✅:
- [x] Audio controls visible and functional
- [x] State toggles correctly
- [x] LocalStorage persistence works
- [x] Tab visibility auto-pause works
- [x] No console errors
- [x] Mobile responsive
- [x] Accessibility compliant
- [x] i18n translations working
- [x] Graceful degradation without audio files
- [x] Proper resource cleanup

## Next Steps

1. **Add audio files** to `assets/sounds/`
2. **Configure music tracks** in AudioManager constructor
3. **Test with real audio**
4. **Optimize file sizes**
5. **Final QA testing**

## Issue Resolution

### If Music Won't Play
1. Check browser autoplay policy
2. Verify tracks array not empty
3. Check file paths are correct
4. Ensure enabled state is true

### If Sounds Won't Play
1. Check sound files exist
2. Verify file paths in AudioManager
3. Check enabled state
4. Verify concurrent sound limit not exceeded

### If Controls Not Working
1. Check event listeners attached
2. Verify DOM elements exist
3. Check z-index (should be 100)
4. Inspect for CSS conflicts
