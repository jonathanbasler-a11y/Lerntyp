import type { EventEnvelope, PhaseFolge, PhaseHaupt, Rotation } from '@lerntyp/shared';

export interface Teilnehmer {
  alias: string;
  rotation: Rotation;
  seed: number;
  /** Nur Demo: Alias gehört zur simulierten Klasse. */
  simuliert: boolean;
}

export interface BeitrittsAntwort {
  sitzung: string;
  teilnehmer: Teilnehmer;
}

/** Stand der Sitzung: welche Stunde läuft und bis zu welcher Phase die Lehrkraft freigegeben hat. */
export type SitzungsStand =
  | { stunde: 'haupt'; sitzung: string; freigabe: PhaseHaupt; simuliert: boolean }
  | { stunde: 'folge'; sitzung: string; freigabe: PhaseFolge; simuliert: boolean };

/** Schnittstelle zwischen UI und Datenhaltung (03 §7.2). Demo: Mock-Adapter, Live: HTTP (ab Phase 3). */
export interface ApiClient {
  joinSession(code: string, alias: string): Promise<BeitrittsAntwort>;
  sendEvents(events: EventEnvelope[]): Promise<void>;
  getStand(): Promise<SitzungsStand>;
  /** Lehrkraft: Phase freigeben. */
  setFreigabe(freigabe: SitzungsStand['freigabe']): Promise<void>;
  /** Alle Ereignisse der Sitzungen, optional nur eines Alias. */
  getEvents(filter?: { alias?: string }): Promise<EventEnvelope[]>;
  listTeilnehmer(): Promise<Teilnehmer[]>;
  /** Demo: Folgestunde („Woche später“) starten, neue Sitzungs-ID. */
  starteFolgestunde(): Promise<void>;
  /** Benachrichtigung bei jeder Änderung; liefert die Abmeldefunktion. */
  abonniere(callback: () => void): () => void;
  /** Kennung des Adapters (Mock: Bundle-Marker, Live: „live“). */
  readonly kind: string;
}

/** Der Mock wird nur im Demo-Build geladen; im Live-Build entfällt der Zweig samt Chunk. */
export async function createApiClient(): Promise<ApiClient> {
  if (__DEMO__) {
    const { createMockClient } = await import('./mock');
    return createMockClient();
  }
  const { createLiveClient } = await import('./live');
  return createLiveClient();
}
