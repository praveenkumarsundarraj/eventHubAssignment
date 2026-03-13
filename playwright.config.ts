import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/',
  reporter: 'html',
   use: {
    baseURL: 'https://eventhub.rahulshettyacademy.com/login',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    headless: true,
    trace: 'retain-on-failure',
  },
});
