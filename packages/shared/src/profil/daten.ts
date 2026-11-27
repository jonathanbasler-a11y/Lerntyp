import { z } from 'zod';
import { STRATEGIEN, StrategieSchema } from '../events';

/**
 * data/profil/karten.json: Textbausteine für „Mein Lernprofil“ (01 §7.4).
 * Karten beschreiben beobachtetes Verhalten in der Vergangenheitsform mit konkreter Station, ohne Zahlen.
 */

export const VERHALTEN = ['zweiter_versuch', 'beispiel', 'begruendung', 'hinweis', 'ziel', 'geholfen', 'teilnahme'] as const;
export const VerhaltenSchema = z.enum(VERHALTEN);
export type Verhalten = z.infer<typeof VerhaltenSchema>;

export const PROFIL_STATIONEN = ['s1', 's2', 's3', 'lerndetektive'] as const;
export const ProfilStationSchema = z.enum(PROFIL_STATIONEN);
export type ProfilStation = z.infer<typeof ProfilStationSchema>;

const text = z.string().min(10);
const jeStrategie = z.object(Object.fromEntries(STRATEGIEN.map((s) => [s, text])) as Record<(typeof STRATEGIEN)[number], typeof text>).strict();

export const KarteSchema = z
  .object({
    id: z.string().regex(/^[a-z_]+\.[a-z0-9_]+$/),
    verhalten: VerhaltenSchema,
    station: ProfilStationSchema,
    text,
  })
  .strict()
  .refine((k) => k.id === `${k.verhalten}.${k.station}`, 'id muss „verhalten.station“ sein');
export type Karte = z.infer<typeof KarteSchema>;

export const KartenDatenSchema = z
  .object({
    hinweis: z.string().optional(),
    karten: z.array(KarteSchema).min(1),
    fallback: z.object({ id: z.literal('fallback'), text }).strict(),
    /** Superkraft je Strategie, positiv formuliert („Probier diese Woche …“). */
    superkraft: jeStrategie,
    /** Tipp für zu Hause je Strategie (eine Zeile). */
    tipps: jeStrategie,
    /** Prozessindikatoren in Worten (für das Cockpit; ohne Zahlen, ohne Bewertung). */
    indikatoren: z.object(Object.fromEntries(VERHALTEN.map((v) => [v, text])) as Record<Verhalten, typeof text>).strict(),
  })
  .strict()
  .superRefine((d, ctx) => {
    const ids = d.karten.map((k) => k.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Karten-IDs müssen eindeutig sein', path: ['karten'] });
    const begruendung = d.karten.filter((k) => k.verhalten === 'begruendung');
    if (begruendung.some((k) => k.station !== 's1')) ctx.addIssue({ code: 'custom', message: 'Begründungskarten gibt es nur für s1', path: ['karten'] });
    if (d.karten.some((k) => (k.verhalten === 'teilnahme') !== (k.station === 'lerndetektive'))) ctx.addIssue({ code: 'custom', message: 'teilnahme gehört zu lerndetektive und umgekehrt', path: ['karten'] });
  });
export type KartenDaten = z.infer<typeof KartenDatenSchema>;

export { StrategieSchema };
