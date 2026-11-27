import { pruefeS3, type S3Aufgabe, type S3Daten } from '@lerntyp/shared';
import { useState } from 'react';
import { Bauplan } from '../../../components/Bauplan';
import { IsoGebaeude } from '../../../components/IsoGebaeude';
import { useReaktionszeit } from '../../../lerndetektive/hooks';
import { fuelle, t } from '../../../text';
import type { AntwortDaten } from './S1';

type PlanId = 'a' | 'b' | 'c';

function Plaene({ plaene, gewaehlt, onWahl }: { plaene: S3Aufgabe['plaene']; gewaehlt: PlanId | null; onWahl?: (id: PlanId) => void }) {
  return (
    <div className="plaene">
      {plaene.map((p, i) => (
        <button
          key={p.id}
          type="button"
          className="plan-knopf"
          aria-pressed={gewaehlt === p.id}
          disabled={!onWahl}
          data-testid={`s3-plan-${p.id}`}
          onClick={() => onWahl?.(p.id)}
        >
          <span className="plan-titel">{fuelle(t('parcours.s3.plan'), { n: i + 1 })}</span>
          <Bauplan raster={p.raster} />
        </button>
      ))}
    </div>
  );
}

/** S3 Würfel-Baumeister: Gebäude (isometrische Zeichnung) ↔ passender Bauplan unter drei Draufsichten mit Stapelzahlen. */
export function S3Aufgabe({ aufgabe, onAntwort }: { aufgabe: S3Aufgabe; onAntwort: (a: AntwortDaten) => void }) {
  const rt = useReaktionszeit();
  const [gewaehlt, setGewaehlt] = useState<PlanId | null>(null);
  return (
    <>
      <IsoGebaeude raster={aufgabe.gebaeude} label={t('parcours.s3.gebaeude_label')} testId="s3-gebaeude" />
      <Plaene plaene={aufgabe.plaene} gewaehlt={gewaehlt} onWahl={setGewaehlt} />
      <button
        type="button"
        className="btn btn-primary"
        disabled={gewaehlt === null}
        data-testid="antwort-pruefen"
        onClick={() => gewaehlt && onAntwort({ antwort: gewaehlt, korrekt: pruefeS3(aufgabe, gewaehlt), rt_ms: rt() })}
      >
        {t('parcours.ueben.pruefen')}
      </button>
    </>
  );
}

export function S3Muster({ muster }: { muster: S3Daten['musterbeispiel'] }) {
  return (
    <>
      <IsoGebaeude raster={muster.gebaeude} label={t('parcours.s3.gebaeude_label')} />
      <Plaene plaene={muster.plaene} gewaehlt={muster.richtig} />
      <p>{muster.erklaerung}</p>
    </>
  );
}
