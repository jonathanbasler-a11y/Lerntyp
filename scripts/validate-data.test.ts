import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { validateDataDir } from './validate-data';

const root = resolve(__dirname, '..');

describe('validate-data', () => {
  it('echte /data ist gültig', () => {
    expect(validateDataDir(resolve(root, 'data'))).toEqual([]);
  });
  it('kaputte Fixture liefert Fehler', () => {
    const errors = validateDataDir(resolve(__dirname, 'test/fixtures/broken'));
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
  it('CLI beendet sich mit Exit-Code 1 bei kaputten Daten', () => {
    let code = 0;
    try {
      execFileSync('npx', ['tsx', 'scripts/validate-data.ts', 'scripts/test/fixtures/broken'], { cwd: root, stdio: 'pipe' });
    } catch (e) {
      code = (e as { status: number }).status;
    }
    expect(code).toBe(1);
  });
});

describe('validate-data: Audio und Bilder', () => {
  let tmp = '';
  /** Kopiert /data und die Audiodateien in ein Wegwerf-Repo (data/ + apps/web/public/audio). */
  const kopie = (): { data: string; audio: string; bilder: string } => {
    tmp = mkdtempSync(join(tmpdir(), 'validate-'));
    cpSync(resolve(root, 'data'), join(tmp, 'data'), { recursive: true });
    const pub = join(tmp, 'apps/web/public');
    mkdirSync(pub, { recursive: true });
    cpSync(resolve(root, 'apps/web/public/audio'), join(pub, 'audio'), { recursive: true });
    return { data: join(tmp, 'data'), audio: join(pub, 'audio'), bilder: join(pub, 'bilder') };
  };
  afterEach(() => tmp && rmSync(tmp, { recursive: true, force: true }));

  it('Kopie der echten Daten ist gültig', () => {
    expect(validateDataDir(kopie().data)).toEqual([]);
  });
  it('fehlende Audiodatei ist ein Fehler mit Hinweis', () => {
    const k = kopie();
    rmSync(join(k.audio, 'kette.mp3'));
    rmSync(join(k.audio, 'ui-start-titel.mp3'));
    const fehler = validateDataDir(k.data).join('\n');
    expect(fehler).toMatch(/Audiodatei fehlt: apps\/web\/public\/audio\/kette\.mp3/);
    expect(fehler).toMatch(/ui-start-titel\.mp3/);
    expect(fehler).toMatch(/npm run audio:erzeugen/);
  });
  it('veralteter Text (Hash passt nicht) ist ein Fehler', () => {
    const k = kopie();
    const pfad = join(k.data, 'lerndetektive/experiment.json');
    writeFileSync(pfad, readFileSync(pfad, 'utf8').replace('"wort": "Kette"', '"wort": "Ketten"'));
    const fehler = validateDataDir(k.data).join('\n');
    expect(fehler).toMatch(/Audio veraltet: kette\.mp3/);
    expect(fehler).toMatch(/npm run audio:erzeugen/);
  });
  it('manipulierter Manifest-Hash ist ein Fehler', () => {
    const k = kopie();
    const pfad = join(k.data, 'audio/manifest.json');
    const m = JSON.parse(readFileSync(pfad, 'utf8')) as { sha256: string }[];
    m[0]!.sha256 = '0'.repeat(64);
    writeFileSync(pfad, JSON.stringify(m));
    expect(validateDataDir(k.data).join('\n')).toMatch(/Audio veraltet|Hash von/);
  });
  it('bilder.json: gelistetes Bild ohne Datei ist ein Fehler, mit Datei nicht', () => {
    const k = kopie();
    writeFileSync(join(k.data, 'lerndetektive/bilder.json'), JSON.stringify({ vorhanden: ['kette', 'gibtesnicht'] }));
    let fehler = validateDataDir(k.data).join('\n');
    expect(fehler).toMatch(/Bild fehlt: apps\/web\/public\/bilder\/kette\.webp/);
    expect(fehler).toMatch(/„gibtesnicht“ ist kein Item/);
    mkdirSync(k.bilder, { recursive: true });
    writeFileSync(join(k.bilder, 'kette.webp'), 'x');
    writeFileSync(join(k.data, 'lerndetektive/bilder.json'), JSON.stringify({ vorhanden: ['kette'] }));
    fehler = validateDataDir(k.data).join('\n');
    expect(fehler).toBe('');
  });
});
