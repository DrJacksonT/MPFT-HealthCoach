import { mkdir, readdir, readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import * as OTPAuth from "otpauth";

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? "")), JSON.stringify(results.violations, null, 2)).toEqual([]);
}

async function loginParticipant(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Account alias").fill("rowan-fictional-01");
  await page.getByLabel("Password").fill("Fictional-only-2026!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/participant$/);
}

async function mailLink(subject: string) {
  let link = "";
  await expect.poll(async () => {
    const files = await readdir(".data/e2e-mail").catch(() => []);
    for (const file of files) {
      const mail = JSON.parse(await readFile(`.data/e2e-mail/${file}`, "utf8")) as { subject: string; text: string };
      if (mail.subject !== subject) continue;
      link = mail.text.match(/https?:\/\/[^\s]+/)?.[0] ?? "";
    }
    return link;
  }).not.toBe("");
  return link;
}

test.describe.serial("critical synthetic journeys", () => {
  test.beforeAll(async () => { await mkdir("artifacts/qa", { recursive: true }); });

  test("invited email registration, verification and one-time reset work", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Invitation code").fill("SMOKE-FICTIONAL-2026");
    await page.getByLabel("Email", { exact: true }).check();
    await page.getByLabel("Email address").fill("e2e.participant@example.invalid");
    await page.getByLabel("Display name").fill("Fictional E2E Participant");
    await page.locator('input[name="password"]').fill("Fictional-e2e-2026!");
    await page.locator('input[name="confirmPassword"]').fill("Fictional-e2e-2026!");
    await page.getByRole("button", { name: "Create fictional test account" }).click();
    await expect(page.getByText("Account created")).toBeVisible();
    const verifyLink = await mailLink("Verify your MPFT research test account");
    await page.goto(verifyLink);
    await page.getByRole("button", { name: "Verify account" }).click();
    await expect(page.getByText("Your account is verified.")).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).check();
    await page.getByLabel("Email address").fill("e2e.participant@example.invalid");
    await page.getByLabel("Password").fill("Fictional-e2e-2026!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/participant$/);
    await page.goto("/forgot-password");
    await page.getByLabel("Account type").selectOption("email");
    await page.getByLabel("Email address or alias").fill("e2e.participant@example.invalid");
    await page.getByRole("button", { name: "Request reset" }).click();
    await expect(page.getByText(/If that account can be reset/i)).toBeVisible();
    const resetLink = await mailLink("Reset your MPFT research test password");
    await page.goto(resetLink);
    await page.getByLabel("New password").fill("Fictional-e2e-reset-2026!");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText(/Other sessions were signed out/i)).toBeVisible();
    await page.goto("/participant");
    await expect(page).toHaveURL(/\/login/);

    await page.goto(resetLink);
    await page.getByLabel("New password").fill("Another-fictional-password-2026!");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("public and participant journey works with AI fail-closed", async ({ page }) => {
    const health = await page.request.get("/api/health");
    expect(health.status()).toBe(200);
    expect(await health.json()).toEqual({ status: "ready" });
    expect(health.headers()["cache-control"]).toContain("no-store");

    await page.goto("/admin/evidence");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/admin/telemetry");
    await expect(page).toHaveURL(/\/login$/);

    const landingResponse = await page.goto("/");
    expect(landingResponse?.headers()["content-security-policy"]).toContain("nonce-");
    expect(landingResponse?.headers()["content-security-policy"]).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(landingResponse?.headers()["x-frame-options"]).toBe("DENY");
    expect(landingResponse?.headers()["x-request-id"]).toBeTruthy();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAccessible(page);
    await loginParticipant(page);
    await expect(page.getByText("Synthetic participant")).toBeVisible();
    await expectAccessible(page);
    await page.screenshot({ path: "artifacts/qa/participant-dashboard-desktop.png", fullPage: true });

    await page.getByRole("link", { name: /Continue/ }).click();
    await expect(page).toHaveURL(/\/participant\/onboarding$/);
    const required = page.locator(".check-list input[required]");
    for (let index = 0; index < await required.count(); index += 1) await required.nth(index).check();
    await page.locator('input[name="optionalAiText"]').check();
    await page.getByRole("button", { name: "Agree and save fictional baseline" }).click();
    await expect(page).toHaveURL(/\/participant\/plan$/);

    for (const selector of ['input[name="motivations"]', 'input[name="triggers"]', 'input[name="copingActions"]', 'input[name="supportChoices"]']) await page.locator(selector).first().check();
    await page.getByRole("button", { name: "Save my plan" }).click();
    await expect(page).toHaveURL(/\/participant\/check-in$/);
    await page.getByRole("button", { name: "Save today’s check-in" }).click();
    await expect(page).toHaveURL(/\/participant\/progress$/);
    await expect(page.getByText(/Missing days stay unknown/i)).toBeVisible();
    await expectAccessible(page);

    await page.goto("/participant/coach");
    await page.getByRole("button", { name: "Show structured steps" }).click();
    await expect(page.getByRole("heading", { name: "Get through the next few minutes" })).toBeVisible();
    await page.getByText("Optional AI reflection").click();
    await page.getByLabel(/What is happening/).fill("I want a brief reflection about this craving.");
    await page.getByRole("button", { name: "Try bounded reflection" }).click();
    await expect(page.getByText("Structured fallback used")).toBeVisible();
    await expect(page.getByText(/optional AI layer was not used/i)).toBeVisible();
    await expectAccessible(page);

    await page.goto("/participant/surveys/69000000-0000-4000-8000-000000000001");
    await page.getByLabel("How helpful did the programme feel this week?").selectOption("4");
    await page.getByLabel("How easy was it to use?").selectOption("5");
    await page.getByLabel("How burdensome did the questions feel?").selectOption("2");
    await page.getByRole("radio", { name: "No" }).check();
    await page.getByLabel(/Optional: add a short comment/).fill("Synthetic feedback for the E2E journey.");
    await page.getByRole("button", { name: "Complete survey" }).click();
    await expect(page.getByText(/response is complete/i)).toBeVisible();
    await expectAccessible(page);

    await page.goto("/participant/follow-ups/69000000-0000-4000-8000-000000000002");
    await page.getByLabel("Smoking status").selectOption("smoked_on_1_to_6_days");
    await page.getByLabel(/Cigarettes per day now/).fill("3");
    await page.getByRole("radio", { name: "Yes" }).check();
    await page.getByRole("checkbox", { name: "Stop-smoking service" }).check();
    await page.getByRole("button", { name: "Complete follow-up" }).click();
    await expect(page.getByText(/Follow-up complete/i)).toBeVisible();

    await page.goto("/participant/account");
    await page.getByLabel(/Allow my optional typed words/).uncheck();
    await page.getByRole("button", { name: "Save optional choices" }).click();
    await expect(page.getByText(/optional choices were saved/i)).toBeVisible();
    await page.getByRole("button", { name: /Request an accessible data copy/i }).click();
    await expect(page.locator(".success-summary")).toContainText(/request was recorded|already open/i);
    await page.goto("/help");
    await expect(page.getByText(/not monitored/i).first()).toBeVisible();
    await expectAccessible(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/participant");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await page.screenshot({ path: "artifacts/qa/participant-dashboard-mobile.png", fullPage: true });

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/participant/account");
    await page.getByLabel(/Type WITHDRAW to confirm/).fill("WITHDRAW");
    await page.getByRole("button", { name: "Record withdrawal" }).click();
    await expect(page.getByText(/Withdrawal is recorded/i)).toBeVisible();
    const closedEntry = await page.request.post("/api/participant/check-in", {
      data: {
        smokingStatus: "smoked",
        cigarettes: 1,
        craving: 1,
        confidence: 1,
        goalAttempted: true,
        triggerCodes: [],
        copingActionCodes: [],
        positiveMomentCode: "checked-in",
      },
      headers: {
        "x-csrf-token": decodeURIComponent(
          (await page.context().cookies()).find((cookie) => cookie.name === "mpft_csrf")?.value ?? "",
        ),
      },
    });
    expect(closedEntry.status()).toBe(403);
  });

  test("participant cannot enter staff routes", async ({ page }) => {
    await loginParticipant(page);
    await page.goto("/staff");
    await expect(page).toHaveURL(/\/participant$/);
    const response = await page.request.post("/api/staff/data-quality", { data: { action: "scan" } });
    expect(response.status()).toBe(403);
  });

  test("MFA-gated administrator can inspect research operations", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").check();
    await page.getByLabel("Email address").fill("fictional.admin@example.invalid");
    await page.getByLabel("Password").fill("Fictional-only-2026!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/mfa$/);
    const preMfaSession = (await page.context().cookies()).find((cookie) => cookie.name === "mpft_session")?.value;
    const secret = OTPAuth.Secret.fromBase32("JBSWY3DPEHPK3PXP");
    const totp = new OTPAuth.TOTP({ issuer: "MPFT Research Synthetic", label: "Staff simulation", algorithm: "SHA1", digits: 6, period: 30, secret });
    await page.getByLabel("Six-digit authenticator code").fill(totp.generate());
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await expect(page).toHaveURL(/\/staff$/);
    const postMfaSession = (await page.context().cookies()).find((cookie) => cookie.name === "mpft_session")?.value;
    expect(postMfaSession).toBeTruthy();
    expect(postMfaSession).not.toBe(preMfaSession);
    await expect(page.getByText("Not authorised for live pilot")).toBeVisible();
    await expectAccessible(page);

    await page.goto("/staff/data-quality");
    await page.getByRole("button", { name: "Run deterministic checks" }).click();
    await expect(page.getByText(/Scan complete:/)).toBeVisible();
    await page.goto("/staff/ai");
    await expect(page.getByRole("heading", { name: /AI reliability and cost/i })).toBeVisible();
    await page.goto("/staff/gambling");
    await expect(page.getByText("Participant access closed")).toBeVisible();
    await page.goto("/staff/releases");
    await expect(page.getByText("Live pilot closed")).toBeVisible();
    await expectAccessible(page);
    await page.screenshot({ path: "artifacts/qa/staff-releases-desktop.png", fullPage: true });
  });
});
