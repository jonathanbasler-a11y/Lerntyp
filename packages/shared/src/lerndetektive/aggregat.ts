import { BEDINGUNGEN, type Bedingung } from '../events';

/**
 * Klassenergebnis für die Beamer-Grafik (02 §7.1, 01 §7.5).
 *
 * Datenschutzregeln:
 * - Standardansicht „Alle Kinder“.
 * - Optionale Aufteilung nur nach der **Vermutung** (V4), nie nach Vorliebe-Gruppe.
 * - Jede gezeigte Teilgruppe hat mindestens `mindestgruppe` Kinder; kleinere Gruppen
 *   (und Kinder ohne Vermutung) werden zu „andere“ zusammengefasst.
 * - Ist „andere“ dann kleiner als die Mindestgröße, entfällt die Aufteilung ganz –
 *   sonst ließe sich der Wert der kleinen Restgruppe aus „Alle“ minus den übrigen
 *   Gruppen zurückrechnen. Ebenso, wenn nur eine Gruppe übrig bliebe.
 */

export interface KindTestwert {
  /** V4-Antwort des Kindes oder `null`, wenn nicht beantwortet. */
  vermutung: Bedingung | null;
  /** Korrigierte Quote je Bedingung (`null`, wenn nicht berechenbar). */
  korrigiert: Record<Bedingung, number | null>;
}

export interface Balkenwerte {
  n: number;
  /** Mittelwert je Bedingung über Kinder mit Wert; `null`, wenn kein Kind einen Wert hat. */
  mittel: Record<Bedingung, number | null>;
}

export type GruppenSchluessel = Bedingung | 'andere';

export interface KlassenErgebnis {
  alle: Balkenwerte;
  /** `null` ⇒ keine Aufteilung zeigen. */
  nachVermutung: { gruppe: GruppenSchluessel; werte: Balkenwerte }[] | null;
}

function balken(kinder: readonly KindTestwert[]): Balkenwerte {
  const mittel = Object.fromEntries(
    BEDINGUNGEN.map((b) => {
      const v = kinder.map((k) => k.korrigiert[b]).filter((x): x is number => x !== null);
      return [b, v.length ? v.reduce((s, x) => s + x, 0) / v.length : null];
    }),
  ) as Record<Bedingung, number | null>;
  return { n: kinder.length, mittel };
}

export function klassenErgebnis(kinder: readonly KindTestwert[], mindestgruppe: number): KlassenErgebnis {
  if (!Number.isInteger(mindestgruppe) || mindestgruppe < 5) throw new Error('mindestgruppe muss ≥ 5 sein (01 §7.5)');
  const alle = balken(kinder);

  const gruppen = new Map<GruppenSchluessel, KindTestwert[]>();
  const andere: KindTestwert[] = [];
  for (const b of BEDINGUNGEN) {
    const g = kinder.filter((k) => k.vermutung === b);
    if (g.length >= mindestgruppe) gruppen.set(b, g);
    else andere.push(...g);
  }
  andere.push(...kinder.filter((k) => k.vermutung === null));
  if (andere.length > 0) gruppen.set('andere', andere);

  const alleGross = [...gruppen.values()].every((g) => g.length >= mindestgruppe);
  const nachVermutung = alleGross && gruppen.size >= 2 ? [...gruppen].map(([gruppe, g]) => ({ gruppe, werte: balken(g) })) : null;
  return { alle, nachVermutung };
}

export interface KindVergleich {
  sofort: Record<Bedingung, number | null>;
  verzoegert: Record<Bedingung, number | null> | null;
}

/**
 * Folgestunde (02 §7.3): „sofort vs. nach einer Woche“ je Bedingung, für die ganze Klasse.
 * Gepaart: nur Kinder mit beiden Tests, damit sich die Gruppe zwischen den Balken nicht ändert.
 * Unter der Mindestgröße gibt es keinen Vergleich.
 */
export function vergleichSofortVerzoegert(
  kinder: readonly KindVergleich[],
  mindestgruppe: number,
): { n: number; sofort: Balkenwerte['mittel']; verzoegert: Balkenwerte['mittel'] } | null {
  const gepaart = kinder.filter((k): k is KindVergleich & { verzoegert: Record<Bedingung, number | null> } => k.verzoegert !== null);
  if (gepaart.length < mindestgruppe) return null;
  const s = balken(gepaart.map((k) => ({ vermutung: null, korrigiert: k.sofort })));
  const v = balken(gepaart.map((k) => ({ vermutung: null, korrigiert: k.verzoegert })));
  return { n: gepaart.length, sofort: s.mittel, verzoegert: v.mittel };
}
