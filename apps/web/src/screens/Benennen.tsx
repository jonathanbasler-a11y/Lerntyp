import { useState } from 'react';
import { PlatzhalterBild } from '../components/PlatzhalterBild';
import { daten, echteBilder } from '../lerndetektive/daten';
import { fuelle, t } from '../text';

/** Reihenfolge wie in den Sets A–F der Itemliste (stabil nach Set sortiert). */
const REIHENFOLGE = [...daten.items].sort((a, b) => a.set.localeCompare(b.set));

/**
 * Benennungstest (02 §5.1, 05 L8; nur Demo, `?benennen=1`): Werkzeug für Erwachsene. Zeigt jedes Bild ohne Wort,
 * das Wort erst auf Tipp. Nichts wird gespeichert oder gesendet.
 */
export function Benennen() {
  const [index, setIndex] = useState(0);
  const [wortSichtbar, setWortSichtbar] = useState(false);
  const item = REIHENFOLGE[index];
  if (!item) return null;
  const gehe = (neu: number) => {
    setIndex(neu);
    setWortSichtbar(false);
  };
  return (
    <section className="screen benennen" aria-labelledby="h" data-testid="benennen">
      <h1 id="h">{t('benennen.kopf')}</h1>
      <p className="hint">{t('benennen.hinweis')}</p>
      <p className="hint" data-testid="benennen-fortschritt">
        {fuelle(t('benennen.fortschritt'), { n: index + 1, gesamt: REIHENFOLGE.length })}
      </p>
      <div className="benennen-buehne" data-item={item.id}>
        <PlatzhalterBild key={item.id} item={item} />
        {!echteBilder.has(item.id) && <p className="hint">{t('benennen.bild_fehlt')}</p>}
      </div>
      <p className="lern-wort benennen-wort" data-testid="benennen-wort" hidden={!wortSichtbar}>
        {wortSichtbar ? item.wort : null}
      </p>
      <div className="row">
        <button type="button" className="btn btn-quiet" onClick={() => gehe(index - 1)} disabled={index === 0} data-testid="benennen-zurueck">
          {t('benennen.zurueck')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setWortSichtbar((v) => !v)} aria-pressed={wortSichtbar} data-testid="benennen-wort-zeigen">
          {t(wortSichtbar ? 'benennen.wort_verbergen' : 'benennen.wort_zeigen')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => gehe(index + 1)} disabled={index === REIHENFOLGE.length - 1} data-testid="benennen-weiter">
          {t('benennen.weiter')}
        </button>
      </div>
      {index === REIHENFOLGE.length - 1 && <p className="hint">{t('benennen.ende')}</p>}
    </section>
  );
}
