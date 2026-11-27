import { useEffect, useState } from 'react';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { audioUrl, audioVerfuegbar, spiele } from '../../lerndetektive/audio';
import { t } from '../../text';

/**
 * Start der Stunde: Ton-Check (02 §8). Gibt es noch keine Audio-Dateien (Demo), zeigt der Bildschirm
 * „Ton folgt“ und blockiert nie: Das Experiment läuft dann ohne Ton (`audio_ok=false`).
 */
export function AudioStart({ onFertig }: { onFertig: (ok: boolean) => void }) {
  const [verfuegbar, setVerfuegbar] = useState<boolean | null>(null);
  useEffect(() => {
    let aktiv = true;
    void audioVerfuegbar().then((v) => aktiv && setVerfuegbar(v));
    return () => {
      aktiv = false;
    };
  }, []);

  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-start">
      <h1 id="h">{t('kind.start.titel')}</h1>
      <p className="lead">{t('kind.start.text')}</p>
      {verfuegbar === false && (
        <p className="hint" data-testid="ton-folgt">
          {t('kind.start.ton_folgt')}
        </p>
      )}
      {verfuegbar === true ? (
        <>
          <button type="button" className="btn btn-secondary" onClick={() => spiele('check.mp3')} data-audio={audioUrl('check.mp3')}>
            {t('kind.start.ton_testen')}
          </button>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => onFertig(true)} data-testid="audio-weiter">
              {t('kind.start.hoere')}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => onFertig(false)}>
              {t('kind.start.hoere_nicht')}
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="btn btn-primary" onClick={() => onFertig(false)} disabled={verfuegbar === null} data-testid="audio-weiter">
          {t('kind.start.weiter')}
        </button>
      )}
      <VorleseKnopf keys={['kind.start.titel', 'kind.start.text']} />
    </section>
  );
}
