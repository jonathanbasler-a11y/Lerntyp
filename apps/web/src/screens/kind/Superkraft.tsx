import type { Strategie } from '@lerntyp/shared';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { vorlesenDateien } from '../../lerndetektive/audio';
import { datenAudio } from '../../parcours/audio';
import { fuelle, t, type TextKey } from '../../text';

type Antwort = 'ja' | 'ein_bisschen' | 'nein';
const KNOEPFE: { antwort: Antwort; label: TextKey }[] = [
  { antwort: 'ja', label: 'kind.superkraft.ja' },
  { antwort: 'ein_bisschen', label: 'kind.superkraft.ein_bisschen' },
  { antwort: 'nein', label: 'kind.superkraft.nein' },
];

/**
 * Folgestunde: „Hast du diese Woche deine Lern-Superkraft ausprobiert?“ Hat das Kind ein Lernprofil, steht der echte Name
 * seiner Superkraft in der Frage; ohne Profil gilt weiter die feste Frage zu „Doppelt merken“.
 */
export function Superkraft({ superkraft, onAntwort }: { superkraft: Strategie | null; onAntwort: (antwort: Antwort) => void }) {
  const frage = superkraft ? fuelle(t('kind.superkraft.frage_profil'), { name: t(`strategie.${superkraft}` as TextKey) }) : t('kind.superkraft.frage');
  const dateien = superkraft ? datenAudio(`sk_frage.${superkraft}`) : vorlesenDateien(['kind.superkraft.frage']);
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-superkraft">
      <h1 id="h">{frage}</h1>
      <div className="antworten">
        {KNOEPFE.map((k) => (
          <button key={k.antwort} type="button" className="antwort-knopf" data-testid={`superkraft-${k.antwort}`} onClick={() => onAntwort(k.antwort)}>
            <span>{t(k.label)}</span>
          </button>
        ))}
      </div>
      <VorleseKnopf dateien={dateien} />
    </section>
  );
}
