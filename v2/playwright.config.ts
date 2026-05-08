import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e config.
 *
 * Auto-starts the web dev server. The api dev server is expected to
 * run separately (so a single Playwright run doesn't double-spawn it
 * across workers); CI launches both before invoking this.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env['PLAYWRIGHT_BASE_URL']
    ? undefined
    : {
        command: 'pnpm --filter @v2/web dev',
        port: 5173,
        timeout: 60_000,
        reuseExistingServer: !process.env['CI'],
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
