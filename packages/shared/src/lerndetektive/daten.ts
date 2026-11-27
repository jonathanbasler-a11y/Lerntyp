import { z } from 'zod';
import { BEDINGUNGEN, BedingungSchema, ROTATIONEN, SetSchema, type Bedingung, type ItemSet } from '../events';

/**
 * Schema der Inhaltsdatei data/lerndetektive/experiment.json (02 §10).
 * Alle Mengen, Zeiten und Regeln stehen in der Datei; der Code prüft nur, dass sie
 * die Vorgaben aus docs/02-lerndetektive-experiment.md einhalten.
 */

export const LERN_SETS = ['A', 'B', 'C'] as const satisfies readonly ItemSet[];
export type LernSet = (typeof LERN_SETS)[number];

export const ItemSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_]+$/, 'id: nur a–z, 0–9, _'),
    set: SetSchema,
    wort: z.string().min(2),
    bild: z.string().regex(/^[a-z0-9_]+\.(svg|png|webp)$/),
    audio: z.string().regex(/^[a-z0-9_]+\.(mp3|m4a|ogg|wav)$/),
    silben: z.number().int().min(1).max(4),
    kategorie: z.string().min(1),
  })
  .strict();
export type Item = z.infer<typeof ItemSchema>;

const TextItem = z.object({ text: z.string().min(1), audio: z.string().regex(/^[a-z0-9_]+\.(mp3|m4a|ogg|wav)$/) });

export const AblaufSchema = z
  .object({
    /** Darbietungsdauer pro Ding in der Lernphase (02 §5.2). */
    darbietung_ms: z.number().int().min(1000).max(10000),
    /** Leerer Bildschirm zwischen zwei Dingen. */
    leer_ms: z.number().int().min(0).max(5000),
    /** Dauer der Pause-Aufgabe „Sterne zählen“ (02 §2). */
    pause_aufgabe_ms: z.number().int().min(10000).max(180000),
    /** Puffer-Items aus Set F am Anfang/Ende der Lernphase (02 §5.3). */
    puffer_anfang: z.number().int().min(0).max(4),
    puffer_ende: z.number().int().min(0).max(4),
    /** Höchstens so viele gleiche Bedingungen hintereinander in der Lernphase (02 §5.3: 2). */
    max_gleiche_bedingung_folge: z.number().int().min(1).max(4),
    /** Höchstens so viele „alt“ bzw. „neu“ hintereinander im Test. */
    max_gleiche_testart_folge: z.number().int().min(2).max(8),
    /** Mindestgröße jeder gezeigten Teilgruppe (01 §7.5: ≥ 5; darf nicht kleiner sein). */
    mindestgruppe: z.number().int().min(5),
    /** Erlaubte Abweichung der mittleren Silbenzahl zwischen den Sets A–E. */
    max_silben_abweichung: z.number().min(0).max(0.5),
  })
  .strict();
export type Ablauf = z.infer<typeof AblaufSchema>;

export const LerndetektiveDatenSchema = z
  .object({
    version: z.string().min(1),
    status: z.enum(['entwurf', 'validiert']),
    hinweis: z.string().optional(),
    ablauf: AblaufSchema,
    rotationen: z.object(
      Object.fromEntries(ROTATIONEN.map((r) => [r, z.object({ A: BedingungSchema, B: BedingungSchema, C: BedingungSchema }).strict()])) as {
        [K in (typeof ROTATIONEN)[number]]: z.ZodObject<{ A: typeof BedingungSchema; B: typeof BedingungSchema; C: typeof BedingungSchema }>;
      },
    ),
    ueberzeugungen: z
      .array(TextItem.extend({ id: z.enum(['U1', 'U2', 'U3']), richtung: z.enum(['mythos', 'wachstum']) }).strict())
      .length(3),
    vorlieben: z
      .array(TextItem.extend({ id: z.enum(['V1', 'V2', 'V3', 'V4']), rolle: z.enum(['vorliebe', 'vermutung']) }).strict())
      .length(4),
    items: z.array(ItemSchema),
  })
  .strict()
  .superRefine((d, ctx) => {
    const fehler = (message: string, path: (string | number)[] = []) => ctx.addIssue({ code: 'custom', message, path });

    // Eindeutigkeit
    const ids = new Set<string>();
    const woerter = new Set<string>();
    d.items.forEach((it, i) => {
      if (ids.has(it.id)) fehler(`doppelte id „${it.id}“`, ['items', i, 'id']);
      ids.add(it.id);
      const w = it.wort.toLocaleLowerCase('de');
      if (woerter.has(w)) fehler(`doppeltes Wort „${it.wort}“`, ['items', i, 'wort']);
      woerter.add(w);
    });

    // Set-Größen: A=B=C=n; D und E je 3n (gleich viele Alt- und Neu-Items im Test); F ≥ Puffer
    const anzahl = (s: ItemSet) => d.items.filter((it) => it.set === s).length;
    const n = anzahl('A');
    if (n < 4) fehler(`Set A braucht mindestens 4 Items (hat ${n})`, ['items']);
    for (const s of ['B', 'C'] as const) if (anzahl(s) !== n) fehler(`Set ${s} muss so groß sein wie Set A (${n}), hat ${anzahl(s)}`, ['items']);
    for (const s of ['D', 'E'] as const)
      if (anzahl(s) !== 3 * n) fehler(`Set ${s} (Ablenker) muss ${3 * n} Items haben (= Anzahl alter Items), hat ${anzahl(s)}`, ['items']);
    const puffer = d.ablauf.puffer_anfang + d.ablauf.puffer_ende;
    if (anzahl('F') < puffer) fehler(`Set F braucht mindestens ${puffer} Items für die Puffer, hat ${anzahl('F')}`, ['items']);

    // Lateinisches Quadrat: jede Rotation nutzt jede Bedingung genau einmal,
    // und jedes Set bekommt über die Rotationen jede Bedingung genau einmal.
    for (const r of ROTATIONEN) {
      const b = LERN_SETS.map((s) => d.rotationen[r][s]);
      if (new Set(b).size !== BEDINGUNGEN.length) fehler(`${r} muss jede Bedingung genau einmal enthalten`, ['rotationen', r]);
    }
    for (const s of LERN_SETS) {
      const b = ROTATIONEN.map((r) => d.rotationen[r][s]);
      if (new Set(b).size !== BEDINGUNGEN.length) fehler(`Set ${s} muss über die Rotationen jede Bedingung genau einmal bekommen`, ['rotationen']);
    }

    // Vollständigkeit U1–U3, V1–V4; genau V4 ist die Vermutung
    if (new Set(d.ueberzeugungen.map((u) => u.id)).size !== 3) fehler('U1–U3 müssen je einmal vorkommen', ['ueberzeugungen']);
    if (new Set(d.vorlieben.map((v) => v.id)).size !== 4) fehler('V1–V4 müssen je einmal vorkommen', ['vorlieben']);
    for (const v of d.vorlieben) {
      if ((v.id === 'V4') !== (v.rolle === 'vermutung')) fehler(`${v.id}: nur V4 ist die Vermutung`, ['vorlieben']);
    }

    // Ausgewogenheit der Silbenzahl (02 §5.1)
    const mittel = (['A', 'B', 'C', 'D', 'E'] as const).map((s) => {
      const it = d.items.filter((x) => x.set === s);
      return it.length ? it.reduce((a, x) => a + x.silben, 0) / it.length : 0;
    });
    const spanne = Math.max(...mittel) - Math.min(...mittel);
    if (spanne > d.ablauf.max_silben_abweichung + 1e-9)
      fehler(`mittlere Silbenzahl der Sets A–E weicht um ${spanne.toFixed(2)} ab (erlaubt ${d.ablauf.max_silben_abweichung})`, ['items']);
  });
export type LerndetektiveDaten = z.infer<typeof LerndetektiveDatenSchema>;

/** Bedingung eines Lern-Sets in einer Rotation. */
export function bedingungFuer(daten: LerndetektiveDaten, rotation: keyof LerndetektiveDaten['rotationen'], set: LernSet): Bedingung {
  return daten.rotationen[rotation][set];
}
