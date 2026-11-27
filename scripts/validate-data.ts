import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DemoSchema, TexteSchema } from '../packages/shared/src/data';
import { LerndetektiveDatenSchema } from '../packages/shared/src/lerndetektive/daten';

const FILES = [
  { rel: 'texte/de.json', schema: TexteSchema },
  { rel: 'demo/aliasse.json', schema: DemoSchema },
  { rel: 'lerndetektive/experiment.json', schema: LerndetektiveDatenSchema },
] as const;

/** Prüft alle Datendateien unter `dataDir`; gibt Fehlermeldungen zurück (leer = gültig). */
export function validateDataDir(dataDir: string): string[] {
  const errors: string[] = [];
  for (const { rel, schema } of FILES) {
    const file = join(dataDir, rel);
    if (!existsSync(file)) {
      errors.push(`${rel}: Datei fehlt`);
      continue;
    }
    let json: unknown;
    try {
      json = JSON.parse(readFileSync(file, 'utf8'));
    } catch (e) {
      errors.push(`${rel}: kein gültiges JSON (${(e as Error).message})`);
      continue;
    }
    const res = schema.safeParse(json);
    if (!res.success) {
      for (const issue of res.error.issues) errors.push(`${rel}: ${issue.path.join('.') || '(Wurzel)'}: ${issue.message}`);
    }
  }
  return errors;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const dir = resolve(process.argv[2] ?? join(fileURLToPath(import.meta.url), '../../data'));
  const errors = validateDataDir(dir);
  if (errors.length > 0) {
    console.error(`Datenprüfung fehlgeschlagen (${dir}):\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  console.log(`Datenprüfung ok (${dir})`);
}
