import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
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
