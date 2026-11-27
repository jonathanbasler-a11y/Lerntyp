import type { EventEnvelope, LerndetektiveDaten, Schritt } from '@lerntyp/shared';
import type { SitzungsStand, Teilnehmer } from '../api/client';
import { berechneSchritt } from './schritt';

/** Live-Status für die Lehrkraft: nur Phase bzw. Schrittart und Hilfe/Pause, nie Ergebnisse (01 §7.5). */
export interface KindStatus {
  alias: string;
  simuliert: boolean;
  art: Schritt['art'] | 'start' | 'nicht_da';
  pausiert: boolean;
  hilfe: boolean;
}

export function kindStatus(stand: SitzungsStand, kind: Teilnehmer, alle: readonly EventEnvelope[], daten: LerndetektiveDaten): KindStatus {
  const eigene = alle.filter((e) => e.teilnehmer_alias === kind.alias);
  const inSitzung = eigene
    .filter((e) => e.sitzung === stand.sitzung)
    .sort((a, b) => a.zeitstempel.localeCompare(b.zeitstempel) || a.client_seq - b.client_seq);
  const basis = { alias: kind.alias, simuliert: kind.simuliert };
  if (inSitzung.length === 0) return { ...basis, art: 'nicht_da', pausiert: false, hilfe: false };
  const hilfe = inSitzung[inSitzung.length - 1]?.typ === 'hilfe_angefordert';
  if (!inSitzung.some((e) => e.typ === 'audio_check')) return { ...basis, art: 'start', pausiert: false, hilfe };
  const schritt = berechneSchritt(stand, kind, eigene, daten);
  return { ...basis, art: schritt.art, pausiert: schritt.art === 'pausiert', hilfe };
}
