import type { Raster } from '@lerntyp/shared';

/** Draufsicht: je Feld die Zahl der gestapelten Würfel (Mathe-Inhalt, kein Punktestand). Zeile 0 = hinten, Spalte 0 = links. */
export function Bauplan({ raster, testId }: { raster: Raster; testId?: string }) {
  const spalten = raster[0]?.length ?? 1;
  return (
    <div className="bauplan" style={{ gridTemplateColumns: `repeat(${spalten}, 1fr)` }} data-testid={testId}>
      {raster.flatMap((zeile, r) =>
        zeile.map((h, c) => (
          <span key={`${r}-${c}`} className="bauplan-feld">
            {h}
          </span>
        )),
      )}
    </div>
  );
}
