import { VorleseKnopf } from '../../components/VorleseKnopf';
import { t, type TextKey } from '../../text';

/** Einfacher Textbildschirm (warten, zuschauen, „Schau nach vorne“ …): höchstens zwei kurze Sätze. */
export function Mitteilung({ id, titel, text, weiter }: { id: string; titel: TextKey; text: TextKey; weiter?: { label: TextKey; onWeiter: () => void; testId: string } }) {
  return (
    <section className="screen" aria-labelledby="h" data-testid={`schritt-${id}`}>
      <h1 id="h">{t(titel)}</h1>
      <p className="lead">{t(text)}</p>
      {weiter && (
        <button type="button" className="btn btn-primary" onClick={weiter.onWeiter} data-testid={weiter.testId}>
          {t(weiter.label)}
        </button>
      )}
      <VorleseKnopf />
    </section>
  );
}
