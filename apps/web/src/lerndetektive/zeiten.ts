import type { Ablauf } from '@lerntyp/shared';

export interface Zeiten {
  darbietung_ms: number;
  leer_ms: number;
  pause_aufgabe_ms: number;
}

/** Schnellmodus nur im Demo-Build und nur mit `?schnell=1` (Tests). Die Datendatei bleibt unverändert. */
export function istSchnell(search: string, demo: boolean): boolean {
  return demo && new URLSearchParams(search).get('schnell') === '1';
}

export function zeiten(ablauf: Ablauf, schnell: boolean): Zeiten {
  if (!schnell) return { darbietung_ms: ablauf.darbietung_ms, leer_ms: ablauf.leer_ms, pause_aufgabe_ms: ablauf.pause_aufgabe_ms };
  return { darbietung_ms: 150, leer_ms: 40, pause_aufgabe_ms: 700 };
}
