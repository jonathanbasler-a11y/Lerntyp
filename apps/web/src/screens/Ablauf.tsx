import { useState } from 'react';
import { VorleseKnopf } from '../components/VorleseKnopf';
import { t, type TextKey } from '../text';

const PHASEN: { titel: TextKey; text: TextKey; id: string }[] = [
  { id: 'start', titel: 'phase.start.titel', text: 'phase.start.text' },
  { id: 'lerndetektive', titel: 'phase.lerndetektive.titel', text: 'phase.lerndetektive.text' },
  { id: 'parcours', titel: 'phase.parcours.titel', text: 'phase.parcours.text' },
  { id: 'profil', titel: 'phase.profil.titel', text: 'phase.profil.text' },
];

export function Ablauf({ onFertig, onZurueck }: { onFertig: () => void; onZurueck: () => void }) {
  const [i, setI] = useState(0);
  const phase = PHASEN[i];
  if (!phase) return null;
  const letzte = i === PHASEN.length - 1;

  return (
    <section className="screen" aria-labelledby="h" data-testid={`phase-${phase.id}`}>
      <ol className="punkte" aria-label={t('ablauf.fortschritt')}>
        {PHASEN.map((p, n) => (
          <li key={p.id} className={n === i ? 'punkt aktiv' : n < i ? 'punkt getan' : 'punkt'} aria-current={n === i ? 'step' : undefined} />
        ))}
      </ol>
      <span className="badge">{t('ablauf.badge')}</span>
      <h1 id="h">{t(phase.titel)}</h1>
      <p className="lead">{t(phase.text)}</p>
      <div className="row">
        <button type="button" className="btn btn-quiet" onClick={() => (i === 0 ? onZurueck() : setI(i - 1))}>
          {t('ablauf.zurueck')}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => (letzte ? onFertig() : setI(i + 1))} data-testid="weiter">
          {t('ablauf.weiter')}
        </button>
      </div>
      <VorleseKnopf />
    </section>
  );
}
