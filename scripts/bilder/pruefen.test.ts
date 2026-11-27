import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pruefeBilder, webpMasse } from './pruefen';

const root = resolve(__dirname, '../..');
const experiment = join(root, 'data/lerndetektive/experiment.json');
let tmp: string;

/**
 * Eingecheckte Mini-WebPs (einmalig mit ffmpeg erzeugt), damit der Test kein ffmpeg braucht:
 * VP8 (lossy), VP8L (lossless), VP8X (mit Alpha) und Größenvarianten.
 */
const FIX = join(__dirname, 'test/fixtures');
const fixture = (n: string) => readFileSync(join(FIX, n));

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'bilder-'));
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe('webpMasse', () => {
  it('liest VP8, VP8L und VP8X', () => {
    const kopf = (n: string) => fixture(n).subarray(12, 16).toString('ascii');
    expect(kopf('lossy-64x48.webp')).toBe('VP8 ');
    expect(kopf('lossless-33x17.webp')).toBe('VP8L');
    expect(kopf('alpha-40x24.webp')).toBe('VP8X');
    expect(webpMasse(fixture('lossy-64x48.webp'))).toEqual({ breite: 64, hoehe: 48 });
    expect(webpMasse(fixture('lossless-33x17.webp'))).toEqual({ breite: 33, hoehe: 17 });
    expect(webpMasse(fixture('alpha-40x24.webp'))).toEqual({ breite: 40, hoehe: 24 });
  });
  it('gibt null für Unsinn zurück', () => {
    expect(webpMasse(new Uint8Array(40))).toBeNull();
    expect(webpMasse(new TextEncoder().encode('RIFF....WEBPVP8 ...........................'))).toBeNull();
  });
});

describe('pruefeBilder', () => {
  it('erkennt gültige, falsche und fehlende Bilder', () => {
    const dir = join(tmp, 'bilder');
    mkdirSync(dir);
    copyFileSync(join(FIX, 'quadrat-512.webp'), join(dir, 'kette.webp'));
    copyFileSync(join(FIX, 'breit-512x300.webp'), join(dir, 'blume.webp'));
    copyFileSync(join(FIX, 'klein-256.webp'), join(dir, 'brot.webp'));
    copyFileSync(join(FIX, 'quadrat-512.webp'), join(dir, 'unbekannt.webp'));
    writeFileSync(join(dir, 'ente.webp'), 'kein webp');
    writeFileSync(join(dir, 'notiz.txt'), 'x');
    const erg = pruefeBilder(dir, experiment);
    expect(erg.vorhanden).toEqual(['kette']);
    expect(erg.fehlend).toHaveLength(119);
    expect(erg.fehler.join('\n')).toMatch(/blume\.webp: nicht quadratisch/);
    expect(erg.fehler.join('\n')).toMatch(/brot\.webp: 256×256, erwartet 512×512/);
    expect(erg.fehler.join('\n')).toMatch(/unbekannt\.webp: „unbekannt“ ist kein Item/);
    expect(erg.fehler.join('\n')).toMatch(/ente\.webp: keine gültige WebP-Datei/);
    expect(erg.fehler.join('\n')).toMatch(/notiz\.txt: erwartet <item-id>\.webp/);
  });
  it('fehlender Ordner = keine Bilder, kein Fehler', () => {
    const erg = pruefeBilder(join(tmp, 'gibt-es-nicht'), experiment);
    expect(erg.vorhanden).toEqual([]);
    expect(erg.fehler).toEqual([]);
  });
});
