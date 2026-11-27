import { naechsterSchritt, naechsterSchrittStunde, type EventEnvelope, type LerndetektiveDaten, type Rotation, type StundeSchritt } from '@lerntyp/shared';
import type { SitzungsStand } from '../api/client';
import { parcoursDaten } from '../parcours/daten';

/**
 * Nächster Schritt eines Kindes, rein aus seinen Ereignissen und dem Sitzungsstand (02 §2, §8, 01 §6.1).
 * Hauptstunde: Lerndetektive, danach Strategie-Parcours und Lernprofil; Folgestunde: Lerndetektive.
 */
export function berechneSchritt(
  stand: SitzungsStand,
  kind: { rotation: Rotation; seed: number },
  ereignisse: readonly EventEnvelope[],
  daten: LerndetektiveDaten,
): StundeSchritt {
  const basis = { sitzung: stand.sitzung, daten, rotation: kind.rotation, seed: kind.seed, ereignisse };
  return stand.stunde === 'haupt'
    ? naechsterSchrittStunde({ ...basis, freigabe: stand.freigabe, parcours: parcoursDaten })
    : naechsterSchritt({ ...basis, stunde: 'folge', freigabe: stand.freigabe });
}
