/**
 * TutorialSystem Unit Tests
 * Tests tutorial modes: handheld, image, none
 * Tests hint system after failures
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { TutorialSystem } from '../js/systems/TutorialSystem.js';

// Reset DOM before each test
const resetDOM = () => {
    document.body.innerHTML = '';
};

// Mock CONFIG
const mockConfig = {
    COLORS: {
        PRIMARY: { red: '#FF6B6B', blue: '#448AFF', yellow: '#FFE66D' },
        SECONDARY: { purple: '#9944FF', orange: '#FF8844', green: '#44DD44' },
        SPECIAL: { mud: '#8B6914' }
    },
    COLOR_EMOJIS: {
        red: '🔴',
        blue: '🔵',
        yellow: '🟡',
        orange: '🟠',
        green: '🟢',
        purple: '🟣',
        mud: '💩'
    },
    LEVELS: {
        1: {
            name: 'make_orange',
            availableColors: ['red', 'yellow'],
            goal: { type: 'secondary', color: 'orange', count: 1 },
            tutorial: 'handheld',
            sticker: 'orange'
        },
        2: {
            name: 'make_green',
            availableColors: ['blue', 'yellow'],
            goal: { type: 'secondary', color: 'green', count: 1 },
            tutorial: 'image',
            sticker: 'leaf'
        },
        3: {
            name: 'make_purple',
            availableColors: ['red', 'blue'],
            goal: { type: 'secondary', color: 'purple', count: 1 },
            tutorial: 'image',
            sticker: 'grape'
        },
        4: {
            name: 'orange_and_green',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'multiple', colors: ['orange', 'green'], count: 3 },
            tutorial: 'none',
            sticker: 'rainbow'
        },
        5: {
            name: 'green_and_purple',
            availableColors: ['red', 'blue', 'yellow'],
            goal: { type: 'multiple', colors: ['green', 'purple'], count: 3 },
            tutorial: 'none',
            sticker: 'chameleon'
        }
    }
};

describe('TutorialSystem', () => {
    let tutorialSystem;

    beforeEach(() => {
        resetDOM();
        global.CONFIG = mockConfig;
        tutorialSystem = new TutorialSystem(mockConfig);
    });

    afterEach(() => {
        if (tutorialSystem) {
            tutorialSystem.destroy();
        }
        delete global.CONFIG;
    });

    describe('Constructor', () => {
        test('should initialize with config', () => {
            expect(tutorialSystem).toBeDefined();
            expect(tutorialSystem.config).toBe(mockConfig);
        });

        test('should use imported CONFIG if not provided', () => {
            // In ESM mode, TutorialSystem uses imported CONFIG from config.js
            // when no config is passed to constructor
            const system = new TutorialSystem();
            expect(system.config).toBeDefined();
            system.destroy();
        });

        test('should accept explicit config parameter', () => {
            // When config is explicitly passed, use that config
            const customConfig = { ...mockConfig, CUSTOM: true };
            const system = new TutorialSystem(customConfig);
            expect(system.config).toBe(customConfig);
            expect(system.config.CUSTOM).toBe(true);
            system.destroy();
        });

        test('should initialize elements', () => {
            expect(tutorialSystem.elements.overlay).toBeDefined();
            expect(tutorialSystem.elements.hand).toBeDefined();
            expect(tutorialSystem.elements.formula).toBeDefined();
            expect(tutorialSystem.elements.hint).toBeDefined();
        });

        test('should start with tutorial not active', () => {
            expect(tutorialSystem.isRunning()).toBe(false);
        });

        test('should start with zero failure count', () => {
            expect(tutorialSystem.getFailureCount()).toBe(0);
        });
    });

    describe('setupLevel', () => {
        test('should set tutorial type for level 1 (handheld)', () => {
            tutorialSystem.setupLevel(1);
            expect(tutorialSystem.getTutorialType()).toBe('handheld');
        });

        test('should set tutorial type for level 2 (image)', () => {
            tutorialSystem.setupLevel(2);
            expect(tutorialSystem.getTutorialType()).toBe('image');
        });

        test('should set tutorial type for level 3 (image)', () => {
            tutorialSystem.setupLevel(3);
            expect(tutorialSystem.getTutorialType()).toBe('image');
        });

        test('should set tutorial type for level 4 (none)', () => {
            tutorialSystem.setupLevel(4);
            expect(tutorialSystem.getTutorialType()).toBe('none');
        });

        test('should set tutorial type for level 5 (none)', () => {
            tutorialSystem.setupLevel(5);
            expect(tutorialSystem.getTutorialType()).toBe('none');
        });

        test('should reset failure count when setting up level', () => {
            tutorialSystem.recordFailure();
            tutorialSystem.recordFailure();
            expect(tutorialSystem.getFailureCount()).toBe(2);

            tutorialSystem.setupLevel(2);
            expect(tutorialSystem.getFailureCount()).toBe(0);
        });

        test('should handle invalid level gracefully', () => {
            tutorialSystem.setupLevel(99);
            expect(tutorialSystem.getTutorialType()).toBe('none');
        });
    });

    describe('start', () => {
        test('should not start without container', () => {
            tutorialSystem.setupLevel(1);
            tutorialSystem.start(null);
            expect(tutorialSystem.isRunning()).toBe(false);
        });

        test('should not start for tutorial type none', () => {
            const container = document.createElement('div');
            tutorialSystem.setupLevel(4);
            tutorialSystem.start(container);
            expect(tutorialSystem.isRunning()).toBe(false);
        });

        test('should become active when started with valid container', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <div class="red-source" data-color="red"></div>
                <div class="yellow-source" data-color="yellow"></div>
                <div class="bowl"></div>
            `;
            tutorialSystem.setupLevel(1);
            tutorialSystem.start(container);
            expect(tutorialSystem.isRunning()).toBe(true);
        });
    });

    describe('stop', () => {
        test('should stop tutorial', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <div class="red-source" data-color="red"></div>
                <div class="yellow-source" data-color="yellow"></div>
                <div class="bowl"></div>
            `;
            tutorialSystem.setupLevel(1);
            tutorialSystem.start(container);
            expect(tutorialSystem.isRunning()).toBe(true);

            tutorialSystem.stop();
            expect(tutorialSystem.isRunning()).toBe(false);
        });

        test('should remove visible class from elements', () => {
            tutorialSystem.elements.overlay.classList.add('visible');
            tutorialSystem.elements.hand.classList.add('visible');
            tutorialSystem.elements.formula.classList.add('visible');

            tutorialSystem.stop();

            expect(tutorialSystem.elements.overlay.classList.contains('visible')).toBe(false);
            expect(tutorialSystem.elements.hand.classList.contains('visible')).toBe(false);
            expect(tutorialSystem.elements.formula.classList.contains('visible')).toBe(false);
        });
    });

    describe('recordFailure', () => {
        test('should increment failure count', () => {
            tutorialSystem.setupLevel(4); // tutorial: none
            expect(tutorialSystem.getFailureCount()).toBe(0);

            tutorialSystem.recordFailure();
            expect(tutorialSystem.getFailureCount()).toBe(1);

            tutorialSystem.recordFailure();
            expect(tutorialSystem.getFailureCount()).toBe(2);
        });

        test('should not show hint for tutorial levels', () => {
            tutorialSystem.setupLevel(1); // tutorial: handheld
            tutorialSystem.recordFailure();
            tutorialSystem.recordFailure();

            // Hint should not be shown for levels with tutorials
            expect(tutorialSystem.elements.hint.classList.contains('visible')).toBe(false);
        });

        test('should show hint after 2 failures for non-tutorial levels', () => {
            tutorialSystem.setupLevel(4); // tutorial: none
            tutorialSystem.recordFailure();
            tutorialSystem.recordFailure();

            // Hint should be shown
            expect(tutorialSystem.elements.hint.classList.contains('visible')).toBe(true);
        });
    });

    describe('recordSuccess', () => {
        test('should reset failure count', () => {
            tutorialSystem.setupLevel(4);
            tutorialSystem.recordFailure();
            tutorialSystem.recordFailure();
            expect(tutorialSystem.getFailureCount()).toBe(2);

            tutorialSystem.recordSuccess();
            expect(tutorialSystem.getFailureCount()).toBe(0);
        });

        test('should hide hint when success is recorded', () => {
            tutorialSystem.setupLevel(4);
            tutorialSystem.recordFailure();
            tutorialSystem.recordFailure();
            expect(tutorialSystem.elements.hint.classList.contains('visible')).toBe(true);

            tutorialSystem.recordSuccess();
            expect(tutorialSystem.elements.hint.classList.contains('visible')).toBe(false);
        });
    });

    describe('buildFormula', () => {
        test('should build formula for orange', () => {
            const formula = tutorialSystem.buildFormula('orange');
            expect(formula).toContain('🔴'); // red
            expect(formula).toContain('🟡'); // yellow
            expect(formula).toContain('🟠'); // orange
            expect(formula).toContain('+');
            expect(formula).toContain('=');
        });

        test('should build formula for green', () => {
            const formula = tutorialSystem.buildFormula('green');
            expect(formula).toContain('🟡'); // yellow
            expect(formula).toContain('🔵'); // blue
            expect(formula).toContain('🟢'); // green
        });

        test('should build formula for purple', () => {
            const formula = tutorialSystem.buildFormula('purple');
            expect(formula).toContain('🔴'); // red
            expect(formula).toContain('🔵'); // blue
            expect(formula).toContain('🟣'); // purple
        });

        test('should return empty string for unknown color', () => {
            const formula = tutorialSystem.buildFormula('unknown');
            expect(formula).toBe('');
        });
    });

    describe('destroy', () => {
        test('should clean up resources', () => {
            const container = document.createElement('div');
            container.innerHTML = `
                <div class="red-source"></div>
                <div class="yellow-source"></div>
                <div class="bowl"></div>
            `;
            tutorialSystem.setupLevel(1);
            tutorialSystem.start(container);

            tutorialSystem.destroy();
            tutorialSystem = null; // Prevent afterEach from calling destroy again

            // Create a new instance to verify destroy worked
            const newSystem = new TutorialSystem(mockConfig);
            expect(newSystem).toBeDefined();
            newSystem.destroy();
        });

        test('should stop tutorial before destroying', () => {
            const system = new TutorialSystem(mockConfig);
            system.isActive = true;
            system.destroy();
            // Should not throw error
        });

        test('should remove overlay from DOM', () => {
            const system = new TutorialSystem(mockConfig);
            const container = document.createElement('div');
            document.body.appendChild(container);
            container.appendChild(system.elements.overlay);

            expect(container.contains(system.elements.overlay)).toBe(true);

            system.destroy();

            expect(container.querySelector('.tutorial-overlay')).toBeNull();
        });
    });
});

describe('TutorialSystem Image Mode', () => {
    let tutorialSystem;

    beforeEach(() => {
        resetDOM();
        global.CONFIG = mockConfig;
        tutorialSystem = new TutorialSystem(mockConfig);
    });

    afterEach(() => {
        if (tutorialSystem) {
            tutorialSystem.destroy();
        }
        delete global.CONFIG;
    });

    test('should show formula for image tutorial', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <div class="blue-source" data-color="blue"></div>
            <div class="yellow-source" data-color="yellow"></div>
            <div class="bowl"></div>
        `;

        tutorialSystem.setupLevel(2); // green, image tutorial
        tutorialSystem.start(container);

        // Formula should be visible
        expect(tutorialSystem.elements.formula.classList.contains('visible')).toBe(true);
        expect(tutorialSystem.elements.hand.classList.contains('visible')).toBe(false);
    });
});

describe('TutorialSystem Edge Cases', () => {
    let tutorialSystem;

    beforeEach(() => {
        resetDOM();
        global.CONFIG = mockConfig;
        tutorialSystem = new TutorialSystem(mockConfig);
    });

    afterEach(() => {
        if (tutorialSystem) {
            tutorialSystem.destroy();
        }
        delete global.CONFIG;
    });

    test('should handle rapid setup/destroy cycles', () => {
        for (let i = 0; i < 5; i++) {
            tutorialSystem.setupLevel(1);
            tutorialSystem.stop();
        }
        // Should not throw
        expect(tutorialSystem.isRunning()).toBe(false);
    });

    test('should handle multiple record failures', () => {
        tutorialSystem.setupLevel(4);
        for (let i = 0; i < 10; i++) {
            tutorialSystem.recordFailure();
        }
        expect(tutorialSystem.getFailureCount()).toBe(10);
    });

    test('should handle alternating success and failure', () => {
        tutorialSystem.setupLevel(4);

        tutorialSystem.recordFailure();
        expect(tutorialSystem.getFailureCount()).toBe(1);

        tutorialSystem.recordSuccess();
        expect(tutorialSystem.getFailureCount()).toBe(0);

        tutorialSystem.recordFailure();
        tutorialSystem.recordFailure();
        expect(tutorialSystem.getFailureCount()).toBe(2);
    });
});
