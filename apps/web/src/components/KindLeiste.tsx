import { useEffect, useState } from 'react';
import { t } from '../text';

const HILFE_ANZEIGE_MS = 10_000;

/**
 * Pause und Hilfe sind auf jedem Kinder-Bildschirm erreichbar (02 §8: kein Druck, keine Nachfrage).
 * Die Bestätigung „Die Lehrkraft weiß Bescheid“ verschwindet beim nächsten Schritt oder nach 10 s.
 */
export function KindLeiste({ schrittId, onPause, onHilfe }: { schrittId: string; onPause: () => void; onHilfe: () => void }) {
  const [hilfeBei, setHilfeBei] = useState<string | null>(null);
  const zeigeHilfe = hilfeBei === schrittId;
  const hilfeAktiv = hilfeBei !== null;
  useEffect(() => {
    if (!hilfeAktiv) return;
    const timer = setTimeout(() => setHilfeBei(null), HILFE_ANZEIGE_MS);
    return () => clearTimeout(timer);
  }, [hilfeAktiv]);
  return (
    <div className="kind-leiste">
      <button
        type="button"
        className="btn btn-quiet"
        data-testid="hilfe-knopf"
        onClick={() => {
          onHilfe();
          setHilfeBei(schrittId);
        }}
      >
        {t('kind.hilfe')}
      </button>
      {zeigeHilfe && (
        <span className="hint" role="status">
          {t('kind.hilfe.gesendet')}
        </span>
      )}
      <button type="button" className="btn btn-quiet" data-testid="pause-knopf" onClick={onPause}>
        {t('kind.pause')}
      </button>
    </div>
  );
}
