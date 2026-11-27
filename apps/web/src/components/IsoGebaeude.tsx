import type { Raster } from '@lerntyp/shared';

const TW = 26; // halbe Breite einer Würfelfläche
const TH = 13; // halbe Höhe der Deckfläche
const CH = 24; // Höhe eines Würfels

type Punkt = readonly [number, number];
interface Flaeche {
  punkte: readonly Punkt[];
  fuell: string;
  schluessel: string;
}

const DECKE = '#f4e1b5';
const VORNE = '#d4a85a';
const RECHTS = '#b88a3e';

/**
 * Würfelgebäude als isometrische Zeichnung aus einem Höhenraster (Zeile 0 = hinten, Spalte 0 = links).
 * Eigene Zeichnung in reinem SVG: je Würfel Deckfläche und zwei Seitenflächen in drei Helligkeiten, hinten zuerst gemalt.
 * Blick von vorn rechts: Seitenflächen nach vorn (+Zeile) und nach rechts (+Spalte) sind sichtbar.
 */
export function flaechenFuer(raster: Raster): Flaeche[] {
  const flaechen: Flaeche[] = [];
  const zeilen = raster.length;
  const spalten = raster[0]?.length ?? 0;
  const zellen: { r: number; c: number }[] = [];
  for (let r = 0; r < zeilen; r++) for (let c = 0; c < spalten; c++) zellen.push({ r, c });
  // Boden
  for (const { r, c } of zellen) {
    const x = (c - r) * TW;
    const y = (c + r) * TH;
    flaechen.push({ schluessel: `boden-${r}-${c}`, fuell: '#ece4d2', punkte: [[x, y], [x + TW, y + TH], [x, y + 2 * TH], [x - TW, y + TH]] });
  }
  // Würfel: weit entfernte Zellen zuerst, innerhalb eines Stapels von unten nach oben.
  zellen.sort((a, b) => a.r + a.c - (b.r + b.c) || a.r - b.r);
  for (const { r, c } of zellen) {
    const hoehe = raster[r]?.[c] ?? 0;
    for (let z = 0; z < hoehe; z++) {
      const x = (c - r) * TW;
      const y = (c + r) * TH - z * CH;
      const oben = y - CH;
      const k = `${r}-${c}-${z}`;
      flaechen.push({ schluessel: `l-${k}`, fuell: VORNE, punkte: [[x - TW, oben + TH], [x, oben + 2 * TH], [x, oben + 2 * TH + CH], [x - TW, oben + TH + CH]] });
      flaechen.push({ schluessel: `r-${k}`, fuell: RECHTS, punkte: [[x, oben + 2 * TH], [x + TW, oben + TH], [x + TW, oben + TH + CH], [x, oben + 2 * TH + CH]] });
      flaechen.push({ schluessel: `t-${k}`, fuell: DECKE, punkte: [[x, oben], [x + TW, oben + TH], [x, oben + 2 * TH], [x - TW, oben + TH]] });
    }
  }
  return flaechen;
}

export function IsoGebaeude({ raster, label, testId }: { raster: Raster; label: string; testId?: string }) {
  const flaechen = flaechenFuer(raster);
  const xs = flaechen.flatMap((f) => f.punkte.map((p) => p[0]));
  const ys = flaechen.flatMap((f) => f.punkte.map((p) => p[1]));
  const pad = 6;
  const x0 = Math.min(...xs) - pad;
  const y0 = Math.min(...ys) - pad;
  const breite = Math.max(...xs) + pad - x0;
  const hoehe = Math.max(...ys) + pad - y0;
  return (
    <svg viewBox={`${x0} ${y0} ${breite} ${hoehe}`} className="iso-gebaeude" role="img" aria-label={label} data-testid={testId} style={{ aspectRatio: `${breite} / ${hoehe}` }}>
      {flaechen.map((f) => (
        <polygon key={f.schluessel} points={f.punkte.map((p) => p.join(',')).join(' ')} fill={f.fuell} stroke="#5c3f10" strokeWidth="1.3" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
