import { useState } from 'react';
import type { ApiClient } from '../api/client';
import { demo } from '../demoData';
import { useKlasse } from '../lerndetektive/hooks';
import { t } from '../text';
import { Beamer } from './cockpit/Beamer';
import { ProfilDruck } from './cockpit/ProfilDruck';
import { Profile } from './cockpit/Profile';
import { Steuerung } from './cockpit/Steuerung';

/** Lehrkraft-Cockpit: Sitzung steuern, Live-Status, Beamer-Ansicht. Jede Ansicht mit Kinderdaten trägt den verbindlichen Hinweis. */
export function Cockpit({ client, onZurueck, onZumKind }: { client: ApiClient; onZurueck: () => void; onZumKind: (() => void) | null }) {
  const [ansicht, setAnsicht] = useState<'steuern' | 'beamer' | 'profile'>('steuern');
  const [profilAlias, setProfilAlias] = useState<string | null>(null);
  const [druckAlias, setDruckAlias] = useState<string | null>(null);
  const klasse = useKlasse(client);

  if (druckAlias && klasse && klasse !== 'fehler') return <ProfilDruck klasse={klasse} alias={druckAlias} onZurueck={() => setDruckAlias(null)} />;

  return (
    <section className="screen screen-wide screen-cockpit" aria-labelledby="h" data-testid="cockpit">
      <h1 id="h">{t('cockpit.titel')}</h1>
      <p className="code">
        <span>{t('cockpit.code')}</span>
        <strong data-testid="sitzungscode">{demo.sitzungscode}</strong>
      </p>
      <div className="row row-links" role="group" aria-label={t('cockpit.ansicht')}>
        <button type="button" className="btn btn-secondary" aria-pressed={ansicht === 'steuern'} onClick={() => setAnsicht('steuern')} data-testid="tab-steuern">
          {t('cockpit.tab.steuern')}
        </button>
        <button type="button" className="btn btn-secondary" aria-pressed={ansicht === 'beamer'} onClick={() => setAnsicht('beamer')} data-testid="tab-beamer">
          {t('cockpit.tab.beamer')}
        </button>
        <button type="button" className="btn btn-secondary" aria-pressed={ansicht === 'profile'} onClick={() => setAnsicht('profile')} data-testid="tab-profile">
          {t('cockpit.tab.profile')}
        </button>
      </div>

      {klasse === 'fehler' && <p className="hint">{t('cockpit.live_folgt')}</p>}
      {klasse === null && <p className="hint">{t('kind.laedt.text')}</p>}
      {klasse && klasse !== 'fehler' && ansicht === 'steuern' && <Steuerung client={client} klasse={klasse} />}
      {klasse && klasse !== 'fehler' && ansicht === 'beamer' && <Beamer klasse={klasse} />}
      {klasse && klasse !== 'fehler' && ansicht === 'profile' && <Profile klasse={klasse} alias={profilAlias} onAlias={setProfilAlias} onDruck={setDruckAlias} />}

      <p className="notice" role="note" data-testid="hinweis-lernbegleitung">
        {t('hinweis.lernbegleitung')}
      </p>
      <div className="row row-links">
        {onZumKind && (
          <button type="button" className="btn btn-primary" onClick={onZumKind} data-testid="cockpit-zum-kind">
            {t('cockpit.zum_kind')}
          </button>
        )}
        <button type="button" className="btn btn-quiet" onClick={onZurueck}>
          {t('cockpit.zurueck')}
        </button>
      </div>
    </section>
  );
}
