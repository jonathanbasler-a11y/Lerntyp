import {
  PHASEN_FOLGE,
  PHASEN_HAUPT,
  neuerSeed,
  parseEvent,
  rotationFuerBeitritt,
  type EventEnvelope,
} from '@lerntyp/shared';
import type { ApiClient, SitzungsStand, Teilnehmer } from './client';
import { demo } from '../demoData';
import { daten } from '../lerndetektive/daten';
import { naechsteSeq } from '../lerndetektive/sender';
import { erzeugeSimKinder, simParameter, simuliereKind, simZeitbasis, type SimKind } from '../demo/simulation';

/** Marker für die Bundle-Prüfung (npm run check:live): darf nie im Live-Build stehen. */
export const MOCK_MARKER = 'LERNTYP_MOCK_ADAPTER';

/** In-Memory-Zustand der Demo; nichts wird gespeichert oder gesendet. */
interface Zustand {
  stand: SitzungsStand;
  ereignisse: EventEnvelope[];
  teilnehmer: Map<string, Teilnehmer>;
  simKinder: SimKind[];
  basis: ReturnType<typeof simZeitbasis>;
  hoerer: Set<() => void>;
}

const sitzungsId = (stunde: 'haupt' | 'folge') => `demo-${demo.sitzungscode}-${stunde}`;

function neuerZustand(): Zustand {
  const simKinder = erzeugeSimKinder(simParameter);
  const z: Zustand = {
    stand: { stunde: 'haupt', sitzung: sitzungsId('haupt'), freigabe: PHASEN_HAUPT[0], simuliert: true },
    ereignisse: [],
    teilnehmer: new Map(
      simKinder.map((k) => [k.alias, { alias: k.alias, rotation: k.rotation, seed: k.seed, simuliert: true } satisfies Teilnehmer]),
    ),
    simKinder,
    basis: simZeitbasis(Date.now()),
    hoerer: new Set(),
  };
  laufeSimulation(z);
  return z;
}

let zustand = neuerZustand();

/** Nur für Tests: Demo-Zustand zurücksetzen. */
export function setzeDemoZurueck(): void {
  zustand = neuerZustand();
}
export function demoEreignisse(): readonly EventEnvelope[] {
  return zustand.ereignisse;
}

/** Lässt alle simulierten Kinder bis zur aktuellen Freigabe weiterarbeiten (echte Ablauf-Logik). */
function laufeSimulation(z: Zustand): void {
  for (const kind of z.simKinder) {
    const bisher = z.ereignisse.filter((e) => e.teilnehmer_alias === kind.alias);
    z.ereignisse.push(...simuliereKind(kind, z.stand, bisher, daten, simParameter, z.basis));
  }
}

function melde(z: Zustand): void {
  for (const h of z.hoerer) h();
}

export function createMockClient(): ApiClient {
  return {
    kind: MOCK_MARKER,
    async joinSession(_code, alias) {
      const z = zustand;
      let teilnehmer = z.teilnehmer.get(alias);
      if (!teilnehmer) {
        teilnehmer = { alias, rotation: rotationFuerBeitritt(z.teilnehmer.size), seed: neuerSeed(), simuliert: false };
        z.teilnehmer.set(alias, teilnehmer);
      }
      const sitzung = z.stand.sitzung;
      if (!z.ereignisse.some((e) => e.typ === 'beitritt' && e.sitzung === sitzung && e.teilnehmer_alias === alias)) {
        await this.sendEvents([
          {
            id: crypto.randomUUID(),
            sitzung,
            teilnehmer_alias: alias,
            modul: 'start',
            typ: 'beitritt',
            zeitstempel: new Date().toISOString(),
            client_seq: naechsteSeq(z.ereignisse, sitzung, alias),
            payload: {},
          },
        ]);
      }
      return { sitzung, teilnehmer };
    },
    async sendEvents(events) {
      for (const ev of events) zustand.ereignisse.push(parseEvent(ev));
      melde(zustand);
    },
    async getStand() {
      return zustand.stand;
    },
    async setFreigabe(freigabe) {
      const z = zustand;
      const erlaubt: readonly string[] = z.stand.stunde === 'haupt' ? PHASEN_HAUPT : PHASEN_FOLGE;
      if (!erlaubt.includes(freigabe)) throw new Error(`Phase „${freigabe}“ gehört nicht zur laufenden Stunde`);
      z.stand = { ...z.stand, freigabe } as SitzungsStand;
      laufeSimulation(z);
      melde(z);
    },
    async getEvents(filter) {
      const alias = filter?.alias;
      return alias ? zustand.ereignisse.filter((e) => e.teilnehmer_alias === alias) : [...zustand.ereignisse];
    },
    async listTeilnehmer() {
      return [...zustand.teilnehmer.values()];
    },
    async starteFolgestunde() {
      const z = zustand;
      z.stand = { stunde: 'folge', sitzung: sitzungsId('folge'), freigabe: PHASEN_FOLGE[0], simuliert: true };
      laufeSimulation(z);
      melde(z);
    },
    abonniere(callback) {
      zustand.hoerer.add(callback);
      return () => zustand.hoerer.delete(callback);
    },
  };
}
