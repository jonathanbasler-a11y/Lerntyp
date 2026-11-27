import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOLL_KANTE = 512;

/** Liest Breite und Höhe aus dem WebP-Kopf (VP8, VP8L, VP8X); `null` bei ungültigen Daten. */
export function webpMasse(buf: Uint8Array): { breite: number; hoehe: number } | null {
  const text = (o: number, n: number) => String.fromCharCode(...buf.subarray(o, o + n));
  if (buf.length < 30 || text(0, 4) !== 'RIFF' || text(8, 4) !== 'WEBP') return null;
  const art = text(12, 4);
  const d = 20; // Beginn der Chunk-Daten
  if (art === 'VP8 ') {
    if (buf[d + 3] !== 0x9d || buf[d + 4] !== 0x01 || buf[d + 5] !== 0x2a) return null;
    return { breite: (buf[d + 6]! | (buf[d + 7]! << 8)) & 0x3fff, hoehe: (buf[d + 8]! | (buf[d + 9]! << 8)) & 0x3fff };
  }
  if (art === 'VP8L') {
    if (buf[d] !== 0x2f) return null;
    const b = buf[d + 1]! | (buf[d + 2]! << 8) | (buf[d + 3]! << 16) | (buf[d + 4]! << 24);
    return { breite: (b & 0x3fff) + 1, hoehe: ((b >>> 14) & 0x3fff) + 1 };
  }
  if (art === 'VP8X') {
    return {
      breite: 1 + (buf[d + 4]! | (buf[d + 5]! << 8) | (buf[d + 6]! << 16)),
      hoehe: 1 + (buf[d + 7]! | (buf[d + 8]! << 8) | (buf[d + 9]! << 16)),
    };
  }
  return null;
}

export interface Pruefergebnis {
  vorhanden: string[];
  fehlend: string[];
  fehler: string[];
}

/** Prüft `bilderDir` gegen die Item-IDs aus `experimentPfad`; Reihenfolge der Listen = Item-Reihenfolge. */
export function pruefeBilder(bilderDir: string, experimentPfad: string): Pruefergebnis {
  const exp = JSON.parse(readFileSync(experimentPfad, 'utf8')) as { items: { id: string }[] };
  const ids = exp.items.map((i) => i.id);
  const bekannt = new Set(ids);
  const dateien = existsSync(bilderDir) ? readdirSync(bilderDir).filter((n) => !n.startsWith('.')) : [];
  const gueltig = new Set<string>();
  const fehler: string[] = [];
  for (const name of dateien.sort()) {
    const m = /^([a-z0-9_]+)\.webp$/.exec(name);
    if (!m) {
      fehler.push(`${name}: erwartet <item-id>.webp`);
      continue;
    }
    const id = m[1]!;
    if (!bekannt.has(id)) {
      fehler.push(`${name}: „${id}“ ist kein Item`);
      continue;
    }
    const masse = webpMasse(readFileSync(join(bilderDir, name)));
    if (!masse) fehler.push(`${name}: keine gültige WebP-Datei`);
    else if (masse.breite !== masse.hoehe) fehler.push(`${name}: nicht quadratisch (${masse.breite}×${masse.hoehe})`);
    else if (masse.breite !== SOLL_KANTE) fehler.push(`${name}: ${masse.breite}×${masse.hoehe}, erwartet ${SOLL_KANTE}×${SOLL_KANTE}`);
    else gueltig.add(id);
  }
  return { vorhanden: ids.filter((i) => gueltig.has(i)), fehlend: ids.filter((i) => !gueltig.has(i)), fehler };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(fileURLToPath(import.meta.url), '../../..');
  const erg = pruefeBilder(join(root, 'apps/web/public/bilder'), join(root, 'data/lerndetektive/experiment.json'));
  writeFileSync(join(root, 'data/lerndetektive/bilder.json'), `${JSON.stringify({ vorhanden: erg.vorhanden }, null, 2)}\n`);
  console.log(`Bilder: ${erg.vorhanden.length} von ${erg.vorhanden.length + erg.fehlend.length} vorhanden und gültig (data/lerndetektive/bilder.json geschrieben).`);
  if (erg.fehlend.length > 0) console.log(`Es fehlen ${erg.fehlend.length}: ${erg.fehlend.join(', ')}`);
  if (erg.fehler.length > 0) {
    console.error(`Fehler:\n- ${erg.fehler.join('\n- ')}`);
    process.exit(1);
  }
}
