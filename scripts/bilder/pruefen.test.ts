import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { pruefeBilder, webpMasse } from './pruefen';

const root = resolve(__dirname, '../..');
const experiment = join(root, 'data/lerndetektive/experiment.json');
let tmp: string;

/** Erzeugt mit ffmpeg ein kleines WebP; `extra` wählt VP8 (lossy), VP8L (lossless) oder VP8X (mit Alpha). */
function webp(datei: string, b: number, h: number, extra: string[]): void {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `color=c=orange@0.5:s=${b}x${h}:d=0.04,format=rgba`, '-frames:v', '1', ...extra, datei]);
}

beforeAll(() => {
  tmp = mkdtempSync(join(tmpdir(), 'bilder-'));
});
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe('webpMasse', () => {
  it('liest VP8, VP8L und VP8X', () => {
    webp(join(tmp, 'lossy.webp'), 64, 48, ['-pix_fmt', 'yuv420p', '-c:v', 'libwebp']);
    webp(join(tmp, 'lossless.webp'), 33, 17, ['-c:v', 'libwebp', '-lossless', '1']);
    webp(join(tmp, 'alpha.webp'), 40, 24, ['-pix_fmt', 'yuva420p', '-c:v', 'libwebp']);
    const kopf = (n: string) => readFileSync(join(tmp, n)).subarray(12, 16).toString('ascii');
    expect(kopf('lossy.webp')).toBe('VP8 ');
    expect(kopf('lossless.webp')).toBe('VP8L');
    expect(kopf('alpha.webp')).toBe('VP8X');
    expect(webpMasse(readFileSync(join(tmp, 'lossy.webp')))).toEqual({ breite: 64, hoehe: 48 });
    expect(webpMasse(readFileSync(join(tmp, 'lossless.webp')))).toEqual({ breite: 33, hoehe: 17 });
    expect(webpMasse(readFileSync(join(tmp, 'alpha.webp')))).toEqual({ breite: 40, hoehe: 24 });
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
    webp(join(dir, 'kette.webp'), 512, 512, ['-pix_fmt', 'yuv420p', '-c:v', 'libwebp']);
    webp(join(dir, 'blume.webp'), 512, 300, ['-pix_fmt', 'yuv420p', '-c:v', 'libwebp']);
    webp(join(dir, 'brot.webp'), 256, 256, ['-pix_fmt', 'yuv420p', '-c:v', 'libwebp']);
    webp(join(dir, 'unbekannt.webp'), 512, 512, ['-pix_fmt', 'yuv420p', '-c:v', 'libwebp']);
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
