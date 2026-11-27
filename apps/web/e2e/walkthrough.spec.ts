import { expect, test } from '@playwright/test';

const BASE = '/Lerntyp/';
// Erwartete Texte stehen bewusst hier: der Test prüft die sichtbare Oberfläche.
const HINWEIS = 'Nur zur Lernbegleitung – nicht für die Grundschulempfehlung oder Kompass 4.';

test('Kind-Durchlauf: Start bis „Fertig für heute“', async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByTestId('demo-banner')).toHaveText('Demo – nur Dummy-Daten');
  await page.getByTestId('rolle-kind').click();
  await page.getByTestId('alias-Fuchs-27').click();
  for (const id of ['start', 'lerndetektive', 'parcours', 'profil']) {
    await expect(page.getByTestId(`phase-${id}`)).toBeVisible();
    await expect(page.getByText('Kommt in Phase 2')).toBeVisible();
    await expect(page.getByTestId('demo-banner')).toBeVisible();
    await page.getByTestId('weiter').click();
  }
  await expect(page.getByRole('heading', { name: 'Fertig für heute' })).toBeVisible();
  // Kein Weg zu mehr Inhalt: nur der kleine Demo-Link zurück zum Start.
  await expect(page.getByRole('button')).toHaveCount(2); // Vorlesen (deaktiviert) + Zurück zum Start
  await page.getByTestId('zurueck-start').click();
  await expect(page.getByTestId('rolle-kind')).toBeVisible();
});

test('Lehrkraft-Cockpit zeigt Code, Aliasse und den verbindlichen Hinweis', async ({ page }) => {
  await page.goto(BASE);
  await page.getByTestId('rolle-lehrkraft').click();
  await expect(page.getByTestId('cockpit')).toBeVisible();
  await expect(page.getByTestId('sitzungscode')).toHaveText('DEMO-4711');
  await expect(page.getByText('wartet')).toHaveCount(6);
  await expect(page.getByTestId('hinweis-lernbegleitung')).toHaveText(HINWEIS);
  await expect(page.getByTestId('demo-banner')).toBeVisible();
});

test('Touch-Ziele sind mindestens 48 px hoch', async ({ page }) => {
  await page.goto(BASE);
  for (const b of await page.getByRole('button').all()) {
    const box = await b.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
  }
});

test('keine Requests an fremde Hosts (Walkthrough)', async ({ page, baseURL }) => {
  const host = new URL(baseURL ?? '').host;
  const fremd: string[] = [];
  const alle: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol === 'data:' || u.protocol === 'blob:') return;
    alle.push(r.url());
    if (u.host !== host) fremd.push(r.url());
  });
  await page.goto(BASE);
  await page.getByTestId('rolle-kind').click();
  await page.getByTestId('alias-Igel-14').click();
  for (let i = 0; i < 4; i++) await page.getByTestId('weiter').click();
  await page.getByTestId('zurueck-start').click();
  await page.getByTestId('rolle-lehrkraft').click();
  await page.waitForLoadState('networkidle');
  expect(alle.length).toBeGreaterThan(0);
  expect(fremd).toEqual([]);
});

test('Manifest hat Scope und Kurzname', async ({ page, request }) => {
  await page.goto(BASE);
  const res = await request.get(`${BASE}manifest.webmanifest`);
  expect(res.ok()).toBe(true);
  const m = await res.json();
  expect(m.scope).toBe(BASE);
  expect(m.short_name).toBe('Lerntyp');
});
