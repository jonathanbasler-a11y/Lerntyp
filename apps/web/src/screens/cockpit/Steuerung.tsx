import { PHASEN_FOLGE, PHASEN_HAUPT } from '@lerntyp/shared';
import type { ApiClient } from '../../api/client';
import { phaseLabel } from '../../components/DemoSteuerung';
import type { Klasse } from '../../lerndetektive/hooks';
import { kindStatus } from '../../lerndetektive/status';
import { daten } from '../../lerndetektive/daten';
import { t, type TextKey } from '../../text';

/** Phasen freigeben und Live-Status je Alias (nur Phase und Hilfe/Pause, keine Ergebnisse). */
const LEITFADEN_SCHRITTE = [1, 2, 3, 4, 5] as const;

export function Steuerung({ client, klasse }: { client: ApiClient; klasse: Klasse }) {
  const { stand } = klasse;
  const phasen: readonly string[] = stand.stunde === 'haupt' ? PHASEN_HAUPT : PHASEN_FOLGE;
  const index = phasen.indexOf(stand.freigabe);
  const naechste = phasen[index + 1];
  const status = klasse.teilnehmer
    .map((k) => kindStatus(stand, k, klasse.ereignisse, daten))
    .sort((a, b) => Number(a.simuliert) - Number(b.simuliert) || a.alias.localeCompare(b.alias, 'de'));

  return (
    <>
      <h2>{t(stand.stunde === 'haupt' ? 'cockpit.haupt' : 'cockpit.folge')}</h2>
      <ol className="phasen" aria-label={t('cockpit.phasen')}>
        {phasen.map((p, i) => (
          <li key={p} className={i < index ? 'phase getan' : i === index ? 'phase aktuell' : 'phase'} aria-current={i === index ? 'step' : undefined} data-testid={`phase-${p}`}>
            {phaseLabel(p)}
          </li>
        ))}
      </ol>
      <div className="row row-links">
        {naechste && (
          <button type="button" className="btn btn-primary" onClick={() => void client.setFreigabe(naechste as typeof stand.freigabe)} data-testid="phase-weiter">
            {t('cockpit.weiter')}
          </button>
        )}
        {stand.stunde === 'haupt' && !naechste && (
          <button type="button" className="btn btn-secondary" onClick={() => void client.starteFolgestunde()} data-testid="cockpit-woche">
            {t('demo.steuerung.woche')}
          </button>
        )}
      </div>

      {/* Gesprächsleitfaden nur auf dem Lehrkraftgerät, nie am Beamer: Kinder sollen das erwartete Ergebnis nicht vorher lesen (02 §7.2). */}
      <details className="leitfaden" open={stand.freigabe === 'ergebnis' || stand.freigabe === 'vergleich'} data-testid="leitfaden">
        <summary>{t('leitfaden.titel')}</summary>
        <ol>
          {LEITFADEN_SCHRITTE.map((n) => (
            <li key={n}>
              <strong>{t(`leitfaden.${n}.titel` as TextKey)}</strong> {t(`leitfaden.${n}.text` as TextKey)}
            </li>
          ))}
        </ol>
      </details>

      <h2>{t('cockpit.kinder')}</h2>
      <ul className="liste" data-testid="live-liste">
        {status.map((s) => (
          <li key={s.alias} className="liste-zeile" data-testid="live-zeile">
            <span className="liste-alias">{s.alias}</span>
            {s.simuliert && <span className="marke">{t('cockpit.simuliert')}</span>}
            {s.hilfe && <span className="flagge flagge-hilfe">{t('cockpit.hilfe')}</span>}
            {s.pausiert && <span className="flagge">{t('cockpit.pause')}</span>}
            <span className="status">{t(`status.${s.art}` as TextKey)}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
