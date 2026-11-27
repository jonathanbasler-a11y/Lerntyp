import type { ApiClient } from './client';

export function createLiveClient(): ApiClient {
  const nichtVerfuegbar = () => Promise.reject(new Error('Live-Adapter kommt in P3'));
  return {
    kind: 'live',
    joinSession: nichtVerfuegbar,
    sendEvents: nichtVerfuegbar,
    getStand: nichtVerfuegbar,
    setFreigabe: nichtVerfuegbar,
    getEvents: nichtVerfuegbar,
    listTeilnehmer: nichtVerfuegbar,
    starteFolgestunde: nichtVerfuegbar,
    abonniere: () => {
      throw new Error('Live-Adapter kommt in P3');
    },
  };
}
