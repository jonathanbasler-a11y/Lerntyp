import { useEffect, useState } from 'react';
import type { ApiClient } from './api/client';
import { createApiClient } from './api/client';
import { DemoBanner } from './components/DemoBanner';
import { DemoSteuerung } from './components/DemoSteuerung';
import { Cockpit } from './screens/Cockpit';
import { Kind } from './screens/Kind';
import { Lernausweis } from './screens/Lernausweis';
import { Start } from './screens/Start';
import { t } from './text';

export type Screen = 'start' | 'lernausweis' | 'kind' | 'cockpit';

export function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [alias, setAlias] = useState<string | null>(null);
  const [client, setClient] = useState<ApiClient | null>(null);

  useEffect(() => {
    let aktiv = true;
    void createApiClient().then((c) => aktiv && setClient(c));
    return () => {
      aktiv = false;
    };
  }, []);

  const zumStart = () => {
    setAlias(null);
    setScreen('start');
  };

  return (
    <div className={__DEMO__ && screen === 'kind' ? 'app app-mit-demoleiste' : 'app'}>
      {__DEMO__ && <DemoBanner />}
      <main className="main">
        {screen === 'start' && <Start onKind={() => setScreen('lernausweis')} onLehrkraft={() => setScreen('cockpit')} />}
        {screen === 'lernausweis' && (
          <Lernausweis
            onWaehle={(a) => {
              setAlias(a);
              setScreen('kind');
            }}
            onZurueck={zumStart}
          />
        )}
        {screen === 'kind' && alias && client && <Kind key={alias} client={client} alias={alias} onZumStart={zumStart} />}
        {screen === 'cockpit' && client && <Cockpit client={client} onZurueck={zumStart} onZumKind={alias ? () => setScreen('kind') : null} />}
        {(screen === 'kind' || screen === 'cockpit') && !client && <p className="hint">{t('kind.laedt.text')}</p>}
      </main>
      {__DEMO__ && screen === 'kind' && client && <DemoSteuerung client={client} onLehrkraft={() => setScreen('cockpit')} onStart={zumStart} />}
    </div>
  );
}
