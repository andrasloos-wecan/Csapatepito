// audit.mjs — UX/UI audit a futó app-on Playwright-tel.
// Logikai folyamat: regisztráció → dashboard → wizard → event-detail → timeline
// → activity library → settings + résztvevői mobil-portál screenshot.
//
// Futtatás: node audit/audit.mjs
// (a dev server-nek futnia kell a :5173-on és a backend-nek a :4000-on)

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "screens");
fs.mkdirSync(OUT, { recursive: true });

const FE = "http://localhost:5173";
const BE = "http://localhost:4000";
const TS = Date.now();
const TEST_EMAIL = `audit+${TS}@example.com`;
const TEST_PASS = "audit1234";

async function shot(page, name) {
  const p = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`📸 ${name}.png`);
}

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("[page-error]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[console-error]", m.text());
  });

  // ── 1. Login képernyő (mind a 2 mód) ──────────────────────────
  await page.goto(`${FE}/login`);
  await page.waitForSelector("text=Belépés");
  await shot(page, "01-login-default");

  await page.click('button:has-text("Új szervezet")');
  await page.waitForTimeout(200);
  await shot(page, "02-login-register-empty");

  // ── 2. Regisztráció ────────────────────────────────────────────
  await page.fill('input[placeholder*="Acme"]', "Audit Kft.");
  await page.fill('input[placeholder*="Kovács"]', "UX Auditor");
  await page.fill('input[placeholder*="te@ceg.hu"]', TEST_EMAIL);
  await page.fill('input[placeholder*="6 karakter"]', TEST_PASS);
  await page.click('button:has-text("Szervezet létrehozása")');
  await page.waitForURL(`${FE}/`, { timeout: 8000 });
  await page.waitForTimeout(500);

  // ── 3. Üres dashboard ──────────────────────────────────────────
  await shot(page, "03-dashboard-empty");

  // ── 4. AI prompt használata ───────────────────────────────────
  await page.fill(
    'input[placeholder*="Szervezz"]',
    "Q3 csapatnap a Balatonnál, 20 fős fejlesztő csapatnak, fél nap"
  );
  await shot(page, "04-dashboard-ai-prompt-filled");

  // ── 5. Wizard 4 lépése ────────────────────────────────────────
  await page.goto(`${FE}/events/new`);
  await page.waitForSelector("text=Új esemény");
  await shot(page, "05-create-step1-basics");

  await page.fill('input[placeholder*="Q3"]', "Q3 Csapatnap");
  await page.click('button:has-text("Offsite")');
  await page.click('button:has-text("Csapatkohézió")');
  await page.click('button:has-text("Kommunikáció")');
  await page.fill('input[type="number"]', "20");
  await page.fill(
    'textarea',
    "Egy közös offsite a csapatkohéziót és új kommunikációs sztenderdeket célozza."
  );
  await shot(page, "06-create-step1-filled");

  await page.click('button:has-text("Tovább →")');
  await page.waitForTimeout(200);
  await shot(page, "07-create-step2-schedule");

  await page.fill('input[type="datetime-local"]', "2026-07-18T09:00");
  await page.fill('input[placeholder*="Balaton"]', "Balaton, kültéri helyszín");
  await shot(page, "08-create-step2-filled");

  await page.click('button:has-text("Tovább →")');
  await page.waitForTimeout(400);
  await shot(page, "09-create-step3-activities");

  // pár aktivitás bejelölése
  const activityCards = await page.locator("button.text-left.flex.gap-3").all();
  for (let i = 0; i < Math.min(3, activityCards.length); i++) {
    await activityCards[i].click();
  }
  await shot(page, "10-create-step3-selected");

  await page.click('button:has-text("Tovább →")');
  await page.waitForTimeout(200);
  await page.fill(
    'textarea[placeholder*="Kovács"]',
    "Kovács Anna, anna@ceg.hu\nNagy Béla, bela@ceg.hu\nSzabó Cili, cili@ceg.hu\ndavid@ceg.hu\nemma@ceg.hu"
  );
  await shot(page, "11-create-step4-invites");

  await page.click('button:has-text("Esemény létrehozása")');
  await page.waitForURL(/\/events\/[a-z0-9]+$/, { timeout: 8000 });
  await page.waitForTimeout(400);

  // ── 6. Event detail (Details B — sticky nav + commentek) ───────
  await shot(page, "12-event-detail");

  // Komment beírás
  const commentInput = page.locator('input[placeholder*="Komment"]').first();
  await commentInput.fill("Van parkoló 8 autónak?");
  await commentInput.press("Enter");
  await page.waitForTimeout(400);
  await shot(page, "13-event-detail-with-comment");

  // ── 7. Timeline (B — lanes + poll dokk) ────────────────────────
  const eventUrl = page.url();
  await page.goto(`${eventUrl}/timeline`);
  await page.waitForSelector("text=Párhuzamos menetrend");
  await page.waitForTimeout(400);
  await shot(page, "14-event-timeline");

  // Élő szavazás létrehozása
  await page.click('button:has-text("Szavazás indítása")');
  await page.waitForTimeout(200);
  await page.fill('input[placeholder*="Kérdés"]', "Mit kérnétek vacsorára?");
  await page.fill('input[placeholder*="Opciók"]', "Pizza, Tészta, Hamburger");
  await shot(page, "15-timeline-poll-form");

  await page.click('button:has-text("Indítás")');
  await page.waitForTimeout(400);
  await shot(page, "16-timeline-poll-active");

  // ── 8. Résztvevők ──────────────────────────────────────────────
  await page.goto(`${eventUrl}/participants`);
  await page.waitForSelector("text=Résztvevők");
  await page.waitForTimeout(400);
  await shot(page, "17-participants-list");

  // ── 9. Activity library ────────────────────────────────────────
  await page.goto(`${FE}/activities`);
  await page.waitForSelector("text=Aktivitás könyvtár");
  await page.waitForTimeout(500);
  await shot(page, "18-activity-library");

  // Szűrő: jégtörő
  await page.click('button:has-text("Jégtörő")');
  await page.waitForTimeout(400);
  await shot(page, "19-activity-library-filtered");

  // Activity detail
  const firstActivity = page.locator("a.card").first();
  await firstActivity.click();
  await page.waitForSelector("text=Lépések");
  await page.waitForTimeout(400);
  await shot(page, "20-activity-detail");

  // ── 10. Settings ──────────────────────────────────────────────
  await page.goto(`${FE}/settings`);
  await page.waitForSelector("text=Szervezet");
  await page.waitForTimeout(400);
  await shot(page, "21-settings");

  // ── 11. Vissza dashboard kanban+1 event ────────────────────────
  await page.goto(`${FE}/`);
  await page.waitForTimeout(500);
  await shot(page, "22-dashboard-with-event");

  // ── 12. Mobil résztvevői portál ────────────────────────────────
  // Token-link megszerzése a backendből
  const token = await getParticipantToken(page);
  if (token) {
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    });
    const mp = await mobile.newPage();
    await mp.goto(`${FE}/p/${token}`);
    await mp.waitForSelector("text=Audit Kft.", { timeout: 5000 });
    await mp.waitForTimeout(500);
    await mp.screenshot({ path: path.join(OUT, "23-mobile-portal-agenda.png"), fullPage: true });
    console.log("📸 23-mobile-portal-agenda.png");

    await mp.click('button:has-text("Adataim")');
    await mp.waitForTimeout(400);
    await mp.screenshot({ path: path.join(OUT, "24-mobile-portal-info.png"), fullPage: true });
    console.log("📸 24-mobile-portal-info.png");

    await mp.click('button:has-text("Csapatom")');
    await mp.waitForTimeout(300);
    await mp.screenshot({ path: path.join(OUT, "25-mobile-portal-team.png"), fullPage: true });
    console.log("📸 25-mobile-portal-team.png");

    await mobile.close();
  } else {
    console.warn("⚠️ token nem található — kihagyom a mobil portált");
  }

  await browser.close();
  console.log("\n✅ kész — screenshotok az audit/screens mappában");
}

async function getParticipantToken(page) {
  // a desktop oldalon belépve lekérdezzük az API-tól az első résztvevő tokenjét
  const token = await page.evaluate(async (be) => {
    const auth = localStorage.getItem("token");
    const events = await fetch(`${be}/api/events`, {
      headers: { Authorization: `Bearer ${auth}` },
    }).then((r) => r.json());
    const eid = events.events[0]?.id;
    if (!eid) return null;
    const parts = await fetch(`${be}/api/participants?eventId=${eid}`, {
      headers: { Authorization: `Bearer ${auth}` },
    }).then((r) => r.json());
    const pid = parts.participants[0]?.id;
    if (!pid) return null;
    const link = await fetch(`${be}/api/participants/${pid}/invite-link`, {
      headers: { Authorization: `Bearer ${auth}` },
    }).then((r) => r.json());
    return link.link.split("/p/")[1];
  }, BE);
  return token;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
