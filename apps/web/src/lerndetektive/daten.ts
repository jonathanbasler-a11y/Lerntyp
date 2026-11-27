import { LerndetektiveDatenSchema, type Item } from '@lerntyp/shared';
import roh from '@data/lerndetektive/experiment.json';
import bilderRoh from '@data/lerndetektive/bilder.json';
import platzhalterRoh from '@data/lerndetektive/platzhalter.json';

/** Inhalte der Lerndetektive, beim Start gegen das Schema geprüft (Quelle: /data). */
export const daten = LerndetektiveDatenSchema.parse(roh);

export interface PlatzhalterStil {
  farbe: string;
  form: string;
}
export const platzhalter = platzhalterRoh.kategorien as Readonly<Record<string, PlatzhalterStil>>;

const nachId = new Map<string, Item>(daten.items.map((i) => [i.id, i]));
export function itemFuer(id: string): Item {
  const it = nachId.get(id);
  if (!it) throw new Error(`Unbekanntes Item „${id}“`);
  return it;
}

/** Items mit echtem Bild (data/lerndetektive/bilder.json, erzeugt von `npm run bilder:pruefen`); alle anderen zeigen den Platzhalter. */
export const echteBilder: ReadonlySet<string> = new Set(bilderRoh.vorhanden);
