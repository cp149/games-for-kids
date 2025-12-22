/**
 * RenderManager Tests - Rendering Crash Prevention
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { RenderManager } from '../../js/managers/RenderManager.js';

describe('RenderManager - Crash Prevention', () => {
    let renderManager;
    let mockCanvas;
    let mockCtx;
    let mockCamera;
    let mockLogger;

    beforeEach(() => {
        mockCanvas = {
            width: 1920,
            height: 1080,
            getContext: vi.fn()
        };

        mockCtx = {
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            shadowBlur: 0,
            shadowColor: '',
            font: '',
            textAlign: '',
            textBaseline: '',
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            fillText: vi.fn(),
            strokeText: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            stroke: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            setLineDash: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            translate: vi.fn(),
            rotate: vi.fn(),
            scale: vi.fn(),
            createRadialGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            createLinearGradient: vi.fn(() => ({
                addColorStop: vi.fn()
            })),
            drawImage: vi.fn()
        };

        mockCanvas.getContext.mockReturnValue(mockCtx);

        mockCamera = {
            getX: vi.fn(() => 0),
            getY: vi.fn(() => 0)
        };

        mockLogger = {
            log: vi.fn(),
            info: vi.fn(),
            warn: vi.fn()
        };

        renderManager = new RenderManager(mockCanvas, mockCamera, mockLogger);
    });

    describe('Invalid Camera Handling', () => {
        test('should not crash with null camera', () => {
            renderManager.cameraManager = null;

            expect(() => renderManager.renderStars()).not.toThrow();
        });

        test('should not crash when camera returns NaN', () => {
            mockCamera.getX.mockReturnValue(NaN);
            mockCamera.getY.mockReturnValue(NaN);

            expect(() => renderManager.renderStars()).not.toThrow();
        });

        test('should not crash when camera returns Infinity', () => {
            mockCamera.getX.mockReturnValue(Infinity);
            mockCamera.getY.mockReturnValue(-Infinity);

            expect(() => renderManager.renderStars()).not.toThrow();
        });

        test('should not crash when camera missing methods', () => {
            renderManager.cameraManager = {};

            expect(() => renderManager.renderStars()).not.toThrow();
        });
    });

    describe('Boundary Caching', () => {
        test('should cache boundary on first call', () => {
            renderManager.cacheBoundary();

            expect(renderManager.isBoundaryCached).toBe(true);
            expect(renderManager.boundaryCacheCanvas).toBeDefined();
        });

        test('should not recreate cache on subsequent calls', () => {
            renderManager.cacheBoundary();
            const firstCache = renderManager.boundaryCacheCanvas;

            renderManager.cacheBoundary();

            expect(renderManager.boundaryCacheCanvas).toBe(firstCache);
        });

        test('should use cached canvas for rendering', () => {
            renderManager.cacheBoundary();
            renderManager.renderBoundary();

            expect(mockCtx.drawImage).toHaveBeenCalled();
        });

        test('should not crash if cache creation fails', () => {
            const originalCreateElement = document.createElement;
            document.createElement = vi.fn(() => null);

            expect(() => renderManager.cacheBoundary()).not.toThrow();

            document.createElement = originalCreateElement;
        });
    });

    describe('Viewport Culling', () => {
        test('should skip stars outside viewport', () => {
            mockCamera.getX.mockReturnValue(10000); // Move camera far away
            mockCamera.getY.mockReturnValue(10000);

            const arcCallsBefore = mockCtx.arc.mock.calls.length;
            renderManager.renderStars();
            const arcCallsAfter = mockCtx.arc.mock.calls.length;

            // Should render 0 or very few stars (all outside viewport)
            expect(arcCallsAfter - arcCallsBefore).toBeLessThan(10);
        });

        test('should render visible stars', () => {
            mockCamera.getX.mockReturnValue(0);
            mockCamera.getY.mockReturnValue(0);

            const arcCallsBefore = mockCtx.arc.mock.calls.length;
            renderManager.renderStars();
            const arcCallsAfter = mockCtx.arc.mock.calls.length;

            // Should render some stars
            expect(arcCallsAfter).toBeGreaterThan(arcCallsBefore);
        });
    });

    describe('Star Animation', () => {
        test('should update star twinkle phases', () => {
            const initialPhase = renderManager.stars[0]?.twinklePhase || 0;

            renderManager.updateStars(0.1);

            const newPhase = renderManager.stars[0]?.twinklePhase || 0;
            expect(newPhase).not.toBe(initialPhase);
        });

        test('should not crash with negative deltaTime', () => {
            expect(() => renderManager.updateStars(-1)).not.toThrow();
        });

        test('should not crash with huge deltaTime', () => {
            expect(() => renderManager.updateStars(999999)).not.toThrow();
        });
    });

    describe('Main Render Method', () => {
        let mockState, mockPlayer, mockBuffManager, mockManagers;

        beforeEach(() => {
            mockState = 'playing';
            mockPlayer = {
                isAlive: true,
                getHead: () => ({ x: 500, y: 500 })
            };
            mockBuffManager = {
                hasMagnet: vi.fn(() => false),
                getMagnetRange: vi.fn(() => 0),
                hasCombo: vi.fn(() => false),
                getComboCount: vi.fn(() => 0)
            };
            mockManagers = {
                particleManager: { render: vi.fn() },
                snakeManager: { render: vi.fn() },
                foodManager: { render: vi.fn() },
                leaderboardManager: { render: vi.fn() },
                killFeedManager: { render: vi.fn() }
            };
        });

        test('should not crash with null player', () => {
            expect(() => renderManager.render(
                mockState,
                null,
                mockBuffManager,
                mockManagers.particleManager,
                mockManagers.snakeManager,
                mockManagers.foodManager,
                mockManagers.leaderboardManager,
                mockManagers.killFeedManager
            )).not.toThrow();
        });

        test('should not crash with null managers', () => {
            expect(() => renderManager.render(
                mockState,
                mockPlayer,
                mockBuffManager,
                null, null, null, null, null
            )).not.toThrow();
        });

        test('should not crash when manager missing render method', () => {
            mockManagers.particleManager = {};

            expect(() => renderManager.render(
                mockState,
                mockPlayer,
                mockBuffManager,
                mockManagers.particleManager,
                mockManagers.snakeManager,
                mockManagers.foodManager,
                mockManagers.leaderboardManager,
                mockManagers.killFeedManager
            )).not.toThrow();
        });

        test('should render pause overlay when paused', () => {
            renderManager.render(
                'paused',
                mockPlayer,
                mockBuffManager,
                mockManagers.particleManager,
                mockManagers.snakeManager,
                mockManagers.foodManager,
                mockManagers.leaderboardManager,
                mockManagers.killFeedManager
            );

            // Should call fillText for "PAUSED" message
            expect(mockCtx.fillText).toHaveBeenCalled();
        });

        test('should render magnet range when active', () => {
            mockBuffManager.hasMagnet.mockReturnValue(true);
            mockBuffManager.getMagnetRange.mockReturnValue(200);

            renderManager.render(
                mockState,
                mockPlayer,
                mockBuffManager,
                mockManagers.particleManager,
                mockManagers.snakeManager,
                mockManagers.foodManager,
                mockManagers.leaderboardManager,
                mockManagers.killFeedManager
            );

            // Should draw arc for magnet range
            expect(mockCtx.arc).toHaveBeenCalled();
        });

        test('should render combo when active', () => {
            mockBuffManager.hasCombo.mockReturnValue(true);
            mockBuffManager.getComboCount.mockReturnValue(5);

            renderManager.render(
                mockState,
                mockPlayer,
                mockBuffManager,
                mockManagers.particleManager,
                mockManagers.snakeManager,
                mockManagers.foodManager,
                mockManagers.leaderboardManager,
                mockManagers.killFeedManager
            );

            // Should call fillText for combo count
            expect(mockCtx.fillText).toHaveBeenCalled();
        });
    });

    describe('Cleanup', () => {
        test('should release cached canvas', () => {
            renderManager.cacheBoundary();

            renderManager.destroy();

            expect(renderManager.boundaryCacheCanvas).toBeNull();
        });

        test('should not crash if already destroyed', () => {
            renderManager.destroy();

            expect(() => renderManager.destroy()).not.toThrow();
        });
    });
});
