import de from '@data/texte/de.json';

/** Alle gültigen Textschlüssel, abgeleitet aus data/texte/de.json. Unbekannter Schlüssel = Typfehler. */
export type TextKey = keyof typeof de;

export function t(key: TextKey): string {
  return de[key];
}

/** Ersetzt `{name}`-Platzhalter in einem Text aus de.json. */
export function fuelle(text: string, werte: Readonly<Record<string, string | number>>): string {
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in werte ? String(werte[name]) : m));
}
