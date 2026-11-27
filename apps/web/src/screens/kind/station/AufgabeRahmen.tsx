import { useState, type ReactNode } from 'react';
import type { Station } from '@lerntyp/shared';
import { VorleseKnopf } from '../../../components/VorleseKnopf';
import { vorlesenDateien } from '../../../lerndetektive/audio';
import { datenAudio } from '../../../parcours/audio';
import { fuelle, t, type TextKey } from '../../../text';

/**
 * Gemeinsamer Rahmen jeder Aufgabe (01 §7.3, „Üben“): Aufgabe, Musterbeispiel und gestufte Hinweise sind immer da und freiwillig,
 * Überspringen ist erlaubt. Die Hinweisstufe kommt aus den Ereignissen, das Musterbeispiel öffnet und schließt das Kind.
 */
export function AufgabeRahmen({
  station,
  nummer,
  aufgabeId,
  aufgabeText,
  hinweis1,
  hinweis2,
  hinweisStufe,
  muster,
  onBeispiel,
  onHinweis,
  onUeberspringen,
  children,
}: {
  station: Station;
  nummer: number;
  aufgabeId: string;
  aufgabeText: TextKey;
  hinweis1: string;
  hinweis2: string;
  hinweisStufe: 0 | 1 | 2;
  muster: ReactNode;
  onBeispiel: () => void;
  onHinweis: (stufe: 1 | 2) => void;
  onUeberspringen: () => void;
  children: ReactNode;
}) {
  const [beispielOffen, setBeispielOffen] = useState(false);
  const dateien = [
    ...vorlesenDateien([aufgabeText]),
    ...(beispielOffen ? datenAudio(`${station}.muster`) : []),
    ...(hinweisStufe >= 1 ? datenAudio(`${aufgabeId}.hinweis1`) : []),
    ...(hinweisStufe >= 2 ? datenAudio(`${aufgabeId}.hinweis2`) : []),
  ];
  return (
    <section className="screen screen-aufgabe" aria-labelledby="h" data-testid="schritt-aufgabe" data-station={station} data-aufgabe={aufgabeId}>
      <p className="hint aufgabe-nr" data-testid="aufgabe-nr">
        {fuelle(t('parcours.ueben.aufgabe_nr'), { n: nummer })}
      </p>
      <h1 id="h" className="aufgabe-frage">
        {t(aufgabeText)}
      </h1>
      {children}
      <div className="hilfe-leiste">
        <button
          type="button"
          className="btn btn-secondary"
          aria-expanded={beispielOffen}
          data-testid="beispiel-knopf"
          onClick={() => {
            if (!beispielOffen) onBeispiel();
            setBeispielOffen(!beispielOffen);
          }}
        >
          {t(beispielOffen ? 'parcours.ueben.beispiel_zu' : 'parcours.ueben.beispiel')}
        </button>
        <button type="button" className="btn btn-secondary" data-testid="hinweis-knopf-1" onClick={() => onHinweis(1)}>
          {t('parcours.ueben.hinweis1')}
        </button>
        <button type="button" className="btn btn-secondary" disabled={hinweisStufe < 1} data-testid="hinweis-knopf-2" onClick={() => onHinweis(2)}>
          {t('parcours.ueben.hinweis2')}
        </button>
      </div>
      {beispielOffen && (
        <div className="hilfe-box" data-testid="beispiel-box">
          <h2>{t('parcours.ueben.musterbeispiel')}</h2>
          {muster}
        </div>
      )}
      {hinweisStufe >= 1 && (
        <p className="hilfe-box" data-testid="hinweis-1">
          {hinweis1}
        </p>
      )}
      {hinweisStufe >= 2 && (
        <p className="hilfe-box" data-testid="hinweis-2">
          {hinweis2}
        </p>
      )}
      <div className="row">
        <VorleseKnopf dateien={dateien} />
        <button type="button" className="btn btn-quiet" data-testid="ueberspringen" aria-label={t('parcours.ueben.ueberspringen_hinweis')} onClick={onUeberspringen}>
          {t('parcours.ueben.ueberspringen')}
        </button>
      </div>
    </section>
  );
}
