/**
 * Playwright Configuration for Color Mix Lab E2E Tests
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
module.exports = {
  testDir: './tests/e2e',

  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports' }],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    baseURL: 'http://localhost:8000/games/color-mix-lab/index.html',

    // Screenshot settings
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',

    // Viewport
    viewport: { width: 1280, height: 720 },

    // Action timeout
    actionTimeout: 10000
  },

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium'
      }
    }
  ],

  // Web server configuration (optional - for local development)
  webServer: {
    command: 'python3 -m http.server 8000',
    port: 8000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    cwd: '../../..'
  }
};
