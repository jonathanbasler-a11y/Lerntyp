import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE = '/Lerntyp/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'off' },
  projects: [
    // Lokal ist nur Chromium vorinstalliert: iPad-Viewport, Chromium-Engine.
    { name: 'chromium-ipad', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
    ...(process.env.CI ? [{ name: 'webkit-ipad', use: { ...devices['iPad (gen 7)'] } }] : []),
  ],
  webServer: {
    command: `npm run build -w @lerntyp/web && npm run preview -w @lerntyp/web -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { BASE_PATH: BASE },
  },
});
