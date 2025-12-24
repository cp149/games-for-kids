/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
global.window = {
    Logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
};

global.CONFIG = {
    PLAYER: {
        CLICK_RADIUS: 30
    }
};

global.I18N = {
    cycleLanguage: vi.fn()
};

global.MathUtils = {
    distance: (p1, p2) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
};

// Import InputManager
const InputManager = (await import('../js/managers/InputManager.js')).default;

describe('InputManager', () => {
    let manager;
    let mockGame;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <button id="start-game-btn"></button>
            <button id="home-btn"></button>
            <button id="restart-btn"></button>
            <button id="undo-btn"></button>
            <button id="music-btn"></button>
            <button id="lang-btn"></button>
            <button id="retry-btn"></button>
            <button id="next-level-btn"></button>
            <canvas id="player-canvas"></canvas>
        `;

        mockGame = {
            state: {
                state: 'racing',
                grid: {
                    dots: [
                        { gridX: 0, gridY: 0, type: 'start', index: 0 },
                        { gridX: 1, gridY: 0, type: 'normal', index: 1 }
                    ]
                },
                incrementUndo: vi.fn()
            },
            playerCanvas: document.getElementById('player-canvas'),
            audioManager: {
                playSound: vi.fn(),
                toggleMusic: vi.fn()
            },
            uiManager: {
                showCanvasError: vi.fn()
            },
            pathManager: {
                addMove: vi.fn().mockReturnValue(true),
                isPathComplete: vi.fn().mockReturnValue(false),
                undo: vi.fn().mockReturnValue(true)
            },
            renderManager: {
                getDotScreenPos: vi.fn().mockReturnValue({ x: 100, y: 100 })
            },
            setNeedsRender: vi.fn(),
            playerFinish: vi.fn(),
            startGame: vi.fn(),
            goHome: vi.fn(),
            restartLevel: vi.fn(),
            retryLevel: vi.fn(),
            nextLevel: vi.fn()
        };

        manager = new InputManager(mockGame);
    });

    describe('Constructor & Setup', () => {
        it('should initialize with empty event listeners map', () => {
            expect(manager.eventListeners).toBeDefined();
            expect(manager.eventListeners.size).toBe(0);
        });

        it('should store game reference', () => {
            expect(manager.game).toBe(mockGame);
        });

        it('should setup all listeners', () => {
            manager.setupListeners();
            expect(manager.eventListeners.size).toBeGreaterThan(0);
        });
    });

    describe('Event Listener Management', () => {
        it('should add listener for string selector', () => {
            manager.addListener('#start-game-btn', 'click', () => {});
            expect(manager.eventListeners.size).toBe(1);
        });

        it('should add listener for element reference', () => {
            const btn = document.getElementById('home-btn');
            manager.addListener(btn, 'click', () => {});
            expect(manager.eventListeners.size).toBe(1);
        });

        it('should track multiple listeners on same element', () => {
            manager.addListener('#start-game-btn', 'click', () => {});
            manager.addListener('#start-game-btn', 'mouseenter', () => {});

            const btn = document.getElementById('start-game-btn');
            const listeners = manager.eventListeners.get(btn);
            expect(listeners.length).toBe(2);
        });

        it('should handle invalid selectors gracefully', () => {
            expect(() => {
                manager.addListener('#nonexistent', 'click', () => {});
            }).not.toThrow();
        });
    });

    describe('Button Click Handlers', () => {
        beforeEach(() => {
            manager.setupListeners();
        });

        it('should call game.startGame on start button click', () => {
            document.getElementById('start-game-btn').click();
            expect(mockGame.startGame).toHaveBeenCalled();
        });

        it('should call game.goHome on home button click', () => {
            document.getElementById('home-btn').click();
            expect(mockGame.goHome).toHaveBeenCalled();
        });

        it('should call game.restartLevel on restart button click', () => {
            document.getElementById('restart-btn').click();
            expect(mockGame.restartLevel).toHaveBeenCalled();
        });

        it('should call handleUndo on undo button click', () => {
            document.getElementById('undo-btn').click();
            expect(mockGame.pathManager.undo).toHaveBeenCalled();
        });

        it('should toggle music on music button click', () => {
            document.getElementById('music-btn').click();
            expect(mockGame.audioManager.toggleMusic).toHaveBeenCalled();
        });

        it('should cycle language on lang button click', () => {
            document.getElementById('lang-btn').click();
            expect(I18N.cycleLanguage).toHaveBeenCalled();
        });
    });

    describe('Canvas Click Detection', () => {
        it('should find dot within click radius', () => {
            const dot = manager.getClickedDot(100, 100);
            expect(dot).toBeDefined();
            expect(dot.index).toBe(0);
        });

        it('should return null if no dot nearby', () => {
            const dot = manager.getClickedDot(500, 500);
            expect(dot).toBeNull();
        });

        it('should use CONFIG.PLAYER.CLICK_RADIUS', () => {
            mockGame.renderManager.getDotScreenPos.mockReturnValue({ x: 100, y: 100 });

            // Within radius
            let dot = manager.getClickedDot(120, 100);
            expect(dot).toBeDefined();

            // Outside radius
            dot = manager.getClickedDot(200, 100);
            expect(dot).toBeNull();
        });
    });

    describe('Player Click Handling', () => {
        it('should ignore clicks when not racing', () => {
            mockGame.state.state = 'menu';
            const event = new MouseEvent('click', { clientX: 100, clientY: 100 });
            manager.handlePlayerClick(event);

            expect(mockGame.pathManager.addMove).not.toHaveBeenCalled();
        });

        it('should process valid move', () => {
            mockGame.playerCanvas.getBoundingClientRect = () => ({
                left: 0,
                top: 0
            });

            const event = new MouseEvent('click', { clientX: 100, clientY: 100 });
            manager.handlePlayerClick(event);

            expect(mockGame.pathManager.addMove).toHaveBeenCalled();
            expect(mockGame.audioManager.playSound).toHaveBeenCalledWith('click_valid');
            expect(mockGame.setNeedsRender).toHaveBeenCalled();
        });

        it('should handle invalid move', () => {
            mockGame.pathManager.addMove.mockReturnValue(false);
            mockGame.playerCanvas.getBoundingClientRect = () => ({
                left: 0,
                top: 0
            });

            const event = new MouseEvent('click', { clientX: 100, clientY: 100 });
            manager.handlePlayerClick(event);

            expect(mockGame.audioManager.playSound).toHaveBeenCalledWith('click_invalid');
            expect(mockGame.uiManager.showCanvasError).toHaveBeenCalledWith(mockGame.playerCanvas);
        });

        it('should call playerFinish when path complete', () => {
            mockGame.pathManager.isPathComplete.mockReturnValue(true);
            mockGame.playerCanvas.getBoundingClientRect = () => ({
                left: 0,
                top: 0
            });

            const event = new MouseEvent('click', { clientX: 100, clientY: 100 });
            manager.handlePlayerClick(event);

            expect(mockGame.playerFinish).toHaveBeenCalled();
        });

        it('should handle click on empty area', () => {
            mockGame.playerCanvas.getBoundingClientRect = () => ({
                left: 0,
                top: 0
            });

            const event = new MouseEvent('click', { clientX: 500, clientY: 500 });
            manager.handlePlayerClick(event);

            expect(mockGame.pathManager.addMove).not.toHaveBeenCalled();
        });
    });

    describe('Undo Handling', () => {
        it('should increment undo count on successful undo', () => {
            manager.handleUndo();

            expect(mockGame.pathManager.undo).toHaveBeenCalled();
            expect(mockGame.state.incrementUndo).toHaveBeenCalled();
            expect(mockGame.audioManager.playSound).toHaveBeenCalledWith('undo');
            expect(mockGame.setNeedsRender).toHaveBeenCalled();
        });

        it('should not increment undo count if undo fails', () => {
            mockGame.pathManager.undo.mockReturnValue(false);

            manager.handleUndo();

            expect(mockGame.state.incrementUndo).not.toHaveBeenCalled();
            expect(mockGame.setNeedsRender).not.toHaveBeenCalled();
        });

        it('should ignore undo when not racing', () => {
            mockGame.state.state = 'menu';

            manager.handleUndo();

            expect(mockGame.pathManager.undo).not.toHaveBeenCalled();
        });
    });

    describe('Keyboard Handling', () => {
        it('should go home on Escape', () => {
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            manager.handleKeyboard(event);

            expect(mockGame.goHome).toHaveBeenCalled();
        });

        it('should restart on R key', () => {
            const event = new KeyboardEvent('keydown', { key: 'r' });
            manager.handleKeyboard(event);

            expect(mockGame.restartLevel).toHaveBeenCalled();
        });

        it('should restart on uppercase R', () => {
            const event = new KeyboardEvent('keydown', { key: 'R' });
            manager.handleKeyboard(event);

            expect(mockGame.restartLevel).toHaveBeenCalled();
        });

        it('should undo on U key', () => {
            const event = new KeyboardEvent('keydown', { key: 'u' });
            manager.handleKeyboard(event);

            expect(mockGame.pathManager.undo).toHaveBeenCalled();
        });

        it('should undo on uppercase U', () => {
            const event = new KeyboardEvent('keydown', { key: 'U' });
            manager.handleKeyboard(event);

            expect(mockGame.pathManager.undo).toHaveBeenCalled();
        });

        it('should ignore other keys', () => {
            const event = new KeyboardEvent('keydown', { key: 'a' });
            manager.handleKeyboard(event);

            expect(mockGame.goHome).not.toHaveBeenCalled();
            expect(mockGame.restartLevel).not.toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        it('should remove all event listeners on destroy', () => {
            manager.setupListeners();
            const initialSize = manager.eventListeners.size;
            expect(initialSize).toBeGreaterThan(0);

            manager.destroy();

            expect(manager.eventListeners.size).toBe(0);
        });

        it('should handle destroy when no listeners added', () => {
            expect(() => {
                manager.destroy();
            }).not.toThrow();
        });
    });
});
