import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:3000';
const IS_CI = !!process.env.CI;

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  testDir: './tests',
  fullyParallel: !IS_CI,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      command: 'cd .. && npm run dev:backend',
      url: `${BACKEND_URL}/api/admin/me`,
      timeout: 120_000,
      reuseExistingServer: !IS_CI,
      env: {
        DATABASE_URL:
          process.env.DATABASE_URL ||
          'postgresql://postgres:postgres@localhost:5432/buro710',
        JWT_SECRET:
          process.env.JWT_SECRET ||
          'test-secret-that-is-at-least-32-chars-long',
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@test.com',
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
      },
    },
    {
      command: 'cd .. && npm run dev:frontend',
      url: BASE_URL,
      timeout: 120_000,
      reuseExistingServer: !IS_CI,
    },
  ],
});
