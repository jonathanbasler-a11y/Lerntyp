import { PHASEN_FOLGE, PHASEN_HAUPT } from '@lerntyp/shared';
import type { ApiClient } from '../api/client';
import { useStand } from '../lerndetektive/hooks';
import { t, type TextKey } from '../text';

export const phaseLabel = (phase: string): string => t(`phase.${phase}` as TextKey);

/**
 * Nur Demo: Es gibt kein Lehrkraft-Gerät, deshalb gibt diese Leiste die nächste Phase frei.
 * Deutlich als Demo-Steuerung gekennzeichnet; nicht Teil der Kinder-Bildschirme.
 */
export function DemoSteuerung({ client, onLehrkraft, onStart }: { client: ApiClient; onLehrkraft: () => void; onStart: () => void }) {
  const stand = useStand(client);
  if (!stand) return null;
  const phasen: readonly string[] = stand.stunde === 'haupt' ? PHASEN_HAUPT : PHASEN_FOLGE;
  const index = phasen.indexOf(stand.freigabe);
  const naechste = phasen[index + 1];
  const letzteHaupt = stand.stunde === 'haupt' && naechste === undefined;
  const freigeben = () => {
    if (naechste) void client.setFreigabe(naechste as typeof stand.freigabe);
  };
  return (
    <aside className="demo-steuerung" aria-label={t('demo.steuerung.titel')} data-testid="demo-steuerung">
      <strong className="demo-steuerung-titel">{t('demo.steuerung.titel')}</strong>
      <span className="demo-steuerung-phase" data-testid="demo-phase">
        {phaseLabel(stand.freigabe)}
      </span>
      <div className="row">
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
      </div>
    </aside>
  );
}
