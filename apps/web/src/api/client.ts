import type { EventEnvelope } from '@lerntyp/shared';

export interface BeitrittsAntwort {
  sitzung: string;
}

/** Schnittstelle zwischen UI und Datenhaltung (03 §7.2). Demo: Mock-Adapter, Live: HTTP (ab Phase 3). */
export interface ApiClient {
  joinSession(code: string, alias: string): Promise<BeitrittsAntwort>;
  sendEvents(events: EventEnvelope[]): Promise<void>;
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
