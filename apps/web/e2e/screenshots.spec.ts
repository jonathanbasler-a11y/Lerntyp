import { expect, test } from '@playwright/test';
import { BASE, alsKind, bisParcours, freigeben, stationSpielen, testen, toncheck, ueberzeugungen, vorlieben } from './helfer';

// Nur auf Anfrage: SCREENSHOT_DIR=/pfad npm run e2e -- screenshots
const ZIEL = process.env['SCREENSHOT_DIR'];
test.skip(!ZIEL, 'SCREENSHOT_DIR nicht gesetzt');
test.use({ deviceScaleFactor: 2 });

test('Screenshot: Lernen (Bild + Wort), normales Tempo', async ({ page }) => {
  test.setTimeout(90_000);
  await alsKind(page, BASE);
  await toncheck(page);
  await ueberzeugungen(page);
  await freigeben(page);
  await vorlieben(page);
  await page.getByTestId('vermutung-weiter').click();
  await freigeben(page);
  await page.getByTestId('lernen-los').click();
  const karte = page.locator('[data-testid="schritt-lernen"][data-bedingung="bild_wort"]');
  await expect(karte).toBeVisible({ timeout: 40_000 });
  await page.screenshot({ path: `${ZIEL}/p2-lernen-bildwort.png` });
});

test('Screenshots: Test und Beamer', async ({ page }) => {
  test.setTimeout(180_000);
  await alsKind(page);
  await toncheck(page);
  await ueberzeugungen(page);
  await freigeben(page);
  await vorlieben(page);
  await page.getByTestId('vermutung-weiter').click();
  await freigeben(page);
  await page.getByTestId('lernen-los').click();
  await expect(page.getByTestId('schritt-warten')).toBeVisible({ timeout: 60_000 });
  await freigeben(page);
  await expect(page.getByTestId('schritt-warten')).toBeVisible({ timeout: 10_000 });
  await freigeben(page);
  await expect(page.getByTestId('test-wort')).toBeVisible();
  await page.screenshot({ path: `${ZIEL}/p2-test.png` });
  await page.setViewportSize({ width: 390, height: 667 });
  await page.screenshot({ path: `${ZIEL}/test-390.png` });
  await page.setViewportSize({ width: 810, height: 1080 });
  await testen(page);
  await freigeben(page);
  await page.getByTestId('demo-lehrkraft').click();
  await page.getByTestId('tab-beamer').click();
  await expect(page.getByTestId('diagramm-alle')).toBeVisible();
  await page.screenshot({ path: `${ZIEL}/p2-beamer.png`, fullPage: true });
});

test('Screenshots: Parcours S1–S3, Profil, Druck', async ({ page }) => {
  test.setTimeout(300_000);
  await alsKind(page);
  await bisParcours(page);
  for (const st of ['s1', 's2', 's3'] as const) {
    await stationSpielen(page, st, {
      beispiel: false,
      bei1: async () => {
        if (st === 's2') {
          await page.getByTestId('s2-block-2').click();
          await page.getByTestId('s2-block-1').click();
        }
        await page.getByTestId('hinweis-knopf-1').click();
        await page.screenshot({ path: `${ZIEL}/${st}.png`, fullPage: true });
        if (st === 's2') await page.getByTestId('s2-neu').click();
      },
    });
  }
  await freigeben(page);
  await expect(page.getByTestId('schritt-profil')).toBeVisible();
  await page.screenshot({ path: `${ZIEL}/profil.png`, fullPage: true });
  await page.getByTestId('passt-3').click();
  await page.getByTestId('demo-lehrkraft').click();
  await page.getByTestId('tab-profile').click();
  await page.getByTestId('profil-alias-Fuchs-27').click();
  await page.getByTestId('profil-drucken').click();
  await expect(page.getByTestId('druck-blatt')).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await page.screenshot({ path: `${ZIEL}/druck.png`, fullPage: true });
});
