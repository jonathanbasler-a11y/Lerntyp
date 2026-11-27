import { PayloadSchemas, parseParcoursEvent, type EventEnvelope, type ParcoursEvent, type Station } from '../events';
import { ANZAHL_AUFGABEN } from './daten';

/**
 * Ablauf einer Station (SRL-Schleife: Planen – Üben – Prüfen, 01 §7.3) als reine Funktion
 * über die Parcours-Ereignisse eines Kindes, ohne versteckten Zustand (wie `naechsterSchritt`).
 *
 * Regeln: Nach einem Fehler im ersten Versuch folgt ein zweiter Versuch; nach dem zweiten Versuch
 * (egal ob richtig) oder nach Überspringen geht es zur nächsten Aufgabe.
 */

export const PARCOURS_REGELVERSION = 'parcours-1.0';

export type StationSchritt =
  | { art: 'planen_ziel' }
  | { art: 'planen_sicherheit' }
  | {
      art: 'aufgabe';
      aufgabe_id: string;
      /** 1..5 */
      nummer: number;
      anzahl: number;
      versuch: 1 | 2;
      /** Erster Versuch war falsch: UI zeigt die erklärende Rückmeldung (`fehler`) und den zweiten Versuch. */
      nach_fehler: boolean;
      /** Höchste bisher genutzte Hinweisstufe bei dieser Aufgabe. */
      hinweis_stufe: 0 | 1 | 2;
      beispiel_geoeffnet: boolean;
      /** `aufgabe_gezeigt` wurde noch nicht gesendet. */
      zeigen: boolean;
    }
  /** Alle Aufgaben erledigt: Ziel vs. eigenes Ergebnis zeigen und „Was hat dir geholfen?“ fragen. */
  | { art: 'pruefen'; ziel: number; geschafft: number; anzahl: number; ziel_erreicht: boolean }
  | { art: 'fertig' };

export interface StationKontext {
  station: Station;
  /** Aufgaben-IDs der Station in Datenreihenfolge. */
  aufgaben: readonly string[];
  ereignisse: readonly EventEnvelope[];
}

export function parcoursEreignisse(ereignisse: readonly EventEnvelope[], station: Station): ParcoursEvent[] {
  return ereignisse
    .filter((e) => e.modul === 'parcours' && Object.hasOwn(PayloadSchemas.parcours, e.typ))
    .map((e) => parseParcoursEvent(e))
    .filter((e) => e.payload.station === station)
    .sort((a, b) => a.zeitstempel.localeCompare(b.zeitstempel) || a.client_seq - b.client_seq);
}

type Antwort = Extract<ParcoursEvent, { typ: 'antwort_abgegeben' }>;
const istAntwort = (e: ParcoursEvent): e is Antwort => e.typ === 'antwort_abgegeben';

/** Anzahl Aufgaben mit mindestens einer richtigen Antwort. */
export function geschafft(ev: readonly ParcoursEvent[]): number {
  return new Set(ev.filter(istAntwort).filter((e) => e.payload.korrekt).map((e) => e.payload.aufgabe_id)).size;
}

export function stationSchritt(ctx: StationKontext): StationSchritt {
  const ev = parcoursEreignisse(ctx.ereignisse, ctx.station);
  const ziele = ev.filter((e) => e.typ === 'ziel_gesetzt');
  const ziel = ziele[ziele.length - 1];
  if (!ziel) return { art: 'planen_ziel' };
  if (!ev.some((e) => e.typ === 'sicherheit_vorher')) return { art: 'planen_sicherheit' };

  for (const [i, id] of ctx.aufgaben.entries()) {
    const meine = ev.filter((e) => 'aufgabe_id' in e.payload && e.payload.aufgabe_id === id);
    const antworten = meine.filter(istAntwort);
    if (meine.some((e) => e.typ === 'aufgabe_uebersprungen')) continue;
    if (antworten.some((a) => a.payload.korrekt || a.payload.versuch === 2)) continue;
    const nachFehler = antworten.some((a) => a.payload.versuch === 1);
    const stufen = meine.flatMap((e) => (e.typ === 'hinweis_genutzt' ? [e.payload.stufe] : []));
    return {
      art: 'aufgabe',
      aufgabe_id: id,
      nummer: i + 1,
      anzahl: ctx.aufgaben.length,
      versuch: nachFehler ? 2 : 1,
      nach_fehler: nachFehler,
      hinweis_stufe: stufen.includes(2) ? 2 : stufen.includes(1) ? 1 : 0,
      beispiel_geoeffnet: meine.some((e) => e.typ === 'beispiel_geoeffnet'),
      zeigen: !meine.some((e) => e.typ === 'aufgabe_gezeigt'),
    };
  }

  if (!ev.some((e) => e.typ === 'hilfreich_gewaehlt')) {
    const g = geschafft(ev);
    return { art: 'pruefen', ziel: ziel.payload.ziel as number, geschafft: g, anzahl: ctx.aufgaben.length || ANZAHL_AUFGABEN, ziel_erreicht: g >= (ziel.payload.ziel as number) };
  }
  return { art: 'fertig' };
}
