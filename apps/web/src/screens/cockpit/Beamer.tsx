import { useState } from 'react';
import { PHASEN_FOLGE, PHASEN_STUNDE, klassenErgebnis, vergleichSofortVerzoegert } from '@lerntyp/shared';
import { BalkenDiagramm } from '../../components/BalkenDiagramm';
import { alleGruppen, nachVermutungGruppen, vergleichGruppen } from '../../lerndetektive/diagramm';
import type { Klasse } from '../../lerndetektive/hooks';
import { wertePro } from '../../lerndetektive/auswertung';
import { daten } from '../../lerndetektive/daten';
import { fuelle, t } from '../../text';


/** Beamer-Ansicht (02 §7): Klassenergebnis „Alle“, optional nach Vermutung; Folgestunde: sofort vs. nach einer Woche. */
export function Beamer({ klasse }: { klasse: Klasse }) {
  const [nachVermutung, setNachVermutung] = useState(false);
  const { stand } = klasse;
  const kinder = wertePro(klasse.teilnehmer, klasse.ereignisse, daten).filter((k) => k.sofort !== null);
  const mindest = daten.ablauf.mindestgruppe;
  const simuliert = klasse.teilnehmer.some((k) => k.simuliert);

  const sichtbar =
    stand.stunde === 'haupt' ? PHASEN_STUNDE.indexOf(stand.freigabe) >= PHASEN_STUNDE.indexOf('ergebnis') : PHASEN_FOLGE.indexOf(stand.freigabe) >= PHASEN_FOLGE.indexOf('vergleich');

  const ergebnis = klassenErgebnis(
    kinder.map((k) => ({ vermutung: k.vermutung, korrigiert: k.sofort! })),
    mindest,
  );
  const vergleich = vergleichSofortVerzoegert(
    kinder.map((k) => ({ sofort: k.sofort!, verzoegert: k.verzoegert })),
    mindest,
  );
  const geteilt = nachVermutungGruppen(ergebnis);

  return (
    <div data-testid="beamer">
      {simuliert && (
        <p className="simuliert" role="note" data-testid="simuliert-label">
          {t('beamer.simuliert')}
        </p>
      )}
      {!sichtbar && <p className="lead">{t(stand.stunde === 'haupt' ? 'beamer.noch_nicht' : 'beamer.noch_nicht_folge')}</p>}
      {sichtbar && stand.stunde === 'haupt' && (
        <>
          <h2>{t('beamer.titel')}</h2>
          <BalkenDiagramm
            testId="diagramm-alle"
            titel={t(nachVermutung && geteilt ? 'beamer.titel_vermutung' : 'beamer.titel')}
            gruppen={nachVermutung && geteilt ? geteilt : alleGruppen(ergebnis)}
          />
          <p className="hint">{fuelle(t('beamer.anzahl'), { n: ergebnis.alle.n })}</p>
          {geteilt && (
            <button type="button" className="btn btn-secondary" aria-pressed={nachVermutung} onClick={() => setNachVermutung((v) => !v)} data-testid="toggle-vermutung">
              {t(nachVermutung ? 'beamer.toggle_alle' : 'beamer.toggle_vermutung')}
            </button>
          )}
        </>
      )}
      {sichtbar && stand.stunde === 'folge' && (
        <>
          <h2>{t('beamer.vergleich_titel')}</h2>
          {vergleich ? (
            <>
              <BalkenDiagramm testId="diagramm-vergleich" titel={t('beamer.vergleich_titel')} gruppen={vergleichGruppen(vergleich)} />
              <p className="hint">{fuelle(t('beamer.anzahl'), { n: vergleich.n })}</p>
            </>
          ) : (
            <p className="lead" data-testid="vergleich-zu-klein">
              {fuelle(t('beamer.zu_klein'), { n: mindest })}
            </p>
          )}
        </>
      )}

    </div>
  );
}
