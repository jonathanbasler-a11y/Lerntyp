import { useEffect, useRef, useState } from 'react';
import type { EventEnvelope } from '@lerntyp/shared';
import type { ApiClient, SitzungsStand, Teilnehmer } from '../api/client';

export interface Klasse {
  stand: SitzungsStand;
  teilnehmer: Teilnehmer[];
  ereignisse: EventEnvelope[];
}

/** Lädt Stand, Teilnehmende und Ereignisse neu, sobald sich im Adapter etwas ändert. `null` = lädt, `'fehler'` = nicht verfügbar. */
export function useKlasse(client: ApiClient): Klasse | null | 'fehler' {
  const [klasse, setKlasse] = useState<Klasse | null | 'fehler'>(null);
  const zaehler = useRef(0);

  useEffect(() => {
    let aktiv = true;
    const laden = async () => {
      const nr = ++zaehler.current;
      try {
        const [stand, teilnehmer, ereignisse] = await Promise.all([client.getStand(), client.listTeilnehmer(), client.getEvents()]);
        if (aktiv && nr === zaehler.current) setKlasse({ stand, teilnehmer, ereignisse });
      } catch {
        if (aktiv) setKlasse('fehler');
      }
    };
    void laden();
    let abmelden: () => void = () => undefined;
    try {
      abmelden = client.abonniere(() => void laden());
    } catch {
      // Live-Adapter folgt in P3.
    }
    return () => {
      aktiv = false;
      abmelden();
    };
  }, [client]);

  return klasse;
}

/** Nur der Sitzungsstand (für die Demo-Steuerleiste). */
export function useStand(client: ApiClient): SitzungsStand | null {
  const [stand, setStand] = useState<SitzungsStand | null>(null);
  useEffect(() => {
    let aktiv = true;
    const laden = () => client.getStand().then((s) => aktiv && setStand(s), () => undefined);
    void laden();
    let abmelden: () => void = () => undefined;
    try {
      abmelden = client.abonniere(() => void laden());
    } catch {
      // Live-Adapter folgt in P3.
    }
    return () => {
      aktiv = false;
      abmelden();
    };
  }, [client]);
  return stand;
}

/** Reaktionszeit ab dem Moment, in dem der Bildschirm sichtbar ist (rt_ms, 02 §9). */
export function useReaktionszeit(): () => number {
  const start = useRef(0);
  useEffect(() => {
    start.current = performance.now();
  }, []);
  return () => Math.max(0, Math.round(performance.now() - start.current));
}
