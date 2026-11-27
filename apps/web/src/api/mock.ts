import { parseEvent, type EventEnvelope } from '@lerntyp/shared';
import type { ApiClient } from './client';

/** Marker für die Bundle-Prüfung (npm run check:live): darf nie im Live-Build stehen. */
export const MOCK_MARKER = 'LERNTYP_MOCK_ADAPTER';

/** In-Memory-Store; nichts wird gespeichert oder gesendet. */
export const mockStore: EventEnvelope[] = [];

export function createMockClient(): ApiClient {
  const seq = new Map<string, number>();
  return {
    kind: MOCK_MARKER,
    async joinSession(code, alias) {
      const sitzung = `demo-${code}`;
      const key = `${sitzung}/${alias}`;
      const n = seq.get(key) ?? 0;
      seq.set(key, n + 1);
      await this.sendEvents([
        {
          id: crypto.randomUUID(),
          sitzung,
          teilnehmer_alias: alias,
          modul: 'start',
          typ: 'beitritt',
          zeitstempel: new Date().toISOString(),
          client_seq: n,
          payload: {},
        },
      ]);
      return { sitzung };
    },
    async sendEvents(events) {
      for (const ev of events) mockStore.push(parseEvent(ev));
    },
  };
}
