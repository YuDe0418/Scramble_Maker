import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    channel: process.env.CUBEX_E2E_CHANNEL || 'chrome',
    viewport: { width: 1440, height: 900 },
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  webServer: { command: 'npm run dev -- --strictPort', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
});
