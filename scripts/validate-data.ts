import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { DemoSchema, TexteSchema } from '../packages/shared/src/data';
import { LerndetektiveDatenSchema } from '../packages/shared/src/lerndetektive/daten';

const Anteil = z.number().min(0).max(1);
const JeBedingung = z.object({ wort: Anteil, bild: Anteil, bild_wort: Anteil }).strict();

/** data/demo/simulation.json: nur für die Demo (simulierte Klasse, kein Forschungsergebnis). */
export const SimulationSchema = z
  .object({
    hinweis: z.string().optional(),
    seed: z.number().int().nonnegative(),
    kinder: z.array(z.string().regex(/^[A-ZÄÖÜ][a-zäöüß]+-\d{2}$/)).min(10),
    vermutung_verteilung: z.object({ wort: z.number().int().min(0), bild: z.number().int().min(0), bild_wort: z.number().int().min(0) }).strict(),
    treffer_sofort: JeBedingung,
    treffer_verzoegert: JeBedingung,
    fehlalarm: Anteil,
    streuung: z.number().min(0).max(0.3),
    fehlt_in_folgestunde: z.number().int().min(0),
  })
  .strict()
  .superRefine((d, ctx) => {
    const v = d.vermutung_verteilung;
    if (v.wort + v.bild + v.bild_wort !== d.kinder.length)
      ctx.addIssue({ code: 'custom', message: 'vermutung_verteilung muss zur Zahl der Kinder passen', path: ['vermutung_verteilung'] });
    if (new Set(d.kinder).size !== d.kinder.length) ctx.addIssue({ code: 'custom', message: 'Aliasse müssen eindeutig sein', path: ['kinder'] });
  });

/** data/lerndetektive/platzhalter.json: Farbe und Form je Kategorie für die Platzhalterbilder. */
export const PlatzhalterSchema = z
  .object({
    hinweis: z.string().optional(),
    kategorien: z.record(z.string(), z.object({ farbe: z.string().regex(/^#[0-9a-f]{6}$/i), form: z.string().min(5) }).strict()),
  })
  .strict();

const FILES = [
  { rel: 'texte/de.json', schema: TexteSchema },
  { rel: 'demo/aliasse.json', schema: DemoSchema },
  { rel: 'lerndetektive/experiment.json', schema: LerndetektiveDatenSchema },
  { rel: 'lerndetektive/platzhalter.json', schema: PlatzhalterSchema },
  { rel: 'demo/simulation.json', schema: SimulationSchema },
] as const;

function lies(dataDir: string, rel: string): unknown {
  try {
    return JSON.parse(readFileSync(join(dataDir, rel), 'utf8'));
  } catch {
    return undefined;
  }
}

/** Dateiübergreifende Prüfungen (nur wenn die beteiligten Dateien gültig sind). */
function kreuzpruefung(dataDir: string): string[] {
  const fehler: string[] = [];
  const exp = LerndetektiveDatenSchema.safeParse(lies(dataDir, 'lerndetektive/experiment.json'));
  const pl = PlatzhalterSchema.safeParse(lies(dataDir, 'lerndetektive/platzhalter.json'));
  if (exp.success && pl.success) {
    for (const k of new Set(exp.data.items.map((i) => i.kategorie)))
      if (!pl.data.kategorien[k]) fehler.push(`lerndetektive/platzhalter.json: Kategorie „${k}“ fehlt`);
  }
  const sim = SimulationSchema.safeParse(lies(dataDir, 'demo/simulation.json'));
  const demo = DemoSchema.safeParse(lies(dataDir, 'demo/aliasse.json'));
  if (sim.success && demo.success) {
    const echte = new Set(demo.data.aliasse.map((a) => a.alias));
    for (const a of sim.data.kinder) if (echte.has(a)) fehler.push(`demo/simulation.json: Alias „${a}“ kommt auch in demo/aliasse.json vor`);
  }
  return fehler;
}

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
  errors.push(...kreuzpruefung(dataDir));
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
