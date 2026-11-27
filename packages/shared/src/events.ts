import { z } from 'zod';

/** Module gemäß docs/03-architektur.md §4.4 */
export const MODULE = ['start', 'lerndetektive', 'parcours', 'profil'] as const;
export const ModulSchema = z.enum(MODULE);
export type Modul = z.infer<typeof ModulSchema>;

/** Generischer Ereignis-Envelope (03 §4.4). Der Payload wird je `modul` + `typ` separat validiert. */
export const EventEnvelopeSchema = z.object({
  id: z.string().min(1),
  sitzung: z.string().min(1),
  teilnehmer_alias: z.string().min(1),
  modul: ModulSchema,
  typ: z.string().min(1),
  zeitstempel: z.iso.datetime(),
  client_seq: z.number().int().nonnegative(),
  payload: z.record(z.string(), z.unknown()),
});
export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

// ---------------------------------------------------------------------------
// Gemeinsame Wertebereiche (02 §5, §9)
// ---------------------------------------------------------------------------

export const BEDINGUNGEN = ['wort', 'bild', 'bild_wort'] as const;
export const BedingungSchema = z.enum(BEDINGUNGEN);
export type Bedingung = z.infer<typeof BedingungSchema>;

export const ROTATIONEN = ['ROT1', 'ROT2', 'ROT3'] as const;
export const RotationSchema = z.enum(ROTATIONEN);
export type Rotation = z.infer<typeof RotationSchema>;

export const SETS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
export const SetSchema = z.enum(SETS);
export type ItemSet = z.infer<typeof SetSchema>;

export const TestSchema = z.enum(['sofort', 'verzoegert']);
export type TestZeitpunkt = z.infer<typeof TestSchema>;

/** Die sechs Lernstrategien (01 §5); Reihenfolge = feste Reihenfolge der Konzept-Tabelle. */
export const STRATEGIEN = ['gedaechtnis_training', 'haeppchen_lernen', 'doppelt_merken', 'mischen', 'warum_fragen', 'beispiele'] as const;
export const StrategieSchema = z.enum(STRATEGIEN);
export type Strategie = z.infer<typeof StrategieSchema>;

/** Stationen des Strategie-Parcours (01 §7.3). */
export const STATIONEN = ['s1', 's2', 's3'] as const;
export const StationSchema = z.enum(STATIONEN);
export type Station = z.infer<typeof StationSchema>;

const rtMs = z.number().int().nonnegative();
const seed = z.number().int().nonnegative().max(0xffffffff);

// ---------------------------------------------------------------------------
// Payload-Schemas je Modul und Typ.
// Derselbe `typ` kann je Modul verschiedene Payloads haben
// (z. B. `antwort_abgegeben` in 02 §9 vs. 03 §4.4) – daher Schlüssel Modul → Typ.
// ---------------------------------------------------------------------------

/** Modulübergreifende Ereignisse (03 §4.4). */
const GEMEINSAM = {
  hilfe_angefordert: z.object({}).strict(),
  pause: z.object({ aktiv: z.boolean() }).strict(),
} as const;

/** Lerndetektive (02 §9). */
const LERNDETEKTIVE = {
  audio_check: z.object({ ok: z.boolean() }).strict(),
  rotation_zugewiesen: z.object({ rotation: RotationSchema, seed }).strict(),
  ueberzeugung_beantwortet: z
    .object({
      item_id: z.enum(['U1', 'U2', 'U3']),
      antwort: z.enum(['stimmt', 'stimmt_nicht', 'weiss_nicht']),
      zeitpunkt: z.enum(['vorher', 'nachher']),
      rt_ms: rtMs,
    })
    .strict(),
  vorliebe_beantwortet: z
    .object({
      item_id: z.enum(['V1', 'V2', 'V3', 'V4']),
      antwort: BedingungSchema,
      rt_ms: rtMs,
    })
    .strict(),
  item_gezeigt: z
    .object({
      item_id: z.string().min(1),
      set: SetSchema,
      bedingung: z.enum([...BEDINGUNGEN, 'puffer']),
      position: z.number().int().nonnegative(),
      audio_ok: z.boolean(),
    })
    .strict(),
  antwort_abgegeben: z
    .object({
      item_id: z.string().min(1),
      test: TestSchema,
      alt: z.boolean(),
      antwort: z.enum(['dabei', 'nicht_dabei']),
      rt_ms: rtMs,
      position: z.number().int().nonnegative(),
    })
    .strict(),
  phase_abgeschlossen: z
    .object({
      phase: z.enum(['lernen', 'pause', 'sofort_test', 'verzoegert_test']),
      abgebrochen: z.boolean(),
    })
    .strict(),
} as const;

/**
 * Strategie-Parcours (03 §4.4). `antwort_abgegeben` trägt zusätzlich optional die Eingabe
 * (`antwort`, Forschungsdaten) und in S1 die gewählte Begründung (`begruendung`, Verhaltensspur).
 */
const aufgabeRef = { station: StationSchema, aufgabe_id: z.string().min(1) } as const;
const PARCOURS = {
  ziel_gesetzt: z.object({ station: StationSchema, ziel: z.number().int().min(1).max(5) }).strict(),
  sicherheit_vorher: z.object({ station: StationSchema, smiley: z.number().int().min(1).max(4) }).strict(),
  aufgabe_gezeigt: z.object(aufgabeRef).strict(),
  beispiel_geoeffnet: z.object(aufgabeRef).strict(),
  hinweis_genutzt: z.object({ ...aufgabeRef, stufe: z.union([z.literal(1), z.literal(2)]) }).strict(),
  antwort_abgegeben: z
    .object({
      ...aufgabeRef,
      korrekt: z.boolean(),
      versuch: z.union([z.literal(1), z.literal(2)]),
      rt_ms: rtMs,
      antwort: z.string().optional(),
      begruendung: z.enum(['verlaengern', 'ableiten']).optional(),
    })
    .strict(),
  aufgabe_uebersprungen: z.object(aufgabeRef).strict(),
  hilfreich_gewaehlt: z.object({ station: StationSchema, strategien: z.array(StrategieSchema) }).strict(),
} as const;

/** Profil (03 §4.4); `superkraft_ausprobiert` wird in der Folgestunde erhoben. */
const PROFIL = {
  profil_angezeigt: z.object({ karten_ids: z.array(z.string().min(1)), superkraft: StrategieSchema }).strict(),
  profil_passt: z.object({ smiley: z.number().int().min(1).max(4) }).strict(),
  superkraft_ausprobiert: z.object({ antwort: z.enum(['ja', 'ein_bisschen', 'nein']) }).strict(),
} as const;

export const PayloadSchemas = {
  start: { beitritt: z.object({}).strict() },
  lerndetektive: LERNDETEKTIVE,
  parcours: PARCOURS,
  profil: PROFIL,
} as const satisfies Record<Modul, Record<string, z.ZodType>>;

export type LerndetektiveTyp = keyof typeof LERNDETEKTIVE;
export type LerndetektivePayload<T extends LerndetektiveTyp> = z.infer<(typeof LERNDETEKTIVE)[T]>;

/** Ein Lerndetektive-Ereignis mit typisiertem Payload. */
export type LerndetektiveEvent = {
  [T in LerndetektiveTyp]: Omit<EventEnvelope, 'modul' | 'typ' | 'payload'> & {
    modul: 'lerndetektive';
    typ: T;
    payload: LerndetektivePayload<T>;
  };
}[LerndetektiveTyp];

export type ParcoursTyp = keyof typeof PARCOURS;
export type ParcoursPayload<T extends ParcoursTyp> = z.infer<(typeof PARCOURS)[T]>;

/** Ein Parcours-Ereignis mit typisiertem Payload. */
export type ParcoursEvent = {
  [T in ParcoursTyp]: Omit<EventEnvelope, 'modul' | 'typ' | 'payload'> & {
    modul: 'parcours';
    typ: T;
    payload: ParcoursPayload<T>;
  };
}[ParcoursTyp];

/** Liefert das Payload-Schema für Modul + Typ oder `undefined`, wenn der Typ (noch) unbekannt ist. */
export function payloadSchemaFor(modul: Modul, typ: string): z.ZodType | undefined {
  const spezifisch = (PayloadSchemas[modul] as Record<string, z.ZodType>)[typ];
  return spezifisch ?? (GEMEINSAM as Record<string, z.ZodType>)[typ];
}

/** Validiert Envelope und – falls der Typ für das Modul bekannt ist – den Payload. */
export function parseEvent(input: unknown): EventEnvelope {
  const ev = EventEnvelopeSchema.parse(input);
  const schema = payloadSchemaFor(ev.modul, ev.typ);
  if (schema) schema.parse(ev.payload);
  return ev;
}

/** Wie `parseEvent`, verlangt aber ein Lerndetektive-Ereignis mit bekanntem Typ. */
export function parseLerndetektiveEvent(input: unknown): LerndetektiveEvent {
  const ev = EventEnvelopeSchema.parse(input);
  if (ev.modul !== 'lerndetektive') throw new Error(`Modul „${ev.modul}“ ist kein Lerndetektive-Ereignis`);
  const schema = (LERNDETEKTIVE as Record<string, z.ZodType>)[ev.typ];
  if (!schema) throw new Error(`Unbekannter Lerndetektive-Typ „${ev.typ}“`);
  return { ...ev, payload: schema.parse(ev.payload) } as LerndetektiveEvent;
}

/** Wie `parseEvent`, verlangt aber ein Parcours-Ereignis mit bekanntem Typ. */
export function parseParcoursEvent(input: unknown): ParcoursEvent {
  const ev = EventEnvelopeSchema.parse(input);
  if (ev.modul !== 'parcours') throw new Error(`Modul „${ev.modul}“ ist kein Parcours-Ereignis`);
  const schema = (PARCOURS as Record<string, z.ZodType>)[ev.typ];
  if (!schema) throw new Error(`Unbekannter Parcours-Typ „${ev.typ}“`);
  return { ...ev, payload: schema.parse(ev.payload) } as ParcoursEvent;
}
