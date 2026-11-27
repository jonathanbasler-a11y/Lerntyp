import type { Item } from '@lerntyp/shared';
import { platzhalter } from '../lerndetektive/daten';
import { t } from '../text';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

/**
 * Platzhalterbild (ohne sichtbaren Text, nur `aria-label`): Farbe und Form nur nach Kategorie, ohne Buchstaben und ohne Wort,
 * damit die Bedingung „bild“ das Wort nicht verrät. Die echten Illustrationen kommen später.
 */
export function PlatzhalterBild({ item }: { item: Item }) {
  const stil = platzhalter[item.kategorie] ?? { farbe: '#6c7a84', form: 'M10 10H90V90H10Z' };
  const h = hash(item.id);
  const drehung = ((h % 5) - 2) * 7;
  const punkte = [0, 1, 2].map((i) => ({ x: 24 + ((h >>> (i * 5)) % 150), y: 24 + ((h >>> (i * 5 + 3)) % 110), r: 4 + ((h >>> (i + 9)) % 5) }));
  return (
    <svg className="platzhalter" viewBox="0 0 200 210" role="img" aria-label={t('bild.platzhalter')} data-testid="platzhalter-bild">
      <rect x="2" y="2" width="196" height="206" rx="24" fill={stil.farbe} fillOpacity="0.16" stroke={stil.farbe} strokeOpacity="0.5" strokeWidth="3" />
      {punkte.map((p) => (
        <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r={p.r} fill={stil.farbe} fillOpacity="0.28" />
      ))}
      <g transform={`rotate(${drehung} 100 92) translate(30 22) scale(1.4)`}>
        <path d={stil.form} fill={stil.farbe} />
      </g>
    </svg>
  );
}
