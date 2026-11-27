import { VorleseKnopf } from '../components/VorleseKnopf';
import { t } from '../text';

export function Fertig({ onZumStart }: { onZumStart: () => void }) {
  return (
    <section className="screen" aria-labelledby="h" data-testid="fertig">
      <h1 id="h">{t('fertig.titel')}</h1>
      <p className="lead">{t('fertig.text')}</p>
      <VorleseKnopf keys={['fertig.titel', 'fertig.text']} />
      <button type="button" className="link-klein" onClick={onZumStart} data-testid="zurueck-start">
        {t('fertig.zurueck')}
      </button>
    </section>
  );
}
