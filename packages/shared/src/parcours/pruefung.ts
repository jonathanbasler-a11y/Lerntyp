import type { GrundArt, S1Aufgabe, S2Aufgabe, S2Daten, S3Aufgabe } from './daten';

/** Richtigkeitsprüfungen der Stationen. Reine Funktionen; das Ergebnis geht als `korrekt` ins Ereignis. */

export interface S1Ergebnis {
  korrekt: boolean;
  buchstabe_ok: boolean;
  grund_ok: boolean;
}

/** S1: Buchstabe **und** Begründungsart müssen stimmen. */
export function pruefeS1(aufgabe: Pick<S1Aufgabe, 'richtig' | 'grund'>, eingabe: { buchstabe: string; grund: GrundArt }): S1Ergebnis {
  const buchstabe_ok = eingabe.buchstabe === aufgabe.richtig;
  const grund_ok = eingabe.grund === aufgabe.grund.art;
  return { korrekt: buchstabe_ok && grund_ok, buchstabe_ok, grund_ok };
}

export interface S2Ergebnis {
  korrekt: boolean;
  /** Reihenfolge steht in `erlaubte_reihenfolgen`. */
  grammatisch: boolean;
  /** Erster Block ist ein anderer als im Originalsatz. */
  anderer_anfang: boolean;
}

/** S2: `reihenfolge` = Block-Indizes in der gebauten Reihenfolge. Richtig = erlaubt und anderer erster Block. */
export function pruefeS2(aufgabe: Pick<S2Aufgabe, 'erlaubte_reihenfolgen' | 'bloecke'>, reihenfolge: readonly number[]): S2Ergebnis {
  const grammatisch = aufgabe.erlaubte_reihenfolgen.some((r) => r.length === reihenfolge.length && r.every((v, i) => v === reihenfolge[i]));
  const anderer_anfang = reihenfolge.length > 0 && reihenfolge[0] !== 0;
  return { korrekt: grammatisch && anderer_anfang, grammatisch, anderer_anfang };
}

/** Satz zur Anzeige: erster Buchstabe groß, Block-Texte wie gespeichert, Punkt am Ende (Regeln in `S2Daten.anzeige`). */
export function satzText(blockTexte: readonly string[], reihenfolge: readonly number[], anzeige: S2Daten['anzeige'] = { satzanfang: 'erster_buchstabe_gross', satzende: '.' }): string {
  const teile = reihenfolge.map((i) => blockTexte[i] ?? '');
  const roh = teile.join(' ');
  return roh.charAt(0).toUpperCase() + roh.slice(1) + anzeige.satzende;
}

/** Block-Text an einer Position: nur am Satzanfang wird der erste Buchstabe groß. */
export function blockAnzeige(text: string, immerGross: boolean, amAnfang: boolean): string {
  if (amAnfang) return text.charAt(0).toUpperCase() + text.slice(1);
  return immerGross ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

/** S3: Antwort ist die Id des gewählten Bauplans. */
export function pruefeS3(aufgabe: Pick<S3Aufgabe, 'richtig'>, gewaehlt: 'a' | 'b' | 'c'): boolean {
  return gewaehlt === aufgabe.richtig;
}
