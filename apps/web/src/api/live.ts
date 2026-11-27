import type { ApiClient } from './client';

export function createLiveClient(): ApiClient {
  const nichtVerfuegbar = () => Promise.reject(new Error('Live-Adapter folgt in Phase 3'));
  return { kind: 'live', joinSession: nichtVerfuegbar, sendEvents: nichtVerfuegbar };
}
