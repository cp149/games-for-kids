# Level 8 Testing Guide - Hiccupping Pot System

## Quick Test Instructions

### 1. Start Level 8
```javascript
// Open browser console (F12)
// Navigate to Level 8 or force load:
game.levelMgr.loadLevel(8);
```

### 2. Trigger LAVA Spawn
```
Action: Mix BLUE + YELLOW to create MUD
Result: 15% chance MUD transforms to LAVA (🌋)
Fallback: Mix again until LAVA appears
```

### 3. Observe Warning System

**Timeline**:
```
T+0s:  LAVA created, placed in slot
T+2s:  (Normal state, no warning yet)
T+3s:  ⚠️ WARNING PHASE STARTS
       - Shake begins (subtle)
       - Color starts shifting orange → red
       - First beep plays (low pitch, 500ms interval)
T+4s:  - Shake accelerates
       - Color more red
       - Beeps faster and higher pitch
T+5s:  - Shake intense (12px magnitude, 25Hz)
       - Pure red color
       - Beeps very rapid (100ms interval, 2.5x pitch)
T+5s:  💥 EXPLOSION
       - Card destroyed
       - 1-second red flash overlay
       - Card dropping pauses
       - NPC hint appears (first time only)
T+6s:  - Recovery complete
       - Card dropping resumes
```

### 4. Test NPC Hint

**First Explosion**:
- NPC avatar 👩‍🔬 appears with message
- Message: "⚠️ Careful! Lava cards explode after 5 seconds..."
- Auto-dismisses after 4 seconds

**Subsequent Explosions**:
- No hint shown
- Only red flash and recovery

### 5. Performance Check

**Browser DevTools**:
1. Open Performance tab
2. Start recording
3. Trigger LAVA explosion
4. Stop recording after recovery
5. Check CPU usage < 8%

**Console Logging**:
```javascript
// Monitor dangerous card updates
game.dangerousCardMgr.dangerousCards.size // Should be 0-1
game.dangerousCardMgr.hasWarningCards()   // true during last 3s
```

## Visual Verification Checklist

- [ ] LAVA emoji 🌋 appears in card
- [ ] Card shakes in circular motion during warning
- [ ] Shake frequency increases smoothly
- [ ] Color transitions Orange → Red smoothly
- [ ] Glow effect pulses and intensifies
- [ ] Box-shadow expands during warning
- [ ] Card explodes exactly at 5 seconds
- [ ] Red flash overlay appears
- [ ] NPC hint displays correctly (first time)
- [ ] Recovery overlay disappears after 1 second

## Audio Verification Checklist

- [ ] Beep sound starts at T+3s
- [ ] Beep pitch increases over time
- [ ] Beep interval decreases (500ms → 100ms)
- [ ] Beeps stop when card explodes
- [ ] Fail sound plays on explosion
- [ ] Audio respects user mute settings

## Gameplay Testing

### Test Case 1: Normal Explosion
1. Create LAVA (BLUE+YELLOW → MUD → LAVA)
2. Wait without touching
3. Verify explosion at 5s
4. Verify 1s recovery
5. Verify card dropping resumes

**Expected**: Full warning cycle → explosion → recovery

### Test Case 2: Quick Use
1. Create LAVA
2. Immediately mix with another reagent
3. Verify no explosion

**Expected**: LAVA consumed before explosion timer

### Test Case 3: Multiple LAVA
1. Create 2+ LAVA cards
2. Observe independent timers
3. Verify separate explosions

**Expected**: Each LAVA has independent countdown

### Test Case 4: Level Completion During Warning
1. Create LAVA
2. During warning phase (T+3-5s)
3. Complete level objective
4. Verify warning stops

**Expected**: Level transition cancels dangerous card system

### Test Case 5: Cooling (Future Feature)
1. Create LAVA
2. Drag to ice/water reagent (when implemented)
3. Verify transforms to OBSIDIAN 🪨

**Expected**: LAVA → OBSIDIAN, no explosion

## Performance Benchmarks

### Target Metrics
- **Frame Rate**: 60fps (16.67ms per frame)
- **CPU Usage**: < 8% during warning phase
- **Memory**: < 0.5MB per LAVA card
- **Update Time**: < 2ms per dangerous card

### Measurement Code
```javascript
// Add to browser console
let frameCount = 0;
let totalTime = 0;

const measurePerformance = () => {
  const start = performance.now();

  // Measure dangerous card update
  if (game.dangerousCardMgr) {
    game.dangerousCardMgr.update(16.67);
  }

  const elapsed = performance.now() - start;
  totalTime += elapsed;
  frameCount++;

  if (frameCount % 60 === 0) {
    console.log(`Average update time: ${(totalTime / frameCount).toFixed(2)}ms`);
  }

  requestAnimationFrame(measurePerformance);
};

measurePerformance();
```

## Common Issues & Fixes

### Issue 1: LAVA Not Spawning
**Symptom**: MUD always created, never LAVA
**Fix**: Check `Level8.lavaSpawnChance` is 0.15 (15%)
**Debug**: Temporarily set to 1.0 (100%) for testing

### Issue 2: No Shake Animation
**Symptom**: LAVA card stationary during warning
**Fix**: Verify `HiccuppingPot.update()` is being called
**Debug**: Check `game.levelMgr.currentLevel.update()` runs

### Issue 3: No Audio
**Symptom**: Silent beeps
**Fix**:
1. Check `assets/sounds/beep.mp3` exists
2. Verify browser auto-play policy allows audio
3. Check sound toggle is ON

**Debug**:
```javascript
// Test audio directly
const audio = new Audio('assets/sounds/beep.mp3');
audio.play();
```

### Issue 4: Explosion Timing Wrong
**Symptom**: Explodes before/after 5 seconds
**Fix**: Check `HiccuppingPot.fuseTime` is 5000ms
**Debug**: Log remaining time
```javascript
const remaining = hiccup.getTimeRemaining();
console.log('Remaining:', remaining * 5); // seconds
```

### Issue 5: NPC Hint Always Shows
**Symptom**: Hint appears on every explosion
**Fix**: Check `hasShownFirstHint` flag persists
**Debug**:
```javascript
game.dangerousCardMgr.hasShownFirstHint // should be true after first
```

### Issue 6: Recovery Too Long
**Symptom**: >1 second pause after explosion
**Fix**: Check `DangerousCardManager.recoveryTime` is 1000ms
**Debug**: Time the recovery manually

## Browser Compatibility

### Tested Browsers
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Chrome ✅
- Mobile Safari ✅

### Known Issues
- Safari: Audio may require user gesture first
- Firefox: Slight animation jank on low-end devices
- Mobile: Vibration API not supported on iOS

## Accessibility Testing

- [ ] Keyboard-only: Can drag LAVA cards with keyboard
- [ ] Screen reader: Announces "Dangerous LAVA card" when created
- [ ] High contrast: Warning colors still visible
- [ ] Reduced motion: Shake animation respects `prefers-reduced-motion`

## Regression Testing

After code changes, verify:
1. Normal MUD synthesis still works
2. Other levels unaffected
3. LAVA only spawns in Level 8
4. DangerousCardManager destroyed on level change
5. No memory leaks after multiple explosions

## Debug Console Commands

```javascript
// Force spawn LAVA (in console)
const lavaCard = game.cardFactory.createReagentCard('LAVA', 100, 100);
game.cardDropMgr.cards.push(lavaCard);
game.dangerousCardMgr.registerDangerousCard(lavaCard);

// Check dangerous card count
game.dangerousCardMgr.dangerousCards.size

// Get warning status
game.dangerousCardMgr.hasWarningCards()

// Force explosion
const card = Array.from(game.dangerousCardMgr.dangerousCards.values())[0]?.card;
if (card) game.dangerousCardMgr.handleExplosion(card);

// Skip to Level 8
game.levelMgr.loadLevel(8);
```

## Success Criteria

All tests pass:
- ✅ LAVA spawns ~15% of the time
- ✅ Warning phase starts at T+3s
- ✅ Shake accelerates smoothly
- ✅ Audio beeps accelerate in pitch and frequency
- ✅ Explosion occurs at exactly T+5s
- ✅ Recovery takes exactly 1 second
- ✅ NPC hint shows only once
- ✅ Performance < 8% CPU
- ✅ No crashes or memory leaks
- ✅ Works in all target browsers

## Sign-Off

**Tester**: __________________
**Date**: __________________
**Build**: __________________
**Result**: Pass / Fail / Conditional

**Notes**:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
