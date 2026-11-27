import de from '@data/texte/de.json';

/** Alle gültigen Textschlüssel, abgeleitet aus data/texte/de.json. Unbekannter Schlüssel = Typfehler. */
export type TextKey = keyof typeof de;

export function t(key: TextKey): string {
  return de[key];
}
