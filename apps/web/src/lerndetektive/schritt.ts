import { naechsterSchritt, type EventEnvelope, type LerndetektiveDaten, type Rotation, type Schritt } from '@lerntyp/shared';
import type { SitzungsStand } from '../api/client';

/** Nächster Schritt eines Kindes, rein aus seinen Ereignissen und dem Sitzungsstand (02 §2, §8). */
export function berechneSchritt(
  stand: SitzungsStand,
  kind: { rotation: Rotation; seed: number },
  ereignisse: readonly EventEnvelope[],
  daten: LerndetektiveDaten,
): Schritt {
  const basis = { sitzung: stand.sitzung, daten, rotation: kind.rotation, seed: kind.seed, ereignisse };
  return stand.stunde === 'haupt'
    ? naechsterSchritt({ ...basis, stunde: 'haupt', freigabe: stand.freigabe })
    : naechsterSchritt({ ...basis, stunde: 'folge', freigabe: stand.freigabe });
}
