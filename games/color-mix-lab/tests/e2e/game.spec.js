/**
 * E2E Tests for Color Mix Lab Game
 */
const { test, expect } = require('@playwright/test');

/**
 * Helper function for stable drag and drop operations
 * Uses manual mouse movements to work reliably with custom DragManager
 *
 * @param {Page} page - Playwright page object
 * @param {Locator} source - Source element to drag from
 * @param {Locator} target - Target element to drag to
 */
async function dragAndDrop(page, source, target) {
  // Get bounding boxes for both elements
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Unable to get bounding box for drag operation');
  }

  // Calculate center positions
  const sourceX = sourceBox.x + sourceBox.width / 2;
  const sourceY = sourceBox.y + sourceBox.height / 2;
  const targetX = targetBox.x + targetBox.width / 2;
  const targetY = targetBox.y + targetBox.height / 2;

  // 1. Hover over source element
  await source.hover();
  await page.waitForTimeout(100);

  // 2. Mouse down on source
  await page.mouse.down();
  await page.waitForTimeout(100);

  // 3. Move to target with slow steps (20 steps for smooth animation)
  await page.mouse.move(targetX, targetY, { steps: 20 });
  await page.waitForTimeout(100);

  // 4. Mouse up to complete drop
  await page.mouse.up();
}

test.describe('Color Mix Lab - Basic Page Load', () => {
  test('should load the page successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be loaded
    await page.waitForLoadState('domcontentloaded');

    // Verify page loaded
    expect(page.url()).toContain('color-mix-lab');
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');

    // Get the page title
    const title = await page.title();

    // Verify title contains expected text
    expect(title).toContain('Color Mix Lab');
  });

  test('should have game container element', async ({ page }) => {
    await page.goto('/');

    // Check for main game container
    const gameContainer = await page.locator('#game-container');
    await expect(gameContainer).toBeVisible();
  });
});

test.describe('Color Mix Lab - Color Mixing Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for game to initialize
    await page.waitForSelector('.bowl', { state: 'visible' });
    await page.waitForTimeout(500);
  });

  test('should mix red and blue to create purple', async ({ page }) => {
    // Locate elements
    const redSource = page.locator('.red-source');
    const blueSource = page.locator('.blue-source');
    const bowl = page.locator('.bowl');
    const liquid = page.locator('.liquid');

    // Verify color sources are visible
    await expect(redSource).toBeVisible();
    await expect(blueSource).toBeVisible();
    await expect(bowl).toBeVisible();

    // Drag red to bowl using stable helper
    await dragAndDrop(page, redSource, bowl);

    // Wait for animation
    await page.waitForTimeout(500);

    // Drag blue to bowl using stable helper
    await dragAndDrop(page, blueSource, bowl);

    // Wait for mixing animation
    await page.waitForTimeout(500);

    // Check if liquid background color is purple
    const liquidBg = await liquid.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    // Convert RGB to hex for comparison
    const rgbToHex = (rgb) => {
      const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    };

    const liquidHex = rgbToHex(liquidBg);

    // Purple color from CONFIG.COLORS.SECONDARY.purple: #9944FF
    expect(liquidHex).toBe('#9944FF');
  });

  test('should mix red and yellow to create orange', async ({ page }) => {
    const redSource = page.locator('.red-source');
    const yellowSource = page.locator('.yellow-source');
    const bowl = page.locator('.bowl');
    const liquid = page.locator('.liquid');

    // Drag red to bowl using stable helper
    await dragAndDrop(page, redSource, bowl);
    await page.waitForTimeout(500);

    // Drag yellow to bowl using stable helper
    await dragAndDrop(page, yellowSource, bowl);
    await page.waitForTimeout(500);

    // Check for orange color
    const liquidBg = await liquid.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    const rgbToHex = (rgb) => {
      const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    };

    const liquidHex = rgbToHex(liquidBg);

    // Orange color from CONFIG.COLORS.SECONDARY.orange: #FF8844
    expect(liquidHex).toBe('#FF8844');
  });

  test('should mix blue and yellow to create green', async ({ page }) => {
    const blueSource = page.locator('.blue-source');
    const yellowSource = page.locator('.yellow-source');
    const bowl = page.locator('.bowl');
    const liquid = page.locator('.liquid');

    // Drag blue to bowl using stable helper
    await dragAndDrop(page, blueSource, bowl);
    await page.waitForTimeout(500);

    // Drag yellow to bowl using stable helper
    await dragAndDrop(page, yellowSource, bowl);
    await page.waitForTimeout(500);

    // Check for green color
    const liquidBg = await liquid.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    const rgbToHex = (rgb) => {
      const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    };

    const liquidHex = rgbToHex(liquidBg);

    // Green color from CONFIG.COLORS.GREEN: #44DD44
    expect(liquidHex).toBe('#44DD44');
  });

  test('should update chameleon color on successful mix', async ({ page }) => {
    const redSource = page.locator('.red-source');
    const blueSource = page.locator('.blue-source');
    const bowl = page.locator('.bowl');
    const chameleonBody = page.locator('.chameleon-body');

    // Drag red to bowl using stable helper
    await dragAndDrop(page, redSource, bowl);
    await page.waitForTimeout(500);

    // Drag blue to bowl (should create purple) using stable helper
    await dragAndDrop(page, blueSource, bowl);
    await page.waitForTimeout(500);

    // Check chameleon color changed to purple
    const chameleonBg = await chameleonBody.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor;
    });

    const rgbToHex = (rgb) => {
      const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (!match) return rgb;
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`.toUpperCase();
    };

    const chameleonHex = rgbToHex(chameleonBg);

    // Purple color
    expect(chameleonHex).toBe('#9944FF');
  });

  test('should clear bowl when clear button is clicked', async ({ page }) => {
    const redSource = page.locator('.red-source');
    const bowl = page.locator('.bowl');
    const liquid = page.locator('.liquid');
    const clearBtn = page.locator('.clear-btn');

    // Drag red to bowl using stable helper
    await dragAndDrop(page, redSource, bowl);
    await page.waitForTimeout(500);

    // Verify liquid has red color
    let liquidBg = await liquid.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(liquidBg).not.toBe('rgba(0, 0, 0, 0)');

    // Click clear button
    await clearBtn.click();
    await page.waitForTimeout(300);

    // Verify bowl is cleared (transparent background)
    liquidBg = await liquid.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // After clear, liquid should be transparent or reset
    expect(liquidBg === 'rgba(0, 0, 0, 0)' || liquidBg === 'transparent').toBe(true);
  });

  test('should show drag-over state when dragging over bowl', async ({ page }) => {
    const redSource = page.locator('.red-source');
    const bowl = page.locator('.bowl');

    // Get bowl bounding box
    const bowlBox = await bowl.boundingBox();

    // Start dragging
    await redSource.hover();
    await page.mouse.down();

    // Move to bowl center
    await page.mouse.move(
      bowlBox.x + bowlBox.width / 2,
      bowlBox.y + bowlBox.height / 2,
      { steps: 5 }
    );

    // Wait a moment for drag-over class to apply
    await page.waitForTimeout(100);

    // Check for drag-over class
    const hasDragOver = await bowl.evaluate((el) => {
      return el.classList.contains('drag-over');
    });

    expect(hasDragOver).toBe(true);

    // Release mouse
    await page.mouse.up();
  });

  test('should handle bowl auto-clear after mixing', async ({ page }) => {
    const redSource = page.locator('.red-source');
    const blueSource = page.locator('.blue-source');
    const bowl = page.locator('.bowl');
    const liquid = page.locator('.liquid');

    // Mix red and blue using stable helper
    await dragAndDrop(page, redSource, bowl);
    await page.waitForTimeout(500);
    await dragAndDrop(page, blueSource, bowl);
    await page.waitForTimeout(500);

    // Verify purple appears
    let liquidBg = await liquid.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(liquidBg).not.toBe('rgba(0, 0, 0, 0)');

    // Wait for auto-clear (2000ms according to ColorMixGame.js)
    await page.waitForTimeout(2500);

    // Verify bowl is cleared
    liquidBg = await liquid.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(liquidBg === 'rgba(0, 0, 0, 0)' || liquidBg === 'transparent').toBe(true);
  });

  test('should show particles animation when adding color', async ({ page }) => {
    const redSource = page.locator('.red-source');
    const bowl = page.locator('.bowl');
    const particles = page.locator('.particles');

    // Drag red to bowl using stable helper
    await dragAndDrop(page, redSource, bowl);

    // Wait briefly for animation to start
    await page.waitForTimeout(200);

    // Check if particles container has child elements (color particles)
    const particleCount = await particles.evaluate((el) => {
      return el.children.length;
    });

    // Should have at least one particle animation
    expect(particleCount).toBeGreaterThan(0);
  });
});
