import {
  STRATEGIEN,
  ableitenSeed,
  berechneProfil,
  erzeugeZufall,
  rotationFuerBeitritt,
  type Bedingung,
  type EventEnvelope,
  type LerndetektiveDaten,
  type Rotation,
  type Zufall,
} from '@lerntyp/shared';
import simulationRoh from '@data/demo/simulation.json';
import type { SitzungsStand } from '../api/client';
import { berechneSchritt } from '../lerndetektive/schritt';
import { kartenDaten, parcoursDaten } from '../parcours/daten';
import { EreignisSender, naechsteSeq } from '../lerndetektive/sender';

/**
 * Simulierte Klasse für die Demo (nur `__DEMO__`): erfundene Aliasse, deren Ereignisse entstehen,
 * indem die echte Ablauf-Logik (`naechsterSchritt`) Schritt für Schritt durchlaufen und
 * zufällig beantwortet wird. Das ist kein Forschungsergebnis.
 */
export interface SimParameter {
  seed: number;
  kinder: string[];
  vermutung_verteilung: Record<Bedingung, number>;
  treffer_sofort: Record<Bedingung, number>;
  treffer_verzoegert: Record<Bedingung, number>;
  fehlalarm: number;
  streuung: number;
  fehlt_in_folgestunde: number;
}
export const simParameter = simulationRoh as SimParameter;

export interface SimKind {
  alias: string;
  index: number;
  rotation: Rotation;
  seed: number;
  vermutung: Bedingung;
  /** Persönlicher Versatz der Trefferwahrscheinlichkeit (−streuung … +streuung). */
  faehigkeit: number;
  /** Kind fehlt in der Folgestunde. */
  fehlt: boolean;
  /** Synthetisches Verhalten im Strategie-Parcours (Wahrscheinlichkeiten; kein Forschungsergebnis). */
  parcours: ParcoursNeigung;
}

export interface ParcoursNeigung {
  /** Öffnet das Musterbeispiel bei der ersten Aufgabe einer Station. */
  beispiel: number;
  /** Holt sich bei einer Aufgabe Hinweis 1. */
  hinweis: number;
  /** Erster Versuch richtig. */
  richtig: number;
  /** Zweiter Versuch (nach einem Fehler) richtig. */
  zweiteRichtig: number;
  /** Tippt „Was hat geholfen?“ mit Strategien an. */
  begruendet: number;
  /** Bevorzugte Strategien bei „Was hat geholfen?“. */
  vorlieben: readonly (typeof STRATEGIEN)[number][];
}

export interface SimZeitbasis {
  haupt: number;
  folge: number;
}

const TAG_MS = 24 * 3600 * 1000;
export function simZeitbasis(jetzt: number): SimZeitbasis {
  return { haupt: jetzt - 8 * TAG_MS, folge: jetzt - 1 * TAG_MS };
}

const clamp01 = (x: number) => Math.min(0.97, Math.max(0.03, x));

export function erzeugeSimKinder(p: SimParameter): SimKind[] {
  const z = erzeugeZufall(ableitenSeed(p.seed, 'kinder'));
  const vermutungen: Bedingung[] = [
    ...Array<Bedingung>(p.vermutung_verteilung.wort).fill('wort'),
    ...Array<Bedingung>(p.vermutung_verteilung.bild).fill('bild'),
    ...Array<Bedingung>(p.vermutung_verteilung.bild_wort).fill('bild_wort'),
  ];
  // Verteilung auf die Kinder mischen, damit Vermutung und Rotation nicht zusammenfallen.
  for (let i = vermutungen.length - 1; i > 0; i--) {
    const j = Math.floor(z() * (i + 1));
    [vermutungen[i], vermutungen[j]] = [vermutungen[j]!, vermutungen[i]!];
  }
  // Eigener Zufallsstrom: die Werte oben bleiben dadurch unverändert.
  const zp = erzeugeZufall(ableitenSeed(p.seed, 'parcours'));
  const neigung = (): ParcoursNeigung => ({
    beispiel: 0.15 + zp() * 0.75,
    hinweis: 0.15 + zp() * 0.7,
    richtig: 0.45 + zp() * 0.45,
    zweiteRichtig: 0.5 + zp() * 0.45,
    begruendet: 0.5 + zp() * 0.5,
    vorlieben: STRATEGIEN.filter(() => zp() < 0.3),
  });
  return p.kinder.map((alias, index) => ({
    alias,
    index,
    rotation: rotationFuerBeitritt(index),
    seed: ableitenSeed(p.seed, `seed:${alias}`),
    vermutung: vermutungen[index]!,
    faehigkeit: (z() * 2 - 1) * p.streuung,
    fehlt: index >= p.kinder.length - p.fehlt_in_folgestunde,
    parcours: neigung(),
  }));
}

function gewichtet<T>(z: Zufall, optionen: readonly (readonly [T, number])[]): T {
  const summe = optionen.reduce((s, [, w]) => s + w, 0);
  let r = z() * summe;
  for (const [wert, w] of optionen) {
    r -= w;
    if (r < 0) return wert;
  }
  return optionen[optionen.length - 1]![0];
}

/**
 * Lässt ein simuliertes Kind alle Schritte bis zum nächsten Warten durchlaufen
 * und liefert die neuen Ereignisse. `bisher` = alle Ereignisse dieses Kindes.
 */
export function simuliereKind(
  kind: SimKind,
  stand: SitzungsStand,
  bisher: readonly EventEnvelope[],
  daten: LerndetektiveDaten,
  p: SimParameter,
  basis: SimZeitbasis,
): EventEnvelope[] {
  if (stand.stunde === 'folge' && kind.fehlt) return [];
  const z = erzeugeZufall(ableitenSeed(p.seed + kind.index * 7919, `${stand.sitzung}:${bisher.length}`));
  const takt = daten.ablauf.darbietung_ms + daten.ablauf.leer_ms;
  const letzter = bisher.reduce((m, e) => Math.max(m, Date.parse(e.zeitstempel)), 0);
  let zeit = Math.max(stand.stunde === 'haupt' ? basis.haupt : basis.folge, letzter);
  const alle = [...bisher];
  const neu: EventEnvelope[] = [];
  const sender = new EreignisSender({
    sitzung: stand.sitzung,
    alias: kind.alias,
    startSeq: naechsteSeq(bisher, stand.sitzung, kind.alias),
    jetzt: () => new Date(zeit),
    neueId: () => `sim-${kind.alias}-${stand.sitzung}-${alle.length}`,
  });
  const senden = (typ: string, payload: Record<string, unknown>, dt: number, modul?: EventEnvelope['modul']) => {
    zeit += dt;
    const ev = sender.erzeuge(typ, payload, modul);
    alle.push(ev);
    neu.push(ev);
  };
  const rt = () => Math.round(700 + z() * 1100);

  // Audio-Check zu Beginn jeder Sitzung (Ton in der Demo: ok).
  if (!bisher.some((e) => e.typ === 'audio_check' && e.sitzung === stand.sitzung)) senden('audio_check', { ok: true }, 1000);
  if (!bisher.some((e) => e.typ === 'rotation_zugewiesen')) senden('rotation_zugewiesen', { rotation: kind.rotation, seed: kind.seed }, 500);

  for (let i = 0; i < 2000; i++) {
    const s = berechneSchritt(stand, kind, alle, daten);
    switch (s.art) {
      case 'ueberzeugung': {
        const richtung = daten.ueberzeugungen.find((u) => u.id === s.item_id)?.richtung ?? 'mythos';
        const gewichte: Record<string, [number, number, number]> = {
          'mythos:vorher': [0.4, 0.35, 0.25],
          'mythos:nachher': [0.2, 0.6, 0.2],
          'wachstum:vorher': [0.45, 0.3, 0.25],
          'wachstum:nachher': [0.7, 0.1, 0.2],
        };
        const g = gewichte[`${richtung}:${s.zeitpunkt}`]!;
        const antwort = gewichtet(z, [['stimmt', g[0]], ['stimmt_nicht', g[1]], ['weiss_nicht', g[2]]] as const);
        senden('ueberzeugung_beantwortet', { item_id: s.item_id, antwort, zeitpunkt: s.zeitpunkt, rt_ms: rt() }, 2500);
        break;
      }
      case 'vorliebe': {
        const antwort: Bedingung =
          s.item_id === 'V4' ? kind.vermutung : gewichtet(z, [['wort', 1], ['bild', 1], ['bild_wort', 1]] as const);
        senden('vorliebe_beantwortet', { item_id: s.item_id, antwort, rt_ms: rt() }, 3000);
        break;
      }
      case 'lernen':
        senden('item_gezeigt', { ...s.eintrag, audio_ok: true }, takt);
        break;
      case 'pause_aufgabe':
        senden('phase_abgeschlossen', { phase: 'pause', abgebrochen: false }, daten.ablauf.pause_aufgabe_ms);
        break;
      case 'test': {
        const trefferTabelle = s.test === 'sofort' ? p.treffer_sofort : p.treffer_verzoegert;
        const wahrscheinlichkeit = s.eintrag.alt
          ? clamp01(trefferTabelle[s.eintrag.bedingung!] + kind.faehigkeit)
          : clamp01(p.fehlalarm + kind.faehigkeit / 2);
        senden(
          'antwort_abgegeben',
          {
            item_id: s.eintrag.item_id,
            test: s.test,
            alt: s.eintrag.alt,
            antwort: z() < wahrscheinlichkeit ? 'dabei' : 'nicht_dabei',
            rt_ms: rt(),
            position: s.eintrag.position,
          },
          rt(),
        );
        break;
      }
      case 'abschliessen':
        senden('phase_abgeschlossen', { phase: s.phase, abgebrochen: s.abgebrochen }, 500);
        break;
      case 'superkraft':
        senden('superkraft_ausprobiert', { antwort: gewichtet(z, [['ja', 5], ['ein_bisschen', 3], ['nein', 1]] as const) }, 3000);
        break;
      case 'parcours': {
        const { station, schritt: st } = s;
        const n = kind.parcours;
        const pc = (typ: string, payload: Record<string, unknown>, dt: number) => senden(typ, { station, ...payload }, dt, 'parcours');
        switch (st.art) {
          case 'planen_ziel':
            pc('ziel_gesetzt', { ziel: 2 + Math.floor(z() * 4) }, 3000);
            break;
          case 'planen_sicherheit':
            pc('sicherheit_vorher', { smiley: 1 + Math.floor(z() * 4) }, 2500);
            break;
          case 'aufgabe': {
            const ref = { aufgabe_id: st.aufgabe_id };
            if (st.zeigen) pc('aufgabe_gezeigt', ref, 400);
            else if (st.nummer === 1 && !st.beispiel_geoeffnet && st.versuch === 1 && z() < n.beispiel) pc('beispiel_geoeffnet', ref, 4000);
            else if (st.hinweis_stufe === 0 && st.versuch === 1 && z() < n.hinweis / 3) pc('hinweis_genutzt', { ...ref, stufe: 1 }, 3000);
            else {
              const korrekt = z() < (st.versuch === 1 ? n.richtig : n.zweiteRichtig);
              const aufgabe = parcoursDaten[station].aufgaben.find((a) => a.id === st.aufgabe_id);
              const grund = aufgabe && 'grund' in aufgabe ? { begruendung: korrekt ? aufgabe.grund.art : z() < 0.5 ? 'verlaengern' : 'ableiten' } : {};
              pc('antwort_abgegeben', { ...ref, korrekt, versuch: st.versuch, rt_ms: Math.round(2500 + z() * 9000), ...grund }, 6000);
            }
            break;
          }
          case 'pruefen': {
            const gewaehlt = z() < n.begruendet ? (n.vorlieben.length > 0 ? n.vorlieben : [STRATEGIEN[Math.floor(z() * STRATEGIEN.length)]!]) : [];
            pc('hilfreich_gewaehlt', { strategien: gewaehlt }, 4000);
            break;
          }
        }
        break;
      }
      case 'profil_zeigen': {
        const profil = berechneProfil(alle, kartenDaten);
        senden('profil_angezeigt', { karten_ids: profil.karten_ids, superkraft: profil.superkraft }, 1500, 'profil');
        break;
      }
      case 'profil_passt':
        senden('profil_passt', { smiley: gewichtet(z, [[1, 1], [2, 2], [3, 4], [4, 4]] as const) }, 3000, 'profil');
        break;
      default:
        return neu;
    }
  }
  throw new Error('Simulation endet nicht');
}
