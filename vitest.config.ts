import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Web-Tests laufen im Demo-Modus und lesen /data wie der Vite-Build.
  define: { __DEMO__: 'true' },
  resolve: { alias: { '@data': resolve(import.meta.dirname, 'data') } },
  test: {
    include: ['packages/*/test/**/*.test.ts', 'apps/api/test/**/*.test.ts', 'apps/web/test/**/*.test.ts', 'scripts/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'apps/web/e2e/**', '**/fixtures/**'],
    testTimeout: 30000,
  },
});
