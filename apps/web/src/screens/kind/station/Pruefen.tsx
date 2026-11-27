import { STRATEGIEN, type Strategie } from '@lerntyp/shared';
import { useState } from 'react';
import { StrategieSymbol } from '../../../components/StrategieSymbol';
import { VorleseKnopf } from '../../../components/VorleseKnopf';
import { fuelle, t, type TextKey } from '../../../text';

/**
 * Prüfen (01 §7.3): Ergebnis nur neben dem eigenen Ziel, in Worten; danach „Was hat dir geholfen?“ mit den sechs Strategie-Symbolen.
 * Kein Vergleich mit anderen, keine Punkte, keine Prozentwerte.
 */
export function Pruefen({
  ziel,
  geschafft,
  zielErreicht,
  onFertig,
}: {
  ziel: number;
  geschafft: number;
  zielErreicht: boolean;
  onFertig: (strategien: Strategie[]) => void;
}) {
  const [gewaehlt, setGewaehlt] = useState<Strategie[]>([]);
  const umschalten = (s: Strategie) => setGewaehlt((alt) => (alt.includes(s) ? alt.filter((x) => x !== s) : [...alt, s]));
  const satz = zielErreicht ? t('parcours.pruefen.ziel_erreicht') : fuelle(t('parcours.pruefen.ziel_anders'), { n: geschafft, ziel });
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-pruefen">
      <h1 id="h">{t('parcours.pruefen.titel')}</h1>
      <p className="lead" data-testid="pruefen-ergebnis">
        {satz}
      </p>
      <p className="lead frage">{t('parcours.pruefen.geholfen')}</p>
      <div className="strategien">
        {STRATEGIEN.map((s) => (
          <button key={s} type="button" className="strategie-knopf" aria-pressed={gewaehlt.includes(s)} data-testid={`strategie-${s}`} onClick={() => umschalten(s)}>
            <StrategieSymbol strategie={s} />
            <span>{t(`strategie.${s}` as TextKey)}</span>
          </button>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn btn-primary" disabled={gewaehlt.length === 0} data-testid="pruefen-fertig" onClick={() => onFertig(gewaehlt)}>
          {t('parcours.pruefen.fertig')}
        </button>
        <button type="button" className="btn btn-quiet" data-testid="pruefen-nichts" onClick={() => onFertig([])}>
          {t('parcours.pruefen.nichts')}
        </button>
      </div>
      <VorleseKnopf
        keys={[
          'parcours.pruefen.titel',
          ...(zielErreicht ? (['parcours.pruefen.ziel_erreicht'] as const) : []),
          'parcours.pruefen.geholfen',
          'strategie.gedaechtnis_training',
          'strategie.haeppchen_lernen',
          'strategie.doppelt_merken',
          'strategie.mischen',
          'strategie.warum_fragen',
          'strategie.beispiele',
        ]}
      />
    </section>
  );
}
