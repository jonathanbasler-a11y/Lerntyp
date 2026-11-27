import type { ProfilAnzeige } from '@lerntyp/shared';
import { t, type TextKey } from '../text';

/** Karten, Lern-Superkraft und Tipp für zu Hause: gemeinsam für Kind, Cockpit und Ausdruck. Texte nur aus data/profil/karten.json. */
export function ProfilInhalt({ anzeige, ueberschrift = 'h2' }: { anzeige: ProfilAnzeige; ueberschrift?: 'h2' | 'h3' }) {
  const Kopf = ueberschrift;
  return (
    <div className="profil-inhalt" data-testid="profil-inhalt">
      <Kopf>{t('profil.staerken')}</Kopf>
      <ul className="profil-karten">
        {anzeige.karten.map((k) => (
          <li key={k.id} className="profil-karte" data-testid="profil-karte" data-karte={k.id}>
            {k.text}
          </li>
        ))}
      </ul>
      <Kopf>{t('profil.superkraft')}</Kopf>
      <div className="profil-superkraft" data-testid="profil-superkraft" data-strategie={anzeige.superkraft.strategie}>
        <strong className="profil-superkraft-name">{t(`strategie.${anzeige.superkraft.strategie}` as TextKey)}</strong>
        <p>{anzeige.superkraft.text}</p>
      </div>
      <Kopf>{t('profil.tipp')}</Kopf>
      <p className="profil-tipp" data-testid="profil-tipp">
        {anzeige.tipp}
      </p>
    </div>
  );
}
