import { VorleseKnopf } from '../components/VorleseKnopf';
import { demo } from '../demoData';
import { t } from '../text';

export function Lernausweis({ onWaehle, onZurueck }: { onWaehle: (alias: string) => void; onZurueck: () => void }) {
  return (
    <section className="screen" aria-labelledby="h">
      <h1 id="h">{t('lernausweis.titel')}</h1>
      <p className="lead">{t('lernausweis.hinweis')}</p>
      <ul className="karten">
        {demo.aliasse.map((a) => (
          <li key={a.alias}>
            <button type="button" className="karte" onClick={() => onWaehle(a.alias)} data-testid={`alias-${a.alias}`}>
              <span className="karte-symbol" aria-hidden="true">
                {a.symbol}
              </span>
              <span className="karte-alias">{a.alias}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="hint">{t('lernausweis.qr')}</p>
      <div className="row">
        <button type="button" className="btn btn-quiet" onClick={onZurueck}>
          {t('lernausweis.zurueck')}
        </button>
        <VorleseKnopf keys={['lernausweis.titel', 'lernausweis.hinweis']} />
      </div>
    </section>
  );
}
