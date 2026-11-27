import { STATIONEN, type EventEnvelope, type Station } from '../events';
import { PHASEN_HAUPT, naechsterSchritt, type AblaufKontext, type PhaseHaupt, type Schritt } from '../lerndetektive/ablauf';
import type { LerndetektiveDaten } from '../lerndetektive/daten';
import type { Rotation } from '../events';
import { stationSchritt, type StationSchritt } from '../parcours/ablauf';
import type { ParcoursDaten } from '../parcours/daten';

/**
 * Hauptstunde als Ganzes (01 §6.1): die Lerndetektive-Phasen unverändert, danach
 * `parcours` (S1 → S2 → S3) und `profil`. `naechsterSchritt` der Lerndetektive bleibt unangetastet;
 * diese Funktion umhüllt ihn. Die Lehrkraft gibt auch die neuen Phasen frei.
 */

export const PHASEN_STUNDE = [...PHASEN_HAUPT, 'parcours', 'profil'] as const;
export type PhaseStunde = (typeof PHASEN_STUNDE)[number];

export interface StundeKontext {
  sitzung: string;
  freigabe: PhaseStunde;
  daten: LerndetektiveDaten;
  parcours: ParcoursDaten;
  rotation: Rotation;
  seed: number;
  ereignisse: readonly EventEnvelope[];
}

export type StundeSchritt =
  | Schritt
  /** Ein Schritt innerhalb einer Station. */
  | { art: 'parcours'; station: Station; schritt: Exclude<StationSchritt, { art: 'fertig' }> }
  /** Profil berechnen, anzeigen und `profil_angezeigt` senden. */
  | { art: 'profil_zeigen' }
  /** „Passt das zu dir?“ (4 Smileys), danach `profil_passt` senden. */
  | { art: 'profil_passt' };

const IDX_ERGEBNIS = PHASEN_HAUPT.indexOf('ergebnis');
const profilEreignis = (ev: readonly EventEnvelope[], typ: string) => ev.some((e) => e.modul === 'profil' && e.typ === typ);

export function naechsterSchrittStunde(ctx: StundeKontext): StundeSchritt {
  const freigabeIndex = PHASEN_STUNDE.indexOf(ctx.freigabe);
  const basis = (freigabe: PhaseHaupt): AblaufKontext => ({
    stunde: 'haupt',
    sitzung: ctx.sitzung,
    freigabe,
    daten: ctx.daten,
    rotation: ctx.rotation,
    seed: ctx.seed,
    ereignisse: ctx.ereignisse,
  });

  // Bis einschließlich „ergebnis“ gilt die Lerndetektive-Logik unverändert.
  if (freigabeIndex <= IDX_ERGEBNIS) return naechsterSchritt(basis(ctx.freigabe as PhaseHaupt));

  // Danach: offene Lerndetektive-Phasen werden (wie bei „weiter“) abgeschlossen; Pause gilt weiter.
  const ld = naechsterSchritt(basis('ergebnis'));
  if (ld.art !== 'klassenergebnis') return ld;

  const imParcours = ctx.freigabe === 'parcours';
  const imProfil = ctx.freigabe === 'profil';
  if (!imParcours && !imProfil) return { art: 'warten' };

  // Parcours: S1 → S2 → S3. Ist die Lehrkraft schon beim Profil, bleibt Unvollständiges unvollständig.
  if (imParcours) {
    for (const station of STATIONEN) {
      const d = ctx.parcours[station];
      const s = stationSchritt({ station, aufgaben: d.aufgaben.map((a) => a.id), ereignisse: ctx.ereignisse });
      if (s.art !== 'fertig') return { art: 'parcours', station, schritt: s };
    }
    return { art: 'warten' };
  }

  if (!profilEreignis(ctx.ereignisse, 'profil_angezeigt')) return { art: 'profil_zeigen' };
  if (!profilEreignis(ctx.ereignisse, 'profil_passt')) return { art: 'profil_passt' };
  return { art: 'fertig' };
}
