import { VorleseKnopf } from '../../components/VorleseKnopf';
import { daten } from '../../lerndetektive/daten';
import { useReaktionszeit } from '../../lerndetektive/hooks';
import { t, type TextKey } from '../../text';

type Antwort = 'stimmt' | 'stimmt_nicht' | 'weiss_nicht';
const KNOEPFE: { antwort: Antwort; symbol: string; label: TextKey }[] = [
  { antwort: 'stimmt', symbol: '👍', label: 'kind.u.stimmt' },
  { antwort: 'stimmt_nicht', symbol: '👎', label: 'kind.u.stimmt_nicht' },
  { antwort: 'weiss_nicht', symbol: '❓', label: 'kind.u.weiss_nicht' },
];

/** Überzeugungs-Aussage (02 §3): drei große Knöpfe, keine Rückmeldung. */
export function Ueberzeugung({ itemId, onAntwort }: { itemId: 'U1' | 'U2' | 'U3'; onAntwort: (antwort: Antwort, rt_ms: number) => void }) {
  const rt = useReaktionszeit();
  const item = daten.ueberzeugungen.find((u) => u.id === itemId);
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-ueberzeugung" data-item={itemId}>
      <h1 id="h" className="aussage">
        {item?.text}
      </h1>
      <div className="antworten">
        {KNOEPFE.map((k) => (
          <button key={k.antwort} type="button" className="antwort-knopf" data-testid={`u-${k.antwort}`} onClick={() => onAntwort(k.antwort, rt())}>
            <span className="antwort-symbol" aria-hidden="true">
              {k.symbol}
            </span>
            <span>{t(k.label)}</span>
          </button>
        ))}
      </div>
      <VorleseKnopf />
    </section>
  );
}
