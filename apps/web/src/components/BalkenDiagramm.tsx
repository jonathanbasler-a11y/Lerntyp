import { useId } from 'react';
import type { Bedingung } from '@lerntyp/shared';
import { bedingungLabel, formatProzent, type Balken, type BalkenGruppe } from '../lerndetektive/diagramm';
import { t } from '../text';

/** Farbe, Muster und Symbol je Bedingung: Das Diagramm ist nie nur durch Farbe lesbar (02 §7.1). */
const STIL: Record<Bedingung, { farbe: string; dunkel: string; symbol: string }> = {
  wort: { farbe: '#2b6cb0', dunkel: '#173f6b', symbol: 'M0 -9L9 7H-9Z' }, // Dreieck
  bild: { farbe: '#c05621', dunkel: '#6e2f0e', symbol: 'M0 -8A8 8 0 1 1 -0.01 -8Z' }, // Kreis
  bild_wort: { farbe: '#6b46a8', dunkel: '#3a2262', symbol: 'M0 -10L9 0L0 10L-9 0Z' }, // Raute
};
const REIHENFOLGE: Bedingung[] = ['wort', 'bild', 'bild_wort'];

const B = 800;
const H = 460;
const LINKS = 70;
const RECHTS = 16;
const OBEN_BASIS = 64;
const LEGENDE_ZEILE2 = 34;
const UNTEN = 120;
const PLOT_B = B - LINKS - RECHTS;
const TICKS = [0, 0.25, 0.5, 0.75, 1];

function Muster({ id, mitWoche }: { id: string; mitWoche: boolean }) {
  return (
    <defs>
      {mitWoche &&
        REIHENFOLGE.map((b) => {
          const { farbe, dunkel } = STIL[b];
          // „nach 1 Woche“: gleiche Farbe wie „sofort“, dazu ein dunkles Gitter (ohne Neigung, anders als jedes Sofort-Muster).
          return (
            <pattern key={`${b}-woche`} id={`${id}-${b}-woche`} width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill={farbe} fillOpacity={b === 'bild_wort' ? 1 : 0.3} />
              <rect y="4" width="10" height="2" fill={dunkel} fillOpacity="0.85" />
              <rect x="4" width="2" height="10" fill={dunkel} fillOpacity="0.85" />
            </pattern>
          );
        })}
      {mitWoche && (
        <pattern id={`${id}-woche-neutral`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#e6e1d6" />
          <rect y="4" width="10" height="2" fill="#26323a" fillOpacity="0.8" />
          <rect x="4" width="2" height="10" fill="#26323a" fillOpacity="0.8" />
        </pattern>
      )}
      {REIHENFOLGE.map((b) => {
        const { farbe } = STIL[b];
        return (
          <pattern key={b} id={`${id}-${b}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform={b === 'wort' ? 'rotate(45)' : undefined}>
            <rect width="10" height="10" fill={farbe} fillOpacity={b === 'bild_wort' ? 1 : 0.22} />
            {b === 'wort' && <rect width="4" height="10" fill={farbe} />}
            {b === 'bild' && <circle cx="5" cy="5" r="2.6" fill={farbe} />}
            {b === 'bild_wort' && <rect y="4" width="10" height="2" fill="#ffffff" fillOpacity="0.55" />}
          </pattern>
        );
      })}
    </defs>
  );
}

function zeilenLabel(gruppe: string, bk: Balken): string {
  return bk.srLabel ?? `${gruppe} – ${bedingungLabel(bk.bedingung)}`;
}

/** Gruppiertes Balkendiagramm (reines SVG, keine Diagramm-Bibliothek). */
export function BalkenDiagramm({ gruppen, titel, testId }: { gruppen: BalkenGruppe[]; titel: string; testId: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const anzahlBalken = gruppen.reduce((s, g) => s + g.balken.length, 0);
  const beschriften = anzahlBalken <= 6;
  const mitWoche = gruppen.some((g) => g.balken.some((bk) => bk.verzoegert));
  const OBEN = OBEN_BASIS + (mitWoche ? LEGENDE_ZEILE2 : 0);
  const PLOT_H = H - OBEN - UNTEN;
  const gruppenBreite = PLOT_B / gruppen.length;
  const y = (wert: number) => OBEN + PLOT_H * (1 - Math.min(1, Math.max(0, wert)));

  return (
    <figure className="diagramm" data-testid={testId}>
      <svg viewBox={`0 0 ${B} ${H}`} role="img" aria-label={titel}>
        <title>{titel}</title>
        <Muster id={id} mitWoche={mitWoche} />
        {/* Legende: Farbe, Muster und Symbol */}
        {REIHENFOLGE.map((b, i) => (
          <g key={b} transform={`translate(${LINKS + i * 220} 12)`}>
            <rect width="34" height="26" rx="4" fill={`url(#${id}-${b})`} stroke={STIL[b].farbe} strokeWidth="2" />
            <path d={STIL[b].symbol} transform="translate(52 14) scale(0.9)" fill={STIL[b].farbe} />
            <text x="70" y="19" fontSize="17" fill="#26323a">
              {bedingungLabel(b)}
            </text>
          </g>
        ))}
        {mitWoche && (
          <g transform={`translate(${LINKS} 46)`}>
            <rect width="34" height="26" rx="4" fill={`url(#${id}-woche-neutral)`} stroke="#26323a" strokeWidth="3" />
            <text x="48" y="19" fontSize="17" fill="#26323a">
              {t('beamer.woche_legende')}
            </text>
          </g>
        )}
        {/* Achse */}
        {TICKS.map((tk) => (
          <g key={tk}>
            <line x1={LINKS} x2={B - RECHTS} y1={y(tk)} y2={y(tk)} stroke="#d9d0c0" strokeWidth={tk === 0 ? 2 : 1} />
            <text x={LINKS - 8} y={y(tk) + 5} textAnchor="end" fontSize="15" fill="#55646d">
              {formatProzent(tk)}
            </text>
          </g>
        ))}
        <text transform={`translate(18 ${OBEN + PLOT_H / 2}) rotate(-90)`} textAnchor="middle" fontSize="15" fill="#55646d">
          {t('beamer.achse')}
        </text>
        {gruppen.map((g, gi) => {
          const breite = Math.min(96, (gruppenBreite * 0.8) / g.balken.length);
          const x0 = LINKS + gi * gruppenBreite + (gruppenBreite - breite * g.balken.length) / 2;
          const zeilen = g.label.split(': ');
          return (
            <g key={g.id}>
              {g.balken.map((bk, bi) => {
                const x = x0 + bi * breite;
                const wert = bk.wert;
                const top = wert === null ? y(0) : y(wert);
                const stil = STIL[bk.bedingung];
                return (
                  <g key={`${bk.bedingung}-${bi}`} data-testid={`balken-${g.id}-${bk.bedingung}${bk.verzoegert ? '-woche' : ''}`}>
                    <rect
                      x={x + 4}
                      y={top}
                      width={breite - 8}
                      height={y(0) - top}
                      fill={`url(#${id}-${bk.bedingung}${bk.verzoegert ? '-woche' : ''})`}
                      stroke={bk.verzoegert ? stil.dunkel : stil.farbe}
                      strokeWidth={bk.verzoegert ? 4 : 3}
                    />
                    <text x={x + breite / 2} y={top - 8} textAnchor="middle" fontSize="17" fontWeight="700" fill="#26323a">
                      {formatProzent(wert)}
                    </text>
                    <path d={stil.symbol} transform={`translate(${x + breite / 2} ${y(0) + 20}) scale(0.8)`} fill={stil.farbe} />
                    {beschriften && (
                      <text x={x + breite / 2} y={y(0) + 46} textAnchor="middle" fontSize="15" fill="#26323a">
                        {bk.label}
                      </text>
                    )}
                  </g>
                );
              })}
              {zeilen.map((z, zi) => (
                <text key={z} x={LINKS + gi * gruppenBreite + gruppenBreite / 2} y={y(0) + 76 + zi * 22} textAnchor="middle" fontSize="18" fontWeight="700" fill="#26323a">
                  {z}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{titel}</caption>
        <tbody>
          {gruppen.flatMap((g) =>
            g.balken.map((bk, i) => (
              <tr key={`${g.id}-${i}`}>
                <th scope="row">{zeilenLabel(g.label, bk)}</th>
                <td>{formatProzent(bk.wert)}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </figure>
  );
}
