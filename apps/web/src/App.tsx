import { useEffect, useRef, useState } from 'react';
import type { ApiClient } from './api/client';
import { createApiClient } from './api/client';
import { DemoBanner } from './components/DemoBanner';
import { Ablauf } from './screens/Ablauf';
import { Cockpit } from './screens/Cockpit';
import { Fertig } from './screens/Fertig';
import { Lernausweis } from './screens/Lernausweis';
import { Start } from './screens/Start';
import { demo } from './demoData';

export type Screen = 'start' | 'lernausweis' | 'ablauf' | 'fertig' | 'cockpit';

export function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [alias, setAlias] = useState<string | null>(null);
  const client = useRef<Promise<ApiClient> | null>(null);

  useEffect(() => {
    client.current = createApiClient();
  }, []);

  const waehleAlias = async (a: string) => {
    setAlias(a);
    try {
      const c = await (client.current ??= createApiClient());
      await c.joinSession(demo.sitzungscode, a);
    } catch {
      // Demo läuft auch ohne Aufzeichnung weiter.
    }
    setScreen('ablauf');
  };

  const zumStart = () => {
    setAlias(null);
    setScreen('start');
  };

  return (
    <div className="app">
      {__DEMO__ && <DemoBanner />}
      <main className="main">
        {screen === 'start' && <Start onKind={() => setScreen('lernausweis')} onLehrkraft={() => setScreen('cockpit')} />}
        {screen === 'lernausweis' && <Lernausweis onWaehle={waehleAlias} onZurueck={zumStart} />}
        {screen === 'ablauf' && alias && <Ablauf onFertig={() => setScreen('fertig')} onZurueck={() => setScreen('lernausweis')} />}
        {screen === 'fertig' && <Fertig onZumStart={zumStart} />}
        {screen === 'cockpit' && <Cockpit onZurueck={zumStart} />}
      </main>
    </div>
  );
}
