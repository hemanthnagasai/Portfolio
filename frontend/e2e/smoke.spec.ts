import { test, expect } from "@playwright/test";

// The cinematic intro shows once per session and covers the page; skip it so
// it never intercepts clicks or hides content under test.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("intro_seen", "1"));
});

test("gateway landing renders with its per-route title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/A Portfolio in Layers/);
  await expect(page.getByTestId("gateway-name-0")).toBeVisible();
});

test("world switcher navigates to the professional dimension", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("world-link-professional").click();
  await expect(page).toHaveURL(/\/professional$/);
  await expect(page).toHaveTitle(/Professional/);
});

test("recruiter view loads and the chat widget opens", async ({ page }) => {
  await page.goto("/recruiter");
  await expect(page).toHaveTitle(/Recruiter View/);
  await expect(page.getByTestId("recruiter-page")).toBeVisible();

  await page.getByTestId("chatbot-toggle-btn").click();
  const win = page.getByTestId("chatbot-window");
  await expect(win).toBeVisible();
  await expect(win.locator("input")).toBeVisible();
});

test("resume download endpoint returns a PDF", async ({ request }) => {
  const res = await request.get("/api/resume/download");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
});

test("admin console loads read-only with a token field", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByTestId("admin-page")).toBeVisible();
  await expect(page.getByTestId("admin-token-input")).toBeVisible();
});
