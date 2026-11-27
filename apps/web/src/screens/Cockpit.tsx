import { demo } from '../demoData';
import { t } from '../text';

export function Cockpit({ onZurueck }: { onZurueck: () => void }) {
  return (
    <section className="screen screen-wide" aria-labelledby="h" data-testid="cockpit">
      <h1 id="h">{t('cockpit.titel')}</h1>
      <p className="hint">{t('cockpit.platzhalter')}</p>
      <p className="code">
        <span>{t('cockpit.code')}</span>
        <strong data-testid="sitzungscode">{demo.sitzungscode}</strong>
      </p>
      <h2>{t('cockpit.kinder')}</h2>
      <ul className="liste">
        {demo.aliasse.map((a) => (
          <li key={a.alias} className="liste-zeile">
            <span aria-hidden="true">{a.symbol}</span>
            <span className="liste-alias">{a.alias}</span>
            <span className="status">{t('cockpit.status.wartet')}</span>
          </li>
        ))}
      </ul>
      <p className="notice" role="note" data-testid="hinweis-lernbegleitung">
        {t('hinweis.lernbegleitung')}
      </p>
      <button type="button" className="btn btn-quiet" onClick={onZurueck}>
        {t('cockpit.zurueck')}
      </button>
    </section>
  );
}
