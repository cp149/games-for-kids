/**
 * Gem Unit Tests
 * Tests Gem class functionality without real DOM
 */

const test = require('node:test');
const assert = require('node:assert');
const { FakeDocument, createTestConfig } = require('../js/test-utils.js');

// Mock Utils globally
global.Utils = {
    getCellSize: () => 50
};

// Mock CONFIG globally
global.CONFIG = createTestConfig();

// Load Gem class
const Gem = require('../js/classes/Gem.js');

test('Gem - Constructor', async (t) => {
    await t.test('creates gem with basic properties', () => {
        const gem = Gem.createForTest(0, 2, 3);

        assert.strictEqual(gem.type, 0);
        assert.strictEqual(gem.row, 2);
        assert.strictEqual(gem.col, 3);
        assert.strictEqual(gem.isMatched, false);
        assert.strictEqual(gem.isSelected, false);
        assert.strictEqual(gem.isFalling, false);
        assert.strictEqual(gem.element, null);
    });

    await t.test('creates gem with all gem types', () => {
        for (let type = 0; type < 6; type++) {
            const gem = Gem.createForTest(type, 0, 0);
            assert.strictEqual(gem.type, type);
        }
    });

    await t.test('uses injected config', () => {
        const customConfig = createTestConfig({
            GEM: { BORDER_WIDTH: 5 }
        });

        const gem = new Gem(0, 0, 0, {
            config: customConfig,
            autoInit: false
        });

        assert.strictEqual(gem._config.GEM.BORDER_WIDTH, 5);
    });

    await t.test('initializes fruit config', () => {
        const gem = Gem.createForTest(0, 0, 0);

        assert.ok(gem.fruitConfig);
        assert.ok(gem.fruitConfig.emoji);
        assert.ok(gem.fruitConfig.color);
    });

    await t.test('auto-creates DOM when autoInit is true', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        assert.ok(gem.element !== null);
    });

    await t.test('skips DOM creation when autoInit is false', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: false
        });

        assert.strictEqual(gem.element, null);
    });
});

test('Gem - createDOMElement', async (t) => {
    await t.test('creates element with correct type', () => {
        const fakeDoc = new FakeDocument();
        const gem = new Gem(2, 1, 1, {
            doc: fakeDoc,
            autoInit: true
        });

        assert.ok(gem.element);
        assert.strictEqual(gem.element.className, 'gem');
    });

    await t.test('sets dataset attributes', () => {
        const fakeDoc = new FakeDocument();
        const gem = new Gem(3, 5, 7, {
            doc: fakeDoc,
            autoInit: true
        });

        // Note: In FakeElement, dataset stores raw values
        // Real DOM would convert to strings, but we test the assignment happened
        assert.strictEqual(gem.element.dataset.type, 3);
        assert.strictEqual(gem.element.dataset.row, 5);
        assert.strictEqual(gem.element.dataset.col, 7);
    });

    await t.test('sets fruit emoji', () => {
        const fakeDoc = new FakeDocument();
        const gem = new Gem(0, 0, 0, {
            doc: fakeDoc,
            autoInit: true
        });

        assert.ok(gem.element.textContent);
        assert.strictEqual(gem.element.textContent, gem.fruitConfig.emoji);
    });

    await t.test('sets background color', () => {
        const fakeDoc = new FakeDocument();
        const gem = new Gem(1, 0, 0, {
            doc: fakeDoc,
            autoInit: true
        });

        assert.strictEqual(gem.element.style.backgroundColor, gem.fruitConfig.color);
    });

    await t.test('sets border style', () => {
        const fakeDoc = new FakeDocument();
        const config = createTestConfig();
        const gem = new Gem(0, 0, 0, {
            doc: fakeDoc,
            config,
            autoInit: true
        });

        const expectedBorder = `${config.GEM.BORDER_WIDTH}px solid ${config.GEM.BORDER_COLOR}`;
        assert.strictEqual(gem.element.style.border, expectedBorder);
    });
});

test('Gem - Position Management', async (t) => {
    await t.test('getPosition returns current position', () => {
        const gem = Gem.createForTest(0, 3, 4);
        const pos = gem.getPosition();

        assert.deepStrictEqual(pos, { row: 3, col: 4 });
    });

    await t.test('isAt checks position correctly', () => {
        const gem = Gem.createForTest(0, 2, 3);

        assert.strictEqual(gem.isAt(2, 3), true);
        assert.strictEqual(gem.isAt(2, 4), false);
        assert.strictEqual(gem.isAt(3, 3), false);
    });

    await t.test('moveTo updates position', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.moveTo(5, 6, false);

        assert.strictEqual(gem.row, 5);
        assert.strictEqual(gem.col, 6);
    });

    await t.test('moveTo updates dataset', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.moveTo(3, 4, false);

        // Note: FakeElement stores raw values, real DOM converts to strings
        assert.strictEqual(gem.element.dataset.row, 3);
        assert.strictEqual(gem.element.dataset.col, 4);
    });
});

test('Gem - Adjacency Check', async (t) => {
    await t.test('detects horizontal adjacency', () => {
        const gem1 = Gem.createForTest(0, 0, 0);
        const gem2 = Gem.createForTest(0, 0, 1);

        assert.strictEqual(gem1.isAdjacentTo(gem2), true);
        assert.strictEqual(gem2.isAdjacentTo(gem1), true);
    });

    await t.test('detects vertical adjacency', () => {
        const gem1 = Gem.createForTest(0, 0, 0);
        const gem2 = Gem.createForTest(0, 1, 0);

        assert.strictEqual(gem1.isAdjacentTo(gem2), true);
    });

    await t.test('rejects diagonal position', () => {
        const gem1 = Gem.createForTest(0, 0, 0);
        const gem2 = Gem.createForTest(0, 1, 1);

        assert.strictEqual(gem1.isAdjacentTo(gem2), false);
    });

    await t.test('rejects same position', () => {
        const gem1 = Gem.createForTest(0, 0, 0);
        const gem2 = Gem.createForTest(0, 0, 0);

        assert.strictEqual(gem1.isAdjacentTo(gem2), false);
    });

    await t.test('rejects distant position', () => {
        const gem1 = Gem.createForTest(0, 0, 0);
        const gem2 = Gem.createForTest(0, 5, 5);

        assert.strictEqual(gem1.isAdjacentTo(gem2), false);
    });
});

test('Gem - State Management', async (t) => {
    await t.test('setSelected adds selected class', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.setSelected(true);

        assert.strictEqual(gem.isSelected, true);
        assert.strictEqual(gem.element.classList.contains('selected'), true);
    });

    await t.test('setSelected removes selected class', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.setSelected(true);
        gem.setSelected(false);

        assert.strictEqual(gem.isSelected, false);
        assert.strictEqual(gem.element.classList.contains('selected'), false);
    });

    await t.test('markAsMatched sets matched state', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.markAsMatched();

        assert.strictEqual(gem.isMatched, true);
        assert.strictEqual(gem.element.classList.contains('matched'), true);
    });

    await t.test('markAsMatched sets opacity to 0', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.markAsMatched();

        assert.strictEqual(gem.element.style.opacity, '0');
    });
});

test('Gem - Transform Cache', async (t) => {
    await t.test('getBaseTransform returns cached value', () => {
        const gem = Gem.createForTest(0, 2, 3);
        gem.getCellSize = () => 50; // Mock

        const transform1 = gem.getBaseTransform();
        const transform2 = gem.getBaseTransform();

        assert.strictEqual(transform1, transform2);
    });

    await t.test('invalidateCache clears cached transform', () => {
        const gem = Gem.createForTest(0, 2, 3);
        gem.getCellSize = () => 50;

        gem.getBaseTransform(); // Create cache
        gem.invalidateCache();

        assert.strictEqual(gem._cachedTransform, null);
    });

    await t.test('cache invalidates on position change', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        const transform1 = gem.getBaseTransform();
        gem.row = 5;
        const transform2 = gem.getBaseTransform();

        assert.notStrictEqual(transform1, transform2);
    });
});

test('Gem - Cleanup', async (t) => {
    await t.test('remove removes element from DOM', () => {
        const fakeDoc = new FakeDocument();
        const parent = fakeDoc.createElement('div');
        const gem = new Gem(0, 0, 0, {
            doc: fakeDoc,
            autoInit: true
        });

        parent.appendChild(gem.element);
        gem.remove();

        assert.strictEqual(gem.element, null);
        assert.strictEqual(parent.children.length, 0);
    });

    await t.test('destroy cleans up all references', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        gem.destroy();

        assert.strictEqual(gem.element, null);
        assert.strictEqual(gem.type, null);
        assert.strictEqual(gem.row, null);
        assert.strictEqual(gem.col, null);
        assert.strictEqual(gem._cachedTransform, null);
    });
});

test('Gem - Test Helpers', async (t) => {
    await t.test('_getSnapshot returns state snapshot', () => {
        const gem = Gem.createForTest(2, 3, 4);
        gem.isMatched = true;
        gem.isSelected = true;

        const snapshot = gem._getSnapshot();

        assert.deepStrictEqual(snapshot, {
            type: 2,
            row: 3,
            col: 4,
            isMatched: true,
            isSelected: true,
            isFalling: false
        });
    });

    await t.test('createForTest creates minimal gem', () => {
        const gem = Gem.createForTest(1, 2, 3);

        assert.strictEqual(gem.type, 1);
        assert.strictEqual(gem.row, 2);
        assert.strictEqual(gem.col, 3);
        assert.strictEqual(gem.element, null);
    });
});

test('Gem - Type Getter', async (t) => {
    await t.test('getType returns gem type', () => {
        for (let type = 0; type < 6; type++) {
            const gem = Gem.createForTest(type, 0, 0);
            assert.strictEqual(gem.getType(), type);
        }
    });
});

test('Gem - Element Getter', async (t) => {
    await t.test('getElement returns null when no DOM', () => {
        const gem = Gem.createForTest(0, 0, 0);
        assert.strictEqual(gem.getElement(), null);
    });

    await t.test('getElement returns element when DOM created', () => {
        const gem = new Gem(0, 0, 0, {
            doc: new FakeDocument(),
            autoInit: true
        });

        assert.ok(gem.getElement() !== null);
    });
});

console.log('All Gem tests completed!');
