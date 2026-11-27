import { useEffect, useRef, useState } from 'react';
import { PHASEN_FOLGE, PHASEN_STUNDE } from '@lerntyp/shared';
import type { ApiClient } from '../api/client';
import { useStand } from '../lerndetektive/hooks';
import { t, type TextKey } from '../text';

export const phaseLabel = (phase: string): string => t(`phase.${phase}` as TextKey);

/** Schreibt die Höhe der Leiste in `--demo-hoehe`, damit der Inhalt darüber genau so viel Platz reserviert bekommt. */
function useLeistenHoehe() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const messen = () => root.style.setProperty('--demo-hoehe', `${Math.ceil(el.getBoundingClientRect().height)}px`);
    messen();
    const beobachter = new ResizeObserver(messen);
    beobachter.observe(el);
    return () => {
      beobachter.disconnect();
      root.style.removeProperty('--demo-hoehe');
    };
  });
  return ref;
}

/**
 * Nur Demo: Es gibt kein Lehrkraft-Gerät, deshalb gibt diese Leiste die nächste Phase frei.
 * Deutlich als Demo-Steuerung gekennzeichnet; nicht Teil der Kinder-Bildschirme.
 * Unter 600 px: einzeilig und einklappbar.
 */
export function DemoSteuerung({ client, onLehrkraft, onStart }: { client: ApiClient; onLehrkraft: () => void; onStart: () => void }) {
  const stand = useStand(client);
  const [eingeklappt, setEingeklappt] = useState(false);
  const ref = useLeistenHoehe();
  if (!stand) return null;
  const phasen: readonly string[] = stand.stunde === 'haupt' ? PHASEN_STUNDE : PHASEN_FOLGE;
  const index = phasen.indexOf(stand.freigabe);
  const naechste = phasen[index + 1];
  const letzteHaupt = stand.stunde === 'haupt' && naechste === undefined;
  const freigeben = () => {
    if (naechste) void client.setFreigabe(naechste as typeof stand.freigabe);
  };
  if (eingeklappt) {
    return (
      <aside ref={ref} className="demo-steuerung demo-eingeklappt" aria-label={t('demo.steuerung.titel')} data-testid="demo-steuerung">
        <button type="button" className="btn btn-secondary" aria-expanded="false" onClick={() => setEingeklappt(false)} data-testid="demo-aufklappen">
          {t('demo.steuerung.klein')}
        </button>
      </aside>
    );
  }
  return (
    <aside ref={ref} className="demo-steuerung" aria-label={t('demo.steuerung.titel')} data-testid="demo-steuerung">
      <div className="demo-steuerung-kopf">
        <strong className="demo-steuerung-titel">{t('demo.steuerung.titel')}</strong>
        <span className="demo-steuerung-phase" data-testid="demo-phase">
          {phaseLabel(stand.freigabe)}
        </span>
        <span className="demo-steuerung-hinweis" data-testid="demo-platzhalter-hinweis">
          {t('demo.steuerung.platzhalter')}
        </span>
      </div>
      <div className="demo-knoepfe">
        {naechste && (
          <button type="button" className="btn btn-secondary" onClick={freigeben} data-testid="demo-weiter">
            {t('demo.steuerung.weiter')}
          </button>
        )}
        {letzteHaupt && (
          <button type="button" className="btn btn-secondary" onClick={() => void client.starteFolgestunde()} data-testid="demo-woche">
            {t('demo.steuerung.woche')}
          </button>
        )}
        <button type="button" className="btn btn-quiet" onClick={onLehrkraft} data-testid="demo-lehrkraft">
          {t('demo.steuerung.lehrkraft')}
        </button>
        <button type="button" className="btn btn-quiet" onClick={onStart} data-testid="demo-start">
          {t('demo.steuerung.start')}
        </button>
        <button type="button" className="btn btn-quiet demo-einklappen" aria-expanded="true" onClick={() => setEingeklappt(true)} data-testid="demo-einklappen">
          {t('demo.steuerung.einklappen')}
        </button>
      </div>
    </aside>
  );
}
