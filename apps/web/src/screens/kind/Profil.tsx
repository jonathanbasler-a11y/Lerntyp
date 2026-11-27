import type { ProfilAnzeige } from '@lerntyp/shared';
import { ProfilInhalt } from '../../components/ProfilInhalt';
import { Smileys } from '../../components/Smileys';
import { VorleseKnopf } from '../../components/VorleseKnopf';
import { vorlesenDateien } from '../../lerndetektive/audio';
import { datenAudio } from '../../parcours/audio';
import { t } from '../../text';

/**
 * „Mein Lernprofil“ (01 §7.4): drei Karten mit beobachtetem Verhalten, Lern-Superkraft, Tipp für zu Hause, danach „Passt das zu dir?“.
 * Keine Zahlen, keine Typ-Aussage. Nach der Antwort folgt „Fertig für heute“, ohne weiteren Knopf zu neuen Inhalten.
 */
export function Profil({ anzeige, onPasst }: { anzeige: ProfilAnzeige; onPasst: (smiley: number) => void }) {
  const dateien = [
    ...vorlesenDateien(['profil.titel', 'profil.staerken']),
    ...anzeige.karten.flatMap((k) => (k.station === null ? datenAudio('fallback') : datenAudio(`karte.${k.id}`))),
    ...vorlesenDateien(['profil.superkraft']),
    ...datenAudio(`superkraft.${anzeige.superkraft.strategie}`),
    ...vorlesenDateien(['profil.tipp']),
    ...datenAudio(`tipp.${anzeige.superkraft.strategie}`),
    ...vorlesenDateien(['profil.passt', 'profil.smiley.1', 'profil.smiley.2', 'profil.smiley.3', 'profil.smiley.4']),
  ];
  return (
    <section className="screen screen-profil" aria-labelledby="h" data-testid="schritt-profil">
      <h1 id="h">{t('profil.titel')}</h1>
      <ProfilInhalt anzeige={anzeige} />
      <h2>{t('profil.passt')}</h2>
      <Smileys labelPrefix="profil.smiley" testId="passt" onWahl={onPasst} />
      <VorleseKnopf dateien={dateien} />
    </section>
  );
}
