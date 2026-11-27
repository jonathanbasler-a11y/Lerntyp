import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MARKER, filesWithMarker } from './check-live';

describe('check-live', () => {
  it('findet den Marker rekursiv und ignoriert saubere Dateien', () => {
    const d = mkdtempSync(join(tmpdir(), 'live-'));
    mkdirSync(join(d, 'assets'));
    writeFileSync(join(d, 'assets', 'mock.js'), `x="${MARKER}"`);
    writeFileSync(join(d, 'assets', 'index.js'), 'ok');
    expect(filesWithMarker(d)).toEqual([join(d, 'assets', 'mock.js')]);
  });
});
