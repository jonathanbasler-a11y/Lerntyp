import { useEffect, useRef, useState } from 'react';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { t } from '../../text';

const ZAHLEN = [2, 3, 4, 5, 6, 7];
const zufallsAnzahl = () => 2 + Math.floor(Math.random() * 6);

function Stern({ x, y }: { x: number; y: number }) {
  return <path d="M0 -14L4 -5L14 -4L6 3L9 13L0 8L-9 13L-6 3L-14 -4L-4 -5Z" transform={`translate(${x} ${y})`} fill="#e9b44c" stroke="#a87b13" strokeWidth="1.5" />;
}

/** „Sterne zählen“ (02 §2): kurze Zählrunden, keine Rückmeldung, keine Punkte. Danach `onFertig`. */
export function PauseAufgabe({ dauer_ms, onFertig }: { dauer_ms: number; onFertig: () => void }) {
  const [anzahl, setAnzahl] = useState(zufallsAnzahl);
  const fertig = useRef(onFertig);
  useEffect(() => {
    fertig.current = onFertig;
  });
  useEffect(() => {
    const id = setTimeout(() => fertig.current(), dauer_ms);
    return () => clearTimeout(id);
  }, [dauer_ms]);

  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-pause_aufgabe">
      <h1 id="h">{t('kind.sterne.titel')}</h1>
      <svg viewBox="0 0 320 90" className="sterne" role="img" aria-label={t('kind.sterne.bild')}>
        {Array.from({ length: anzahl }, (_, i) => (
          <Stern key={i} x={26 + (i % 6) * 50} y={i < 6 ? 30 : 68} />
        ))}
      </svg>
      <p className="lead">{t('kind.sterne.frage')}</p>
      <div className="row">
        {ZAHLEN.map((z) => (
          <button key={z} type="button" className="btn btn-secondary zahl-knopf" data-testid={`stern-${z}`} onClick={() => setAnzahl(zufallsAnzahl())}>
            {z}
          </button>
        ))}
      </div>
      <VorleseKnopf />
    </section>
  );
}
