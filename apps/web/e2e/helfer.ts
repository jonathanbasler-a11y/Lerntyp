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
          bild: lernen.querySelector('[data-testid="platzhalter-bild"]') !== null,
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
  await expect(page.getByTestId('ton-folgt')).toBeVisible(); // Demo: keine Audio-Dateien, blockiert nie
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
