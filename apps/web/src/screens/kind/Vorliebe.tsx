import type { Bedingung } from '@lerntyp/shared';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { daten } from '../../lerndetektive/daten';
import { useReaktionszeit } from '../../lerndetektive/hooks';
import { t, type TextKey } from '../../text';

const KARTEN: { antwort: Bedingung; symbol: string; label: TextKey }[] = [
  { antwort: 'wort', symbol: '👂 🔤', label: 'kind.v.wort' },
  { antwort: 'bild', symbol: '🖼️', label: 'kind.v.bild' },
  { antwort: 'bild_wort', symbol: '👂 🖼️', label: 'kind.v.bild_wort' },
];

/** Vorliebe-Frage oder Vermutung (02 §4): drei Bildkarten. Die Wahl wird nie wiederholt oder benannt. */
export function Vorliebe({ itemId, onAntwort }: { itemId: 'V1' | 'V2' | 'V3' | 'V4'; onAntwort: (antwort: Bedingung, rt_ms: number) => void }) {
  const rt = useReaktionszeit();
  const item = daten.vorlieben.find((v) => v.id === itemId);
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-vorliebe" data-item={itemId}>
      <h1 id="h" className="aussage">
        {item?.text}
      </h1>
      <div className="antworten">
        {KARTEN.map((k) => (
          <button key={k.antwort} type="button" className="antwort-knopf" data-testid={`v-${k.antwort}`} onClick={() => onAntwort(k.antwort, rt())}>
            <span className="antwort-symbol" aria-hidden="true">
              {k.symbol}
            </span>
            <span>{t(k.label)}</span>
          </button>
        ))}
      </div>
      <VorleseKnopf dateien={item ? [item.audio] : []} />
    </section>
  );
}
