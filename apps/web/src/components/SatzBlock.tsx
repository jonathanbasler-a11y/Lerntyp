import type { SATZGLIED_ARTEN } from '@lerntyp/shared';

type Art = (typeof SATZGLIED_ARTEN)[number];

/** Farbe und Form je Satzglied (nie nur Farbe): so sind die Blöcke auch ohne Farbsehen unterscheidbar. */
const STIL: Record<Art, { farbe: string; form: React.ReactNode }> = {
  subjekt: { farbe: '#2f6fa8', form: <circle cx="10" cy="10" r="7" /> },
  praedikat: { farbe: '#b5483a', form: <rect x="3" y="3" width="14" height="14" /> },
  ort: { farbe: '#3c8a5a', form: <polygon points="10,3 18,17 2,17" /> },
  dativobjekt: { farbe: '#8e5aa8', form: <polygon points="10,2 18,10 10,18 2,10" /> },
  akkusativobjekt: { farbe: '#b8731a', form: <polygon points="6,3 14,3 19,10 14,17 6,17 1,10" /> },
  zeit: { farbe: '#237f8a', form: <polygon points="10,2 12.4,7.6 18.5,8 13.8,12 15.3,18 10,14.8 4.7,18 6.2,12 1.5,8 7.6,7.6" /> },
  art_und_weise: { farbe: '#7a6a2e', form: <path d="M3 16 A8 8 0 0 1 17 16 Z" /> },
};

export function SatzBlock({ art, text, onClick, disabled, testId, gewaehlt }: { art: Art; text: string; onClick?: () => void; disabled?: boolean; testId?: string; gewaehlt?: boolean }) {
  const stil = STIL[art];
  const inhalt = (
    <>
      <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true" focusable="false" fill={stil.farbe}>
        {stil.form}
      </svg>
      <span>{text}</span>
    </>
  );
  const stilWerte = { '--block': stil.farbe } as React.CSSProperties;
  if (!onClick) {
    return (
      <span className="satz-block" style={stilWerte} data-art={art} data-testid={testId}>
        {inhalt}
      </span>
    );
  }
  return (
    <button type="button" className="satz-block satz-block-knopf" style={stilWerte} data-art={art} data-testid={testId} disabled={disabled} aria-pressed={gewaehlt} onClick={onClick}>
      {inhalt}
    </button>
  );
}
