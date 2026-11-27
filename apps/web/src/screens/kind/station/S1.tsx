import { GRUND_ARTEN, pruefeS1, type GrundArt, type S1Aufgabe, type S1Daten } from '@lerntyp/shared';
import { useState } from 'react';
import { useReaktionszeit } from '../../../lerndetektive/hooks';
import { t, type TextKey } from '../../../text';

export interface AntwortDaten {
  korrekt: boolean;
  rt_ms: number;
  antwort: string;
  begruendung?: GrundArt;
}

const LUECKE = '_';

/** Wort mit Lücke; ist der Buchstabe gewählt, steht er in der Lücke. */
function Wort({ luecke, buchstabe }: { luecke: string; buchstabe: string | null }) {
  const [vorn = '', hinten = ''] = luecke.split(LUECKE);
  return (
    <p className="s1-wort" role="img" aria-label={t('parcours.s1.wort_label')} data-testid="s1-wort">
      <span>{vorn}</span>
      <span className={buchstabe ? 's1-luecke gefuellt' : 's1-luecke'}>{buchstabe ?? LUECKE}</span>
      <span>{hinten}</span>
    </p>
  );
}

/** S1 Wort-Werkstatt: erst der fehlende Buchstabe (zwei große Knöpfe), dann die Begründung „Verlängern“ oder „Ableiten“. */
export function S1Aufgabe({ aufgabe, onAntwort }: { aufgabe: S1Aufgabe; onAntwort: (a: AntwortDaten) => void }) {
  const rt = useReaktionszeit();
  const [buchstabe, setBuchstabe] = useState<string | null>(null);
  return (
    <>
      <Wort luecke={aufgabe.luecke} buchstabe={buchstabe} />
      {buchstabe === null ? (
        <div className="antworten">
          {aufgabe.optionen.map((o) => (
            <button key={o} type="button" className="antwort-knopf antwort-gross" data-testid={`s1-buchstabe-${o}`} onClick={() => setBuchstabe(o)}>
              {o}
            </button>
          ))}
        </div>
      ) : (
        <>
          <p className="lead">{t('parcours.s1.warum')}</p>
          <div className="antworten">
            {GRUND_ARTEN.map((g) => (
              <button
                key={g}
                type="button"
                className="antwort-knopf"
                data-testid={`s1-grund-${g}`}
                onClick={() => onAntwort({ antwort: buchstabe, begruendung: g, korrekt: pruefeS1(aufgabe, { buchstabe, grund: g }).korrekt, rt_ms: rt() })}
              >
                {t(`parcours.s1.${g}` as TextKey)}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-quiet" data-testid="s1-anderer" onClick={() => setBuchstabe(null)}>
            {t('parcours.s1.anderer')}
          </button>
        </>
      )}
    </>
  );
}

export function S1Muster({ muster }: { muster: S1Daten['musterbeispiel'] }) {
  return (
    <>
      <Wort luecke={muster.luecke} buchstabe={muster.richtig} />
      <p>{muster.erklaerung}</p>
    </>
  );
}
