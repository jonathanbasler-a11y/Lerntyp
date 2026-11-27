import { z } from 'zod';

/** Module gemäß docs/03-architektur.md §4.4 */
export const MODULE = ['start', 'lerndetektive', 'parcours', 'profil'] as const;
export const ModulSchema = z.enum(MODULE);
export type Modul = z.infer<typeof ModulSchema>;

/** Generischer Ereignis-Envelope (03 §4.4). Der Payload wird je `typ` separat validiert. */
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

/**
 * Payload-Schemas je `typ` (Stubs; werden ab Phase 2 / 4 ergänzt, 03 §4.4).
 * Phase 1 kennt nur das Beitritts-Ereignis des Starts.
 */
export const PayloadSchemas = {
  beitritt: z.object({}).strict(),
  hilfe_angefordert: z.object({}).strict(),
  pause: z.object({ aktiv: z.boolean() }).strict(),
} as const;
export type KnownEventTyp = keyof typeof PayloadSchemas;

/** Validiert Envelope und – falls der Typ bekannt ist – den Payload. */
export function parseEvent(input: unknown): EventEnvelope {
  const ev = EventEnvelopeSchema.parse(input);
  const schema = (PayloadSchemas as Record<string, z.ZodType | undefined>)[ev.typ];
  if (schema) schema.parse(ev.payload);
  return ev;
}
