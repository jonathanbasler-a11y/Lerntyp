import vorlesenDatenRoh from '@data/audio/vorlesen-daten.json';

/**
 * Audiodateien zu Texten aus den Parcours- und Profil-Daten (data/audio/vorlesen-daten.json).
 * Schlüssel: `<aufgabe>.hinweis1|hinweis2|fehler`, `<station>.muster`, `karte.<id>`, `fallback`,
 * `superkraft.<strategie>`, `tipp.<strategie>`, `sk_frage.<strategie>`. Fehlt ein Eintrag, bleibt der Text stumm.
 */
const datei = new Map<string, string>(vorlesenDatenRoh.map((v) => [v.key, v.datei]));

export const datenAudio = (...keys: readonly string[]): string[] => keys.flatMap((k) => datei.get(k) ?? []);
