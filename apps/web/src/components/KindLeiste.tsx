import { useState } from 'react';
import { t } from '../text';

/** Pause und Hilfe sind auf jedem Kinder-Bildschirm erreichbar (02 §8: kein Druck, keine Nachfrage). */
export function KindLeiste({ onPause, onHilfe }: { onPause: () => void; onHilfe: () => void }) {
  const [hilfeGesendet, setHilfeGesendet] = useState(false);
  return (
    <div className="kind-leiste">
      <button
        type="button"
        className="btn btn-quiet"
        data-testid="hilfe-knopf"
        onClick={() => {
          onHilfe();
          setHilfeGesendet(true);
        }}
      >
        {t('kind.hilfe')}
      </button>
      {hilfeGesendet && (
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
