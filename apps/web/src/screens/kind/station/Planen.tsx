import type { Station } from '@lerntyp/shared';
import { Smileys } from '../../../components/Smileys';
import { VorleseKnopf } from '../../../components/VorleseKnopf';
import { t, type TextKey } from '../../../text';

const ZIELE = [1, 2, 3, 4, 5] as const;

/** Planen, Teil 1: „Wie viele von 5 schaffst du?“ (01 §7.3). Das Ziel ist die eigene Erwartung, nie eine Vorgabe. */
export function ZielWahl({ station, onZiel }: { station: Station; onZiel: (ziel: number) => void }) {
  const titel = `parcours.station.${station}.titel` as TextKey;
  const einleitung = `parcours.station.${station}.einleitung` as TextKey;
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-planen-ziel" data-station={station}>
      <h1 id="h">{t(titel)}</h1>
      <p className="lead">{t(einleitung)}</p>
      <p className="lead frage">{t('parcours.planen.frage')}</p>
      <div className="ziel-reihe">
        {ZIELE.map((z) => (
          <button key={z} type="button" className="antwort-knopf ziel-knopf" data-testid={`ziel-${z}`} onClick={() => onZiel(z)}>
            {z}
          </button>
        ))}
      </div>
      <VorleseKnopf keys={[titel, einleitung, 'parcours.planen.frage']} />
    </section>
  );
}

/** Planen, Teil 2: „Wie sicher bist du?“ (vier Smileys mit Text). */
export function Sicherheit({ station, onSmiley }: { station: Station; onSmiley: (smiley: number) => void }) {
  return (
    <section className="screen" aria-labelledby="h" data-testid="schritt-planen-sicherheit" data-station={station}>
      <h1 id="h">{t('parcours.planen.sicherheit')}</h1>
      <Smileys labelPrefix="parcours.smiley" testId="sicher" onWahl={onSmiley} />
      <VorleseKnopf keys={['parcours.planen.sicherheit', 'parcours.smiley.1', 'parcours.smiley.2', 'parcours.smiley.3', 'parcours.smiley.4']} />
    </section>
  );
}
