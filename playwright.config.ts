import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4321);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('E2E_PORT must be an integer between 1024 and 65535.');
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port} --ignore-lock`,
    env: { ASTRO_PREVIEW_BACKGROUND: '0' },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
