import { VorleseKnopf } from '../../../components/VorleseKnopf';
import { datenAudio } from '../../../parcours/audio';
import { vorlesenDateien } from '../../../lerndetektive/audio';
import { t } from '../../../text';

/**
 * Sofortige, sachliche Rückmeldung (01 §8): richtig = kurze Bestätigung; falsch = erklärende Antwort aus den Daten.
 * Nie ein rotes Kreuz, nie ein Fehler-Ton. Nach dem ersten Fehler folgt „Noch einmal probieren“.
 */
export function Rueckmeldung({
  aufgabeId,
  korrekt,
  versuch,
  erklaerung,
  onWeiter,
}: {
  aufgabeId: string;
  korrekt: boolean;
  versuch: 1 | 2;
  erklaerung: string;
  onWeiter: () => void;
}) {
  const nochmal = !korrekt && versuch === 1;
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-rueckmeldung" data-korrekt={korrekt}>
      <h1 id="h" className="rueckmeldung-text">
        {korrekt ? t('parcours.richtig') : erklaerung}
      </h1>
      <button type="button" className="btn btn-primary" data-testid="rueckmeldung-weiter" onClick={onWeiter}>
        {t(nochmal ? 'parcours.ueben.nochmal' : 'parcours.ueben.weiter')}
      </button>
      <VorleseKnopf dateien={korrekt ? vorlesenDateien(['parcours.richtig']) : datenAudio(`${aufgabeId}.fehler`)} />
    </section>
  );
}
