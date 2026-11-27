import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { DemoSchema, TexteSchema } from '../packages/shared/src/data';
import { LerndetektiveDatenSchema } from '../packages/shared/src/lerndetektive/daten';
import { S1DatenSchema, S2DatenSchema, S3DatenSchema } from '../packages/shared/src/parcours/daten';
import { KartenDatenSchema } from '../packages/shared/src/profil/daten';
import { STRATEGIEN } from '../packages/shared/src/events';

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

/** data/audio/manifest.json: je Audiodatei Text, Hash des Texts, Stimme und Lizenz (scripts/audio/erzeugen.py). */
export const AudioManifestSchema = z.array(
  z.object({ datei: z.string().regex(/^[a-z0-9-]+\.mp3$/), text: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/), stimme: z.string().min(1), lizenz: z.string().min(1) }).strict(),
);

/** data/audio/vorlesen.json: Textschlüssel aus de.json mit Audiodatei (Vorlese-Knopf). */
export const VorlesenSchema = z.array(z.object({ key: z.string().min(1), datei: z.string().regex(/^[a-z0-9-]+\.mp3$/) }).strict());

/** data/lerndetektive/bilder.json: Items mit echtem Bild (scripts/bilder/pruefen.ts). */
export const BilderSchema = z.object({ vorhanden: z.array(z.string().regex(/^[a-z0-9_]+$/)) }).strict();

const FILES = [
  { rel: 'texte/de.json', schema: TexteSchema },
  { rel: 'demo/aliasse.json', schema: DemoSchema },
  { rel: 'lerndetektive/experiment.json', schema: LerndetektiveDatenSchema },
  { rel: 'lerndetektive/platzhalter.json', schema: PlatzhalterSchema },
  { rel: 'demo/simulation.json', schema: SimulationSchema },
  { rel: 'audio/manifest.json', schema: AudioManifestSchema },
  { rel: 'audio/vorlesen.json', schema: VorlesenSchema },
  { rel: 'lerndetektive/bilder.json', schema: BilderSchema },
  { rel: 'parcours/s1-wort-werkstatt.json', schema: S1DatenSchema },
  { rel: 'parcours/s2-satz-baukasten.json', schema: S2DatenSchema },
  { rel: 'parcours/s3-wuerfel-baumeister.json', schema: S3DatenSchema },
  { rel: 'profil/karten.json', schema: KartenDatenSchema },
] as const;

const sha256 = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const istDatei = (pfad: string): boolean => existsSync(pfad) && statSync(pfad).size > 0;

function lies(dataDir: string, rel: string): unknown {
  try {
    return JSON.parse(readFileSync(join(dataDir, rel), 'utf8'));
  } catch {
    return undefined;
  }
}

const AUDIO_HINWEIS = 'bitte `npm run audio:erzeugen` ausführen (scripts/audio/erzeugen.py)';

/** Audio und Bilder: referenzierte Dateien müssen existieren, der Manifest-Hash muss zum aktuellen Text passen. */
function medienpruefung(dataDir: string, publicDir: string): string[] {
  const fehler: string[] = [];
  const exp = LerndetektiveDatenSchema.safeParse(lies(dataDir, 'lerndetektive/experiment.json'));
  const texte = TexteSchema.safeParse(lies(dataDir, 'texte/de.json'));
  const manifest = AudioManifestSchema.safeParse(lies(dataDir, 'audio/manifest.json'));
  const vorlesen = VorlesenSchema.safeParse(lies(dataDir, 'audio/vorlesen.json'));
  const audioDir = join(publicDir, 'audio');

  // Soll-Texte je Audiodatei aus den Quellen.
  const soll = new Map<string, { text: string; quelle: string }>();
  if (exp.success) {
    for (const i of exp.data.items) soll.set(i.audio, { text: i.wort, quelle: `experiment.json Item ${i.id}` });
    for (const u of exp.data.ueberzeugungen) soll.set(u.audio, { text: u.text, quelle: `experiment.json ${u.id}` });
    for (const v of exp.data.vorlieben) soll.set(v.audio, { text: v.text, quelle: `experiment.json ${v.id}` });
  }
  if (texte.success) {
    const check = texte.data['audio.check_satz'];
    if (check) soll.set('check.mp3', { text: check, quelle: 'texte/de.json audio.check_satz' });
    else fehler.push('texte/de.json: Schlüssel audio.check_satz fehlt');
    if (vorlesen.success) {
      for (const v of vorlesen.data) {
        const text = texte.data[v.key];
        if (text === undefined) fehler.push(`audio/vorlesen.json: Textschlüssel „${v.key}“ fehlt in texte/de.json`);
        else soll.set(v.datei, { text, quelle: `texte/de.json ${v.key}` });
      }
    }
  }
  const imManifest = new Map(manifest.success ? manifest.data.map((m) => [m.datei, m] as const) : []);
  if (exp.success || vorlesen.success) {
    for (const [datei, { text, quelle }] of soll) {
      if (!istDatei(join(audioDir, datei))) fehler.push(`Audiodatei fehlt: apps/web/public/audio/${datei} (${quelle}); ${AUDIO_HINWEIS}`);
      if (!manifest.success) continue;
      const m = imManifest.get(datei);
      if (!m) fehler.push(`audio/manifest.json: Eintrag für ${datei} fehlt (${quelle}); ${AUDIO_HINWEIS}`);
      else if (m.text !== text || m.sha256 !== sha256(text)) fehler.push(`Audio veraltet: ${datei} passt nicht mehr zum Text (${quelle}); ${AUDIO_HINWEIS}`);
    }
  }
  if (manifest.success) {
    for (const m of manifest.data) {
      if (m.sha256 !== sha256(m.text)) fehler.push(`audio/manifest.json: Hash von ${m.datei} passt nicht zum Manifest-Text; ${AUDIO_HINWEIS}`);
      if (!istDatei(join(audioDir, m.datei))) fehler.push(`Audiodatei fehlt: apps/web/public/audio/${m.datei} (audio/manifest.json); ${AUDIO_HINWEIS}`);
    }
  }

  const bilder = BilderSchema.safeParse(lies(dataDir, 'lerndetektive/bilder.json'));
  if (bilder.success) {
    const ids = exp.success ? new Set(exp.data.items.map((i) => i.id)) : null;
    for (const id of bilder.data.vorhanden) {
      if (ids && !ids.has(id)) fehler.push(`lerndetektive/bilder.json: „${id}“ ist kein Item`);
      if (!istDatei(join(publicDir, 'bilder', `${id}.webp`))) fehler.push(`Bild fehlt: apps/web/public/bilder/${id}.webp (in bilder.json gelistet); bitte \`npm run bilder:pruefen\` ausführen`);
    }
  }
  return fehler;
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
  const texte = TexteSchema.safeParse(lies(dataDir, 'texte/de.json'));
  if (texte.success) {
    for (const st of STRATEGIEN) if (!texte.data[`strategie.${st}`]) fehler.push(`texte/de.json: Schlüssel strategie.${st} fehlt`);
    for (const k of ['s1', 's2', 's3']) if (!texte.data[`parcours.station.${k}.titel`]) fehler.push(`texte/de.json: Schlüssel parcours.station.${k}.titel fehlt`);
  }
  return fehler;
}

/** Prüft alle Datendateien unter `dataDir`; gibt Fehlermeldungen zurück (leer = gültig). */
export function validateDataDir(dataDir: string, publicDir: string = join(dataDir, '..', 'apps', 'web', 'public')): string[] {
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
  errors.push(...medienpruefung(dataDir, publicDir));
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
