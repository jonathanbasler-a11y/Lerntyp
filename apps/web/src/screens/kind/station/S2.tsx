import { blockAnzeige, pruefeS2, satzText, type S2Aufgabe, type S2Daten } from '@lerntyp/shared';
import { useState } from 'react';
import { SatzBlock } from '../../../components/SatzBlock';
import { useReaktionszeit } from '../../../lerndetektive/hooks';
import { t } from '../../../text';
import type { AntwortDaten } from './S1';

type Bloecke = S2Aufgabe['bloecke'];

/** Eine Reihe Blöcke in der Reihenfolge `reihenfolge`; der erste Block beginnt den Satz (Großbuchstabe). */
function Reihe({ bloecke, reihenfolge, testId }: { bloecke: Bloecke; reihenfolge: readonly number[]; testId?: string }) {
  return (
    <div className="satz-reihe" data-testid={testId}>
      {reihenfolge.map((i, pos) => {
        const b = bloecke[i]!;
        return <SatzBlock key={i} art={b.art} text={blockAnzeige(b.text, b.immer_gross, pos === 0)} />;
      })}
    </div>
  );
}

/**
 * S2 Satz-Baukasten (Umstellprobe): Blöcke in der Reihenfolge antippen, in der sie stehen sollen.
 * Tippen ist der Hauptweg (Ziehen ist optional und kommt später); „Zurück“ nimmt den letzten Block weg.
 */
export function S2Aufgabe({ aufgabe, anzeige, onAntwort }: { aufgabe: S2Aufgabe; anzeige: S2Daten['anzeige']; onAntwort: (a: AntwortDaten) => void }) {
  const rt = useReaktionszeit();
  const [reihenfolge, setReihenfolge] = useState<number[]>([]);
  const fertig = reihenfolge.length === aufgabe.bloecke.length;
  const texte = aufgabe.bloecke.map((b) => b.text);
  return (
    <>
      <p className="hint">{t('parcours.s2.bloecke')}</p>
      <div className="satz-reihe" data-testid="s2-vorrat">
        {aufgabe.bloecke.map((b, i) => (
          <SatzBlock
            key={i}
            art={b.art}
            text={blockAnzeige(b.text, b.immer_gross, false)}
            testId={`s2-block-${i}`}
            disabled={reihenfolge.includes(i)}
            onClick={() => setReihenfolge((alt) => [...alt, i])}
          />
        ))}
      </div>
      <h2>{t('parcours.s2.dein_satz')}</h2>
      <div className="satz-bau" data-testid="s2-bau">
        {reihenfolge.length === 0 ? <p className="hint">{t('parcours.s2.leer')}</p> : <Reihe bloecke={aufgabe.bloecke} reihenfolge={reihenfolge} testId="s2-gebaut" />}
        {fertig && (
          <p className="lead satz-text" data-testid="s2-satz">
            {satzText(texte, reihenfolge, anzeige)}
          </p>
        )}
      </div>
      <div className="row">
        <button type="button" className="btn btn-quiet" disabled={reihenfolge.length === 0} data-testid="s2-zurueck" onClick={() => setReihenfolge((alt) => alt.slice(0, -1))}>
          {t('parcours.s2.rueckgaengig')}
        </button>
        <button type="button" className="btn btn-quiet" disabled={reihenfolge.length === 0} data-testid="s2-neu" onClick={() => setReihenfolge([])}>
          {t('parcours.s2.zuruecksetzen')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!fertig}
          data-testid="antwort-pruefen"
          onClick={() => onAntwort({ antwort: reihenfolge.join(','), korrekt: pruefeS2(aufgabe, reihenfolge).korrekt, rt_ms: rt() })}
        >
          {t('parcours.ueben.pruefen')}
        </button>
      </div>
    </>
  );
}

export function S2Muster({ muster, anzeige }: { muster: S2Daten['musterbeispiel']; anzeige: S2Daten['anzeige'] }) {
  const neu = muster.erlaubte_reihenfolgen.find((r) => r[0] !== 0) ?? muster.erlaubte_reihenfolgen[0]!;
  const original = muster.bloecke.map((_, i) => i);
  const texte = muster.bloecke.map((b) => b.text);
  return (
    <>
      <Reihe bloecke={muster.bloecke} reihenfolge={original} />
      <p className="satz-text">{satzText(texte, original, anzeige)}</p>
      <Reihe bloecke={muster.bloecke} reihenfolge={neu} />
      <p className="satz-text">{satzText(texte, neu, anzeige)}</p>
      <p>{muster.erklaerung}</p>
    </>
  );
}
