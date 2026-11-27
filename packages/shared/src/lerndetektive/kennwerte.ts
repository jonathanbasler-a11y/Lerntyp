import { BEDINGUNGEN, type Bedingung, type LerndetektivePayload, type TestZeitpunkt } from '../events';
import type { TestEintrag } from './sequenz';

/**
 * Kennwerte pro Kind und Bedingung (02 §6.3). Rein rechnerisch, ohne UI.
 * Ergebnisse dürfen nie an das Kinder-Tablet zurückgegeben werden (02 §9).
 *
 * Regeln:
 * - Es zählt die **erste** Antwort je Item (z. B. nach Gerätewechsel).
 * - Antworten auf Items, die nicht in der Testsequenz stehen, werden ignoriert und gezählt.
 * - Ob ein Item alt ist, bestimmt die Testsequenz, nicht der Payload; Abweichungen werden gezählt.
 * - Quoten beziehen sich auf beantwortete Items; fehlende Antworten werden als `vollstaendig=false` sichtbar.
 * - Korrigierte Quote = Trefferquote − Fehlalarmquote des Kindes (Ablenker gehören zu keiner Bedingung).
 * - d′ mit Log-linear-Korrektur (Hautus 1995): H = (Treffer+0,5)/(n+1), F = (FA+0,5)/(n_neu+1).
 *   Welche Kennzahl primär ist, legt die Präregistrierung fest (R0).
 */

export type TestAntwort = LerndetektivePayload<'antwort_abgegeben'>;

export interface BedingungsKennwert {
  n_alt: number;
  beantwortet: number;
  treffer: number;
  trefferquote: number | null;
  korrigiert: number | null;
  d_prime: number | null;
}

export interface TestKennwerte {
  test: TestZeitpunkt;
  gesamt: number;
  beantwortet: number;
  vollstaendig: boolean;
  /** Antworten auf unbekannte Items oder Doppelantworten. */
  ignoriert: number;
  /** Antworten, deren `alt`-Flag nicht zur Testsequenz passt (Hinweis auf Datenfehler). */
  inkonsistent: number;
  fehlalarm: { n_neu: number; beantwortet: number; fehlalarme: number; quote: number | null };
  bedingungen: Record<Bedingung, BedingungsKennwert>;
}

/** Inverse der Standardnormalverteilung (Acklam), |Fehler| < 1,2e-9. */
export function normalQuantil(p: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError('p muss in (0, 1) liegen');
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  if (p < pl) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  }
  if (p > 1 - pl) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) / ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) /
    (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
  );
}

export function berechneKennwerte(sequenz: readonly TestEintrag[], antworten: readonly TestAntwort[], test: TestZeitpunkt): TestKennwerte {
  const nachId = new Map(sequenz.map((e) => [e.item_id, e]));
  const erste = new Map<string, TestAntwort>();
  let ignoriert = 0;
  let inkonsistent = 0;
  for (const a of antworten) {
    if (a.test !== test) continue;
    const eintrag = nachId.get(a.item_id);
    if (!eintrag || erste.has(a.item_id)) {
      ignoriert++;
      continue;
    }
    if (a.alt !== eintrag.alt) inkonsistent++;
    erste.set(a.item_id, a);
  }

  const neu = sequenz.filter((e) => !e.alt);
  const neuBeantwortet = neu.filter((e) => erste.has(e.item_id));
  const fehlalarme = neuBeantwortet.filter((e) => erste.get(e.item_id)!.antwort === 'dabei').length;
  const faQuote = neuBeantwortet.length ? fehlalarme / neuBeantwortet.length : null;
  const faLoglin = (fehlalarme + 0.5) / (neuBeantwortet.length + 1);

  const bedingungen = Object.fromEntries(
    BEDINGUNGEN.map((b) => {
      const alt = sequenz.filter((e) => e.alt && e.bedingung === b);
      const beantwortet = alt.filter((e) => erste.has(e.item_id));
      const treffer = beantwortet.filter((e) => erste.get(e.item_id)!.antwort === 'dabei').length;
      const quote = beantwortet.length ? treffer / beantwortet.length : null;
      const dPrime =
        beantwortet.length && neuBeantwortet.length ? normalQuantil((treffer + 0.5) / (beantwortet.length + 1)) - normalQuantil(faLoglin) : null;
      const kw: BedingungsKennwert = {
        n_alt: alt.length,
        beantwortet: beantwortet.length,
        treffer,
        trefferquote: quote,
        korrigiert: quote !== null && faQuote !== null ? quote - faQuote : null,
        d_prime: dPrime,
      };
      return [b, kw];
    }),
  ) as Record<Bedingung, BedingungsKennwert>;

  return {
    test,
    gesamt: sequenz.length,
    beantwortet: erste.size,
    vollstaendig: erste.size === sequenz.length,
    ignoriert,
    inkonsistent,
    fehlalarm: { n_neu: neu.length, beantwortet: neuBeantwortet.length, fehlalarme, quote: faQuote },
    bedingungen,
  };
}

/**
 * Vorliebe-Gruppe aus V1–V3 (02 §4): Mehrheitscode; Gleichstand ⇒ `gemischt`;
 * weniger als 2 Antworten ⇒ `null` (unbekannt). Nur für die Forschungsauswertung –
 * nie in der Beamer-Grafik und nie an das Kind (02 §7.1).
 */
export function vorliebeGruppe(antworten: ReadonlyMap<string, Bedingung>): Bedingung | 'gemischt' | null {
  const werte = (['V1', 'V2', 'V3'] as const).map((id) => antworten.get(id)).filter((x): x is Bedingung => x !== undefined);
  if (werte.length < 2) return null;
  const zaehl = new Map<Bedingung, number>();
  for (const w of werte) zaehl.set(w, (zaehl.get(w) ?? 0) + 1);
  const max = Math.max(...zaehl.values());
  const spitze = [...zaehl].filter(([, n]) => n === max);
  return spitze.length === 1 ? spitze[0]![0] : 'gemischt';
}
