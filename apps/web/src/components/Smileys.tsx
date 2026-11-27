import { t, type TextKey } from '../text';

type Wert = 1 | 2 | 3 | 4;
const WERTE: readonly Wert[] = [1, 2, 3, 4];
const MUND: Record<Wert, string> = {
  1: 'M15 33 Q24 26 33 33',
  2: 'M16 32 Q24 29 32 32',
  3: 'M15 29 Q24 36 33 29',
  4: 'M13 27 Q24 40 35 27',
};

function Gesicht({ wert }: { wert: Wert }) {
  return (
    <svg viewBox="0 0 48 48" className="smiley-bild" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="21" fill="#fbe9b7" stroke="#8a6d2b" strokeWidth="2.5" />
      <circle cx="17" cy="19" r="2.6" fill="#3a2a00" />
      <circle cx="31" cy="19" r="2.6" fill="#3a2a00" />
      <path d={MUND[wert]} fill="none" stroke="#3a2a00" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

/** Vier Smileys zum Antippen (Zuversicht vorher, „Passt das zu dir?“). Immer mit Text, nie nur Symbol; keine Farbwertung. */
export function Smileys({ labelPrefix, testId, onWahl }: { labelPrefix: 'parcours.smiley' | 'profil.smiley'; testId: string; onWahl: (wert: Wert) => void }) {
  return (
    <div className="smileys" role="group">
      {WERTE.map((w) => (
        <button key={w} type="button" className="smiley-knopf" data-testid={`${testId}-${w}`} onClick={() => onWahl(w)}>
          <Gesicht wert={w} />
          <span>{t(`${labelPrefix}.${w}` as TextKey)}</span>
        </button>
      ))}
    </div>
  );
}
