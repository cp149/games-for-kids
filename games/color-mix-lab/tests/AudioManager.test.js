/**
 * AudioManager Unit Tests
 * Tests for SFX management using Web Audio API
 */

// Mock CONFIG
const mockConfig = {
    AUDIO: {
        VOLUME_SFX: 0.5
    }
};

global.CONFIG = mockConfig;

// Mock Web Audio API
global.AudioContext = class AudioContext {
    constructor() {
        this.currentTime = 0;
        this.destination = {};
    }

    createOscillator() {
        return {
            frequency: { value: 0 },
            type: 'sine',
            connect: jest.fn(),
            disconnect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            onended: null
        };
    }

    createGain() {
        return {
            gain: { value: 0 },
            connect: jest.fn(),
            disconnect: jest.fn()
        };
    }

    close() {
        return Promise.resolve();
    }
};

// Import after mocks are set
const AudioManager = require('../js/managers/AudioManager');

describe('AudioManager', () => {
    let audioManager;

    beforeEach(() => {
        jest.clearAllMocks();
        audioManager = new AudioManager(mockConfig);
    });

    afterEach(() => {
        if (audioManager) {
            audioManager.destroy();
        }
    });

    describe('Constructor', () => {
        test('should initialize with config', () => {
            expect(audioManager).toBeDefined();
            expect(audioManager.config).toBe(mockConfig);
        });

        test('should use global CONFIG if not provided', () => {
            const manager = new AudioManager();
            expect(manager.config).toBe(mockConfig);
            manager.destroy();
        });

        test('should throw error if no config available', () => {
            const savedConfig = global.CONFIG;
            global.CONFIG = undefined;
            expect(() => new AudioManager()).toThrow('Config is required');
            global.CONFIG = savedConfig;
        });

        test('should initialize with default sfx volume from config', () => {
            expect(audioManager.getVolume()).toBe(0.5);
        });

        test('should initialize with sfx enabled', () => {
            expect(audioManager.isSfxEnabled()).toBe(true);
        });
    });

    describe('initAudioContext', () => {
        test('should create audio context', () => {
            audioManager.initAudioContext();
            expect(audioManager.audioContext).toBeDefined();
        });

        test('should not create duplicate audio context', () => {
            audioManager.initAudioContext();
            const firstContext = audioManager.audioContext;
            audioManager.initAudioContext();
            expect(audioManager.audioContext).toBe(firstContext);
        });
    });

    describe('load', () => {
        test('should initialize audio context', async () => {
            await audioManager.load();
            expect(audioManager.audioContext).toBeDefined();
        });

        test('should return a promise', () => {
            const result = audioManager.load();
            expect(result).toBeInstanceOf(Promise);
        });
    });

    describe('play', () => {
        beforeEach(async () => {
            await audioManager.load();
        });

        test('should play valid sound effect', () => {
            const spy = jest.spyOn(audioManager, 'playTone');
            audioManager.play('mix_success');
            expect(spy).toHaveBeenCalled();
        });

        test('should not play invalid sound effect', () => {
            const spy = jest.spyOn(audioManager, 'playTone');
            audioManager.play('invalid_sound');
            expect(spy).not.toHaveBeenCalled();
        });

        test('should not play when sfx disabled', () => {
            const spy = jest.spyOn(audioManager, 'playTone');
            audioManager.setSfxEnabled(false);
            audioManager.play('mix_success');
            expect(spy).not.toHaveBeenCalled();
        });

        test('should use default volume', () => {
            const spy = jest.spyOn(audioManager, 'playTone');
            audioManager.play('mix_success');
            expect(spy).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(String),
                0.5 // Default SFX volume
            );
        });

        test('should use volume override', () => {
            const spy = jest.spyOn(audioManager, 'playTone');
            audioManager.play('mix_success', 0.8);
            expect(spy).toHaveBeenCalledWith(
                expect.any(Number),
                expect.any(Number),
                expect.any(String),
                0.8
            );
        });

        test('should support all predefined sound effects', () => {
            const sfxNames = ['mix_success', 'mix_mud', 'level_complete', 'sticker_earned', 'button_click'];
            const spy = jest.spyOn(audioManager, 'playTone');

            sfxNames.forEach(name => {
                audioManager.play(name);
            });

            expect(spy).toHaveBeenCalledTimes(sfxNames.length);
        });
    });

    describe('playTone', () => {
        beforeEach(async () => {
            await audioManager.load();
        });

        test('should create oscillator with correct frequency', () => {
            const oscillator = audioManager.audioContext.createOscillator();
            const createOscSpy = jest.spyOn(audioManager.audioContext, 'createOscillator').mockReturnValue(oscillator);

            audioManager.playTone(440, 0.2, 'sine', 0.5);

            expect(createOscSpy).toHaveBeenCalled();
            expect(oscillator.frequency.value).toBe(440);
        });

        test('should create gain node with correct volume', () => {
            const gainNode = audioManager.audioContext.createGain();
            const createGainSpy = jest.spyOn(audioManager.audioContext, 'createGain').mockReturnValue(gainNode);

            audioManager.playTone(440, 0.2, 'sine', 0.7);

            expect(createGainSpy).toHaveBeenCalled();
            expect(gainNode.gain.value).toBe(0.7);
        });

        test('should start and stop oscillator', () => {
            const oscillator = audioManager.audioContext.createOscillator();
            jest.spyOn(audioManager.audioContext, 'createOscillator').mockReturnValue(oscillator);

            audioManager.playTone(440, 0.2, 'sine', 0.5);

            expect(oscillator.start).toHaveBeenCalled();
            expect(oscillator.stop).toHaveBeenCalled();
        });

        test('should handle errors gracefully', () => {
            jest.spyOn(audioManager.audioContext, 'createOscillator').mockImplementation(() => {
                throw new Error('Audio error');
            });

            expect(() => audioManager.playTone(440, 0.2, 'sine', 0.5)).not.toThrow();
        });

        test('should do nothing if no audio context', () => {
            audioManager.audioContext = null;
            expect(() => audioManager.playTone(440, 0.2, 'sine', 0.5)).not.toThrow();
        });
    });

    describe('setVolume', () => {
        test('should set sfx volume', () => {
            audioManager.setVolume(0.8);
            expect(audioManager.getVolume()).toBe(0.8);
        });

        test('should clamp volume to 0-1 range', () => {
            audioManager.setVolume(-0.5);
            expect(audioManager.getVolume()).toBe(0);

            audioManager.setVolume(1.5);
            expect(audioManager.getVolume()).toBe(1);
        });

        test('should handle edge values', () => {
            audioManager.setVolume(0);
            expect(audioManager.getVolume()).toBe(0);

            audioManager.setVolume(1);
            expect(audioManager.getVolume()).toBe(1);
        });
    });

    describe('getVolume', () => {
        test('should return current sfx volume', () => {
            audioManager.setVolume(0.7);
            expect(audioManager.getVolume()).toBe(0.7);
        });

        test('should return initial volume from config', () => {
            expect(audioManager.getVolume()).toBe(0.5);
        });
    });

    describe('setSfxEnabled', () => {
        test('should disable sfx', () => {
            audioManager.setSfxEnabled(false);
            expect(audioManager.isSfxEnabled()).toBe(false);
        });

        test('should enable sfx', () => {
            audioManager.setSfxEnabled(false);
            audioManager.setSfxEnabled(true);
            expect(audioManager.isSfxEnabled()).toBe(true);
        });
    });

    describe('isSfxEnabled', () => {
        test('should return true by default', () => {
            expect(audioManager.isSfxEnabled()).toBe(true);
        });

        test('should reflect disabled state', () => {
            audioManager.setSfxEnabled(false);
            expect(audioManager.isSfxEnabled()).toBe(false);
        });
    });

    describe('destroy', () => {
        test('should close audio context', async () => {
            await audioManager.load();
            const closeSpy = jest.spyOn(audioManager.audioContext, 'close');
            audioManager.destroy();
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should clear audio context reference', async () => {
            await audioManager.load();
            audioManager.destroy();
            expect(audioManager.audioContext).toBeNull();
        });

        test('should handle destroy without initialization', () => {
            expect(() => audioManager.destroy()).not.toThrow();
        });

        test('should handle audio context close errors gracefully', async () => {
            await audioManager.load();
            jest.spyOn(audioManager.audioContext, 'close').mockImplementation(() => {
                throw new Error('Close failed');
            });
            expect(() => audioManager.destroy()).not.toThrow();
        });
    });
});

describe('AudioManager Integration', () => {
    let audioManager;

    beforeEach(async () => {
        audioManager = new AudioManager(mockConfig);
        await audioManager.load();
    });

    afterEach(() => {
        audioManager.destroy();
    });

    test('should play sound after loading', () => {
        const spy = jest.spyOn(audioManager, 'playTone');
        audioManager.play('mix_success');
        expect(spy).toHaveBeenCalled();
    });

    test('should respect volume changes', () => {
        const spy = jest.spyOn(audioManager, 'playTone');
        audioManager.setVolume(0.3);
        audioManager.play('mix_success');
        expect(spy).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Number),
            expect.any(String),
            0.3
        );
    });

    test('should handle multiple sound effects in sequence', () => {
        const spy = jest.spyOn(audioManager, 'playTone');
        audioManager.play('mix_success');
        audioManager.play('mix_mud');
        audioManager.play('level_complete');
        expect(spy).toHaveBeenCalledTimes(3);
    });
});
