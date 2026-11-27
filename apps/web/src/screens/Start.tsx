import { VorleseKnopf } from '../components/VorleseKnopf';
import { t } from '../text';

export function Start({ onKind, onLehrkraft }: { onKind: () => void; onLehrkraft: () => void }) {
  return (
    <section className="screen" aria-labelledby="h">
      <h1 id="h">{t('start.titel')}</h1>
      <p className="lead">{t('start.untertitel')}</p>
      <div className="stack">
        <button type="button" className="btn btn-primary" onClick={onKind} data-testid="rolle-kind">
          {t('start.kind')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLehrkraft} data-testid="rolle-lehrkraft">
          {t('start.lehrkraft')}
        </button>
      </div>
      <VorleseKnopf keys={['start.titel', 'start.untertitel']} />
    </section>
  );
}
