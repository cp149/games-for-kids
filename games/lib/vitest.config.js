import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom for browser API simulation
    environment: 'jsdom',

    // Enable globals (describe, test, expect) without imports
    globals: true,

    // Test file patterns
    include: ['tests/**/*.test.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'audio/**/*.js',
        'effects/**/*.js',
        'game/**/*.js',
        'i18n/**/*.js',
        'ui/**/*.js',
        'utils/**/*.js'
      ],
      exclude: [
        'tests/**',
        '**/*.test.js'
      ]
    }
  }
});
