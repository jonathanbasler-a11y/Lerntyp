import { VorleseKnopf } from '../../components/VorleseKnopf';
import { t, type TextKey } from '../../text';

type Antwort = 'ja' | 'ein_bisschen' | 'nein';
const KNOEPFE: { antwort: Antwort; label: TextKey }[] = [
  { antwort: 'ja', label: 'kind.superkraft.ja' },
  { antwort: 'ein_bisschen', label: 'kind.superkraft.ein_bisschen' },
  { antwort: 'nein', label: 'kind.superkraft.nein' },
];

export function Superkraft({ onAntwort }: { onAntwort: (antwort: Antwort) => void }) {
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-superkraft">
      <h1 id="h">{t('kind.superkraft.frage')}</h1>
      <div className="antworten">
        {KNOEPFE.map((k) => (
          <button key={k.antwort} type="button" className="antwort-knopf" data-testid={`superkraft-${k.antwort}`} onClick={() => onAntwort(k.antwort)}>
            <span>{t(k.label)}</span>
          </button>
        ))}
      </div>
      <VorleseKnopf keys={['kind.superkraft.frage']} />
    </section>
  );
}
