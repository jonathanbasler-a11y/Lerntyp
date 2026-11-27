import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MARKER = 'LERNTYP_MOCK_ADAPTER';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Zählt Dateien in `dir`, die den Marker enthalten. */
export function filesWithMarker(dir: string): string[] {
  return walk(dir).filter((f) => /\.(js|mjs|html|map|json|webmanifest)$/.test(f) && readFileSync(f, 'utf8').includes(MARKER));
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(fileURLToPath(import.meta.url), '../..');
  const live = join(root, 'apps/web/dist-live');
  const demo = join(root, 'apps/web/dist');
  let failed = false;
  if (!existsSync(live) || !existsSync(demo)) {
    console.error('dist und dist-live müssen existieren (npm run build && npm run build:live).');
    process.exit(1);
  }
  const inLive = filesWithMarker(live);
  const inDemo = filesWithMarker(demo);
  if (inLive.length > 0) {
    console.error(`FEHLER: Mock-Marker im Live-Build: ${inLive.join(', ')}`);
    failed = true;
  }
  if (inDemo.length === 0) {
    console.error('FEHLER: Mock-Marker fehlt im Demo-Build (Prüfung wirkungslos).');
    failed = true;
  }
  if (failed) process.exit(1);
  console.log('check:live ok – Mock nur im Demo-Build.');
}
