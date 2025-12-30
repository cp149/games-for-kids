/**
 * Vitest Setup File
 * Global mocks and configuration for tests
 */

import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] || null),
    setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = value;
    }),
    removeItem: vi.fn((key) => {
        delete localStorageMock.store[key];
    }),
    clear: vi.fn(() => {
        localStorageMock.store = {};
    })
};

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true
});

// Mock Web Audio API
globalThis.AudioContext = class AudioContext {
    constructor() {
        this.currentTime = 0;
        this.destination = {};
    }

    createOscillator() {
        return {
            frequency: { value: 0 },
            type: 'sine',
            connect: vi.fn(),
            disconnect: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            onended: null
        };
    }

    createGain() {
        return {
            gain: {
                value: 0,
                setValueAtTime: vi.fn(),
                linearRampToValueAtTime: vi.fn()
            },
            connect: vi.fn(),
            disconnect: vi.fn()
        };
    }

    close() {
        return Promise.resolve();
    }
};

// Mock Logger for tests
globalThis.Logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
};

// Reset mocks before each test
beforeEach(() => {
    localStorageMock.store = {};
    vi.clearAllMocks();
});
