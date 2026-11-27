import { expect, test } from '@playwright/test';
import { SCHNELL, alsKind, bisParcours, freigeben, gesammelt, stationSpielen, testen, textSammler, toncheck, ueberzeugungen } from './helfer';

// Kein Wort in Kinder-Bildschirmen, das nach Wertung, Rang oder Typ klingt.
const VERBOTEN = /%|Punkte|\bNote\b|\bNoten\b|Niveau|\bTyp\b|Lerntyp|Ergebnis|visuell|auditiv/i;

const NAMEN: Record<string, string> = {
  gedaechtnis_training: 'Gedächtnis-Training',
  haeppchen_lernen: 'Häppchen-Lernen',
  doppelt_merken: 'Doppelt merken',
  mischen: 'Mischen',
  warum_fragen: 'Warum-Fragen',
  beispiele: 'Beispiele',
};

test('Ganze Hauptstunde: Lerndetektive, Parcours S1–S3, Lernprofil, „Fertig für heute“, Cockpit-Profil, Druck, Folgestunde', async ({ page, baseURL }) => {
  test.setTimeout(300_000);
  const host = new URL(baseURL ?? '').host;
  const fremd: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol !== 'data:' && u.protocol !== 'blob:' && u.host !== host) fremd.push(r.url());
  });
  await textSammler(page);
  await alsKind(page, SCHNELL);
  await bisParcours(page);

  // S1: Musterbeispiel, Hinweise, falscher erster Versuch mit erklärender Rückmeldung, zweiter Versuch
  await stationSpielen(page, 's1', { ziel: 3, beispiel: true, fehlerBei: 2, strategien: ['beispiele', 'warum_fragen'] });
  // S2: Blöcke antippen; Aufgabe 3 mit Hinweisen und Fehlversuch
  await stationSpielen(page, 's2', { ziel: 4, fehlerBei: 3, strategien: ['mischen'] });
  // S3: Aufgabe 2 wird in beiden Versuchen falsch: Ziel 5, geschafft 4
  await stationSpielen(page, 's3', { ziel: 5, zweimalFalsch: 2, strategien: ['doppelt_merken'] });

  // Danach wartet das Kind auf die Lehrkraft; mit der Freigabe kommt das Lernprofil
  await expect(page.getByTestId('schritt-warten')).toBeVisible();
  await freigeben(page);
  const profil = page.getByTestId('schritt-profil');
  await expect(profil).toBeVisible();
  const karten = await page.getByTestId('profil-karte').count();
  expect(karten).toBeGreaterThanOrEqual(1);
  expect(karten).toBeLessThanOrEqual(3);
  await expect(page.getByTestId('profil-superkraft')).toBeVisible();
  await expect(page.getByTestId('profil-tipp')).toBeVisible();
  const superkraft = (await page.getByTestId('profil-superkraft').getAttribute('data-strategie')) ?? '';
  await expect(profil.getByRole('button', { name: 'Vorlesen' })).toBeEnabled();
  await page.getByTestId('passt-3').click();

  // „Fertig für heute“: kein weiterer Knopf zu neuen Inhalten (nur Vorlesen und der Demo-Rückweg)
  await expect(page.getByRole('heading', { name: 'Fertig für heute' })).toBeVisible();
  const knoepfe = await page.getByTestId('fertig').getByRole('button').allInnerTexts();
  expect(knoepfe.map((t) => t.trim()).sort()).toEqual(['Vorlesen', 'Zurück zum Start (Demo)']);

  // Cockpit: Einzelprofil ohne Ergebnisse der Lerndetektive
  await page.getByTestId('demo-lehrkraft').click();
  await page.getByTestId('tab-profile').click();
  await expect(page.getByTestId('hinweis-lernbegleitung')).toBeVisible();
  await page.getByTestId('profil-alias-Fuchs-27').click();
  const ansicht = page.getByTestId('profil-ansicht');
  await expect(ansicht).toBeVisible();
  await expect(page.getByTestId('profil-karte')).toHaveCount(karten);
  await expect(page.getByTestId('indikatoren').locator('li').first()).toBeVisible();
  const cockpitText = await ansicht.innerText();
  expect(cockpitText).not.toMatch(/%|Vermutet|Vorliebe|wiedererkannt|Punkte|Ergebnis/i);
  expect(cockpitText).toContain('Fuchs-27');
  await expect(page.getByTestId('hinweis-lernbegleitung')).toBeVisible();

  // Profil zum Mitnehmen: nur Alias, Karten, Superkraft, Tipp; im Druck verschwinden Demo-Rahmen und Knöpfe
  await page.getByTestId('profil-drucken').click();
  const blatt = page.getByTestId('druck-blatt');
  await expect(blatt).toBeVisible();
  await expect(page.getByTestId('druck-alias')).toHaveText('Alias: Fuchs-27');
  await expect(blatt.getByTestId('profil-karte')).toHaveCount(karten);
  await expect(blatt.getByTestId('profil-superkraft')).toHaveAttribute('data-strategie', superkraft);
  await expect(blatt).not.toContainText(/%|Vermutet|Ergebnis|Punkte/);
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByTestId('demo-banner')).toBeHidden();
  await expect(page.getByTestId('druck-knopf')).toBeHidden();
  await expect(page.getByTestId('hinweis-lernbegleitung')).toBeHidden();
  await expect(blatt).toBeVisible();
  await page.emulateMedia({ media: 'screen' });
  await page.getByTestId('druck-zurueck').click();
  await page.getByTestId('profil-zurueck').click();
  await page.getByTestId('cockpit-zum-kind').click();

  // Folgestunde: die Superkraft-Frage nennt die echte Superkraft des Kindes
  await page.getByTestId('demo-woche').click();
  await toncheck(page);
  await testen(page);
  await freigeben(page);
  await ueberzeugungen(page);
  await freigeben(page); // Vergleich
  await freigeben(page); // Superkraft
  const frage = page.getByTestId('schritt-superkraft');
  await expect(frage).toBeVisible();
  await expect(frage).toContainText('Hast du diese Woche deine Lern-Superkraft ausprobiert:');
  await expect(frage.getByRole('heading')).toContainText(NAMEN[superkraft] ?? '');
  await expect(frage.getByRole('button', { name: 'Vorlesen' })).toBeEnabled();

  // Alle Kinder-Bildschirme: keine Wertungs- oder Typ-Wörter
  const { texte } = await gesammelt(page);
  expect(texte.length).toBeGreaterThan(100);
  for (const text of texte) expect(text, text).not.toMatch(VERBOTEN);
  expect(fremd).toEqual([]);
});

test('Station: Tippen und Rückgängig im Satz-Baukasten, Bauplan-Auswahl, nie ein Fehler-Ton', async ({ page }) => {
  test.setTimeout(240_000);
  await alsKind(page, SCHNELL);
  await bisParcours(page);
  await stationSpielen(page, 's1');
  await expect(page.getByTestId('schritt-planen-ziel')).toHaveAttribute('data-station', 's2');
  await page.getByTestId('ziel-2').click();
  await page.getByTestId('sicher-4').click();
  // Blöcke antippen, einen zurücknehmen, Satz erscheint erst, wenn alle gesetzt sind
  await expect(page.getByTestId('antwort-pruefen')).toBeDisabled();
  await page.getByTestId('s2-block-2').click();
  await expect(page.getByTestId('s2-block-2')).toBeDisabled();
  await page.getByTestId('s2-zurueck').click();
  await expect(page.getByTestId('s2-block-2')).toBeEnabled();
  await expect(page.getByTestId('s2-gebaut')).toHaveCount(0);
  for (const i of [2, 1, 0]) await page.getByTestId(`s2-block-${i}`).click();
  await expect(page.getByTestId('s2-satz')).toHaveText('Im Garten bellt der Hund.');
  await page.getByTestId('s2-neu').click();
  await expect(page.getByTestId('s2-satz')).toHaveCount(0);
  // Rückmeldung bei richtiger Antwort ist sachlich: kein rotes Kreuz, kein Ton
  const mp3: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.mp3')) mp3.push(r.url());
  });
  for (const i of [2, 1, 0]) await page.getByTestId(`s2-block-${i}`).click();
  await page.getByTestId('antwort-pruefen').click();
  await expect(page.getByTestId('schritt-rueckmeldung')).toContainText('Das hat geklappt.');
  expect(mp3).toEqual([]);
});

test('S3 zeichnet das Gebäude als SVG mit Würfelflächen und zeigt drei Baupläne mit Zahlen', async ({ page }) => {
  test.setTimeout(240_000);
  await alsKind(page, SCHNELL);
  await bisParcours(page);
  await stationSpielen(page, 's1');
  await stationSpielen(page, 's2');
  await page.getByTestId('ziel-3').click();
  await page.getByTestId('sicher-3').click();
  const svg = page.getByTestId('s3-gebaeude');
  await expect(svg).toBeVisible();
  expect(await svg.locator('polygon').count()).toBeGreaterThan(6);
  for (const id of ['a', 'b', 'c']) await expect(page.getByTestId(`s3-plan-${id}`)).toContainText(/\d/);
  await expect(page.getByTestId('antwort-pruefen')).toBeDisabled();
  await page.getByTestId('s3-plan-a').click();
  await expect(page.getByTestId('s3-plan-a')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('antwort-pruefen')).toBeEnabled();
});
