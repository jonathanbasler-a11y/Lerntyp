/**
 * Deterministischer Zufallsgenerator (mulberry32) für reproduzierbare Reihenfolgen (02 §5.3:
 * „Der Zufalls-Seed wird gespeichert, sodass die Reihenfolge reproduzierbar ist“).
 * Nicht kryptografisch – nur für Ausbalancierung und Reihenfolgen.
 */
export type Zufall = () => number;

export function erzeugeZufall(seed: number): Zufall {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Leitet aus einem Teilnehmer-Seed einen unabhängigen Seed für einen Zweck ab (z. B. „sofort“). */
export function ableitenSeed(seed: number, zweck: string): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  for (let i = 0; i < zweck.length; i++) {
    h = Math.imul(h ^ zweck.charCodeAt(i), 0x01000193) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  return h >>> 0;
}

/** Fisher-Yates mit gegebenem Zufall; gibt eine neue Liste zurück. */
export function mische<T>(liste: readonly T[], zufall: Zufall): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Erzeugt einen neuen 32-Bit-Seed (beim Beitritt; danach wird er gespeichert). */
export function neuerSeed(): number {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0]!;
}
