import { expect, test } from '@playwright/test';
import { BASE, HINWEIS, SCHNELL, SIMULIERT, alsKind, freigeben, gesammelt, textSammler, testen, toncheck, ueberzeugungen, vorlieben } from './helfer';

test('Kind-Durchlauf: Hauptstunde, Klassenergebnis, Woche später, Folgestunde bis „Fertig für heute“', async ({ page }) => {
  test.setTimeout(180_000);
  await textSammler(page);
  await alsKind(page);
  await expect(page.getByTestId('demo-banner')).toHaveText('Demo – nur Dummy-Daten');
  await expect(page.getByTestId('demo-steuerung')).toContainText('Demo: Lehrkraft-Steuerung');

  // Ton-Check (Demo: „Ton folgt“), dann Überzeugungen vorher
  await toncheck(page);
  await ueberzeugungen(page);

  // Vorlieben V1–V4, danach nur „Deine Vermutung ist notiert“
  await freigeben(page);
  await vorlieben(page);
  const vermutung = page.getByTestId('schritt-vermutung');
  await expect(vermutung).toContainText('Deine Vermutung ist notiert.');
  await expect(vermutung).not.toContainText(/Beides|Bilder|Hören/);
  await page.getByTestId('vermutung-weiter').click();
  await expect(page.getByTestId('schritt-warten')).toBeVisible();

  // Lernphase (Schnellmodus), danach wartet das Kind auf die Lehrkraft
  await freigeben(page);
  await page.getByTestId('lernen-los').click();
  await expect(page.getByTestId('schritt-lernen')).toBeVisible();
  await expect(page.getByTestId('schritt-warten')).toBeVisible({ timeout: 60_000 });

  // Pause-Aufgabe „Sterne zählen“
  await freigeben(page);
  await expect(page.getByTestId('schritt-pause_aufgabe')).toBeVisible();
  await page.getByTestId('stern-3').click();
  await expect(page.getByTestId('schritt-warten')).toBeVisible();

  // Sofort-Test: 72 Entscheidungen
  await freigeben(page);
  await testen(page);

  // Klassenergebnis: Kinder sehen nur „Schau nach vorne“, die Lehrkraft das simulierte Beispiel
  await freigeben(page);
  await expect(page.getByRole('heading', { name: 'Schau nach vorne' })).toBeVisible();
  await page.getByTestId('demo-lehrkraft').click();
  await page.getByTestId('tab-beamer').click();
  await expect(page.getByTestId('diagramm-alle')).toBeVisible();
  await expect(page.getByTestId('simuliert-label')).toHaveText(SIMULIERT);
  await expect(page.getByTestId('hinweis-lernbegleitung')).toHaveText(HINWEIS);
  await page.getByTestId('cockpit-zum-kind').click();

  // Woche später: verzögerter Test, Überzeugungen nachher, Vergleich, Superkraft, Fertig
  await page.getByTestId('demo-woche').click();
  await toncheck(page);
  await testen(page);
  await freigeben(page);
  await ueberzeugungen(page);
  await freigeben(page);
  await expect(page.getByRole('heading', { name: 'Schau nach vorne' })).toBeVisible();
  await page.getByTestId('demo-lehrkraft').click();
  await page.getByTestId('tab-beamer').click();
  await expect(page.getByTestId('diagramm-vergleich')).toBeVisible();
  await expect(page.getByTestId('simuliert-label')).toHaveText(SIMULIERT);
  await page.getByTestId('cockpit-zum-kind').click();
  await freigeben(page);
  await expect(page.getByTestId('schritt-superkraft')).toBeVisible();
  await page.getByTestId('superkraft-ein_bisschen').click();
  await freigeben(page);
  await expect(page.getByRole('heading', { name: 'Fertig für heute' })).toBeVisible();
  await page.getByTestId('zurueck-start').click();
  await expect(page.getByTestId('rolle-kind')).toBeVisible();

  // Kinder-Bildschirme: nie Ergebnisse, Prozent, Punkte, Gruppen oder Typ-Wörter
  const { texte, lernen } = await gesammelt(page);
  expect(texte.length).toBeGreaterThan(100); // 72 + 72 Testwörter, Fragen, Lernen …
  const verboten = /%|Punkte\D{0,3}\d|\bTyp\b|Lerntyp|visuell|auditiv|Bild-Lerner|Hör-Lerner|Bild-Kinder|Hör-Kinder|Ergebnis/i;
  for (const text of texte) expect(text, text).not.toMatch(verboten);

  // Bedingungen in der Lernphase: „bild“ zeigt kein Wort, „wort“ kein Bild, „bild_wort“ beides
  expect(lernen.length).toBeGreaterThan(30);
  for (const { bedingung, bild, wort } of lernen) {
    if (!bild && wort === '') continue; // leerer Bildschirm zwischen zwei Dingen
    if (bedingung === 'bild') expect({ bild, wort }, 'bild: nur Bild, kein Text').toEqual({ bild: true, wort: '' });
    if (bedingung === 'wort') expect({ bild, wort: wort !== '' }, 'wort: nur Wort, kein Bild').toEqual({ bild: false, wort: true });
    if (bedingung === 'bild_wort' || bedingung === 'puffer') expect({ bild, wort: wort !== '' }).toEqual({ bild: true, wort: true });
  }
  expect(new Set(lernen.map((l) => l.bedingung))).toEqual(new Set(['wort', 'bild', 'bild_wort', 'puffer']));
});

test('Pause und Hilfe sind jederzeit erreichbar und blockieren nichts', async ({ page }) => {
  await alsKind(page);
  await toncheck(page);
  await page.getByTestId('pause-knopf').click();
  await expect(page.getByTestId('schritt-pausiert')).toBeVisible();
  await page.getByTestId('pause-weiter').click();
  await expect(page.getByTestId('schritt-ueberzeugung')).toHaveAttribute('data-item', 'U1');
  await page.getByTestId('hilfe-knopf').click();
  await expect(page.getByRole('status')).toHaveText('Die Lehrkraft weiß Bescheid.');
  await expect(page.getByTestId('schritt-ueberzeugung')).toHaveAttribute('data-item', 'U1');
});

test('Lehrkraft-Cockpit: Phasen freigeben, Live-Status, Beamer-Grafik, Hinweis', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(BASE);
  await page.getByTestId('rolle-lehrkraft').click();
  await expect(page.getByTestId('cockpit')).toBeVisible();
  await expect(page.getByTestId('sitzungscode')).toHaveText('DEMO-4711');
  await expect(page.getByTestId('live-zeile')).toHaveCount(22);
  await expect(page.getByTestId('hinweis-lernbegleitung')).toHaveText(HINWEIS);
  await expect(page.getByTestId('demo-banner')).toBeVisible();
  // Live-Status zeigt keine Ergebnisse: nur Schrittart, Hilfe und Pause
  await expect(page.getByTestId('live-liste')).not.toContainText(/%|Punkte/);

  for (const phase of ['vorlieben', 'lernen', 'pause', 'sofort_test', 'ergebnis']) {
    await page.getByTestId('phase-weiter').click();
    await expect(page.getByTestId(`phase-${phase}`)).toHaveAttribute('aria-current', 'step');
  }
  // Gesprächsleitfaden nur auf dem Lehrkraftgerät (02 §7.2)
  await expect(page.getByTestId('leitfaden')).toContainText('Doppelt merken');
  await page.getByTestId('tab-beamer').click();
  await expect(page.getByTestId('leitfaden')).toHaveCount(0);
  await expect(page.getByTestId('hinweis-lernbegleitung')).toHaveText(HINWEIS);
  await expect(page.getByTestId('simuliert-label')).toHaveText(SIMULIERT);
  const alle = page.getByTestId('diagramm-alle');
  await expect(alle).toBeVisible();
  // Bedingungen sind durch Farbe, Muster und Symbol unterscheidbar
  await expect(alle.locator('pattern')).toHaveCount(3);
  await expect(alle.locator('[data-testid^="balken-alle-"]')).toHaveCount(3);
  await page.getByTestId('toggle-vermutung').click();
  await expect(page.getByTestId('diagramm-alle')).toContainText('Vermutet: Hören + Lesen');
  await expect(page.getByTestId('diagramm-alle').locator('[data-testid^="balken-"]')).toHaveCount(9);
});

test('Touch-Ziele sind mindestens 48 px hoch', async ({ page }) => {
  await page.goto(BASE);
  for (const b of await page.getByRole('button').all()) {
    const box = await b.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);
  }
  await alsKind(page, SCHNELL);
  await toncheck(page);
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
  await alsKind(page, SCHNELL, 'Igel-14');
  await toncheck(page);
  await ueberzeugungen(page);
  await freigeben(page);
  await vorlieben(page);
  await page.getByTestId('demo-lehrkraft').click();
  await page.getByTestId('tab-beamer').click();
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
  expect(m.short_name).toBe('Lerndetektive');
});
