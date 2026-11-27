import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';

export const BASE = '/Lerntyp/';
export const SCHNELL = `${BASE}?schnell=1`;
// Erwartete Texte stehen bewusst hier: der Test prüft die sichtbare Oberfläche.
export const HINWEIS = 'Nur zur Lernbegleitung – nicht für die Grundschulempfehlung oder Kompass 4.';
export const SIMULIERT = 'Simuliertes Beispiel – kein Forschungsergebnis';

/** Sammelt jeden Text, den ein Kinder-Bildschirm zeigt (nicht die Demo-Leiste), sowie die Darbietungen der Lernphase. */
export async function textSammler(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const w = window as unknown as { __kindTexte: Set<string>; __lernen: { bedingung: string; bild: boolean; wort: string }[] };
    w.__kindTexte = new Set();
    w.__lernen = [];
    const scan = () => {
      const el = document.querySelector<HTMLElement>('[data-testid="kind-bildschirm"]');
      if (!el) return;
      w.__kindTexte.add(el.innerText);
      const lernen = el.querySelector('[data-bedingung]');
      if (lernen)
        w.__lernen.push({
          bedingung: lernen.getAttribute('data-bedingung') ?? '',
          bild: lernen.querySelector('[data-testid="platzhalter-bild"], [data-testid="echtes-bild"]') !== null,
          wort: lernen.querySelector<HTMLElement>('[data-testid="lernen-wort"]')?.textContent ?? '',
        });
    };
    new MutationObserver(scan).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
  });
}

export async function gesammelt(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __kindTexte: Set<string>; __lernen: { bedingung: string; bild: boolean; wort: string }[] };
    return { texte: [...w.__kindTexte], lernen: w.__lernen };
  });
}

export async function alsKind(page: Page, url = SCHNELL, alias = 'Fuchs-27'): Promise<void> {
  await page.goto(url);
  await page.getByTestId('rolle-kind').click();
  await page.getByTestId(`alias-${alias}`).click();
}

export async function toncheck(page: Page): Promise<void> {
  await expect(page.getByTestId('schritt-start')).toBeVisible();
  await expect(page.getByTestId('audio-weiter')).toBeEnabled(); // check.mp3 ist da: kein „Ton folgt“
  await expect(page.getByTestId('ton-folgt')).toHaveCount(0);
  await page.getByTestId('audio-weiter').click();
}

export async function ueberzeugungen(page: Page): Promise<void> {
  for (const id of ['U1', 'U2', 'U3']) {
    await expect(page.getByTestId('schritt-ueberzeugung')).toHaveAttribute('data-item', id);
    await page.getByTestId(id === 'U3' ? 'u-stimmt' : 'u-weiss_nicht').click();
  }
  await expect(page.getByTestId('schritt-warten')).toBeVisible();
}

export async function vorlieben(page: Page): Promise<void> {
  for (const id of ['V1', 'V2', 'V3', 'V4']) {
    await expect(page.getByTestId('schritt-vorliebe')).toHaveAttribute('data-item', id);
    await page.getByTestId('v-bild_wort').click();
  }
}

export async function freigeben(page: Page): Promise<void> {
  await page.getByTestId('demo-weiter').click();
}

/** Beantwortet `n` Test-Entscheidungen; wartet nach jeder Antwort auf das nächste Wort. */
export async function testen(page: Page, n = 72): Promise<void> {
  for (let i = 0; i < n; i++) {
    const wort = page.getByTestId('test-wort');
    await expect(wort).toBeVisible();
    const pos = await wort.getAttribute('data-position');
    await page.getByTestId(i % 3 === 0 ? 'antwort-nicht' : 'antwort-dabei').click();
    if (i < n - 1) await expect(page.getByTestId('test-wort')).not.toHaveAttribute('data-position', pos ?? '');
  }
  await expect(page.getByTestId('schritt-warten')).toBeVisible();
}

/** Von der Lernausweis-Auswahl bis zum ersten Sofort-Test-Wort (Schnellmodus). */
export async function bisSofortTest(page: Page): Promise<void> {
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
}

/** Lehrkraft-Cockpit bis zur Beamer-Grafik des Klassenergebnisses. */
export async function zumBeamer(page: Page): Promise<void> {
  await page.goto(BASE);
  await page.getByTestId('rolle-lehrkraft').click();
  for (let i = 0; i < 5; i++) await page.getByTestId('phase-weiter').click();
  await page.getByTestId('tab-beamer').click();
  await expect(page.getByTestId('diagramm-alle')).toBeVisible();
}

/** Von „Klassenergebnis“ zur Folgestunde: Parcours und Profil werden freigegeben (das Kind macht sie hier nicht), dann „Woche später“. */
export async function zurWoche(page: Page): Promise<void> {
  await freigeben(page);
  await freigeben(page);
  await page.getByTestId('demo-woche').click();
}

// ---------------------------------------------------------------------------
// Strategie-Parcours
// ---------------------------------------------------------------------------
type Station = 's1' | 's2' | 's3';
interface Aufgabe {
  id: string;
  fehler: string;
  hinweis1: string;
  hinweis2: string;
  richtig?: string;
  optionen?: string[];
  grund?: { art: string };
  bloecke?: { text: string }[];
  erlaubte_reihenfolgen?: number[][];
  plaene?: { id: string }[];
}
const DATEI: Record<Station, string> = { s1: 's1-wort-werkstatt.json', s2: 's2-satz-baukasten.json', s3: 's3-wuerfel-baumeister.json' };
export const parcoursAufgaben = (station: Station): Aufgabe[] =>
  (JSON.parse(readFileSync(resolve(import.meta.dirname, '../../../data/parcours', DATEI[station]), 'utf8')) as { aufgaben: Aufgabe[] }).aufgaben;

/** Beantwortet die sichtbare Aufgabe richtig oder bewusst falsch. */
async function beantworte(page: Page, station: Station, a: Aufgabe, richtig: boolean): Promise<void> {
  if (station === 's1') {
    const buchstabe = richtig ? a.richtig! : a.optionen!.find((o) => o !== a.richtig)!;
    await page.getByTestId(`s1-buchstabe-${buchstabe}`).click();
    await page.getByTestId(`s1-grund-${a.grund!.art}`).click();
  } else if (station === 's2') {
    const reihenfolge = richtig ? a.erlaubte_reihenfolgen!.find((r) => r[0] !== 0)! : a.bloecke!.map((_, i) => i);
    for (const i of reihenfolge) await page.getByTestId(`s2-block-${i}`).click();
    await page.getByTestId('antwort-pruefen').click();
  } else {
    const plan = richtig ? a.richtig! : a.plaene!.find((p) => p.id !== a.richtig)!.id;
    await page.getByTestId(`s3-plan-${plan}`).click();
    await page.getByTestId('antwort-pruefen').click();
  }
}

export interface StationsOptionen {
  ziel?: number;
  /** Musterbeispiel bei Aufgabe 1 öffnen. */
  beispiel?: boolean;
  /** Nummer (1–5) der Aufgabe mit Hinweisen und falschem ersten Versuch. */
  fehlerBei?: number;
  /** Nummer (1–5) der Aufgabe, die beide Versuche falsch hat. */
  zweimalFalsch?: number;
  strategien?: string[];
  /** Wird bei Aufgabe 1 aufgerufen, bevor sie beantwortet wird (z. B. für Screenshots). */
  bei1?: () => Promise<void>;
}

/** Eine Station von Planen bis „Was hat dir geholfen?“. */
export async function stationSpielen(page: Page, station: Station, opt: StationsOptionen = {}): Promise<void> {
  await expect(page.getByTestId('schritt-planen-ziel')).toHaveAttribute('data-station', station);
  await page.getByTestId(`ziel-${opt.ziel ?? 3}`).click();
  await expect(page.getByTestId('schritt-planen-sicherheit')).toBeVisible();
  await page.getByTestId('sicher-2').click();
  const aufgaben = parcoursAufgaben(station);
  for (const [i, a] of aufgaben.entries()) {
    const nr = i + 1;
    await expect(page.getByTestId('schritt-aufgabe')).toHaveAttribute('data-aufgabe', a.id);
    await expect(page.getByTestId('aufgabe-nr')).toHaveText(`Aufgabe ${nr} von 5`);
    if (nr === 1 && opt.beispiel) {
      await page.getByTestId('beispiel-knopf').click();
      await expect(page.getByTestId('beispiel-box')).toBeVisible();
      await page.getByTestId('beispiel-knopf').click();
      await expect(page.getByTestId('beispiel-box')).toHaveCount(0);
    }
    if (nr === 1 && opt.bei1) await opt.bei1();
    if (nr === opt.fehlerBei || nr === opt.zweimalFalsch) {
      await expect(page.getByTestId('hinweis-knopf-2')).toBeDisabled();
      await page.getByTestId('hinweis-knopf-1').click();
      await expect(page.getByTestId('hinweis-1')).toHaveText(a.hinweis1);
      await page.getByTestId('hinweis-knopf-2').click();
      await expect(page.getByTestId('hinweis-2')).toHaveText(a.hinweis2);
      await beantworte(page, station, a, false);
      const r = page.getByTestId('schritt-rueckmeldung');
      await expect(r).toHaveAttribute('data-korrekt', 'false');
      await expect(r).toContainText(a.fehler);
      await expect(page.getByTestId('rueckmeldung-weiter')).toHaveText('Noch einmal probieren');
      await page.getByTestId('rueckmeldung-weiter').click();
      // zweiter Versuch: gleiche Aufgabe, Hinweise bleiben stehen, Eingabe ist leer
      await expect(page.getByTestId('schritt-aufgabe')).toHaveAttribute('data-aufgabe', a.id);
      await expect(page.getByTestId('hinweis-2')).toBeVisible();
      await beantworte(page, station, a, nr !== opt.zweimalFalsch);
    } else {
      await beantworte(page, station, a, true);
    }
    const r = page.getByTestId('schritt-rueckmeldung');
    await expect(r).toBeVisible();
    if (nr === opt.zweimalFalsch) {
      await expect(r).toHaveAttribute('data-korrekt', 'false');
      await expect(page.getByTestId('rueckmeldung-weiter')).toHaveText('Weiter');
    } else {
      await expect(r).toHaveAttribute('data-korrekt', 'true');
      await expect(r).toContainText('Das hat geklappt.');
    }
    await page.getByTestId('rueckmeldung-weiter').click();
  }
  await expect(page.getByTestId('schritt-pruefen')).toBeVisible();
  const geschafft = opt.zweimalFalsch ? 4 : 5;
  await expect(page.getByTestId('pruefen-ergebnis')).toHaveText(geschafft >= (opt.ziel ?? 3) ? 'Du hast dein Ziel erreicht.' : `Du hast ${geschafft} geschafft, du hattest ${opt.ziel ?? 3} geplant.`);
  await expect(page.getByTestId('pruefen-fertig')).toBeDisabled();
  for (const s of opt.strategien ?? ['beispiele']) await page.getByTestId(`strategie-${s}`).click();
  await page.getByTestId('pruefen-fertig').click();
}

/** Bis zur ersten Station: Lerndetektive durchlaufen (Schnellmodus), „Klassenergebnis“, dann Parcours freigeben. */
export async function bisParcours(page: Page): Promise<void> {
  await bisSofortTest(page);
  await testen(page);
  await freigeben(page); // Klassenergebnis
  await expect(page.getByRole('heading', { name: 'Schau nach vorne' })).toBeVisible();
  await freigeben(page); // Parcours
  await expect(page.getByTestId('schritt-planen-ziel')).toBeVisible();
}
