import { STATIONEN, STRATEGIEN, type EventEnvelope, type Strategie } from '../events';
import { parcoursEreignisse } from '../parcours/ablauf';
import type { KartenDaten, ProfilStation, Verhalten } from './daten';

/**
 * Ableitung von „Mein Lernprofil“ (01 §7.4, 03 §4.6). Deterministisch, ohne Zufall.
 *
 * WICHTIG: Es zählt ausschließlich **Verhalten** (Ziel gesetzt, Beispiel geöffnet, Hinweis genutzt,
 * zweiter Versuch, Begründung gewählt, „Was hat geholfen?“ beantwortet, Teilnahme an den Lerndetektiven).
 * Die Felder `korrekt`, Abstand Ziel ↔ Ergebnis und die Zuversicht-Kalibrierung (`sicherheit_vorher`)
 * werden hier nie gelesen; sie bleiben Forschungsdaten.
 */

export const REGELVERSION = 'profil-1.0';
export const MAX_KARTEN = 3;

/** Priorität der Verhaltensweisen bei der Kartenauswahl (feste Reihenfolge). */
export const PRIORITAET: readonly Verhalten[] = ['zweiter_versuch', 'beispiel', 'begruendung', 'hinweis', 'ziel', 'geholfen', 'teilnahme'];
/** Reihenfolge der Stationen bei der Kartenauswahl. */
const STATIONEN_REIHE: readonly ProfilStation[] = ['s1', 's2', 's3', 'lerndetektive'];
/** Tie-Break für die Superkraft: bei gleicher Evidenz gewinnt die frühere Strategie. */
export const SUPERKRAFT_REIHENFOLGE: readonly Strategie[] = ['gedaechtnis_training', 'warum_fragen', 'beispiele', 'mischen', 'haeppchen_lernen', 'doppelt_merken'];

export type Indikatoren = Record<Verhalten, Record<ProfilStation, boolean>> & { _begruendungen: number; _arten: number };

export interface Profil {
  regelversion: string;
  /** Höchstens drei Karten-IDs aus karten.json, höchstens eine je Station; oder `['fallback']`. */
  karten_ids: string[];
  /** Strategie mit der geringsten Evidenz (Lern-Superkraft). */
  superkraft: Strategie;
  fallback: boolean;
}

function leer(): Indikatoren {
  const zeile = () => ({ s1: false, s2: false, s3: false, lerndetektive: false });
  return {
    zweiter_versuch: zeile(),
    beispiel: zeile(),
    begruendung: zeile(),
    hinweis: zeile(),
    ziel: zeile(),
    geholfen: zeile(),
    teilnahme: zeile(),
    _begruendungen: 0,
    _arten: 0,
  };
}

/** Verhaltensindikatoren je Station aus den Ereignissen (nur Verhalten, nie Richtigkeit). */
export function indikatoren(ereignisse: readonly EventEnvelope[]): Indikatoren {
  const ind = leer();
  const arten = new Set<string>();
  for (const station of STATIONEN) {
    for (const e of parcoursEreignisse(ereignisse, station)) {
      switch (e.typ) {
        case 'ziel_gesetzt':
          ind.ziel[station] = true;
          break;
        case 'beispiel_geoeffnet':
          ind.beispiel[station] = true;
          break;
        case 'hinweis_genutzt':
          ind.hinweis[station] = true;
          break;
        case 'antwort_abgegeben':
          if (e.payload.versuch === 2) ind.zweiter_versuch[station] = true;
          if (station === 's1' && e.payload.begruendung !== undefined) {
            ind.begruendung.s1 = true;
            ind._begruendungen++;
            arten.add(e.payload.begruendung);
          }
          break;
        case 'hilfreich_gewaehlt':
          if (e.payload.strategien.length > 0) ind.geholfen[station] = true;
          break;
        default:
          break;
      }
    }
  }
  ind._arten = arten.size;
  // Teilnahme an den Lerndetektiven: Lernphase oder Sofort-Test regulär abgeschlossen.
  ind.teilnahme.lerndetektive = ereignisse.some(
    (e) => e.modul === 'lerndetektive' && e.typ === 'phase_abgeschlossen' && (e.payload['phase'] === 'lernen' || e.payload['phase'] === 'sofort_test') && e.payload['abgebrochen'] === false,
  );
  return ind;
}

/** Vom Kind als hilfreich genannte Strategien (Zählung je Strategie über alle Stationen). */
function genannte(ereignisse: readonly EventEnvelope[]): Record<Strategie, number> {
  const n = Object.fromEntries(STRATEGIEN.map((s) => [s, 0])) as Record<Strategie, number>;
  for (const station of STATIONEN)
    for (const e of parcoursEreignisse(ereignisse, station)) if (e.typ === 'hilfreich_gewaehlt') for (const s of new Set(e.payload.strategien)) n[s]++;
  return n;
}

const anzahl = (z: Record<ProfilStation, boolean>, stationen: readonly ProfilStation[] = STATIONEN_REIHE) => stationen.filter((s) => z[s]).length;

/** Beobachtete Evidenz je Strategie (ganze Zahlen; mehr = häufiger gezeigt). */
export function evidenz(ereignisse: readonly EventEnvelope[]): Record<Strategie, number> {
  const ind = indikatoren(ereignisse);
  const g = genannte(ereignisse);
  return {
    gedaechtnis_training: anzahl(ind.zweiter_versuch) + g.gedaechtnis_training,
    haeppchen_lernen: anzahl(ind.ziel) + g.haeppchen_lernen,
    doppelt_merken: (ind.teilnahme.lerndetektive ? 1 : 0) + g.doppelt_merken,
    mischen: ind._arten + g.mischen,
    warum_fragen: Math.min(ind._begruendungen, 3) + g.warum_fragen,
    beispiele: anzahl(ind.beispiel) + g.beispiele,
  };
}

export function waehleSuperkraft(ev: Record<Strategie, number>): Strategie {
  const min = Math.min(...SUPERKRAFT_REIHENFOLGE.map((s) => ev[s]));
  return SUPERKRAFT_REIHENFOLGE.find((s) => ev[s] === min)!;
}

/** Kartenauswahl: je Verhalten in Prioritätsreihenfolge die erste freie Station; zweiter Durchgang füllt auf. */
export function waehleKarten(ind: Indikatoren, karten: KartenDaten): string[] {
  const vorhanden = new Set(karten.karten.map((k) => k.id));
  const gewaehlt: string[] = [];
  const belegt = new Set<ProfilStation>();
  const nimm = (v: Verhalten, st: ProfilStation) => {
    const id = `${v}.${st}`;
    if (gewaehlt.length >= MAX_KARTEN || belegt.has(st) || !ind[v][st] || !vorhanden.has(id)) return false;
    gewaehlt.push(id);
    belegt.add(st);
    return true;
  };
  for (const v of PRIORITAET) for (const st of STATIONEN_REIHE) if (nimm(v, st)) break;
  for (const v of PRIORITAET) for (const st of STATIONEN_REIHE) nimm(v, st);
  return gewaehlt;
}

/**
 * Berechnet das Profil. Ohne jede Verhaltensspur (z. B. abgebrochene Sitzung) erscheint die
 * allgemeine ermutigende Karte (`karten_ids = ['fallback']`); die Superkraft folgt dann dem Tie-Break.
 */
export function berechneProfil(ereignisse: readonly EventEnvelope[], karten: KartenDaten): Profil {
  const ids = waehleKarten(indikatoren(ereignisse), karten);
  return {
    regelversion: REGELVERSION,
    karten_ids: ids.length > 0 ? ids : [karten.fallback.id],
    superkraft: waehleSuperkraft(evidenz(ereignisse)),
    fallback: ids.length === 0,
  };
}

export interface ProfilAnzeige {
  karten: { id: string; station: ProfilStation | null; text: string }[];
  superkraft: { strategie: Strategie; text: string };
  tipp: string;
}

/** Löst ein Profil in anzeigbare Texte aus karten.json auf. */
export function profilAnzeige(profil: Pick<Profil, 'karten_ids' | 'superkraft'>, karten: KartenDaten): ProfilAnzeige {
  const nachId = new Map(karten.karten.map((k) => [k.id, k] as const));
  return {
    karten: profil.karten_ids.map((id) => {
      const k = nachId.get(id);
      return k ? { id, station: k.station, text: k.text } : { id, station: null, text: karten.fallback.text };
    }),
    superkraft: { strategie: profil.superkraft, text: karten.superkraft[profil.superkraft] },
    tipp: karten.tipps[profil.superkraft],
  };
}

