import { berechneProfil, profilAnzeige, type EventEnvelope, type Profil, type ProfilAnzeige, type Strategie, STRATEGIEN } from '@lerntyp/shared';
import { kartenDaten } from './daten';

type Gespeichert = Pick<Profil, 'karten_ids' | 'superkraft'>;

/** Zuletzt angezeigtes Profil eines Kindes (Ereignis `profil_angezeigt`), falls vorhanden. */
export function gespeichertesProfil(ereignisse: readonly EventEnvelope[]): Gespeichert | null {
  const e = ereignisse.filter((x) => x.modul === 'profil' && x.typ === 'profil_angezeigt').at(-1);
  if (!e) return null;
  const superkraft = e.payload['superkraft'];
  const ids = e.payload['karten_ids'];
  if (!STRATEGIEN.includes(superkraft as Strategie) || !Array.isArray(ids)) return null;
  return { karten_ids: ids as string[], superkraft: superkraft as Strategie };
}

/** Profil eines Kindes: das gespeicherte, sonst aus den Verhaltensspuren berechnet (nie aus der Richtigkeit, siehe shared/profil). */
export function profilFuer(ereignisse: readonly EventEnvelope[]): Gespeichert {
  return gespeichertesProfil(ereignisse) ?? berechneProfil(ereignisse, kartenDaten);
}

export function anzeigeFuer(ereignisse: readonly EventEnvelope[]): ProfilAnzeige {
  return profilAnzeige(profilFuer(ereignisse), kartenDaten);
}
