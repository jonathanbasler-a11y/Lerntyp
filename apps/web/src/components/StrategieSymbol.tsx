import type { Strategie } from '@lerntyp/shared';

const PFADE: Record<Strategie, React.ReactNode> = {
  gedaechtnis_training: (
    <>
      <path d="M10 24a14 14 0 0 1 24-10" />
      <path d="M35 6v9h-9" />
      <path d="M38 24a14 14 0 0 1-24 10" />
      <path d="M13 42v-9h9" />
    </>
  ),
  haeppchen_lernen: (
    <>
      <rect x="6" y="30" width="10" height="10" />
      <rect x="19" y="22" width="10" height="18" />
      <rect x="32" y="12" width="10" height="28" />
    </>
  ),
  doppelt_merken: (
    <>
      <circle cx="18" cy="24" r="12" />
      <circle cx="30" cy="24" r="12" />
    </>
  ),
  mischen: (
    <>
      <path d="M6 14h8l16 20h8" />
      <path d="M6 34h8l16-20h8" />
      <path d="M34 9l5 5-5 5" />
      <path d="M34 29l5 5-5 5" />
    </>
  ),
  warum_fragen: (
    <>
      <circle cx="24" cy="24" r="18" />
      <path d="M17.5 19a6.5 6.5 0 1 1 9.5 5.7c-2 1.2-3 2.3-3 5" />
      <circle cx="24" cy="35.5" r="1.4" fill="currentColor" />
    </>
  ),
  beispiele: (
    <>
      <rect x="10" y="6" width="28" height="36" rx="3" />
      <path d="M16 16h16M16 24h16M16 32h9" />
    </>
  ),
};

/** Eigenes Strategie-Symbol (reine SVG-Zeichnung, Linie in `currentColor`). */
export function StrategieSymbol({ strategie }: { strategie: Strategie }) {
  return (
    <svg viewBox="0 0 48 48" className="strategie-symbol" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {PFADE[strategie]}
    </svg>
  );
}
