import { defineConfig, devices } from '@playwright/test';

const localWebServer = process.env.E2E_BASE_URL
  ? {}
  : {
      webServer: {
        command: 'npm run build && npm run preview -- --port 4329 --host 127.0.0.1',
        url: 'http://127.0.0.1:4329',
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          PUBLIC_SUPABASE_URL: 'http://127.0.0.1:4329/mock-supabase',
          PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_local_browser_test'
        }
      }
    };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4329',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } }
    },
    {
      name: 'mobile-390',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true
      }
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } }
    },
    {
      name: 'desktop-1024',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 800 } }
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } }
    }
  ],
  ...localWebServer
});
