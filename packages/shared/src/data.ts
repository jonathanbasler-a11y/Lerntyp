import { z } from 'zod';

/** data/texte/de.json: flache Map `bereich.schluessel` -> Text. */
export const TexteSchema = z
  .record(z.string().regex(/^[a-z0-9_]+(\.[a-z0-9_]+)+$/, 'Schlüssel muss „bereich.name“ sein'), z.string().min(1))
  .refine((o) => Object.keys(o).length > 0, 'Texte dürfen nicht leer sein');
export type Texte = z.infer<typeof TexteSchema>;

/** Alias-Muster: Tiername, Bindestrich, zweistellige Zahl (z. B. „Fuchs-27“). Keine echten Namen. */
export const AliasSchema = z.object({
  alias: z.string().regex(/^[A-ZÄÖÜ][a-zäöüß]+-\d{2}$/, 'Alias muss „Tier-NN“ sein'),
  symbol: z.string().min(1),
});
export type DemoAlias = z.infer<typeof AliasSchema>;

export const DemoSchema = z
  .object({
    sitzungscode: z.string().min(1),
    aliasse: z.array(AliasSchema).min(1),
  })
  .refine((d) => new Set(d.aliasse.map((a) => a.alias)).size === d.aliasse.length, 'Aliasse müssen eindeutig sein');
export type DemoData = z.infer<typeof DemoSchema>;
