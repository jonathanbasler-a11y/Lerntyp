import { expect, test } from '@playwright/test';
import { BASE, SCHNELL, alsKind, bisSofortTest, freigeben, testen, toncheck, ueberzeugungen, vorlieben, zumBeamer, zurWoche } from './helfer';

test('Lernbühne in der Bedingung „bild“ zeigt keinen sichtbaren Text', async ({ page }) => {
  test.setTimeout(90_000);
  await alsKind(page);
  await toncheck(page);
  await ueberzeugungen(page);
  await freigeben(page);
  await vorlieben(page);
  await page.getByTestId('vermutung-weiter').click();
  await freigeben(page);
  await page.getByTestId('lernen-los').click();
  const buehne = page.locator('[data-testid="schritt-lernen"][data-bedingung="bild"]');
  await expect(buehne).toBeVisible({ timeout: 40_000 });
  await expect(buehne.getByTestId('platzhalter-bild')).toBeVisible();
  expect(await buehne.evaluate((el) => (el as HTMLElement).innerText)).toBe('');
  await expect(page.getByTestId('demo-steuerung')).toContainText('Bilder sind Platzhalter');
});

test('Demo-Leiste verdeckt bei 390×667 die Test-Knöpfe nicht', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 667 });
  await alsKind(page);
  await bisSofortTest(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const leiste = await page.getByTestId('demo-steuerung').boundingBox();
  expect(leiste).not.toBeNull();
  for (const name of ['War dabei', 'War nicht dabei']) {
    const knopf = await page.getByRole('button', { name, exact: true }).boundingBox();
    expect(knopf).not.toBeNull();
    expect(knopf!.y + knopf!.height, name).toBeLessThanOrEqual(leiste!.y);
    expect(knopf!.height).toBeGreaterThanOrEqual(48);
  }
  const vorlesen = await page.getByRole('button', { name: 'Vorlesen' }).boundingBox();
  expect(vorlesen!.y + vorlesen!.height).toBeLessThanOrEqual(leiste!.y);
  // einklappen: nur noch ein kleiner Knopf
  await page.getByTestId('demo-einklappen').click();
  await expect(page.getByTestId('demo-aufklappen')).toHaveText('Demo-Steuerung');
  await page.getByTestId('demo-aufklappen').click();
  await expect(page.getByTestId('demo-weiter')).toBeVisible();
});

test('Beamer-Ansicht bei 390 px hat kein horizontales Seiten-Scrollen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await zumBeamer(page);
  const breiten = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(breiten.scroll).toBeLessThanOrEqual(breiten.client);
});

test('Diagramm bei 1080×810: Achsenbeschriftung ohne Scrollen sichtbar', async ({ page }) => {
  await page.setViewportSize({ width: 1080, height: 810 });
  await zumBeamer(page);
  const figur = page.getByTestId('diagramm-alle');
  const label = figur.locator('text', { hasText: 'Alle Kinder' });
  await label.scrollIntoViewIfNeeded();
  const box = await label.boundingBox();
  const figurBox = await figur.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1080);
  expect(box!.y + box!.height).toBeLessThanOrEqual(figurBox!.y + figurBox!.height);
  expect(figurBox!.height).toBeLessThanOrEqual(810 * 0.55 + 4);
  const scrollt = await figur.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrollt).toBe(false);
});

test('Verzögerter Test fragt nach „letzte Woche“, Sofort-Test nach „vorhin“', async ({ page }) => {
  test.setTimeout(180_000);
  await alsKind(page, SCHNELL);
  await bisSofortTest(page);
  await expect(page.getByText('War dieses Ding vorhin dabei?')).toBeVisible();
  await testen(page);
  await freigeben(page);
  await zurWoche(page);
  await toncheck(page);
  await expect(page.getByText('War dieses Ding letzte Woche dabei?')).toBeVisible();
});

test('Seitentitel ist „Lerndetektive“', async ({ page }) => {
  await page.goto(BASE);
  expect(await page.title()).toBe('Lerndetektive');
});

test('Nach einer Pause in der Lernphase erscheint „Weiter geht’s“', async ({ page }) => {
  test.setTimeout(90_000);
  await alsKind(page);
  await toncheck(page);
  await ueberzeugungen(page);
  await freigeben(page);
  await vorlieben(page);
  await page.getByTestId('vermutung-weiter').click();
  await freigeben(page);
  await page.getByTestId('lernen-los').click();
  await expect(page.getByTestId('schritt-lernen')).toBeVisible();
  await page.getByTestId('pause-knopf').click();
  await expect(page.getByTestId('schritt-pausiert')).toBeVisible();
  await page.getByTestId('pause-weiter').click();
  await expect(page.getByTestId('schritt-weiter_geht')).toContainText('Weiter geht’s'.replace('’', "'"));
  await page.getByTestId('weiter-geht').click();
  await expect(page.getByTestId('schritt-lernen')).toBeVisible({ timeout: 10_000 });
});

test('Hilfe-Bestätigung verschwindet nach 10 s', async ({ page }) => {
  await page.clock.install();
  await alsKind(page);
  await toncheck(page);
  await page.getByTestId('hilfe-knopf').click();
  await expect(page.getByRole('status')).toBeVisible();
  await page.clock.fastForward(10_500);
  await expect(page.getByRole('status')).toHaveCount(0);
});
