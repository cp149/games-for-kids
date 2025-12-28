# Chemistry Lab - Game Improvement Plan 🧪

## 1. Problem Analysis

The current version of "Chemistry Lab" suffers from several critical issues that limit its playability and engagement:

*   **Shallow Gameplay Loop:** The core mechanic (drag cards -> mix -> clear) is too repetitive.
*   **Limited Content:** Only 7 basic reactions (color mixing) provide no depth or discovery.
*   **Lack of Challenge:** "Puzzle" elements are trivial (e.g., "Make Purple" = Red + Blue).
*   **Visual Disconnect:** The mix of DOM elements for UI and Canvas for particles creates a disjointed experience. The visual feedback (emojis) is generic.
*   **Low "Game Feel":** Inputs lack weight, and rewards feel satisfying.

## 2. Proposed Core Mechanics Overhaul

### 2.1. "Alchemist's Chain" System
Instead of simple 1-step reactions (A+B=C), introduce **multi-step synthesis chains**.
*   **Tier 1 Elements:** Basic drops (Red, Blue, Yellow, Water).
*   **Tier 2 Compounds:** Created by mixing Tier 1 (e.g., Steam, Mud, Energy).
*   **Tier 3 Potions:** Created by mixing Compounds (e.g., Potion of Flight, Gold).

**Gameplay Change:**
*   Players must manage slot space to hold intermediate products.
*   "Recipes" are unlocked as the player discovers them.

### 2.2. Dynamic "Stability" Mechanic
Elements shouldn't just "expire." They should have **volatile states**.
*   **Unstable Elements:** Must be mixed within 5 seconds or they explode, damaging the "Lab Health" or deducting score.
*   **Chain Reactions:** An explosion can trigger adjacent unstable elements.
*   **Stabilizers:** Can be applied to "freeze" an unstable element for later use.

### 2.3. Combo & Fever Mode
*   **Speed Bonus:** Completing reactions quickly builds a "Heat Meter."
*   **Fever Mode:** When the meter is full, reaction speeds double, and points are tripled. Visuals should shift to a high-energy state.

## 3. Visual & Audio Enhancements ("Juice")

### 3.1. Asset Replacement
*   Replace standard Emojis with **custom sprite assets** (even simple pixel art or vector bubbles).
*   **Fluid Animations:** Liquids should slosh in the vials (slots).
*   **Dynamic Lighting:** Explosions should light up the surrounding UI.

### 3.2. Better Feedback
*   **Screen Shake:** On large explosions.
*   **Sound Layering:** Combine "hissing," "bubbling," and "pop" sounds for reactions.
*   **Floating Text:** Dynamic, bouncing score numbers that scale with point value.

## 4. Content Roadmap

### Phase 1: The "Discovery" Update
*   Implement the **Synthesis Tree** (Tier 1 -> Tier 3).
*   Add a "Recipe Book" UI that fills in as players discover combos.
*   Retire the strict "Level" structure in favor of an **Endless Mode** with increasing difficulty (faster drops, more unstable elements).

### Phase 2: The "Lab Hazards" Update
*   **Hazards:** Frozen pipes (slows slots), Gas leaks (obscures vision).
*   **Tools:** Bunsen Burner (heats up reactions), Fan (clears gas).

## 5. Technical Implementation Steps

1.  **Refactor `ReactionManager`:** Support multi-input, varying-output recipes.
2.  **Update `SlotManager`:** Allow slots to hold "result" items for further mixing (currently they clear immediately).
3.  **Rewrite `CardDropManager`:** Implement the "Volatile" state logic.
4.  **UI Overhaul:** Integrate the "Recipe Book" and "Heat Meter".

## 6. Immediate Action Items (Next 24 Hours)

*   [ ] **Prototype the Synthesis Tree:** Define 5 new complex recipes.
*   [ ] **Update `ReactionRules.js`:** Support the new recipes.
*   [ ] **Modify `ChemistryLabGame.js`:** Allow created items to stay in slots.
