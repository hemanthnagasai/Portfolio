import { defineConfig, devices } from "@playwright/test";

// Smoke E2E against the production shape: the FastAPI backend serves the
// built frontend (dist) and the API from one origin, exactly like the
// deployed container. No Gemini key needed — the tests never trigger
// generation, only that the app renders and navigates.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "line",
  use: {
    baseURL: "http://localhost:8000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "python -m uvicorn app.main:app --app-dir backend --port 8000",
    url: "http://localhost:8000/api/health",
    cwd: "..",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
