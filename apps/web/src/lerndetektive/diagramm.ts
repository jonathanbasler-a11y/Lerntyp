import { BEDINGUNGEN, type Bedingung, type GruppenSchluessel, type KlassenErgebnis } from '@lerntyp/shared';
import { t, type TextKey } from '../text';

export interface Balken {
  bedingung: Bedingung;
  /** Anteil 0…1 (korrigierte Quote) oder `null`, wenn nicht berechenbar. */
  wert: number | null;
  /** Zweite Reihe (Folgestunde): „nach einer Woche“ wird heller gezeichnet. */
  verzoegert: boolean;
  /** Beschriftung unter dem Balken (nur wenn Platz ist). */
  label: string;
}

export interface BalkenGruppe {
  id: string;
  label: string;
  balken: Balken[];
}

const BEDINGUNG_LABEL: Record<Bedingung, TextKey> = {
  wort: 'bedingung.wort',
  bild: 'bedingung.bild',
  bild_wort: 'bedingung.bild_wort',
};
export const bedingungLabel = (b: Bedingung): string => t(BEDINGUNG_LABEL[b]);

const GRUPPEN_LABEL: Record<GruppenSchluessel, TextKey> = {
  wort: 'beamer.gruppe.wort',
  bild: 'beamer.gruppe.bild',
  bild_wort: 'beamer.gruppe.bild_wort',
  andere: 'beamer.gruppe.andere',
};

export function formatProzent(wert: number | null): string {
  return wert === null ? t('beamer.kein_wert') : `${Math.round(wert * 100)} %`;
}

type Mittel = Record<Bedingung, number | null>;
const balkenJeBedingung = (mittel: Mittel): Balken[] =>
  BEDINGUNGEN.map((b) => ({ bedingung: b, wert: mittel[b], verzoegert: false, label: bedingungLabel(b) }));

/** Standardansicht: „Alle Kinder“ (02 §7.1). */
export function alleGruppen(e: KlassenErgebnis): BalkenGruppe[] {
  return [{ id: 'alle', label: t('beamer.gruppe.alle'), balken: balkenJeBedingung(e.alle.mittel) }];
}

/** Optionale Aufteilung nach Vermutung (V4); `null`, wenn die Mindestgruppe verfehlt wird. */
export function nachVermutungGruppen(e: KlassenErgebnis): BalkenGruppe[] | null {
  if (!e.nachVermutung) return null;
  return e.nachVermutung.map((g) => ({ id: g.gruppe, label: t(GRUPPEN_LABEL[g.gruppe]), balken: balkenJeBedingung(g.werte.mittel) }));
}

/** Folgestunde: je Bedingung „sofort“ und „nach einer Woche“ (02 §7.3). */
export function vergleichGruppen(v: { sofort: Mittel; verzoegert: Mittel }): BalkenGruppe[] {
  return BEDINGUNGEN.map((b) => ({
    id: b,
    label: bedingungLabel(b),
    balken: [
      { bedingung: b, wert: v.sofort[b], verzoegert: false, label: t('beamer.sofort') },
      { bedingung: b, wert: v.verzoegert[b], verzoegert: true, label: t('beamer.woche') },
    ],
  }));
}
