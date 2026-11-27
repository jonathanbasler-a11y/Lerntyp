import {
  BEDINGUNGEN,
  berechneKennwerte,
  testSequenz,
  type Bedingung,
  type EventEnvelope,
  type LerndetektiveDaten,
  type Rotation,
  type TestAntwort,
  type TestZeitpunkt,
} from '@lerntyp/shared';

/** Auswertung pro Kind für die Klassengrafik. Nie an das Kinder-Tablet zurückgeben (02 §9). */
export interface KindAuswertung {
  alias: string;
  vermutung: Bedingung | null;
  sofort: Record<Bedingung, number | null> | null;
  verzoegert: Record<Bedingung, number | null> | null;
}

export interface KindStamm {
  alias: string;
  rotation: Rotation;
  seed: number;
}

function korrigiertJeBedingung(
  daten: LerndetektiveDaten,
  kind: KindStamm,
  antworten: readonly TestAntwort[],
  test: TestZeitpunkt,
): Record<Bedingung, number | null> | null {
  const kw = berechneKennwerte(testSequenz(daten, kind.rotation, kind.seed, test), antworten, test);
  if (kw.beantwortet === 0) return null;
  return Object.fromEntries(BEDINGUNGEN.map((b) => [b, kw.bedingungen[b].korrigiert])) as Record<Bedingung, number | null>;
}

export function wertePro(kinder: readonly KindStamm[], ereignisse: readonly EventEnvelope[], daten: LerndetektiveDaten): KindAuswertung[] {
  const nachAlias = new Map<string, EventEnvelope[]>();
  for (const e of ereignisse) {
    if (e.modul !== 'lerndetektive') continue;
    const liste = nachAlias.get(e.teilnehmer_alias) ?? [];
    liste.push(e);
    nachAlias.set(e.teilnehmer_alias, liste);
  }
  return kinder.map((kind) => {
    const evs = nachAlias.get(kind.alias) ?? [];
    const antworten = evs.filter((e) => e.typ === 'antwort_abgegeben').map((e) => e.payload as TestAntwort);
    const v4 = evs.find((e) => e.typ === 'vorliebe_beantwortet' && e.payload['item_id'] === 'V4');
    const vermutung = v4 ? (v4.payload['antwort'] as Bedingung) : null;
    return {
      alias: kind.alias,
      vermutung,
      sofort: korrigiertJeBedingung(daten, kind, antworten, 'sofort'),
      verzoegert: korrigiertJeBedingung(daten, kind, antworten, 'verzoegert'),
    };
  });
}

export type StatusArt =
  | 'pausiert'
  | 'ueberzeugung'
  | 'vorliebe'
  | 'lernen'
  | 'pause_aufgabe'
  | 'test'
  | 'abschliessen'
  | 'zuschauer'
  | 'klassenergebnis'
  | 'vergleich'
  | 'superkraft'
  | 'warten'
  | 'fertig';
