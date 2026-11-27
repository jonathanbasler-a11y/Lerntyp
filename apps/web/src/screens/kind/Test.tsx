import { useEffect, useRef, useState } from 'react';
import type { TestEintrag } from '@lerntyp/shared';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { spiele } from '../../lerndetektive/audio';
import { itemFuer } from '../../lerndetektive/daten';
import { useReaktionszeit } from '../../lerndetektive/hooks';
import { t } from '../../text';

/** Wiedererkennungs-Entscheidung (02 §6.1): geschriebenes (und gesprochenes) Wort, zwei gleich gestaltete Knöpfe, keine Rückmeldung. */
export function Test({ eintrag, audioOk, onAntwort }: { eintrag: TestEintrag; audioOk: boolean; onAntwort: (antwort: 'dabei' | 'nicht_dabei', rt_ms: number) => void }) {
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
        {t('kind.test.frage')}
      </p>
      <p className="test-wort" data-testid="test-wort" data-position={eintrag.position}>
        {item.wort}
      </p>
      <div className="row">
        <button type="button" className="btn btn-primary btn-gross" data-testid="antwort-dabei" onClick={() => antworte('dabei')}>
          {t('kind.test.dabei')}
        </button>
        <button type="button" className="btn btn-primary btn-gross" data-testid="antwort-nicht" onClick={() => antworte('nicht_dabei')}>
          {t('kind.test.nicht_dabei')}
        </button>
      </div>
      <VorleseKnopf />
    </section>
  );
}
