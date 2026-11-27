import { PayloadSchemas, parseLerndetektiveEvent, type EventEnvelope, type LerndetektiveEvent, type Rotation } from '../events';
import type { LerndetektiveDaten } from './daten';
import { lernSequenz, testSequenz, type LernEintrag, type TestEintrag } from './sequenz';

/**
 * Ablauf der Lerndetektive als reine Funktion über die Ereignisse eines Kindes (02 §2, §8).
 * Es gibt keinen versteckten Zustand: Nach einem Gerätewechsel liefert dieselbe Funktion
 * mit denselben Ereignissen denselben nächsten Schritt.
 *
 * Die Lehrkraft gibt Phasen frei (`freigabe`); ein Kind kommt nie über die freigegebene Phase hinaus.
 */

export const PHASEN_HAUPT = ['ueberzeugung_vorher', 'vorlieben', 'lernen', 'pause', 'sofort_test', 'ergebnis'] as const;
export const PHASEN_FOLGE = ['verzoegert_test', 'ueberzeugung_nachher', 'vergleich', 'superkraft', 'fertig'] as const;
export type PhaseHaupt = (typeof PHASEN_HAUPT)[number];
export type PhaseFolge = (typeof PHASEN_FOLGE)[number];

export type AblaufKontext =
  | {
      stunde: 'haupt';
      /** Aktuelle Sitzung; der Pause-Zustand gilt nur innerhalb dieser Sitzung. */
      sitzung: string;
      freigabe: PhaseHaupt;
      daten: LerndetektiveDaten;
      rotation: Rotation;
      seed: number;
      ereignisse: readonly EventEnvelope[];
    }
  | {
      stunde: 'folge';
      sitzung: string;
      freigabe: PhaseFolge;
      daten: LerndetektiveDaten;
      rotation: Rotation;
      seed: number;
      /** Ereignisse des Kindes aus Haupt- **und** Folgestunde. */
      ereignisse: readonly EventEnvelope[];
    };

export type Schritt =
  | { art: 'pausiert' }
  | { art: 'ueberzeugung'; item_id: 'U1' | 'U2' | 'U3'; zeitpunkt: 'vorher' | 'nachher' }
  | { art: 'vorliebe'; item_id: 'V1' | 'V2' | 'V3' | 'V4' }
  | { art: 'lernen'; eintrag: LernEintrag }
  | { art: 'pause_aufgabe' }
  | { art: 'test'; test: 'sofort' | 'verzoegert'; eintrag: TestEintrag }
  /** UI soll `phase_abgeschlossen` mit diesen Werten senden und dann neu fragen. */
  | { art: 'abschliessen'; phase: 'lernen' | 'pause' | 'sofort_test' | 'verzoegert_test'; abgebrochen: boolean }
  /** Lernphase verpasst: keine Testteilnahme, kurze Ersatzaufgabe (02 §8). */
  | { art: 'zuschauer'; test: 'sofort' | 'verzoegert' }
  | { art: 'klassenergebnis' }
  | { art: 'vergleich' }
  | { art: 'superkraft' }
  | { art: 'warten' }
  | { art: 'fertig' };

/**
 * Ereignisse sortiert und typisiert. Andere Module und modulübergreifende Typen
 * (`pause`, `hilfe_angefordert`) bleiben außen vor.
 */
function lerndetektiveEreignisse(ereignisse: readonly EventEnvelope[]): LerndetektiveEvent[] {
  return ereignisse
    .filter((e) => e.modul === 'lerndetektive' && Object.hasOwn(PayloadSchemas.lerndetektive, e.typ))
    .map((e) => parseLerndetektiveEvent(e))
    .sort((a, b) => a.zeitstempel.localeCompare(b.zeitstempel) || a.client_seq - b.client_seq);
}

function istPausiert(ereignisse: readonly EventEnvelope[], sitzung: string): boolean {
  const pausen = ereignisse
    .filter((e) => e.typ === 'pause' && e.sitzung === sitzung)
    .sort((a, b) => a.zeitstempel.localeCompare(b.zeitstempel) || a.client_seq - b.client_seq);
  const letzte = pausen[pausen.length - 1];
  return letzte?.payload['aktiv'] === true;
}

const abgeschlossen = (ev: readonly LerndetektiveEvent[], phase: string) => ev.some((e) => e.typ === 'phase_abgeschlossen' && e.payload.phase === phase);
const gezeigtePositionen = (ev: readonly LerndetektiveEvent[]) =>
  new Set(ev.flatMap((e) => (e.typ === 'item_gezeigt' ? [e.payload.position] : [])));
const beantworteteTestItems = (ev: readonly LerndetektiveEvent[], test: 'sofort' | 'verzoegert') =>
  new Set(ev.flatMap((e) => (e.typ === 'antwort_abgegeben' && e.payload.test === test ? [e.payload.item_id] : [])));

/**
 * Lernphase unterbrochen? Ja, wenn Positionen fehlen oder zwischen zwei aufeinanderfolgenden
 * Darbietungen mehr als das Dreifache des Takts liegt (z. B. Gerätewechsel, Pause).
 */
export function lernenUnterbrochen(ereignisse: readonly EventEnvelope[], daten: LerndetektiveDaten): boolean {
  const gezeigt = lerndetektiveEreignisse(ereignisse)
    .filter((e): e is Extract<LerndetektiveEvent, { typ: 'item_gezeigt' }> => e.typ === 'item_gezeigt')
    .sort((a, b) => a.payload.position - b.payload.position);
  if (gezeigt.length === 0) return false;
  const takt = daten.ablauf.darbietung_ms + daten.ablauf.leer_ms;
  for (let i = 0; i < gezeigt.length; i++) {
    if (gezeigt[i]!.payload.position !== i) return true;
    if (i > 0) {
      const dt = Date.parse(gezeigt[i]!.zeitstempel) - Date.parse(gezeigt[i - 1]!.zeitstempel);
      if (dt > 3 * takt) return true;
    }
  }
  return false;
}

function ueberzeugungSchritt(ev: readonly LerndetektiveEvent[], zeitpunkt: 'vorher' | 'nachher'): Schritt | null {
  const erledigt = new Set(ev.flatMap((e) => (e.typ === 'ueberzeugung_beantwortet' && e.payload.zeitpunkt === zeitpunkt ? [e.payload.item_id] : [])));
  const offen = (['U1', 'U2', 'U3'] as const).find((id) => !erledigt.has(id));
  return offen ? { art: 'ueberzeugung', item_id: offen, zeitpunkt } : null;
}

function testSchritt(daten: LerndetektiveDaten, ctx: AblaufKontext, ev: readonly LerndetektiveEvent[], test: 'sofort' | 'verzoegert'): Schritt | null {
  const phase = test === 'sofort' ? 'sofort_test' : 'verzoegert_test';
  if (abgeschlossen(ev, phase)) return null;
  const erledigt = beantworteteTestItems(ev, test);
  const naechstes = testSequenz(daten, ctx.rotation, ctx.seed, test).find((e) => !erledigt.has(e.item_id));
  return naechstes ? { art: 'test', test, eintrag: naechstes } : { art: 'abschliessen', phase, abgebrochen: false };
}

export function naechsterSchritt(ctx: AblaufKontext): Schritt {
  if (istPausiert(ctx.ereignisse, ctx.sitzung)) return { art: 'pausiert' };
  const ev = lerndetektiveEreignisse(ctx.ereignisse);
  const { daten } = ctx;
  const hatGelernt = gezeigtePositionen(ev).size > 0;

  if (ctx.stunde === 'haupt') {
    const freigabeIndex = PHASEN_HAUPT.indexOf(ctx.freigabe);
    const lernIndex = PHASEN_HAUPT.indexOf('lernen');
    const zuschauer = !hatGelernt && freigabeIndex > lernIndex;

    for (const phase of PHASEN_HAUPT.slice(0, freigabeIndex + 1)) {
      const weiter = PHASEN_HAUPT.indexOf(phase) < freigabeIndex;
      switch (phase) {
        case 'ueberzeugung_vorher': {
          const s = ueberzeugungSchritt(ev, 'vorher');
          // Die Vorher-Messung muss vor dem eigenen Lernen liegen: Wer schon lernt oder die
          // Lernphase verpasst hat (Zuschauer), überspringt sie; alle anderen holen sie nach.
          if (s && !hatGelernt && !zuschauer) return s;
          break;
        }
        case 'vorlieben': {
          const erledigt = new Set(ev.flatMap((e) => (e.typ === 'vorliebe_beantwortet' ? [e.payload.item_id] : [])));
          const offen = (['V1', 'V2', 'V3', 'V4'] as const).find((id) => !erledigt.has(id));
          if (offen && !zuschauer && !hatGelernt) return { art: 'vorliebe', item_id: offen };
          break;
        }
        case 'lernen': {
          if (zuschauer || abgeschlossen(ev, 'lernen')) break;
          const gezeigt = gezeigtePositionen(ev);
          const seq = lernSequenz(daten, ctx.rotation, ctx.seed);
          const offen = seq.find((e) => !gezeigt.has(e.position));
          // Lehrkraft ist weiter, Lernphase unvollständig ⇒ nicht neu starten, als abgebrochen schließen (02 §8).
          if (offen && weiter) return { art: 'abschliessen', phase: 'lernen', abgebrochen: true };
          if (offen) return { art: 'lernen', eintrag: offen };
          return { art: 'abschliessen', phase: 'lernen', abgebrochen: lernenUnterbrochen(ctx.ereignisse, daten) };
        }
        case 'pause': {
          if (zuschauer || abgeschlossen(ev, 'pause')) break;
          if (weiter) return { art: 'abschliessen', phase: 'pause', abgebrochen: true };
          return { art: 'pause_aufgabe' };
        }
        case 'sofort_test': {
          if (zuschauer) {
            if (!weiter) return { art: 'zuschauer', test: 'sofort' };
            break;
          }
          const s = testSchritt(daten, ctx, ev, 'sofort');
          // Unvollständiger Test, Lehrkraft ist weiter ⇒ abschließen; vorhandene Antworten bleiben gültig.
          if (s?.art === 'test' && weiter) return { art: 'abschliessen', phase: 'sofort_test', abgebrochen: true };
          if (s) return s;
          break;
        }
        case 'ergebnis':
          return { art: 'klassenergebnis' };
      }
    }
    return { art: 'warten' };
  }

  // Folgestunde
  const freigabeIndex = PHASEN_FOLGE.indexOf(ctx.freigabe);
  for (const phase of PHASEN_FOLGE.slice(0, freigabeIndex + 1)) {
    const weiter = PHASEN_FOLGE.indexOf(phase) < freigabeIndex;
    switch (phase) {
      case 'verzoegert_test': {
        // Wer in der Hauptstunde nichts gelernt hat, macht keinen verzögerten Test.
        if (!hatGelernt) {
          if (!weiter) return { art: 'zuschauer', test: 'verzoegert' };
          break;
        }
        const s = testSchritt(daten, ctx, ev, 'verzoegert');
        if (s?.art === 'test' && weiter) return { art: 'abschliessen', phase: 'verzoegert_test', abgebrochen: true };
        if (s) return s;
        break;
      }
      case 'ueberzeugung_nachher': {
        const s = ueberzeugungSchritt(ev, 'nachher');
        if (s && !weiter) return s;
        break;
      }
      case 'vergleich':
        if (!weiter) return { art: 'vergleich' };
        break;
      case 'superkraft': {
        const beantwortet = ctx.ereignisse.some((e) => e.modul === 'profil' && e.typ === 'superkraft_ausprobiert');
        if (!beantwortet && !weiter) return { art: 'superkraft' };
        break;
      }
      case 'fertig':
        return { art: 'fertig' };
    }
  }
  return { art: 'warten' };
}

/** Kennzeichen eines Kindes für die Forschungsauswertung (Ausschlussregeln 05 §6). */
export interface Teilnahme {
  /** Ton funktionierte: letzter Ton-Check ok und alle Darbietungen mit Ton hatten `audio_ok`. */
  audio_ok: boolean;
  hat_gelernt: boolean;
  lernen_abgebrochen: boolean;
}

export function teilnahme(ereignisse: readonly EventEnvelope[], daten: LerndetektiveDaten): Teilnahme {
  const ev = lerndetektiveEreignisse(ereignisse);
  const checks = ev.filter((e) => e.typ === 'audio_check');
  const letzterCheck = checks[checks.length - 1];
  const tonDarbietungen = ev.filter((e) => e.typ === 'item_gezeigt' && (e.payload.bedingung === 'wort' || e.payload.bedingung === 'bild_wort'));
  const audio_ok =
    (letzterCheck ? letzterCheck.payload.ok : false) && tonDarbietungen.every((e) => e.typ === 'item_gezeigt' && e.payload.audio_ok);
  const lernAbschluss = ev.find((e) => e.typ === 'phase_abgeschlossen' && e.payload.phase === 'lernen');
  return {
    audio_ok,
    hat_gelernt: gezeigtePositionen(ev).size > 0,
    lernen_abgebrochen: lernAbschluss?.typ === 'phase_abgeschlossen' ? lernAbschluss.payload.abgebrochen : lernenUnterbrochen(ereignisse, daten),
  };
}
