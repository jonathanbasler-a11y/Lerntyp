import { z } from 'zod';

/**
 * Schemas der Parcours-Inhalte data/parcours/*.json (01 §7.3).
 * Alle Aufgaben, Hinweise und Rückmeldungen stehen in den Dateien; der Code prüft nur Konsistenz.
 */

export const ANZAHL_AUFGABEN = 5;

const text = z.string().min(3);
const aufgabenId = (station: 's1' | 's2' | 's3') => z.string().regex(new RegExp(`^${station}_[a-z0-9]+$`), `id muss mit „${station}_“ beginnen`);

function eindeutig<T extends { id: string }>(liste: readonly T[], ctx: z.RefinementCtx, pfad: string): void {
  if (new Set(liste.map((a) => a.id)).size !== liste.length) ctx.addIssue({ code: 'custom', message: 'Aufgaben-IDs müssen eindeutig sein', path: [pfad] });
}

// ---------------------------------------------------------------------------
// S1 Wort-Werkstatt
// ---------------------------------------------------------------------------

export const LUECKEN_TYPEN = { d_t: ['d', 't'], g_k: ['g', 'k'], b_p: ['b', 'p'], e_ae: ['e', 'ä'] } as const;
export const GRUND_ARTEN = ['verlaengern', 'ableiten'] as const;
export type GrundArt = (typeof GRUND_ARTEN)[number];

const S1Kern = z.object({
  /** Wort mit genau einer Lücke „_“, z. B. „Hun_“. */
  luecke: z.string().regex(/^[^_]*_[^_]*$/, 'genau eine Lücke „_“'),
  wort: z.string().min(2),
  luecke_typ: z.enum(['d_t', 'g_k', 'b_p', 'e_ae']),
  optionen: z.tuple([z.string().length(1), z.string().length(1)]),
  richtig: z.string().length(1),
  /** Begründung: Verlängern (Hund → Hunde) oder Ableiten (Räder → Rad). */
  grund: z.object({ art: z.enum(GRUND_ARTEN), verwandt: z.string().min(2) }).strict(),
});

function pruefeS1Kern(a: z.infer<typeof S1Kern>, ctx: z.RefinementCtx): void {
  const paar = LUECKEN_TYPEN[a.luecke_typ] as readonly string[];
  if ([...a.optionen].sort().join() !== [...paar].sort().join()) ctx.addIssue({ code: 'custom', message: `optionen müssen ${paar.join('/')} sein`, path: ['optionen'] });
  if (!a.optionen.includes(a.richtig)) ctx.addIssue({ code: 'custom', message: 'richtig muss eine der optionen sein', path: ['richtig'] });
  if (a.luecke.replace('_', a.richtig) !== a.wort) ctx.addIssue({ code: 'custom', message: 'luecke mit richtig gefüllt muss wort ergeben', path: ['wort'] });
  if (a.grund.verwandt === a.wort) ctx.addIssue({ code: 'custom', message: 'verwandtes Wort muss sich vom Wort unterscheiden', path: ['grund', 'verwandt'] });
}

export const S1MusterSchema = S1Kern.extend({ erklaerung: text }).strict().superRefine(pruefeS1Kern);
export const S1AufgabeSchema = S1Kern.extend({ id: aufgabenId('s1'), hinweis1: text, hinweis2: text, fehler: text }).strict().superRefine(pruefeS1Kern);
export const S1DatenSchema = z
  .object({
    station: z.literal('s1'),
    hinweis: z.string().optional(),
    musterbeispiel: S1MusterSchema,
    aufgaben: z.array(S1AufgabeSchema).length(ANZAHL_AUFGABEN),
  })
  .strict()
  .superRefine((d, ctx) => {
    eindeutig(d.aufgaben, ctx, 'aufgaben');
    if (!d.aufgaben.some((a) => a.luecke_typ === 'e_ae')) ctx.addIssue({ code: 'custom', message: 'mindestens eine e/ä-Aufgabe', path: ['aufgaben'] });
    if (new Set(d.aufgaben.map((a) => a.grund.art)).size < 2) ctx.addIssue({ code: 'custom', message: 'Verlängern und Ableiten müssen gemischt sein', path: ['aufgaben'] });
  });
export type S1Daten = z.infer<typeof S1DatenSchema>;
export type S1Aufgabe = z.infer<typeof S1AufgabeSchema>;

// ---------------------------------------------------------------------------
// S2 Satz-Baukasten
// ---------------------------------------------------------------------------

export const SATZGLIED_ARTEN = ['subjekt', 'praedikat', 'ort', 'dativobjekt', 'akkusativobjekt', 'zeit', 'art_und_weise'] as const;

const S2Block = z
  .object({
    /** Text, wie er mitten im Satz steht (erster Buchstabe klein, außer bei `immer_gross`). */
    text: z.string().min(1),
    art: z.enum(SATZGLIED_ARTEN),
    /** Eigenname oder immer großgeschriebenes Wort am Blockanfang. */
    immer_gross: z.boolean(),
  })
  .strict()
  .superRefine((b, ctx) => {
    const erster = b.text.charAt(0);
    const gross = erster !== erster.toLowerCase();
    if (b.immer_gross !== gross) ctx.addIssue({ code: 'custom', message: 'immer_gross passt nicht zum ersten Buchstaben von text', path: ['text'] });
  });

const Permutation = z.array(z.number().int().min(0).max(3)).min(3).max(4);

const S2Kern = z.object({
  bloecke: z.array(S2Block).min(3).max(4),
  /** Alle grammatisch richtigen Reihenfolgen (Indizes in `bloecke`), inkl. der Original-Reihenfolge 0,1,2,… */
  erlaubte_reihenfolgen: z.array(Permutation).min(2),
});

function pruefeS2Kern(a: z.infer<typeof S2Kern>, ctx: z.RefinementCtx): void {
  const n = a.bloecke.length;
  const verben = a.bloecke.flatMap((b, i) => (b.art === 'praedikat' ? [i] : []));
  if (verben.length !== 1) ctx.addIssue({ code: 'custom', message: 'genau ein Prädikat-Block', path: ['bloecke'] });
  const verb = verben[0];
  const gesehen = new Set<string>();
  a.erlaubte_reihenfolgen.forEach((r, i) => {
    const pfad = ['erlaubte_reihenfolgen', i];
    if (r.length !== n || [...r].sort((x, y) => x - y).some((v, k) => v !== k)) ctx.addIssue({ code: 'custom', message: 'Reihenfolge muss jeden Block genau einmal enthalten', path: pfad });
    else if (verb !== undefined && r[1] !== verb) ctx.addIssue({ code: 'custom', message: 'Verb muss an zweiter Stelle stehen', path: pfad });
    if (gesehen.has(r.join())) ctx.addIssue({ code: 'custom', message: 'doppelte Reihenfolge', path: pfad });
    gesehen.add(r.join());
  });
  if (!gesehen.has(Array.from({ length: n }, (_, k) => k).join())) ctx.addIssue({ code: 'custom', message: 'Original-Reihenfolge muss enthalten sein', path: ['erlaubte_reihenfolgen'] });
  if (!a.erlaubte_reihenfolgen.some((r) => r[0] !== 0)) ctx.addIssue({ code: 'custom', message: 'mindestens eine Reihenfolge mit anderem ersten Block', path: ['erlaubte_reihenfolgen'] });
}

export const S2MusterSchema = S2Kern.extend({ erklaerung: text }).strict().superRefine(pruefeS2Kern);
export const S2AufgabeSchema = S2Kern.extend({ id: aufgabenId('s2'), hinweis1: text, hinweis2: text, fehler: text }).strict().superRefine(pruefeS2Kern);
export const S2DatenSchema = z
  .object({
    station: z.literal('s2'),
    hinweis: z.string().optional(),
    /** Anzeigeregeln: das Original steht in `bloecke`-Reihenfolge, beim Bauen gilt: */
    anzeige: z.object({ satzanfang: z.literal('erster_buchstabe_gross'), satzende: z.literal('.') }).strict(),
    musterbeispiel: S2MusterSchema,
    aufgaben: z.array(S2AufgabeSchema).length(ANZAHL_AUFGABEN),
  })
  .strict()
  .superRefine((d, ctx) => {
    eindeutig(d.aufgaben, ctx, 'aufgaben');
    const vier = d.aufgaben.filter((a) => a.bloecke.length === 4).length;
    if (vier < 1) ctx.addIssue({ code: 'custom', message: 'mindestens ein Satz mit vier Blöcken', path: ['aufgaben'] });
  });
export type S2Daten = z.infer<typeof S2DatenSchema>;
export type S2Aufgabe = z.infer<typeof S2AufgabeSchema>;

// ---------------------------------------------------------------------------
// S3 Würfel-Baumeister
// ---------------------------------------------------------------------------

/** Höhenraster: Zeile 0 = hinten, Spalte 0 = links; Höhe 0–3, höchstens 3×3. */
export const RasterSchema = z
  .array(z.array(z.number().int().min(0).max(3)).min(1).max(3))
  .min(1)
  .max(3)
  .refine((r) => r.every((z0) => z0.length === r[0]!.length), 'Zeilen müssen gleich lang sein');
export type Raster = z.infer<typeof RasterSchema>;

const PLAN_IDS = ['a', 'b', 'c'] as const;
const gleich = (a: Raster, b: Raster) => JSON.stringify(a) === JSON.stringify(b);

const S3Kern = z.object({
  gebaeude: RasterSchema,
  plaene: z.tuple([z.object({ id: z.literal('a'), raster: RasterSchema }).strict(), z.object({ id: z.literal('b'), raster: RasterSchema }).strict(), z.object({ id: z.literal('c'), raster: RasterSchema }).strict()]),
  richtig: z.enum(PLAN_IDS),
});

function pruefeS3Kern(a: z.infer<typeof S3Kern>, ctx: z.RefinementCtx): void {
  const treffer = a.plaene.filter((p) => gleich(p.raster, a.gebaeude));
  if (treffer.length !== 1) ctx.addIssue({ code: 'custom', message: 'genau ein Bauplan muss zum Gebäude passen', path: ['plaene'] });
  else if (treffer[0]!.id !== a.richtig) ctx.addIssue({ code: 'custom', message: 'richtig verweist nicht auf den passenden Bauplan', path: ['richtig'] });
  if (a.gebaeude.flat().every((h) => h === 0)) ctx.addIssue({ code: 'custom', message: 'Gebäude darf nicht leer sein', path: ['gebaeude'] });
}

export const S3MusterSchema = S3Kern.extend({ erklaerung: text }).strict().superRefine(pruefeS3Kern);
export const S3AufgabeSchema = S3Kern.extend({ id: aufgabenId('s3'), hinweis1: text, hinweis2: text, fehler: text }).strict().superRefine(pruefeS3Kern);
export const S3DatenSchema = z
  .object({
    station: z.literal('s3'),
    hinweis: z.string().optional(),
    musterbeispiel: S3MusterSchema,
    aufgaben: z.array(S3AufgabeSchema).length(ANZAHL_AUFGABEN),
  })
  .strict()
  .superRefine((d, ctx) => eindeutig(d.aufgaben, ctx, 'aufgaben'));
export type S3Daten = z.infer<typeof S3DatenSchema>;
export type S3Aufgabe = z.infer<typeof S3AufgabeSchema>;

export interface ParcoursDaten {
  s1: S1Daten;
  s2: S2Daten;
  s3: S3Daten;
}
