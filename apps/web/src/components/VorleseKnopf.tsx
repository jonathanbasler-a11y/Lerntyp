import { useEffect } from 'react';
import { spieleFolge, stoppe, vorlesenDateien } from '../lerndetektive/audio';
import { t, type TextKey } from '../text';

/**
 * Vorlese-Knopf (01 §8): spielt vorproduzierte Audiodateien, nur auf Tipp, nie automatisch.
 * `keys` = Textschlüssel des Bildschirms mit Eintrag in data/audio/vorlesen.json, `dateien` = direkte Audiodateien (Aussagen U/V).
 * Ohne Audio bleibt der Knopf deaktiviert.
 */
export function VorleseKnopf({ keys = [], dateien = [] }: { keys?: readonly TextKey[]; dateien?: readonly string[] }) {
  const liste = [...vorlesenDateien(keys), ...dateien];
  const aktiv = liste.length > 0;
  useEffect(() => stoppe, []);
  return (
    <button
      type="button"
      className="btn btn-quiet vorlesen"
      disabled={!aktiv}
      title={aktiv ? undefined : t('vorlesen.hinweis')}
      aria-label={aktiv ? t('vorlesen.label') : t('vorlesen.hinweis')}
      data-testid="vorlesen"
      onClick={() => spieleFolge(liste)}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
        <path d="M3 9v6h4l5 4V5L7 9H3z" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>{t('vorlesen.label')}</span>
    </button>
  );
}
