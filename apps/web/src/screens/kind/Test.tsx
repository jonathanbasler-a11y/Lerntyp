import { useEffect, useRef, useState } from 'react';
import type { TestEintrag } from '@lerntyp/shared';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { spiele } from '../../lerndetektive/audio';
import { itemFuer } from '../../lerndetektive/daten';
import { useReaktionszeit } from '../../lerndetektive/hooks';
import { t } from '../../text';

/** Wiedererkennungs-Entscheidung (02 §6.1): geschriebenes (und gesprochenes) Wort, zwei Knöpfe (einer gefüllt, einer mit Rand, je mit neutralem Symbol, nie grün/rot), keine Rückmeldung. */
export function Test({ test, eintrag, audioOk, onAntwort }: { test: 'sofort' | 'verzoegert'; eintrag: TestEintrag; audioOk: boolean; onAntwort: (antwort: 'dabei' | 'nicht_dabei', rt_ms: number) => void }) {
  const rt = useReaktionszeit();
  const [beantwortet, setBeantwortet] = useState(false);
  const item = itemFuer(eintrag.item_id);
  const audio = useRef(item.audio);
  useEffect(() => {
    if (audioOk) spiele(audio.current);
  }, [audioOk]);
  const antworte = (a: 'dabei' | 'nicht_dabei') => {
    if (beantwortet) return;
    setBeantwortet(true);
    onAntwort(a, rt());
  };
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-test">
      <p className="hint" id="h">
        {t(test === 'verzoegert' ? 'kind.test.frage_verzoegert' : 'kind.test.frage')}
      </p>
      <p className="test-wort" data-testid="test-wort" data-position={eintrag.position}>
        {item.wort}
      </p>
      <div className="test-knoepfe">
        <button type="button" className="btn btn-primary btn-gross" data-testid="antwort-dabei" onClick={() => antworte('dabei')}>
          <svg className="btn-symbol" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8" fill="currentColor" />
          </svg>
          {t('kind.test.dabei')}
        </button>
        <button type="button" className="btn btn-secondary btn-gross" data-testid="antwort-nicht" onClick={() => antworte('nicht_dabei')}>
          <svg className="btn-symbol" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M6.5 17.5L17.5 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {t('kind.test.nicht_dabei')}
        </button>
      </div>
      <VorleseKnopf keys={[test === 'verzoegert' ? 'kind.test.frage_verzoegert' : 'kind.test.frage']} />
    </section>
  );
}
