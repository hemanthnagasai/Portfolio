import { test, expect } from "@playwright/test";

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

test("query console boots sqlite (wasm under real CSP) and runs SQL", async ({ page }) => {
  await page.goto("/query");
  await expect(page).toHaveTitle(/Query My Life/);
  // The Run button enables once the wasm database has initialized — this
  // exercises WebAssembly under the backend's actual CSP headers.
  const run = page.getByTestId("query-run");
  await expect(run).toBeEnabled({ timeout: 20_000 });
  await page.getByTestId("query-input").fill("SELECT skill FROM skills LIMIT 3;");
  await run.click();
  const results = page.getByTestId("query-results");
  await expect(results.first()).toBeVisible();
  await expect(results.locator("tbody tr")).toHaveCount(3);
});

test("privacy page is reachable from the gateway", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("gateway-privacy-link").click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByTestId("privacy-page")).toBeVisible();
  // The policy must state the no-cookie fact it promises.
  await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();
  await expect(page.getByText("No cookies", { exact: false }).first()).toBeVisible();
});

test("how-i-built-this and now pages render", async ({ page }) => {
  await page.goto("/how-i-built-this");
  await expect(page).toHaveTitle(/How I Built This/);
  await expect(page.getByTestId("how-page")).toBeVisible();

  await page.goto("/now");
  await expect(page).toHaveTitle(/Now —/);
  await expect(page.getByTestId("now-item-0")).toBeVisible();
});
